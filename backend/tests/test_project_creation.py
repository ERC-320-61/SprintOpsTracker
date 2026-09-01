import uuid

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models.activity_event import ActivityEvent
from app.models.project import Project
from app.models.project_membership import ProjectMembership
from app.services.projects import create_project
from tests.conftest import make_user


def test_create_project_makes_owner_membership_and_events(session):
    owner = make_user(session)
    project = create_project(
        session, key="SOT", name="SprintOps", created_by=owner.id, description="d"
    )
    session.flush()

    membership = session.get(ProjectMembership, {"project_id": project.id, "user_id": owner.id})
    assert membership is not None
    assert membership.role == "OWNER"
    assert project.created_by == owner.id

    events = session.scalars(
        select(ActivityEvent).where(ActivityEvent.project_id == project.id)
    ).all()
    kinds = {e.event_type for e in events}
    assert kinds == {"PROJECT_CREATED", "MEMBER_ADDED"}
    member_event = next(e for e in events if e.event_type == "MEMBER_ADDED")
    assert member_event.entity_type == "PROJECT_MEMBERSHIP"
    assert member_event.entity_id == owner.id
    assert member_event.payload == {"role": "OWNER"}


def test_second_owner_rejected(session):
    owner = make_user(session)
    project = create_project(session, key="SOT", name="p", created_by=owner.id)
    session.flush()

    other = make_user(session)
    session.add(ProjectMembership(project_id=project.id, user_id=other.id, role="OWNER"))
    with pytest.raises(IntegrityError, match="uq_project_one_owner"):
        session.flush()


def test_create_project_is_atomic(session):
    """A bad created_by fails the whole unit of work — no orphan Project row."""
    ghost = uuid.uuid4()
    with pytest.raises(IntegrityError):
        create_project(session, key="SOT", name="p", created_by=ghost)

    session.rollback()
    assert session.scalar(select(Project).where(Project.key == "SOT")) is None
