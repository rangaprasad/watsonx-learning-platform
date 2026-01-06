#!/usr/bin/env bash
set -euo pipefail

# Final Working Deployment for GenAI Learning Platform

: "${IBM_CLOUD_API_KEY:?Set IBM_CLOUD_API_KEY}"

PROJECT_NAME="genai-learning-platform"
NAMESPACE="ranga"
REGISTRY_SERVER="icr.io"
APP_IMAGE="${REGISTRY_SERVER}/${NAMESPACE}/genai-learning-platform:latest"

echo "=================================================="
echo "  Deploying GenAI Learning Platform"
echo "=================================================="
echo ""
echo "Using image: ${APP_IMAGE}"
echo ""

# 1. Select Code Engine project
echo "==> 1. Selecting Code Engine project"
ibmcloud ce project select -n "${PROJECT_NAME}"

# 2. Delete existing registry secret and recreate
echo ""
echo "==> 2. Recreating registry credentials"
ibmcloud ce registry delete --name icr-global --force 2>/dev/null || true

ibmcloud ce registry create \
  --name icr-global \
  --server "${REGISTRY_SERVER}" \
  --username iamapikey \
  --password "${IBM_CLOUD_API_KEY}"

echo "✅ Registry secret created"

# 3. Delete old application if exists
echo ""
echo "==> 3. Removing old application"
ibmcloud ce app delete --name "genai-learning-platform" --force --ignore-not-found
sleep 5

# 4. Create new application
echo ""
echo "==> 4. Creating application"
ibmcloud ce app create \
  --name "genai-learning-platform" \
  --image "${APP_IMAGE}" \
  --registry-secret icr-global \
  --port 3000 \
  --cpu 1 \
  --memory 2G \
  --min-scale 1 \
  --max-scale 5 \
  --env NODE_ENV=production

# 5. Wait for deployment
echo ""
echo "==> 5. Waiting for application to be ready..."
sleep 30

# 6. Get application details
echo ""
echo "==> 6. Application Status:"
ibmcloud ce app get --name "genai-learning-platform"

# 7. Get URL
APP_URL=$(ibmcloud ce app get --name "genai-learning-platform" 2>/dev/null | grep "URL:" | awk '{print $2}')

echo ""
echo "=================================================="
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "=================================================="
echo ""
echo "🎯 Your Platform is Live:"
echo "   ${APP_URL}"
echo ""
echo "🧪 Test it now:"
echo "   curl ${APP_URL}"
echo ""
echo "Or open in browser:"
echo "   open ${APP_URL}"
echo ""
echo "=================================================="
echo ""
echo "📊 View real-time logs:"
echo "   ibmcloud ce app logs --name genai-learning-platform --follow"
echo ""
echo "🔄 Check application status:"
echo "   ibmcloud ce app get --name genai-learning-platform"
echo ""
echo "🗑️  To delete:"
echo "   ibmcloud ce app delete --name genai-learning-platform --force"
echo ""
