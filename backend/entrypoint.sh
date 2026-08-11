#!/usr/bin/env bash
set -e

export PYTHONPATH=/app

echo "🗄️ Running database migrations (Alembic)..."
alembic upgrade head || (echo "⚠️ Existing database schema detected. Stamping Alembic head..." && alembic stamp head)

echo "🚀 Starting Uvicorn API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000


