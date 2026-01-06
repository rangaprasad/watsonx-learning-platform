#!/bin/bash
set -e

echo "🚀 Deploying Code Execution Backend to IBM Cloud (as App)"
echo "=========================================================="

# Configuration
PROJECT_NAME="genai-learning-platform"
EXECUTOR_IMAGE="code-executor"
REGISTRY="icr.io/ranga"

# Step 1: Build Docker image
echo ""
echo "📦 Step 1: Building Docker image..."
docker build --platform linux/amd64 -t ${EXECUTOR_IMAGE}:latest .

# Step 2: Tag for IBM Cloud Registry
echo ""
echo "🏷️  Step 2: Tagging image for IBM Cloud..."
docker tag ${EXECUTOR_IMAGE}:latest ${REGISTRY}/${EXECUTOR_IMAGE}:latest

# Step 3: Push to IBM Cloud Registry
echo ""
echo "☁️  Step 3: Pushing to IBM Cloud Registry..."
docker push ${REGISTRY}/${EXECUTOR_IMAGE}:latest

# Step 4: Create registry secret if it doesn't exist
echo ""
echo "🔐 Step 4: Setting up registry access..."

# Check if secret exists
if ! ibmcloud ce secret get --name icr-secret &>/dev/null; then
    echo "   Creating registry secret..."
    echo "   NOTE: You'll need to create an IBM Cloud API key if you don't have one"
    
    # Try to get existing API key from environment or create new one
    if [ -z "$IBMCLOUD_API_KEY" ]; then
        echo "   Creating new API key..."
        API_KEY=$(ibmcloud iam api-key-create ce-registry-$(date +%s) -d "Code Engine registry access" --output json 2>/dev/null | grep '"apikey"' | cut -d'"' -f4)
    else
        API_KEY="$IBMCLOUD_API_KEY"
    fi
    
    ibmcloud ce secret create \
        --name icr-secret \
        --format registry \
        --server icr.io \
        --username iamapikey \
        --password "$API_KEY"
else
    echo "   Registry secret already exists ✓"
fi

# Step 5: Deploy to Code Engine as APP (not Job)
echo ""
echo "🚢 Step 5: Deploying to IBM Cloud Code Engine (as App)..."

# Select project
ibmcloud ce project select -n ${PROJECT_NAME}

# Check if app exists
if ibmcloud ce app get --name code-executor &>/dev/null; then
    echo "   Updating existing app..."
    ibmcloud ce app update \
        --name code-executor \
        --image ${REGISTRY}/${EXECUTOR_IMAGE}:latest \
        --registry-secret icr-secret \
        --cpu 1 \
        --memory 2G \
        --min-scale 0 \
        --max-scale 5 \
        --port 8080
else
    echo "   Creating new app..."
    ibmcloud ce app create \
        --name code-executor \
        --image ${REGISTRY}/${EXECUTOR_IMAGE}:latest \
        --registry-secret icr-secret \
        --cpu 1 \
        --memory 2G \
        --min-scale 0 \
        --max-scale 5 \
        --port 8080
fi

# Step 6: Get the app URL
echo ""
echo "🌐 Step 6: Getting app URL..."
APP_URL=$(ibmcloud ce app get --name code-executor --output json | grep -o '"url":"[^"]*' | cut -d'"' -f4)

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 App Details:"
echo "   Name: code-executor"
echo "   URL: ${APP_URL}"
echo ""
echo "🧪 Test the API:"
echo "   Health check:"
echo "   curl ${APP_URL}/health"
echo ""
echo "   Execute code:"
echo "   curl -X POST ${APP_URL}/execute \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"code\": \"print(\\\"Hello from IBM Cloud!\\\")\", \"timeout\": 5}'"
echo ""
echo "💡 Usage from Next.js:"
echo "   Update API_ENDPOINT in your app to: ${APP_URL}"
echo ""
