'use client';

import * as React from 'react';
import {
  Calendar,
  Clock,
  Video,
  ExternalLink,
  Mail,
  FileText,
  FileSpreadsheet,
  Presentation,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CalendarEventItem,
  EmailItem,
  DriveFileItem,
  TaskItem,
} from '@/lib/types';

// ==========================================
// 1. COMPACT CALENDAR RESULT CARD
// ==========================================
interface CalendarResultsCardProps {
  events: CalendarEventItem[];
  onSelectEvent?: (event: CalendarEventItem) => void;
}

export function CalendarResultsCard({ events, onSelectEvent }: CalendarResultsCardProps) {
  if (!events || events.length === 0) return null;

  return (
    <div className="my-2.5 rounded-md border border-zinc-800 bg-zinc-950 p-3 text-xs space-y-2 font-sans shadow-md">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-zinc-300">
          <Calendar className="h-3.5 w-3.5 text-zinc-100" />
          <span>Calendar ({events.length} {events.length === 1 ? 'event' : 'events'})</span>
        </div>
      </div>

      <div className="divide-y divide-zinc-850/60">
        {events.map((ev) => (
          <div key={ev.id} className="py-2 first:pt-1 last:pb-0 flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <p className="font-medium text-zinc-100 truncate">{ev.title}</p>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-zinc-400" />
                  {ev.startDate ? `${ev.startDate} · ` : ''}{ev.startTime}
                  {ev.endTime ? ` – ${ev.endTime}` : ''}
                </span>
                {ev.attendees && ev.attendees.length > 0 && (
                  <span>· {ev.attendees.length} attendees</span>
                )}
              </div>
              {ev.description && (
                <p className="text-[11px] text-zinc-400 line-clamp-1">{ev.description}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
              {ev.meetLink && (
                <a
                  href={ev.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-xs border border-zinc-750 bg-zinc-900 px-2 py-1 text-[10px] font-medium text-zinc-300 hover:bg-zinc-850 hover:text-white transition-colors"
                >
                  <Video className="h-3 w-3 text-emerald-400" />
                  <span>Join Meet</span>
                </a>
              )}
              {onSelectEvent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectEvent(ev)}
                  className="h-6 text-[10px] text-zinc-400 hover:text-zinc-100"
                >
                  Inspect
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 2. COMPACT EMAIL RESULT CARD
// ==========================================
interface EmailResultsCardProps {
  emails: EmailItem[];
  onReplyPrompt?: (email: EmailItem) => void;
}

export function EmailResultsCard({ emails, onReplyPrompt }: EmailResultsCardProps) {
  if (!emails || emails.length === 0) return null;

  return (
    <div className="my-2.5 rounded-md border border-zinc-800 bg-zinc-950 p-3 text-xs space-y-2 font-sans shadow-md">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-zinc-300">
          <Mail className="h-3.5 w-3.5 text-zinc-100" />
          <span>Gmail ({emails.length} {emails.length === 1 ? 'message' : 'messages'})</span>
        </div>
      </div>

      <div className="divide-y divide-zinc-850/60">
        {emails.map((em) => (
          <div key={em.id} className="py-2.5 first:pt-1 last:pb-0 flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-zinc-100 truncate">{em.senderName}</span>
                <span className="font-mono text-[10px] text-zinc-400 shrink-0">{em.timeAgo}</span>
              </div>
              <p className="font-medium text-zinc-200 text-xs truncate">{em.subject}</p>
              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{em.snippet}</p>
            </div>

            {onReplyPrompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReplyPrompt(em)}
                className="h-6 shrink-0 text-[10px] border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900"
              >
                Draft reply
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. COMPACT DRIVE FILES CARD
// ==========================================
interface DriveResultsCardProps {
  files: DriveFileItem[];
}

export function DriveResultsCard({ files }: DriveResultsCardProps) {
  if (!files || files.length === 0) return null;

  const getIcon = (type: DriveFileItem['fileType']) => {
    switch (type) {
      case 'sheet':
        return <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
      case 'slide':
        return <Presentation className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="my-2.5 rounded-md border border-zinc-800 bg-zinc-950 p-3 text-xs space-y-2 font-sans shadow-md">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-zinc-300">
          <FileText className="h-3.5 w-3.5 text-zinc-100" />
          <span>Google Drive ({files.length} {files.length === 1 ? 'file' : 'files'})</span>
        </div>
      </div>

      <div className="divide-y divide-zinc-850/60">
        {files.map((file) => (
          <div key={file.id} className="py-2 first:pt-1 last:pb-0 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {getIcon(file.fileType)}
              <span className="font-medium text-zinc-200 truncate">{file.name}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] text-zinc-400">{file.timeAgo}</span>
              {file.webViewLink && (
                <a
                  href={file.webViewLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-100 transition-colors p-1"
                  title="Open in Google Drive"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. COMPACT TASKS CARD
// ==========================================
interface TasksResultsCardProps {
  tasks: TaskItem[];
  onToggleTask?: (taskId: string, currentStatus: TaskItem['status']) => void;
}

export function TasksResultsCard({ tasks, onToggleTask }: TasksResultsCardProps) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="my-2.5 rounded-md border border-zinc-800 bg-zinc-950 p-3 text-xs space-y-2 font-sans shadow-md">
      <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-zinc-300">
          <CheckSquare className="h-3.5 w-3.5 text-zinc-100" />
          <span>Google Tasks ({tasks.length})</span>
        </div>
      </div>

      <div className="divide-y divide-zinc-850/60">
        {tasks.map((task) => {
          const isDone = task.status === 'completed';
          return (
            <div key={task.id} className="py-2 first:pt-1 last:pb-0 flex items-start gap-2.5">
              <div className="pt-0.5">
                <Checkbox
                  checked={isDone}
                  onCheckedChange={() => onToggleTask?.(task.id, task.status)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${isDone ? 'line-through text-zinc-400' : 'text-zinc-200'}`}>
                  {task.title}
                </p>
                {task.due && (
                  <p className="font-mono text-[10px] text-zinc-400">Due: {task.due}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 5. EXECUTIVE MEETING BRIEFING CARD
// ==========================================
interface MeetingBriefingProps {
  briefing: {
    meetingTitle: string;
    meetingTime: string;
    objective: string;
    keyParticipants: string[];
    unresolvedQuestions: string[];
    talkingPoints: string[];
    relatedFiles?: { name: string; type: string; url?: string }[];
  };
}

export function BriefingCard({ briefing }: MeetingBriefingProps) {
  return (
    <div className="my-3 rounded-md border border-zinc-800 bg-zinc-950 font-sans shadow-lg overflow-hidden">
      <div className="border-b border-zinc-850 bg-zinc-900/60 px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-zinc-100" />
          <div>
            <h4 className="font-semibold text-xs text-zinc-100">{briefing.meetingTitle}</h4>
            <p className="font-mono text-[10px] text-zinc-400">{briefing.meetingTime}</p>
          </div>
        </div>
        <span className="font-mono text-[10px] uppercase text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded-xs">
          Executive Brief
        </span>
      </div>

      <div className="p-3.5 space-y-3 text-xs text-zinc-300">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
            Objective
          </span>
          <p className="leading-relaxed text-zinc-200">{briefing.objective}</p>
        </div>

        {briefing.keyParticipants && briefing.keyParticipants.length > 0 && (
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Participants
            </span>
            <div className="flex flex-wrap gap-1.5">
              {briefing.keyParticipants.map((p, idx) => (
                <span
                  key={idx}
                  className="rounded-xs border border-zinc-800 bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-300"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {briefing.talkingPoints && briefing.talkingPoints.length > 0 && (
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Key Talking Points
            </span>
            <ul className="list-disc list-inside space-y-1 text-zinc-300">
              {briefing.talkingPoints.map((tp, idx) => (
                <li key={idx} className="leading-relaxed">
                  {tp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {briefing.unresolvedQuestions && briefing.unresolvedQuestions.length > 0 && (
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Questions to Address
            </span>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              {briefing.unresolvedQuestions.map((uq, idx) => (
                <li key={idx}>{uq}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
