#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="sae401-front-prod"
CONTAINER_NAME="sae401-front-prod"
HOST_PORT="443"
CONTAINER_PORT="443"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker n'est pas installé."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Impossible d'accéder au daemon Docker."
  echo "Essaie avec sudo, ou ajoute ton user au groupe docker:"
  echo "  sudo usermod -aG docker $USER && newgrp docker"
  exit 1
fi

echo "Build image frontend (production)..."
docker build -t "$IMAGE_NAME" "$PROJECT_DIR"

echo "Stop/remove ancien conteneur s'il existe..."
docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

echo "Run conteneur frontend sur https://localhost:${HOST_PORT}"
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  --restart unless-stopped \
  "$IMAGE_NAME"

echo "OK: conteneur lancé (${CONTAINER_NAME})"
