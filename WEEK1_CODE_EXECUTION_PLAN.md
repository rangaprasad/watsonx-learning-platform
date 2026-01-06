# Week 1: Code Execution Backend - Implementation Plan

## Goal
Build a production-ready, secure code execution backend that:
- Executes Python code safely in isolated containers
- Handles timeouts and errors gracefully
- Scales automatically
- Costs near-zero for MVP usage

---

## Architecture Decision: IBM Cloud Code Engine

**Why Code Engine over Cloud Functions:**
1. Runs containers directly (vs Lambda's runtime limits)
2. Built-in auto-scaling
3. Free tier: 100K vCPU-seconds/month
4. Pay-per-use pricing
5. Already familiar from deployment

**Stack:**
- **Container:** Docker with Python 3.11
- **Execution:** IBM Cloud Code Engine
- **API:** Next.js API routes
- **Timeout:** 30 seconds max
- **Memory:** 512MB per execution

---

## Day 1: Build Execution Container

### Step 1: Create Dockerfile for Code Execution

**File:** `code-executor/Dockerfile`

```dockerfile
FROM python:3.11-slim

# Install common packages
RUN pip install --no-cache-dir \
    boto3 \
    requests \
    numpy \
    pandas \
    matplotlib \
    pillow \
    python-dotenv

# Create execution directory
WORKDIR /code

# Copy execution script
COPY execute.py /code/

# Set up non-root user for security
RUN useradd -m -u 1000 coderunner && \
    chown -R coderunner:coderunner /code

USER coderunner

# Run execution server
CMD ["python", "execute.py"]
```

### Step 2: Create Execution Script

**File:** `code-executor/execute.py`

```python
import sys
import io
import contextlib
import json
import traceback
from typing import Dict, Any

def execute_code(code: str, timeout: int = 30) -> Dict[str, Any]:
    """
    Execute Python code and capture output/errors
    
    Args:
        code: Python code to execute
        timeout: Maximum execution time in seconds
    
    Returns:
        Dict with status, output, error
    """
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    
    result = {
        "status": "success",
        "output": "",
        "error": "",
        "execution_time": 0
    }
    
    try:
        # Redirect stdout/stderr
        with contextlib.redirect_stdout(stdout_capture), \
             contextlib.redirect_stderr(stderr_capture):
            
            # Create restricted globals (security)
            restricted_globals = {
                "__builtins__": __builtins__,
                "__name__": "__main__",
                "__doc__": None,
            }
            
            # Execute code
            exec(code, restricted_globals)
        
        # Capture output
        result["output"] = stdout_capture.getvalue()
        
    except Exception as e:
        result["status"] = "error"
        result["error"] = traceback.format_exc()
        result["output"] = stdout_capture.getvalue()
    
    return result

if __name__ == "__main__":
    # Read code from stdin
    code = sys.stdin.read()
    
    # Execute
    result = execute_code(code)
    
    # Output JSON
    print(json.dumps(result))
```

---

## Day 2: Deploy to IBM Cloud Code Engine

### Build and Push Container

```bash
# Build the executor image
cd code-executor
docker build --platform linux/amd64 -t code-executor:latest .

# Tag for IBM Cloud Registry
docker tag code-executor:latest icr.io/ranga/code-executor:latest

# Push to registry
docker push icr.io/ranga/code-executor:latest

# Deploy as Code Engine Job (not app - we want on-demand execution)
ibmcloud ce job create \
  --name code-executor \
  --image icr.io/ranga/code-executor:latest \
  --cpu 0.5 \
  --memory 512M \
  --maxexecutiontime 30 \
  --retrylimit 0
```

### Test the Job

```bash
# Submit test job
ibmcloud ce jobrun submit \
  --name code-executor-test \
  --job code-executor

# Check logs
ibmcloud ce jobrun logs --name code-executor-test
```

---

## Day 3: Build API Endpoint

### Create Next.js API Route

**File:** `app/api/execute/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ExecutionRequest {
  code: string;
  language: string;
  timeout?: number;
}

interface ExecutionResult {
  status: 'success' | 'error' | 'timeout';
  output: string;
  error?: string;
  executionTime: number;
}

export async function POST(request: NextRequest) {
  try {
    const { code, language, timeout = 30 } = await request.json() as ExecutionRequest;
    
    // Validate input
    if (!code || !code.trim()) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }
    
    if (language !== 'python') {
      return NextResponse.json(
        { error: 'Only Python is supported currently' },
        { status: 400 }
      );
    }
    
    // Execute via IBM Cloud Code Engine Job
    const startTime = Date.now();
    
    try {
      // Submit job run with code as input
      const { stdout, stderr } = await execAsync(
        `echo '${code.replace(/'/g, "'\\''")}' | ` +
        `ibmcloud ce jobrun submit --name exec-${Date.now()} ` +
        `--job code-executor --wait --quiet`,
        { timeout: timeout * 1000 }
      );
      
      const executionTime = Date.now() - startTime;
      
      // Parse result from job output
      const result = JSON.parse(stdout);
      
      return NextResponse.json({
        status: result.status,
        output: result.output,
        error: result.error,
        executionTime
      });
      
    } catch (execError: any) {
      const executionTime = Date.now() - startTime;
      
      // Check if timeout
      if (execError.killed || execError.signal === 'SIGTERM') {
        return NextResponse.json({
          status: 'timeout',
          output: '',
          error: `Execution timeout (${timeout}s limit exceeded)`,
          executionTime
        });
      }
      
      // Other execution error
      return NextResponse.json({
        status: 'error',
        output: '',
        error: execError.message || 'Execution failed',
        executionTime
      });
    }
    
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'code-executor',
    version: '1.0.0'
  });
}
```

---

## Day 4: Update Frontend to Use API

### Update LabRunner Component

**File:** `components/LabRunner.tsx`

Add the execution logic:

```typescript
const [output, setOutput] = useState('');
const [isRunning, setIsRunning] = useState(false);
const [executionTime, setExecutionTime] = useState(0);

const runCode = async () => {
  setIsRunning(true);
  setOutput('Running code...');
  
  try {
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: currentCode,
        language: 'python',
        timeout: 30
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'success') {
      setOutput(result.output || 'Code executed successfully (no output)');
    } else if (result.status === 'timeout') {
      setOutput(`⏱️ Timeout: ${result.error}`);
    } else {
      setOutput(`❌ Error:\n${result.error}`);
    }
    
    setExecutionTime(result.executionTime);
    
  } catch (error) {
    setOutput(`❌ Failed to execute code: ${error.message}`);
  } finally {
    setIsRunning(false);
  }
};
```

---

## Day 5: Add Security & Rate Limiting

### Security Measures

1. **Input Validation:**
```typescript
// Prevent dangerous operations
const BLOCKED_KEYWORDS = [
  'import os',
  'import subprocess',
  'import sys',
  '__import__',
  'eval(',
  'exec(',
  'compile(',
];

function validateCode(code: string): boolean {
  const lowerCode = code.toLowerCase();
  return !BLOCKED_KEYWORDS.some(keyword => lowerCode.includes(keyword));
}
```

2. **Rate Limiting:**
```typescript
// Simple in-memory rate limiter
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRequests = rateLimiter.get(userId) || [];
  
  // Remove requests older than 1 minute
  const recentRequests = userRequests.filter(time => now - time < 60000);
  
  // Allow max 10 requests per minute
  if (recentRequests.length >= 10) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(userId, recentRequests);
  return true;
}
```

3. **Resource Limits:**
- Max code length: 10,000 characters
- Max execution time: 30 seconds
- Max memory: 512MB
- Max output size: 1MB

---

## Day 6-7: Testing & Optimization

### Test Cases

1. **Basic Execution:**
```python
print("Hello, World!")
```
Expected: "Hello, World!"

2. **With Libraries:**
```python
import json
data = {"test": "value"}
print(json.dumps(data))
```
Expected: {"test": "value"}

3. **Error Handling:**
```python
raise ValueError("Test error")
```
Expected: Traceback with error

4. **Timeout:**
```python
import time
time.sleep(35)
```
Expected: Timeout error

5. **Large Output:**
```python
for i in range(1000):
    print(f"Line {i}")
```
Expected: Output with 1000 lines

### Performance Metrics

Track:
- Average execution time
- Success rate
- Error rate
- Timeout rate
- Cost per execution

---

## Alternative: Serverless Function Approach

If Code Engine Jobs are too slow (cold start), use Cloud Functions:

**File:** `cloud-function/executor.py`

```python
def main(params):
    """IBM Cloud Function to execute code"""
    import sys
    import io
    import contextlib
    import traceback
    
    code = params.get('code', '')
    
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    
    try:
        with contextlib.redirect_stdout(stdout_capture), \
             contextlib.redirect_stderr(stderr_capture):
            exec(code, {"__builtins__": __builtins__})
        
        return {
            'status': 'success',
            'output': stdout_capture.getvalue()
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': traceback.format_exc(),
            'output': stdout_capture.getvalue()
        }
```

Deploy:
```bash
ibmcloud fn action create code-executor \
  executor.py \
  --kind python:3.11 \
  --memory 512 \
  --timeout 30000
```

---

## Cost Estimation

**IBM Cloud Code Engine Free Tier:**
- 100,000 vCPU-seconds/month
- At 0.5 vCPU per execution × 5 seconds average
- = 40,000 free executions/month

**Paid Tier (if exceeded):**
- $0.00003417 per vCPU-second
- 5 second execution = $0.0001708
- 1,000 executions = $0.17
- 10,000 executions = $1.70

**Very affordable!**

---

## Success Criteria

Week 1 is complete when:
- ✅ User clicks "Run Code"
- ✅ Code executes in Docker sandbox
- ✅ Output appears in console
- ✅ Errors are caught and displayed
- ✅ Timeout works (30s limit)
- ✅ Rate limiting prevents abuse
- ✅ Average execution < 3 seconds
- ✅ 99% uptime

---

## Next Week Preview

**Week 2: Video-Lab Sync**
- YouTube transcript API integration
- AI matching of sections to labs
- Timestamp-based lab suggestions
- Dynamic lab generation

**Ready to start building?** 🚀
