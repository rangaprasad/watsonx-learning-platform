# Week 1: Code Execution Backend - README

## 🎯 Goal
Build a secure, scalable code execution backend that runs Python code in isolated Docker containers.

---

## 📂 File Structure

```
code-executor/
├── Dockerfile              # Docker image for code execution
├── execute.py              # Python script that runs user code
├── requirements.txt        # Python dependencies
├── deploy.sh               # Deployment script for IBM Cloud
└── test-local.sh          # Local testing script

app/api/execute/
└── route.ts                # Next.js API endpoint
```

---

## 🚀 Quick Start

### Prerequisites
- Docker installed and running
- IBM Cloud CLI installed and logged in
- Node.js 20+ for Next.js app

### Step 1: Build Docker Image Locally

```bash
cd code-executor
docker build -t code-executor:latest .
```

### Step 2: Test Locally

```bash
# Test the Docker container
echo '{"code": "print(\"Hello World!\")", "timeout": 5}' | \
  docker run --rm -i code-executor:latest

# Expected output:
# {"status": "success", "output": "Hello World!\n", "error": "", "execution_time": 15}
```

### Step 3: Deploy to IBM Cloud

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Step 4: Add API Route to Next.js

```bash
# Copy the API route file
cp app-api-execute-route.ts \
   ~/Code/work/star-edtech/watsonx-learning-platform/app/api/execute/route.ts

# Redeploy Next.js app
cd ~/Code/work/star-edtech/watsonx-learning-platform
./deploy-learning-platform.sh
```

---

## 🧪 Testing

### Test 1: Basic Execution

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "print(\"Hello from API!\")",
    "language": "python"
  }'
```

Expected:
```json
{
  "status": "success",
  "output": "Hello from API!\n",
  "executionTime": 234
}
```

### Test 2: Error Handling

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "raise ValueError(\"Test error\")",
    "language": "python"
  }'
```

Expected:
```json
{
  "status": "error",
  "output": "",
  "error": "Traceback...\nValueError: Test error",
  "executionTime": 125
}
```

### Test 3: Timeout

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type": application/json" \
  -d '{
    "code": "import time\ntime.sleep(35)",
    "language": "python",
    "timeout": 5
  }'
```

Expected:
```json
{
  "status": "timeout",
  "error": "Execution exceeded 5 second timeout",
  "executionTime": 5000
}
```

### Test 4: With Libraries

```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "code": "import json\ndata = {\"test\": 123}\nprint(json.dumps(data))",
    "language": "python"
  }'
```

Expected:
```json
{
  "status": "success",
  "output": "{\"test\": 123}\n",
  "executionTime": 180
}
```

---

## 🔒 Security Features

### 1. Resource Limits
- **Memory:** 512MB max
- **CPU:** 0.5 cores
- **Time:** 30 seconds max
- **Output:** 1MB max

### 2. Code Validation
Blocks dangerous operations:
- `import os`
- `import subprocess`
- `eval()`, `exec()`, `compile()`
- `open()` (file access)
- `__import__`

### 3. Network Isolation
- Docker containers run with `--network=none`
- No internet access
- No localhost access

### 4. Rate Limiting
- 10 requests per minute per IP
- Prevents DOS attacks

### 5. User Isolation
- Code runs as non-root user `coderunner`
- Limited process creation (10 max)

---

## 💰 Cost Estimation

### IBM Cloud Code Engine Pricing

**Free Tier:**
- 100,000 vCPU-seconds/month
- At 0.5 vCPU × 3 seconds average = 66,666 executions/month FREE

**Paid Tier:**
- $0.00003417 per vCPU-second
- 3 second execution = $0.0001025
- 1,000 executions = $0.10
- 10,000 executions = $1.00
- 100,000 executions = $10.00

**Very affordable for MVP!**

---

## 📊 Monitoring

### Check Job Status

```bash
# List all jobs
ibmcloud ce job list

# Get job details
ibmcloud ce job get --name code-executor

# List recent job runs
ibmcloud ce jobrun list

# View logs
ibmcloud ce jobrun logs --name <jobrun-name>
```

### Metrics to Track

1. **Success Rate:** % of successful executions
2. **Average Time:** Mean execution time
3. **Error Rate:** % of errors vs timeouts
4. **Cost:** Monthly spend on Code Engine

---

## 🐛 Troubleshooting

### Issue: Docker container won't build

**Solution:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild with no cache
docker build --no-cache -t code-executor:latest .
```

### Issue: IBM Cloud push fails

**Solution:**
```bash
# Re-authenticate to Container Registry
ibmcloud cr login

# Check namespace
ibmcloud cr namespace-list

# If namespace doesn't exist
ibmcloud cr namespace-add ranga
```

### Issue: Job runs but times out

**Solution:**
```bash
# Increase timeout in job definition
ibmcloud ce job update --name code-executor --maxexecutiontime 60
```

### Issue: "Rate limit exceeded" error

**Solution:**
- Wait 1 minute
- Or increase rate limit in `route.ts`

---

## 🔄 Alternative: Cloud Functions

If Code Engine is too slow due to cold starts, switch to Cloud Functions:

```bash
# Create function
ibmcloud fn action create code-executor \
  execute.py \
  --kind python:3.11 \
  --memory 512 \
  --timeout 30000

# Invoke
ibmcloud fn action invoke code-executor \
  --param code "print('Hello!')" \
  --result
```

---

## 📈 Next Steps (Week 2)

1. **Video-Lab Sync**
   - YouTube transcript API
   - AI matching algorithm
   - Timestamp-based suggestions

2. **Lab Content Generation**
   - AI-powered lab generator
   - Auto-create from video transcripts

3. **Progress Tracking**
   - Save user code
   - Track completions
   - Analytics dashboard

---

## ✅ Success Criteria

Week 1 is complete when:
- [x] Docker image builds successfully
- [x] Code executes in container
- [x] API endpoint works
- [x] Security measures in place
- [x] Rate limiting works
- [x] Deployed to IBM Cloud
- [ ] Frontend "Run Code" button works
- [ ] Tests pass
- [ ] Production ready

---

## 📞 Support

Questions? Issues?
- Check logs: `ibmcloud ce jobrun logs --name <name>`
- Review API errors in Next.js console
- Test Docker locally first before deploying

---

**Ready to deploy? Run `./deploy.sh`!** 🚀
