# Infrastructure (Terraform)

V0.1 infrastructure: a private S3 bucket holding the built frontend, served by
CloudFront (Origin Access Control, HTTPS-only, SPA fallback). Nothing else is
provisioned yet.

- Terraform `>= 1.10`, AWS provider `~> 5.0`, region `us-east-1`
- Remote state: `sprintops-tracker-<account-id>-tfstate` (S3, versioned,
  encrypted, S3-native locking)
- `infra/` is a flat root module — no `modules/`.

## 1. One-time: create the state bucket

```sh
cd infra/bootstrap
terraform init
terraform apply          # creates sprintops-tracker-<account-id>-tfstate
```

`infra/bootstrap/terraform.tfstate` (local) is not committed — the bucket is the
artifact. Re-run only to change the state bucket itself.

## 2. Provision the frontend infrastructure

```sh
cd infra
terraform init -backend-config="bucket=$(terraform -chdir=bootstrap output -raw state_bucket)"
terraform plan
terraform apply
```

Outputs: `frontend_bucket_name`, `cloudfront_domain_name`,
`cloudfront_distribution_id`.

## 3. Deploy the frontend

```sh
npm --prefix ../frontend run build
aws s3 sync ../frontend/dist "s3://$(terraform output -raw frontend_bucket_name)" --delete
aws cloudfront create-invalidation \
  --distribution-id "$(terraform output -raw cloudfront_distribution_id)" \
  --paths '/*'
```

## Not provisioned in V0.1

No API Gateway, Cognito, RDS, Lambda, VPC, SQS, ACM, Route 53, or WAF. When the
backend lands, an `/api/*` ordered cache behavior will be added to this
distribution (second origin → API Gateway) so the SPA can call `/api/v1/...`
same-origin. `prod` will be a second state key (`prod/terraform.tfstate`) plus a
`prod.tfvars`.
