const httpie = require('httpie');
const config = require('../config');

const GITHUB_API = 'https://api.github.com/repos';
const creds = `${config.BOT_TOKEN}:x-oauth-basic`;
const auth = Buffer.from(creds).toString('base64');

// GitHub client makes authenticated requests to the GitHub REST API
const supportedPostTypes = ['comment', 'status'];
const supportedGetTypes = ['config'];

exports.post = function (type, { repoOwner, repoName, prNumber, commitSha, input }) {
  if (!supportedPostTypes.includes(type)) throw new Error('Unsupported request type.');

  let url;

  if (type === 'comment') {
    url = `${GITHUB_API}/${repoOwner}/${repoName}/issues/${prNumber}/comments`;
  } else if (type === 'status') {
    url = `${GITHUB_API}/${repoOwner}/${repoName}/statuses/${commitSha}`;
  }

  return httpie.post(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    },
    body: input ? JSON.stringify(input) : undefined
  });
}

exports.get = function (type, { repoOwner, repoName }) {
  if (!supportedGetTypes.includes(type)) throw new Error('Unsupported request type.');

  let url;

  if (type === 'config') {
    url = `${GITHUB_API}/${repoOwner}/${repoName}/contents/lambot.yml`;
  }

  return httpie.get(url, {
    headers: {
      'Authorization': `Basic ${auth}`
    }
  });
}
