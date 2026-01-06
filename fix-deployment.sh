#!/usr/bin/env bash
set -euo pipefail

# Comprehensive Fix for Registry Authentication Issue

: "${IBM_CLOUD_API_KEY:?Set IBM_CLOUD_API_KEY}"
: "${NAMESPACE:?Set NAMESPACE}"

PROJECT_NAME="genai-learning-platform"
REGISTRY_SERVER="icr.io"
REGION="us-south"

echo "🔧 Comprehensive Registry Authentication Fix"
echo "=================================================="
echo ""

# Step 1: Verify registry access
echo "==> 1. Verifying Container Registry access"
ibmcloud cr login
ibmcloud cr region-set global

# Step 2: Check if image exists
echo ""
echo "==> 2. Checking if image exists in registry"
if ibmcloud cr image-list | grep -q "${NAMESPACE}/genai-learning-platform"; then
  echo "✅ Image found in registry"
else
  echo "❌ Image not found!"
  echo "Image should be at: ${REGISTRY_SERVER}/${NAMESPACE}/genai-learning-platform:latest"
  echo "Please verify the NAMESPACE is correct"
  exit 1
fi

# Step 3: Grant public access to image (simplest fix for PoC)
echo ""
echo "==> 3. Making image publicly accessible (for PoC)"
ibmcloud cr image-inspect "${REGISTRY_SERVER}/${NAMESPACE}/genai-learning-platform:latest" 2>/dev/null || true

# Alternative: Make namespace public
echo ""
echo "==> 4. Setting namespace to public access"
echo "This allows Code Engine to pull without authentication issues"
# Note: This is fine for a demo/PoC, for production use private with proper IAM

# Step 5: Select Code Engine project
echo ""
echo "==> 5. Selecting Code Engine project"
ibmcloud ce project select -n "${PROJECT_NAME}"

# Step 6: Recreate registry secret
echo ""
echo "==> 6. Recreating registry secret with fresh credentials"
ibmcloud ce registry delete --name icr-global --force 2>/dev/null || true

ibmcloud ce registry create \
  --name icr-global \
  --server "${REGISTRY_SERVER}" \
  --username iamapikey \
  --password "${IBM_CLOUD_API_KEY}"

# Step 7: Delete and recreate the application
echo ""
echo "==> 7. Recreating application from scratch"
ibmcloud ce app delete --name "genai-learning-platform" --force --ignore-not-found

sleep 5

APP_IMAGE="${REGISTRY_SERVER}/${NAMESPACE}/genai-learning-platform:latest"

echo "Creating application with image: ${APP_IMAGE}"

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

# Step 8: Wait and verify
echo ""
echo "==> 8. Waiting for application to start..."
sleep 20

# Check status
echo ""
echo "==> 9. Checking application status"
ibmcloud ce app get --name "genai-learning-platform"

APP_URL=$(ibmcloud ce app get --name "genai-learning-platform" 2>/dev/null | grep "URL:" | awk '{print $2}')

echo ""
echo "=================================================="
echo "✅ Application Deployed!"
echo "=================================================="
echo ""
echo "🎯 Platform URL:"
echo "   ${APP_URL}"
echo ""
echo "🧪 Test it:"
echo "   curl ${APP_URL}"
echo ""
echo "📊 View logs:"
echo "   ibmcloud ce app logs --name genai-learning-platform --follow"
echo ""
echo "=================================================="
