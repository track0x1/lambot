module.exports = {
  // Hex secret used to authenticate events sent to your webhook
  // Replace with your own secret via CLI:
  //   node -p "require('crypto').randomBytes(16).toString('hex')"
  WEBHOOK_SECRET: "YOUR_GENERATED_SECRET_HERE",

  // GitHub Machine Username
  // https://developer.github.com/v3/guides/managing-deploy-keys/#machine-users
  BOT_NAME: "lambot",

  // Please don't tokens in your source code! (This is just for simplicities sake)
  // It's better if you fetch this from something like AWS parameter store.
  // Generate token here: https://github.com/settings/tokens
  BOT_TOKEN: "YOUR_TOKEN_HERE",

  // Cluster to run ECS tasks
  // This should match your cluster name (see ../infra/variables.tf "app_name")
  ECS_CLUSTER: "lambot-ci",

  // This should match your task definition's family (see ../infra/ecs/ecs.tf)
  ECS_TASK_DEFINITION: "lambot-task",

  // This should match your container definition's name (see ../infra/ecs/templates/container-definition.json)
  ECS_CONTAINER: "instance",

  // Replace with your own subnets
  ECS_SUBNETS: ["subnet-1234abcd", "subnet-abcd1234"]
}
