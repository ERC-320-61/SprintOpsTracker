# SprintOpsTracker

SprintOpsTracker is a small-team workflow app for managing backlog items, sprints, assignments, and progress tracking.

The project is being built as a portfolio-ready cloud application using a React frontend, FastAPI backend, DynamoDB, Cognito authentication, and optional event-driven SMS notifications.

## Architecture

```text
S3 + CloudFront
    └── React frontend

Amazon Cognito
    ├── user authentication
    ├── email verification
    ├── JWT tokens
    ├── TOTP MFA
    └── optional SMS MFA

API Gateway or ALB
    └── FastAPI backend

FastAPI
    ├── dashboard routes
    ├── item routes
    ├── sprint routes
    ├── auth / validation
    ├── service layer
    └── DynamoDB repository layer

DynamoDB
    ├── items table
    ├── sprints table
    └── users/team data if needed

App Notifications
    ├── SQS queue
    ├── notification Lambda
    └── SNS / SMS notifications
```

# The Plan

## Version 1: Low-Cost Serverless Deployment

The project will start with a low-cost serverless setup.
- React frontend hosted in S3
- CloudFront for frontend delivery
- API Gateway for backend API access
- AWS Lambda running FastAPI with Mangum
- DynamoDB for data storage
- Cognito for authentication
- TOTP MFA for stronger user security
- Optional SMS MFA
- IAM roles for secure AWS access
- Route 53 for custom domain routing

## Version 2: ECS/Fargate Deployment

The next version will move the FastAPI backend to containers. This version is intended to demonstrate container deployment, platform engineering, and a more production-style architecture.
- FastAPI containerized with Docker
- ECS Fargate for running the backend
- Application Load Balancer for API traffic
- CloudFront for frontend delivery
- Cognito remains the authentication service
- DynamoDB remains the main database
- IAM task roles for secure AWS access
- Optional SQS-based notification processing

## Authentication Goal

SprintOpsTracker will use Amazon Cognito for user authentication.

Planned authentication features:
- User sign-up and login
- Email verification
- JWT-based API authorization
- Protected FastAPI routes
- TOTP authenticator app MFA
- Optional SMS MFA

TOTP will be the preferred MFA option because it provides stronger security than SMS-only MFA.

## Notification Goal

SprintOpsTracker will eventually include app notifications for workflow events.

Planned notification flow:

```text
FastAPI
    ↓
SQS
    ↓
Notification Lambda
    ↓
SNS / SMS
    ↓
User notification
```

Example notifications:
- Item assigned to user
- Sprint started
- Sprint ending soon
- Item moved to Blocked
- Item overdue

SMS notifications will be separate from MFA. MFA is for account security, while app notifications are for workflow updates.

## Backend Goal

The backend will be rewritten in Python using FastAPI.

The FastAPI app will be structured so it can run in two ways:

```text
Lambda + Mangum
ECS Fargate + Docker
```

This keeps the application portable and avoids major rework later.

## Frontend Goal

The React frontend will remain the main user interface.

Future improvements may include:
- Better loading states
- Error handling
- Sprint filtering
- Status updates
- Dashboard summaries
- Login and logout flow
- Protected routes
- A more reactive user experience

## Project Purpose

This project is meant to demonstrate:

- React frontend development
- Python FastAPI backend development
- Serverless AWS deployment
- DynamoDB integration
- Cognito authentication
- MFA implementation
- JWT-based API security
- IAM-based security
- Event-driven notifications with SQS
- SMS notifications with SNS
- Container-based deployment with ECS/Fargate
- Cloud project documentation

---

#  Docker

```bash
docker build -t sprintops-backend .
```

### Normally
```bash
docker run --rm --detach --publish 8000:8000 --restart always --name sprintops-backend sprintops-backend
```

### During Dev:
```Bash
docker run --name sprintops-api --rm -p 8000:8000 -v "$(pwd)":/app sprintops-backend uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Verify Docker  Hosted backend at `http://127.0.0.1:8000/docs`