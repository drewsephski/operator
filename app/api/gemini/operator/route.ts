import { NextRequest, NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';
import { Type } from '@google/genai';
import {
  fetchLiveGmail,
  fetchLiveCalendar,
  fetchLiveDrive,
  fetchLiveTasks,
  searchLiveContacts,
} from '@/lib/workspace';

// Workspace tool definitions for Gemini
const WORKSPACE_TOOLS: any[] = [
  {
    functionDeclarations: [
      {
        name: 'search_calendar_events',
        description: 'Search upcoming or past Google Calendar events for the user. Useful for finding meetings, schedules, attendees, and availability.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: 'Optional search text to filter events by title, description, or attendee name',
            },
            timeMin: {
              type: Type.STRING,
              description: 'ISO 8601 string for start of window (e.g. 2026-10-04T00:00:00Z)',
            },
            timeMax: {
              type: Type.STRING,
              description: 'ISO 8601 string for end of window',
            },
            maxResults: {
              type: Type.NUMBER,
              description: 'Number of events to retrieve (default 10)',
            },
          },
        },
      },
      {
        name: 'search_gmail_messages',
        description: 'Search emails in user Gmail inbox or threads. Supports standard Gmail search queries (e.g. "from:drew", "subject:meeting", "is:unread", "newer_than:7d").',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: 'Gmail query string, e.g. "Drew meeting", "is:unread", "label:INBOX"',
            },
            maxResults: {
              type: Type.NUMBER,
              description: 'Number of messages to retrieve (default 5)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'search_contacts',
        description: 'Search Google Contacts to resolve natural-language references (e.g. "Drew", "Sarah", "Alex") into real names, email addresses, and roles.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: 'Person name or email query to search in Google Contacts',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'search_drive_files',
        description: 'Search files across user Google Drive (Docs, Sheets, Slides, PDFs, etc.).',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description: 'Text query to match file titles or content',
            },
            maxResults: {
              type: Type.NUMBER,
              description: 'Number of files to retrieve (default 5)',
            },
          },
        },
      },
      {
        name: 'list_tasks',
        description: 'List to-do items from Google Tasks.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            showCompleted: {
              type: Type.BOOLEAN,
              description: 'Whether to include completed tasks',
            },
          },
        },
      },
      {
        name: 'propose_action',
        description: 'Propose an action (sending email, modifying/creating calendar event, creating/completing task) that requires explicit user confirmation before execution. You MUST call this whenever the user intends an external mutation.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            actionType: {
              type: Type.STRING,
              enum: ['send_email', 'create_calendar_event', 'update_calendar_event', 'create_task', 'complete_task'],
              description: 'The type of action to execute',
            },
            title: {
              type: Type.STRING,
              description: 'Short headline for the proposal, e.g. "Ready to send" or "Reschedule Meeting"',
            },
            summary: {
              type: Type.STRING,
              description: '1-sentence explanation of what will be done, e.g. "Found your upcoming Product Architecture Review with Drew at 2:00 PM."',
            },
            recipient: {
              type: Type.STRING,
              description: 'Recipient email address for send_email',
            },
            subject: {
              type: Type.STRING,
              description: 'Subject line for send_email',
            },
            body: {
              type: Type.STRING,
              description: 'Full drafted email body text for send_email',
            },
            eventTitle: {
              type: Type.STRING,
              description: 'Calendar event summary / title',
            },
            startTime: {
              type: Type.STRING,
              description: 'Start time (e.g. "3:00 PM")',
            },
            endTime: {
              type: Type.STRING,
              description: 'End time (e.g. "4:00 PM")',
            },
            date: {
              type: Type.STRING,
              description: 'Date string (e.g. "2026-10-05")',
            },
            eventId: {
              type: Type.STRING,
              description: 'Calendar event ID if modifying/rescheduling an existing event',
            },
            taskTitle: {
              type: Type.STRING,
              description: 'Title of the task to create',
            },
            dueDate: {
              type: Type.STRING,
              description: 'Due date for task',
            },
            taskId: {
              type: Type.STRING,
              description: 'Task ID if completing an existing task',
            },
          },
          required: ['actionType', 'summary'],
        },
      },
    ],
  },
];

export async function POST(req: NextRequest) {
  try {
    const {
      prompt,
      history = [],
      pendingApproval,
      accessToken,
      userEmail,
      currentLocalTime,
    } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const localTimeStr = currentLocalTime || new Date().toISOString();

    const systemInstruction = `You are Operator, a simple, genuinely functional AI operator for the user's real Google account.
The user specifies INTENT, not API operations. You determine the chain of tools yourself across Gmail, Calendar, Contacts, Drive, and Tasks.

Key Rules:
1. Grounding & Real Data:
   - Reason ONLY over real data returned by Google Workspace tools.
   - NEVER invent or fabricate people, meetings, email addresses, tasks, or documents.
   - If no information exists or user has no matching events, plainly state that.
   - If the user is not authenticated with Google (accessToken missing or tools return unauthenticated), explain concisely that they need to connect their Google account.

2. Proactive Cross-Service Resolution:
   - Example "Email Drew about the upcoming meeting":
     Step 1: Search calendar events to find the upcoming meeting with Drew.
     Step 2: Inspect attendees or search contacts to resolve Drew's real email address.
     Step 3: If useful, search Gmail or Drive for relevant context.
     Step 4: Draft an appropriate, high-quality, professional message.
     Step 5: Call propose_action with actionType "send_email", recipient, subject, and drafted body.
   - If confidence is high, resolve directly. If there is genuine ambiguity (e.g., two distinct meetings with different Drews), ask concisely which one they mean.

3. Tone & Aesthetic:
   - Radical simplicity. Black/near-black and white precision, like Vercel and Linear.
   - Restrained, concise, direct. Avoid filler, generic chatbot pleasantries, or patronizing greetings.
   - Do not output raw JSON or internal function call descriptions in your user-facing text.

4. Action Approvals:
   - Any external mutation (sending an email, changing a calendar event, creating a task) MUST be proposed via the 'propose_action' tool.
   - If the user provides a conversational refinement on a pending action (e.g. "make that less formal", "send it tomorrow morning instead", "include the document link"), update the proposal with the refined text/parameters using propose_action!

Current Context:
- User Email: ${userEmail || 'Unknown'}
- Current Time: ${localTimeStr}
${pendingApproval ? `- CURRENT PENDING APPROVAL BEING REFINED:\n${JSON.stringify(pendingApproval, null, 2)}` : ''}
`;

    // Tool execution trackers for returning contextual cards to the frontend
    let collectedCalendarEvents: any[] = [];
    let collectedEmails: any[] = [];
    let collectedDriveFiles: any[] = [];
    let collectedTasks: any[] = [];
    let proposedApproval: any = null;

    // Helper to run tools against real Google APIs
    async function executeWorkspaceTool(name: string, args: any) {
      if (!accessToken) {
        return {
          error: 'User Google Account is not connected or session expired. Prompt the user to sign in with Google.',
        };
      }

      try {
        if (name === 'search_calendar_events') {
          const events = await fetchLiveCalendar(
            accessToken,
            args.timeMin,
            args.timeMax,
            args.maxResults || 10
          );
          let filtered = events;
          if (args.query) {
            const q = args.query.toLowerCase();
            filtered = events.filter(
              (e) =>
                e.title.toLowerCase().includes(q) ||
                (e.description && e.description.toLowerCase().includes(q)) ||
                e.attendees.some((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
            );
            if (filtered.length === 0) filtered = events;
          }
          collectedCalendarEvents = [...collectedCalendarEvents, ...filtered];
          return { events: filtered };
        }

        if (name === 'search_gmail_messages') {
          const emails = await fetchLiveGmail(accessToken, args.query, args.maxResults || 5);
          collectedEmails = [...collectedEmails, ...emails];
          return {
            messages: emails.map((e) => ({
              id: e.id,
              threadId: e.threadId,
              sender: `${e.senderName} <${e.senderEmail}>`,
              subject: e.subject,
              date: e.date,
              snippet: e.snippet,
              fullBody: e.fullBody?.slice(0, 1500),
            })),
          };
        }

        if (name === 'search_contacts') {
          const contacts = await searchLiveContacts(accessToken, args.query);
          return { contacts };
        }

        if (name === 'search_drive_files') {
          const files = await fetchLiveDrive(accessToken, args.query, args.maxResults || 5);
          collectedDriveFiles = [...collectedDriveFiles, ...files];
          return { files };
        }

        if (name === 'list_tasks') {
          const tasks = await fetchLiveTasks(accessToken, args.showCompleted);
          collectedTasks = [...collectedTasks, ...tasks];
          return { tasks };
        }

        if (name === 'propose_action') {
          proposedApproval = {
            id: `appr-${Date.now()}`,
            actionType: args.actionType,
            title: args.title || 'Ready to send',
            summary: args.summary,
            payload: {
              recipient: args.recipient,
              subject: args.subject,
              body: args.body,
              title: args.eventTitle || args.taskTitle,
              startTime: args.startTime,
              endTime: args.endTime,
              date: args.date,
              eventId: args.eventId,
              taskTitle: args.taskTitle,
              dueDate: args.dueDate,
              taskId: args.taskId,
            },
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          return { status: 'action_proposed_to_user', proposedApproval };
        }

        return { error: `Tool ${name} not recognized` };
      } catch (err: any) {
        console.error(`Error executing tool ${name}:`, err);
        return { error: err.message || 'Tool execution failed' };
      }
    }

    // Build contents from history
    const contents: any[] = [];
    for (const msg of history.slice(-6)) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    let finalText = '';

    // Helper for resilient calls with cheaper models first and fallback on 503/429
    async function callGeminiResilient(callContents: any[], callConfig: any) {
      const modelCandidates = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
      let lastErr: any = null;

      for (const m of modelCandidates) {
        try {
          return await ai.models.generateContent({
            model: m,
            contents: callContents,
            config: callConfig,
          });
        } catch (err: any) {
          console.warn(`Model ${m} error:`, err?.message || err);
          lastErr = err;
          // Try next cheaper/alternative model
          continue;
        }
      }
      throw lastErr;
    }

    // Reasoning loop (up to 5 tool steps)
    for (let step = 0; step < 5; step++) {
      const response = await callGeminiResilient(contents, {
        systemInstruction,
        tools: WORKSPACE_TOOLS,
        temperature: 0.1,
      });

      const functionCalls = response.functionCalls;
      if (!functionCalls || functionCalls.length === 0) {
        finalText = response.text || '';
        break;
      }

      // Append model call turn to history
      const candidateContent = response.candidates?.[0]?.content;
      if (candidateContent) {
        contents.push(candidateContent);
      }

      // Execute tools
      const toolResponseParts: any[] = [];
      for (const call of functionCalls) {
        if (!call.name) continue;
        const result = await executeWorkspaceTool(call.name, call.args);
        toolResponseParts.push({
          functionResponse: {
            name: call.name,
            response: { result },
          },
        });
      }

      // Append tool response
      contents.push({
        role: 'user',
        parts: toolResponseParts,
      });
    }

    // Deduplicate collected items
    const uniqueCalendarEvents = Array.from(
      new Map(collectedCalendarEvents.map((e) => [e.id, e])).values()
    );
    const uniqueEmails = Array.from(
      new Map(collectedEmails.map((e) => [e.id, e])).values()
    );
    const uniqueDriveFiles = Array.from(
      new Map(collectedDriveFiles.map((f) => [f.id, f])).values()
    );
    const uniqueTasks = Array.from(
      new Map(collectedTasks.map((t) => [t.id, t])).values()
    );

    // If prompt is asking for meeting preparation and we found a meeting, build briefing
    let briefingResult = undefined;
    const lowerPrompt = prompt.toLowerCase();
    if (
      (lowerPrompt.includes('prepare me for my next meeting') ||
        lowerPrompt.includes('next meeting prep') ||
        lowerPrompt.includes('prep for meeting')) &&
      uniqueCalendarEvents.length > 0
    ) {
      const nextMeeting = uniqueCalendarEvents[0];
      briefingResult = {
        meetingTitle: nextMeeting.title,
        meetingTime: `${nextMeeting.startDate ? nextMeeting.startDate + ' · ' : ''}${nextMeeting.startTime} - ${nextMeeting.endTime}`,
        objective: nextMeeting.description || 'Align on deliverables, discussion topics, and open decisions.',
        keyParticipants: nextMeeting.attendees.map((a: any) => `${a.name} (${a.email})`),
        unresolvedQuestions: ['Confirm agenda priorities', 'Review outstanding blockers'],
        talkingPoints: [
          `Review goals for ${nextMeeting.title}`,
          'Confirm next steps and action owners',
        ],
        relatedFiles: uniqueDriveFiles.slice(0, 2).map((f) => ({
          name: f.name,
          type: f.fileType,
          url: f.webViewLink,
        })),
      };
    }

    return NextResponse.json({
      text: finalText,
      approval: proposedApproval,
      calendarResults: uniqueCalendarEvents.length > 0 ? uniqueCalendarEvents : undefined,
      emailResults: uniqueEmails.length > 0 ? uniqueEmails : undefined,
      fileResults: uniqueDriveFiles.length > 0 ? uniqueDriveFiles : undefined,
      taskResults: uniqueTasks.length > 0 ? uniqueTasks : undefined,
      briefingResult,
    });
  } catch (error: any) {
    console.error('Operator Agent route error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process operator request' },
      { status: 500 }
    );
  }
}
