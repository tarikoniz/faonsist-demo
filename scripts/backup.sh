#!/bin/bash
# ============================================
# FaOnSisT - Database Backup Script
# Kullanım: ./scripts/backup.sh
# Cron: 0 2 * * * /path/to/scripts/backup.sh
# ============================================

set -euo pipefail

# Yapılandırma
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DB_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/faonsist}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/faonsist_${TIMESTAMP}.sql.gz"

# Renk kodları
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}[FaOnSisT Backup]${NC} Başlatılıyor..."
echo "  Tarih: $(date)"
echo "  Hedef: ${BACKUP_FILE}"

# Backup dizini oluştur
mkdir -p "${BACKUP_DIR}"

# Database URL'den bilgileri çıkar
DB_HOST=$(echo "$DB_URL" | sed -n 's|.*@\(.*\):.*|\1|p' | cut -d/ -f1)
DB_PORT=$(echo "$DB_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
DB_NAME=$(echo "$DB_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
DB_USER=$(echo "$DB_URL" | sed -n 's|.*://\(.*\):.*@.*|\1|p')

echo "  Veritabanı: ${DB_NAME}@${DB_HOST}:${DB_PORT}"

# Yedekleme al
if command -v pg_dump &> /dev/null; then
  pg_dump "$DB_URL" --clean --if-exists --no-owner | gzip > "${BACKUP_FILE}"
elif command -v docker &> /dev/null && docker ps -q -f name=faonsist-db &> /dev/null; then
  echo -e "${YELLOW}[Info]${NC} pg_dump bulunamadı, Docker container kullanılıyor..."
  docker exec faonsist-db pg_dump -U "${DB_USER}" "${DB_NAME}" --clean --if-exists --no-owner | gzip > "${BACKUP_FILE}"
else
  echo -e "${RED}[Hata]${NC} pg_dump veya Docker bulunamadı!"
  exit 1
fi

# Boyut kontrol
BACKUP_SIZE=$(du -sh "${BACKUP_FILE}" | cut -f1)
echo -e "${GREEN}[OK]${NC} Yedek alındı: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Eski yedekleri temizle
DELETED=$(find "${BACKUP_DIR}" -name "faonsist_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l | tr -d ' ')
if [ "$DELETED" -gt 0 ]; then
  echo -e "${YELLOW}[Temizlik]${NC} ${DELETED} eski yedek silindi (>${RETENTION_DAYS} gün)"
fi

# Mevcut yedekleri listele
TOTAL_BACKUPS=$(find "${BACKUP_DIR}" -name "faonsist_*.sql.gz" | wc -l | tr -d ' ')
TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" 2>/dev/null | cut -f1)
echo -e "${GREEN}[Özet]${NC} Toplam: ${TOTAL_BACKUPS} yedek, ${TOTAL_SIZE} alan"
echo -e "${GREEN}[Tamamlandı]${NC} $(date)"
