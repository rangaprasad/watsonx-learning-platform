#!/usr/bin/env bash
set -euo pipefail

# Multi-Cloud GenAI Learning Platform - Production Deployment Script
# This script handles the complete deployment including IAM setup

# ----- Config (env) -----
: "${IBM_CLOUD_API_KEY:?Set IBM_CLOUD_API_KEY}"
: "${NAMESPACE:?Set NAMESPACE (your icr.io namespace)}"

REGION="${REGION:-us-south}"
RESOURCE_GROUP="${RESOURCE_GROUP:-Default}"
REGISTRY_SERVER="icr.io"
PROJECT_NAME="genai-learning-platform"
SERVICE_ID_NAME="ce-registry-access"
SERVICE_API_KEY_NAME="ce-registry-key"

echo "=================================================="
echo "  GenAI Learning Platform - Production Deploy"
echo "=================================================="
echo ""

# ----- 1. Login -----
echo "==> 1. IBM Cloud Login"
ibmcloud login -a https://cloud.ibm.com \
  --apikey "$IBM_CLOUD_API_KEY" \
  -g "$RESOURCE_GROUP" \
  -r "$REGION"

# ----- 2. Ensure Plugins -----
echo ""
echo "==> 2. Installing Plugins"
ibmcloud plugin install container-registry -f -q || true
ibmcloud plugin install code-engine -f -q || true

# ----- 3. Registry Setup -----
echo ""
echo "==> 3. Setting up Registry Namespace"
ibmcloud cr region-set global >/dev/null
if ! ibmcloud cr namespaces | awk '{print $1}' | grep -qx "$NAMESPACE"; then
  echo "Creating namespace: $NAMESPACE"
  ibmcloud cr namespace-add "$NAMESPACE"
else
  echo "Namespace '${NAMESPACE}' already exists"
fi

echo ""
echo "==> 4. Authenticating Docker with IBM Container Registry"
ibmcloud cr login

# ----- 4. IAM Service ID Setup (One-time, idempotent) -----
echo ""
echo "==> 5. Setting up IAM Service ID for Code Engine"

# Check if service ID exists
if ibmcloud iam service-id "${SERVICE_ID_NAME}" >/dev/null 2>&1; then
  echo "Service ID '${SERVICE_ID_NAME}' already exists"
  
  # Check if API key exists
  if ibmcloud iam service-api-keys "${SERVICE_ID_NAME}" | grep -q "${SERVICE_API_KEY_NAME}"; then
    echo "API key '${SERVICE_API_KEY_NAME}' already exists"
    echo ""
    echo "⚠️  Using existing Service ID and API key"
    echo "   If you need to regenerate, run:"
    echo "   ibmcloud iam service-api-key-delete ${SERVICE_ID_NAME} ${SERVICE_API_KEY_NAME} -f"
    echo "   Then re-run this script"
    echo ""
    
    # For existing setup, we'll need the API key
    # User should have it saved, or they need to regenerate
    if [ -z "${SERVICE_API_KEY:-}" ]; then
      echo "❌ ERROR: Existing Service ID found but SERVICE_API_KEY not set"
      echo ""
      echo "Options:"
      echo "1. Set the existing key: export SERVICE_API_KEY='your-saved-key'"
      echo "2. Or delete and regenerate:"
      echo "   ibmcloud iam service-api-key-delete ${SERVICE_ID_NAME} ${SERVICE_API_KEY_NAME} -f"
      echo "   Then re-run this script"
      exit 1
    fi
    
    REGISTRY_API_KEY="${SERVICE_API_KEY}"
  else
    echo "Creating new API key for existing Service ID"
    REGISTRY_API_KEY=$(ibmcloud iam service-api-key-create "${SERVICE_API_KEY_NAME}" "${SERVICE_ID_NAME}" \
      --description "API key for Code Engine container registry access" \
      --output json | grep -o '"apikey":"[^"]*' | cut -d'"' -f4)
    
    echo ""
    echo "✅ Created new API key"
    echo "⚠️  SAVE THIS KEY (it won't be shown again):"
    echo "   ${REGISTRY_API_KEY}"
    echo ""
  fi
else
  echo "Creating new Service ID: ${SERVICE_ID_NAME}"
  ibmcloud iam service-id-create "${SERVICE_ID_NAME}" \
    --description "Service ID for Code Engine to access Container Registry"
  
  echo "Creating API key for Service ID"
  REGISTRY_API_KEY=$(ibmcloud iam service-api-key-create "${SERVICE_API_KEY_NAME}" "${SERVICE_ID_NAME}" \
    --description "API key for Code Engine container registry access" \
    --output json | grep -o '"apikey":"[^"]*' | cut -d'"' -f4)
  
  echo ""
  echo "✅ Created Service ID and API key"
  echo "⚠️  SAVE THIS KEY (it won't be shown again):"
  echo "   ${REGISTRY_API_KEY}"
  echo ""
  
  echo "Granting Container Registry Reader access to Service ID"
  ibmcloud iam service-policy-create "${SERVICE_ID_NAME}" \
    --roles Reader \
    --service-name container-registry
  
  echo "✅ IAM policies configured"
fi

# ----- 5. Prepare Build -----
echo ""
echo "==> 6. Preparing Build Environment"

# Ensure public directory exists
mkdir -p public
touch public/.gitkeep

# Create optimized Dockerfile
cat > Dockerfile.prod << 'EOF'
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN mkdir -p public
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
EOF

# Update next.config.js for standalone build
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig
EOF

echo "==> 7. Building Docker Image"
docker build --platform linux/amd64 -f Dockerfile.prod -t "genai-learning-platform:latest" .

if [ $? -ne 0 ]; then
  echo "❌ Docker build failed!"
  exit 1
fi

echo ""
echo "==> 8. Tagging and Pushing Image"
docker tag "genai-learning-platform:latest" "${REGISTRY_SERVER}/${NAMESPACE}/genai-learning-platform:latest"
docker push "${REGISTRY_SERVER}/${NAMESPACE}/genai-learning-platform:latest"

if [ $? -ne 0 ]; then
  echo "❌ Docker push failed!"
  exit 1
fi

echo "✅ Image pushed successfully"

# ----- 6. Create/Select Code Engine Project -----
echo ""
echo "==> 9. Configuring Code Engine Project"

if ! ibmcloud ce project get --name "${PROJECT_NAME}" >/dev/null 2>&1; then
  echo "Creating project '${PROJECT_NAME}'..."
  ibmcloud ce project create --name "${PROJECT_NAME}"
else
  echo "Project '${PROJECT_NAME}' already exists"
fi

ibmcloud ce project select -n "${PROJECT_NAME}"

# ----- 7. Create Registry Secret with Service ID API Key -----
echo ""
echo "==> 10. Creating/Updating Registry Secret"
ibmcloud ce registry delete --name icr-global --force 2>/dev/null || true

ibmcloud ce registry create \
  --name icr-global \
  --server "${REGISTRY_SERVER}" \
  --username iamapikey \
  --password "${REGISTRY_API_KEY}"

echo "✅ Registry secret created with Service ID credentials"

# ----- 8. Deploy Application -----
echo ""
echo "==> 11. Deploying Application"
APP_IMAGE="${REGISTRY_SERVER}/${NAMESPACE}/genai-learning-platform:latest"

# Delete old app for clean deployment
ibmcloud ce app delete --name "genai-learning-platform" --force --ignore-not-found
sleep 5

# Create new application
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

# ----- 9. Wait and Verify -----
echo ""
echo "==> 12. Waiting for application to be ready..."
sleep 30

# Get application details
ibmcloud ce app get --name "genai-learning-platform"

APP_URL=$(ibmcloud ce app get --name "genai-learning-platform" 2>/dev/null | grep "URL:" | awk '{print $2}')

# ----- Summary -----
echo ""
echo "=================================================="
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "=================================================="
echo ""
echo "🎯 Your Platform is Live:"
echo "   ${APP_URL}"
echo ""
echo "📋 What's Working:"
echo "   ✅ Homepage with hero section"
echo "   ✅ Labs listing with filters"
echo "   ✅ Interactive lab environment"
echo "   ✅ Monaco code editor"
echo "   ✅ Pricing page"
echo "   ✅ Responsive navigation"
echo ""
echo "⚠️  What Needs Backend:"
echo "   - Code execution (create /api/execute endpoint)"
echo "   - Authentication (Clerk integration)"
echo "   - Database (Supabase setup)"
echo "   - Payments (Stripe integration)"
echo ""
echo "=================================================="
echo ""
echo "🧪 Test Your Platform:"
echo "   curl ${APP_URL}"
echo "   open ${APP_URL}"
echo ""
echo "📊 Monitor Logs:"
echo "   ibmcloud ce app logs --name genai-learning-platform --follow"
echo ""
echo "🔄 Redeploy After Changes:"
echo "   Just run this script again!"
echo ""
echo "🗑️  Delete Everything:"
echo "   ibmcloud ce project delete --name ${PROJECT_NAME} --force"
echo "   ibmcloud iam service-id-delete ${SERVICE_ID_NAME} -f"
echo ""
echo "💰 Estimated Cost:"
echo "   ~\$15-30/month for demo usage"
echo "   Free tier: 100,000 vCPU-seconds/month"
echo ""
echo "=================================================="
echo ""
echo "🎉 Next Steps:"
echo ""
echo "1. Share your URL with testers"
echo "2. Build the backend API (app/api/execute/route.ts)"
echo "3. Connect watsonx.ai for code execution"
echo "4. Add authentication and database"
echo ""
echo "Want help building the backend? Let's do it! 🚀"
echo ""
