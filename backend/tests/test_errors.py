import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.errors import APIError, register_error_handlers
from app.pagination import PageParams, page_params


@pytest.fixture
def mini_app() -> FastAPI:
    a = FastAPI()
    register_error_handlers(a)

    @a.get("/boom")
    def _boom():
        raise APIError(409, "sample_conflict", "not allowed")

    @a.get("/page")
    def _page(p: PageParams = Depends(page_params)):
        return {"limit": p.limit, "offset": p.offset}

    return a


def test_api_error_uses_the_envelope(mini_app):
    r = TestClient(mini_app).get("/boom")
    assert r.status_code == 409
    assert r.json() == {"error": {"code": "sample_conflict", "message": "not allowed"}}


def test_validation_error_uses_the_envelope(mini_app):
    r = TestClient(mini_app).get("/page", params={"limit": 101})
    assert r.status_code == 422
    err = r.json()["error"]
    assert err["code"] == "validation_error"
    assert any("limit" in f["loc"] for f in err["fields"])


def test_page_params_defaults_and_bounds(mini_app):
    c = TestClient(mini_app)
    assert c.get("/page").json() == {"limit": 50, "offset": 0}
    assert c.get("/page", params={"limit": 100}).status_code == 200
    assert c.get("/page", params={"limit": 0}).status_code == 422
    assert c.get("/page", params={"limit": 101}).status_code == 422
    assert c.get("/page", params={"offset": -1}).status_code == 422
