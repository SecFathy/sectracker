
#!/bin/bash

echo "Building and deploying SecTracker with Docker..."

# Stop existing containers
docker-compose down

# Remove existing images
docker-compose rm -f

# Build and start containers
docker-compose up --build -d

echo "Deployment complete!"
echo "Application will be available at http://localhost:3000"
echo "PostgreSQL database is running on port 5432"

# Show container status
docker-compose ps
