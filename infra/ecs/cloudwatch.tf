resource "aws_cloudwatch_log_group" "log" {
  name              = "${var.app_name}"
  retention_in_days = 14
}
