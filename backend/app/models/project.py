import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint,
    Uuid,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin

# Project key: uppercase, starts with a letter, 2-10 chars total. Immutable and
# globally unique; enforced here and in application logic.
PROJECT_KEY_PATTERN = r"^[A-Z][A-Z0-9]{1,9}$"


class Project(TimestampMixin, Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    key: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    # Immutable provenance. The current owner is the OWNER project_memberships row.
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT", name="fk_projects_created_by"),
        nullable=False,
    )

    # High-water mark for project-scoped task numbers. Monotonic, gaps allowed,
    # never decremented.
    task_sequence: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default=text("0")
    )

    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        UniqueConstraint("key", name="uq_projects_key"),
        CheckConstraint(f"key ~ '{PROJECT_KEY_PATTERN}'", name="ck_projects_key_fmt"),
        CheckConstraint(
            "char_length(name) BETWEEN 1 AND 120", name="ck_projects_name_len"
        ),
        CheckConstraint("task_sequence >= 0", name="ck_projects_task_seq"),
    )
