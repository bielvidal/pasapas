"""Textos editables: el tutor desa i aprova; l'alumna només rep els aprovats."""
from tests.conftest import STUDENT, login
from fastapi.testclient import TestClient
from pasapas.api import app


def test_tutor_edits_and_student_sees_only_approved(tutor, student):
    k = "tag:B5_CANCELA_TERME:nom"
    r = tutor.put(f"/api/admin/content/overrides/{k}", json={"text": "Tatxar un terme", "state": "esborrany"})
    assert r.status_code == 200 and r.json()["state"] == "esborrany"
    assert [o["key"] for o in tutor.get("/api/content/overrides").json()["overrides"]] == [k]
    assert student.get("/api/content/overrides").json()["overrides"] == []
    tutor.put(f"/api/admin/content/overrides/{k}", json={"text": "Tatxar un terme que suma", "state": "aprovat"})
    got = student.get("/api/content/overrides").json()["overrides"]
    assert [(o["key"], o["text"]) for o in got] == [(k, "Tatxar un terme que suma")]
    assert tutor.delete(f"/api/admin/content/overrides/{k}").status_code == 200
    assert tutor.get("/api/content/overrides").json()["overrides"] == []


def test_validation_and_permissions(tutor, student, client):
    assert student.put("/api/admin/content/overrides/tag:X:nom", json={"text": "x"}).status_code == 403
    assert client.get("/api/content/overrides").status_code == 401
    assert tutor.put("/api/admin/content/overrides/clau rara", json={"text": "x"}).status_code == 422
    assert tutor.put("/api/admin/content/overrides/tag:X:nom", json={"text": "x", "state": "publicat"}).status_code == 422
    assert tutor.put("/api/admin/content/overrides/tag:X:nom", json={"text": ""}).status_code == 422
