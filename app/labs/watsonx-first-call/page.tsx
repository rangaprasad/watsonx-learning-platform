import LabRunner from '@/components/LabRunner'

const labData = {
  id: 'watsonx-first-call',
  title: 'Your First watsonx.ai API Call',
  difficulty: 'beginner',
  platform: 'watsonx' as const,
  description: `
Welcome to your first hands-on lab with IBM watsonx.ai!

In this lab, you'll learn how to:
1. Import the watsonx.ai SDK
2. Initialize a foundation model (IBM Granite)
3. Make your first text generation API call
4. Understand the response structure

**Steps:**
1. Complete the TODO sections in the code
2. Click "Run Code" to execute
3. Check the output matches expected results

**Success Criteria:**
- Model initialization successful
- API call returns generated text
- No errors in output

**Resources:**
- API Key and Project ID are provided below
- watsonx.ai documentation: https://ibm.com/docs/watsonx
`,
starterCode: `from ibm_watsonx_ai.foundation_models import Model
import os

# Credentials are automatically provided by the environment
api_key = os.environ.get('WATSONX_API_KEY')
project_id = os.environ.get('WATSONX_PROJECT_ID')
url = os.environ.get('WATSONX_URL')

print("🔧 Initializing watsonx.ai model...")

# Initialize the model with IBM Granite 3
model = Model(
    model_id="ibm/granite-3-8b-instruct",
    credentials={"apikey": api_key, "url": url},
    project_id=project_id
)

print("✅ Model initialized successfully!")

# Create a prompt
prompt = "What is artificial intelligence?"

print("💭 Generating response...")

# Generate text
response = model.generate_text(prompt=prompt)

print("\\n🤖 AI Response:")
print(response)
`
