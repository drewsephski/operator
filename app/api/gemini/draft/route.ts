import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { actionType, context, recipient, intention, tone = 'concise, direct, professional' } =
      await req.json();

    const prompt = `Draft an executive response or action proposal.
Action Type: ${actionType || 'email_reply'}
Recipient: ${recipient || 'Collaborator'}
Intent / Guidance: ${intention || 'Acknowledge and confirm schedule'}
Tone: ${tone}
Context:
${JSON.stringify(context || {})}

Draft the exact email body or task text. Do not add conversational wrapper or placeholder brackets. Output only the finished text ready for user review and approval.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction:
          'You are Operator’s low-latency drafting assistant. You write punchy, polite, executive communication in the style of Superhuman and Linear. No greetings like "I hope this email finds you well".',
      },
    });

    return NextResponse.json({
      draft: response.text?.trim() || '',
      model: 'gemini-3.1-flash-lite',
    });
  } catch (error: any) {
    console.error('Operator Draft API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to draft action' },
      { status: 500 }
    );
  }
}
