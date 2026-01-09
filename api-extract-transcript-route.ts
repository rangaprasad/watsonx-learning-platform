import { NextResponse } from 'next/server';

/**
 * Extract YouTube Transcript API
 * 
 * This endpoint extracts transcripts from YouTube videos using the 
 * youtube-transcript package.
 * 
 * POST /api/extract-transcript
 * Body: { videoId: string }
 * 
 * Returns: { videoId, title, duration, transcript: [{text, start, duration}] }
 */

// We'll use the youtube-transcript package
// Install: npm install youtube-transcript

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptResponse {
  videoId: string;
  title: string;
  duration: number;
  transcript: TranscriptSegment[];
  language: string;
}

export async function POST(request: Request) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId is required' },
        { status: 400 }
      );
    }

    // Import the youtube-transcript package dynamically
    const { YoutubeTranscript } = await import('youtube-transcript');

    // Fetch transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // Get video metadata (we'll use a simple fetch to YouTube)
    const videoInfo = await getVideoMetadata(videoId);

    const response: TranscriptResponse = {
      videoId,
      title: videoInfo.title,
      duration: videoInfo.duration,
      transcript: transcript.map((segment: any) => ({
        text: segment.text,
        start: segment.offset / 1000, // Convert to seconds
        duration: segment.duration / 1000
      })),
      language: 'en'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Transcript extraction error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to extract transcript',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get video metadata from YouTube
 * Uses oEmbed API (no API key required!)
 */
async function getVideoMetadata(videoId: string) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oembedUrl);
    const data = await response.json();

    return {
      title: data.title,
      author: data.author_name,
      duration: 0 // oEmbed doesn't provide duration, we'll estimate from transcript
    };
  } catch (error) {
    return {
      title: 'Unknown',
      author: 'Unknown',
      duration: 0
    };
  }
}
