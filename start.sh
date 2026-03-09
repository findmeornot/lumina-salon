#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[Lumina] Root: ${ROOT_DIR}"

# Railway sets PORT automatically. HOST must be 0.0.0.0 for public access.
export HOST="${HOST:-0.0.0.0}"
export PORT="${PORT:-5000}"
export NODE_ENV="${NODE_ENV:-production}"

FRONTEND_DIR="${ROOT_DIR}/frontend"
BACKEND_DIR="${ROOT_DIR}/backend"

# Build frontend if dist is missing (useful when Railway doesn't run a build step).
if [[ ! -f "${FRONTEND_DIR}/dist/index.html" ]]; then
  echo "[Lumina] frontend/dist missing. Building frontend..."
  if [[ ! -d "${FRONTEND_DIR}/node_modules" ]]; then
    echo "[Lumina] Installing frontend deps..."
    npm ci --prefix "${FRONTEND_DIR}" --include=dev
  fi
  npm run build --prefix "${FRONTEND_DIR}"
else
  echo "[Lumina] frontend/dist exists. Skipping frontend build."
fi

if [[ ! -d "${BACKEND_DIR}/node_modules" ]]; then
  echo "[Lumina] Installing backend deps..."
  npm ci --prefix "${BACKEND_DIR}" --omit=dev
fi

echo "[Lumina] Starting backend on ${HOST}:${PORT} (NODE_ENV=${NODE_ENV})"
exec node "${BACKEND_DIR}/src/server.js"

