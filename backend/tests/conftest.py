import os
import uuid
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

from app.models.user import User

BACKEND_DIR = Path(__file__).resolve().parent.parent
ALEMBIC_INI = BACKEND_DIR / "alembic.ini"

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:55432/sot_test",
)

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
    os.environ["DATABASE_URL"] = TEST_DATABASE_URL
    command.upgrade(_alembic_config(), "head")
    eng = create_engine(TEST_DATABASE_URL, future=True)
    # Start from a clean slate regardless of what a previous run or a seed left.
    with eng.begin() as conn:
        conn.execute(text(f"TRUNCATE {', '.join(ALL_TABLES)} CASCADE"))
    yield eng
    eng.dispose()


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
