/**
 * Timestamp-Aware Lab Page
 * 
 * This component loads lab content based on video timestamp,
 * allowing seamless video-to-lab transitions.
 * 
 * URL: /labs/[labId]?videoId=xyz&timestamp=323&topic=...
 */

import LabRunner from '@/components/LabRunner';
import { notFound } from 'next/navigation';

// Lab content database (in production, load from API/database)
const LABS_DATABASE = {
  'your-first-bedrock-api-call': {
    id: 'your-first-bedrock-api-call',
    title: 'Your First Bedrock API Call',
    difficulty: 'beginner',
    platform: 'bedrock',
    
    // Multiple sections based on timestamps
    sections: [
      {
        timeRange: [0, 400],
        title: 'Section 1: Initialize Bedrock Client',
        description: `Learn how to set up your AWS Bedrock client and prepare for your first API call.
        
**What you'll do:**
- Import the boto3 library
- Initialize the Bedrock runtime client
- Understand the basic setup

**Success criteria:**
- Client initialization completes without errors
- You understand the role of boto3`,
        starterCode: `import boto3

# Step 1: Initialize Bedrock client
# TODO: Create a bedrock-runtime client for the us-east-1 region
bedrock = None

print("✅ Bedrock client initialized!")
print(f"Client type: {type(bedrock)}")
`
      },
      {
        timeRange: [400, 600],
        title: 'Section 2: Make Your First API Call',
        description: `Now that your client is set up, make your first call to a foundation model.
        
**What you'll do:**
- Define the model ID
- Create a request body with a prompt
- Call invoke_model()
- Handle the response

**Success criteria:**
- API call completes successfully
- You receive a response from the model`,
        starterCode: `import boto3
import json

# Client is already set up
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

# Step 2: Define model and create request
# TODO: Set the model ID to "anthropic.claude-3-sonnet-20240229-v1:0"
model_id = "___"

# TODO: Create a prompt asking "What is Amazon Bedrock?"
prompt = "___"

# TODO: Create the request body
request_body = json.dumps({
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 1000,
    "messages": [
        {"role": "user", "content": prompt}
    ]
})

# TODO: Call the model
response = bedrock.invoke_model(
    modelId=model_id,
    body=request_body
)

print("✅ API call successful!")
print(f"Response: {response}")
`
      },
      {
        timeRange: [600, 900],
        title: 'Section 3: Parse and Display Response',
        description: `The final step is parsing the JSON response and displaying the generated text.
        
**What you'll do:**
- Read the response body
- Parse the JSON
- Extract the generated text
- Display it nicely

**Success criteria:**
- Response is correctly parsed
- Generated text is displayed
- You understand the response structure`,
        starterCode: `import boto3
import json

# Previous code...
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
model_id = "anthropic.claude-3-sonnet-20240229-v1:0"
prompt = "What is Amazon Bedrock?"

request_body = json.dumps({
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 1000,
    "messages": [{"role": "user", "content": prompt}]
})

response = bedrock.invoke_model(modelId=model_id, body=request_body)

# Step 3: Parse the response
# TODO: Read the response body
response_body = json.loads(response['body'].read())

# TODO: Extract the generated text
# Hint: response_body['content'][0]['text']
generated_text = "___"

print("🤖 AI Response:")
print(generated_text)
`
      }
    ]
  },
  
  'watsonx-first-call': {
    id: 'watsonx-first-call',
    title: 'Your First watsonx.ai API Call',
    difficulty: 'beginner',
    platform: 'watsonx',
    
    sections: [
      {
        timeRange: [0, 999999], // Single section for now
        title: 'Make Your First watsonx.ai Call',
        description: `Learn how to use IBM watsonx.ai foundation models.
        
**What you'll do:**
- Import the watsonx.ai SDK
- Initialize a model
- Generate text with AI
- Understand the response

**Success criteria:**
- Model initializes successfully
- You receive real AI-generated text`,
        starterCode: `import os
from ibm_watsonx_ai.foundation_models import Model

# Credentials are provided automatically
api_key = os.environ.get('WATSONX_API_KEY')
project_id = os.environ.get('WATSONX_PROJECT_ID')
url = os.environ.get('WATSONX_URL')

# Step 1: Initialize the model
# TODO: Use model_id="ibm/granite-3-8b-instruct"
model = Model(
    model_id="___",
    credentials={"apikey": api_key, "url": url},
    project_id=project_id
)

print("✅ Model initialized!")

# Step 2: Generate text
# TODO: Write a prompt asking about AI
prompt = "___"

response = model.generate_text(prompt=prompt)

print(f"\\n🤖 AI Response:\\n{response}")
`
      }
    ]
  }
};

interface PageProps {
  params: {
    labId: string;
  };
  searchParams: {
    videoId?: string;
    timestamp?: string;
    topic?: string;
  };
}

export default function LabPage({ params, searchParams }: PageProps) {
  const { labId } = params;
  const { videoId, timestamp, topic } = searchParams;

  // Get lab from database
  const labTemplate = LABS_DATABASE[labId as keyof typeof LABS_DATABASE];
  
  if (!labTemplate) {
    notFound();
  }

  // Determine which section to show based on timestamp
  const currentTimestamp = timestamp ? parseInt(timestamp) : 0;
  const section = getAppropriateSection(labTemplate.sections, currentTimestamp);

  // Build lab data for LabRunner
  const labData = {
    id: labTemplate.id,
    title: section.title,
    fullTitle: labTemplate.title,
    difficulty: labTemplate.difficulty,
    platform: labTemplate.platform,
    description: section.description,
    starterCode: section.starterCode,
    videoId: videoId || null,
    timestamp: currentTimestamp,
    topic: topic || null,
    sectionNumber: labTemplate.sections.indexOf(section) + 1,
    totalSections: labTemplate.sections.length
  };

  return <LabRunner labData={labData} />;
}

/**
 * Get the appropriate lab section based on video timestamp
 */
function getAppropriateSection(sections: any[], timestamp: number) {
  // Find section whose time range includes the timestamp
  const matchingSection = sections.find(section => {
    const [start, end] = section.timeRange;
    return timestamp >= start && timestamp < end;
  });

  // Default to first section if no match
  return matchingSection || sections[0];
}

/**
 * Generate static paths for common labs
 */
export async function generateStaticParams() {
  return Object.keys(LABS_DATABASE).map(labId => ({
    labId
  }));
}
