from dataclasses import dataclass
from typing import Any, Generic, Sequence, TypeVar

from fastapi import Query
from pydantic import BaseModel
from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.errors import APIError

T = TypeVar("T")


@dataclass(frozen=True)
class PageParams:
    limit: int = 50
    offset: int = 0


def page_params(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> PageParams:
    return PageParams(limit=limit, offset=offset)


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    limit: int
    offset: int


def paginate(
    session: Session, stmt: Select, params: PageParams
) -> tuple[Sequence[Any], int]:
    """Return one page of rows plus the unpaginated total."""
    total = session.scalar(
        select(func.count()).select_from(stmt.order_by(None).subquery())
    )
    rows = session.scalars(stmt.limit(params.limit).offset(params.offset)).all()
    return rows, total or 0


def apply_sort(stmt: Select, sort: str, allowed: dict[str, Any]) -> Select:
    """Apply `sort=field` / `sort=-field`. `allowed` maps a public field name to
    its ORM column; an unknown name is a 422."""
    descending = sort.startswith("-")
    field = sort[1:] if descending else sort
    column = allowed.get(field)
    if column is None:
        raise APIError(422, "invalid_sort", f"Cannot sort by {field!r}.")
    return stmt.order_by(column.desc() if descending else column.asc())
