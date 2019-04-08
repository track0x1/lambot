data "aws_iam_policy_document" "role_doc" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs.amazonaws.com", "ec2.amazonaws.com", "ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_exec_role" {
  name = "${var.app_name}-ecs-task-exec"
  assume_role_policy = "${data.aws_iam_policy_document.role_doc.json}"
}

resource "aws_iam_role_policy_attachment" "task_exec_role_policy" {
  role       = "${aws_iam_role.task_exec_role.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
