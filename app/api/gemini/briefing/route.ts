import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { Type } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { emails, meetings, tasks, files, commitments } = await req.json();

    const prompt = `Analyze this executive Google Workspace state and produce a structured operational intelligence briefing for TODAY.
Data:
Emails (${emails?.length || 0}): ${JSON.stringify(emails?.slice(0, 6) || [])}
Meetings (${meetings?.length || 0}): ${JSON.stringify(meetings?.slice(0, 5) || [])}
Tasks (${tasks?.length || 0}): ${JSON.stringify(tasks?.slice(0, 6) || [])}
Drive Files (${files?.length || 0}): ${JSON.stringify(files?.slice(0, 5) || [])}
Commitments (${commitments?.length || 0}): ${JSON.stringify(commitments?.slice(0, 6) || [])}

Answer the 5 core operational questions with sharp, high-density editorial clarity:
1. attentionHeadline: One punchy sentence summarizing the single most critical thing needing attention.
2. attentionItems: 2-3 specific items needing action (with source, person, and urgency).
3. todayScheduleSummary: Executive summary of today's meeting flow, prep needs, and gaps.
4. waitingOnSummary: 2-3 things the user is blocked on or waiting on from others.
5. whatChangedSummary: 2-3 key changes in documents, emails, or schedules over the last 24h.
6. recommendedNextActions: 3 prioritized next steps with specific actionable titles and draft proposal text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are Operator, a Chief of Staff intelligence engine. You produce dense, factual, high-clarity operational syntheses. Return valid JSON only.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            attentionHeadline: { type: Type.STRING },
            attentionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  person: { type: Type.STRING },
                  urgency: { type: Type.STRING },
                  actionPrompt: { type: Type.STRING },
                },
                required: ['title', 'description', 'person', 'urgency'],
              },
            },
            todayScheduleSummary: { type: Type.STRING },
            waitingOnSummary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  counterpart: { type: Type.STRING },
                  since: { type: Type.STRING },
                },
                required: ['item', 'counterpart'],
              },
            },
            whatChangedSummary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  source: { type: Type.STRING },
                },
                required: ['title', 'detail'],
              },
            },
            recommendedNextActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  context: { type: Type.STRING },
                  actionType: { type: Type.STRING },
                  draftPayload: { type: Type.STRING },
                },
                required: ['title', 'context', 'actionType'],
              },
            },
          },
          required: [
            'attentionHeadline',
            'attentionItems',
            'todayScheduleSummary',
            'waitingOnSummary',
            'whatChangedSummary',
            'recommendedNextActions',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Operator Briefing API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate briefing' },
      { status: 500 }
    );
  }
}
