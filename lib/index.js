const crypto = require('crypto');
const yaml = require('js-yaml');
const githubClient = require('./clients/github');
const tasks = require('./tasks');
const config = require('./config');

// Simple utility functions
const signRequestBody = (key, body) => `sha1=${crypto.createHmac('sha1', key).update(body, 'utf-8').digest('hex')}`;
const respond = (status, body) => ({
  statusCode: status,
  headers: { 'Content-Type': 'text/plain' },
  body: typeof body === 'object' ? JSON.stringify(body) : body
});

// Helper function that attempts to run a task
function runTask(name, taskData) {
  // Ensure valid task provided
  if (!tasks[name]) return Promise.reject(`Invalid task name of '${name}' provided.`);
  return tasks[name].call(null, taskData);
}

// This is our lambda function
module.exports = async (event, context, callback) => {
  const headers = event.headers;
  const sig = headers['X-Hub-Signature'];
  const githubEvent = headers['X-GitHub-Event'];
  const id = headers['X-GitHub-Delivery'];
  const calculatedSig = signRequestBody(awsConst.webhookSecret, event.body);
  const response = JSON.parse(event.body);
  const repoOwner = response.repository.owner.login;
  const repoName = response.repository.name;
  let errMsg;

  // Validate headers
  if (!sig) {
    errMsg = 'No X-Hub-Signature found on request';
    return callback(null, respond(401, errMsg));
  }

  if (!githubEvent) {
    errMsg = 'No X-Github-Event found on request';
    return callback(null, respond(422, errMsg));
  }

  if (!id) {
    errMsg = 'No X-Github-Delivery found on request';
    return callback(null, respond(401, errMsg));
  }

  if (sig !== calculatedSig) {
    errMsg = 'X-Hub-Signature incorrect. Github webhook token doesn\'t match';
    return callback(null, respond(401, errMsg));
  }

  // Respond to health checks
  if (githubEvent === 'ping') {
    return callback(null, respond(200, 'pong'));
  }

  // Retrieve lambot.yml
  // If missing, hook failure (lambot.yml is required)
  // Else, load and execute tasks
  const pendingTasks = await githubClient.get('config', { repoOwner, repoName })
  .then((res) => yaml.safeLoad(Buffer.from(res.data.content, 'base64')))
  .then((config) =>
  Object.keys(config.hooks).reduce((acc, hook) => {
    // If hook is enabled, attempt to run it and push to pending task queue
    if (config.hooks[hook]) {
      acc.push(runTask(hook, { githubEvent, response, config: config.hooks[hook] }));
    }
    return acc;
  }, []))
  .catch(() => {
    callback(null, respond(500, 'Missing or invalid lambot.yml.'));
    process.exit(0);
  })

  // Wait for all tasks to run
  await Promise.all(pendingTasks).catch(() => {
    callback(null, respond(500, 'Task runtime error.'));
    process.exit(0);
  });;

  return callback(null, respond(200, 'Success'));
}
