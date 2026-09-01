"""Closed value vocabularies for the V0.1 schema.

The first three are enforced by PostgreSQL `CHECK` constraints (see the models).
The activity vocabularies are validated only in application code so new event
types can be added without a migration.
"""

PROJECT_ROLES = ("OWNER", "MANAGER", "WRITER_WORKFLOW", "WRITER", "READER")

TASK_STATUSES = ("TODO", "IN_PROGRESS", "BLOCKED", "DONE")

SPRINT_STATUSES = ("PLANNED", "ACTIVE", "CLOSED")

ACTIVITY_ENTITY_TYPES = ("PROJECT", "PROJECT_MEMBERSHIP", "SPRINT", "TASK")

ACTIVITY_EVENT_TYPES = (
    "PROJECT_CREATED",
    "PROJECT_ARCHIVED",
    "MEMBER_ADDED",
    "MEMBER_REMOVED",
    "MEMBER_ROLE_CHANGED",
    "SPRINT_CREATED",
    "SPRINT_ACTIVATED",
    "SPRINT_CLOSED",
    "TASK_CREATED",
    "TASK_STATUS_CHANGED",
    "TASK_SPRINT_CHANGED",
    "TASK_ASSIGNEE_CHANGED",
)


def sql_in_list(column: str, values: tuple[str, ...]) -> str:
    """Render `column IN ('A', 'B', ...)` for a CHECK constraint. Values are
    trusted internal identifiers."""
    rendered = ", ".join(f"'{value}'" for value in values)
    return f"{column} IN ({rendered})"
