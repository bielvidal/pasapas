"""Lots idempotents d'intents i sessions; lectura incremental per cursor; permisos."""
from fastapi.testclient import TestClient

from pasapas.api import app
from tests.conftest import STUDENT, TUTOR, attempt, login


def test_batch_is_idempotent_and_typed(student, db):
    r = student.post("/api/attempts/batch", json={"attempts": [attempt(), attempt()]})
    assert r.status_code == 201 and r.json() == {"accepted": [attempt()["id"]], "ignored": []}
    r = student.post("/api/attempts/batch", json={"attempts": [attempt(outcome="correct")]})
    assert r.json()["accepted"] == [attempt()["id"]]  # ja hi era: no es reescriu
    got = student.get("/api/attempts").json()
    assert len(got["attempts"]) == 1 and got["more"] is False
    a = got["attempts"][0]
    assert a["outcome"] == "incorrect" and a["presentedErrorTags"] == ["B5_CANCELA_TERME", "B5_SIGNE"]
    assert a["clientCreatedAt"] == "2026-11-06T09:00:00+00:00" and a["seed"] == 123456789
    assert got["cursor"] == f'{a["receivedAt"]}|{a["id"]}'


def test_batch_validation(student):
    assert student.post("/api/attempts/batch", json={"attempts": [attempt(outcome="meh")]}).status_code == 422
    assert student.post("/api/attempts/batch", json={"attempts": [attempt(level=7)]}).status_code == 422
    assert student.post("/api/attempts/batch", json={"attempts": [attempt(clientCreatedAt="ahir")]}).status_code == 422
    assert student.post("/api/attempts/batch", json={"attempts": []}).json() == {"accepted": [], "ignored": []}


def test_batch_too_big(student, monkeypatch):
    from pasapas.routers import sync

    monkeypatch.setattr(sync.settings, "batch_max", 2)
    r = student.post("/api/attempts/batch", json={"attempts": [attempt(id=f"{i:08d}-0000-4000-8000-000000000000") for i in range(3)]})
    assert r.status_code == 413 and r.json()["error"] == "batch_too_big"


def test_someone_elses_id_is_ignored(student, tutor):
    assert student.post("/api/attempts/batch", json={"attempts": [attempt()]}).status_code == 201
    r = tutor.post("/api/attempts/batch", json={"attempts": [attempt()]})
    assert r.json() == {"accepted": [], "ignored": [attempt()["id"]]}
    assert tutor.get("/api/attempts").json()["attempts"] == []


def test_cursor_pagination(student):
    ids = [f"{i:08d}-0000-4000-8000-000000000000" for i in range(5)]
    student.post("/api/attempts/batch", json={"attempts": [attempt(id=i) for i in ids]})
    page = student.get("/api/attempts?limit=2").json()
    assert [a["id"] for a in page["attempts"]] == ids[:2] and page["more"] is True
    page2 = student.get(f"/api/attempts?limit=2&since={page['cursor']}").json()
    assert [a["id"] for a in page2["attempts"]] == ids[2:4] and page2["more"] is True
    rest = student.get(f"/api/attempts?since={page2['cursor']}").json()
    assert [a["id"] for a in rest["attempts"]] == ids[4:]
    seen = {a["id"] for a in page["attempts"]} | {a["id"] for a in page2["attempts"]} | {a["id"] for a in rest["attempts"]}
    assert seen == set(ids) and rest["more"] is False
    # cursor amb res de nou: es retorna el mateix cursor; `+` sense codificar (espai) també val
    assert student.get("/api/attempts", params={"since": rest["cursor"]}).json()["cursor"] == rest["cursor"]
    assert student.get(f"/api/attempts?since={rest['cursor']}").json()["cursor"] == rest["cursor"]
    assert student.get("/api/attempts?since=ahir").status_code == 422


def test_tutor_reads_student_attempts_but_not_the_other_way(student, tutor, db):
    student.post("/api/attempts/batch", json={"attempts": [attempt()]})
    sid = student.get("/api/me").json()["id"]
    tid = tutor.get("/api/me").json()["id"]
    assert len(tutor.get(f"/api/attempts?user_id={sid}").json()["attempts"]) == 1
    assert tutor.get("/api/attempts").json()["attempts"] == []
    r = student.get(f"/api/attempts?user_id={tid}")
    assert r.status_code == 403 and r.json()["error"] == "forbidden"
    assert student.get(f"/api/attempts?user_id={sid}").status_code == 200
    assert tutor.get("/api/attempts?user_id=999").status_code == 404


def test_sessions_batch_upsert(student):
    s = {"id": "22222222-2222-4222-8222-222222222222", "mode": "practica", "block": "B5",
         "startedAt": "2026-11-06T10:00:00+01:00", "endedAt": None}
    assert student.post("/api/sessions/batch", json={"sessions": [s]}).json() == {"accepted": [s["id"]]}
    s2 = {**s, "endedAt": "2026-11-06T10:12:00+01:00"}
    assert student.post("/api/sessions/batch", json={"sessions": [s2, s2]}).json() == {"accepted": [s["id"], s["id"]]}
    assert student.post("/api/sessions/batch", json={"sessions": [{**s, "mode": "volar"}]}).status_code == 422


def test_sync_requires_session(client):
    assert client.post("/api/attempts/batch", json={"attempts": []}).status_code == 401
    assert client.get("/api/attempts").status_code == 401
