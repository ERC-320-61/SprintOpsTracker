from fastapi import APIRouter

router = APIRouter()


@router.get("/summary")
def get_dashboard_summary():
    return {
        "message": "Dashboard summary endpoint working"
    }