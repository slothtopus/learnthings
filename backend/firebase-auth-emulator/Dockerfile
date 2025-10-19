FROM node:20-alpine

RUN npm i -g firebase-tools@14

WORKDIR /app
EXPOSE 9099 4000

# Defaults; can be overridden in compose/env
COPY firebase.json ./

# Start the Auth emulator; uses env for project + config path
CMD sh -lc 'firebase emulators:start \
  --only auth \
  --config /app/firebase.json \
  --import /data \
  --export-on-exit'
