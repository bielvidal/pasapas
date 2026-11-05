"""Auth (patró PPER, ACUERDO D2): codi de 6 xifres per correu → cookie de sessió httpOnly
(revocable, llarga i que es renova sola). Sense contrasenyes. Només entren els correus de la llista
de convidats, els que ja tenen compte i els tutors del .env. L'enllaç màgic queda com a rescat del
CLI (`pasapas.cli link`)."""
from __future__ import annotations

import hashlib
import re
import secrets
from datetime import timedelta

from fastapi import Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from . import mail
from .db import get_db
from .models import AuthSession, Invitation, LoginCode, MagicLink, User, now
from .settings import settings

COOKIE = "pasapas_session"
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ACTIVITY_EVERY = timedelta(minutes=5)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def normal_email(email: str) -> str:
    e = (email or "").strip().lower()
    if not EMAIL_RE.match(e):
        raise HTTPException(422, {"error": "invalid_email", "message": "Aquest correu no sembla vàlid."})
    return e


def can_enter(db: Session, email: str) -> bool:
    if email in settings.tutor_emails:
        return True
    if db.scalar(select(User).where(User.email == email)):
        return True
    return db.get(Invitation, email) is not None


def hash_code(email: str, code: str) -> str:
    return hash_token(f"{email}:{code}")


def request_code(db: Session, email: str, send: bool = True) -> str | None:
    """Crea (i envia, llevat de `send=False`: el CLI o el panell el dicten) un codi de 6 xifres si
    el correu pot entrar; l'anterior viu d'aquest correu queda anul·lat. Retorna el codi o None,
    però l'API MAI revela si s'ha enviat (evita enumerar correus)."""
    email = normal_email(email)
    if not can_enter(db, email):
        return None
    for c in db.scalars(select(LoginCode).where(LoginCode.email == email, LoginCode.used.is_(False))):
        c.used = True
    code = f"{secrets.randbelow(10 ** 6):06d}"
    db.add(LoginCode(email=email, code_hash=hash_code(email, code), expires_at=now() + timedelta(minutes=settings.code_minutes)))
    db.commit()
    if not send:
        return code
    mail.send(email, f"{code} és el teu codi per entrar a Pas a pas",
              f"Hola.\n\nEl teu codi per entrar a Pas a pas · Àlgebra és:\n\n    {code}\n\n"
              f"Escriu-lo a la pantalla d'entrar. Caduca en {settings.code_minutes} minuts i només val una vegada.\n\n"
              f"Si no l'has demanat tu, ignora aquest correu.\n")
    return code


def login_with_code(db: Session, email: str, code: str, device: str = "") -> tuple[User, str]:
    """Comprova el codi viu d'aquest correu i obre sessió. Cada errada compta; en arribar a
    `code_attempts` el codi es crema i cal demanar-ne un altre."""
    email = normal_email(email)
    code = re.sub(r"\D", "", code or "")
    c = db.scalar(select(LoginCode).where(LoginCode.email == email, LoginCode.used.is_(False)).order_by(LoginCode.id.desc()))
    if not c or c.expires_at < now() or not can_enter(db, email):
        raise HTTPException(400, {"error": "code_expired", "message": "No hi ha cap codi vigent per a aquest correu. Demana'n un altre."})
    if not secrets.compare_digest(c.code_hash, hash_code(email, code)):
        c.attempts += 1
        left = settings.code_attempts - c.attempts
        if left <= 0:
            c.used = True
        db.commit()
        if left <= 0:
            raise HTTPException(400, {"error": "code_expired", "message": "Massa intents: aquest codi ja no val. Demana'n un altre."})
        raise HTTPException(400, {"error": "code_invalid", "message": f"El codi no és correcte. Et queden {left} intents."})
    c.used = True
    return _open_session(db, email, device)


def _open_session(db: Session, email: str, device: str) -> tuple[User, str]:
    """Crea l'usuari si és la primera vegada i obre una sessió nova (token per a la cookie)."""
    u = _user_of(db, email)
    u.last_activity = now()
    tok = secrets.token_urlsafe(32)
    db.add(AuthSession(user_id=u.id, token_hash=hash_token(tok), expires_at=now() + timedelta(days=settings.session_days),
                       device=device[:80], last_activity=now()))
    db.commit()
    return u, tok


def _user_of(db: Session, email: str) -> User:
    u = db.scalar(select(User).where(User.email == email))
    if not u:
        inv = db.get(Invitation, email)
        u = User(email=email, alias=(inv.alias if inv else ""))
        db.add(u)
    if email in settings.tutor_emails:
        u.role = "tutor"
    db.flush()
    return u


def device_of(user_agent: str | None) -> str:
    """Resum llegible del User-Agent: «Android · Chrome», «iPhone · Safari»…"""
    ua = user_agent or ""
    so = next((n for p, n in (("iPhone", "iPhone"), ("iPad", "iPad"), ("Android", "Android"), ("Windows", "Windows"),
                             ("Mac OS", "Mac"), ("CrOS", "Chromebook"), ("Linux", "Linux")) if p in ua), "")
    nav = next((n for p, n in (("Edg/", "Edge"), ("OPR/", "Opera"), ("SamsungBrowser", "Samsung"), ("Firefox/", "Firefox"),
                              ("Chrome/", "Chrome"), ("CriOS/", "Chrome"), ("FxiOS/", "Firefox"), ("Safari/", "Safari")) if p in ua), "")
    return " · ".join(x for x in (so, nav) if x) or "Dispositiu desconegut"


def redeem_link(db: Session, token: str, device: str = "") -> tuple[User, str]:
    """Consumeix l'enllaç de rescat (CLI) i obre sessió."""
    ml = db.scalar(select(MagicLink).where(MagicLink.token_hash == hash_token(token or "")))
    if ml and ml.used:
        raise HTTPException(400, {"error": "link_used", "message": "Aquest enllaç ja s'ha fet servir. Si ja havies entrat en aquest dispositiu, no en necessites un altre."})
    if not ml or ml.expires_at < now() or not can_enter(db, ml.email):
        raise HTTPException(400, {"error": "link_invalid", "message": "L'enllaç no és vàlid o ha caducat. Demana'n un altre."})
    ml.used = True
    return _open_session(db, ml.email, device)


def set_cookie(response: Response, token: str) -> None:
    response.set_cookie(COOKIE, token, max_age=settings.session_days * 86400, httponly=True,
                        samesite="lax", secure=settings.cookie_secure, path="/")


def clear_cookie(response: Response) -> None:
    response.delete_cookie(COOKIE, path="/")


def logout(db: Session, token: str | None) -> None:
    if not token:
        return
    s = db.scalar(select(AuthSession).where(AuthSession.token_hash == hash_token(token)))
    if s:
        s.revoked = True
        db.commit()


def current_user(request: Request, response: Response, db: Session = Depends(get_db)) -> User:
    token = request.cookies.get(COOKIE)
    s = db.scalar(select(AuthSession).where(AuthSession.token_hash == hash_token(token))) if token else None
    if not s or s.revoked or s.expires_at < now():
        raise HTTPException(401, {"error": "no_session", "message": "Has d'entrar."})
    u = db.get(User, s.user_id)
    if not u:
        raise HTTPException(401, {"error": "no_session", "message": "Has d'entrar."})
    # Renovació: si a la sessió li queda menys de la meitat, torna a durar session_days (i la cookie també)
    if s.expires_at - now() < timedelta(days=settings.session_days / 2):
        s.expires_at = now() + timedelta(days=settings.session_days)
        db.commit()
        set_cookie(response, token)
    if not u.last_activity or now() - u.last_activity > ACTIVITY_EVERY:
        u.last_activity = now()
        db.commit()
    if not s.last_activity or now() - s.last_activity > ACTIVITY_EVERY:
        s.last_activity = now()
        db.commit()
    request.state.session_id = s.id
    return u


def open_sessions(db: Session, user_id: int) -> list[AuthSession]:
    return list(db.scalars(select(AuthSession).where(AuthSession.user_id == user_id, AuthSession.revoked.is_(False),
                                                     AuthSession.expires_at > now()).order_by(AuthSession.created_at.desc())).all())


def session_dict(s: AuthSession, current_id: int | None = None) -> dict:
    return {"id": s.id, "device": s.device or "Dispositiu desconegut", "created_at": s.created_at.isoformat(),
            "last_activity": s.last_activity.isoformat() if s.last_activity else None, "current": s.id == current_id}


def revoke_session(db: Session, user_id: int, session_id: int) -> bool:
    s = db.get(AuthSession, session_id)
    if not s or s.user_id != user_id or s.revoked:
        return False
    s.revoked = True
    db.commit()
    return True


def current_tutor(u: User = Depends(current_user)) -> User:
    if not u.is_tutor:
        raise HTTPException(403, {"error": "forbidden", "message": "Només el tutor pot fer això."})
    return u


def me(u: User) -> dict:
    return {"id": u.id, "email": u.email, "alias": u.alias, "role": u.role}
