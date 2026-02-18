#!/bin/bash
# ============================================
# FaOnSisT - Production Deploy Script
# Usage: ./scripts/deploy.sh [up|down|restart|logs|seed|migrate|backup|status]
# ============================================

set -euo pipefail

COMPOSE_FILE="docker-compose.yml"
APP_SERVICE="app"
DB_SERVICE="db"
BACKUP_DIR="./backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ------------------------------------------
# Check prerequisites
# ------------------------------------------
check_env() {
    if [ ! -f ".env" ]; then
        log_error ".env file not found!"
        log_info "Copy .env.production.example to .env and fill in your values:"
        log_info "  cp .env.production.example .env"
        exit 1
    fi
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH."
        exit 1
    fi
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose v2 is required."
        exit 1
    fi
}

# ------------------------------------------
# Commands
# ------------------------------------------
cmd_up() {
    check_env
    log_info "Building and starting FaOnSisT..."
    docker compose -f "$COMPOSE_FILE" up -d --build
    log_info "FaOnSisT is starting at http://localhost:3000"
    log_info "Run './scripts/deploy.sh logs' to follow output."
}

cmd_down() {
    log_info "Stopping FaOnSisT..."
    docker compose -f "$COMPOSE_FILE" down
    log_info "All services stopped."
}

cmd_restart() {
    log_info "Restarting app service..."
    docker compose -f "$COMPOSE_FILE" restart "$APP_SERVICE"
    log_info "App service restarted."
}

cmd_logs() {
    docker compose -f "$COMPOSE_FILE" logs -f "$APP_SERVICE"
}

cmd_seed() {
    log_info "Running database seed..."
    if docker compose -f "$COMPOSE_FILE" exec "$APP_SERVICE" test -f prisma/seed.ts 2>/dev/null; then
        docker compose -f "$COMPOSE_FILE" exec "$APP_SERVICE" npx prisma db seed
    elif docker compose -f "$COMPOSE_FILE" exec "$APP_SERVICE" test -f prisma/seed.sql 2>/dev/null; then
        log_info "Seeding via seed.sql..."
        docker compose -f "$COMPOSE_FILE" exec -T "$DB_SERVICE" \
            psql -U "${POSTGRES_USER:-faonsist}" -d "${POSTGRES_DB:-faonsist}" \
            < prisma/seed.sql
    else
        log_error "No seed file found (prisma/seed.ts or prisma/seed.sql)."
        exit 1
    fi
    log_info "Database seeded successfully."
}

cmd_migrate() {
    log_info "Running Prisma migrations..."
    docker compose -f "$COMPOSE_FILE" exec "$APP_SERVICE" npx prisma migrate deploy
    log_info "Migrations applied successfully."
}

cmd_backup() {
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="${BACKUP_DIR}/faonsist_${TIMESTAMP}.sql"
    log_info "Creating database backup..."
    docker compose -f "$COMPOSE_FILE" exec -T "$DB_SERVICE" \
        pg_dump -U "${POSTGRES_USER:-faonsist}" -d "${POSTGRES_DB:-faonsist}" \
        --no-owner --no-privileges \
        > "$BACKUP_FILE"
    log_info "Backup saved to: $BACKUP_FILE"
    log_info "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
}

cmd_status() {
    docker compose -f "$COMPOSE_FILE" ps
}

# ------------------------------------------
# Main
# ------------------------------------------
check_docker

case "${1:-help}" in
    up)       cmd_up ;;
    down)     cmd_down ;;
    restart)  cmd_restart ;;
    logs)     cmd_logs ;;
    seed)     cmd_seed ;;
    migrate)  cmd_migrate ;;
    backup)   cmd_backup ;;
    status)   cmd_status ;;
    *)
        echo ""
        echo "FaOnSisT Deploy Script"
        echo "======================"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  up        Build and start all services"
        echo "  down      Stop all services"
        echo "  restart   Restart the app service"
        echo "  logs      Follow app service logs"
        echo "  seed      Seed the database"
        echo "  migrate   Run Prisma migrations"
        echo "  backup    Create a database backup"
        echo "  status    Show service status"
        echo ""
        exit 0
        ;;
esac
