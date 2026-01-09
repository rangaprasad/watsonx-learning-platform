import { NextResponse } from 'next/server';
import { STATIC_PRACTICE_POINTS, getStaticPracticePoints } from '@/lib/static-practice-points';

/**
 * Get Practice Points for Video
 * 
 * This endpoint tries to extract and analyze transcripts,
 * but falls back to static practice points if that fails.
 * 
 * GET /api/practice-points/[videoId]
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
  source?: 'static' | 'ai' | 'cached';
}

// In-memory cache
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

    // Try static practice points first (instant, reliable)
    const staticPoints = getStaticPracticePoints(videoId);
    if (staticPoints) {
      const response = { ...staticPoints, cached: false, source: 'static' as const };
      cache.set(videoId, response);
      return NextResponse.json(response);
    }

    // Try transcript extraction + AI analysis
    try {
      const transcriptResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/extract-transcript`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId })
        }
      );

      if (transcriptResponse.ok) {
        const transcriptData = await transcriptResponse.json();

        // Only proceed if we got a transcript
        if (transcriptData.transcript && transcriptData.transcript.length > 0) {
          const analysisResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/analyze-video`,
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

          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();

            const response: PracticePointsResponse = {
              videoId,
              title: transcriptData.title,
              duration: transcriptData.duration,
              practicePoints: analysisData.practicePoints,
              cached: false,
              source: 'ai'
            };

            cache.set(videoId, response);
            return NextResponse.json(response);
          }
        }
      }
    } catch (error) {
      console.error('AI analysis failed:', error);
    }

    // Fallback: Return generic practice point
    const fallbackResponse: PracticePointsResponse = {
      videoId,
      title: 'Tutorial Video',
      duration: 600,
      practicePoints: [
        {
          timestamp: 180,
          endTimestamp: 300,
          topic: 'Getting Started',
          description: 'Practice what you learned in this tutorial.',
          suggestedLab: {
            title: 'Your First AI API Call',
            starterCode: `import os\n\n# TODO: Write your code here\n\nprint("Ready to practice!")`,
            difficulty: 'beginner',
            estimatedTime: 15
          }
        }
      ],
      cached: false,
      source: 'static'
    };

    return NextResponse.json(fallbackResponse);

  } catch (error) {
    console.error('Practice points error:', error);
    
    // Even on error, return valid structure
    return NextResponse.json(
      { 
        videoId: params.videoId,
        title: 'Unknown',
        duration: 0,
        practicePoints: [],
        cached: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 200 }
    );
  }
}
