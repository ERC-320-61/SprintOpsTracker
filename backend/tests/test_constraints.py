"""PostgreSQL-enforced integrity rules for the V0.1 schema."""
import uuid

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.project import Project
from app.models.project_membership import ProjectMembership
from app.models.sprint import Sprint
from app.models.task import Task
from app.services.projects import create_project
from app.services.tasks import create_task
from tests.conftest import make_user


def _project(session, *, key="SOT", name="SprintOps"):
    owner = make_user(session)
    project = create_project(session, key=key, name=name, created_by=owner.id)
    session.flush()
    return project, owner


# --- CHECK constraints -------------------------------------------------------

def test_task_status_check_rejects_unknown_value(session):
    project, owner = _project(session)
    task = create_task(session, project_id=project.id, title="x", created_by=owner.id)
    task.status = "ARCHIVED"
    with pytest.raises(IntegrityError, match="ck_tasks_status"):
        session.flush()


@pytest.mark.parametrize("bad_priority", [0, 6, -1, 100])
def test_task_priority_must_be_1_to_5(session, bad_priority):
    project, owner = _project(session)
    task = create_task(session, project_id=project.id, title="x", created_by=owner.id)
    task.priority = bad_priority
    with pytest.raises(IntegrityError, match="ck_tasks_priority"):
        session.flush()


def test_task_story_points_positive_or_null(session):
    project, owner = _project(session)
    ok = create_task(
        session, project_id=project.id, title="ok", created_by=owner.id, story_points=None
    )
    session.flush()
    assert ok.story_points is None

    bad = create_task(session, project_id=project.id, title="bad", created_by=owner.id)
    bad.story_points = 0
    with pytest.raises(IntegrityError, match="ck_tasks_points"):
        session.flush()


def test_membership_role_check(session):
    project, owner = _project(session)
    other = make_user(session)
    session.add(ProjectMembership(project_id=project.id, user_id=other.id, role="ADMIN"))
    with pytest.raises(IntegrityError, match="ck_project_memberships_role"):
        session.flush()


def test_sprint_status_check(session):
    project, owner = _project(session)
    session.add(Sprint(project_id=project.id, name="S1", status="DONE"))
    with pytest.raises(IntegrityError, match="ck_sprints_status"):
        session.flush()


# --- project key -----------------------------------------------------------

@pytest.mark.parametrize("bad_key", ["sot", "1SOT", "S", "SOT-1", "TOOLONGKEYXX", "S_T"])
def test_project_key_format_rejected(session, bad_key):
    owner = make_user(session)
    session.add(Project(key=bad_key, name="p", created_by=owner.id))
    with pytest.raises(IntegrityError, match="ck_projects_key_fmt"):
        session.flush()


@pytest.mark.parametrize("good_key", ["SO", "SOT", "FG", "ABC123", "A9", "ZZZZZZZZZZ"])
def test_project_key_format_accepted(session, good_key):
    owner = make_user(session)
    session.add(Project(key=good_key, name="p", created_by=owner.id))
    session.flush()


def test_project_key_globally_unique(session):
    a = make_user(session)
    b = make_user(session)
    session.add(Project(key="DUP", name="a", created_by=a.id))
    session.flush()
    session.add(Project(key="DUP", name="b", created_by=b.id))
    with pytest.raises(IntegrityError, match="uq_projects_key"):
        session.flush()


# --- sprints --------------------------------------------------------------

def test_one_active_sprint_per_project(session):
    project, _ = _project(session)
    session.add(Sprint(project_id=project.id, name="S1", status="ACTIVE"))
    session.flush()
    session.add(Sprint(project_id=project.id, name="S2", status="ACTIVE"))
    with pytest.raises(IntegrityError, match="uq_sprints_one_active"):
        session.flush()


def test_active_sprint_allowed_in_different_projects(session):
    p1, _ = _project(session, key="AAA")
    p2, _ = _project(session, key="BBB")
    session.add(Sprint(project_id=p1.id, name="S", status="ACTIVE"))
    session.add(Sprint(project_id=p2.id, name="S", status="ACTIVE"))
    session.flush()


def test_planned_and_active_sprint_coexist(session):
    project, _ = _project(session)
    session.add(Sprint(project_id=project.id, name="active", status="ACTIVE"))
    session.add(Sprint(project_id=project.id, name="planned", status="PLANNED"))
    session.flush()


# --- cross-project integrity --------------------------------------------

def test_task_cannot_reference_sprint_from_another_project(session):
    p1, o1 = _project(session, key="AAA")
    p2, _ = _project(session, key="BBB")
    foreign_sprint = Sprint(project_id=p2.id, name="S")
    session.add(foreign_sprint)
    session.flush()

    task = create_task(session, project_id=p1.id, title="x", created_by=o1.id)
    task.sprint_id = foreign_sprint.id
    with pytest.raises(IntegrityError, match="fk_tasks_sprint_same_project"):
        session.flush()


def test_task_can_reference_sprint_in_same_project(session):
    project, owner = _project(session)
    sprint = Sprint(project_id=project.id, name="S")
    session.add(sprint)
    session.flush()
    task = create_task(
        session, project_id=project.id, title="x", created_by=owner.id, sprint_id=sprint.id
    )
    session.flush()
    assert task.sprint_id == sprint.id


def test_assignee_must_be_member_of_the_tasks_project(session):
    p1, o1 = _project(session, key="AAA")
    p2, o2 = _project(session, key="BBB")  # o2 is a member of p2 only

    task = create_task(session, project_id=p1.id, title="x", created_by=o1.id)
    task.assignee_id = o2.id
    with pytest.raises(IntegrityError, match="fk_tasks_assignee_is_member"):
        session.flush()


def test_assignee_cannot_be_a_non_member(session):
    project, owner = _project(session)
    outsider = make_user(session)
    task = create_task(session, project_id=project.id, title="x", created_by=owner.id)
    task.assignee_id = outsider.id
    with pytest.raises(IntegrityError, match="fk_tasks_assignee_is_member"):
        session.flush()


def test_assignee_who_is_a_member_is_accepted(session):
    project, owner = _project(session)
    member = make_user(session)
    session.add(ProjectMembership(project_id=project.id, user_id=member.id, role="WRITER"))
    session.flush()
    task = create_task(
        session, project_id=project.id, title="x", created_by=owner.id, assignee_id=member.id
    )
    session.flush()
    assert task.assignee_id == member.id


# --- ON DELETE RESTRICT --------------------------------------------------

def test_member_removal_blocked_while_task_assigned(session):
    project, owner = _project(session)
    member = make_user(session)
    membership = ProjectMembership(project_id=project.id, user_id=member.id, role="WRITER")
    session.add(membership)
    session.flush()
    create_task(
        session, project_id=project.id, title="x", created_by=owner.id, assignee_id=member.id
    )
    session.flush()

    session.delete(membership)
    with pytest.raises(IntegrityError, match="fk_tasks_assignee_is_member"):
        session.flush()


def test_sprint_deletion_blocked_when_it_has_tasks(session):
    project, owner = _project(session)
    sprint = Sprint(project_id=project.id, name="S")
    session.add(sprint)
    session.flush()
    create_task(
        session, project_id=project.id, title="x", created_by=owner.id, sprint_id=sprint.id
    )
    session.flush()

    session.delete(sprint)
    with pytest.raises(IntegrityError, match="fk_tasks_sprint_same_project"):
        session.flush()


def test_empty_sprint_can_be_deleted(session):
    project, _ = _project(session)
    sprint = Sprint(project_id=project.id, name="S", status="PLANNED")
    session.add(sprint)
    session.flush()
    session.delete(sprint)
    session.flush()  # no error


def test_project_hard_delete_blocked_by_activity_events(session):
    project, _ = _project(session)  # create_project already wrote PROJECT_CREATED
    session.flush()
    # Drop the OWNER membership so the only remaining references are the events.
    session.execute(
        ProjectMembership.__table__.delete().where(
            ProjectMembership.project_id == project.id
        )
    )
    session.flush()
    with pytest.raises(IntegrityError, match="fk_activity_events_project"):
        session.execute(Project.__table__.delete().where(Project.id == project.id))
        session.flush()


# --- backlog ------------------------------------------------------------

def test_task_with_no_sprint_is_allowed(session):
    project, owner = _project(session)
    task = create_task(session, project_id=project.id, title="backlog item", created_by=owner.id)
    session.flush()
    assert task.sprint_id is None


def test_changing_sprint_does_not_touch_status(session):
    """T4/T5 is application behaviour — this documents that create_task/assignment
    leave status alone and nothing in the schema forces a change."""
    project, owner = _project(session)
    sprint = Sprint(project_id=project.id, name="S")
    session.add(sprint)
    session.flush()

    task = create_task(session, project_id=project.id, title="x", created_by=owner.id)
    task.status = "IN_PROGRESS"
    session.flush()

    task.sprint_id = sprint.id
    session.flush()
    assert task.status == "IN_PROGRESS"

    task.sprint_id = None
    session.flush()
    assert task.status == "IN_PROGRESS"
