resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_name}-${var.environment}-http-api"
  protocol_type = "HTTP"

  tags = {
    Name        = "${var.project_name}-http-api"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true

  tags = {
    Name        = "${var.project_name}-default-stage"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_apigatewayv2_integration" "items" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.items.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "sprints" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.sprints.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "dashboard" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.dashboard.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_items" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /items"
  target    = "integrations/${aws_apigatewayv2_integration.items.id}"
}

resource "aws_apigatewayv2_route" "get_item_by_id" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /items/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.items.id}"
}

resource "aws_apigatewayv2_route" "create_item" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /items"
  target    = "integrations/${aws_apigatewayv2_integration.items.id}"
}

resource "aws_apigatewayv2_route" "update_item" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "PUT /items/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.items.id}"
}

resource "aws_apigatewayv2_route" "delete_item" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "DELETE /items/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.items.id}"
}

resource "aws_apigatewayv2_route" "get_sprints" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /sprints"
  target    = "integrations/${aws_apigatewayv2_integration.sprints.id}"
}

resource "aws_apigatewayv2_route" "get_sprint_by_id" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /sprints/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.sprints.id}"
}

resource "aws_apigatewayv2_route" "create_sprint" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /sprints"
  target    = "integrations/${aws_apigatewayv2_integration.sprints.id}"
}

resource "aws_apigatewayv2_route" "update_sprint" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "PUT /sprints/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.sprints.id}"
}

resource "aws_apigatewayv2_route" "delete_sprint" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "DELETE /sprints/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.sprints.id}"
}

resource "aws_apigatewayv2_route" "get_active_sprint" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /sprints/active"
  target    = "integrations/${aws_apigatewayv2_integration.sprints.id}"
}

resource "aws_apigatewayv2_route" "get_dashboard_summary" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /dashboard/summary"
  target    = "integrations/${aws_apigatewayv2_integration.dashboard.id}"
}

resource "aws_lambda_permission" "allow_apigw_items" {
  statement_id  = "AllowExecutionFromAPIGatewayItems"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.items.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_apigw_sprints" {
  statement_id  = "AllowExecutionFromAPIGatewaySprints"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.sprints.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "allow_apigw_dashboard" {
  statement_id  = "AllowExecutionFromAPIGatewayDashboard"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.dashboard.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}