# SprintOpsTracker

SprintOpsTracker is a project- and sprint-management application: Jira-style
projects, backlogs, sprints, boards, milestones and dependency-aware tasks, with
Obsidian-style tagging and task-to-task linking.

The authoritative planning baseline is the **SprintOps-Tracker Project Charter
v2.0** (2026-08-31). This README is a short orientation; the charter is the
source of truth for scope, architecture and roadmap.

## Status

Rework in progress on the `Fast_API_Rework` line. The original Node.js / DynamoDB
MVP has been removed from the active tree (still available in git history) and the
codebase is being rebuilt to the charter's target architecture. Legacy planning
docs are kept under [`docs/legacy/`](docs/legacy/) for reference only.

Current milestone: **V0.1 — Secure Core** (schema + API conventions, Terraform
baseline, Cognito auth, project-scoped authorization, projects/tasks/backlog/
sprints/board).

## Target architecture

| Layer | Choice |
|---|---|
| Web frontend | React (Vite), hosted on S3 + CloudFront |
| Backend API | Python + FastAPI, behind API Gateway (Lambda + Mangum initially) |
| Database | Amazon RDS for PostgreSQL |
| Auth | Amazon Cognito (JWT), project membership/authorization in PostgreSQL |
| File storage | Amazon S3 (presigned, authorization-gated) |
| Async / notifications | SQS + Lambda workers; Discord/Slack/Telegram providers |
| Infrastructure as Code | Terraform |
| Observability | CloudWatch |

Serverless-first, with a cost target of roughly $20/month for the early
deployed environment. See charter §5, §10 and §13.

## Repository layout

```
backend/    Python / FastAPI application (app/), Dockerfile, requirements.txt
frontend/   React single-page application (Vite)
infra/      Terraform — currently the S3 + CloudFront frontend hosting only
docs/       Build notes, learning notes, and superseded legacy planning docs
```

## Local development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_BASE_URL` to point at the backend.

### Backend

```bash
cd backend
python -m venv .venv && . .venv/Scripts/activate   # or .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive docs at `http://127.0.0.1:8000/docs`.

### Backend via Docker

```bash
cd backend
docker build -t sprintops-backend .
docker run --rm -p 8000:8000 --name sprintops-api \
  -v "$(pwd)":/app sprintops-backend \
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
