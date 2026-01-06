import { NextRequest, NextResponse } from 'next/server';

const CODE_EXECUTOR_URL = 'https://code-executor.24rtt3srkwax.us-south.codeengine.appdomain.cloud';

interface ExecutionRequest {
  code: string;
  language?: string;
  timeout?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { code, language = 'python', timeout = 30 } = await request.json() as ExecutionRequest;
    
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
    
    // Call the code executor microservice
    const response = await fetch(`${CODE_EXECUTOR_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, timeout }),
    });
    
    if (!response.ok) {
      throw new Error(`Executor responded with ${response.status}`);
    }
    
    const result = await response.json();
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error.message || 'Code execution failed',
        output: '',
        executionTime: 0
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Check if executor is healthy
    const response = await fetch(`${CODE_EXECUTOR_URL}/health`);
    const health = await response.json();
    
    return NextResponse.json({
      status: 'ok',
      executor: CODE_EXECUTOR_URL,
      executorHealth: health
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      executor: CODE_EXECUTOR_URL,
      error: 'Cannot reach executor'
    });
  }
}
