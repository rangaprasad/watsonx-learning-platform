#!/usr/bin/env bash

# Registry Diagnostic Script

: "${NAMESPACE:?Set NAMESPACE}"

echo "🔍 Registry Diagnostic Check"
echo "=================================================="
echo ""

# 1. Login to registry
echo "==> 1. Logging into Container Registry"
ibmcloud cr login
ibmcloud cr region-set global

# 2. List all namespaces
echo ""
echo "==> 2. Your Container Registry Namespaces:"
ibmcloud cr namespaces
echo ""

# 3. List all images in the namespace
echo "==> 3. Images in namespace '${NAMESPACE}':"
ibmcloud cr image-list --restrict "${NAMESPACE}"
echo ""

# 4. Check if namespace exists
echo "==> 4. Verifying namespace '${NAMESPACE}' exists"
if ibmcloud cr namespaces | grep -q "^${NAMESPACE}$"; then
  echo "✅ Namespace '${NAMESPACE}' exists"
else
  echo "❌ Namespace '${NAMESPACE}' not found!"
  echo ""
  echo "Available namespaces:"
  ibmcloud cr namespaces
  echo ""
  echo "To create it:"
  echo "  ibmcloud cr namespace-add ${NAMESPACE}"
fi

# 5. Try to inspect the specific image
echo ""
echo "==> 5. Trying to inspect the pushed image"
IMAGE="icr.io/${NAMESPACE}/genai-learning-platform:latest"
echo "Looking for: ${IMAGE}"
ibmcloud cr image-inspect "${IMAGE}" || echo "Image not found at this path"

# 6. List recent images
echo ""
echo "==> 6. Recent images (all namespaces):"
ibmcloud cr image-list | head -20

echo ""
echo "=================================================="
echo "Diagnostic complete"
echo "=================================================="
