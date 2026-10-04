'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Users,
  Video,
  FileText,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { CalendarEventItem } from '@/lib/types';

interface MeetingPrepModalProps {
  isOpen: boolean;
  meeting: CalendarEventItem | null;
  onClose: () => void;
  onTriggerBriefing: (meeting: CalendarEventItem) => Promise<void>;
  isGeneratingBriefing: boolean;
}

export function MeetingPrepModal({
  isOpen,
  meeting,
  onClose,
  onTriggerBriefing,
  isGeneratingBriefing,
}: MeetingPrepModalProps) {
  if (!meeting) return null;

  const briefing = meeting.aiBriefing;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-6 font-sans max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="outline" className="font-mono text-[10px]">
                  Calendar Briefing
                </Badge>
                {meeting.prepStatus === 'briefing_generated' ? (
                  <Badge variant="success" className="text-[10px]">
                    Briefing Ready
                  </Badge>
                ) : (
                  <Badge variant="urgent" className="text-[10px]">
                    Needs Prep
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-base font-semibold text-zinc-100 leading-tight">
                {meeting.title}
              </DialogTitle>
              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-zinc-500" />
                  {meeting.startTime} – {meeting.endTime} ({meeting.durationMinutes}m)
                </span>
                <span className="text-zinc-600">·</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-zinc-500" />
                  {meeting.attendees?.length || 0} participants
                </span>
              </div>
            </div>

            {meeting.meetLink && (
              <Button
                variant="default"
                size="sm"
                className="shrink-0 gap-1.5"
                onClick={() => window.open(meeting.meetLink, '_blank')}
              >
                <Video className="h-3.5 w-3.5" />
                <span>Join Meet</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs">
          {/* Key Participants */}
          <div className="rounded-md border border-zinc-850 bg-zinc-900/40 p-3 space-y-2">
            <span className="font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Participants & Roles
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {(meeting.attendees || []).map((att) => (
                <div
                  key={att.email}
                  className="flex items-center justify-between p-1.5 rounded bg-zinc-950/60 border border-zinc-850"
                >
                  <div className="truncate">
                    <p className="font-medium text-zinc-200 truncate">{att.name}</p>
                    <p className="text-[10px] font-mono text-zinc-500 truncate">{att.email}</p>
                  </div>
                  {att.responseStatus === 'accepted' && (
                    <span className="text-[10px] font-mono text-emerald-400 shrink-0 ml-2">
                      Accepted
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Briefing Content */}
          {briefing ? (
            <div className="space-y-3">
              {/* Objective */}
              <div className="rounded-md border border-zinc-850 bg-zinc-900/60 p-3">
                <span className="font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  Meeting Objective
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {briefing.objective}
                </p>
              </div>

              {/* Unresolved Questions */}
              {briefing.unresolvedQuestions && briefing.unresolvedQuestions.length > 0 && (
                <div className="rounded-md border border-amber-900/40 bg-amber-950/20 p-3">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-2">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Unresolved Decisions to Lock</span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-zinc-300">
                    {briefing.unresolvedQuestions.map((q, i) => (
                      <li key={i} className="text-xs leading-relaxed">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Talking Points */}
              {briefing.talkingPoints && briefing.talkingPoints.length > 0 && (
                <div className="rounded-md border border-zinc-850 bg-zinc-900/40 p-3">
                  <span className="font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Suggested Talking Points
                  </span>
                  <ul className="space-y-1.5 list-disc list-inside text-zinc-300">
                    {briefing.talkingPoints.map((tp, i) => (
                      <li key={i} className="text-xs leading-relaxed">
                        {tp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Drive Docs */}
              {briefing.relatedFiles && briefing.relatedFiles.length > 0 && (
                <div className="rounded-md border border-zinc-850 bg-zinc-900/30 p-3">
                  <span className="font-mono text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
                    Referenced Workspace Files
                  </span>
                  <div className="space-y-1.5">
                    {briefing.relatedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-1.5 rounded bg-zinc-950 border border-zinc-850 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="text-zinc-200 font-medium">{f.name}</span>
                          <span className="text-[10px] font-mono text-zinc-500 uppercase">
                            ({f.type})
                          </span>
                        </div>
                        {f.url && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => window.open(f.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 text-zinc-400" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-zinc-800 p-6 text-center space-y-3">
              <Sparkles className="h-6 w-6 text-zinc-400 mx-auto" />
              <div>
                <p className="text-xs font-medium text-zinc-300">
                  No automated briefing generated yet for this event
                </p>
                <p className="text-[11px] text-zinc-500 mt-1 max-w-sm mx-auto">
                  Operator can analyze participant history, recent emails, and linked docs to prepare your agenda.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTriggerBriefing(meeting)}
                disabled={isGeneratingBriefing}
                className="gap-2"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isGeneratingBriefing ? 'animate-spin' : ''}`}
                />
                <span>Generate Executive Briefing</span>
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-3 border-t border-zinc-900">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          {briefing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTriggerBriefing(meeting)}
              disabled={isGeneratingBriefing}
              className="gap-1.5"
            >
              <RefreshCw
                className={`h-3 w-3 ${isGeneratingBriefing ? 'animate-spin' : ''}`}
              />
              <span>Regenerate Brief</span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
