#!/usr/bin/env bash
set -euo pipefail

SERVER_USER=${SERVER_USER:-"your_user"}
SERVER_HOST=${SERVER_HOST:-"your-server-ip"}
DEPLOY_DIR=${DEPLOY_DIR:-"/opt/aoe2"}
CONTAINER_NAME=${CONTAINER_NAME:-"aoe2-app"}
IMAGE_NAME=${IMAGE_NAME:-"aoe2-app"}
HOST_PORT=${HOST_PORT:-"8080"}
DB_PATH=${DB_PATH:-"$DEPLOY_DIR/match_history.db"}

PACKAGE="aoe2-deploy.tar.gz"

echo "==> Packaging source..."
tar -czf "$PACKAGE" \
  --exclude='web/node_modules' \
  --exclude='web/client/node_modules' \
  --exclude='web/client/dist' \
  --exclude='*.db' \
  --exclude='.git' \
  --exclude="$PACKAGE" \
  .

echo "==> Copying to $SERVER_USER@$SERVER_HOST..."
ssh "$SERVER_USER@$SERVER_HOST" "mkdir -p $DEPLOY_DIR"
scp "$PACKAGE" "$SERVER_USER@$SERVER_HOST:$DEPLOY_DIR/$PACKAGE"
rm "$PACKAGE"

echo "==> Building and restarting on server..."
ssh "$SERVER_USER@$SERVER_HOST" bash -s <<EOF
set -euo pipefail
cd "$DEPLOY_DIR"

echo "  -> Extracting..."
tar -xzf "$PACKAGE" && rm "$PACKAGE"

echo "  -> Building image..."
docker build -t "$IMAGE_NAME" .

echo "  -> Restarting container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm   "$CONTAINER_NAME" 2>/dev/null || true
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "$HOST_PORT:3001" \
  -v "$DB_PATH:/data/match_history.db" \
  "$IMAGE_NAME"

echo "  -> Pruning old images..."
docker image prune -f
EOF

echo "==> Done. App running at http://$SERVER_HOST:$HOST_PORT"
