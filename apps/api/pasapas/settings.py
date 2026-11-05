"""Configuració per variables d'entorn. Res hardcodejat, cap secret aquí."""
from __future__ import annotations

import os
from dataclasses import dataclass, field


def _list(value: str) -> list[str]:
    return [v.strip().lower() for v in value.split(",") if v.strip()]


@dataclass
class Settings:
    database_url: str = field(default_factory=lambda: os.environ.get("DATABASE_URL", "sqlite://"))
    # URL pública del portal: destí dels enllaços de rescat
    portal_url: str = field(default_factory=lambda: os.environ.get("PASAPAS_PORTAL_URL", "http://localhost:3011").rstrip("/"))
    # correus que entren sempre i amb rol tutor (separats per comes)
    tutor_emails: list[str] = field(default_factory=lambda: _list(os.environ.get("PASAPAS_TUTOR_EMAILS", "")))
    cookie_secure: bool = field(default_factory=lambda: os.environ.get("PASAPAS_COOKIE_SECURE", "0") == "1")
    # la sessió dura session_days i es renova sola en usar-la quan li queda menys de la meitat
    session_days: int = field(default_factory=lambda: int(os.environ.get("PASAPAS_SESSION_DAYS", "180")))
    # codi d'entrada: validesa i intents fallits abans de cremar-lo
    code_minutes: int = field(default_factory=lambda: int(os.environ.get("PASAPAS_CODE_MINUTES", "10")))
    code_attempts: int = field(default_factory=lambda: int(os.environ.get("PASAPAS_CODE_ATTEMPTS", "5")))
    magic_link_minutes: int = field(default_factory=lambda: int(os.environ.get("PASAPAS_MAGIC_LINK_MINUTES", "15")))
    rate_auth_per_min: int = field(default_factory=lambda: int(os.environ.get("PASAPAS_RATE_AUTH_PER_MIN", "5")))
    batch_max: int = field(default_factory=lambda: int(os.environ.get("PASAPAS_BATCH_MAX", "500")))
    mail_backend: str = field(default_factory=lambda: os.environ.get("PASAPAS_MAIL_BACKEND", "console"))
    smtp_host: str = field(default_factory=lambda: os.environ.get("SMTP_HOST", ""))
    smtp_port: int = field(default_factory=lambda: int(os.environ.get("SMTP_PORT", "587")))
    smtp_user: str = field(default_factory=lambda: os.environ.get("SMTP_USER", ""))
    smtp_password: str = field(default_factory=lambda: os.environ.get("SMTP_PASSWORD", ""))
    smtp_from: str = field(default_factory=lambda: os.environ.get("SMTP_FROM", "pasapas@nereidlabs.net"))


settings = Settings()
