from fastapi.testclient import TestClient

from app.api import api_router
from app.main import app


def test_health_returns_ok():
    resp = TestClient(app).get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_app_boots_and_v1_router_is_mounted():
    assert api_router.prefix == "/api/v1"
    # unknown versioned path routes through the app and 404s
    assert TestClient(app).get("/api/v1/does-not-exist").status_code == 404
    assert TestClient(app).get("/openapi.json").status_code == 200
