"""Codi per correu → cookie; només convidats i tutors; sense enumeració de correus."""
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient

from pasapas import mail
from pasapas.api import app
from pasapas.models import AuthSession, LoginCode, MagicLink, User, now
from tests.conftest import STUDENT, TUTOR, login, sent_code


def test_not_invited_gets_no_code_and_nothing_is_revealed(client):
    r = client.post("/api/auth/code", json={"email": "ningu@x.test"})
    assert r.status_code == 200 and r.json() == {"sent": True}
    assert mail.SENT == []
    r = client.post("/api/auth/login", json={"email": "ningu@x.test", "code": "123456"})
    assert r.status_code == 400 and r.json()["error"] == "code_expired"


def test_invalid_email_422(client):
    assert client.post("/api/auth/code", json={"email": "no-es-correu"}).status_code == 422


def test_invited_enters_and_user_gets_alias_from_invitation(client):
    login(client, "Aina@Test.local")  # majúscules: es normalitza
    c = sent_code()
    assert len(c) == 6 and c.isdigit() and c in mail.SENT[-1]["body"]
    me = client.get("/api/me").json()
    assert me == {"id": me["id"], "email": STUDENT, "alias": "Aina", "role": "student"}


def test_tutor_from_env_enters_without_invitation(client):
    login(client, TUTOR)
    assert client.get("/api/me").json()["role"] == "tutor"


def test_code_single_use_and_expiry(client, db):
    login(client, STUDENT)
    c = sent_code()
    r = client.post("/api/auth/login", json={"email": STUDENT, "code": c})
    assert r.status_code == 400 and r.json()["error"] == "code_expired"
    client.post("/api/auth/code", json={"email": STUDENT})
    c2 = sent_code()
    lc = db.query(LoginCode).order_by(LoginCode.id.desc()).first()
    lc.expires_at = now() - timedelta(minutes=1)
    db.commit()
    assert client.post("/api/auth/login", json={"email": STUDENT, "code": c2}).json()["error"] == "code_expired"


def test_new_code_cancels_previous_and_accepts_spaces(client):
    client.post("/api/auth/code", json={"email": STUDENT})
    c1 = sent_code()
    client.post("/api/auth/code", json={"email": STUDENT})
    c2 = sent_code()
    assert client.post("/api/auth/login", json={"email": STUDENT, "code": c1}).status_code == 400
    r = client.post("/api/auth/login", json={"email": f" {STUDENT} ", "code": f"{c2[:3]} {c2[3:]}"})
    assert r.status_code == 200 and client.get("/api/me").json()["email"] == STUDENT


def test_code_burns_after_five_failures(client, db):
    client.post("/api/auth/code", json={"email": STUDENT})
    c = sent_code()
    bad = f"{(int(c) + 1) % 10 ** 6:06d}"
    for left in (4, 3, 2, 1):
        r = client.post("/api/auth/login", json={"email": STUDENT, "code": bad})
        assert r.status_code == 400 and r.json()["error"] == "code_invalid" and f"{left} intents" in r.json()["message"]
    assert client.post("/api/auth/login", json={"email": STUDENT, "code": bad}).json()["error"] == "code_expired"
    assert client.post("/api/auth/login", json={"email": STUDENT, "code": c}).status_code == 400
    assert db.query(LoginCode).filter_by(used=False).count() == 0


def test_session_renews_when_little_left(client, db):
    login(client, STUDENT)
    s = db.query(AuthSession).order_by(AuthSession.id.desc()).first()
    s.expires_at = now() + timedelta(days=3)
    db.commit()
    r = client.get("/api/me")
    assert r.status_code == 200 and "pasapas_session=" in r.headers.get("set-cookie", "")
    db.refresh(s)
    assert s.expires_at > now() + timedelta(days=170)
    assert "set-cookie" not in client.get("/api/me").headers


def test_logout_revokes_session(client):
    login(client, STUDENT)
    assert client.post("/api/auth/logout").status_code == 200
    r = client.get("/api/me")
    assert r.status_code == 401 and r.json()["error"] == "no_session"


def test_uninvited_with_account_still_enters(client, tutor):
    login(client, STUDENT)
    assert tutor.delete(f"/api/admin/invitations/{STUDENT}").status_code == 200
    other = login(TestClient(app), STUDENT)
    assert other.get("/api/me").status_code == 200


def test_alias_and_sessions_and_delete_account(client, db):
    login(client, STUDENT)
    assert client.put("/api/me/alias", json={"alias": "  Aina V. "}).json()["alias"] == "Aina V."
    other = TestClient(app, headers={"user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1"})
    login(other, STUDENT)
    ses = other.get("/api/me/sessions").json()
    assert [(s["device"], s["current"]) for s in ses] == [("iPhone · Safari", True), ("Dispositiu desconegut", False)]
    assert other.delete(f"/api/me/sessions/{ses[1]['id']}").status_code == 200
    assert client.get("/api/me").status_code == 401
    assert other.delete("/api/me/sessions/999999").status_code == 404
    assert other.delete("/api/me").status_code == 200
    assert other.get("/api/me").status_code == 401
    assert db.query(User).filter_by(email=STUDENT).first() is None
    # la invitació continua: pot tornar de zero
    again = login(TestClient(app), STUDENT)
    assert again.get("/api/me").json()["alias"] == "Aina"


def test_rate_limit(client, monkeypatch):
    from pasapas.routers import auth as r_auth

    monkeypatch.setattr(r_auth.limiter_auth, "per_minute", 1)
    client.post("/api/auth/code", json={"email": STUDENT})
    assert client.post("/api/auth/login", json={"email": STUDENT, "code": "000000"}).status_code == 429


def test_cli_code_and_link(client, db, monkeypatch, capsys):
    from sqlalchemy.orm import sessionmaker

    from pasapas import cli

    monkeypatch.setattr(cli, "SessionLocal", sessionmaker(bind=db.get_bind(), expire_on_commit=False))
    mail.SENT.clear()
    c = cli.code(STUDENT)
    assert c in capsys.readouterr().out and mail.SENT == []
    assert client.post("/api/auth/login", json={"email": STUDENT, "code": c}).status_code == 200
    with pytest.raises(SystemExit):
        cli.code("ningu@test.local")
    url = cli.link(STUDENT, hours=48)
    assert "/entrar/enllac?t=" in url
    assert db.query(MagicLink).first().expires_at > now() + timedelta(hours=47)
    other = TestClient(app)
    tok = url.split("?t=")[1]
    assert other.post("/api/auth/redeem-link", json={"token": tok}).status_code == 200
    assert other.get("/api/me").json()["email"] == STUDENT
    assert other.post("/api/auth/redeem-link", json={"token": tok}).json()["error"] == "link_used"
    assert other.post("/api/auth/redeem-link", json={"token": "no"}).json()["error"] == "link_invalid"
    cli.invite("nou@test.local", "Nou")
    cli.make_tutor(STUDENT)
    cli.users()
    out = capsys.readouterr().out
    assert "convidat: nou@test.local" in out and f"{STUDENT} és tutor" in out


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200 and r.json()["ok"] is True
