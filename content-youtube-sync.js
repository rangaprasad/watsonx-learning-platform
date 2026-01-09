/**
 * Content Script for YouTube - Video-Lab Synchronization
 * 
 * This script:
 * 1. Detects AI/ML tutorial videos
 * 2. Loads practice points from API
 * 3. Monitors video playback
 * 4. Shows practice notifications at right timestamps
 * 5. Opens labs with timestamp context
 */

// Configuration
const PLATFORM_URL = 'https://genai-learning-platform.24rtt3srkwax.us-south.codeengine.appdomain.cloud';
const CHECK_INTERVAL = 1000; // Check every second

// State
let videoId = null;
let practicePoints = [];
let lastTimestamp = 0;
let shownNotifications = new Set();
let isMonitoring = false;

// Initialize when page loads
console.log('GenAI Labs: Content script loaded');
init();

function init() {
  // Get video ID from URL
  videoId = getVideoId();
  
  if (!videoId) {
    console.log('GenAI Labs: No video ID found');
    return;
  }

  console.log('GenAI Labs: Video detected:', videoId);

  // Check if this is an AI/ML tutorial
  if (isAIMLVideo()) {
    console.log('GenAI Labs: AI/ML tutorial detected');
    loadPracticePoints();
    showOverlay();
    startVideoMonitoring();
  }
}

/**
 * Get YouTube video ID from URL
 */
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

/**
 * Check if video is about AI/ML
 */
function isAIMLVideo() {
  const title = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent || '';
  const description = document.querySelector('#description')?.textContent || '';
  const combined = (title + ' ' + description).toLowerCase();

  const keywords = [
    'ai', 'artificial intelligence', 'machine learning', 'ml',
    'deep learning', 'neural network', 'llm', 'gpt', 'chatbot',
    'bedrock', 'watsonx', 'openai', 'anthropic', 'claude',
    'langchain', 'vector database', 'embedding', 'rag',
    'prompt engineering', 'fine-tuning', 'generative ai'
  ];

  return keywords.some(keyword => combined.includes(keyword));
}

/**
 * Load practice points from API
 */
async function loadPracticePoints() {
  try {
    console.log('GenAI Labs: Loading practice points...');
    
    const response = await fetch(`${PLATFORM_URL}/api/practice-points/${videoId}`);
    const data = await response.json();

    practicePoints = data.practicePoints || [];
    
    console.log(`GenAI Labs: Loaded ${practicePoints.length} practice points`);
    
    // Update overlay with count
    updateOverlayCount(practicePoints.length);

  } catch (error) {
    console.error('GenAI Labs: Failed to load practice points:', error);
    // Fallback to static labs
    practicePoints = getStaticPracticePoints();
  }
}

/**
 * Fallback static practice points (for videos we haven't analyzed yet)
 */
function getStaticPracticePoints() {
  return [
    {
      timestamp: 180, // 3 minutes
      topic: "Getting Started",
      suggestedLab: {
        title: "Your First AI API Call",
        difficulty: "beginner"
      }
    }
  ];
}

/**
 * Start monitoring video playback
 */
function startVideoMonitoring() {
  if (isMonitoring) return;
  
  isMonitoring = true;
  console.log('GenAI Labs: Starting video monitoring');

  setInterval(() => {
    const video = document.querySelector('video');
    if (!video) return;

    const currentTime = Math.floor(video.currentTime);
    
    // Check if we've crossed a practice point threshold
    checkForPracticePoint(currentTime);
    
    lastTimestamp = currentTime;
  }, CHECK_INTERVAL);
}

/**
 * Check if current timestamp matches a practice point
 */
function checkForPracticePoint(currentTime) {
  const matchingPoint = practicePoints.find(point => {
    const isInWindow = currentTime >= point.timestamp && 
                       currentTime < point.timestamp + 10; // 10 second window
    const justCrossed = lastTimestamp < point.timestamp;
    const notShown = !shownNotifications.has(point.timestamp);
    
    return isInWindow && justCrossed && notShown;
  });

  if (matchingPoint) {
    showPracticeNotification(matchingPoint);
    shownNotifications.add(matchingPoint.timestamp);
  }
}

/**
 * Show practice notification
 */
function showPracticeNotification(point) {
  console.log('GenAI Labs: Showing practice notification for', point.topic);

  // Remove existing notification if any
  const existing = document.querySelector('.genai-practice-notification');
  if (existing) existing.remove();

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'genai-practice-notification';
  notification.innerHTML = `
    <div class="genai-notification-content">
      <div class="genai-notification-icon">💡</div>
      <div class="genai-notification-text">
        <h4>Ready to Practice!</h4>
        <p class="genai-notification-topic">${point.topic}</p>
        <p class="genai-notification-subtitle">The instructor just showed this - try it yourself now!</p>
      </div>
      <div class="genai-notification-actions">
        <button class="genai-btn-primary" data-timestamp="${point.timestamp}">
          Start Lab
        </button>
        <button class="genai-btn-secondary">
          Later
        </button>
      </div>
    </div>
  `;

  // Add event listeners
  notification.querySelector('.genai-btn-primary').addEventListener('click', () => {
    startLabAtTimestamp(point);
    notification.remove();
  });

  notification.querySelector('.genai-btn-secondary').addEventListener('click', () => {
    notification.remove();
  });

  // Add to page
  document.body.appendChild(notification);

  // Auto-dismiss after 15 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 15000);

  // Animate in
  setTimeout(() => notification.classList.add('show'), 100);
}

/**
 * Open lab at specific timestamp
 */
function startLabAtTimestamp(point) {
  console.log('GenAI Labs: Starting lab at timestamp', point.timestamp);

  // Determine lab ID based on topic (fallback to generic lab)
  const labId = determineLabId(point);

  // Build lab URL with context
  const labUrl = `${PLATFORM_URL}/labs/${labId}?videoId=${videoId}&timestamp=${point.timestamp}&topic=${encodeURIComponent(point.topic)}`;

  // Try to trigger Picture-in-Picture mode
  const video = document.querySelector('video');
  if (video && video.requestPictureInPicture && document.pictureInPictureEnabled) {
    video.requestPictureInPicture().catch(err => {
      console.log('GenAI Labs: PiP not available:', err);
    });
  }

  // Open lab in new tab
  window.open(labUrl, '_blank');
}

/**
 * Determine which lab to open based on topic
 */
function determineLabId(point) {
  const topic = point.topic.toLowerCase();
  const title = point.suggestedLab?.title?.toLowerCase() || '';
  
  // Match keywords to lab IDs
  if (topic.includes('bedrock') || title.includes('bedrock')) {
    return 'your-first-bedrock-api-call';
  } else if (topic.includes('watsonx') || title.includes('watsonx')) {
    return 'watsonx-first-call';
  } else if (topic.includes('chatbot') || title.includes('chatbot')) {
    return 'build-a-simple-chatbot';
  } else if (topic.includes('rag') || title.includes('rag')) {
    return 'advanced-rag-patterns';
  }
  
  // Default to bedrock lab
  return 'your-first-bedrock-api-call';
}

/**
 * Show initial overlay
 */
function showOverlay() {
  // Same overlay code as before, but with practice count
  const overlay = document.createElement('div');
  overlay.className = 'genai-overlay';
  overlay.innerHTML = `
    <div class="genai-header">
      <div class="genai-icon">🧪</div>
      <h3>GenAI Labs</h3>
      <span class="genai-practice-badge" id="genai-practice-count">
        Loading...
      </span>
    </div>
    <p class="genai-subtitle">Practice What You're Learning!</p>
    <div class="genai-labs-list" id="genai-labs-list">
      <div class="genai-loading">Analyzing video...</div>
    </div>
  `;

  document.body.appendChild(overlay);
}

/**
 * Update overlay with practice point count
 */
function updateOverlayCount(count) {
  const badge = document.getElementById('genai-practice-count');
  if (badge) {
    badge.textContent = `${count} practice ${count === 1 ? 'opportunity' : 'opportunities'}`;
  }

  // Update labs list
  const labsList = document.getElementById('genai-labs-list');
  if (labsList && practicePoints.length > 0) {
    labsList.innerHTML = practicePoints.map((point, index) => {
      const timestamp = formatTimestamp(point.timestamp);
      return `
        <div class="genai-lab-card">
          <div class="genai-lab-header">
            <span class="genai-lab-number">${index + 1}</span>
            <span class="genai-lab-badge genai-lab-badge-${point.suggestedLab.difficulty}">
              ${point.suggestedLab.difficulty}
            </span>
          </div>
          <h4 class="genai-lab-title">${point.suggestedLab.title}</h4>
          <p class="genai-lab-topic">${point.topic}</p>
          <p class="genai-lab-time">
            <span class="genai-time-badge">⏱️ ${point.suggestedLab.estimatedTime} min</span>
            <span class="genai-timestamp-badge">📍 ${timestamp}</span>
          </p>
          <button class="genai-lab-start-btn" data-index="${index}">
            Start Lab →
          </button>
        </div>
      `;
    }).join('');

    // Add click handlers
    labsList.querySelectorAll('.genai-lab-start-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        startLabAtTimestamp(practicePoints[index]);
      });
    });
  }
}

/**
 * Format timestamp (seconds to MM:SS)
 */
function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Listen for URL changes (YouTube SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Reset and reinitialize
    videoId = null;
    practicePoints = [];
    shownNotifications.clear();
    isMonitoring = false;
    init();
  }
}).observe(document, { subtree: true, childList: true });
