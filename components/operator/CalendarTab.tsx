'use client';

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video,
  FileText,
  Sparkles,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarEventItem, ApprovalItem } from '@/lib/types';

interface CalendarTabProps {
  meetings: CalendarEventItem[];
  onOpenMeetingPrep: (meeting: CalendarEventItem) => void;
  onInitiateApproval: (approval: ApprovalItem) => void;
  onTriggerBriefing: (meeting: CalendarEventItem) => Promise<void>;
  isGeneratingBriefing: boolean;
}

export function CalendarTab({
  meetings,
  onOpenMeetingPrep,
  onInitiateApproval,
  onTriggerBriefing,
  isGeneratingBriefing,
}: CalendarTabProps) {
  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
        <div>
          <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            <span>Calendar Operations</span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {meetings.length} events scheduled
            </Badge>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Meetings enriched with related conversations, linked Drive files, attendee context, and AI preparation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (meetings[0]) onTriggerBriefing(meetings[0]);
            }}
            disabled={isGeneratingBriefing}
            className="gap-1.5 font-mono text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Prepare Next Meeting</span>
          </Button>
        </div>
      </div>

      {/* Events Stream */}
      <div className="space-y-4">
        {meetings.map((meeting) => {
          const hasBriefing = meeting.prepStatus === 'briefing_generated' && meeting.aiBriefing;
          return (
            <div
              key={meeting.id}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-5 space-y-4 transition-all hover:border-zinc-700"
            >
              {/* Event Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-zinc-100">
                      {meeting.startTime} – {meeting.endTime}
                    </span>
                    <Badge variant={hasBriefing ? 'success' : 'urgent'} className="text-[10px]">
                      {hasBriefing ? 'Briefing Ready' : 'Prep Needed'}
                    </Badge>
                    <span className="font-mono text-[11px] text-zinc-500">
                      ({meeting.durationMinutes} min)
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-100">
                    {meeting.title}
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-2xl">
                    {meeting.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {meeting.meetLink && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => window.open(meeting.meetLink, '_blank')}
                      className="gap-1.5 font-semibold"
                    >
                      <Video className="h-3.5 w-3.5" />
                      <span>Join Meet</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenMeetingPrep(meeting)}
                    className="gap-1.5 font-mono text-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Open Briefing</span>
                  </Button>
                </div>
              </div>

              {/* Context Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="rounded-md border border-zinc-850 bg-zinc-900/40 p-2.5 space-y-1">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">
                    Attendees ({meeting.attendees?.length || 0})
                  </span>
                  <p className="text-xs font-medium text-zinc-200 truncate">
                    {meeting.attendees?.map((a) => a.name.split(' ')[0]).join(', ') || 'None'}
                  </p>
                </div>

                <div className="rounded-md border border-zinc-850 bg-zinc-900/40 p-2.5 space-y-1">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">
                    Related Workspace Items
                  </span>
                  <p className="text-xs font-medium text-zinc-200">
                    {meeting.relatedEmailsCount} emails · {meeting.relatedDocsCount} docs
                  </p>
                </div>

                <div className="rounded-md border border-zinc-850 bg-zinc-900/40 p-2.5 space-y-1">
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">
                    Unresolved Decisions
                  </span>
                  <p className="text-xs font-medium text-amber-300">
                    {meeting.unresolvedDecisionsCount > 0
                      ? `${meeting.unresolvedDecisionsCount} key question to lock`
                      : 'None flagged'}
                  </p>
                </div>
              </div>

              {/* Inlined Briefing Teaser if present */}
              {hasBriefing && meeting.aiBriefing && (
                <div className="rounded-md border border-zinc-850 bg-zinc-900/30 p-3 space-y-2 border-l-2 border-l-zinc-300">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span className="font-semibold text-zinc-300 uppercase">Executive Objective:</span>
                    <span>Operator Briefing</span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                    {meeting.aiBriefing.objective}
                  </p>
                  {meeting.aiBriefing.unresolvedQuestions?.[0] && (
                    <p className="text-xs text-amber-300 font-mono flex items-center gap-1.5">
                      <HelpCircle className="h-3 w-3 shrink-0" />
                      <span>Key question: {meeting.aiBriefing.unresolvedQuestions[0]}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Event Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-xs">
                <span className="font-mono text-[11px] text-zinc-500">
                  Organizer: {meeting.organizer}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      onInitiateApproval({
                        id: `app-reschedule-${meeting.id}`,
                        actionType: 'reschedule_meeting',
                        title: `Reschedule "${meeting.title}"`,
                        summary: `Propose adjusting meeting start time by 30 minutes`,
                        payload: {
                          eventId: meeting.id,
                          newTime: 'Move by +30m',
                        },
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                      });
                    }}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    Propose Time Shift
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
