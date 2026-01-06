# Deployment Quick Reference

## 🚀 First Time Deployment

### Prerequisites
```bash
export IBM_CLOUD_API_KEY="your-api-key-here"
export NAMESPACE="ranga"  # Your container registry namespace
```

### Deploy
```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

**First run will:**
1. Create Service ID: `ce-registry-access`
2. Create API key: `ce-registry-key`
3. Grant Container Registry Reader access
4. Build and push Docker image
5. Deploy to Code Engine

**⚠️ IMPORTANT:** Save the Service API Key that's displayed! You'll need it for subsequent deployments.

---

## 🔄 Subsequent Deployments

### If you have the Service API Key saved:
```bash
export IBM_CLOUD_API_KEY="your-main-api-key"
export NAMESPACE="ranga"
export SERVICE_API_KEY="your-saved-service-api-key"

./deploy-production.sh
```

### If you lost the Service API Key:
```bash
# Delete old key and regenerate
ibmcloud iam service-api-key-delete ce-registry-access ce-registry-key -f

# Then run deploy script (it will create a new one)
./deploy-production.sh
```

---

## 📝 What the Script Does

### Phase 1: IAM Setup (One-time)
- Creates Service ID for Code Engine
- Creates API key for that Service ID
- Grants Container Registry Reader access
- **Idempotent:** Safe to run multiple times

### Phase 2: Build & Push
- Creates optimized Docker image
- Pushes to IBM Container Registry
- Uses multi-stage build (small production image)

### Phase 3: Deploy
- Creates/updates Code Engine project
- Creates registry secret with Service ID credentials
- Deploys application with auto-scaling
- Returns live URL

---

## 🛠️ Common Commands

### Check Deployment Status
```bash
ibmcloud ce project select -n genai-learning-platform
ibmcloud ce app get --name genai-learning-platform
```

### View Logs
```bash
ibmcloud ce app logs --name genai-learning-platform --follow
```

### Update After Code Changes
```bash
# Just re-run the deploy script
./deploy-production.sh
```

### Scale Application
```bash
# Scale up
ibmcloud ce app update --name genai-learning-platform --max-scale 10

# Scale down (save costs)
ibmcloud ce app update --name genai-learning-platform --min-scale 0
```

### Check Costs
```bash
# View current usage
ibmcloud ce project current

# Check billing
ibmcloud billing account-usage
```

---

## 🧹 Cleanup

### Delete Application Only
```bash
ibmcloud ce app delete --name genai-learning-platform --force
```

### Delete Entire Project
```bash
ibmcloud ce project delete --name genai-learning-platform --force
```

### Delete Service ID (Complete Cleanup)
```bash
ibmcloud iam service-id-delete ce-registry-access -f
```

### Delete Container Image
```bash
ibmcloud cr image-rm icr.io/ranga/genai-learning-platform:latest
```

---

## 🐛 Troubleshooting

### Issue: "Service ID already exists"
**Solution:** Export the existing SERVICE_API_KEY:
```bash
export SERVICE_API_KEY="your-saved-key"
./deploy-production.sh
```

### Issue: "Unable to fetch image"
**Solution:** Recreate registry secret:
```bash
ibmcloud ce project select -n genai-learning-platform
ibmcloud ce registry delete --name icr-global --force
ibmcloud ce registry create \
  --name icr-global \
  --server icr.io \
  --username iamapikey \
  --password "$SERVICE_API_KEY"
```

### Issue: "Build fails"
**Solution:** Check Docker is running and node_modules exists:
```bash
docker ps  # Should not error
npm install  # Ensure dependencies are installed
```

### Issue: "App crashes on startup"
**Solution:** Check logs:
```bash
ibmcloud ce app logs --name genai-learning-platform --tail 100
```

Common causes:
- Missing `next.config.js` with `output: 'standalone'`
- Wrong PORT environment variable
- Node version mismatch

---

## 📊 Monitoring & Metrics

### Real-time Status
```bash
ibmcloud ce app get --name genai-learning-platform
```

### Application Events
```bash
ibmcloud ce app events --name genai-learning-platform
```

### Resource Usage
```bash
ibmcloud ce app get --name genai-learning-platform --output json | jq '.status'
```

---

## 💰 Cost Optimization

### For Development/Demo
```bash
# Scale to zero when not in use
ibmcloud ce app update --name genai-learning-platform --min-scale 0

# Reduce resources
ibmcloud ce app update --name genai-learning-platform \
  --cpu 0.5 \
  --memory 1G
```

### For Production
```bash
# Ensure availability
ibmcloud ce app update --name genai-learning-platform \
  --min-scale 2 \
  --max-scale 10

# Set budget alerts in IBM Cloud Console
```

---

## 🔐 Security Best Practices

### Rotate API Keys Regularly
```bash
# Delete old key
ibmcloud iam service-api-key-delete ce-registry-access ce-registry-key -f

# Create new key
ibmcloud iam service-api-key-create ce-registry-key ce-registry-access \
  --description "Rotated $(date +%Y-%m-%d)"

# Update registry secret (script does this automatically)
```

### Use Environment Variables for Secrets
```bash
# Add secrets to Code Engine
ibmcloud ce app update --name genai-learning-platform \
  --env IBM_WATSONX_API_KEY=secret:watsonx-key
```

### Enable HTTPS Only
```bash
# Code Engine automatically provides HTTPS
# Your URLs are: https://...appdomain.cloud
```

---

## 🎯 Quick Tips

1. **Always save the Service API Key** when it's first created
2. **Set min-scale to 0** during development to save costs
3. **Use `--force` flags** to avoid interactive prompts in scripts
4. **Tag images** with versions for rollback capability:
   ```bash
   docker tag genai-learning-platform:latest icr.io/ranga/genai-learning-platform:v1.0.0
   ```
5. **Monitor logs** during first deployment to catch issues early

---

## 📚 Resources

- **IBM Code Engine Docs:** https://cloud.ibm.com/docs/codeengine
- **IBM Container Registry:** https://cloud.ibm.com/docs/Registry
- **Service IDs & API Keys:** https://cloud.ibm.com/docs/account?topic=account-serviceids
- **Your Platform:** https://genai-learning-platform.24rtt3srkwax.us-south.codeengine.appdomain.cloud

---

## ✅ Deployment Checklist

Before deploying:
- [ ] Docker Desktop is running
- [ ] `npm install` completed successfully
- [ ] Environment variables set (IBM_CLOUD_API_KEY, NAMESPACE)
- [ ] IBM Cloud CLI installed and updated
- [ ] You have saved the Service API Key (if exists)

After deploying:
- [ ] Platform URL works in browser
- [ ] All pages load (/, /labs, /pricing)
- [ ] Monaco editor loads in lab environment
- [ ] No console errors (check browser DevTools)
- [ ] Set up monitoring/alerts
- [ ] Share URL with testers

---

**Need Help?** Check the main README.md or create an issue!
