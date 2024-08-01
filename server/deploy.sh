#!/bin/bash

user=canopi
host=docker.canopi.com.au

# Compress Folder Contents (uses .gitignore values)
git archive -o app.tar.gz main

# Transfer Files to said folder '~/auto-deploy'
scp app.tar.gz .env $user@$host:~/auto-deploy

ssh $user@$host << EOF
  cd ~/auto-deploy
  tar xvzf app.tar.gz

  # Cleanup if exists
#   docker container rm -f azure_log_reader
#   docker image rm -f canopi/azure_log_reader:latest

  # Build, Remove and Deploy Container
  docker build --no-cache -t canopi/azure_log_reader:latest .
    
  docker run \
    --name azure_log_reader \
    -v ~/DATA/azure_log_reader:/app/dist/bin \
    -p 7878:7878 \
    -dit \
    --restart=unless-stopped \
    canopi/azure_log_reader:latest

  docker network connect INTERNAL azure_log_reader

  # Cleanup Files
  ls -l
  rm -rf ~/auto-deploy/*

  # Check Docker
  docker ps | grep azure_log_reader

  # Disconnect
  exit
EOF

rm -f app.tar.gz