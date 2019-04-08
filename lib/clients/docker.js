const AWS = require('aws-sdk');
const config = require('../config');

const ecs = new AWS.ECS();

module.exports = (opts) => {
  // Convert opts to be passed as environment variables
  const ecsEnv = Object.keys(opts).map((key) => ({
    name: key, value: opts[key] === null ? '' : String(opts[key])
  }));

  // Preassemble overrides for verbosity
  const containerOverrides = {
    name: config.ECS_CONTAINER,
    environment: ecsEnv
  };

  console.log(`Starting task ${config.ECS_TASK_DEFINITION} on ECS cluster ${config.ECS_CLUSTER}` +
    ' with overrides:\n', JSON.stringify(containerOverrides));

  return new Promise((resolve, reject) => {
    ecs.runTask({
      cluster: config.ECS_CLUSTER,
      launchType: 'FARGATE',
      taskDefinition: config.ECS_TASK_DEFINITION,
      overrides: { containerOverrides: [containerOverrides] },
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: config.ECS_SUBNETS,
          assignPublicIp: 'DISABLED'
        }
      }
    }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};
