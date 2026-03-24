resource "aws_dynamodb_table" "work_items" {
  name         = var.work_items_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "itemId"

  attribute {
    name = "itemId"
    type = "S"
  }

  tags = {
    Name        = "${var.project_name}-work-items"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_dynamodb_table" "sprints" {
  name         = var.sprints_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "sprintId"

  attribute {
    name = "sprintId"
    type = "S"
  }

  tags = {
    Name        = "${var.project_name}-sprints"
    Environment = var.environment
    Project     = var.project_name
  }
}