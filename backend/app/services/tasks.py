import uuid

from sqlalchemy import update
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.task import Task
from app.services.activity import record_event


def _next_task_number(session: Session, project_id: uuid.UUID) -> int:
    """Atomically allocate the next project-scoped task number.

    `UPDATE ... RETURNING` takes a row lock on the project for the rest of the
    transaction, so concurrent task creation for one project is serialised.
    Numbers are monotonic, never reused; gaps (from rolled-back creates or
    deleted tasks) are acceptable.
    """
    stmt = (
        update(Project)
        .where(Project.id == project_id)
        .values(task_sequence=Project.task_sequence + 1)
        .returning(Project.task_sequence)
    )
    number = session.execute(stmt).scalar_one()
    return number


def create_task(
    session: Session,
    *,
    project_id: uuid.UUID,
    title: str,
    created_by: uuid.UUID,
    story_points: int,
    description: str | None = None,
    priority: int = 3,
    sprint_id: uuid.UUID | None = None,
    assignee_id: uuid.UUID | None = None,
) -> Task:
    """Create a Task, allocating its number and recording TASK_CREATED. Caller commits."""
    number = _next_task_number(session, project_id)
    task = Task(
        project_id=project_id,
        number=number,
        title=title,
        description=description,
        priority=priority,
        story_points=story_points,
        sprint_id=sprint_id,
        assignee_id=assignee_id,
        created_by=created_by,
    )
    session.add(task)
    session.flush()  # assign task.id

    record_event(
        session,
        project_id=project_id,
        actor_user_id=created_by,
        entity_type="TASK",
        entity_id=task.id,
        event_type="TASK_CREATED",
        payload={"number": number, "status": task.status},
    )
    return task
