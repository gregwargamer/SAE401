#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: bash front/run-tunnel.sh <CLOUDFLARE_TUNNEL_TOKEN>"
  exit 1
fi

TOKEN="$1"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker n'est pas installé."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker inaccessible (daemon/socket)."
  echo "Relance avec sudo:"
  echo "  sudo bash front/run-tunnel.sh <TOKEN>"
  exit 1
fi

docker rm -f cloudflared >/dev/null 2>&1 || true

docker run -d \
  --name cloudflared \
  --restart unless-stopped \
  --network host \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --token "$TOKEN"

docker ps --filter name=cloudflared --format 'table {{.Names}}\t{{.Status}}'
echo "Tunnel Cloudflare lancé."
