import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    SmallInteger,
    Text,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin
from app.models.constants import TASK_STATUSES, sql_in_list


class Task(TimestampMixin, Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    # Ownership + authorization anchor. Required even for Backlog tasks.
    project_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)

    # Project-scoped sequential number; the display key is project.key || '-' || number.
    number: Mapped[int] = mapped_column(Integer, nullable=False)

    # NULL => the task is in the Backlog (a derived state, not a status).
    sprint_id: Mapped[uuid.UUID | None] = mapped_column(Uuid)

    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        Text, nullable=False, default="TODO", server_default=text("'TODO'")
    )
    priority: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, default=3, server_default=text("3")
    )
    # NULL => unestimated.
    story_points: Mapped[int | None] = mapped_column(SmallInteger)

    # Part of the (project_id, assignee_id) composite FK to project_memberships.
    assignee_id: Mapped[uuid.UUID | None] = mapped_column(Uuid)

    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT", name="fk_tasks_created_by"),
        nullable=False,
    )
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        ForeignKeyConstraint(
            ["project_id"],
            ["projects.id"],
            ondelete="RESTRICT",
            name="fk_tasks_project",
        ),
        # Sprint (when set) must belong to the same project. MATCH SIMPLE (the
        # default) skips the check when sprint_id IS NULL.
        ForeignKeyConstraint(
            ["project_id", "sprint_id"],
            ["sprints.project_id", "sprints.id"],
            ondelete="RESTRICT",
            name="fk_tasks_sprint_same_project",
        ),
        # Assignee (when set) must be a current member of the task's project.
        # MATCH SIMPLE skips the check when assignee_id IS NULL.
        ForeignKeyConstraint(
            ["project_id", "assignee_id"],
            ["project_memberships.project_id", "project_memberships.user_id"],
            ondelete="RESTRICT",
            name="fk_tasks_assignee_is_member",
        ),
        UniqueConstraint("project_id", "number", name="uq_tasks_project_number"),
        CheckConstraint("number > 0", name="ck_tasks_number"),
        CheckConstraint(sql_in_list("status", TASK_STATUSES), name="ck_tasks_status"),
        CheckConstraint("priority BETWEEN 1 AND 5", name="ck_tasks_priority"),
        CheckConstraint(
            "story_points IS NULL OR story_points > 0", name="ck_tasks_points"
        ),
        CheckConstraint(
            "char_length(title) BETWEEN 1 AND 200", name="ck_tasks_title_len"
        ),
        Index("ix_tasks_project_status", "project_id", "status"),
        Index(
            "ix_tasks_sprint",
            "sprint_id",
            postgresql_where=text("sprint_id IS NOT NULL"),
        ),
        Index(
            "ix_tasks_backlog",
            "project_id",
            postgresql_where=text("sprint_id IS NULL"),
        ),
        Index(
            "ix_tasks_assignee",
            "assignee_id",
            postgresql_where=text("assignee_id IS NOT NULL"),
        ),
    )
