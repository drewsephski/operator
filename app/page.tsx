'use client';

import * as React from 'react';
import { Navbar } from '@/components/operator/Navbar';
import { CommandBar } from '@/components/operator/CommandBar';
import { ActionApprovalModal } from '@/components/operator/ActionApprovalModal';
import { MeetingPrepModal } from '@/components/operator/MeetingPrepModal';
import { TodayTab } from '@/components/operator/TodayTab';
import { InboxTab } from '@/components/operator/InboxTab';
import { CalendarTab } from '@/components/operator/CalendarTab';
import { TasksTab } from '@/components/operator/TasksTab';
import { ProjectsTab } from '@/components/operator/ProjectsTab';
import { PeopleTab } from '@/components/operator/PeopleTab';
import { AskTab } from '@/components/operator/AskTab';
import { ActivityTab } from '@/components/operator/ActivityTab';

import {
  initAuth,
  getAccessToken,
  testConnection,
  db,
  handleFirestoreError,
  OperationType,
} from '@/lib/firebase';
import {
  INITIAL_EMAILS,
  INITIAL_MEETINGS,
  INITIAL_TASKS,
  INITIAL_DRIVE_FILES,
  INITIAL_CONTACTS,
  INITIAL_PROJECTS,
  INITIAL_COMMITMENTS,
  INITIAL_ACTIVITIES,
  fetchLiveGmail,
  fetchLiveCalendar,
  fetchLiveDrive,
  sendGmailMessage,
} from '@/lib/workspace';
import {
  EmailItem,
  CalendarEventItem,
  TaskItem,
  DriveFileItem,
  ContactItem,
  ProjectItem,
  CommitmentItem,
  ActivityLogItem,
  ApprovalItem,
} from '@/lib/types';
import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';

export default function OperatorPage() {
  // Auth & Token State
  const [user, setUser] = React.useState<User | null>(null);
  const [liveToken, setLiveToken] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Tab State
  const [activeTab, setActiveTab] = React.useState<string>('today');

  // Core Data Stores
  const [emails, setEmails] = React.useState<EmailItem[]>(INITIAL_EMAILS);
  const [meetings, setMeetings] = React.useState<CalendarEventItem[]>(INITIAL_MEETINGS);
  const [tasks, setTasks] = React.useState<TaskItem[]>(INITIAL_TASKS);
  const [files, setFiles] = React.useState<DriveFileItem[]>(INITIAL_DRIVE_FILES);
  const [contacts, setContacts] = React.useState<ContactItem[]>(INITIAL_CONTACTS);
  const [projects, setProjects] = React.useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [commitments, setCommitments] = React.useState<CommitmentItem[]>(INITIAL_COMMITMENTS);
  const [activities, setActivities] = React.useState<ActivityLogItem[]>(INITIAL_ACTIVITIES);

  // Dialog & Modal State
  const [isCommandBarOpen, setIsCommandBarOpen] = React.useState(false);
  const [activeApproval, setActiveApproval] = React.useState<ApprovalItem | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = React.useState(false);

  const [activePrepMeeting, setActivePrepMeeting] = React.useState<CalendarEventItem | null>(null);
  const [isMeetingPrepModalOpen, setIsMeetingPrepModalOpen] = React.useState(false);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = React.useState(false);

  // Ask prompt pass-through from Command Bar
  const [askPrompt, setAskPrompt] = React.useState<string>('');

  // Helper to append activity
  const logActivity = React.useCallback(
    async (action: string, details: string, status: ActivityLogItem['status']) => {
      const newAct: ActivityLogItem = {
        id: `act-${Date.now()}`,
        action,
        details,
        status,
        timestamp: 'Just now',
        actor: 'Operator AI',
      };
      setActivities((prev) => [newAct, ...prev]);

      if (user?.uid) {
        try {
          await setDoc(doc(db, 'users', user.uid, 'activity', newAct.id), {
            ...newAct,
            userId: user.uid,
          });
        } catch (err) {
          console.warn('Firestore activity sync note:', err);
        }
      }
    },
    [user]
  );

  // Sync Live Workspace Data
  const refreshLiveWorkspaceData = React.useCallback(
    async (token?: string) => {
      const currentToken = token || liveToken || getAccessToken();
      if (!currentToken) return;

      try {
        setIsRefreshing(true);
        const [liveEmails, liveMeetings, liveFiles] = await Promise.all([
          fetchLiveGmail(currentToken),
          fetchLiveCalendar(currentToken),
          fetchLiveDrive(currentToken),
        ]);

        if (liveEmails && liveEmails.length > 0) {
          setEmails((prev) => [
            ...liveEmails,
            ...prev.filter((p) => !liveEmails.some((l) => l.id === p.id)),
          ]);
        }
        if (liveMeetings && liveMeetings.length > 0) {
          setMeetings((prev) => [
            ...liveMeetings,
            ...prev.filter((p) => !liveMeetings.some((l) => l.id === p.id)),
          ]);
        }
        if (liveFiles && liveFiles.length > 0) {
          setFiles((prev) => [
            ...liveFiles,
            ...prev.filter((p) => !liveFiles.some((l) => l.id === p.id)),
          ]);
        }

        logActivity(
          'Refreshed Workspace',
          'Synced latest Gmail, Calendar, and Drive events via Google 1P API',
          'completed'
        );
      } catch (err) {
        console.warn('Workspace live fetch note:', err);
      } finally {
        setIsRefreshing(false);
      }
    },
    [liveToken, logActivity]
  );

  // 1. Initialize Auth and test Firestore connection
  React.useEffect(() => {
    testConnection();

    const unsubscribe = initAuth(
      (authedUser, token) => {
        setUser(authedUser);
        setLiveToken(token);
        // Refresh live data with user token
        refreshLiveWorkspaceData(token);
      },
      () => {
        // Unauthenticated or refreshed without in-memory token
      }
    );

    return () => {
      unsubscribe();
    };
  }, [refreshLiveWorkspaceData]);

  // 2. Global Keyboard Shortcuts: ⌘K or Ctrl+K, and 1-8 navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandBarOpen((prev) => !prev);
      } else if (
        !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName) &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        if (e.key === '1') setActiveTab('today');
        else if (e.key === '2') setActiveTab('inbox');
        else if (e.key === '3') setActiveTab('calendar');
        else if (e.key === '4') setActiveTab('tasks');
        else if (e.key === '5') setActiveTab('projects');
        else if (e.key === '6') setActiveTab('people');
        else if (e.key === '7') setActiveTab('ask');
        else if (e.key === '8') setActiveTab('activity');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Approval Execution Handler
  const handleApproveAction = async (payload: any) => {
    if (!activeApproval) return;

    if (activeApproval.actionType === 'send_email') {
      const token = liveToken || getAccessToken();
      if (token && payload.recipient && payload.subject && payload.body) {
        await sendGmailMessage(token, payload.recipient, payload.subject, payload.body);
      }
      logActivity(
        'Email Sent',
        `Approved & dispatched email to ${payload.recipient} regarding "${payload.subject}"`,
        'approved'
      );
    } else if (activeApproval.actionType === 'create_task') {
      const newTask: TaskItem = {
        id: `task-${Date.now()}`,
        title: payload.taskTitle || activeApproval.title,
        notes: activeApproval.summary,
        due: payload.dueDate || 'Today',
        status: 'needsAction',
        source: 'google_tasks',
        priority: 'p1',
      };
      setTasks((prev) => [newTask, ...prev]);
      logActivity('Task Created', `Created Google Task "${newTask.title}"`, 'approved');
    } else if (activeApproval.actionType === 'reschedule_meeting') {
      logActivity(
        'Meeting Updated',
        `Adjusted event schedule for "${activeApproval.title}"`,
        'approved'
      );
    }

    setIsApprovalModalOpen(false);
    setActiveApproval(null);
  };

  // 1-Click Quick Draft Handler
  const handleQuickDraft = async (email: EmailItem) => {
    try {
      const res = await fetch('/api/gemini/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'email_reply',
          recipient: email.senderName,
          context: {
            subject: email.subject,
            snippet: email.snippet,
            aiSummary: email.aiSummary,
          },
        }),
      });

      let draftBody = email.draftReply?.body || 'Confirmed on my side.';
      if (res.ok) {
        const data = await res.json();
        if (data.draft) draftBody = data.draft;
      }

      setActiveApproval({
        id: `app-email-${email.id}`,
        actionType: 'send_email',
        title: `Reply to ${email.senderName}`,
        summary: `Draft response to "${email.subject}"`,
        payload: {
          recipient: email.senderEmail || `${email.senderName.toLowerCase().replace(' ', '.')}@acme.corp`,
          subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
          body: draftBody,
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setIsApprovalModalOpen(true);
    } catch (err) {
      console.error('Quick draft error:', err);
    }
  };

  // Meeting Prep Briefing Generator
  const handleTriggerBriefing = async (meeting: CalendarEventItem) => {
    try {
      setIsGeneratingBriefing(true);
      const res = await fetch('/api/gemini/prep-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meeting,
          relatedEmails: emails.slice(0, 3).map((e) => ({ from: e.senderName, subject: e.subject })),
          relatedDocs: files.slice(0, 2).map((f) => ({ name: f.name })),
        }),
      });

      if (res.ok) {
        const briefing = await res.json();
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === meeting.id
              ? {
                  ...m,
                  prepStatus: 'briefing_generated',
                  aiBriefing: briefing,
                }
              : m
          )
        );

        setActivePrepMeeting((prev) =>
          prev && prev.id === meeting.id
            ? { ...prev, prepStatus: 'briefing_generated', aiBriefing: briefing }
            : prev
        );

        logActivity(
          'Briefing Generated',
          `Synthesized executive preparation for "${meeting.title}"`,
          'completed'
        );
      }
    } catch (err) {
      console.error('Briefing error:', err);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const handleCommandBarExecute = (queryText: string) => {
    if (queryText.includes('LaunchStack')) {
      setActiveTab('projects');
    } else if (queryText.includes('attention') || queryText.includes('today')) {
      setActiveTab('today');
    } else if (queryText.includes('promises') || queryText.includes('waiting on')) {
      setActiveTab('tasks');
    } else if (queryText.includes('next meeting')) {
      if (meetings[0]) {
        setActivePrepMeeting(meetings[0]);
        setIsMeetingPrepModalOpen(true);
      }
    } else {
      setAskPrompt(queryText);
      setActiveTab('ask');
    }
  };

  const TABS = [
    { id: 'today', label: 'Today', key: '1' },
    { id: 'inbox', label: 'Inbox', key: '2' },
    { id: 'calendar', label: 'Calendar', key: '3' },
    { id: 'tasks', label: 'Tasks', key: '4' },
    { id: 'projects', label: 'Projects', key: '5' },
    { id: 'people', label: 'People', key: '6' },
    { id: 'ask', label: 'Ask', key: '7' },
    { id: 'activity', label: 'Activity', key: '8' },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <Navbar
        user={user}
        onUserChange={(authedUser, token) => {
          setUser(authedUser);
          setLiveToken(token);
          if (token) refreshLiveWorkspaceData(token);
        }}
        onOpenCommandBar={() => setIsCommandBarOpen(true)}
        onRefreshData={() => refreshLiveWorkspaceData()}
        isRefreshing={isRefreshing}
        activeTab={activeTab}
        hasLiveToken={!!liveToken}
      />

      {/* 2. Secondary Tab Navigation Bar */}
      <div className="border-b border-zinc-850 bg-zinc-950/70 backdrop-blur-xs sticky top-12 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between overflow-x-auto py-1">
          <div className="flex items-center gap-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-zinc-100 border border-zinc-700 font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 border border-transparent hover:bg-zinc-900/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono text-[10px] text-zinc-500 opacity-60">
                    {tab.key}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-zinc-500">
            <span>Press keys 1-8 to navigate</span>
            <span>·</span>
            <span>⌘K for Command Bar</span>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Canvas */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 pt-5">
        {activeTab === 'today' && (
          <TodayTab
            emails={emails}
            meetings={meetings}
            tasks={tasks}
            files={files}
            commitments={commitments}
            onOpenMeetingPrep={(meeting) => {
              setActivePrepMeeting(meeting);
              setIsMeetingPrepModalOpen(true);
            }}
            onInitiateApproval={(appr) => {
              setActiveApproval(appr);
              setIsApprovalModalOpen(true);
            }}
            onQuickDraft={handleQuickDraft}
            onNavigateTab={(t) => setActiveTab(t)}
            onCompleteTask={(taskId) => {
              setTasks((prev) =>
                prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' } : t))
              );
              logActivity('Completed Task', `Marked task as completed`, 'completed');
            }}
          />
        )}

        {activeTab === 'inbox' && (
          <InboxTab
            emails={emails}
            onInitiateApproval={(appr) => {
              setActiveApproval(appr);
              setIsApprovalModalOpen(true);
            }}
            onQuickDraft={handleQuickDraft}
            onArchiveEmail={(id) => {
              setEmails((prev) => prev.filter((e) => e.id !== id));
              logActivity('Archived Email', `Archived thread ${id}`, 'completed');
            }}
            onOpenCompose={() => {
              setActiveApproval({
                id: `app-compose-${Date.now()}`,
                actionType: 'send_email',
                title: 'Compose Email',
                summary: 'Proposed email to external recipient',
                payload: {
                  recipient: 'sarah.chen@acme.corp',
                  subject: 'Operational update',
                  body: 'Hi Sarah,\n\nFollowing up on our launch milestones for Friday.\n\nBest,\nDrew',
                },
                status: 'pending',
                createdAt: new Date().toISOString(),
              });
              setIsApprovalModalOpen(true);
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTab
            meetings={meetings}
            onOpenMeetingPrep={(meeting) => {
              setActivePrepMeeting(meeting);
              setIsMeetingPrepModalOpen(true);
            }}
            onInitiateApproval={(appr) => {
              setActiveApproval(appr);
              setIsApprovalModalOpen(true);
            }}
            onTriggerBriefing={handleTriggerBriefing}
            isGeneratingBriefing={isGeneratingBriefing}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab
            tasks={tasks}
            commitments={commitments}
            onAddTask={(title, priority, due) => {
              const newTask: TaskItem = {
                id: `task-${Date.now()}`,
                title,
                due: due || 'Today',
                priority,
                status: 'needsAction',
                source: 'google_tasks',
              };
              setTasks((prev) => [newTask, ...prev]);
              logActivity('Added Task', `Created task "${title}"`, 'completed');
            }}
            onCompleteTask={(taskId) => {
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === taskId
                    ? { ...t, status: t.status === 'completed' ? 'needsAction' : 'completed' }
                    : t
                )
              );
            }}
            onInitiateApproval={(appr) => {
              setActiveApproval(appr);
              setIsApprovalModalOpen(true);
            }}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab
            projects={projects}
            emails={emails}
            files={files}
            meetings={meetings}
            onOpenMeetingPrep={(meeting) => {
              setActivePrepMeeting(meeting);
              setIsMeetingPrepModalOpen(true);
            }}
            onQuickDraft={handleQuickDraft}
          />
        )}

        {activeTab === 'people' && (
          <PeopleTab
            contacts={contacts}
            onInitiateApproval={(appr) => {
              setActiveApproval(appr);
              setIsApprovalModalOpen(true);
            }}
          />
        )}

        {activeTab === 'ask' && (
          <AskTab
            emails={emails}
            meetings={meetings}
            tasks={tasks}
            files={files}
            commitments={commitments}
            initialPrompt={askPrompt}
          />
        )}

        {activeTab === 'activity' && <ActivityTab activities={activities} />}
      </main>

      {/* 4. Global ⌘K Command Dialog */}
      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
        onExecuteCommand={handleCommandBarExecute}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* 5. Explicit External Action Approval Modal */}
      <ActionApprovalModal
        isOpen={isApprovalModalOpen}
        approval={activeApproval}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setActiveApproval(null);
        }}
        onApprove={handleApproveAction}
        onDismiss={() => {
          if (activeApproval) {
            logActivity('Dismissed Proposal', `User rejected action "${activeApproval.title}"`, 'dismissed');
          }
          setIsApprovalModalOpen(false);
          setActiveApproval(null);
        }}
      />

      {/* 6. Meeting Briefing Deep-Dive Modal */}
      <MeetingPrepModal
        isOpen={isMeetingPrepModalOpen}
        meeting={activePrepMeeting}
        onClose={() => {
          setIsMeetingPrepModalOpen(false);
          setActivePrepMeeting(null);
        }}
        onTriggerBriefing={handleTriggerBriefing}
        isGeneratingBriefing={isGeneratingBriefing}
      />
    </div>
  );
}
