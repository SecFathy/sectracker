
# SecTracker Full Stack Docker Deployment

This guide explains how to deploy SecTracker as a complete full-stack application using Docker with PostgreSQL database, Redis cache, and Nginx web server.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (3000)  │    │  PostgreSQL     │    │   Redis Cache   │
│   Web Server    │    │   (5432)        │    │    (6379)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    Adminer      │
                    │    (8080)       │
                    └─────────────────┘
```

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ available RAM
- Ports 3000, 5432, 6379, 8080 available

## Quick Start

### Production Deployment

```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy the full stack
./deploy.sh
```

### Development Mode

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

## Manual Deployment

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

## Services

### Application (Port 3000)
- **URL**: http://localhost:3000
- **Technology**: React + Vite + Nginx
- **Features**: Security checklists, bug tracking, notes
- **Health Check**: http://localhost:3000/health

### Database (Port 5432)
- **Host**: localhost
- **Port**: 5432
- **Database**: sectracker
- **Username**: sectracker_user
- **Password**: sectracker_password
- **Health Check**: Automatic via pg_isready

### Database Admin (Port 8080)
- **URL**: http://localhost:8080
- **Tool**: Adminer
- **Server**: postgres
- **Credentials**: Same as database

### Redis Cache (Port 6379)
- **Host**: localhost
- **Port**: 6379
- **Usage**: Session storage, caching
- **Health Check**: Redis ping

## Data Management

### Backup Database
```bash
# Using the backup script
chmod +x scripts/backup.sh
./scripts/backup.sh

# Manual backup
docker exec sectracker_db pg_dump -U sectracker_user sectracker > backup.sql
```

### Restore Database
```bash
# Using the restore script
chmod +x scripts/restore.sh
./scripts/restore.sh backups/sectracker_backup_YYYYMMDD_HHMMSS.sql.gz

# Manual restore
cat backup.sql | docker exec -i sectracker_db psql -U sectracker_user sectracker
```

### Volume Management
```bash
# List volumes
docker volume ls

# Backup volume
docker run --rm -v sectracker_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v sectracker_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_data_backup.tar.gz -C /data
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | production |
| `VITE_DATABASE_URL` | PostgreSQL connection | postgresql://sectracker_user:sectracker_password@postgres:5432/sectracker |
| `VITE_SUPABASE_URL` | Supabase URL (offline mode) | http://localhost:3000 |
| `VITE_SUPABASE_ANON_KEY` | Supabase key (offline mode) | offline_mode |
| `REDIS_URL` | Redis connection | redis://redis:6379 |

### Custom Configuration

1. **Database Settings**: Modify `docker-compose.yml` environment section
2. **Nginx Settings**: Edit `nginx.conf`
3. **Application Settings**: Use the Configuration modal at http://localhost:3000

## Monitoring

### Health Checks
```bash
# Check all services
docker-compose ps

# Check individual service health
docker inspect sectracker_app --format='{{.State.Health.Status}}'
docker inspect sectracker_db --format='{{.State.Health.Status}}'
docker inspect sectracker_redis --format='{{.State.Health.Status}}'
```

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   lsof -i :3000
   lsof -i :5432
   
   # Modify ports in docker-compose.yml
   ```

2. **Permission Issues**
   ```bash
   # Fix script permissions
   chmod +x deploy.sh scripts/*.sh
   ```

3. **Database Connection Issues**
   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres
   
   # Test connection
   docker exec -it sectracker_db psql -U sectracker_user -d sectracker
   ```

4. **Build Failures**
   ```bash
   # Clean rebuild
   docker-compose down --volumes
   docker system prune -f
   docker-compose up --build
   ```

### Performance Tuning

1. **Increase PostgreSQL Memory**
   ```yaml
   # In docker-compose.yml
   postgres:
     command: postgres -c shared_buffers=256MB -c max_connections=200
   ```

2. **Nginx Worker Processes**
   ```nginx
   # In nginx.conf
   worker_processes auto;
   ```

3. **Redis Memory Limit**
   ```yaml
   # In docker-compose.yml
   redis:
     command: redis-server --maxmemory 256mb
   ```

## Security Considerations

- Default passwords should be changed in production
- Enable SSL/TLS for external access
- Configure firewall rules
- Regular security updates
- Backup encryption

## Development

### Hot Reload Development
```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# The application will reload automatically on code changes
```

### Database Development
```bash
# Access development database
docker exec -it sectracker_db psql -U dev_user -d sectracker_dev

# Run migrations
docker exec sectracker_db psql -U dev_user -d sectracker_dev -f /docker-entrypoint-initdb.d/01-schema.sql
```

## Maintenance

### Regular Tasks
- Database backups (automated in backup script)
- Log rotation
- Security updates
- Performance monitoring

### Scaling
- Add load balancer for multiple app instances
- Database read replicas
- Redis clustering
- CDN for static assets

## Support

For issues and questions:
1. Check container logs: `docker-compose logs -f`
2. Verify service health: `docker-compose ps`
3. Review this documentation
4. Check application configuration at http://localhost:3000
