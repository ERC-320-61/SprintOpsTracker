import pytest
from sqlalchemy import func, select

from app.models.activity_event import ActivityEvent, AppendOnlyError
from app.services.projects import create_project
from app.services.tasks import create_task
from tests.conftest import make_user


def _event_count(session, project_id) -> int:
    return session.scalar(
        select(func.count()).select_from(ActivityEvent).where(
            ActivityEvent.project_id == project_id
        )
    )


def test_task_created_event_is_written_with_the_task(session):
    owner = make_user(session)
    project = create_project(session, key="SOT", name="p", created_by=owner.id)
    session.flush()
    base = _event_count(session, project.id)

    task = create_task(session, project_id=project.id, title="x", created_by=owner.id)
    session.flush()

    events = session.scalars(
        select(ActivityEvent).where(
            ActivityEvent.project_id == project.id,
            ActivityEvent.event_type == "TASK_CREATED",
        )
    ).all()
    assert len(events) == 1
    assert events[0].entity_type == "TASK"
    assert events[0].entity_id == task.id
    assert events[0].payload == {"number": task.number, "status": "TODO"}
    assert _event_count(session, project.id) == base + 1


def test_events_roll_back_with_their_change(session):
    owner = make_user(session)
    project = create_project(session, key="SOT", name="p", created_by=owner.id)
    session.flush()
    before = _event_count(session, project.id)

    savepoint = session.begin_nested()
    create_task(session, project_id=project.id, title="x", created_by=owner.id)
    session.flush()
    savepoint.rollback()

    assert _event_count(session, project.id) == before


def test_activity_event_cannot_be_updated(session):
    owner = make_user(session)
    project = create_project(session, key="SOT", name="p", created_by=owner.id)
    session.flush()
    event = session.scalars(
        select(ActivityEvent).where(ActivityEvent.project_id == project.id)
    ).first()

    event.event_type = "TAMPERED"
    with pytest.raises(AppendOnlyError):
        session.flush()


def test_activity_event_cannot_be_deleted(session):
    owner = make_user(session)
    project = create_project(session, key="SOT", name="p", created_by=owner.id)
    session.flush()
    event = session.scalars(
        select(ActivityEvent).where(ActivityEvent.project_id == project.id)
    ).first()

    session.delete(event)
    with pytest.raises(AppendOnlyError):
        session.flush()
