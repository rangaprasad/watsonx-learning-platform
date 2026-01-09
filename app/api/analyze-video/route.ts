import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

// Helper to get IBM IAM Token
async function getIamToken(apiKey: string) {
  const response = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${apiKey}`,
  });
  const data = await response.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();

    // 1. Fetch Transcript from YouTube
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    const textSnippet = transcriptArray.map(t => t.text).join(' ').substring(0, 4500);

    // 2. Auth with IBM watsonx.ai
    const iamToken = await getIamToken(process.env.WATSONX_APIKEY!);

    // 3. Request Lab Generation from IBM Granite
    const payload = {
      input: `[INST] <<SYS>>
You are a Computer Science Tutor. Analyze the transcript and identify 3 practice points. 
Return ONLY valid JSON in this format:
{ "practicePoints": [{ "timestamp": 300, "topic": "Variables", "description": "Short summary", "suggestedLab": { "title": "Lab 1", "starterCode": "x = 5\\nprint(x)" } }] }
<</SYS>>
Transcript: ${textSnippet} [/INST]`,
      parameters: { decoding_method: "greedy", max_new_tokens: 1000 },
      project_id: process.env.WATSONX_PROJECT_ID
    };

    const aiResponse = await fetch(`${process.env.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${iamToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await aiResponse.json();
    const generatedText = result.results[0].generated_text;
    
    // Parse JSON from AI response
    const cleanJson = JSON.parse(generatedText.substring(generatedText.indexOf('{'), generatedText.lastIndexOf('}') + 1));
    return NextResponse.json(cleanJson);

  } catch (error) {
    console.error("🧠 Brain Error:", error);
    return NextResponse.json({ error: "watsonx analysis failed" }, { status: 500 });
  }
}
