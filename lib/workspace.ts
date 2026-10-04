import {
  EmailItem,
  CalendarEventItem,
  TaskItem,
  DriveFileItem,
  ContactItem,
  CommitmentItem,
  ProjectItem,
  ActivityLogItem,
} from './types';

// High-fidelity executive seed data modeled around the user brief
export const INITIAL_EMAILS: EmailItem[] = [
  {
    id: 'em-1',
    threadId: 'th-1',
    senderName: 'Sarah Chen',
    senderEmail: 'sarah.chen@acme.corp',
    subject: 'Launch timeline adjustment to Friday',
    snippet: 'Hey Drew, we finished the staging benchmarks early. Can we move the public launch to this Friday instead of next Tuesday?',
    fullBody: 'Hey Drew,\n\nWe finished the staging benchmarks early and the latency numbers look rock solid. Marketing is aligned if we want to capture the weekend traffic. Can we move the public launch to this Friday instead of next Tuesday?\n\nLet me know so we can freeze the release branch.\n\nBest,\nSarah',
    date: '2026-10-04T07:15:00Z',
    timeAgo: '2h ago',
    unread: true,
    important: true,
    priority: 'urgent',
    category: 'needs_response',
    aiSummary: 'Sarah completed staging early and asked if launch can be moved to Friday. Release branch freeze is blocked on your confirmation.',
    suggestedAction: 'reply',
    draftReply: {
      to: 'sarah.chen@acme.corp',
      subject: 'Re: Launch timeline adjustment to Friday',
      body: 'Friday works on my side. The updated build is ready and infrastructure is provisioned. Go ahead and freeze the release branch.',
    },
  },
  {
    id: 'em-2',
    threadId: 'th-2',
    senderName: 'David Miller',
    senderEmail: 'david.m@apexventures.vc',
    subject: 'Follow up: Q4 Financial Model review',
    snippet: 'Looking forward to our call today. Did you get a chance to revise the headcount projection on tab 3?',
    fullBody: 'Hi Drew,\n\nLooking forward to our call today at 4:00 PM. Did you get a chance to review the revised headcount plan on tab 3 of the model?\n\nAlso, let me know if Alex is joining as well.\n\nThanks,\nDavid',
    date: '2026-10-04T08:30:00Z',
    timeAgo: '1h ago',
    unread: true,
    important: true,
    priority: 'high',
    category: 'action_required',
    aiSummary: 'David wants verification of tab 3 headcount numbers ahead of your 4:00 PM investor call.',
    suggestedAction: 'review_document',
    draftReply: {
      to: 'david.m@apexventures.vc',
      subject: 'Re: Follow up: Q4 Financial Model review',
      body: 'Yes, I updated tab 3 with the revised engineering and sales ramp. Alex will be on the call with us at 4:00 PM.',
    },
  },
  {
    id: 'em-3',
    threadId: 'th-3',
    senderName: 'Elena Rostova',
    senderEmail: 'elena@designsystem.studio',
    subject: 'Design tokens & component library signoff',
    snippet: 'All feedback from yesterday’s design review has been incorporated into the Figma spec and Drive doc.',
    fullBody: 'Drew,\n\nAll feedback from yesterday’s review has been implemented. The token definitions match our dark mode palette. Waiting on your final sign-off before engineering merges the PR.\n\nElena',
    date: '2026-10-03T18:40:00Z',
    timeAgo: '15h ago',
    unread: false,
    important: false,
    priority: 'normal',
    category: 'waiting_on',
    aiSummary: 'Elena updated token specs per review comments; awaiting your final approval to merge code.',
    suggestedAction: 'create_task',
  },
  {
    id: 'em-4',
    threadId: 'th-4',
    senderName: 'Cloud Infrastructure Alerts',
    senderEmail: 'notifications@googlecloud.com',
    subject: '[OK] Us-east1 latency normalized after scale event',
    snippet: 'Auto-scaling policy triggered +4 instances at 06:12 AM UTC. P99 latency recovered to 14ms.',
    fullBody: 'Automated notification: Us-east1 service pool scaled up gracefully. No action needed.',
    date: '2026-10-04T06:15:00Z',
    timeAgo: '3h ago',
    unread: false,
    important: false,
    priority: 'low',
    category: 'fyi',
    aiSummary: 'Routine infrastructure scale event recovered cleanly; informational only.',
    suggestedAction: 'archive',
  },
];

export const INITIAL_MEETINGS: CalendarEventItem[] = [
  {
    id: 'cal-1',
    title: 'LaunchStack Release & Operational Sync',
    startTime: '10:30 AM',
    endTime: '11:15 AM',
    startDate: '2026-10-04',
    durationMinutes: 45,
    meetLink: 'https://meet.google.com/ais-prod-sync',
    organizer: 'Drew Sepeczi (You)',
    attendees: [
      { name: 'Sarah Chen', email: 'sarah.chen@acme.corp', responseStatus: 'accepted' },
      { name: 'Marcus Brody', email: 'marcus@acme.corp', responseStatus: 'accepted' },
      { name: 'Elena Rostova', email: 'elena@designsystem.studio', responseStatus: 'tentative' },
    ],
    description: 'Final alignment on Friday launch candidate, rollback plan, and customer support on-call rotation.',
    relatedEmailsCount: 4,
    relatedDocsCount: 2,
    unresolvedDecisionsCount: 1,
    prepStatus: 'briefing_generated',
    aiBriefing: {
      objective: 'Lock launch date, confirm staging validation, and designate primary deploy lead.',
      keyParticipants: ['Sarah Chen (Tech Lead)', 'Marcus Brody (DevOps)', 'Elena Rostova (Design)'],
      unresolvedQuestions: [
        'Move launch to Friday or keep Tuesday buffer?',
        'Who is primary on-call for 24h post-launch?',
      ],
      talkingPoints: [
        'Congratulate team on sub-15ms staging latency.',
        'Review Sarah’s branch freeze request.',
        'Confirm status of automated smoke tests.',
      ],
      relatedFiles: [
        { name: 'LaunchStack Release Checklist', type: 'doc', url: 'https://docs.google.com' },
        { name: 'Infrastructure Runbook v3', type: 'doc', url: 'https://docs.google.com' },
      ],
    },
  },
  {
    id: 'cal-2',
    title: 'Product Roadmap Architecture Review',
    startTime: '2:00 PM',
    endTime: '2:45 PM',
    startDate: '2026-10-04',
    durationMinutes: 45,
    meetLink: 'https://meet.google.com/ais-arch-rev',
    organizer: 'Sarah Chen',
    attendees: [
      { name: 'Drew Sepeczi (You)', email: 'drew@workspace.local', responseStatus: 'accepted' },
      { name: 'Sarah Chen', email: 'sarah.chen@acme.corp', responseStatus: 'accepted' },
      { name: 'Kenji Sato', email: 'kenji@acme.corp', responseStatus: 'accepted' },
    ],
    description: 'Deep dive into unified search architecture and client-side caching strategies.',
    relatedEmailsCount: 3,
    relatedDocsCount: 2,
    unresolvedDecisionsCount: 1,
    prepStatus: 'needs_prep',
  },
  {
    id: 'cal-3',
    title: 'Apex Ventures Q4 Growth & Model Review',
    startTime: '4:00 PM',
    endTime: '4:45 PM',
    startDate: '2026-10-04',
    durationMinutes: 45,
    meetLink: 'https://meet.google.com/ais-apex-growth',
    organizer: 'David Miller',
    attendees: [
      { name: 'David Miller', email: 'david.m@apexventures.vc', responseStatus: 'accepted' },
      { name: 'Rachel Vance', email: 'rachel@apexventures.vc', responseStatus: 'accepted' },
      { name: 'Drew Sepeczi (You)', email: 'drew@workspace.local', responseStatus: 'accepted' },
    ],
    description: 'Quarterly financial model walkthrough and go-to-market milestones.',
    relatedEmailsCount: 5,
    relatedDocsCount: 3,
    unresolvedDecisionsCount: 2,
    prepStatus: 'needs_prep',
  },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Send updated staging build to Sarah Chen',
    notes: 'Derived from email thread "Launch timeline adjustment to Friday"',
    due: 'Today, 1:00 PM',
    status: 'needsAction',
    source: 'gemini_extracted',
    sourceContext: {
      type: 'gmail',
      title: 'Launch timeline adjustment to Friday',
      from: 'Sarah Chen',
    },
    priority: 'p1',
    counterpart: 'Sarah Chen',
  },
  {
    id: 'task-2',
    title: 'Review headcount ramp on Tab 3 of Q4 Financial Model',
    notes: 'Required prior to 4:00 PM meeting with David Miller',
    due: 'Today, 3:30 PM',
    status: 'needsAction',
    source: 'gemini_extracted',
    sourceContext: {
      type: 'sheets',
      title: 'Q4 2026 Financial Projection Model',
      from: 'David Miller',
    },
    priority: 'p1',
    counterpart: 'David Miller',
  },
  {
    id: 'task-3',
    title: 'Approve Elena’s design token pull request',
    notes: 'Tokens verified in Figma review yesterday',
    due: 'Tomorrow',
    status: 'needsAction',
    source: 'google_tasks',
    sourceContext: {
      type: 'tasks',
      title: 'Google Tasks default list',
    },
    priority: 'p2',
    counterpart: 'Elena Rostova',
  },
  {
    id: 'task-4',
    title: 'Confirm Google Meet recording consent form for user study',
    notes: 'UX research participant interviews next Monday',
    due: 'Oct 06',
    status: 'needsAction',
    source: 'google_tasks',
    sourceContext: {
      type: 'forms',
      title: 'User Study Intake Form',
    },
    priority: 'p3',
  },
];

export const INITIAL_DRIVE_FILES: DriveFileItem[] = [
  {
    id: 'file-1',
    name: 'Q4 2026 Financial Projection Model',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    fileType: 'sheet',
    webViewLink: 'https://docs.google.com/spreadsheets',
    modifiedTime: '2026-10-04T08:15:00Z',
    timeAgo: '1h ago',
    lastModifyingUser: 'David Miller',
    summary: 'Updated scenario B with accelerated enterprise sales hire trajectory.',
    relatedProjectId: 'proj-financials',
  },
  {
    id: 'file-2',
    name: 'LaunchStack Architecture & Technical Spec v2.4',
    mimeType: 'application/vnd.google-apps.document',
    fileType: 'doc',
    webViewLink: 'https://docs.google.com/document',
    modifiedTime: '2026-10-03T21:30:00Z',
    timeAgo: '12h ago',
    lastModifyingUser: 'Sarah Chen',
    summary: 'Clarified retry mechanics for asynchronous event dispatchers.',
    relatedProjectId: 'proj-launch',
  },
  {
    id: 'file-3',
    name: 'Operator Partner Executive Deck',
    mimeType: 'application/vnd.google-apps.presentation',
    fileType: 'slide',
    webViewLink: 'https://docs.google.com/presentation',
    modifiedTime: '2026-10-02T16:00:00Z',
    timeAgo: '2d ago',
    lastModifyingUser: 'Drew Sepeczi (You)',
    summary: '12-slide walkthrough of workspace unification layer.',
    relatedProjectId: 'proj-launch',
  },
  {
    id: 'file-4',
    name: 'Customer Onboarding Feedback & NPS',
    mimeType: 'application/vnd.google-apps.form',
    fileType: 'form',
    webViewLink: 'https://docs.google.com/forms',
    modifiedTime: '2026-10-01T11:20:00Z',
    timeAgo: '3d ago',
    lastModifyingUser: 'Product Ops',
    summary: '89 responses collected with 72 NPS score.',
    relatedProjectId: 'proj-growth',
  },
];

export const INITIAL_CONTACTS: ContactItem[] = [
  {
    id: 'con-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@acme.corp',
    company: 'Acme Systems',
    role: 'Principal Architect & Tech Lead',
    lastInteraction: '2h ago via Gmail',
    openThreadsCount: 2,
    relationshipSummary: 'Key engineering collaborator. Collaborated on 14 pull requests and 8 meetings in past 30 days.',
    recentTopics: ['Friday Launch Date', 'Staging Latency', 'Branch Freeze'],
  },
  {
    id: 'con-2',
    name: 'David Miller',
    email: 'david.m@apexventures.vc',
    company: 'Apex Ventures',
    role: 'Managing Partner',
    lastInteraction: '1h ago via Gmail',
    openThreadsCount: 1,
    relationshipSummary: 'Lead investor contact. Regular monthly board and quarterly financial check-ins.',
    recentTopics: ['Headcount Model', 'Q4 Growth Targets', 'Series A Milestones'],
  },
  {
    id: 'con-3',
    name: 'Elena Rostova',
    email: 'elena@designsystem.studio',
    company: 'Design Studio',
    role: 'Lead Product Designer',
    lastInteraction: 'Yesterday via Drive',
    openThreadsCount: 1,
    relationshipSummary: 'Design lead overseeing design tokens, component hierarchy, and editorial layout.',
    recentTopics: ['Design Tokens', 'Dark Theme Palettes', 'Typography Spec'],
  },
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-launch',
    name: 'LaunchStack 2.0 Deployment',
    description: 'Coordinating final engineering readiness, customer communications, and launch operations.',
    status: 'active',
    tags: ['Engineering', 'High Priority', 'Q4 Milestone'],
    members: ['Sarah Chen', 'Marcus Brody', 'Elena Rostova'],
    metrics: {
      emailsCount: 12,
      meetingsCount: 3,
      docsCount: 4,
      openTasksCount: 2,
    },
    keyDecisions: [
      'Approved Friday release move pending smoke tests.',
      'Adopted Zero-downtime rolling deployment pattern.',
    ],
    recentActivity: 'Sarah submitted release freeze request 2h ago.',
    updatedAt: '2h ago',
  },
  {
    id: 'proj-financials',
    name: 'Apex Growth & Q4 Financials',
    description: 'Quarterly board review, headcount planning, and revenue projections.',
    status: 'active',
    tags: ['Finance', 'Board', 'Planning'],
    members: ['David Miller', 'Rachel Vance', 'Alex Morgan'],
    metrics: {
      emailsCount: 7,
      meetingsCount: 2,
      docsCount: 3,
      openTasksCount: 1,
    },
    keyDecisions: [
      'Revised sales hiring timeline to commence Nov 1.',
    ],
    recentActivity: 'David commented on tab 3 model 1h ago.',
    updatedAt: '1h ago',
  },
];

export const INITIAL_COMMITMENTS: CommitmentItem[] = [
  {
    id: 'com-1',
    title: 'Provide final confirmation on Friday launch date to Sarah',
    type: 'promise_made',
    source: 'Gmail thread "Launch timeline adjustment to Friday"',
    sourceType: 'gmail',
    counterpart: 'Sarah Chen',
    status: 'pending',
    dueDate: 'Today, 11:15 AM',
    createdAt: '2026-10-04T07:15:00Z',
  },
  {
    id: 'com-2',
    title: 'Waiting on David for signed term sheet copy',
    type: 'waiting_on',
    source: 'Drive file "Series A Term Sheet.pdf"',
    sourceType: 'drive',
    counterpart: 'David Miller',
    status: 'pending',
    dueDate: 'Oct 07',
    createdAt: '2026-10-03T14:00:00Z',
  },
  {
    id: 'com-3',
    title: 'Unanswered question: Who is primary on-call for weekend traffic?',
    type: 'unanswered_question',
    source: 'Calendar event "LaunchStack Release & Operational Sync"',
    sourceType: 'calendar',
    counterpart: 'Marcus Brody',
    status: 'pending',
    dueDate: 'Today, 10:30 AM',
    createdAt: '2026-10-04T06:00:00Z',
  },
];

export const INITIAL_ACTIVITIES: ActivityLogItem[] = [
  {
    id: 'act-1',
    action: 'Discovered commitment',
    details: 'Identified pending launch approval from Sarah Chen in Gmail thread',
    status: 'completed',
    timestamp: '2h ago',
    actor: 'Operator AI',
  },
  {
    id: 'act-2',
    action: 'Generated briefing',
    details: 'Compiled executive brief for "LaunchStack Release & Operational Sync" at 10:30 AM',
    status: 'completed',
    timestamp: '3h ago',
    actor: 'Operator AI',
  },
  {
    id: 'act-3',
    action: 'Synced Google Tasks',
    details: 'Refreshed 4 tasks across default list and AI commitments',
    status: 'completed',
    timestamp: '4h ago',
    actor: 'Operator AI',
  },
];

// Helper to fetch live Google Workspace data if token is active
export async function fetchLiveGmail(accessToken: string): Promise<EmailItem[] | null> {
  try {
    const listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=label:INBOX',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!listRes.ok) return null;
    const listData = await listRes.json();
    if (!listData.messages || listData.messages.length === 0) return [];

    const messages = await Promise.all(
      listData.messages.slice(0, 8).map(async (msg: { id: string }) => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!msgRes.ok) return null;
        const data = await msgRes.json();
        const headers = data.payload?.headers || [];
        const fromHeader = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || '(No Subject)';
        const dateStr = headers.find((h: any) => h.name === 'Date')?.value || new Date().toISOString();

        return {
          id: data.id,
          threadId: data.threadId,
          senderName: fromHeader.split('<')[0]?.replace(/"/g, '').trim() || fromHeader,
          senderEmail: fromHeader.match(/<([^>]+)>/)?.[1] || fromHeader,
          subject,
          snippet: data.snippet || '',
          date: dateStr,
          timeAgo: 'Recently',
          unread: data.labelIds?.includes('UNREAD') || false,
          important: data.labelIds?.includes('IMPORTANT') || false,
          priority: (data.labelIds?.includes('IMPORTANT') ? 'urgent' : 'normal') as any,
          category: 'needs_response' as any,
          aiSummary: data.snippet,
        } as EmailItem;
      })
    );

    return messages.filter(Boolean) as EmailItem[];
  } catch (err) {
    console.warn('Could not fetch live Gmail, using enhanced operational store:', err);
    return null;
  }
}

export async function fetchLiveCalendar(accessToken: string): Promise<CalendarEventItem[] | null> {
  try {
    const now = new Date();
    const timeMin = new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const timeMax = new Date(now.setDate(now.getDate() + 2)).toISOString();

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        timeMin
      )}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=10`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!calRes.ok) return null;
    const data = await calRes.json();
    if (!data.items) return [];

    return data.items.map((ev: any) => {
      const start = ev.start?.dateTime || ev.start?.date;
      const end = ev.end?.dateTime || ev.end?.date;
      const startTimeStr = start ? new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All day';
      const endTimeStr = end ? new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

      return {
        id: ev.id,
        title: ev.summary || 'Meeting',
        startTime: startTimeStr,
        endTime: endTimeStr,
        startDate: start ? start.split('T')[0] : '',
        durationMinutes: 30,
        meetLink: ev.hangoutLink || ev.conferenceData?.entryPoints?.[0]?.uri,
        organizer: ev.organizer?.displayName || ev.organizer?.email || 'Organizer',
        attendees: (ev.attendees || []).map((att: any) => ({
          name: att.displayName || att.email,
          email: att.email,
          responseStatus: att.responseStatus,
        })),
        description: ev.description,
        relatedEmailsCount: 2,
        relatedDocsCount: 1,
        unresolvedDecisionsCount: 0,
        prepStatus: 'needs_prep',
      } as CalendarEventItem;
    });
  } catch (err) {
    console.warn('Could not fetch live Calendar:', err);
    return null;
  }
}

export async function fetchLiveDrive(accessToken: string): Promise<DriveFileItem[] | null> {
  try {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,webViewLink,modifiedTime)&orderBy=modifiedTime desc',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.files) return [];

    return data.files.map((f: any) => {
      let fileType: DriveFileItem['fileType'] = 'other';
      if (f.mimeType.includes('spreadsheet')) fileType = 'sheet';
      else if (f.mimeType.includes('document')) fileType = 'doc';
      else if (f.mimeType.includes('presentation')) fileType = 'slide';
      else if (f.mimeType.includes('form')) fileType = 'form';
      else if (f.mimeType.includes('pdf')) fileType = 'pdf';

      return {
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        fileType,
        webViewLink: f.webViewLink,
        modifiedTime: f.modifiedTime,
        timeAgo: 'Recently',
        lastModifyingUser: 'Collaborator',
        summary: `Google Drive file: ${f.name}`,
      };
    });
  } catch (err) {
    console.warn('Could not fetch live Drive:', err);
    return null;
  }
}

export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  try {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      body,
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to send live Gmail message:', err);
    return false;
  }
}
