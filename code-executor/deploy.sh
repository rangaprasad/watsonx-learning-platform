#!/bin/bash
set -e

echo "🚀 Deploying Code Execution Backend to IBM Cloud"
echo "================================================"

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

# Step 4: Deploy to Code Engine
echo ""
echo "🚢 Step 4: Deploying to IBM Cloud Code Engine..."

# Select project
ibmcloud ce project select -n ${PROJECT_NAME}

# Check if job exists
if ibmcloud ce job get --name code-executor &>/dev/null; then
    echo "   Updating existing job..."
    ibmcloud ce job update \
        --name code-executor \
        --image ${REGISTRY}/${EXECUTOR_IMAGE}:latest \
        --cpu 1 \
        --memory 2G \
        --maxexecutiontime 30 \
        --retrylimit 0
else
    echo "   Creating new job..."
    ibmcloud ce job create \
        --name code-executor \
        --image ${REGISTRY}/${EXECUTOR_IMAGE}:latest \
        --cpu 1 \
        --memory 2G \
        --maxexecutiontime 30 \
        --retrylimit 0
fi

# Step 5: Test the deployment
echo ""
echo "🧪 Step 5: Testing deployment..."
TEST_CODE='{"code": "print(\"Hello from Code Executor!\")", "timeout": 5}'

echo "   Submitting test job..."
JOB_RUN_NAME="test-$(date +%s)"
ibmcloud ce jobrun submit \
    --name ${JOB_RUN_NAME} \
    --job code-executor \
    --wait \
    --quiet

echo "   Checking logs..."
ibmcloud ce jobrun logs --name ${JOB_RUN_NAME}

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update API route in Next.js app"
echo "   2. Test from frontend"
echo "   3. Monitor usage and costs"
echo ""
echo "💡 Usage:"
echo "   ibmcloud ce jobrun submit --name exec-test --job code-executor"
echo "   ibmcloud ce job get --name code-executor"
echo "   ibmcloud ce jobrun logs --name exec-test"
echo ""
