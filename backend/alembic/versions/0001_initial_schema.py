"""initial schema — users, projects, project_memberships, sprints, tasks, activity_events

Revision ID: 0001
Revises:
Create Date: 2026-09-01
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

PROJECT_KEY_PATTERN = r"^[A-Z][A-Z0-9]{1,9}$"


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("cognito_sub", sa.Text(), nullable=False),
        sa.Column("email", sa.Text(), nullable=True),
        sa.Column("display_name", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("cognito_sub", name="uq_users_cognito_sub"),
    )

    op.create_table(
        "projects",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("key", sa.Text(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_by", sa.Uuid(), nullable=False),
        sa.Column("task_sequence", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["created_by"], ["users.id"], ondelete="RESTRICT", name="fk_projects_created_by"
        ),
        sa.UniqueConstraint("key", name="uq_projects_key"),
        sa.CheckConstraint("key ~ '" + PROJECT_KEY_PATTERN + "'", name="ck_projects_key_fmt"),
        sa.CheckConstraint("char_length(name) BETWEEN 1 AND 120", name="ck_projects_name_len"),
        sa.CheckConstraint("task_sequence >= 0", name="ck_projects_task_seq"),
    )

    op.create_table(
        "project_memberships",
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("role", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("project_id", "user_id"),
        sa.ForeignKeyConstraint(
            ["project_id"], ["projects.id"], ondelete="RESTRICT", name="fk_project_memberships_project"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], ondelete="RESTRICT", name="fk_project_memberships_user"
        ),
        sa.CheckConstraint(
            "role IN ('OWNER', 'MANAGER', 'WRITER_WORKFLOW', 'WRITER', 'READER')",
            name="ck_project_memberships_role",
        ),
    )
    op.create_index(
        "uq_project_one_owner",
        "project_memberships",
        ["project_id"],
        unique=True,
        postgresql_where=sa.text("role = 'OWNER'"),
    )
    op.create_index("ix_project_memberships_user", "project_memberships", ["user_id"])

    op.create_table(
        "sprints",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("goal", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), server_default=sa.text("'PLANNED'"), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["project_id"], ["projects.id"], ondelete="RESTRICT", name="fk_sprints_project"
        ),
        sa.UniqueConstraint("project_id", "id", name="uq_sprints_project_id"),
        sa.CheckConstraint(
            "status IN ('PLANNED', 'ACTIVE', 'CLOSED')", name="ck_sprints_status"
        ),
        sa.CheckConstraint("char_length(name) BETWEEN 1 AND 120", name="ck_sprints_name_len"),
        sa.CheckConstraint(
            "start_date IS NULL OR end_date IS NULL OR end_date >= start_date",
            name="ck_sprints_date_order",
        ),
    )
    op.create_index(
        "uq_sprints_one_active",
        "sprints",
        ["project_id"],
        unique=True,
        postgresql_where=sa.text("status = 'ACTIVE'"),
    )

    op.create_table(
        "tasks",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("number", sa.Integer(), nullable=False),
        sa.Column("sprint_id", sa.Uuid(), nullable=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), server_default=sa.text("'TODO'"), nullable=False),
        sa.Column("priority", sa.SmallInteger(), server_default=sa.text("3"), nullable=False),
        sa.Column("story_points", sa.SmallInteger(), nullable=False),
        sa.Column("assignee_id", sa.Uuid(), nullable=True),
        sa.Column("created_by", sa.Uuid(), nullable=False),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["project_id"], ["projects.id"], ondelete="RESTRICT", name="fk_tasks_project"
        ),
        sa.ForeignKeyConstraint(
            ["project_id", "sprint_id"],
            ["sprints.project_id", "sprints.id"],
            ondelete="RESTRICT",
            name="fk_tasks_sprint_same_project",
        ),
        sa.ForeignKeyConstraint(
            ["project_id", "assignee_id"],
            ["project_memberships.project_id", "project_memberships.user_id"],
            ondelete="RESTRICT",
            name="fk_tasks_assignee_is_member",
        ),
        sa.ForeignKeyConstraint(
            ["created_by"], ["users.id"], ondelete="RESTRICT", name="fk_tasks_created_by"
        ),
        sa.UniqueConstraint("project_id", "number", name="uq_tasks_project_number"),
        sa.CheckConstraint("number > 0", name="ck_tasks_number"),
        sa.CheckConstraint(
            "status IN ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE')", name="ck_tasks_status"
        ),
        sa.CheckConstraint("priority BETWEEN 1 AND 5", name="ck_tasks_priority"),
        sa.CheckConstraint("story_points > 0", name="ck_tasks_points"),
        sa.CheckConstraint("char_length(title) BETWEEN 1 AND 200", name="ck_tasks_title_len"),
    )
    op.create_index("ix_tasks_project_status", "tasks", ["project_id", "status"])
    op.create_index(
        "ix_tasks_sprint", "tasks", ["sprint_id"], postgresql_where=sa.text("sprint_id IS NOT NULL")
    )
    op.create_index(
        "ix_tasks_backlog", "tasks", ["project_id"], postgresql_where=sa.text("sprint_id IS NULL")
    )
    op.create_index(
        "ix_tasks_assignee", "tasks", ["assignee_id"], postgresql_where=sa.text("assignee_id IS NOT NULL")
    )

    op.create_table(
        "activity_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("actor_user_id", sa.Uuid(), nullable=True),
        sa.Column("entity_type", sa.Text(), nullable=False),
        sa.Column("entity_id", sa.Uuid(), nullable=False),
        sa.Column("event_type", sa.Text(), nullable=False),
        sa.Column("payload", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["project_id"], ["projects.id"], ondelete="RESTRICT", name="fk_activity_events_project"
        ),
        sa.ForeignKeyConstraint(
            ["actor_user_id"], ["users.id"], ondelete="RESTRICT", name="fk_activity_events_actor"
        ),
    )
    op.create_index(
        "ix_activity_events_project_created", "activity_events", ["project_id", "created_at"]
    )
    op.create_index(
        "ix_activity_events_entity", "activity_events", ["entity_type", "entity_id", "created_at"]
    )


def downgrade() -> None:
    op.drop_table("activity_events")
    op.drop_table("tasks")
    op.drop_table("sprints")
    op.drop_table("project_memberships")
    op.drop_table("projects")
    op.drop_table("users")
