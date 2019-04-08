init_npmrc() {
  local NPM_TOKEN="YOUR_NPM_TOKEN_HERE"

  if [ -z "$NPM_TOKEN" ]; then
    echo "Missing NPM_TOKEN. Check that it exists in AWS SSM. Aborting..."
    exit 1
  fi

  npm config set _auth $NPM_TOKEN \
    && npm config set email your@email.com
}

init_git() {
  # Setup default user info
  git config --global user.email "YOUR_BOT_EMAIL_HERE"
  git config --global user.name Lambot
  git config --global push.default simple
}

fetch_repo() {
  local GIT_TOKEN="YOUR_GIT_TOKEN_HERE"

  if [ -z "$GIT_TOKEN" ]; then
    echo "Missing GIT_TOKEN. Check that it exists in AWS SSM. Aborting..."
    exit 1
  fi

  if [ -z "$GIT_REPO" ]; then
    echo "Missing GIT_REPO. Make sure it's being passed by Lambot. Aborting..."
    exit 1
  fi

  local GIT_REPO_URL=${GIT_REPO/https\:\/\//'https://'$GIT_TOKEN'@'}

  git clone --progress $GIT_REPO_URL repo
  cd repo

  if [ ! -z "$GIT_BRANCH" ]; then
    git checkout -q "$GIT_BRANCH"
  fi
}

push_changes() {
  if [ ! -z "$GIT_BRANCH" ]; then
    git push origin HEAD:$GIT_BRANCH --follow-tags
  else
    git push --follow-tags
  fi
}

get_version() {
  local commitMessage=$(git log -1 --pretty=%B)

  # ignore case sensitivity
  shopt -s nocasematch

  # determine the version to bump
  case "$commitMessage" in
    *"[breaking]"*) increment=major  ;;
    *"[feature]"*)  increment=minor  ;;
    *)              increment=patch  ;;
  esac

  # reenable case sensitivity
  shopt -u nocasematch

  echo "$increment"
}

# Posts to the Github Status API
send_status() {
  # Skip if GIT_STATUS_URL is not present
  if [ -z "$GIT_STATUS_URL" ]; then
    return 0
  fi

  local STATUS=$1
  local FULL_TASK_ARN=$(curl -s http://169.254.170.2/v2/metadata | jq -r .TaskARN)
  local TASK_ARN="${FULL_TASK_ARN##*/}"
  local LOGS_ENDPOINT="https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logEventViewer:group=lambot-ci;stream=ecs/instance/$TASK_ARN"
  local GIT_TOKEN="YOUR_GIT_TOKEN_HERE"

  # Validate external variables
  if [ -z "$GIT_TOKEN" ]; then
    echo "Missing GIT_TOKEN. Check that it exists in AWS SSM. Aborting..."
    exit 1
  fi

  if [ -z "$STATUS" ]; then
    echo "You must provide a status parameter when calling send_status."
    exit 1
  fi

  local DESCRIPTION=""
  if [ "$STATUS" = "pending" ]; then
    DESCRIPTION="in progress..."
  elif [ "$STATUS" = "success" ]; then
    DESCRIPTION="passed!"
  else
    DESCRIPTION="failure."
  fi

  # Create request payload
  local PAYLOAD=$(jq -n -r -c --arg state $STATUS --arg target_url $LOGS_ENDPOINT --arg description "Code review $DESCRIPTION"\
    '{state: $state, target_url: $target_url, description: $description, context: "lambot/codereview"}')

  # Send status to Github api
  curl -s -i -X POST -H "Authorization: token $GIT_TOKEN" -d "$PAYLOAD" "$GIT_STATUS_URL" > /dev/null
}
