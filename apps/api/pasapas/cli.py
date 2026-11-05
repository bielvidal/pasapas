"""Tasques d'operació (s'executen DINS del contenidor):

  docker compose exec api python -m pasapas.cli initdb
  docker compose exec api python -m pasapas.cli invite --email algu@gmail.com [--alias "Nom"]
  docker compose exec api python -m pasapas.cli code --email algu@gmail.com            # codi d'entrada sense correu (es dicta)
  docker compose exec api python -m pasapas.cli link --email algu@gmail.com [--hours 48]  # enllaç de rescat sense correu
  docker compose exec api python -m pasapas.cli tutor --email biel@...                # donar rol tutor
  docker compose exec api python -m pasapas.cli users
"""
from __future__ import annotations

import argparse
import secrets
from datetime import timedelta

from sqlalchemy import select

from . import auth
from .db import SessionLocal, initdb
from .models import Invitation, MagicLink, User, now
from .settings import settings


def invite(email: str, alias: str = "") -> None:
    with SessionLocal() as db:
        e = auth.normal_email(email)
        if db.get(Invitation, e):
            print(f"ja convidat: {e}")
            return
        db.add(Invitation(email=e, alias=alias, invited_by="cli"))
        db.commit()
        print(f"convidat: {e}")


def code(email: str) -> str:
    """Imprimeix un codi d'entrada vàlid sense passar pel correu (per dictar-lo). Val el mateix
    que un d'enviat: PASAPAS_CODE_MINUTES i un sol ús."""
    with SessionLocal() as db:
        e = auth.normal_email(email)
        if not auth.can_enter(db, e):
            raise SystemExit(f"{e} no està convidat")
        c = auth.request_code(db, e, send=False)
    print(f"codi per a {e}: {c}  (caduca en {settings.code_minutes} minuts)")
    return c or ""


def link(email: str, hours: float | None = None) -> str:
    with SessionLocal() as db:
        e = auth.normal_email(email)
        if not auth.can_enter(db, e):
            raise SystemExit(f"{e} no està convidat (convida'l primer)")
        tok = secrets.token_urlsafe(32)
        validity = timedelta(hours=hours) if hours else timedelta(minutes=settings.magic_link_minutes)
        db.add(MagicLink(email=e, token_hash=auth.hash_token(tok), expires_at=now() + validity))
        db.commit()
        url = f"{settings.portal_url}/entrar/enllac?t={tok}"
        print(url)
        return url


def make_tutor(email: str) -> None:
    with SessionLocal() as db:
        e = auth.normal_email(email)
        u = db.scalar(select(User).where(User.email == e))
        if not u:
            raise SystemExit(f"{e} encara no ha entrat; afegeix-lo a PASAPAS_TUTOR_EMAILS o espera que entri")
        u.role = "tutor"
        db.commit()
        print(f"{e} és tutor")


def users() -> None:
    with SessionLocal() as db:
        for u in db.scalars(select(User).order_by(User.id)).all():
            print(f"#{u.id}\t{u.role}\t{u.email}\t{u.alias}\tactivitat: {u.last_activity}")


def main() -> None:
    p = argparse.ArgumentParser(prog="pasapas.cli")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("initdb")
    i = sub.add_parser("invite")
    i.add_argument("--email", required=True)
    i.add_argument("--alias", default="")
    c = sub.add_parser("code")
    c.add_argument("--email", required=True)
    e = sub.add_parser("link")
    e.add_argument("--email", required=True)
    e.add_argument("--hours", type=float)
    t = sub.add_parser("tutor")
    t.add_argument("--email", required=True)
    sub.add_parser("users")
    args = p.parse_args()
    if args.cmd == "initdb":
        initdb()
        print("esquema al dia")
    elif args.cmd == "invite":
        invite(args.email, args.alias)
    elif args.cmd == "code":
        code(args.email)
    elif args.cmd == "link":
        link(args.email, args.hours)
    elif args.cmd == "tutor":
        make_tutor(args.email)
    elif args.cmd == "users":
        users()


if __name__ == "__main__":
    main()
