# ***Steps***

> [!abstract] ***Step 1 - Define the target deployment shape***
> - Lock the architecture before writing Terraform.
> - Recommended target:
>   - **Frontend**
>     - React/Vite build output hosted in `S3`
>     - served through `CloudFront`
>   - **Backend API**
>     - move backend logic into `Lambda`
>     - expose through `API Gateway`
>   - **Data**
>     - `DynamoDB` stays as persistence layer
>   - **Access / Permissions**
>     - `IAM` roles and policies for Lambda and deployment access
>   - **Monitoring**
>     - `CloudWatch` logs for Lambda and API visibility



> [!abstract] ***[[Day 6]]***
> - This is the most important Phase 9 decision.
> - Right now backend is:
> 	- local `Express`
> 	- mixed handler style
> 	- some routes already closer to Lambda logic than others
> - Need to choose how to deploy the backend.
>
> #### Best option
> - Refactor routes into Lambda-compatible handlers and deploy each API route behind API Gateway.
>
> #### Why this is best
> - aligns with AWS architecture
> - shows stronger cloud design maturity
> - avoids deploying a long-running server when planned serverless
>
> #### Important note
> - Current `itemsHandler` and `sprintsHandler` are already closer to Lambda-style thinking than a fully Express-native app
> - But newer dashboard route is currently a direct Express handler, so for Phase 9 will likely want to normalize that



> [!abstract] ***Step 3 - Terraform structure***
> - A clean Terraform structure would likely be:
>
> ```txt
> terraform/
> ├── main.tf
> ├── variables.tf
> ├── outputs.tf
> ├── providers.tf
> ├── frontend.tf
> ├── api.tf
> ├── lambda.tf
> ├── dynamodb.tf
> ├── iam.tf
> ├── cloudwatch.tf
> └── terraform.tfvars
> ```
>
> - That split keeps resources logically separated.

> [!abstract] ***Step 4 - Resource build order***
> - Provision in this order:
>
> #### Foundation
> - provider config
> - IAM roles/policies
> - DynamoDB table definitions if Terraform will own them now
>
> #### Backend
> - Lambda packaging/deployment
> - API Gateway routes/integrations
> - CloudWatch logging
>
> #### Frontend
> - S3 bucket for static site assets
> - CloudFront distribution
> - optional bucket policy / origin access control
>
> #### App config
> - frontend API base URL switched to deployed endpoint
> - frontend build and upload flow

> [!abstract] ***Step 5 - Frontend deployment prep***
> - Before deploying frontend, fix your API config pattern.
> - Right now `api.js` uses a hardcoded local base URL.
> - That needs to become environment-driven.
>
> ```js
> const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
> ```
>
> - Then:
>   - local `.env` uses localhost
>   - production `.env.production` uses API Gateway URL or CloudFront/API custom domain later
> - This is a Phase 9 prerequisite.

> [!abstract] ***Step 6 - Backend deployment prep***
> - Before Terraform fully deploys Lambda, decide how your backend code will be packaged.
> - You need to determine:
>   - whether each route becomes its own Lambda
>   - or one Lambda handles multiple routes
>
> #### Recommended for this project
> - Use one API-oriented Lambda entry point per domain area, or one consolidated API Lambda if you want less complexity.
>
> #### Possible options
> - **Simpler**
>   - one Lambda for items
>   - one Lambda for sprints
>   - one Lambda for dashboard
> - **Simplest deployment**
>   - one Lambda that routes internally by method/path
>
> #### Best fit for now
> - one `items` Lambda
> - one `sprints` Lambda
> - one `dashboard` Lambda
> - That keeps separation but avoids too much complexity.

> [!abstract] ***Step 7 - DynamoDB ownership decision***
> - DynamoDB tables have manually created in AWS.
> - For Phase 9, decide whether:
> 	- Terraform should now manage those tables
> 	- or Terraform should treat them as already existing resources outside current control
>
> #### Best portfolio answer
> - Move table definition into Terraform so the infrastructure is reproducible.
>
> #### Why
> - full IaC story
> - cleaner deployment narrative
> - better portfolio credibility
>
> #### Important caution
> - If data preservation matters right now, do it carefully.

> [!abstract] ***Step 8 - CloudWatch value***
> - Include CloudWatch logs for:
>   - Lambda execution logs
>   - API troubleshooting
> - This matters because it shows operational awareness, not just deployment.

> [!abstract] ***Step 9 - What Phase 9 is really testing***
> - Phase 9 is no longer mostly about coding features.
> - It is about showing you understand:
>   - hosting model separation
>   - static frontend deployment
>   - API exposure
>   - serverless backend design
>   - IAM permissions
>   - infrastructure as code
>   - configuration management
>   - observability basics

> [!example] ***Recommended Phase 9 subphases***
> #### Phase 9.1 - Deployment design and Terraform scaffold
> - create Terraform folder structure
> - define variables and provider
> - map target resources
>
> #### Phase 9.2 - Backend serverless preparation
> - normalize handlers for Lambda/API Gateway
> - package Lambda functions
> - verify backend logic works in serverless form
>
> #### Phase 9.3 - AWS resource provisioning
> - deploy IAM
> - deploy DynamoDB
> - deploy Lambdas
> - deploy API Gateway
> - enable CloudWatch logging
>
> #### Phase 9.4 - Frontend deployment
> - update environment config
> - build Vite frontend
> - deploy to S3
> - serve with CloudFront
>
> #### Phase 9.5 - End-to-end validation
> - verify CRUD works from hosted frontend
> - verify sprint board works
> - verify dashboard works
> - verify CloudWatch logs
> - verify no localhost dependency remains

> [!info] ***Best next step right now***
> - Define the Terraform structure and deployment strategy before writing resource code.
> - That means Phase 9 should begin with:
>   1. decide Lambda layout
>   2. decide whether Terraform owns current DynamoDB tables
>   3. update frontend to environment-based API URL
>   4. create Terraform file scaffold