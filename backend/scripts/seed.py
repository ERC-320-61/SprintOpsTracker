"""Minimal development seed data.

Usage (from backend/, with the database migrated to head):

    python -m scripts.seed

Idempotent-ish: it refuses to run if project SOT already exists.
"""
import sys

from sqlalchemy import select

from app.core.db import SessionLocal
from app.models.project import Project
from app.models.sprint import Sprint
from app.models.user import User
from app.services.projects import create_project
from app.services.tasks import create_task


def main() -> int:
    with SessionLocal.begin() as session:
        if session.scalar(select(Project).where(Project.key == "SOT")):
            print("Project SOT already exists; nothing to do.")
            return 0

        owner = User(cognito_sub="seed-owner", email="owner@example.com", display_name="Seed Owner")
        session.add(owner)
        session.flush()

        project = create_project(
            session,
            key="SOT",
            name="SprintOps-Tracker",
            created_by=owner.id,
            description="Seed project for local development.",
        )
        session.flush()

        sprint = Sprint(project_id=project.id, name="Sprint 1", goal="Bootstrap", status="ACTIVE")
        session.add(sprint)
        session.flush()

        create_task(session, project_id=project.id, title="Set up local environment",
                    created_by=owner.id, sprint_id=sprint.id, story_points=2)
        create_task(session, project_id=project.id, title="Draft the API conventions",
                    created_by=owner.id, sprint_id=sprint.id, priority=2, story_points=3)
        create_task(session, project_id=project.id, title="Backlog: evaluate CI options",
                    created_by=owner.id)

    print("Seeded project SOT with 1 sprint and 3 tasks.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
