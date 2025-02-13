#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f ".env" ]; then
    source .env
fi

# Check required environment variables
if [ -z "$ECR_REGISTRY" ]; then
    echo "ECR_REGISTRY environment variable is required"
    exit 1
fi

# Build and push services
SERVICES=("file-service" "analytics-service" "insights-service" "gateway")

for SERVICE in "${SERVICES[@]}"; do
    echo "Building $SERVICE..."
    
    # Navigate to service directory
    cd "services/$SERVICE"
    
    # Build Docker image
    docker build -t "$ECR_REGISTRY/$SERVICE:latest" .
    
    # Tag with timestamp
    TIMESTAMP=$(date +%Y%m%d%H%M%S)
    docker tag "$ECR_REGISTRY/$SERVICE:latest" "$ECR_REGISTRY/$SERVICE:$TIMESTAMP"
    
    # Push images
    echo "Pushing $SERVICE to ECR..."
    docker push "$ECR_REGISTRY/$SERVICE:latest"
    docker push "$ECR_REGISTRY/$SERVICE:$TIMESTAMP"
    
    # Return to root
    cd ../..
    
    echo "$SERVICE build complete"
done

# Build shared libraries
echo "Building shared libraries..."
cd shared
npm install
npm run build
cd ..

# Run tests
echo "Running tests..."
npm test

echo "Build process complete"