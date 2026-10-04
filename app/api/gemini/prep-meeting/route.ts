import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { meeting, relatedEmails = [], relatedDocs = [] } = await req.json();

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting details required' }, { status: 400 });
    }

    const prompt = `Prepare an executive briefing for this upcoming Google Calendar meeting:
Title: ${meeting.title}
Time: ${meeting.startTime} - ${meeting.endTime} (${meeting.startDate || 'Today'})
Attendees: ${JSON.stringify(meeting.attendees || [])}
Description: ${meeting.description || 'None provided'}
Related Emails: ${JSON.stringify(relatedEmails)}
Related Docs: ${JSON.stringify(relatedDocs)}

Synthesize a comprehensive operational briefing for the executive. Return strict JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are Operator. Provide a concise, high-impact meeting preparation briefing. Do not use filler words.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objective: { type: Type.STRING },
            keyParticipants: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            unresolvedQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            talkingPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedDecisions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            summaryText: { type: Type.STRING },
          },
          required: [
            'objective',
            'keyParticipants',
            'unresolvedQuestions',
            'talkingPoints',
            'summaryText',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Operator Meeting Prep error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to prepare meeting' },
      { status: 500 }
    );
  }
}
