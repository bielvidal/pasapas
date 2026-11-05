"""Entrar, sortir, qui soc, dispositius i esborrat del compte."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import delete
from sqlalchemy.orm import Session

from .. import auth
from ..db import get_db
from ..models import Attempt, AuthSession, StudySession, User
from ..ratelimit import Limiter, enforce
from ..settings import settings

router = APIRouter(prefix="/api", tags=["auth"])
limiter_auth = Limiter(settings.rate_auth_per_min)  # demanar codi i provar codi, per IP


class EmailIn(BaseModel):
    email: str


class CodeIn(BaseModel):
    email: str
    code: str


class TokenIn(BaseModel):
    token: str


class AliasIn(BaseModel):
    alias: str = Field(max_length=80)


@router.post("/auth/code")
def request_code(body: EmailIn, request: Request, db: Session = Depends(get_db)):
    enforce(limiter_auth, request)
    auth.request_code(db, body.email)
    return {"sent": True}  # sempre: no revelem quins correus existeixen


@router.post("/auth/login")
def login(body: CodeIn, request: Request, response: Response, db: Session = Depends(get_db)):
    enforce(limiter_auth, request)
    u, tok = auth.login_with_code(db, body.email, body.code, auth.device_of(request.headers.get("user-agent")))
    auth.set_cookie(response, tok)
    return auth.me(u)


@router.post("/auth/redeem-link")
def redeem_link(body: TokenIn, request: Request, response: Response, db: Session = Depends(get_db)):
    """Enllaç de rescat del CLI (`pasapas.cli link`)."""
    u, tok = auth.redeem_link(db, body.token, auth.device_of(request.headers.get("user-agent")))
    auth.set_cookie(response, tok)
    return auth.me(u)


@router.post("/auth/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    auth.logout(db, request.cookies.get(auth.COOKIE))
    auth.clear_cookie(response)
    return {"ok": True}


@router.get("/me")
def me(u: User = Depends(auth.current_user)):
    return auth.me(u)


@router.put("/me/alias")
def set_alias(body: AliasIn, u: User = Depends(auth.current_user), db: Session = Depends(get_db)):
    u.alias = body.alias.strip()[:80]
    db.commit()
    return auth.me(u)


@router.get("/me/sessions")
def my_sessions(request: Request, u: User = Depends(auth.current_user), db: Session = Depends(get_db)):
    """Dispositius amb sessió oberta (l'actual marcada)."""
    return [auth.session_dict(s, request.state.session_id) for s in auth.open_sessions(db, u.id)]


@router.delete("/me/sessions/{session_id}")
def close_other_session(session_id: int, u: User = Depends(auth.current_user), db: Session = Depends(get_db)):
    if not auth.revoke_session(db, u.id, session_id):
        raise HTTPException(404, {"error": "unknown_session", "message": "Aquesta sessió no existeix."})
    return {"ok": True}


@router.delete("/me")
def delete_account(response: Response, u: User = Depends(auth.current_user), db: Session = Depends(get_db)):
    """Esborra el compte i totes les seves dades. La invitació es conserva: pot tornar a entrar de zero."""
    for table in (Attempt, StudySession, AuthSession):
        db.execute(delete(table).where(table.user_id == u.id))
    db.delete(u)
    db.commit()
    auth.clear_cookie(response)
    return {"ok": True}
