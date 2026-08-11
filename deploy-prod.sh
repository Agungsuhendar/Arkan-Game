#!/usr/bin/env bash
set -e

echo "🚀 Starting Arkan Game Docker Production Deployment..."

# 0. Environment pre-flight check
if [ ! -f .env ]; then
  echo "❌ ERROR: .env file not found!"
  echo "   Please copy .env.example to .env and configure strong production credentials:"
  echo "   cp .env.example .env"
  exit 1
fi

echo "🔐 Validating production environment variables..."
if grep -q "change_this_to_a_secure" .env; then
  echo "⚠️ WARNING: Default placeholder credentials detected in .env file!"
  echo "   Please update POSTGRES_PASSWORD, MINIO_ROOT_PASSWORD, and SECRET_KEY in .env before running production deployment."
  exit 1
fi

# 1. Clean macOS hidden dot underscore files
echo "🧹 Cleaning dot-underscore files..."
find . -name "._*" -delete 2>/dev/null || true

# 2. Build and start containers with docker compose
echo "📦 Building and starting Docker containers..."
docker compose up -d --build

# 3. Check status
echo "📊 STATUS Check:"
docker compose ps

echo "✅ Production Deployment Complete!"
echo "🌐 Public Website: https://mini.arsaku.web.id"

