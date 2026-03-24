# Phase 9 Reflection - AWS Infrastructure and Deployment

> [!info]
> ### Phase Summary
> - Phase 9 was the point where SprintOpsTracker moved from a local-only application into a real AWS-hosted architecture.
> - The main objective was not just “deploy the app,” but to reshape the project so it could actually fit the intended cloud design:
>   - frontend hosted in `S3`
>   - frontend delivered through `CloudFront`
>   - backend moved toward `Lambda`
>   - backend exposed through `API Gateway`
>   - data stored in `DynamoDB`
>   - permissions managed through `IAM`
>   - visibility handled through `CloudWatch`
> - This phase forced me to think less like someone just building pages and endpoints locally, and more like someone trying to make an application work inside a real cloud architecture.

---

> [!abstract]
> ### What I accomplished
> - I normalized the backend so it could move toward a Lambda-friendly deployment model.
> - I created separate Lambda entry points for:
>   - `items`
>   - `sprints`
>   - `dashboard`
> - I updated the frontend API configuration so it would no longer depend on a hardcoded localhost backend.
> - I created the Terraform scaffolding for the core AWS resources:
>   - `API Gateway`
>   - `Lambda`
>   - `IAM`
>   - `DynamoDB`
>   - `S3`
>   - `CloudFront`
>   - `CloudWatch`
> - I packaged the backend into Lambda deployment artifacts.
> - I deployed the infrastructure successfully into AWS.
> - I validated the live API by testing deployed endpoints and fixing issues until the backend started responding correctly.

---

> [!abstract]
> ### What made this phase different
> - Earlier phases were mostly about application logic and frontend/backend functionality.
> - Phase 9 was different because the code had to survive outside the comfort of local development.
> - It was not enough for the app to “work on my machine.”
> - It had to work with:
>   - Terraform resource definitions
>   - Lambda runtime expectations
>   - API Gateway event formats
>   - AWS permissions
>   - deployment packaging
>   - CloudWatch logging
> - This was the first phase where cloud architecture decisions and deployment mechanics became just as important as the app code itself.

---

> [!caution]
> ### Honest reflection on my role in this phase
> - I need to be honest: I was **not the pilot** in this phase.
> - This was my **first time** using `Terraform` in a real applied way.
> - It was also my **first time** trying to understand how local backend code has to be reshaped to run inside `AWS Lambda`.
> - I did not come into this phase already understanding:
>   - how Terraform files should be structured
>   - how resource dependencies connect across files
>   - how Lambda packaging actually works
>   - how API Gateway event payloads differ from Express request patterns
> - I was following guidance closely while trying to understand the “why” behind each change.
> - So while I did complete the work, this phase was much more of a **guided build-and-learn experience** than something I could have independently architected from scratch at this stage.

---

> [!abstract]
> ### What I learned about Terraform
> - Before this phase, Terraform was mostly an abstract concept to me.
> - Phase 9 forced me to understand that Terraform is not just “cloud code.”
> - It is a way of describing:
>   - what should exist
>   - how resources relate to each other
>   - what values should be configurable
>   - what should be reproducible through infrastructure as code
> - I learned that Terraform structure matters:
>   - `providers.tf` for provider setup
>   - `variables.tf` for reusable values
>   - `terraform.tfvars` for actual environment values
>   - separate files for logical resource categories like:
>     - `iam.tf`
>     - `dynamodb.tf`
>     - `lambda.tf`
>     - `api.tf`
>     - `frontend.tf`
>     - `cloudwatch.tf`
> - I also learned that Terraform is not only about creation.
> - It is also about reconciliation:
>   - importing existing resources
>   - aligning state with reality
>   - preventing conflicts with manually created infrastructure

---

> [!abstract]
> ### What I learned about Lambda and backend migration
> - One of the biggest lessons of this phase was understanding that local backend code does not automatically translate to Lambda.
> - My local backend was built around `Express`, but AWS Lambda expects a very different model.
> - I learned that I had to distinguish between:
>   - the actual business logic
>   - the local development adapter (`Express`)
>   - the AWS execution model (`Lambda` + `API Gateway`)
> - I learned that:
>   - some handlers were already closer to Lambda style
>   - others had to be refactored
>   - a local route working does not mean it will behave correctly when invoked through API Gateway
> - This forced me to think about backend design at a deeper level than before.

---

> [!abstract]
> ### Major troubleshooting lessons from this phase
> #### 1. Missing Lambda deployment artifacts
> - Terraform validation initially failed because the expected Lambda zip files did not exist.
> - This taught me that infrastructure code can be syntactically correct while still being blocked by missing build artifacts.
>
> #### 2. Hardcoded DynamoDB table names
> - Some backend services still relied on hardcoded table names.
> - I had to align the backend with environment-variable-driven configuration so deployed Lambdas could use Terraform-managed values.
>
> #### 3. Existing DynamoDB tables already existed
> - Since I had created the tables manually earlier, Terraform initially wanted to create resources that already existed.
> - I had to understand that importing resources into Terraform state was the right way to preserve data while moving toward proper IaC management.
>
> #### 4. Reserved Lambda environment variables
> - The first apply failed because `AWS_REGION` was being set manually in Lambda environment variables, which AWS reserves.
> - This taught me that not every environment variable is safe or necessary to define yourself.
>
> #### 5. Incorrect Lambda zip root structure
> - CloudWatch logs showed `Runtime.ImportModuleError: Cannot find module 'index'`.
> - The issue was not with my handler logic, but with the zip archive layout.
> - The Lambda runtime could not find `index.js` at the root of the package.
> - This taught me that deployment packaging details matter just as much as source code.
>
> #### 6. API Gateway v2 event shape mismatch
> - After fixing the packaging issue, the functions loaded but returned `"Method not allowed."`
> - The root cause was that API Gateway HTTP API v2 does not send the method in the exact same place as my local Express-style event assumptions.
> - This forced me to update handlers so they could read from both:
>   - local `httpMethod`
>   - deployed `requestContext.http.method`
>
> #### 7. Packaged code can drift from repo code
> - I also learned that fixing source files in the repo does not automatically fix what Lambda runs.
> - If the packaged copies in `dist/` are stale, AWS will still execute outdated code.
> - That made me more aware of the difference between:
>   - source files
>   - packaging folders
>   - deployed artifacts

---

> [!abstract]
> ### What this phase taught me about cloud work
> - Cloud deployment is not just about provisioning services.
> - It is also about making the application fit the cloud environment operationally.
> - That includes:
>   - configuration management
>   - permissions
>   - packaging
>   - observability
>   - runtime assumptions
>   - state management
> - This phase made it clear that “working locally” and “working in AWS” are two different standards.
> - I had to start thinking in terms of systems, not just files and features.

---

> [!info]
> ### Skills I strengthened during this phase
> - Reading and understanding Terraform plans
> - Structuring Terraform files by resource type
> - Reasoning through AWS service relationships
> - Adapting backend code for serverless execution
> - Using `CloudWatch` to troubleshoot live AWS runtime failures
> - Understanding the importance of deployment artifact structure
> - Distinguishing between source code issues and packaging/runtime issues
> - Thinking more clearly about how environment-based configuration should work

---

> [!abstract]
> ### What I still do not fully own yet
> - I still do not feel like I could independently architect and deploy this entire Terraform/Lambda stack from scratch without support.
> - I understand the structure much better now, but I am still building intuition around:
>   - why specific AWS resources need to be split a certain way
>   - how to think ahead about deployment failure modes
>   - how to package serverless code cleanly the first time
>   - how to reason about Terraform state and resource imports confidently
> - So this phase gave me progress, but also showed me where my inexperience still is.

---

> [!success]
> ### Biggest win from Phase 9
> - Even though I was not the pilot, I still helped bring SprintOpsTracker from a local dev project into a live AWS-backed deployment path.
> - I now have a much better understanding of:
>   - what Terraform is doing
>   - how Lambda deployment actually works
>   - how API Gateway interacts with backend handlers
>   - how CloudWatch becomes essential during debugging
> - Most importantly, I now have real exposure to cloud deployment troubleshooting rather than only theory.

---

> [!success]
> ### Outcome so far
> - SprintOpsTracker now has its core AWS infrastructure deployed.
> - The backend has been reshaped toward a Lambda-compatible model.
> - Terraform is now part of the project structure.
> - The project has crossed from “local prototype” into “real cloud-hosted application in progress.”
> - Phase 9 was difficult, messy, and highly guided, but it was also one of the most educational phases of the project so far.