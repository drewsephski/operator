import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { videoBase64, mimeType = 'video/mp4', title = 'Meeting Recording', promptText } =
      await req.json();

    const systemInstruction =
      'You are Operator’s Video Operations Intelligence analyzer. You dissect meeting recordings, demos, and presentations to extract hard facts, decisions, commitments, and timestamped action items.';

    let contents: any;
    const analysisPrompt =
      promptText ||
      `Analyze this video recording titled "${title}". Extract key discussion topics, critical decisions reached, promises or commitments made, and assignable action items. Return strict JSON.`;

    if (videoBase64) {
      contents = {
        parts: [
          {
            inlineData: {
              data: videoBase64,
              mimeType,
            },
          },
          { text: analysisPrompt },
        ],
      };
    } else {
      // In case user provides a video description or Drive link
      contents = `Title: ${title}\n${analysisPrompt}\n(Note: Video media provided via Google Workspace Drive asset reference).`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            durationSummary: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            decisionsMade: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            commitmentsExtracted: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  person: { type: Type.STRING },
                  commitment: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                },
                required: ['person', 'commitment'],
              },
            },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  owner: { type: Type.STRING },
                  priority: { type: Type.STRING },
                },
                required: ['task', 'owner'],
              },
            },
            keyMoments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  speaker: { type: Type.STRING },
                },
                required: ['timestamp', 'topic'],
              },
            },
          },
          required: ['title', 'executiveSummary', 'decisionsMade', 'commitmentsExtracted', 'actionItems'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Operator Video Understand API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze video' },
      { status: 500 }
    );
  }
}
