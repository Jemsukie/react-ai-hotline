#!/usr/bin/env bash
# Build and start the app with docker-compose (port 4000).
# Usage: ./docker-up.sh [up|down|logs|restart|build]
set -euo pipefail

cd "$(dirname "$0")"

ACTION="${1:-up}"

case "$ACTION" in
  up)
    docker-compose up -d --build
    echo "App running at http://localhost:4000"
    echo "Health: http://localhost:4000/health"
    ;;
  down)
    docker-compose down
    ;;
  logs)
    docker-compose logs -f
    ;;
  restart)
    docker-compose restart
    ;;
  build)
    docker-compose build
    ;;
  *)
    echo "Usage: $0 [up|down|logs|restart|build]"
    exit 1
    ;;
esac
