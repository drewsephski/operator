'use client';

import * as React from 'react';
import {
  Sparkles,
  AlertCircle,
  Clock,
  Hourglass,
  ArrowRight,
  TrendingUp,
  FileText,
  Mail,
  Calendar,
  CheckSquare,
  Video,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Send,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  EmailItem,
  CalendarEventItem,
  TaskItem,
  DriveFileItem,
  CommitmentItem,
  ApprovalItem,
} from '@/lib/types';

interface TodayTabProps {
  emails: EmailItem[];
  meetings: CalendarEventItem[];
  tasks: TaskItem[];
  files: DriveFileItem[];
  commitments: CommitmentItem[];
  onOpenMeetingPrep: (meeting: CalendarEventItem) => void;
  onInitiateApproval: (approval: ApprovalItem) => void;
  onQuickDraft: (email: EmailItem) => void;
  onNavigateTab: (tab: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export function TodayTab({
  emails,
  meetings,
  tasks,
  files,
  commitments,
  onOpenMeetingPrep,
  onInitiateApproval,
  onQuickDraft,
  onNavigateTab,
  onCompleteTask,
}: TodayTabProps) {
  const [briefingData, setBriefingData] = React.useState<any>(null);
  const [isSynthesizing, setIsSynthesizing] = React.useState(false);

  // Generate morning briefing on initial load or manual refresh
  const handleSynthesizeBriefing = async () => {
    try {
      setIsSynthesizing(true);
      const res = await fetch('/api/gemini/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails,
          meetings,
          tasks,
          files,
          commitments,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBriefingData(data);
      }
    } catch (err) {
      console.error('Failed to synthesize briefing:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    const loadBriefing = async () => {
      try {
        setIsSynthesizing(true);
        const res = await fetch('/api/gemini/briefing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emails,
            meetings,
            tasks,
            files,
            commitments,
          }),
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setBriefingData(data);
        }
      } catch (err) {
        console.error('Failed to synthesize briefing:', err);
      } finally {
        if (isMounted) setIsSynthesizing(false);
      }
    };
    loadBriefing();
    return () => {
      isMounted = false;
    };
  }, []);

  const urgentEmails = emails.filter((e) => e.priority === 'urgent' || e.category === 'needs_response');
  const waitingOnItems = commitments.filter((c) => c.type === 'waiting_on');
  const promisesMade = commitments.filter((c) => c.type === 'promise_made');

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Executive Briefing Banner */}
      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
          <div className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-100 text-zinc-950 font-mono text-[10px] font-bold">
              AI
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                Daily Operational Briefing
              </h2>
              <span className="text-[10px] font-mono text-zinc-500">· Today, Oct 04, 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={handleSynthesizeBriefing}
              disabled={isSynthesizing}
              className="gap-1.5 font-mono text-[11px]"
            >
              <RefreshCw className={`h-3 w-3 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span>{isSynthesizing ? 'Synthesizing...' : 'Re-synthesize Briefing'}</span>
            </Button>
          </div>
        </div>

        {/* Dynamic Headline */}
        <div className="pt-3">
          <p className="text-sm sm:text-base font-medium text-zinc-100 leading-snug">
            {briefingData?.attentionHeadline ||
              'Sarah Chen needs confirmation on moving the LaunchStack release to Friday, while Q4 model adjustments precede your 4:00 PM investor review.'}
          </p>
          <p className="text-xs text-zinc-400 mt-1.5 font-mono">
            {briefingData?.todayScheduleSummary ||
              '3 scheduled meetings today (1.5h total load) · 1 urgent email response blocking release freeze · 2 commitments due.'}
          </p>
        </div>
      </div>

      {/* Grid: 1. Attention & 2. Today Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section 1: What needs my attention? (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                What Needs My Attention
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('inbox')}
              className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              <span>View all ({urgentEmails.length})</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {urgentEmails.map((email) => (
              <div
                key={email.id}
                className="group rounded-md border border-zinc-800 bg-zinc-950 p-3.5 transition-all hover:border-zinc-700 hover:bg-zinc-900/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-zinc-100">
                        {email.senderName} needs a response
                      </span>
                      <Badge variant="urgent" className="text-[10px]">
                        {email.priority}
                      </Badge>
                      <span className="font-mono text-[10px] text-zinc-500">
                        {email.timeAgo}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                      {email.aiSummary || email.snippet}
                    </p>

                    <p className="text-[11px] font-mono text-zinc-500 truncate">
                      Re: {email.subject}
                    </p>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="mt-3 flex items-center gap-2 pt-2.5 border-t border-zinc-900">
                  <Button
                    variant="default"
                    size="xs"
                    onClick={() => onQuickDraft(email)}
                    className="gap-1 font-semibold"
                  >
                    <Send className="h-3 w-3" />
                    <span>Draft reply</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      onInitiateApproval({
                        id: `app-task-${email.id}`,
                        actionType: 'create_task',
                        title: `Follow up with ${email.senderName}`,
                        summary: `Create task from email "${email.subject}"`,
                        payload: {
                          taskTitle: `Follow up with ${email.senderName} regarding ${email.subject}`,
                          dueDate: 'Today',
                        },
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                      });
                    }}
                  >
                    <CheckSquare className="h-3 w-3" />
                    <span>Create task</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onNavigateTab('inbox')}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    View thread
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Promises Made / Extracted Commitments */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              <Clock className="h-3 w-3 text-zinc-400" />
              <span>Promises Made This Week</span>
            </div>
            <div className="space-y-1.5">
              {promisesMade.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-md border border-zinc-850 bg-zinc-900/30 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0" />
                    <span className="font-medium text-zinc-200 truncate">{p.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-[11px] font-mono text-zinc-400">
                    <span>Due {p.dueDate}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {p.counterpart}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: What am I doing today? (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-zinc-300" />
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                Today&apos;s Schedule &amp; Briefings
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {meetings.length} events
            </span>
          </div>

          <div className="space-y-2.5">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="rounded-md border border-zinc-800 bg-zinc-950 p-3.5 space-y-2 transition-all hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-semibold text-zinc-100">
                      {meeting.startTime} — {meeting.title}
                    </span>
                    <p className="text-[11px] font-mono text-zinc-400 mt-1">
                      {meeting.relatedEmailsCount} related emails · {meeting.relatedDocsCount} documents · {meeting.unresolvedDecisionsCount} unresolved decision
                    </p>
                  </div>

                  {meeting.meetLink && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => window.open(meeting.meetLink, '_blank')}
                      title="Join Meet"
                      className="text-zinc-400 hover:text-zinc-100"
                    >
                      <Video className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
                    <span className="text-zinc-400">{meeting.attendees?.length || 0}</span> attendees
                  </div>

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onOpenMeetingPrep(meeting)}
                    className="gap-1 font-mono text-[11px]"
                  >
                    <Sparkles className="h-3 w-3 text-zinc-400" />
                    <span>Open briefing</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Section 3: What am I waiting on? */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <Hourglass className="h-3.5 w-3.5 text-zinc-400" />
                <span>What I&apos;m Waiting On</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">
                {waitingOnItems.length} blockers
              </span>
            </div>

            <div className="space-y-1.5">
              {waitingOnItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-md border border-zinc-850 bg-zinc-900/30 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-zinc-200 truncate">{item.title}</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400 shrink-0 ml-2">
                    {item.counterpart}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 4. What Changed? & 5. What should I do next? */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Section 4: What Changed? (Drive & Activity) (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-zinc-300" />
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                What Changed (Recent Activity)
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('activity')}
              className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              <span>View audit log</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 rounded-md border border-zinc-850 bg-zinc-950 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <div className="truncate">
                    <p className="text-xs font-medium text-zinc-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-500">
                      Modified by {file.lastModifyingUser} · {file.timeAgo}
                    </p>
                  </div>
                </div>

                {file.webViewLink && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => window.open(file.webViewLink, '_blank')}
                    title="Open in Google Drive"
                  >
                    <ExternalLink className="h-3 w-3 text-zinc-400" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: What should I do next? (Ranked actionable queue) (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-3.5 w-3.5 text-zinc-300" />
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                What Should I Do Next
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
            >
              <span>View all ({tasks.length})</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-2.5 rounded-md border border-zinc-850 bg-zinc-950 hover:border-zinc-700 transition-colors gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => onCompleteTask(task.id)}
                    className="mt-0.5 h-4 w-4 rounded-xs border border-zinc-700 flex items-center justify-center hover:border-zinc-400 cursor-pointer"
                  >
                    <span className="sr-only">Complete task</span>
                  </button>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-zinc-200 leading-snug">
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                      <span>Due {task.due || 'Today'}</span>
                      {task.source === 'gemini_extracted' && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0">
                          AI Discovered
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Badge
                  variant={task.priority === 'p1' ? 'urgent' : 'outline'}
                  className="font-mono text-[9px] uppercase shrink-0"
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
