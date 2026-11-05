"""Enviament del codi d'entrada. Backends: `console` (log; desenvolupament i família: el tutor
també pot generar el codi des del panell), `smtp` (credencials per entorn) i `memoria` (tests)."""
from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from .settings import settings

log = logging.getLogger("pasapas.mail")
SENT: list[dict] = []


def send(to: str, subject: str, body: str) -> None:
    backend = settings.mail_backend
    if backend == "memoria":
        SENT.append({"to": to, "subject": subject, "body": body})
        return
    if backend == "smtp" and settings.smtp_host:
        msg = EmailMessage()
        msg["From"], msg["To"], msg["Subject"] = settings.smtp_from, to, subject
        msg.set_content(body)
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as s:
            s.starttls()
            if settings.smtp_user:
                s.login(settings.smtp_user, settings.smtp_password)
            s.send_message(msg)
        return
    log.warning("[mail → %s] %s\n%s", to, subject, body)
    print(f"[mail → {to}] {subject}\n{body}", flush=True)
