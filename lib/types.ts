export type WorkspaceSource =
  | 'gmail'
  | 'calendar'
  | 'tasks'
  | 'drive'
  | 'docs'
  | 'sheets'
  | 'slides'
  | 'contacts'
  | 'chat'
  | 'meet'
  | 'forms';

export interface EmailItem {
  id: string;
  threadId: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  fullBody?: string;
  date: string;
  timeAgo: string;
  unread: boolean;
  important: boolean;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  category: 'needs_response' | 'waiting_on' | 'fyi' | 'newsletter' | 'action_required';
  aiSummary?: string;
  suggestedAction?: 'reply' | 'create_task' | 'archive' | 'review_document';
  draftReply?: {
    to: string;
    subject: string;
    body: string;
  };
}

export interface CalendarEventItem {
  id: string;
  title: string;
  startTime: string; // e.g., "10:00 AM" or ISO
  endTime: string;
  startDate: string;
  durationMinutes: number;
  meetLink?: string;
  location?: string;
  organizer: string;
  attendees: { name: string; email: string; responseStatus?: string }[];
  description?: string;
  relatedEmailsCount: number;
  relatedDocsCount: number;
  unresolvedDecisionsCount: number;
  prepStatus: 'ready' | 'needs_prep' | 'briefing_generated';
  aiBriefing?: {
    objective: string;
    keyParticipants: string[];
    unresolvedQuestions: string[];
    talkingPoints: string[];
    relatedFiles: { name: string; type: string; url?: string }[];
  };
}

export interface TaskItem {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
  source: 'google_tasks' | 'gemini_extracted';
  sourceContext?: {
    type: WorkspaceSource;
    title: string;
    from?: string;
  };
  priority: 'p1' | 'p2' | 'p3';
  counterpart?: string;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  fileType: 'doc' | 'sheet' | 'slide' | 'form' | 'pdf' | 'folder' | 'other';
  webViewLink?: string;
  modifiedTime: string;
  timeAgo: string;
  lastModifyingUser: string;
  summary?: string;
  relatedProjectId?: string;
}

export interface ContactItem {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  avatarUrl?: string;
  lastInteraction: string;
  openThreadsCount: number;
  relationshipSummary: string;
  recentTopics: string[];
}

export interface CommitmentItem {
  id: string;
  title: string;
  type: 'promise_made' | 'waiting_on' | 'unanswered_question';
  source: string;
  sourceType: WorkspaceSource;
  counterpart: string;
  status: 'pending' | 'resolved' | 'dismissed';
  dueDate?: string;
  createdAt: string;
}

export interface ApprovalItem {
  id: string;
  actionType: 'send_email' | 'create_calendar_event' | 'update_calendar_event' | 'create_task' | 'complete_task';
  title: string;
  summary: string;
  payload: {
    recipient?: string;
    subject?: string;
    body?: string;
    title?: string;
    startTime?: string;
    endTime?: string;
    date?: string;
    eventId?: string;
    taskTitle?: string;
    dueDate?: string;
    taskId?: string;
    taskListId?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  executionResult?: {
    success: boolean;
    message: string;
    timestamp: string;
    id?: string;
  };
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  approval?: ApprovalItem;
  calendarResults?: CalendarEventItem[];
  emailResults?: EmailItem[];
  fileResults?: DriveFileItem[];
  taskResults?: TaskItem[];
  briefingResult?: {
    meetingTitle: string;
    meetingTime: string;
    objective: string;
    keyParticipants: string[];
    unresolvedQuestions: string[];
    talkingPoints: string[];
    relatedFiles?: { name: string; type: string; url?: string }[];
  };
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  tags: string[];
  members: string[];
  metrics: {
    emailsCount: number;
    meetingsCount: number;
    docsCount: number;
    openTasksCount: number;
  };
  keyDecisions: string[];
  recentActivity: string;
  updatedAt: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  details: string;
  status: 'completed' | 'approved' | 'dismissed' | 'suggested';
  timestamp: string;
  actor: 'Operator AI' | 'User';
}
