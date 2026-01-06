# Complete Deployment Guide - GenAI Learning Platform

## 🚀 Deploy to IBM Cloud Code Engine

This guide walks you through deploying your learning platform to IBM Cloud using the proven deployment pattern from WAR Machine.

---

## Prerequisites

### 1. IBM Cloud Account
- Sign up at https://cloud.ibm.com
- Verify your email
- Add payment method (free tier available)

### 2. IBM Cloud CLI
```bash
# macOS
brew install ibmcloud-cli

# Linux/Windows
# Download from: https://cloud.ibm.com/docs/cli?topic=cli-install-ibmcloud-cli
```

### 3. Docker
```bash
# macOS
brew install docker

# Verify installation
docker --version
```

### 4. Get Your IBM Cloud API Key
1. Log in to https://cloud.ibm.com
2. Go to: Manage → Access (IAM) → API keys
3. Click "Create an IBM Cloud API key"
4. Name it: `learning-platform-deploy`
5. Copy the API key (save it securely!)

### 5. Create Container Registry Namespace
1. Go to: https://cloud.ibm.com/registry/namespaces
2. Click "Create"
3. Enter a unique name (e.g., `your-name-genai`)
4. Select region: `Dallas` or `global`
5. Copy the namespace name

---

## 🎯 Quick Deploy (3 Steps)

### Step 1: Set Environment Variables

```bash
# Set your IBM Cloud API key
export IBM_CLOUD_API_KEY="your-api-key-here"

# Set your container registry namespace
export NAMESPACE="your-namespace-here"

# Optional: Set region (default is us-south)
export REGION="us-south"
```

### Step 2: Make Deploy Script Executable

```bash
cd watsonx-learning-platform
chmod +x ../deploy-learning-platform.sh
```

### Step 3: Run Deployment

```bash
../deploy-learning-platform.sh
```

**Deployment takes 5-10 minutes.** You'll see progress for:
1. IBM Cloud login ✅
2. Plugin installation ✅
3. Registry setup ✅
4. Docker build ✅
5. Image push ✅
6. Code Engine deployment ✅

---

## 📋 What Gets Deployed

### Infrastructure Created:
```
IBM Cloud Code Engine Project: genai-learning-platform
├── Application: genai-learning-platform
│   ├── CPU: 1 vCPU
│   ├── Memory: 2GB
│   ├── Min Scale: 1 instance
│   ├── Max Scale: 5 instances
│   ├── Port: 3000
│   └── Auto-scaling enabled
│
└── Registry Secret: icr-global
    └── Pulls images from IBM Container Registry
```

### Application Stack:
```
Next.js 14 (App Router)
├── Frontend: React + TypeScript
├── Styling: Tailwind CSS
├── Code Editor: Monaco Editor
├── Icons: Lucide React
└── Runtime: Node.js 20 (Alpine)
```

---

## 🧪 Testing Your Deployment

### 1. Get Your URL
After deployment completes, you'll see:
```
🎯 Platform URL:
   https://genai-learning-platform.xxx.xxx.appdomain.cloud
```

### 2. Test All Pages

**Homepage:**
```bash
curl https://your-url.appdomain.cloud
```
Should return HTML with "Master GenAI with Multi-Cloud Hands-On Labs"

**Labs Listing:**
```bash
curl https://your-url.appdomain.cloud/labs
```
Should return labs page HTML

**Interactive Lab:**
```bash
curl https://your-url.appdomain.cloud/labs/watsonx-first-call
```
Should return lab environment HTML

**Pricing:**
```bash
curl https://your-url.appdomain.cloud/pricing
```
Should return pricing page HTML

### 3. Test in Browser

Open your platform URL and verify:
- ✅ Homepage loads with hero section
- ✅ Navigation works (click Labs, Pricing)
- ✅ Labs page shows all lab cards
- ✅ Click "Start Lab" on first lab
- ✅ Monaco editor loads with code
- ✅ UI is responsive (resize window)
- ⚠️ "Run Code" button won't execute yet (needs backend API)

---

## 🔧 Next Steps: Add Backend Functionality

### What's Working Now:
✅ Complete UI (all pages)
✅ Responsive design
✅ Navigation
✅ Lab interface
✅ Monaco code editor

### What Needs Backend Integration:

#### 1. Code Execution API
Create `app/api/execute/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { code, labId, platform } = await request.json()
  
  // TODO: Execute code via IBM Cloud Functions
  // Call watsonx.ai API
  // Validate output
  // Return results
  
  return NextResponse.json({
    output: 'Backend API not yet connected',
    validation: {
      passed: false,
      feedback: 'Add IBM Cloud Function integration'
    }
  })
}
```

#### 2. IBM Cloud Function for Code Execution

**Create execution function:**
```python
# functions/execute_lab_code.py
from ibm_watsonx_ai.foundation_models import Model
import sys
from io import StringIO

def main(params):
    code = params.get('code', '')
    lab_id = params.get('lab_id', '')
    
    # Capture output
    old_stdout = sys.stdout
    sys.stdout = StringIO()
    
    try:
        # Execute student code
        exec(code, {
            '__name__': '__main__',
            'Model': Model,
            # Add other safe imports
        })
        
        output = sys.stdout.getvalue()
        sys.stdout = old_stdout
        
        # Validate based on lab
        validation = validate_output(lab_id, output)
        
        return {
            'statusCode': 200,
            'body': {
                'success': True,
                'output': output,
                'validation': validation
            }
        }
    except Exception as e:
        sys.stdout = old_stdout
        return {
            'statusCode': 500,
            'body': {
                'success': False,
                'error': str(e)
            }
        }

def validate_output(lab_id, output):
    if lab_id == 'watsonx-first-call':
        # Check for successful API call
        checks = {
            'has_output': len(output) > 0,
            'no_errors': 'Error' not in output and 'Traceback' not in output,
            'ai_response': any(word in output.lower() for word in ['artificial', 'intelligence', 'ai'])
        }
        
        passed = all(checks.values())
        
        return {
            'passed': passed,
            'checks': checks,
            'feedback': 'Great! Your code works.' if passed else 'Check your code for errors.'
        }
    
    return {'passed': False, 'feedback': 'Unknown lab'}
```

**Deploy function:**
```bash
# Create IBM Cloud Function
ibmcloud fn action create execute-lab \
  --kind python:3.11 \
  execute_lab_code.py \
  --web true
  
# Get function URL
ibmcloud fn action get execute-lab --url
```

**Update Next.js API route:**
```typescript
// app/api/execute/route.ts
const FUNCTION_URL = process.env.IBM_FUNCTION_URL

export async function POST(request: NextRequest) {
  const { code, labId, platform } = await request.json()
  
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      lab_id: labId,
      platform
    })
  })
  
  const result = await response.json()
  return NextResponse.json(result.body)
}
```

#### 3. Authentication (Clerk)

```bash
# Install Clerk
npm install @clerk/nextjs

# Get keys from https://clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
```

**Add to layout:**
```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

#### 4. Database (Supabase)

```bash
# Get URL from https://supabase.com
DATABASE_URL=postgresql://xxx
SUPABASE_ANON_KEY=xxx
```

**Create tables:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  tier TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE lab_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  lab_id TEXT,
  completed BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0
);
```

#### 5. Payments (Stripe)

```bash
npm install stripe

STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 🔄 Update Your Deployment

After making code changes:

```bash
# 1. Build new image
docker build --platform linux/amd64 -f Dockerfile.prod -t genai-learning-platform:latest .

# 2. Tag for registry
docker tag genai-learning-platform:latest \
  icr.io/${NAMESPACE}/genai-learning-platform:latest

# 3. Push to registry
docker push icr.io/${NAMESPACE}/genai-learning-platform:latest

# 4. Update Code Engine app
ibmcloud ce app update --name genai-learning-platform \
  --image icr.io/${NAMESPACE}/genai-learning-platform:latest
```

Or simply re-run the deploy script:
```bash
./deploy-learning-platform.sh
```

---

## 📊 Monitoring

### View Application Logs
```bash
# Real-time logs
ibmcloud ce app logs --name genai-learning-platform --follow

# Recent logs
ibmcloud ce app logs --name genai-learning-platform --tail 100
```

### Check Application Status
```bash
ibmcloud ce app get --name genai-learning-platform
```

### View Metrics
```bash
# CPU/Memory usage
ibmcloud ce app events --name genai-learning-platform
```

---

## 💰 Cost Management

### Free Tier Includes:
- **100,000 vCPU-seconds/month** (enough for demo)
- **400,000 GB-seconds/month** of memory

### Estimated Costs:
```
Light usage (demo/testing):
  ~$5-10/month

Medium usage (100 users/day):
  ~$20-40/month

Heavy usage (1000 users/day):
  ~$100-200/month
```

### Set Budget Alerts:
1. Go to: https://cloud.ibm.com/billing
2. Click "Manage → Billing and usage → Spending"
3. Set spending alerts at $20, $50, $100

### Reduce Costs:
```bash
# Scale down when not in use
ibmcloud ce app update --name genai-learning-platform --min-scale 0

# Scale back up
ibmcloud ce app update --name genai-learning-platform --min-scale 1
```

---

## 🗑️ Cleanup

### Delete Everything:
```bash
# Delete the entire project (app + config)
ibmcloud ce project delete --name genai-learning-platform --force

# Delete container images
ibmcloud cr image-rm icr.io/${NAMESPACE}/genai-learning-platform:latest
```

### Keep Project, Delete App Only:
```bash
ibmcloud ce app delete --name genai-learning-platform --force
```

---

## 🐛 Troubleshooting

### Issue: "Namespace not found"
**Solution:**
```bash
# List namespaces
ibmcloud cr namespaces

# Create if missing
ibmcloud cr namespace-add your-namespace-name
```

### Issue: "Docker build fails"
**Solution:**
```bash
# Ensure you're in the project directory
cd watsonx-learning-platform

# Check Docker is running
docker ps

# Try building manually first
docker build -f Dockerfile.prod -t test .
```

### Issue: "App won't start"
**Solution:**
```bash
# Check logs
ibmcloud ce app logs --name genai-learning-platform --tail 100

# Common fixes:
# 1. Ensure PORT env var is set
# 2. Check package.json scripts
# 3. Verify next.config.js has output: 'standalone'
```

### Issue: "High costs"
**Solution:**
```bash
# Check current scaling
ibmcloud ce app get --name genai-learning-platform

# Reduce max scale
ibmcloud ce app update --name genai-learning-platform --max-scale 2

# Set min-scale to 0 for demos
ibmcloud ce app update --name genai-learning-platform --min-scale 0
```

---

## 📞 Support Resources

### IBM Cloud Documentation:
- Code Engine: https://cloud.ibm.com/docs/codeengine
- Container Registry: https://cloud.ibm.com/docs/Registry
- CLI Reference: https://cloud.ibm.com/docs/cli

### Community:
- IBM Cloud Community: https://community.ibm.com/community/user/cloud
- Stack Overflow: [ibm-cloud] tag
- GitHub Issues: (your repo)

---

## ✅ Deployment Checklist

Before going live:

- [ ] UI tested on desktop, tablet, mobile
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Lab editor displays properly
- [ ] Backend API integrated
- [ ] Authentication working
- [ ] Database connected
- [ ] Payments configured
- [ ] Error handling added
- [ ] Analytics setup
- [ ] Budget alerts configured
- [ ] Monitoring enabled
- [ ] SSL certificate (automatic with Code Engine)
- [ ] Custom domain configured (optional)

---

## 🎉 You're Live!

Once deployed, your platform is:
- ✅ Running on IBM Cloud Code Engine
- ✅ Auto-scaling based on traffic
- ✅ Using IBM Container Registry
- ✅ HTTPS enabled by default
- ✅ Monitoring with IBM Cloud metrics
- ✅ Ready for watsonx.ai integration

**Next:** Connect the backend API so labs can execute code! 🚀
