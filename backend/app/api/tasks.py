from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_tasks():
    return {
        "message": "List tasks endpoint working"
    }


@router.post("")
def create_task():
    return {
        "message": "Create task endpoint working"
    }


@router.get("/{task_id}")
def get_task(task_id: str):
    return {
        "message": "Get task endpoint working",
        "task_id": task_id
    }


@router.put("/{task_id}")
def update_task(task_id: str):
    return {
        "message": "Update task endpoint working",
        "task_id": task_id
    }


@router.delete("/{task_id}")
def delete_task(task_id: str):
    return {
        "message": "Delete task endpoint working",
        "task_id": task_id
    }
