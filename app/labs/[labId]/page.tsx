'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LabRunner from '@/components/LabRunner';

// Lab data - in production this would come from a database
const LABS_DATA = {
  'your-first-bedrock-api-call': {
    id: 'your-first-bedrock-api-call',
    title: 'Your First AI API Call',
    difficulty: 'beginner',
    platform: 'bedrock',
    duration: 15,
    description: 'Learn how to make your first API call to Amazon Bedrock',
    objectives: [
      'Understand how to authenticate with Bedrock',
      'Make a simple text generation request',
      'Parse and display the response'
    ],
    starterCode: `import boto3
import json

# TODO: Initialize the Bedrock client
bedrock = boto3.client(
    service_name='bedrock-runtime',
    region_name='us-east-1'
)

# TODO: Define the model ID
model_id = 'anthropic.claude-3-sonnet-20240229-v1:0'

# TODO: Create the request body
prompt = "What is Amazon Bedrock?"
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

# TODO: Parse and print the response
response_body = json.loads(response['body'].read())
print(response_body['content'][0]['text'])
`,
    instructions: [
      {
        step: 1,
        title: 'Initialize the Bedrock Client',
        description: 'Import boto3 and create a client for the Bedrock runtime service'
      },
      {
        step: 2,
        title: 'Specify the Model',
        description: 'Use Claude 3 Sonnet model ID: anthropic.claude-3-sonnet-20240229-v1:0'
      },
      {
        step: 3,
        title: 'Create the Request',
        description: 'Build a JSON request body with your prompt and parameters'
      },
      {
        step: 4,
        title: 'Invoke the Model',
        description: 'Call invoke_model() with the model ID and request body'
      },
      {
        step: 5,
        title: 'Parse the Response',
        description: 'Extract and display the generated text from the response'
      }
    ],
    hints: [
      'Make sure to import boto3 at the top',
      'The model ID must match exactly',
      'The response body needs to be read and parsed as JSON'
    ]
  },
  'build-a-simple-chatbot': {
    id: 'build-a-simple-chatbot',
    title: 'Build a Simple Chatbot',
    difficulty: 'intermediate',
    platform: 'bedrock',
    duration: 20,
    description: 'Create an interactive chatbot using Amazon Bedrock',
    objectives: [
      'Handle multi-turn conversations',
      'Maintain conversation history',
      'Build a simple chat interface'
    ],
    starterCode: `import boto3
import json

bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
model_id = 'anthropic.claude-3-sonnet-20240229-v1:0'

def chat(conversation_history, user_message):
    """
    Send a message and get a response
    
    Args:
        conversation_history: List of previous messages
        user_message: New message from user
    
    Returns:
        Assistant's response
    """
    # TODO: Add user message to history
    conversation_history.append({
        "role": "user",
        "content": user_message
    })
    
    # TODO: Call Bedrock with conversation history
    request_body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1000,
        "messages": conversation_history
    })
    
    response = bedrock.invoke_model(
        modelId=model_id,
        body=request_body
    )
    
    # TODO: Extract response and add to history
    response_body = json.loads(response['body'].read())
    assistant_message = response_body['content'][0]['text']
    
    conversation_history.append({
        "role": "assistant",
        "content": assistant_message
    })
    
    return assistant_message

# Test the chatbot
history = []
print("Chatbot ready! Type 'quit' to exit.")

while True:
    user_input = input("You: ")
    if user_input.lower() == 'quit':
        break
    
    response = chat(history, user_input)
    print(f"Bot: {response}")
`,
    instructions: [
      {
        step: 1,
        title: 'Create Chat Function',
        description: 'Build a function that handles conversation history'
      },
      {
        step: 2,
        title: 'Maintain History',
        description: 'Keep track of all messages in the conversation'
      },
      {
        step: 3,
        title: 'Send Context',
        description: 'Include full conversation history in each request'
      },
      {
        step: 4,
        title: 'Update History',
        description: 'Add both user and assistant messages to the history'
      },
      {
        step: 5,
        title: 'Test the Chat',
        description: 'Try having a multi-turn conversation'
      }
    ],
    hints: [
      'Each message needs both "role" and "content" fields',
      'The history should include both user and assistant messages',
      'Messages should be in chronological order'
    ]
  },
  'advanced-rag-patterns': {
    id: 'advanced-rag-patterns',
    title: 'Advanced RAG Pattern',
    difficulty: 'advanced',
    platform: 'bedrock',
    duration: 30,
    description: 'Implement Retrieval Augmented Generation with Amazon Bedrock',
    objectives: [
      'Set up a vector database',
      'Implement semantic search',
      'Combine retrieval with generation'
    ],
    starterCode: `import boto3
import json
from typing import List

bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
model_id = 'anthropic.claude-3-sonnet-20240229-v1:0'

# Sample knowledge base
knowledge_base = [
    "Amazon Bedrock is a fully managed service for foundation models.",
    "Bedrock supports models from Anthropic, AI21 Labs, and Stability AI.",
    "RAG stands for Retrieval Augmented Generation."
]

def retrieve_relevant_docs(query: str, k: int = 2) -> List[str]:
    """
    Simple retrieval - in production use a proper vector DB
    
    Args:
        query: User's question
        k: Number of documents to retrieve
    
    Returns:
        List of relevant documents
    """
    # TODO: Implement semantic search
    # For now, return all docs
    return knowledge_base[:k]

def generate_with_rag(query: str) -> str:
    """
    Generate answer using retrieved context
    
    Args:
        query: User's question
    
    Returns:
        Generated answer
    """
    # TODO: Retrieve relevant documents
    docs = retrieve_relevant_docs(query)
    
    # TODO: Build prompt with context
    context = "\\n".join(docs)
    prompt = f"""Use the following context to answer the question:

Context:
{context}

Question: {query}

Answer based only on the context provided:"""
    
    # TODO: Call Bedrock
    request_body = json.dumps({
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1000,
        "messages": [
            {"role": "user", "content": prompt}
        ]
    })
    
    response = bedrock.invoke_model(
        modelId=model_id,
        body=request_body
    )
    
    response_body = json.loads(response['body'].read())
    return response_body['content'][0]['text']

# Test RAG
question = "What is Amazon Bedrock?"
answer = generate_with_rag(question)
print(f"Q: {question}")
print(f"A: {answer}")
`,
    instructions: [
      {
        step: 1,
        title: 'Create Knowledge Base',
        description: 'Set up a simple document store (in production: use vector DB)'
      },
      {
        step: 2,
        title: 'Implement Retrieval',
        description: 'Find relevant documents for the query'
      },
      {
        step: 3,
        title: 'Build Context Prompt',
        description: 'Combine retrieved docs into a context for the LLM'
      },
      {
        step: 4,
        title: 'Generate Answer',
        description: 'Use Bedrock to generate answer based on context'
      },
      {
        step: 5,
        title: 'Test RAG Pipeline',
        description: 'Ask questions and verify answers use the context'
      }
    ],
    hints: [
      'In production, use FAISS, Pinecone, or similar for vector search',
      'Consider using Bedrock for embeddings too',
      'Format the context clearly in the prompt'
    ]
  }
};

export default function LabPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const labId = params.labId as string;
  const [labData, setLabData] = useState<any>(null);
  
  useEffect(() => {
    // Get lab data
    const lab = LABS_DATA[labId as keyof typeof LABS_DATA];
    if (lab) {
      setLabData(lab);
    }
  }, [labId]);

  if (!labData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lab Not Found</h1>
          <p className="text-gray-600 mb-4">
            The lab "{labId}" doesn't exist yet.
          </p>
          <a 
            href="/labs" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Labs
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LabRunner labData={labData} />
    </div>
  );
}
