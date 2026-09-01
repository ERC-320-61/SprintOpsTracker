variable "aws_region" {
  description = "AWS region for SprintOps-Tracker resources."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project slug used for resource naming and tags."
  type        = string
  default     = "sprintops-tracker"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be \"dev\" or \"prod\"."
  }
}
