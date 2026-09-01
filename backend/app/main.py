from fastapi import FastAPI

from app.api import api_router
from app.errors import register_error_handlers

app = FastAPI(title="SprintOpsTracker API")
register_error_handlers(app)
app.include_router(api_router)


@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}
