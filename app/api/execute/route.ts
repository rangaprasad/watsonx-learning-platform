import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    
    // YOUR UNIQUE LIVE IBM URL
    const IBM_EXECUTOR_URL = "https://executor-app.24rtt3srkwax.us-south.codeengine.appdomain.cloud/execute";

    console.log("🚀 Bridge: Forwarding code to IBM Cloud...");

    const response = await fetch(IBM_EXECUTOR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, timeout: 30 })
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Bridge Error:", error);
    return NextResponse.json({ status: 'error', error: 'Could not reach IBM' }, { status: 500 });
  }
}
