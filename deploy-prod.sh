#!/usr/bin/env bash
set -e

echo "🚀 Starting Arkan Game Docker Production Deployment..."

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
