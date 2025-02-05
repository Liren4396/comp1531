#!/usr/bin/env bash

# NOTE: This file will be used in lab05_deploy. If you are currently working
# on lab05_forum, you can ignore it.

WORKING_DIRECTORY="/home/liren/www/cs1531/deploy"

# NOTE: change the credentials below as appropriate. the 
# The SSH_HOST can be found at the top of Remote Access -> SSH in Alwaysdata.
USERNAME="liren"
SSH_HOST="ssh-liren.alwaysdata.net" 

scp -r ./package.json ./tsconfig.json ./src "$USERNAME@$SSH_HOST:$WORKING_DIRECTORY"
ssh "$USERNAME@$SSH_HOST" "cd $WORKING_DIRECTORY && npm install --omit=dev"
