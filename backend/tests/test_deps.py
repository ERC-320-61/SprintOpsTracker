import uuid

import pytest
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.deps import (
    ProjectContext,
    TaskContext,
    get_current_user,
    get_db,
    get_project_context,
    get_task_context,
)
from app.errors import APIError
from app.models.user import User
from app.services.projects import create_project
from tests.conftest import make_task, make_user


def test_get_db_commits_on_success(engine):
    marker = f"getdb-ok-{uuid.uuid4()}"
    gen = get_db()
    next(gen).add(User(cognito_sub=marker))
    with pytest.raises(StopIteration):
        next(gen)

    with Session(engine) as check:
        assert check.scalar(select(User).where(User.cognito_sub == marker))
        check.execute(User.__table__.delete().where(User.cognito_sub == marker))
        check.commit()


def test_get_db_rolls_back_on_exception(engine):
    marker = f"getdb-fail-{uuid.uuid4()}"
    gen = get_db()
    next(gen).add(User(cognito_sub=marker))
    with pytest.raises(RuntimeError):
        gen.throw(RuntimeError("boom"))

    with Session(engine) as check:
        assert check.scalar(select(User).where(User.cognito_sub == marker)) is None


def test_get_current_user_is_an_unimplemented_boundary():
    with pytest.raises(APIError) as exc:
        get_current_user()
    assert exc.value.status_code == 501
    assert exc.value.code == "auth_not_configured"


def test_project_context_for_a_member(session):
    user = make_user(session)
    project = create_project(session, key="SOT", name="p", created_by=user.id)
    session.flush()

    ctx = get_project_context(project_key="SOT", user=user, db=session)
    assert isinstance(ctx, ProjectContext)
    assert ctx.project.id == project.id
    assert ctx.role == "OWNER"


def test_project_context_hides_the_project_from_a_non_member(session):
    owner = make_user(session)
    create_project(session, key="SOT", name="p", created_by=owner.id)
    outsider = make_user(session)
    session.flush()

    with pytest.raises(APIError) as exc:
        get_project_context(project_key="SOT", user=outsider, db=session)
    assert exc.value.status_code == 404
    assert exc.value.code == "not_found"


def test_project_context_missing_project_is_404(session):
    user = make_user(session)
    session.flush()
    with pytest.raises(APIError) as exc:
        get_project_context(project_key="NOPE", user=user, db=session)
    assert exc.value.status_code == 404


def _pctx(session, user, key="SOT"):
    return get_project_context(project_key=key, user=user, db=session)


def test_task_context_happy_path(session):
    user = make_user(session)
    project = create_project(session, key="SOT", name="p", created_by=user.id)
    session.flush()
    task = make_task(session, project_id=project.id, title="t", created_by=user.id)
    session.flush()

    ctx = get_task_context(
        project_key="SOT",
        task_key=f"SOT-{task.number}",
        ctx=_pctx(session, user),
        db=session,
    )
    assert isinstance(ctx, TaskContext)
    assert ctx.task.id == task.id
    assert ctx.role == "OWNER"


def test_task_context_prefix_mismatch_is_404(session):
    user = make_user(session)
    create_project(session, key="SOT", name="p", created_by=user.id)
    session.flush()
    with pytest.raises(APIError) as exc:
        get_task_context(
            project_key="SOT", task_key="FG-1", ctx=_pctx(session, user), db=session
        )
    assert exc.value.status_code == 404


def test_task_context_unknown_number_is_404(session):
    user = make_user(session)
    create_project(session, key="SOT", name="p", created_by=user.id)
    session.flush()
    with pytest.raises(APIError) as exc:
        get_task_context(
            project_key="SOT", task_key="SOT-999", ctx=_pctx(session, user), db=session
        )
    assert exc.value.status_code == 404
