const dockerClient = require('../clients/docker');
const config = require('../config');

// Automatically version and publish repositories that are npm packages
module.exports = async function semverTask({ githubEvent, response }) {
  // Only listen to push events on master (we don't want to version + publish every branch!),
  // ignore commits from our bot (to avoid an infinite loop of versioning + publishing)
  // ignore [ci skip] commits
  if (githubEvent !== 'push' ||
    response.head_commit.author.username === config.BOT_NAME ||
    response.head_commit.message.includes('[ci skip]') ||
    response.ref !== 'refs/heads/master'
  ) {
    return Promise.resolve();
  }

  // get_version and push_changes are helper functions baked into our Docker image
  const commands = [
    'echo "Installing node modules..."',
    'npm ci',
    // Determine next version
    'increment=$(get_version)',
    // Create versioned commit; publish package; push versioned commit & tag
    'echo "Bumping version (type: $increment), publishing, and pushing..."',
    'npm version $increment',
    'npm publish',
    'push_changes'
  ];

  // Run the semver utility in our custom docker image
  return dockerClient({
    GIT_REPO: response.repository.clone_url,
    GIT_BRANCH: response.ref,
    DOCKER_COMMANDS: commands.join('&&')
  });
};
