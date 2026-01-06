#!/usr/bin/env bash

# Quick Fix for Docker Build Issue

echo "🔧 Fixing Docker Build Issue..."
echo ""

# 1. Create public directory
echo "Creating public directory..."
mkdir -p public
touch public/.gitkeep
echo "✅ Public directory created"

# 2. Fix next.config.js
echo ""
echo "Updating next.config.js for standalone build..."
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
echo "✅ next.config.js updated"

# 3. Create fixed Dockerfile
echo ""
echo "Creating fixed Dockerfile..."
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

# Ensure public directory exists
RUN mkdir -p public

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy package files
COPY --from=builder /app/package*.json ./

# Copy public folder
COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
EOF
echo "✅ Dockerfile.prod created"

echo ""
echo "=================================================="
echo "✅ All fixes applied!"
echo "=================================================="
echo ""
echo "Now try building again:"
echo "  docker build -f Dockerfile.prod -t test ."
echo ""
echo "Or run the deployment script:"
echo "  ./deploy-learning-platform.sh"
echo ""
