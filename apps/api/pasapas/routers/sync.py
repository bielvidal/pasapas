"""Sincronització local-first (§4.1): lots idempotents d'intents i sessions, i lectura
incremental per cursor (`received_at`) perquè un altre dispositiu els recuperi."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from .. import auth
from ..db import get_db
from ..models import Attempt, StudySession, User, now
from ..settings import settings

router = APIRouter(prefix="/api", tags=["sync"])

UUID_LEN = 36


class AttemptIn(BaseModel):
    id: str = Field(min_length=8, max_length=UUID_LEN)
    sessionId: str = Field(min_length=1, max_length=UUID_LEN)
    block: str = Field(min_length=1, max_length=10)
    templateId: str = Field(min_length=1, max_length=40)
    templateVersion: int = Field(ge=1)
    seed: int = Field(ge=0, le=2**53)
    questionType: Literal["mc_result", "valid_step", "find_error", "next_step"]
    level: int = Field(ge=1, le=3)
    outcome: Literal["correct", "incorrect", "skipped"]
    chosenOptionId: str | None = Field(default=None, max_length=40)
    errorTag: str | None = Field(default=None, max_length=80)
    presentedErrorTags: list[str] = Field(default_factory=list, max_length=20)
    explanationOpened: bool = False
    clientCreatedAt: datetime
    appVersion: str = Field(max_length=40)
    contentVersion: str = Field(max_length=40)


class SessionIn(BaseModel):
    id: str = Field(min_length=8, max_length=UUID_LEN)
    mode: Literal["apren", "practica", "repas", "proposats"]
    block: str | None = Field(default=None, max_length=10)
    startedAt: datetime
    endedAt: datetime | None = None


class AttemptsBatchIn(BaseModel):
    attempts: list[AttemptIn]


class SessionsBatchIn(BaseModel):
    sessions: list[SessionIn]


def _tz(d: datetime) -> datetime:
    """Els instants sense zona (no n'hauria d'arribar cap) es prenen com a UTC."""
    from datetime import timezone

    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def _check_batch(n: int) -> None:
    if n > settings.batch_max:
        raise HTTPException(413, {"error": "batch_too_big", "message": f"Màxim {settings.batch_max} elements per lot."})


def attempt_dict(a: Attempt) -> dict:
    return {"id": a.id, "sessionId": a.session_id, "block": a.block, "templateId": a.template_id,
            "templateVersion": a.template_version, "seed": a.seed, "questionType": a.question_type,
            "level": a.level, "outcome": a.outcome, "chosenOptionId": a.chosen_option_id, "errorTag": a.error_tag,
            "presentedErrorTags": list(a.presented_error_tags or []), "explanationOpened": a.explanation_opened,
            "clientCreatedAt": a.client_created_at.isoformat(), "appVersion": a.app_version,
            "contentVersion": a.content_version, "receivedAt": a.received_at.isoformat()}


@router.post("/attempts/batch", status_code=201)
def attempts_batch(body: AttemptsBatchIn, u: User = Depends(auth.current_user), db: Session = Depends(get_db)):
    """Idempotent per `id`: els que ja hi són (d'aquest usuari o d'un altre) s'ignoren i es
    retornen a `accepted` igualment si són seus, perquè el client els marqui com a sincronitzats."""
    _check_batch(len(body.attempts))
    ids = [a.id for a in body.attempts]
    existing = {a.id: a.user_id for a in db.scalars(select(Attempt).where(Attempt.id.in_(ids))).all()} if ids else {}
    accepted, ignored = [], []
    seen: set[str] = set()
    received = now()
    for a in body.attempts:
        if a.id in seen:
            continue
        seen.add(a.id)
        owner = existing.get(a.id)
        if owner is not None:
            (accepted if owner == u.id else ignored).append(a.id)
            continue
        db.add(Attempt(id=a.id, user_id=u.id, session_id=a.sessionId, block=a.block, template_id=a.templateId,
                       template_version=a.templateVersion, seed=a.seed, question_type=a.questionType, level=a.level,
                       outcome=a.outcome, chosen_option_id=a.chosenOptionId, error_tag=a.errorTag,
                       presented_error_tags=a.presentedErrorTags, explanation_opened=a.explanationOpened,
                       client_created_at=_tz(a.clientCreatedAt), received_at=received, app_version=a.appVersion,
                       content_version=a.contentVersion))
        accepted.append(a.id)
    db.commit()
    return {"accepted": accepted, "ignored": ignored}


@router.post("/sessions/batch", status_code=201)
def sessions_batch(body: SessionsBatchIn, u: User = Depends(auth.current_user), db: Session = Depends(get_db)):
    """Crea o actualitza (ended_at) sessions d'estudi; idempotent per `id`."""
    _check_batch(len(body.sessions))
    accepted = []
    for s in body.sessions:
        row = db.get(StudySession, s.id)
        if row and row.user_id != u.id:
            continue
        if row:
            if s.endedAt and not row.ended_at:
                row.ended_at = _tz(s.endedAt)
        else:
            db.add(StudySession(id=s.id, user_id=u.id, mode=s.mode, block=s.block, started_at=_tz(s.startedAt),
                                ended_at=_tz(s.endedAt) if s.endedAt else None))
        accepted.append(s.id)
    db.commit()
    return {"accepted": accepted}


def _target_user(db: Session, u: User, user_id: int | None) -> User:
    """L'alumna només veu el seu; el tutor, el seu o el de qualsevol usuari (§7)."""
    if user_id is None or user_id == u.id:
        return u
    if not u.is_tutor:
        raise HTTPException(403, {"error": "forbidden", "message": "Només pots veure els teus intents."})
    t = db.get(User, user_id)
    if not t:
        raise HTTPException(404, {"error": "unknown_user", "message": "Aquest usuari no existeix."})
    return t


def parse_cursor(cursor: str | None) -> tuple[datetime, str] | None:
    """Cursor `<ISO 8601>|<id>` (o només la data). Un `+` de zona horària sense codificar arriba
    com a espai: es tolera."""
    if not cursor:
        return None
    date, _, last_id = cursor.strip().partition("|")
    try:
        return _tz(datetime.fromisoformat(date.strip().replace(" ", "+"))), last_id
    except ValueError:
        raise HTTPException(422, {"error": "invalid_request", "message": "`since` ha de ser una data ISO 8601."})


def make_cursor(a: Attempt) -> str:
    return f"{a.received_at.isoformat()}|{a.id}"


@router.get("/attempts")
def list_attempts(since: str | None = Query(default=None), user_id: int | None = Query(default=None),
                  limit: int = Query(default=2000, ge=1, le=5000),
                  u: User = Depends(auth.current_user), db: Session = Depends(get_db)):
    """Intents rebuts després del cursor `since` (`received_at|id`, keyset: no es perd cap fila
    encara que un lot comparteixi instant de recepció), ordenats per recepció. Retorna `cursor`
    per a la crida següent i `more` si n'hi ha més."""
    t = _target_user(db, u, user_id)
    q = select(Attempt).where(Attempt.user_id == t.id)
    c = parse_cursor(since)
    if c is not None:
        dt, last_id = c
        q = q.where(or_(Attempt.received_at > dt, and_(Attempt.received_at == dt, Attempt.id > last_id)))
    rows = db.scalars(q.order_by(Attempt.received_at, Attempt.id).limit(limit + 1)).all()
    more = len(rows) > limit
    rows = rows[:limit]
    cursor = make_cursor(rows[-1]) if rows else (f"{c[0].isoformat()}|{c[1]}" if c else None)
    return {"attempts": [attempt_dict(a) for a in rows], "cursor": cursor, "more": more}
