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

# Step 1: Setup your credentials
# These are provided in the Lab Resources panel
api_key = "YOUR_API_KEY_HERE"
project_id = "lab-watsonx-first-call"

# Step 2: Initialize the model
# TODO: Complete the model initialization
model = Model(
    model_id="___",  # Hint: Use "ibm/granite-13b-chat-v2"
    credentials={
        "apikey": api_key,
        "url": "https://us-south.ml.cloud.ibm.com"
    },
    project_id=project_id
)

# Step 3: Create your first prompt
# TODO: Write a prompt asking "What is artificial intelligence?"
prompt = "___"

# Step 4: Generate text
# TODO: Call the generate_text method
response = model.___(___)

# Step 5: Print the result
print("AI Response:", response)
`,
}

export default function WatsonxFirstCallLab() {
  return <LabRunner labData={labData} />
}
