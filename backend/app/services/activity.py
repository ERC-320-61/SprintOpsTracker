import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.models.activity_event import ActivityEvent


def record_event(
    session: Session,
    *,
    project_id: uuid.UUID,
    entity_type: str,
    entity_id: uuid.UUID,
    event_type: str,
    actor_user_id: uuid.UUID | None = None,
    payload: dict[str, Any] | None = None,
) -> ActivityEvent:
    """Add one activity event to the session.

    The caller owns the transaction, so the event is committed together with the
    state change it describes (or rolled back with it).
    """
    activity_event = ActivityEvent(
        project_id=project_id,
        actor_user_id=actor_user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        event_type=event_type,
        payload=payload,
    )
    session.add(activity_event)
    return activity_event
