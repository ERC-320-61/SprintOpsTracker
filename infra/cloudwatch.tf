resource "aws_cloudwatch_log_group" "items" {
  name              = "/aws/lambda/${aws_lambda_function.items.function_name}"
  retention_in_days = 14

  tags = {
    Name        = "${var.project_name}-items-logs"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_cloudwatch_log_group" "sprints" {
  name              = "/aws/lambda/${aws_lambda_function.sprints.function_name}"
  retention_in_days = 14

  tags = {
    Name        = "${var.project_name}-sprints-logs"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_cloudwatch_log_group" "dashboard" {
  name              = "/aws/lambda/${aws_lambda_function.dashboard.function_name}"
  retention_in_days = 14

  tags = {
    Name        = "${var.project_name}-dashboard-logs"
    Environment = var.environment
    Project     = var.project_name
  }
}