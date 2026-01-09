# Video-Lab Sync Feature - Deployment Guide

## 🎯 What We're Adding

This guide will help you deploy the **video-lab synchronization feature** - the killer feature that makes GenAI Labs truly magical!

**What it does:**
- Extracts YouTube transcripts with timestamps
- Uses AI to identify practice moments
- Shows notifications at perfect times
- Opens labs with context from the video
- Tracks section progress
- Allows resuming video after practice

---

## 📦 Files to Add

### 1. Backend API Routes

**Location:** `app/api/`

```bash
cd ~/Code/work/star-edtech/watsonx-learning-platform

# Create API directories
mkdir -p app/api/extract-transcript
mkdir -p app/api/analyze-video
mkdir -p app/api/practice-points/[videoId]

# Copy API route files
cp ~/Downloads/api-extract-transcript-route.ts app/api/extract-transcript/route.ts
cp ~/Downloads/api-analyze-video-route.ts app/api/analyze-video/route.ts
cp ~/Downloads/api-practice-points-route.ts app/api/practice-points/[videoId]/route.ts
```

---

### 2. Updated Lab Page

**Location:** `app/labs/[labId]/page.tsx`

```bash
# Backup current lab page
cp app/labs/[labId]/page.tsx app/labs/[labId]/page-backup.tsx

# Copy new timestamp-aware lab page
cp ~/Downloads/labs-labId-page-sync.tsx app/labs/[labId]/page.tsx
```

---

### 3. Enhanced LabRunner Component

**Location:** `components/LabRunner.tsx`

```bash
# Backup current LabRunner
cp components/LabRunner.tsx components/LabRunner-backup.tsx

# Copy enhanced LabRunner
cp ~/Downloads/LabRunner-sync.tsx components/LabRunner.tsx
```

---

### 4. Chrome Extension Updates

**Location:** `../genai-labs-extension/`

```bash
cd ../genai-labs-extension

# Backup current files
cp content-youtube.js content-youtube-backup.js
cp overlay.css overlay-backup.css

# Copy updated files
cp ~/Downloads/content-youtube-sync.js content-youtube.js
cp ~/Downloads/overlay-sync.css overlay.css
```

---

## 📚 Required Dependencies

### Next.js Platform

Add these packages:

```bash
cd ~/Code/work/star-edtech/watsonx-learning-platform

# Install YouTube transcript API
npm install youtube-transcript

# Anthropic SDK (for AI analysis)
npm install @anthropic-ai/sdk
```

Update `package.json`:
```json
{
  "dependencies": {
    "youtube-transcript": "^1.0.6",
    "@anthropic-ai/sdk": "^0.10.2",
    ...existing dependencies
  }
}
```

---

## 🔐 Environment Variables

Add to `.env.local`:

```bash
# Anthropic API key for video analysis
ANTHROPIC_API_KEY=your-anthropic-api-key

# Platform URL for API calls
NEXT_PUBLIC_API_URL=https://genai-learning-platform.24rtt3srkwax.us-south.codeengine.appdomain.cloud
```

**Get Anthropic API Key:**
1. Go to: https://console.anthropic.com/
2. Create API key
3. Copy to `.env.local`

---

## 🚀 Deployment Steps

### Step 1: Test Locally

```bash
cd ~/Code/work/star-edtech/watsonx-learning-platform

# Install dependencies
npm install

# Run locally
npm run dev

# Test in browser: http://localhost:3000
```

**Test the APIs:**

```bash
# Test transcript extraction
curl -X POST http://localhost:3000/api/extract-transcript \
  -H 'Content-Type: application/json' \
  -d '{"videoId": "iOdFUJiB0Zc"}'

# Should return transcript with timestamps
```

---

### Step 2: Deploy to IBM Cloud

```bash
# Build production image
docker build --platform linux/amd64 -f Dockerfile.prod -t genai-learning-platform:latest .

# Tag for IBM Cloud
docker tag genai-learning-platform:latest icr.io/ranga/genai-learning-platform:latest

# Push to registry
docker push icr.io/ranga/genai-learning-platform:latest

# Update app with environment variables
ibmcloud ce project select -n genai-learning-platform

ibmcloud ce app update \
  --name genai-learning-platform \
  --image icr.io/ranga/genai-learning-platform:latest \
  --env ANTHROPIC_API_KEY="your-key-here" \
  --env NEXT_PUBLIC_API_URL="https://genai-learning-platform.24rtt3srkwax.us-south.codeengine.appdomain.cloud"
```

---

### Step 3: Update Chrome Extension

```bash
cd ../genai-labs-extension

# Extension is ready to test locally
# Go to chrome://extensions
# Click "Reload" on GenAI Labs extension
```

**Test extension:**
1. Go to YouTube: https://www.youtube.com/watch?v=iOdFUJiB0Zc
2. Wait for overlay to load
3. Should see "Analyzing video..." then practice count
4. Play video and wait for notifications

---

## 🧪 Testing Checklist

### Backend APIs

- [ ] GET `/api/practice-points/iOdFUJiB0Zc` returns practice points
- [ ] POST `/api/extract-transcript` returns transcript
- [ ] POST `/api/analyze-video` returns AI analysis
- [ ] APIs return cached results on second call

### Extension

- [ ] Overlay appears on AI/ML videos
- [ ] Practice count displays correctly
- [ ] Video monitoring starts automatically
- [ ] Notifications appear at timestamps
- [ ] "Start Lab" button opens correct lab

### Lab Pages

- [ ] Labs open with timestamp parameter
- [ ] Correct section loads based on timestamp
- [ ] Progress bar shows section number
- [ ] "Continue Video" button works
- [ ] Code execution still works

---

## 🐛 Troubleshooting

### Issue: "youtube-transcript" fails

**Cause:** YouTube blocking transcript API

**Solution 1:** Use fallback static practice points
```javascript
// In content-youtube-sync.js
function getStaticPracticePoints() {
  return [
    {
      timestamp: 300,
      topic: "Getting Started",
      suggestedLab: { title: "Your First API Call", difficulty: "beginner" }
    }
  ];
}
```

**Solution 2:** Pre-extract transcripts and store in database

---

### Issue: Anthropic API rate limits

**Cause:** Too many analysis requests

**Solution:** Cache results aggressively
```typescript
// Already implemented in api-practice-points-route.ts
const cache = new Map<string, PracticePointsResponse>();
```

---

### Issue: Extension notifications not appearing

**Debug:**
1. Open browser console (F12)
2. Check for errors
3. Verify `practicePoints` array loaded
4. Check video element exists

**Fix:**
```javascript
// In console:
console.log(practicePoints); // Should show array
console.log(document.querySelector('video')); // Should show video element
```

---

## 📊 Monitoring & Analytics

### Add Event Tracking (Optional)

```typescript
// In content-youtube-sync.js
function trackEvent(eventName: string, data: any) {
  // Send to your analytics
  fetch('https://your-analytics.com/track', {
    method: 'POST',
    body: JSON.stringify({ event: eventName, ...data })
  });
}

// Track notification shown
trackEvent('practice_notification_shown', {
  videoId,
  timestamp: point.timestamp,
  topic: point.topic
});

// Track lab started
trackEvent('lab_started', {
  videoId,
  labId,
  timestamp
});
```

---

## 🎯 Success Metrics

After deployment, track:

**Engagement:**
- % of users who click "Start Lab" from notification
- Average time from notification to lab start
- Completion rate per section

**Usage:**
- Videos analyzed per day
- Practice points generated
- Labs opened from video context

**Performance:**
- API response times
- Cache hit rate
- Extension load time

---

## 🚀 Going Live

### Pre-Launch Checklist

- [ ] Test on 5+ different videos
- [ ] Verify all practice notifications work
- [ ] Confirm labs load with correct sections
- [ ] Check API performance under load
- [ ] Test extension on different browsers
- [ ] Prepare demo video for launch

### Launch Day

1. **Social Media Posts:**
   - "We just made learning AI 10x more effective"
   - Share demo video showing video → notification → lab flow
   - Highlight the "aha moment"

2. **Product Hunt:**
   - Title: "GenAI Labs - Practice While You Watch AI Tutorials"
   - Tagline: "Interactive coding labs that appear at the perfect moment in YouTube tutorials"
   - Demo video showing seamless sync

3. **Hacker News:**
   - Show HN: Real-time practice labs for AI/ML YouTube tutorials
   - Explain the technical challenge of video-lab sync

---

## 📈 Future Enhancements

**Week 3 Ideas:**

1. **Bi-Directional Sync**
   - Lab completion triggers video resume
   - Video pause triggers lab suggestion

2. **Multi-Video Paths**
   - Create learning paths across multiple videos
   - Track progress across entire course

3. **Collaborative Features**
   - See how many people are on same section
   - Share code snippets
   - Ask questions to AI tutor

4. **Mobile Support**
   - iOS/Android apps
   - Practice on phone while watching on TV

---

## 🎉 You're Ready!

Once deployed, you'll have the **killer feature** that makes GenAI Labs unique!

**The flow:**
```
User watches YouTube → 
Notification at 5:23 → 
Click "Start Lab" → 
Lab opens with exact code from video → 
User practices → 
Click "Continue Video" → 
Seamless learning! 🚀
```

---

**Questions?** Review the code files or test each component individually!
