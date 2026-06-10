from fastapi import APIRouter

router = APIRouter()


@router.get("")
def list_items():
    return {
        "message": "List items endpoint working"
    }


@router.post("")
def create_item():
    return {
        "message": "Create item endpoint working"
    }


@router.get("/{item_id}")
def get_item(item_id: str):
    return {
        "message": "Get item endpoint working",
        "item_id": item_id
    }


@router.put("/{item_id}")
def update_item(item_id: str):
    return {
        "message": "Update item endpoint working",
        "item_id": item_id
    }


@router.delete("/{item_id}")
def delete_item(item_id: str):
    return {
        "message": "Delete item endpoint working",
        "item_id": item_id
    }