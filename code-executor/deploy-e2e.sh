#!/bin/bash
# 1. Set your credentials (Run these in your terminal first!)
# export WATSONX_APIKEY="your_key"
# export WATSONX_PROJECT_ID="your_project"

# 2. Build and Push
NAMESPACE="ranga" # Change to your namespace
IMAGE="icr.io/$NAMESPACE/code-executor:latest"

docker build --platform linux/amd64 -t code-executor .
docker tag code-executor $IMAGE
docker push $IMAGE

# 3. Create Secrets (The Fix for NoCredentialsError)
ibmcloud ce secret create --name ibm-creds \
  --from-literal "WATSONX_APIKEY=$WATSONX_APIKEY" \
  --from-literal "WATSONX_PROJECT_ID=$WATSONX_PROJECT_ID" \
  --from-literal "WATSONX_URL=https://us-south.ml.cloud.ibm.com" 2>/dev/null || \
ibmcloud ce secret update --name ibm-creds \
  --from-literal "WATSONX_APIKEY=$WATSONX_APIKEY"

# 4. Deploy as App
ibmcloud ce app create --name executor-app --image $IMAGE \
  --env-from-secret ibm-creds --port 8080 --min-scale 1
