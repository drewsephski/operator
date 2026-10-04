import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { ThinkingLevel } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      messages = [],
      modelType = 'general',
      useSearchGrounding = false,
      useMapsGrounding = false,
      userLocation,
      workspaceContext,
    } = await req.json();

    if (!prompt && (!messages || messages.length === 0)) {
      return NextResponse.json({ error: 'Prompt or messages required' }, { status: 400 });
    }

    let modelName = 'gemini-3.5-flash';
    const config: any = {
      systemInstruction: `You are Operator, a world-class AI Chief of Staff and operations intelligence layer for an executive's Google Workspace (Gmail, Calendar, Drive, Docs, Sheets, Tasks, Contacts, Meet).
Your tone is concise, dense, razor-sharp, editorial, and actionable—resembling Vercel, Linear, and Superhuman.
You do not speak like a generic chatbot. You give direct, executive answers, cite exact email subjects, meeting times, document names, or people involved.
Every conclusion should be traceable to Workspace data.
When asked what needs attention, summarize priorities immediately with clear proposed next actions.
Never use fluff, filler, or patronizing greetings. Jump straight into the intelligence.
${workspaceContext ? `\nCURRENT WORKSPACE SNAPSHOT:\n${workspaceContext}` : ''}`,
    };

    if (modelType === 'high_thinking') {
      modelName = 'gemini-3.1-pro-preview';
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
      // Do not set maxOutputTokens when using thinkingLevel
    } else if (modelType === 'low_latency') {
      modelName = 'gemini-3.1-flash-lite';
    } else {
      modelName = 'gemini-3.5-flash';
    }

    // Grounding tools: googleMaps cannot be combined with googleSearch
    if (useMapsGrounding) {
      modelName = 'gemini-3.5-flash';
      config.tools = [{ googleMaps: {} }];
      if (userLocation?.latitude && userLocation?.longitude) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: Number(userLocation.latitude),
              longitude: Number(userLocation.longitude),
            },
          },
        };
      }
    } else if (useSearchGrounding) {
      modelName = 'gemini-3.5-flash';
      config.tools = [{ googleSearch: {} }];
    }

    // Build contents from messages or prompt
    let contents: any;
    if (messages && messages.length > 0) {
      contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      if (prompt) {
        contents.push({ role: 'user', parts: [{ text: prompt }] });
      }
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    const responseText = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return NextResponse.json({
      text: responseText,
      groundingChunks,
      model: modelName,
    });
  } catch (error: any) {
    console.error('Operator Ask API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process intelligence query' },
      { status: 500 }
    );
  }
}
