#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f ".env" ]; then
    source .env
fi

# Check required environment variables
if [ -z "$KUBERNETES_CLUSTER" ]; then
    echo "KUBERNETES_CLUSTER environment variable is required"
    exit 1
fi

# Update kubeconfig
aws eks update-kubeconfig --name $KUBERNETES_CLUSTER --region ${AWS_REGION:-us-west-2}

# Apply infrastructure configurations
echo "Applying infrastructure configurations..."

# Apply ConfigMaps and Secrets first
kubectl apply -f infrastructure/kubernetes/configmaps/
kubectl apply -f infrastructure/kubernetes/secrets/

# Apply database migrations
echo "Applying database migrations..."
cd services/insights-service
npm run migrate
cd ../..

# Deploy services
SERVICES=("file-service" "analytics-service" "insights-service" "gateway")

for SERVICE in "${SERVICES[@]}"; do
    echo "Deploying $SERVICE..."
    
    # Replace environment variables in kubernetes configs
    envsubst < "infrastructure/kubernetes/$SERVICE.yaml" > "infrastructure/kubernetes/$SERVICE-processed.yaml"
    
    # Apply Kubernetes configuration
    kubectl apply -f "infrastructure/kubernetes/$SERVICE-processed.yaml"
    
    # Clean up processed file
    rm "infrastructure/kubernetes/$SERVICE-processed.yaml"
    
    # Wait for deployment to complete
    kubectl rollout status deployment/$SERVICE
    
    echo "$SERVICE deployment complete"
done

# Apply HPA configurations
echo "Applying HPA configurations..."
kubectl apply -f infrastructure/kubernetes/hpa/

# Verify deployments
echo "Verifying deployments..."
kubectl get pods
kubectl get services

echo "Deployment complete"

# Monitor for any issues
echo "Monitoring deployments for issues..."
kubectl get events --sort-by=.metadata.creationTimestamp