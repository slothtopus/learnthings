rsync -avz --delete \
  --exclude '.env*' \
  --exclude 'node_modules' \
  --exclude 'secrets' \
  --exclude 'build' \
  --exclude 'couch_data' \
  --exclude 'docker-compose.override.yml' \
  --exclude 'firebase-auth-emulator' \
  ./ root@206.189.211.160:/app

scp .env.staging root@206.189.211.160:/app/.env

ssh root@206.189.211.160 'bash -s' <<'EOF'
cd /app
docker compose build --no-cache
docker compose up -d
EOF

