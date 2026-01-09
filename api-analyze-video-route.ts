import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

/**
 * AI Practice Point Detection API
 * 
 * Analyzes a video transcript and identifies moments where students should practice.
 * Uses Claude to understand context and suggest labs.
 * 
 * POST /api/analyze-video
 * Body: { 
 *   videoId: string,
 *   transcript: [{text, start, duration}],
 *   title: string
 * }
 * 
 * Returns: { 
 *   practicePoints: [{timestamp, topic, description, suggestedLab}]
 * }
 */

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface PracticePoint {
  timestamp: number;
  endTimestamp: number;
  topic: string;
  description: string;
  suggestedLab: {
    title: string;
    starterCode: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
  };
}

interface AnalysisResponse {
  videoId: string;
  practicePoints: PracticePoint[];
}

export async function POST(request: Request) {
  try {
    const { videoId, transcript, title } = await request.json();

    if (!videoId || !transcript || !Array.isArray(transcript)) {
      return NextResponse.json(
        { error: 'videoId and transcript are required' },
        { status: 400 }
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Convert transcript to readable format for Claude
    const transcriptText = formatTranscriptForAnalysis(transcript);

    // Create the analysis prompt
    const prompt = createAnalysisPrompt(title, transcriptText);

    // Call Claude for analysis
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Parse Claude's response
    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : '';

    const practicePoints = parseClaudeResponse(responseText);

    const response: AnalysisResponse = {
      videoId,
      practicePoints
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Video analysis error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Format transcript for Claude analysis
 */
function formatTranscriptForAnalysis(transcript: TranscriptSegment[]): string {
  return transcript.map(segment => {
    const timestamp = formatTimestamp(segment.start);
    return `[${timestamp}] ${segment.text}`;
  }).join('\n');
}

/**
 * Format seconds to MM:SS
 */
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Create the analysis prompt for Claude
 */
function createAnalysisPrompt(videoTitle: string, transcript: string): string {
  return `You are analyzing a coding tutorial video to identify moments where students should practice what they're learning.

VIDEO TITLE: ${videoTitle}

TRANSCRIPT (with timestamps):
${transcript}

TASK: Identify all moments where the instructor demonstrates code or explains a concept that students should practice hands-on.

For each practice moment, provide:
1. Start timestamp (in seconds)
2. End timestamp (in seconds)
3. Topic being taught (concise, specific)
4. Description (1-2 sentences explaining what the instructor shows)
5. Suggested lab exercise:
   - Title (engaging, specific)
   - Starter code (Python code with TODO comments)
   - Difficulty level (beginner/intermediate/advanced)
   - Estimated time in minutes

GUIDELINES:
- Only identify moments where CODE is being demonstrated
- Focus on practical, hands-on opportunities
- Starter code should have clear TODO comments
- Be specific about what to practice
- Typical tutorial has 3-5 practice points

Return ONLY valid JSON in this format:
{
  "practicePoints": [
    {
      "timestamp": 323,
      "endTimestamp": 445,
      "topic": "Making your first Bedrock API call",
      "description": "Instructor demonstrates how to initialize boto3 client and call invoke_model with a simple prompt.",
      "suggestedLab": {
        "title": "Your First Bedrock API Call",
        "starterCode": "import boto3\\n\\n# TODO: Initialize bedrock client\\n\\n# TODO: Create request body\\n\\n# TODO: Call invoke_model",
        "difficulty": "beginner",
        "estimatedTime": 15
      }
    }
  ]
}`;
}

/**
 * Parse Claude's JSON response
 */
function parseClaudeResponse(response: string): PracticePoint[] {
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                      response.match(/```\n([\s\S]*?)\n```/);
    
    const jsonStr = jsonMatch ? jsonMatch[1] : response;
    
    const parsed = JSON.parse(jsonStr);
    
    return parsed.practicePoints || [];
  } catch (error) {
    console.error('Failed to parse Claude response:', error);
    return [];
  }
}
