
# SecTracker Docker Deployment

This guide explains how to deploy SecTracker completely offline using Docker and PostgreSQL.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. Make the deployment script executable:
   ```bash
   chmod +x deploy.sh
   ```

2. Run the deployment:
   ```bash
   ./deploy.sh
   ```

3. Access the application at `http://localhost:3000`

## Manual Deployment

If you prefer to run commands manually:

```bash
# Build and start all services
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Database Access

- **Host**: localhost
- **Port**: 5432
- **Database**: sectracker
- **Username**: sectracker_user
- **Password**: sectracker_password

## Data Persistence

All database data is stored in a Docker volume `postgres_data` and will persist between container restarts.

## Troubleshooting

1. **Port conflicts**: If port 3000 or 5432 are in use, modify the ports in `docker-compose.yml`

2. **Build errors**: Ensure all dependencies are properly installed:
   ```bash
   docker-compose build --no-cache
   ```

3. **Database connection issues**: Check if PostgreSQL container is running:
   ```bash
   docker-compose logs postgres
   ```

## Backup and Restore

### Backup
```bash
docker exec sectracker_db pg_dump -U sectracker_user sectracker > backup.sql
```

### Restore
```bash
docker exec -i sectracker_db psql -U sectracker_user sectracker < backup.sql
```
