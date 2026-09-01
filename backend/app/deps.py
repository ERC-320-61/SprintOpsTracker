from dataclasses import dataclass
from typing import Callable, Iterator

from fastapi import Depends, Path
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.authz import can
from app.core.db import SessionLocal
from app.errors import APIError
from app.models.project import PROJECT_KEY_PATTERN, Project
from app.models.project_membership import ProjectMembership
from app.models.task import Task
from app.models.user import User

TASK_KEY_PATTERN = r"^[A-Z][A-Z0-9]{1,9}-[1-9][0-9]*$"


def get_db() -> Iterator[Session]:
    """One session and one transaction per request: commit on success, roll back
    on any exception."""
    with SessionLocal.begin() as session:
        yield session


def get_current_user() -> User:
    """Authentication boundary. Cognito JWT verification and JIT provisioning are
    not implemented yet; tests override this dependency. There is intentionally no
    permissive fallback."""
    raise APIError(
        501,
        "auth_not_configured",
        "Authentication is not configured in this build.",
    )


@dataclass(frozen=True)
class ProjectContext:
    project: Project
    membership: ProjectMembership
    role: str


@dataclass(frozen=True)
class TaskContext(ProjectContext):
    task: Task


def _not_found() -> APIError:
    return APIError(404, "not_found", "Resource not found.")


def get_project_context(
    project_key: str = Path(pattern=PROJECT_KEY_PATTERN),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectContext:
    """Load the project and the caller's membership. Missing project and
    non-membership are indistinguishable — both raise 404."""
    row = db.execute(
        select(Project, ProjectMembership)
        .join(
            ProjectMembership,
            (ProjectMembership.project_id == Project.id)
            & (ProjectMembership.user_id == user.id),
        )
        .where(Project.key == project_key)
    ).first()
    if row is None:
        raise _not_found()
    project, membership = row
    return ProjectContext(project=project, membership=membership, role=membership.role)


def get_task_context(
    project_key: str = Path(pattern=PROJECT_KEY_PATTERN),
    task_key: str = Path(pattern=TASK_KEY_PATTERN),
    ctx: ProjectContext = Depends(get_project_context),
    db: Session = Depends(get_db),
) -> TaskContext:
    prefix, _, number = task_key.partition("-")
    if prefix != project_key:
        raise _not_found()
    task = db.scalars(
        select(Task).where(Task.project_id == ctx.project.id, Task.number == int(number))
    ).first()
    if task is None:
        raise _not_found()
    return TaskContext(
        project=ctx.project, membership=ctx.membership, role=ctx.role, task=task
    )


def require_capability(capability: str) -> Callable[[ProjectContext], ProjectContext]:
    """Route dependency: pass the project context through if the caller's role
    grants `capability`, else 403."""

    def dependency(ctx: ProjectContext = Depends(get_project_context)) -> ProjectContext:
        if not can(ctx.role, capability):
            raise APIError(
                403,
                "forbidden",
                "Your project role does not permit this action.",
            )
        return ctx

    return dependency
