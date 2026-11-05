"""Cara tutor: usuaris i la seva activitat, convidats (amb àlies), codis d'entrada dictats i
dispositius."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from .. import auth
from ..db import get_db
from ..models import Attempt, AuthSession, Invitation, StudySession, User
from ..settings import settings

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(auth.current_tutor)])


def _iso(d) -> str | None:
    return d.isoformat() if d else None


# --- usuaris --------------------------------------------------------------

@router.get("/users")
def users(db: Session = Depends(get_db)):
    counts = {uid: (int(n), last) for uid, n, last in db.execute(
        select(Attempt.user_id, func.count(), func.max(Attempt.client_created_at)).group_by(Attempt.user_id)).all()}
    out = []
    for u in db.scalars(select(User).order_by(User.role.desc(), User.id)).all():
        n, last = counts.get(u.id, (0, None))
        out.append({"id": u.id, "email": u.email, "alias": u.alias, "role": u.role, "created_at": _iso(u.created_at),
                    "last_activity": _iso(u.last_activity), "attempts": n,
                    "last_attempt": last.isoformat() if hasattr(last, "isoformat") else (last if last else None)})
    return out


@router.get("/users/{user_id}/sessions")
def user_sessions(user_id: int, db: Session = Depends(get_db)):
    if not db.get(User, user_id):
        raise HTTPException(404, {"error": "unknown_user", "message": "Aquest usuari no existeix."})
    return [auth.session_dict(s) for s in auth.open_sessions(db, user_id)]


@router.delete("/users/{user_id}/sessions/{session_id}")
def close_user_session(user_id: int, session_id: int, db: Session = Depends(get_db)):
    if not auth.revoke_session(db, user_id, session_id):
        raise HTTPException(404, {"error": "unknown_session", "message": "Aquesta sessió no existeix."})
    return {"ok": True}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, me: User = Depends(auth.current_tutor), db: Session = Depends(get_db)):
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(404, {"error": "unknown_user", "message": "Aquest usuari no existeix."})
    if u.id == me.id:
        raise HTTPException(400, {"error": "not_yourself", "message": "No et pots esborrar des d'aquí."})
    for table in (Attempt, StudySession, AuthSession):
        db.execute(delete(table).where(table.user_id == u.id))
    db.delete(u)
    db.commit()
    return {"ok": True}


# --- convidats ------------------------------------------------------------

class InvitationIn(BaseModel):
    email: str
    alias: str = Field(default="", max_length=80)


@router.get("/invitations")
def invitations(db: Session = Depends(get_db)):
    users_by_email = {u.email: u for u in db.scalars(select(User)).all()}
    return [{"email": i.email, "alias": i.alias, "invited_by": i.invited_by, "created_at": _iso(i.created_at),
             "has_entered": i.email in users_by_email,
             "user_id": users_by_email[i.email].id if i.email in users_by_email else None}
            for i in db.scalars(select(Invitation).order_by(Invitation.created_at.desc())).all()]


@router.post("/invitations", status_code=201)
def invite(body: InvitationIn, me: User = Depends(auth.current_tutor), db: Session = Depends(get_db)):
    email = auth.normal_email(body.email)
    inv = db.get(Invitation, email)
    if inv:
        inv.alias = body.alias.strip() or inv.alias
    else:
        db.add(Invitation(email=email, alias=body.alias.strip(), invited_by=me.email))
    db.commit()
    return {"email": email, "alias": body.alias.strip()}


@router.delete("/invitations/{email}")
def uninvite(email: str, db: Session = Depends(get_db)):
    """Treu la invitació. Si ja té compte, el compte continua: esborra'l des d'Usuaris."""
    inv = db.get(Invitation, email.strip().lower())
    if inv:
        db.delete(inv)
        db.commit()
    return {"ok": True}


@router.post("/invitations/{email}/code", status_code=201)
def dictate_code(email: str, db: Session = Depends(get_db)):
    """Codi d'entrada per dictar en persona (sense correu): val igual que un d'enviat."""
    email = auth.normal_email(email)
    if not auth.can_enter(db, email):
        raise HTTPException(404, {"error": "not_invited", "message": "Aquest correu no està convidat."})
    code = auth.request_code(db, email, send=False)
    return {"email": email, "code": code, "expires_minutes": settings.code_minutes}
