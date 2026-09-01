import os
import uuid
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
ALEMBIC_INI = BACKEND_DIR / "alembic.ini"

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:55432/sot_test",
)
# Point the application at the test database *before* importing anything under
# `app` (settings and the engine are created at import time).
os.environ["DATABASE_URL"] = TEST_DATABASE_URL

import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from sqlalchemy import text  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.core.db import engine as app_engine  # noqa: E402
from app.models.user import User  # noqa: E402
from app.services.tasks import create_task  # noqa: E402

# Child-first order for TRUNCATE ... CASCADE.
ALL_TABLES = (
    "activity_events",
    "tasks",
    "sprints",
    "project_memberships",
    "projects",
    "users",
)


def _alembic_config() -> Config:
    cfg = Config(str(ALEMBIC_INI))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    cfg.set_main_option("sqlalchemy.url", TEST_DATABASE_URL)
    return cfg


@pytest.fixture(scope="session")
def engine():
    command.upgrade(_alembic_config(), "head")
    with app_engine.begin() as conn:
        conn.execute(text(f"TRUNCATE {', '.join(ALL_TABLES)} CASCADE"))
    return app_engine


@pytest.fixture
def session(engine):
    """Transaction-per-test isolation: everything rolls back afterwards.

    ``join_transaction_mode="create_savepoint"`` lets a test call
    ``session.commit()`` (it commits to a savepoint) while the outer transaction
    still rolls the whole test back.
    """
    connection = engine.connect()
    outer = connection.begin()
    sess = Session(
        bind=connection,
        join_transaction_mode="create_savepoint",
        expire_on_commit=False,
    )
    try:
        yield sess
    finally:
        sess.close()
        outer.rollback()
        connection.close()


@pytest.fixture
def clean_db(engine):
    """For tests that must really commit. Wipes every table before and after."""

    def _truncate():
        with engine.begin() as conn:
            conn.execute(text(f"TRUNCATE {', '.join(ALL_TABLES)} CASCADE"))

    _truncate()
    yield
    _truncate()


def make_user(session: Session, *, sub: str | None = None, email: str | None = None) -> User:
    user = User(cognito_sub=sub or f"sub-{uuid.uuid4()}", email=email)
    session.add(user)
    session.flush()
    return user


def make_task(session: Session, **kwargs):
    """`create_task` with a default estimate, for tests that don't care about it."""
    kwargs.setdefault("story_points", 1)
    return create_task(session, **kwargs)
