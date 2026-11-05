"""Fixtures: BD SQLite en memòria, un tutor (per .env) i una alumna convidada."""
import os

os.environ["PASAPAS_MAIL_BACKEND"] = "memoria"
os.environ["PASAPAS_TUTOR_EMAILS"] = "biel@test.local"
os.environ["PASAPAS_RATE_AUTH_PER_MIN"] = "1000"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from pasapas import mail  # noqa: E402
from pasapas.api import app  # noqa: E402
from pasapas.db import get_db, make_engine  # noqa: E402
from pasapas.models import Base, Invitation  # noqa: E402
from pasapas.routers import auth as r_auth  # noqa: E402

TUTOR = "biel@test.local"
STUDENT = "aina@test.local"


@pytest.fixture()
def db():
    engine = make_engine("sqlite://")
    Base.metadata.create_all(engine)
    Maker = sessionmaker(bind=engine, expire_on_commit=False)

    def override():
        s = Maker()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[get_db] = override
    mail.SENT.clear()
    r_auth.limiter_auth.reset()
    s = Maker()
    s.add(Invitation(email=STUDENT, alias="Aina", invited_by=TUTOR))
    s.commit()
    yield s
    s.close()
    app.dependency_overrides.clear()


@pytest.fixture()
def client(db):
    return TestClient(app)


def sent_code() -> str:
    """El codi de 6 xifres de l'últim correu (és a l'assumpte i al cos)."""
    return mail.SENT[-1]["subject"].split()[0]


def login(client: TestClient, email: str) -> TestClient:
    mail.SENT.clear()
    assert client.post("/api/auth/code", json={"email": email}).status_code == 200
    assert mail.SENT, f"no s'ha enviat codi a {email}"
    r = client.post("/api/auth/login", json={"email": email, "code": sent_code()})
    assert r.status_code == 200, r.text
    return client


@pytest.fixture()
def tutor(db):
    return login(TestClient(app), TUTOR)


@pytest.fixture()
def student(db):
    return login(TestClient(app), STUDENT)


def attempt(id: str = "11111111-1111-4111-8111-111111111111", **over) -> dict:
    base = {"id": id, "sessionId": "22222222-2222-4222-8222-222222222222", "block": "B5", "templateId": "B5.T1",
            "templateVersion": 1, "seed": 123456789, "questionType": "mc_result", "level": 1, "outcome": "incorrect",
            "chosenOptionId": "b", "errorTag": "B5_CANCELA_TERME", "presentedErrorTags": ["B5_CANCELA_TERME", "B5_SIGNE"],
            "explanationOpened": True, "clientCreatedAt": "2026-11-06T10:00:00+01:00", "appVersion": "0.2.0",
            "contentVersion": "0.1.0"}
    return {**base, **over}
