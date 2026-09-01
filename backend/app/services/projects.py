import uuid

from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.project_membership import ProjectMembership
from app.services.activity import record_event


def create_project(
    session: Session,
    *,
    key: str,
    name: str,
    created_by: uuid.UUID,
    description: str | None = None,
) -> Project:
    """Create a Project together with its creator's OWNER membership.

    Both rows plus the PROJECT_CREATED and MEMBER_ADDED activity events are added
    to the session in a single unit of work, so a Project can never exist without
    exactly one OWNER. The caller commits.
    """
    project = Project(
        key=key,
        name=name,
        description=description,
        created_by=created_by,
    )
    session.add(project)
    session.flush()  # assign project.id

    session.add(
        ProjectMembership(
            project_id=project.id,
            user_id=created_by,
            role="OWNER",
        )
    )

    record_event(
        session,
        project_id=project.id,
        actor_user_id=created_by,
        entity_type="PROJECT",
        entity_id=project.id,
        event_type="PROJECT_CREATED",
        payload={"key": key, "name": name},
    )
    record_event(
        session,
        project_id=project.id,
        actor_user_id=created_by,
        entity_type="PROJECT_MEMBERSHIP",
        entity_id=created_by,
        event_type="MEMBER_ADDED",
        payload={"role": "OWNER"},
    )
    return project
