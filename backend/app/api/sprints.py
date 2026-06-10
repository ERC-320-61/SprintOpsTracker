from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_sprints():
    return {
        "message": "List sprints endpoint working"
    }


@router.post("")
def create_sprint():
    return {
        "message": "Create sprint endpoint working"
    }


@router.get("/active")
def get_active_sprint():
    return {
        "message": "Active sprint endpoint working"
    }


@router.get("/{sprint_id}")
def get_sprint(sprint_id: str):
    return {
        "message": "Get sprint endpoint working",
        "sprint_id": sprint_id
    }


@router.put("/{sprint_id}")
def update_sprint(sprint_id: str):
    return {
        "message": "Update sprint endpoint working",
        "sprint_id": sprint_id
    }


@router.delete("/{sprint_id}")
def delete_sprint(sprint_id: str):
    return {
        "message": "Delete sprint endpoint working",
        "sprint_id": sprint_id
    }