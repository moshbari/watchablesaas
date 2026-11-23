#!/bin/bash
# Adds the FAQ columns to Watchable's self-hosted database (Hetzner, Coolify stack wpef6ulojjbc22phcb6n3d5v).
DIR="$(cd "$(dirname "$0")" && pwd)"
SQL="$DIR/migrations/20261123170000_page_faq.sql"
DB=$(ssh hetzner 'docker ps --format "{{.Names}}" | grep -E "^supabase-db-wpef6ulojjbc22phcb6n3d5v" | head -1')
if [ -z "$DB" ]; then
  echo "Watchable database container not found. Database containers on the server:"
  ssh hetzner 'docker ps --format "{{.Names}}" | grep -i "db"'
  exit 1
fi
echo "database: $DB"
ssh hetzner "docker exec -i $DB psql -U postgres -d postgres -v ON_ERROR_STOP=1" < "$SQL" && echo "✅ FAQ columns added"
