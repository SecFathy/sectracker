
#!/bin/bash

# Database restore script
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    echo "Available backups:"
    ls -la ./backups/*.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE=$1

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  This will replace all data in the database. Are you sure? (y/N)${NC}"
read -r response
if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${YELLOW}❌ Restore cancelled${NC}"
    exit 0
fi

echo -e "${GREEN}🔄 Restoring database from: $BACKUP_FILE${NC}"

# Decompress and restore
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | docker exec -i sectracker_db psql -U sectracker_user -d sectracker
else
    cat $BACKUP_FILE | docker exec -i sectracker_db psql -U sectracker_user -d sectracker
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database restored successfully${NC}"
else
    echo -e "${RED}❌ Restore failed${NC}"
    exit 1
fi
