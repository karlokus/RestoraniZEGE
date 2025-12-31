#!/bin/bash

# Script za pregled podataka u bazi
# Korištenje: ./view-db.sh

PSQL="/opt/homebrew/opt/postgresql@16/bin/psql"
DB_NAME="RestoraniZEGE"
DB_USER="ivang"

echo "=== KORISNICI ==="
$PSQL -U $DB_USER -d $DB_NAME -c "SELECT id, \"firstName\", \"lastName\", email, role FROM \"user\";"

echo ""
echo "=== RESTORANI ==="
$PSQL -U $DB_USER -d $DB_NAME -c "SELECT id, name, role, adress, city FROM restaurant;"

echo ""
echo "=== SVE TABLICE ==="
$PSQL -U $DB_USER -d $DB_NAME -c "\dt"

