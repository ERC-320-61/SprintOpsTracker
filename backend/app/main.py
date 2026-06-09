from fastapi import FastAPI
from app.api import dashboard, items, sprints

app = FastAPI(title="SprintOpsTracker API")

app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(items.router, prefix="/items", tags=["Items"])
app.include_router(sprints.router, prefix="/sprints", tags=["Sprints"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}