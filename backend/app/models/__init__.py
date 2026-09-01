"""SQLAlchemy models. Importing this package registers every table on
``Base.metadata`` (used by Alembic autogenerate and the tests)."""

from app.models.base import Base
from app.models.activity_event import ActivityEvent
from app.models.project import Project
from app.models.project_membership import ProjectMembership
from app.models.sprint import Sprint
from app.models.task import Task
from app.models.user import User

__all__ = [
    "Base",
    "ActivityEvent",
    "Project",
    "ProjectMembership",
    "Sprint",
    "Task",
    "User",
]
