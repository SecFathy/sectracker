
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Building and deploying SecTracker Full Stack...${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if ports are available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    fi
    return 0
}

echo -e "${YELLOW}🔍 Checking ports...${NC}"
check_port 3000 || echo -e "${YELLOW}   Port 3000 (App) is in use${NC}"
check_port 5432 || echo -e "${YELLOW}   Port 5432 (PostgreSQL) is in use${NC}"
check_port 6379 || echo -e "${YELLOW}   Port 6379 (Redis) is in use${NC}"
check_port 8080 || echo -e "${YELLOW}   Port 8080 (Adminer) is in use${NC}"

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down --remove-orphans

# Remove existing images (optional, uncomment if needed)
# echo -e "${YELLOW}🗑️  Removing existing images...${NC}"
# docker-compose rm -f
# docker rmi $(docker images -q sectracker*) 2>/dev/null || true

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p logs
mkdir -p backups

# Build and start containers
echo -e "${GREEN}🔨 Building and starting containers...${NC}"
docker-compose up --build -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check service health
check_service_health() {
    local service=$1
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps | grep -q "$service.*healthy\|$service.*Up"; then
            echo -e "${GREEN}✅ $service is ready${NC}"
            return 0
        fi
        echo -e "${YELLOW}   Waiting for $service... (attempt $attempt/$max_attempts)${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}❌ $service failed to start properly${NC}"
    return 1
}

check_service_health "postgres"
check_service_health "redis"
check_service_health "app"

# Show container status
echo -e "\n${GREEN}📊 Container Status:${NC}"
docker-compose ps

# Display access information
echo -e "\n${GREEN}🎉 Deployment complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📱 Application:${NC}      http://localhost:3000"
echo -e "${GREEN}🗄️  Database Admin:${NC}   http://localhost:8080"
echo -e "${GREEN}   - Server: postgres${NC}"
echo -e "${GREEN}   - Username: sectracker_user${NC}"
echo -e "${GREEN}   - Password: sectracker_password${NC}"
echo -e "${GREEN}   - Database: sectracker${NC}"
echo -e "${GREEN}🔧 Direct DB Access:${NC}   localhost:5432"
echo -e "${GREEN}📊 Redis:${NC}             localhost:6379"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Show logs command
echo -e "\n${YELLOW}📋 Useful commands:${NC}"
echo -e "   View logs:       ${GREEN}docker-compose logs -f${NC}"
echo -e "   Stop services:   ${GREEN}docker-compose down${NC}"
echo -e "   Restart:         ${GREEN}docker-compose restart${NC}"
echo -e "   Backup DB:       ${GREEN}./scripts/backup.sh${NC}"

# Optional: Open browser (uncomment if desired)
# sleep 3
# if command_exists open; then
#     open http://localhost:3000
# elif command_exists xdg-open; then
#     xdg-open http://localhost:3000
# fi
