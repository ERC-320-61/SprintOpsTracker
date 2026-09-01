# Legacy documentation (pre-Charter v2.0)

The documents in this folder describe the **original SprintOpsTracker MVP**: a
Node.js + AWS Lambda + DynamoDB application with no authentication and a single
hardcoded project. That implementation has been removed from the active tree (see
git history up to and including commit `f034dab`) and is retained here **for
historical and behavioural reference only**.

They are **superseded** by the *SprintOps-Tracker Project Charter* v2.0
(2026-08-31), which is the authoritative planning baseline. Where these documents
conflict with the charter, the charter wins.

| Legacy document | Superseded by (charter section) |
|---|---|
| `project-overview.md` | Charter §1 Project Purpose, §2 Scope |
| `architecture-summary.md` | Charter §5 Target Technical Architecture |
| `tech-stack.md` | Charter §5.1 Technology Baseline, §13 Key Architecture Decisions |
| `mvp-scope.md` | Charter §2 Scope, §9 Development Roadmap (V0.1 Secure Core) |
| `security-baseline.md` | Charter §4 Identity/Authorization, §6 Security Baseline |

Key direction changes introduced by the charter:

- **PostgreSQL (Amazon RDS)** replaces DynamoDB as the system of record.
- **Python / FastAPI** replaces the Node.js backend.
- **Amazon Cognito authentication + project-scoped authorization** are V0.1
  foundation requirements, not deferred enhancements.
- The product expands from a single shared board to a multi-project,
  dependency-aware work-management platform.

Do not use these files to guide new implementation work.
