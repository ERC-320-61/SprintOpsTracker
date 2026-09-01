import uuid
from concurrent.futures import ThreadPoolExecutor

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.services.projects import create_project
from app.services.tasks import create_task
from tests.conftest import make_user


def test_numbers_are_sequential_within_a_project(session):
    owner = make_user(session)
    project = create_project(session, key="SOT", name="p", created_by=owner.id)
    session.flush()

    numbers = [
        create_task(session, project_id=project.id, title=f"t{i}", created_by=owner.id).number
        for i in range(5)
    ]
    session.flush()
    assert numbers == [1, 2, 3, 4, 5]
    assert session.get(Project, project.id).task_sequence == 5


def test_numbers_are_not_recycled_after_delete(session):
    owner = make_user(session)
    project = create_project(session, key="SOT", name="p", created_by=owner.id)
    session.flush()

    t1 = create_task(session, project_id=project.id, title="t1", created_by=owner.id)
    t2 = create_task(session, project_id=project.id, title="t2", created_by=owner.id)
    session.flush()
    session.delete(t2)
    session.flush()

    t3 = create_task(session, project_id=project.id, title="t3", created_by=owner.id)
    session.flush()
    assert (t1.number, t3.number) == (1, 3)  # 2 is gone, not reused


def test_concurrent_allocation_produces_no_duplicates(engine, clean_db):
    """Real concurrent transactions each allocate a number; the row lock in
    `_next_task_number` serialises them, so the result is exactly 1..N."""
    worker_count = 12

    with Session(engine, expire_on_commit=False) as setup:
        owner = User(cognito_sub=f"sub-{uuid.uuid4()}")
        setup.add(owner)
        setup.flush()
        project = create_project(setup, key="CONC", name="p", created_by=owner.id)
        setup.commit()
        project_id, owner_id = project.id, owner.id

    def worker(n: int) -> int:
        with Session(engine, expire_on_commit=False) as s, s.begin():
            task = create_task(
                s, project_id=project_id, title=f"t{n}", created_by=owner_id
            )
            return task.number

    with ThreadPoolExecutor(max_workers=worker_count) as pool:
        numbers = sorted(pool.map(worker, range(worker_count)))

    assert numbers == list(range(1, worker_count + 1))

    with Session(engine) as check:
        rows = check.scalars(
            select(Task.number).where(Task.project_id == project_id).order_by(Task.number)
        ).all()
        assert rows == list(range(1, worker_count + 1))
        assert check.get(Project, project_id).task_sequence == worker_count
