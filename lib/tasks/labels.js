const githubClient = require('../clients/github');

// Newly opened pull-requests without labels will receive a friendly notice
module.exports = async function labelTask({ githubEvent, response }) {
  if (githubEvent === 'pull_request' && response.action === 'opened' && response.pull_request.labels.length === 0) {
    const repoName = response.repository.name;
    const repoOwner = response.repository.owner.login;
    const prNumber = response.number;

    // Post comment using the GitHub API
    await githubClient.post('comment', {
      repoOwner,
      repoName,
      prNumber,
      input: {
        body: '_Hi :wave:, it\'s Lambot!_\n\n' +
          'I noticed this pull request has no assigned labels. :cry:\n\n' +
          'Please remember to label your pull requests. That helps keep things organized around here. :slightly_smiling_face:'
      }
    })
  }

  return Promise.resolve();
};
