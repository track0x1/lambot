variable "aws_account_id" {
  description = "AWS Account ID."
}

variable "app_name" {
  default = "lambot-ci"
}

variable "app_docker_image" {
  description = "Path to application docker image in ECR."
}
