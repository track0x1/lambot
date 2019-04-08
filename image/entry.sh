#!/bin/bash

# Load helper functions
source $(dirname $0)/utilities.sh

# If using Github status api, send pending
send_status pending

echo Setting up environment...
init_git
init_npmrc

echo Cloning repository...
fetch_repo

# Execute commands, then send status if applicable
eval $DOCKER_COMMANDS && send_status success || send_status failure
