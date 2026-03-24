resource "aws_lambda_function" "items" {
  function_name    = "${var.project_name}-${var.environment}-items"
  role             = aws_iam_role.lambda_execution_role.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = "${path.module}/../backend/dist/items.zip"
  source_code_hash = filebase64sha256("${path.module}/../backend/dist/items.zip")

  timeout = 10

  environment {
    variables = {
      WORK_ITEMS_TABLE_NAME = var.work_items_table_name
      SPRINTS_TABLE_NAME    = var.sprints_table_name
    }
  }

  tags = {
    Name        = "${var.project_name}-items-lambda"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_lambda_function" "sprints" {
  function_name    = "${var.project_name}-${var.environment}-sprints"
  role             = aws_iam_role.lambda_execution_role.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = "${path.module}/../backend/dist/sprints.zip"
  source_code_hash = filebase64sha256("${path.module}/../backend/dist/sprints.zip")

  timeout = 10

  environment {
    variables = {
      WORK_ITEMS_TABLE_NAME = var.work_items_table_name
      SPRINTS_TABLE_NAME    = var.sprints_table_name
    }
  }

  tags = {
    Name        = "${var.project_name}-sprints-lambda"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_lambda_function" "dashboard" {
  function_name    = "${var.project_name}-${var.environment}-dashboard"
  role             = aws_iam_role.lambda_execution_role.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = "${path.module}/../backend/dist/dashboard.zip"
  source_code_hash = filebase64sha256("${path.module}/../backend/dist/dashboard.zip")

  timeout = 10

  environment {
    variables = {
      WORK_ITEMS_TABLE_NAME = var.work_items_table_name
      SPRINTS_TABLE_NAME    = var.sprints_table_name
    }
  }

  tags = {
    Name        = "${var.project_name}-dashboard-lambda"
    Environment = var.environment
    Project     = var.project_name
  }
}