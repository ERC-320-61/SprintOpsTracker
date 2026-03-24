variable "aws_region" {
  description = "AWS region for SprintOpsTracker resources"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
}

variable "frontend_bucket_name" {
  description = "S3 bucket name for frontend static hosting"
  type        = string
}

variable "work_items_table_name" {
  description = "DynamoDB table name for work items"
  type        = string
}

variable "sprints_table_name" {
  description = "DynamoDB table name for sprints"
  type        = string
}