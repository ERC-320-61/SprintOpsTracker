import uuid
from datetime import date

from sqlalchemy import (
    CheckConstraint,
    Date,
    ForeignKey,
    Index,
    Text,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin
from app.models.constants import SPRINT_STATUSES, sql_in_list


class Sprint(TimestampMixin, Base):
    __tablename__ = "sprints"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="RESTRICT", name="fk_sprints_project"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(Text, nullable=False)
    goal: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        Text, nullable=False, default="PLANNED", server_default=text("'PLANNED'")
    )
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)

    __table_args__ = (
        # Target for the tasks (project_id, sprint_id) composite foreign key.
        UniqueConstraint("project_id", "id", name="uq_sprints_project_id"),
        CheckConstraint(
            sql_in_list("status", SPRINT_STATUSES), name="ck_sprints_status"
        ),
        CheckConstraint(
            "char_length(name) BETWEEN 1 AND 120", name="ck_sprints_name_len"
        ),
        CheckConstraint(
            "start_date IS NULL OR end_date IS NULL OR end_date >= start_date",
            name="ck_sprints_date_order",
        ),
        # At most one ACTIVE sprint per project.
        Index(
            "uq_sprints_one_active",
            "project_id",
            unique=True,
            postgresql_where=text("status = 'ACTIVE'"),
        ),
    )
