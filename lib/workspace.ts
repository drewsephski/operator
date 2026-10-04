import {
  EmailItem,
  CalendarEventItem,
  TaskItem,
  DriveFileItem,
  ContactItem,
} from './types';

// ==========================================
// REAL GOOGLE WORKSPACE API INTEGRATION ONLY
// No mock, seed, or fabricated demo data.
// ==========================================

// 1. GMAIL INTEGRATION
export async function fetchLiveGmail(
  accessToken: string,
  query = 'label:INBOX',
  maxResults = 10
): Promise<EmailItem[]> {
  try {
    const listRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(
        query
      )}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!listRes.ok) return [];
    const listData = await listRes.json();
    if (!listData.messages || listData.messages.length === 0) return [];

    const messages = await Promise.all(
      listData.messages.slice(0, maxResults).map(async (msg: { id: string; threadId: string }) => {
        try {
          const msgRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (!msgRes.ok) return null;
          const data = await msgRes.json();
          const headers = data.payload?.headers || [];
          const fromHeader = headers.find((h: any) => h.name?.toLowerCase() === 'from')?.value || 'Unknown';
          const subject = headers.find((h: any) => h.name?.toLowerCase() === 'subject')?.value || '(No Subject)';
          const dateStr = headers.find((h: any) => h.name?.toLowerCase() === 'date')?.value || new Date().toISOString();

          // Extract text body if available
          let body = data.snippet || '';
          if (data.payload?.parts) {
            const textPart = data.payload.parts.find((p: any) => p.mimeType === 'text/plain');
            if (textPart?.body?.data) {
              try {
                body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
              } catch (_) {}
            }
          } else if (data.payload?.body?.data) {
            try {
              body = Buffer.from(data.payload.body.data, 'base64').toString('utf-8');
            } catch (_) {}
          }

          const senderName = fromHeader.split('<')[0]?.replace(/"/g, '').trim() || fromHeader;
          const senderEmail = fromHeader.match(/<([^>]+)>/)?.[1] || fromHeader;

          return {
            id: data.id,
            threadId: data.threadId,
            senderName,
            senderEmail,
            subject,
            snippet: data.snippet || '',
            fullBody: body,
            date: dateStr,
            timeAgo: formatTimeAgo(new Date(dateStr)),
            unread: data.labelIds?.includes('UNREAD') || false,
            important: data.labelIds?.includes('IMPORTANT') || false,
            priority: data.labelIds?.includes('IMPORTANT') ? 'urgent' : 'normal',
            category: 'needs_response',
          } as EmailItem;
        } catch {
          return null;
        }
      })
    );

    return messages.filter(Boolean) as EmailItem[];
  } catch (err) {
    console.error('fetchLiveGmail error:', err);
    return [];
  }
}

export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string
): Promise<{ success: boolean; id?: string; error?: string }> {
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

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return { success: false, error: errJson.error?.message || 'Failed to send message via Gmail API' };
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown network error' };
  }
}

// 2. CALENDAR INTEGRATION
export async function fetchLiveCalendar(
  accessToken: string,
  timeMin?: string,
  timeMax?: string,
  maxResults = 10
): Promise<CalendarEventItem[]> {
  try {
    const now = new Date();
    const min = timeMin || new Date(now.setHours(0, 0, 0, 0)).toISOString();
    const max = timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const calRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        min
      )}&timeMax=${encodeURIComponent(max)}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!calRes.ok) return [];
    const data = await calRes.json();
    if (!data.items) return [];

    return data.items.map((ev: any) => {
      const start = ev.start?.dateTime || ev.start?.date;
      const end = ev.end?.dateTime || ev.end?.date;
      const startTimeStr = start ? new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All day';
      const endTimeStr = end ? new Date(end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
      const startDateStr = start ? new Date(start).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '';

      return {
        id: ev.id,
        title: ev.summary || '(Untitled Event)',
        startTime: startTimeStr,
        endTime: endTimeStr,
        startDate: startDateStr,
        durationMinutes: 30,
        meetLink: ev.hangoutLink || ev.conferenceData?.entryPoints?.[0]?.uri,
        organizer: ev.organizer?.displayName || ev.organizer?.email || 'Organizer',
        attendees: (ev.attendees || []).map((att: any) => ({
          name: att.displayName || att.email,
          email: att.email,
          responseStatus: att.responseStatus,
        })),
        description: ev.description || '',
        relatedEmailsCount: 0,
        relatedDocsCount: 0,
        unresolvedDecisionsCount: 0,
        prepStatus: 'ready',
      } as CalendarEventItem;
    });
  } catch (err) {
    console.error('fetchLiveCalendar error:', err);
    return [];
  }
}

export async function createLiveCalendarEvent(
  accessToken: string,
  eventData: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    attendees?: { email: string }[];
  }
): Promise<{ success: boolean; event?: any; error?: string }> {
  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error?.message || 'Failed to create calendar event' };
    }
    const data = await res.json();
    return { success: true, event: data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown calendar error' };
  }
}

export async function updateLiveCalendarEvent(
  accessToken: string,
  eventId: string,
  patchData: any
): Promise<{ success: boolean; event?: any; error?: string }> {
  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patchData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error?.message || 'Failed to update calendar event' };
    }
    const data = await res.json();
    return { success: true, event: data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown calendar update error' };
  }
}

// 3. TASKS INTEGRATION
export async function fetchLiveTasks(
  accessToken: string,
  showCompleted = false
): Promise<TaskItem[]> {
  try {
    const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!listsRes.ok) return [];
    const listsData = await listsRes.json();
    const primaryList = listsData.items?.[0];
    if (!primaryList) return [];

    const tasksRes = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${primaryList.id}/tasks?showCompleted=${showCompleted}&maxResults=20`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!tasksRes.ok) return [];
    const tasksData = await tasksRes.json();
    if (!tasksData.items) return [];

    return tasksData.items.map((t: any) => ({
      id: t.id,
      title: t.title || '(Untitled Task)',
      notes: t.notes || '',
      due: t.due ? new Date(t.due).toLocaleDateString() : undefined,
      status: t.status === 'completed' ? 'completed' : 'needsAction',
      source: 'google_tasks',
      priority: 'p2',
    }));
  } catch (err) {
    console.error('fetchLiveTasks error:', err);
    return [];
  }
}

export async function createLiveTask(
  accessToken: string,
  title: string,
  notes?: string,
  due?: string
): Promise<{ success: boolean; task?: any; error?: string }> {
  try {
    const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!listsRes.ok) return { success: false, error: 'Could not access task list' };
    const listsData = await listsRes.json();
    const primaryListId = listsData.items?.[0]?.id || '@default';

    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${primaryListId}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        notes,
        due: due ? new Date(due).toISOString() : undefined,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error?.message || 'Failed to create task' };
    }
    const data = await res.json();
    return { success: true, task: data };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown task error' };
  }
}

export async function updateLiveTaskStatus(
  accessToken: string,
  taskId: string,
  status: 'completed' | 'needsAction'
): Promise<{ success: boolean; error?: string }> {
  try {
    const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!listsRes.ok) return { success: false, error: 'Could not access task list' };
    const listsData = await listsRes.json();
    const primaryListId = listsData.items?.[0]?.id || '@default';

    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${primaryListId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    return { success: res.ok };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// 4. DRIVE INTEGRATION
export async function fetchLiveDrive(
  accessToken: string,
  query?: string,
  maxResults = 10
): Promise<DriveFileItem[]> {
  try {
    let q = "trashed = false";
    if (query) {
      const sanitized = query.replace(/'/g, '');
      q += ` and (name contains '${sanitized}' or fullText contains '${sanitized}')`;
    }

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?pageSize=${maxResults}&q=${encodeURIComponent(
        q
      )}&fields=files(id,name,mimeType,webViewLink,modifiedTime)&orderBy=modifiedTime desc`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.files) return [];

    return data.files.map((f: any) => {
      let fileType: DriveFileItem['fileType'] = 'other';
      if (f.mimeType?.includes('spreadsheet')) fileType = 'sheet';
      else if (f.mimeType?.includes('document')) fileType = 'doc';
      else if (f.mimeType?.includes('presentation')) fileType = 'slide';
      else if (f.mimeType?.includes('form')) fileType = 'form';
      else if (f.mimeType?.includes('pdf')) fileType = 'pdf';

      return {
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        fileType,
        webViewLink: f.webViewLink,
        modifiedTime: f.modifiedTime,
        timeAgo: formatTimeAgo(new Date(f.modifiedTime)),
        lastModifyingUser: 'Google Account',
        summary: `Google Drive file: ${f.name}`,
      };
    });
  } catch (err) {
    console.error('fetchLiveDrive error:', err);
    return [];
  }
}

// 5. CONTACTS / PEOPLE INTEGRATION
export async function searchLiveContacts(
  accessToken: string,
  query: string
): Promise<ContactItem[]> {
  try {
    const res = await fetch(
      `https://people.googleapis.com/v1/people:searchContacts?query=${encodeURIComponent(
        query
      )}&readMask=names,emailAddresses,organizations`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) {
      // Fallback to connections
      const connRes = await fetch(
        'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,organizations&pageSize=50',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!connRes.ok) return [];
      const connData = await connRes.json();
      if (!connData.connections) return [];

      const lower = query.toLowerCase();
      return connData.connections
        .filter((p: any) => {
          const name = p.names?.[0]?.displayName?.toLowerCase() || '';
          const email = p.emailAddresses?.[0]?.value?.toLowerCase() || '';
          return name.includes(lower) || email.includes(lower);
        })
        .map((p: any, idx: number) => ({
          id: p.resourceName || `con-${idx}`,
          name: p.names?.[0]?.displayName || 'Unknown',
          email: p.emailAddresses?.[0]?.value || '',
          company: p.organizations?.[0]?.name,
          role: p.organizations?.[0]?.title,
          lastInteraction: 'Google Contacts',
          openThreadsCount: 0,
          relationshipSummary: 'Contact in your Google Account',
          recentTopics: [],
        }));
    }

    const data = await res.json();
    if (!data.results) return [];

    return data.results.map((r: any, idx: number) => {
      const p = r.person;
      return {
        id: p.resourceName || `con-${idx}`,
        name: p.names?.[0]?.displayName || query,
        email: p.emailAddresses?.[0]?.value || '',
        company: p.organizations?.[0]?.name,
        role: p.organizations?.[0]?.title,
        lastInteraction: 'Google Contacts',
        openThreadsCount: 0,
        relationshipSummary: 'Contact in your Google Account',
        recentTopics: [],
      };
    });
  } catch (err) {
    console.error('searchLiveContacts error:', err);
    return [];
  }
}

function formatTimeAgo(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}
