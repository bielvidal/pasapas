"""Motor, sessions i arrencada de l'esquema (patró de la casa).

`Base.metadata.create_all` crea el que falti i després s'apliquen, en ordre i una sola vegada,
els `migrations/NNN_*.sql`. Registre a `schema_migrations`.
"""
from __future__ import annotations

import os
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from .settings import settings

MIGRATIONS = Path(__file__).resolve().parent.parent / "migrations"


def make_engine(url: str | None = None):
    url = url or settings.database_url
    if url.startswith("sqlite"):
        return create_engine(url, future=True, connect_args={"check_same_thread": False}, poolclass=StaticPool)
    return create_engine(url, future=True, pool_pre_ping=True)


engine = make_engine()
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, class_=Session)


def get_db():
    s = SessionLocal()
    try:
        yield s
    finally:
        s.close()


def statements_of(sql: str) -> list[str]:
    clean = "\n".join(l for l in sql.splitlines() if not l.lstrip().startswith("--"))
    return [s.strip() for s in clean.split(";") if s.strip()]


def apply_migrations(eng, folder: Path = MIGRATIONS) -> list[str]:
    applied: list[str] = []
    with eng.begin() as con:
        con.execute(text("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)"))
        done = {r[0] for r in con.execute(text("SELECT name FROM schema_migrations"))}
    for f in sorted(folder.glob("*.sql")) if folder.exists() else []:
        if f.name in done:
            continue
        with eng.begin() as con:
            for stmt in statements_of(f.read_text(encoding="utf-8")):
                con.execute(text(stmt))
            con.execute(text("INSERT INTO schema_migrations (name, applied_at) VALUES (:n, CURRENT_TIMESTAMP)"), {"n": f.name})
        applied.append(f.name)
    return applied


def initdb(eng=engine) -> None:
    from .models import Base  # import tardà: models importa db

    Base.metadata.create_all(eng)
    apply_migrations(eng)


def auto_initdb() -> None:
    if os.environ.get("AUTO_INITDB") == "1":
        initdb()
