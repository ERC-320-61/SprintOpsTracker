output "api_gateway_url" {
  description = "Base URL for the Sprint-Ops Tracker HTTP API"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name for the frontend"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "frontend_bucket_name" {
  description = "S3 bucket name for the frontend"
  value       = aws_s3_bucket.frontend.bucket
}

output "items_lambda_name" {
  description = "Lambda function name for items"
  value       = aws_lambda_function.items.function_name
}

output "sprints_lambda_name" {
  description = "Lambda function name for sprints"
  value       = aws_lambda_function.sprints.function_name
}

output "dashboard_lambda_name" {
  description = "Lambda function name for dashboard"
  value       = aws_lambda_function.dashboard.function_name
}

output "work_items_table_name" {
  description = "DynamoDB table name for work items"
  value       = aws_dynamodb_table.work_items.name
}

output "sprints_table_name" {
  description = "DynamoDB table name for sprints"
  value       = aws_dynamodb_table.sprints.name
}