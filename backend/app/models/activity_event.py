import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Index, Text, Uuid, event, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, utcnow


class ActivityEvent(Base):
    """Append-only record of material V0.1 state changes.

    Not a `TimestampMixin` subclass: rows are immutable, so there is only
    `created_at`. Updates and deletes are blocked by the listeners below.
    """

    __tablename__ = "activity_events"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)

    # The security scope of the event.
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey(
            "projects.id", ondelete="RESTRICT", name="fk_activity_events_project"
        ),
        nullable=False,
    )
    # NULL => system-generated.
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT", name="fk_activity_events_actor")
    )

    entity_type: Mapped[str] = mapped_column(Text, nullable=False)
    # Polymorphic reference (project / sprint / task id, or a member's user id).
    # Intentionally not a foreign key.
    entity_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    event_type: Mapped[str] = mapped_column(Text, nullable=False)
    payload: Mapped[dict[str, Any] | None] = mapped_column(JSONB)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        server_default=text("now()"),
    )

    __table_args__ = (
        Index("ix_activity_events_project_created", "project_id", "created_at"),
        Index("ix_activity_events_entity", "entity_type", "entity_id", "created_at"),
    )


class AppendOnlyError(RuntimeError):
    """Raised on any attempt to update or delete an activity_events row."""


@event.listens_for(ActivityEvent, "before_update", propagate=True)
def _block_update(mapper, connection, target):  # noqa: ARG001
    raise AppendOnlyError("activity_events rows are immutable")


@event.listens_for(ActivityEvent, "before_delete", propagate=True)
def _block_delete(mapper, connection, target):  # noqa: ARG001
    raise AppendOnlyError("activity_events rows cannot be deleted")
