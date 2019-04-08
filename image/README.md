# Lambot Continuous Integration Image

## Usage

This is an executable Docker image for use in AWS, preconfigured to work with Github repositories and npm.

By default, this image will (in sequence):
1. Attempt to send a pending Github status
* Initialize Github configuration
* Initialize npm configuration
* Clone the repository (and branch, if provided)
* Execute `DOCKER_COMMANDS`
* Attempt to send a success/failure Github status


## Functions

This image provides the following helper functions:

| Name          | Requires        | Description        |
| ------------- | ---------------- | ------------------ |
| init_npmrc    | SSM permissions  | Initializes .npmrc |
| init_git      | -                | Initializes .git configuration |
| fetch_repo    | SSM permissions, GIT_REPO, GIT_BRANCH (optional) | Clones a Git repository / branch and sets it to the working directory. |
| push_changes  | -                | Attempts to push changes & tags to origin. |
| get_version   | -                | Determines the next semantic version of an npm package based off the description of HEAD. |
| send_status(status) | SSM permissions, GIT_STATUS_URL (optional) | If GIT_STATUS_URL present, POST a status to the Github API. |

## Environment Variables

| Name            | Description        |
| --------------- | ------------------ |
| GIT_REPO        | Github repository clone URL |
| GIT_BRANCH      | Github branch |
| GIT_STATUS_URL  | URL in the format of: `https://api.github.com/repos/:owner/:repo/statuses/:sha` (Github API v3) |
| DOCKER_COMMANDS | Commands to `eval` |
