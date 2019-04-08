# Task Definition
resource "aws_ecs_task_definition" "app_task" {
  family                   = "lambot-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = "${aws_iam_role.task_exec_role.arn}"
  task_role_arn            = "${aws_iam_role.task_exec_role.arn}"

  # Valid CPU / Memory combos: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-cpu-memory-error.html
  cpu                      = 2048
  memory                   = 4096

  container_definitions    = "${data.template_file.contdef.rendered}"
}

data "template_file" "contdef" {
  template   = "${file("${path.module}/templates/container-definition.json")}"

  vars {
    app_docker_image = "${var.app_docker_image}"
    log_name         = "${aws_cloudwatch_log_group.log.name}"
    log_region       = "${var.aws_region}"
  }
}
