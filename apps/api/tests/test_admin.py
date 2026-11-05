"""Panell del tutor: usuaris, convidats, codi dictat, dispositius; l'alumna no hi entra."""
from fastapi.testclient import TestClient

from pasapas.api import app
from tests.conftest import STUDENT, TUTOR, attempt, login


def test_student_is_forbidden(student):
    r = student.get("/api/admin/users")
    assert r.status_code == 403 and r.json()["error"] == "forbidden"


def test_invitations_crud_and_dictated_code(tutor):
    r = tutor.post("/api/admin/invitations", json={"email": " Nova@Test.local ", "alias": "Nova"})
    assert r.status_code == 201 and r.json() == {"email": "nova@test.local", "alias": "Nova"}
    inv = tutor.get("/api/admin/invitations").json()
    assert [(i["email"], i["alias"], i["has_entered"]) for i in inv] == [("nova@test.local", "Nova", False), (STUDENT, "Aina", False)]
    assert inv[0]["invited_by"] == TUTOR
    # codi dictat: entra sense correu
    r = tutor.post("/api/admin/invitations/nova@test.local/code")
    assert r.status_code == 201 and len(r.json()["code"]) == 6
    c = TestClient(app)
    assert c.post("/api/auth/login", json={"email": "nova@test.local", "code": r.json()["code"]}).status_code == 200
    assert c.get("/api/me").json()["alias"] == "Nova"
    assert tutor.get("/api/admin/invitations").json()[0]["has_entered"] is True
    assert tutor.post("/api/admin/invitations/ningu@test.local/code").status_code == 404
    assert tutor.post("/api/admin/invitations", json={"email": "malament"}).status_code == 422
    assert tutor.delete("/api/admin/invitations/nova@test.local").status_code == 200
    assert [i["email"] for i in tutor.get("/api/admin/invitations").json()] == [STUDENT]


def test_users_list_sessions_and_delete(tutor, student):
    student.post("/api/attempts/batch", json={"attempts": [attempt()]})
    users = tutor.get("/api/admin/users").json()
    assert [(u["email"], u["role"], u["attempts"]) for u in users] == [(TUTOR, "tutor", 0), (STUDENT, "student", 1)]
    sid = next(u["id"] for u in users if u["email"] == STUDENT)
    assert users[1]["last_attempt"].startswith("2026-11-06T09:00:00")
    ses = tutor.get(f"/api/admin/users/{sid}/sessions").json()
    assert len(ses) == 1
    assert tutor.delete(f"/api/admin/users/{sid}/sessions/{ses[0]['id']}").status_code == 200
    assert student.get("/api/me").status_code == 401
    assert tutor.get("/api/admin/users/999/sessions").status_code == 404
    tid = next(u["id"] for u in users if u["email"] == TUTOR)
    assert tutor.delete(f"/api/admin/users/{tid}").json()["error"] == "not_yourself"
    assert tutor.delete(f"/api/admin/users/{sid}").status_code == 200
    assert tutor.get(f"/api/attempts?user_id={sid}").status_code == 404
    assert len(tutor.get("/api/admin/users").json()) == 1
