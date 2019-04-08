# Use AWS; us-east-1
provider "aws" {
  region = "us-east-1"
}

# ECS Cluster
resource "aws_ecs_cluster" "app_cluster" {
  name = "${var.app_name}"
}

# ECS Service
module "ecs_service" {
  source = "./ecs"

  app_name         = "${var.app_name}"
  app_docker_image = "${var.app_docker_image}"

  ecs_cluster_id = "${aws_ecs_cluster.app_cluster.id}"
}
