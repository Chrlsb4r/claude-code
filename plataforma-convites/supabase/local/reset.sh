#!/usr/bin/env bash
# Recria o banco local de desenvolvimento (Postgres puro + shim do Supabase).
set -euo pipefail
cd "$(dirname "$0")/.."
DB="${DEV_DB:-convites_dev}"
URL="${DATABASE_ADMIN_URL:-postgres://postgres:postgres@127.0.0.1:5432/postgres}"
psql "$URL" -qc "drop database if exists $DB with (force)" -c "create database $DB"
DBURL="${URL%/*}/$DB"
psql "$DBURL" -q -v ON_ERROR_STOP=1 -c "set client_min_messages=error" -f local/00_supabase_shim.sql
for f in migrations/*.sql; do psql "$DBURL" -q -v ON_ERROR_STOP=1 -f "$f"; done
psql "$DBURL" -q -v ON_ERROR_STOP=1 -f seed.sql
echo "Banco $DB pronto."
