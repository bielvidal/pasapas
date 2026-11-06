"""Model de dades (§6 de l'especificació). Tipus portables: els tests corren sobre SQLite i
producció és Postgres 16.

Dades mínimes d'una menor (restricció 4): email d'autenticació, àlies i els intents. Res més.
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import JSON, BigInteger, Boolean, DateTime, ForeignKey, Index, Integer, String, Text, TypeDecorator
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def now() -> datetime:
    return datetime.now(timezone.utc)


class TZDateTime(TypeDecorator):
    """Instant en UTC amb tzinfo garantit en llegir (SQLite el perd)."""

    impl = DateTime(timezone=True)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None and value.tzinfo is None:
            raise ValueError("els instants es guarden sempre amb zona horària")
        return value.astimezone(timezone.utc) if value is not None else None

    def process_result_value(self, value, dialect):
        return value.replace(tzinfo=timezone.utc) if value is not None and value.tzinfo is None else value


JSONType = JSON().with_variant(JSONB(), "postgresql")
ROLES = ("tutor", "student")
MODES = ("apren", "practica", "repas")
OUTCOMES = ("correct", "incorrect", "skipped")
QUESTION_TYPES = ("mc_result", "valid_step", "find_error", "next_step")


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True)
    alias: Mapped[str] = mapped_column(String(80), default="")
    role: Mapped[str] = mapped_column(String(20), default="student")
    created_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)
    last_activity: Mapped[datetime | None] = mapped_column(TZDateTime, nullable=True)

    @property
    def is_tutor(self) -> bool:
        return self.role == "tutor"


class Invitation(Base):
    """Llista de convidats: només aquests correus (i els tutors del .env) poden entrar."""

    __tablename__ = "invitations"
    email: Mapped[str] = mapped_column(String(320), primary_key=True)
    alias: Mapped[str] = mapped_column(String(80), default="")
    invited_by: Mapped[str] = mapped_column(String(320), default="")
    created_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)


class LoginCode(Base):
    """Codi de 6 xifres per entrar: un sol ús, caduca, i es crema als N intents fallits. Només n'hi
    ha un de viu per correu (demanar-ne un altre mata l'anterior)."""

    __tablename__ = "login_codes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), index=True)
    code_hash: Mapped[str] = mapped_column(String(64))
    expires_at: Mapped[datetime] = mapped_column(TZDateTime)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)


class MagicLink(Base):
    """Enllaç de rescat (només el CLI el genera)."""

    __tablename__ = "magic_links"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(320), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(TZDateTime)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)


class AuthSession(Base):
    """Sessió de navegador (cookie httpOnly), revocable."""

    __tablename__ = "auth_sessions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(TZDateTime)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)
    device: Mapped[str] = mapped_column(String(80), default="")  # «iPhone · Safari», del User-Agent en entrar
    last_activity: Mapped[datetime | None] = mapped_column(TZDateTime, nullable=True)


class StudySession(Base):
    """Sessió d'estudi de l'app (id UUID del client), §6 `sessions`."""

    __tablename__ = "study_sessions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    mode: Mapped[str] = mapped_column(String(20))
    block: Mapped[str | None] = mapped_column(String(10), nullable=True)
    started_at: Mapped[datetime] = mapped_column(TZDateTime)
    ended_at: Mapped[datetime | None] = mapped_column(TZDateTime, nullable=True)
    received_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)


class Attempt(Base):
    """Un intent (§6). L'enunciat no es guarda: es reprodueix de (template_id, template_version, seed)."""

    __tablename__ = "attempts"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # UUID del client (idempotència)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    session_id: Mapped[str] = mapped_column(String(36), index=True)
    block: Mapped[str] = mapped_column(String(10))
    template_id: Mapped[str] = mapped_column(String(40))
    template_version: Mapped[int] = mapped_column(Integer)
    seed: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"))
    question_type: Mapped[str] = mapped_column(String(20))
    level: Mapped[int] = mapped_column(Integer)
    outcome: Mapped[str] = mapped_column(String(20))
    chosen_option_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    error_tag: Mapped[str | None] = mapped_column(String(80), nullable=True)
    presented_error_tags: Mapped[list] = mapped_column(JSONType)
    explanation_opened: Mapped[bool] = mapped_column(Boolean, default=False)
    client_created_at: Mapped[datetime] = mapped_column(TZDateTime)
    received_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)
    app_version: Mapped[str] = mapped_column(String(40))
    content_version: Mapped[str] = mapped_column(String(40))


Index("ix_attempts_user_block_created", Attempt.user_id, Attempt.block, Attempt.client_created_at)
Index("ix_attempts_user_tag", Attempt.user_id, Attempt.error_tag)
Index("ix_attempts_user_received", Attempt.user_id, Attempt.received_at)


class ContentOverride(Base):
    """Text editat des del panell (fase 4). `state`: esborrany (només el veu el tutor) o aprovat."""

    __tablename__ = "content_overrides"
    key: Mapped[str] = mapped_column(String(200), primary_key=True)
    text_ca: Mapped[str] = mapped_column(Text)
    state: Mapped[str] = mapped_column(String(20), default="esborrany")
    updated_at: Mapped[datetime] = mapped_column(TZDateTime, default=now)
