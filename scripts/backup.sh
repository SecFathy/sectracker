
#!/bin/bash

# Database backup script
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/sectracker_backup_$TIMESTAMP.sql"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo -e "${GREEN}🗄️  Creating database backup...${NC}"

# Create backup
docker exec sectracker_db pg_dump -U sectracker_user -d sectracker > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup created successfully: $BACKUP_FILE${NC}"
    
    # Compress the backup
    gzip $BACKUP_FILE
    echo -e "${GREEN}✅ Backup compressed: $BACKUP_FILE.gz${NC}"
    
    # Keep only last 10 backups
    ls -t $BACKUP_DIR/*.gz | tail -n +11 | xargs -r rm
    echo -e "${GREEN}🧹 Old backups cleaned up${NC}"
else
    echo -e "${RED}❌ Backup failed${NC}"
    rm -f $BACKUP_FILE
    exit 1
fi
