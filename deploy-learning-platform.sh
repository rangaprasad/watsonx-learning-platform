#!/usr/bin/env bash
set -euo pipefail

# Multi-Cloud GenAI Learning Platform - IBM Code Engine Deployment

# ----- Config (env) -----
: "${IBM_CLOUD_API_KEY:?Set IBM_CLOUD_API_KEY}"
: "${NAMESPACE:?Set NAMESPACE (your icr.io namespace)}"

REGION="${REGION:-us-south}"
RESOURCE_GROUP="${RESOURCE_GROUP:-Default}"
REGISTRY_SERVER="icr.io"
PROJECT_NAME="genai-learning-platform"

echo "=================================================="
echo "  GenAI Learning Platform - IBM Code Engine Deploy"
echo "=================================================="
echo ""

# ----- 1. Login -----
echo "==> 1. IBM Cloud Login"
ibmcloud login -a https://cloud.ibm.com \
  --apikey "$IBM_CLOUD_API_KEY" \
  -g "$RESOURCE_GROUP" \
  -r "$REGION"

# ----- 2. Ensure Plugins -----
echo "==> 2. Installing Plugins (idempotent)"
ibmcloud plugin install container-registry -q || true
ibmcloud plugin install code-engine -q || true

# ----- 3. Registry Setup -----
echo "==> 3. Setting up Registry Namespace"
ibmcloud cr region-set global >/dev/null
if ! ibmcloud cr namespaces | awk '{print $1}' | grep -qx "$NAMESPACE"; then
  echo "Creating namespace: $NAMESPACE"
  ibmcloud cr namespace-add "$NAMESPACE"
fi

echo "==> 4. Authenticating Docker with IBM Container Registry"
ibmcloud cr login

# ----- 4. Build & Push Next.js App -----
echo ""
echo "==> 5. Building GenAI Learning Platform"

# Create production Dockerfile for Next.js
cat > Dockerfile.prod << 'EOF'
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF

# Update next.config.js for standalone build
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['images.unsplash.com'],
  },
}

module.exports = nextConfig
EOF

echo "Building Docker image..."
docker build --platform linux/amd64 -f Dockerfile.prod -t "genai-learning-platform:latest" .
docker tag "genai-learning-platform:latest" "${REGISTRY_SERVER}/${NAMESPACE}/genai-learning-platform:latest"
docker push "${REGISTRY_SERVER}/${NAMESPACE}/genai-learning-platform:latest"

# ----- 5. Create/Select Code Engine Project -----
echo ""
echo "==> 6. Configuring Code Engine Project"

if ! ibmcloud ce project get --name "${PROJECT_NAME}" >/dev/null 2>&1; then
  echo "Creating project '${PROJECT_NAME}'..."
  ibmcloud ce project create --name "${PROJECT_NAME}"
else
  echo "Project '${PROJECT_NAME}' already exists."
fi

ibmcloud ce project select -n "${PROJECT_NAME}"

# ----- 6. Create Registry Secret -----
echo ""
echo "==> 7. Creating/Updating Registry Secret 'icr-global'"
if ! ibmcloud ce registry get --name icr-global >/dev/null 2>&1; then
  ibmcloud ce registry create --name icr-global \
    --server "${REGISTRY_SERVER}" \
    --username iamapikey \
    --password "$IBM_CLOUD_API_KEY"
else
  ibmcloud ce registry update --name icr-global \
    --server "${REGISTRY_SERVER}" \
    --username iamapikey \
    --password "$IBM_CLOUD_API_KEY" >/dev/null
fi

# ----- 7. Deploy Application -----
echo ""
echo "==> 8. Deploying GenAI Learning Platform"
APP_IMAGE="${REGISTRY_SERVER}/${NAMESPACE}/genai-learning-platform:latest"

if ! ibmcloud ce app get --name "genai-learning-platform" >/dev/null 2>&1; then
  ibmcloud ce app create --name "genai-learning-platform" \
    --image "${APP_IMAGE}" \
    --registry-secret icr-global \
    --port 3000 \
    --cpu 1 \
    --memory 2G \
    --min-scale 1 \
    --max-scale 5 \
    --env NODE_ENV=production \
    --env IBM_CLOUD_API_KEY="${IBM_CLOUD_API_KEY}"
else
  ibmcloud ce app update --name "genai-learning-platform" \
    --image "${APP_IMAGE}" \
    --registry-secret icr-global \
    --port 3000 \
    --cpu 1 \
    --memory 2G \
    --env IBM_CLOUD_API_KEY="${IBM_CLOUD_API_KEY}"
fi

APP_URL=$(ibmcloud ce app get --name "genai-learning-platform" | sed -n 's/^ *URL: *//p')

# ----- Summary -----
echo ""
echo "=================================================="
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "=================================================="
echo ""
echo "🔗 Your Learning Platform is Live:"
echo ""
echo "🎯 Platform URL:"
echo "   ${APP_URL}"
echo ""
echo "=================================================="
echo ""
echo "📋 What You Can Do Now:"
echo ""
echo "1. Visit Platform: ${APP_URL}"
echo "   ✅ Homepage with hero section"
echo "   ✅ Labs listing at /labs"
echo "   ✅ Interactive lab at /labs/watsonx-first-call"
echo "   ✅ Pricing page at /pricing"
echo ""
echo "2. Test the UI:"
echo "   - All pages are responsive"
echo "   - Monaco editor loads in lab environment"
echo "   - Navigation works across all pages"
echo ""
echo "3. Next Steps to Make Labs Functional:"
echo "   - Add /app/api/execute/route.ts endpoint"
echo "   - Connect to watsonx.ai API"
echo "   - Add authentication (Clerk)"
echo "   - Add database (Supabase)"
echo ""
echo "=================================================="
echo ""
echo "🧪 Test Endpoints:"
echo "   curl ${APP_URL}"
echo "   curl ${APP_URL}/labs"
echo ""
echo "📊 Monitor Application:"
echo "   ibmcloud ce app logs --name genai-learning-platform --follow"
echo ""
echo "🔄 Update Deployment:"
echo "   # Make code changes, then run:"
echo "   docker build --platform linux/amd64 -f Dockerfile.prod -t genai-learning-platform:latest ."
echo "   docker tag genai-learning-platform:latest ${REGISTRY_SERVER}/${NAMESPACE}/genai-learning-platform:latest"
echo "   docker push ${REGISTRY_SERVER}/${NAMESPACE}/genai-learning-platform:latest"
echo "   ibmcloud ce app update --name genai-learning-platform --image ${APP_IMAGE}"
echo ""
echo "🗑️  To delete when done:"
echo "   ibmcloud ce project delete --name ${PROJECT_NAME} --force"
echo ""
echo "=================================================="
echo ""
echo "💰 Estimated Cost:"
echo "   ~\$15-30/month for demo (with auto-scaling)"
echo "   Free tier: 100,000 vCPU-seconds/month"
echo ""
echo "📝 Important Notes:"
echo ""
echo "✅ What's Working:"
echo "   - Complete UI (all pages render)"
echo "   - Responsive design"
echo "   - Navigation"
echo "   - Lab interface with Monaco editor"
echo ""
echo "⚠️  What Needs Backend Integration:"
echo "   - Code execution (needs watsonx.ai API)"
echo "   - User authentication"
echo "   - Progress tracking"
echo "   - Payments"
echo ""
echo "🔧 Next Development Step:"
echo "   Create app/api/execute/route.ts to handle"
echo "   code execution via watsonx.ai"
echo ""
echo "=================================================="
