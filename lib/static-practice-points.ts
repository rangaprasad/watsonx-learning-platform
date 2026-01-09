/**
 * Static Practice Points Fallback
 * 
 * Use these when YouTube transcript extraction fails.
 * Pre-analyzed practice points for popular videos.
 */

export const STATIC_PRACTICE_POINTS: Record<string, any> = {
  // New video: https://www.youtube.com/watch?v=eWRfhZUzrAc
  'eWRfhZUzrAc': {
    videoId: 'eWRfhZUzrAc',
    title: 'AI/ML Tutorial',
    duration: 1200,
    practicePoints: [
      {
        timestamp: 120,
        endTimestamp: 240,
        topic: 'Getting Started with AI APIs',
        description: 'Learn how to set up and make your first AI API call.',
        suggestedLab: {
          title: 'Your First AI API Call',
          starterCode: `import os\n\n# TODO: Initialize your AI client\n\n# TODO: Make your first API call\n\nprint("API call successful!")`,
          difficulty: 'beginner' as const,
          estimatedTime: 15
        }
      },
      {
        timestamp: 300,
        endTimestamp: 420,
        topic: 'Working with Prompts',
        description: 'Understand how to craft effective prompts and handle responses.',
        suggestedLab: {
          title: 'Build Your First Chatbot',
          starterCode: `# TODO: Create a prompt\nprompt = "___"\n\n# TODO: Send to AI model\n\n# TODO: Display response`,
          difficulty: 'intermediate' as const,
          estimatedTime: 20
        }
      },
      {
        timestamp: 600,
        endTimestamp: 720,
        topic: 'Advanced AI Patterns',
        description: 'Explore advanced techniques like context management and error handling.',
        suggestedLab: {
          title: 'Advanced AI Patterns',
          starterCode: `# TODO: Implement context management\n# TODO: Add error handling\n# TODO: Optimize for production`,
          difficulty: 'advanced' as const,
          estimatedTime: 25
        }
      }
    ]
  },

  // AWS Bedrock Tutorial
  'iOdFUJiB0Zc': {
    videoId: 'iOdFUJiB0Zc',
    title: 'Getting Started with AWS Bedrock',
    duration: 945,
    practicePoints: [
      {
        timestamp: 180,
        endTimestamp: 300,
        topic: 'Setting up AWS Bedrock Client',
        description: 'Learn how to initialize the boto3 client and set up credentials for AWS Bedrock.',
        suggestedLab: {
          title: 'Your First Bedrock API Call',
          starterCode: `import boto3\n\n# TODO: Initialize bedrock client\nbedrock = None\n\nprint("Client initialized!")`,
          difficulty: 'beginner' as const,
          estimatedTime: 15
        }
      },
      {
        timestamp: 360,
        endTimestamp: 480,
        topic: 'Making Your First API Call',
        description: 'Demonstrate how to call the invoke_model API with a simple prompt and handle the response.',
        suggestedLab: {
          title: 'Build a Simple Chatbot',
          starterCode: `import boto3\nimport json\n\nbedrock = boto3.client('bedrock-runtime')\n\n# TODO: Create request and call API`,
          difficulty: 'intermediate' as const,
          estimatedTime: 20
        }
      },
      {
        timestamp: 600,
        endTimestamp: 720,
        topic: 'Advanced Response Handling',
        description: 'Parse and process the JSON response from Bedrock, including error handling.',
        suggestedLab: {
          title: 'Advanced RAG Patterns',
          starterCode: `# TODO: Implement response parsing\n# TODO: Add error handling`,
          difficulty: 'advanced' as const,
          estimatedTime: 25
        }
      }
    ]
  },

  // watsonx.ai Tutorial  
  'xyz123example': {
    videoId: 'xyz123example',
    title: 'IBM watsonx.ai Getting Started',
    duration: 720,
    practicePoints: [
      {
        timestamp: 120,
        endTimestamp: 240,
        topic: 'Initializing watsonx.ai Model',
        description: 'Set up credentials and initialize your first foundation model.',
        suggestedLab: {
          title: 'Your First watsonx.ai Call',
          starterCode: `import os\nfrom ibm_watsonx_ai.foundation_models import Model\n\n# TODO: Initialize model`,
          difficulty: 'beginner' as const,
          estimatedTime: 15
        }
      }
    ]
  }
};

/**
 * Get static practice points for a video
 */
export function getStaticPracticePoints(videoId: string) {
  return STATIC_PRACTICE_POINTS[videoId] || null;
}
