import pytest
from sqlalchemy import select

from app.errors import APIError
from app.models.user import User
from app.pagination import PageParams, apply_sort, paginate


def test_apply_sort_ascending_and_descending():
    allowed = {"sub": User.cognito_sub}
    asc = str(apply_sort(select(User), "sub", allowed).compile())
    desc = str(apply_sort(select(User), "-sub", allowed).compile())
    assert "cognito_sub ASC" in asc
    assert "cognito_sub DESC" in desc


def test_apply_sort_rejects_unknown_field():
    with pytest.raises(APIError) as exc:
        apply_sort(select(User), "whatever", {"sub": User.cognito_sub})
    assert exc.value.status_code == 422
    assert exc.value.code == "invalid_sort"


def test_paginate_returns_page_and_total(session):
    for i in range(7):
        session.add(User(cognito_sub=f"pg-{i:02d}"))
    session.flush()

    stmt = (
        select(User)
        .where(User.cognito_sub.like("pg-%"))
        .order_by(User.cognito_sub)
    )
    rows, total = paginate(session, stmt, PageParams(limit=3, offset=2))

    assert total == 7
    assert [u.cognito_sub for u in rows] == ["pg-02", "pg-03", "pg-04"]
