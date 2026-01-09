#!/bin/bash

##############################################################################
# GenAI Labs - Video-Lab Sync Feature Deployment Script
# 
# This script automates the deployment of the video-lab synchronization feature
# 
# Usage:
#   chmod +x deploy-video-sync.sh
#   ./deploy-video-sync.sh
##############################################################################

set -e  # Exit on error

echo "🚀 GenAI Labs - Video-Lab Sync Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the watsonx-learning-platform directory?${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Step 1: Checking dependencies...${NC}"

# Check if required files exist in Downloads
FILES_TO_COPY=(
    "api-extract-transcript-route.ts"
    "api-analyze-video-route.ts"
    "api-practice-points-route.ts"
    "content-youtube-sync.js"
    "overlay-sync.css"
    "labs-labId-page-sync.tsx"
    "LabRunner-sync.tsx"
)

MISSING_FILES=()
for file in "${FILES_TO_COPY[@]}"; do
    if [ ! -f "$HOME/Downloads/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}❌ Missing files in ~/Downloads:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "Please download all required files first!"
    exit 1
fi

echo -e "${GREEN}✅ All required files found!${NC}"
echo ""

# Confirm with user
echo -e "${YELLOW}⚠️  This will modify your existing files. Continue? (y/n)${NC}"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}📦 Step 2: Creating backups...${NC}"

# Create backup directory
BACKUP_DIR="backups/video-sync-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup existing files
if [ -f "app/labs/[labId]/page.tsx" ]; then
    cp "app/labs/[labId]/page.tsx" "$BACKUP_DIR/page.tsx.backup"
    echo "   ✓ Backed up app/labs/[labId]/page.tsx"
fi

if [ -f "components/LabRunner.tsx" ]; then
    cp "components/LabRunner.tsx" "$BACKUP_DIR/LabRunner.tsx.backup"
    echo "   ✓ Backed up components/LabRunner.tsx"
fi

echo -e "${GREEN}✅ Backups created in $BACKUP_DIR${NC}"
echo ""

echo -e "${BLUE}📂 Step 3: Creating API directories...${NC}"

mkdir -p app/api/extract-transcript
mkdir -p app/api/analyze-video
mkdir -p "app/api/practice-points/[videoId]"

echo "   ✓ Created app/api/extract-transcript"
echo "   ✓ Created app/api/analyze-video"
echo "   ✓ Created app/api/practice-points/[videoId]"
echo ""

echo -e "${BLUE}📥 Step 4: Copying API route files...${NC}"

cp "$HOME/Downloads/api-extract-transcript-route.ts" "app/api/extract-transcript/route.ts"
echo "   ✓ app/api/extract-transcript/route.ts"

cp "$HOME/Downloads/api-analyze-video-route.ts" "app/api/analyze-video/route.ts"
echo "   ✓ app/api/analyze-video/route.ts"

cp "$HOME/Downloads/api-practice-points-route.ts" "app/api/practice-points/[videoId]/route.ts"
echo "   ✓ app/api/practice-points/[videoId]/route.ts"

echo -e "${GREEN}✅ API routes installed!${NC}"
echo ""

echo -e "${BLUE}📥 Step 5: Updating platform components...${NC}"

cp "$HOME/Downloads/labs-labId-page-sync.tsx" "app/labs/[labId]/page.tsx"
echo "   ✓ app/labs/[labId]/page.tsx"

cp "$HOME/Downloads/LabRunner-sync.tsx" "components/LabRunner.tsx"
echo "   ✓ components/LabRunner.tsx"

echo -e "${GREEN}✅ Platform components updated!${NC}"
echo ""

echo -e "${BLUE}📥 Step 6: Updating Chrome extension...${NC}"

# Check if extension directory exists
EXTENSION_DIR="../genai-labs-extension"
if [ -d "$EXTENSION_DIR" ]; then
    cd "$EXTENSION_DIR"
    
    # Backup
    cp "content-youtube.js" "content-youtube.backup.js" 2>/dev/null || true
    cp "overlay.css" "overlay.backup.css" 2>/dev/null || true
    
    # Copy new files
    cp "$HOME/Downloads/content-youtube-sync.js" "content-youtube.js"
    echo "   ✓ content-youtube.js"
    
    cp "$HOME/Downloads/overlay-sync.css" "overlay.css"
    echo "   ✓ overlay.css"
    
    cd - > /dev/null
    echo -e "${GREEN}✅ Extension updated!${NC}"
else
    echo -e "${YELLOW}⚠️  Extension directory not found at $EXTENSION_DIR${NC}"
    echo "   You'll need to update it manually."
fi
echo ""

echo -e "${BLUE}📦 Step 7: Installing npm dependencies...${NC}"

# Check if dependencies are already installed
if ! grep -q "youtube-transcript" package.json; then
    echo "   Installing youtube-transcript..."
    npm install youtube-transcript --save
fi

if ! grep -q "@anthropic-ai/sdk" package.json; then
    echo "   Installing @anthropic-ai/sdk..."
    npm install @anthropic-ai/sdk --save
fi

echo -e "${GREEN}✅ Dependencies installed!${NC}"
echo ""

echo -e "${BLUE}🔐 Step 8: Checking environment variables...${NC}"

ENV_FILE=".env.local"
MISSING_VARS=()

if [ ! -f "$ENV_FILE" ]; then
    echo "   Creating .env.local..."
    touch "$ENV_FILE"
fi

if ! grep -q "ANTHROPIC_API_KEY" "$ENV_FILE"; then
    MISSING_VARS+=("ANTHROPIC_API_KEY")
fi

if ! grep -q "NEXT_PUBLIC_API_URL" "$ENV_FILE"; then
    MISSING_VARS+=("NEXT_PUBLIC_API_URL")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please add these to .env.local:"
    echo ""
    echo "ANTHROPIC_API_KEY=your-anthropic-api-key"
    echo "NEXT_PUBLIC_API_URL=https://genai-learning-platform.24rtt3srkwax.us-south.codeengine.appdomain.cloud"
    echo ""
else
    echo -e "${GREEN}✅ Environment variables configured!${NC}"
fi
echo ""

echo -e "${BLUE}🧪 Step 9: Testing locally...${NC}"
echo ""
echo "Starting development server..."
echo "Visit http://localhost:3000 to test"
echo ""
echo -e "${YELLOW}Press Ctrl+C when ready to deploy to production${NC}"
echo ""

# Start dev server
npm run dev &
DEV_PID=$!

# Wait for user to press Ctrl+C
trap "kill $DEV_PID 2>/dev/null; exit 0" SIGINT

wait $DEV_PID

echo ""
echo -e "${GREEN}✅ Deployment script complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test locally at http://localhost:3000"
echo "2. Deploy to production:"
echo ""
echo "   docker build --platform linux/amd64 -f Dockerfile.prod -t genai-learning-platform:latest ."
echo "   docker tag genai-learning-platform:latest icr.io/ranga/genai-learning-platform:latest"
echo "   docker push icr.io/ranga/genai-learning-platform:latest"
echo "   ibmcloud ce app update --name genai-learning-platform --image icr.io/ranga/genai-learning-platform:latest"
echo ""
echo "3. Update Chrome extension:"
echo "   - Go to chrome://extensions"
echo "   - Click 'Reload' on GenAI Labs"
echo ""
echo -e "${BLUE}🎉 Happy coding!${NC}"
