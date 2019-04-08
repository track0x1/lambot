const github = require('../clients/github');
const spawnDockerTask = require('../clients/docker');
const config = require('../config');

const makeStatusClient = (repoOwner, repoName, commitSha) => async (status, message) => {
  await githubClient.post('status', {
    repoOwner,
    repoName,
    commitSha,
    input: {
      state: status,
      description: message,
      context: `lambot/codereview`
      // target_url (set in Docker task when calling send_status)
    }
  })
    .catch((err) => {
      console.error('Failed to send status to Github.', err);
    });
};

// Automatically version and publish repositories that are npm packages
module.exports = async function codereview({ githubEvent, response, taskConfig }) {
  // Only listen to push events, ignore commits from bot
  if (githubEvent !== 'push' ||
    response.head_commit.author.username === config.BOT_NAME) {
    return Promise.resolve();
  }

  const GIT_REPO_OWNER = response.repository.owner.login;
  const GIT_REPO_NAME = response.repository.name;
  const COMMIT_SHA = response.head_commit.id;
  const sendStatus = makeStatusClient(GIT_REPO_OWNER, GIT_REPO_NAME, COMMIT_SHA);

  // Update status to 'pending'
  await sendStatus('pending', 'Code review in queue...');

  return spawnDockerTask({
    GIT_REPO: response.repository.clone_url,
    GIT_BRANCH: response.ref.replace('refs/heads/', ''),
    GIT_STATUS_URL: `https://api.github.com/repos/${GIT_REPO_OWNER}/${GIT_REPO_NAME}/statuses/${COMMIT_SHA}`,
    // Since we are passing these to `eval` they need to be joined together
    DOCKER_COMMANDS: taskConfig.commands.join('&&')
  })
    .catch(async (err) => {
      console.error('Unable to run task in ECS.', err);

      // Update status to 'error'
      await sendStatus('error', 'Uh oh. An error has occurred.');
    });
};
