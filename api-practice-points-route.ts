import { NextResponse } from 'next/server';

/**
 * Get Practice Points for Video
 * 
 * This is the main endpoint the Chrome extension will call.
 * It combines transcript extraction and AI analysis into one call.
 * 
 * GET /api/practice-points/[videoId]
 * 
 * Returns: { 
 *   videoId,
 *   title,
 *   practicePoints: [{timestamp, topic, description, suggestedLab}],
 *   cached: boolean
 * }
 */

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

interface PracticePointsResponse {
  videoId: string;
  title: string;
  duration: number;
  practicePoints: PracticePoint[];
  cached: boolean;
}

// In-memory cache (in production, use Redis or database)
const cache = new Map<string, PracticePointsResponse>();

export async function GET(
  request: Request,
  { params }: { params: { videoId: string } }
) {
  try {
    const { videoId } = params;

    // Check cache first
    if (cache.has(videoId)) {
      const cachedData = cache.get(videoId)!;
      return NextResponse.json({ ...cachedData, cached: true });
    }

    // Step 1: Extract transcript
    const transcriptResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/extract-transcript`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      }
    );

    if (!transcriptResponse.ok) {
      throw new Error('Failed to extract transcript');
    }

    const transcriptData = await transcriptResponse.json();

    // Step 2: Analyze with AI
    const analysisResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/analyze-video`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          transcript: transcriptData.transcript,
          title: transcriptData.title
        })
      }
    );

    if (!analysisResponse.ok) {
      throw new Error('Failed to analyze video');
    }

    const analysisData = await analysisResponse.json();

    // Combine results
    const response: PracticePointsResponse = {
      videoId,
      title: transcriptData.title,
      duration: transcriptData.duration,
      practicePoints: analysisData.practicePoints,
      cached: false
    };

    // Cache the result
    cache.set(videoId, response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Practice points error:', error);
    
    // Return empty practice points on error (graceful degradation)
    return NextResponse.json(
      { 
        videoId: params.videoId,
        title: 'Unknown',
        duration: 0,
        practicePoints: [],
        cached: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 200 } // Still return 200 so extension doesn't break
    );
  }
}
