'use client';

import * as React from 'react';
import {
  Mail,
  Calendar,
  CheckSquare,
  Send,
  CheckCircle2,
  XCircle,
  Edit3,
  Loader2,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ApprovalItem } from '@/lib/types';

interface ChatApprovalCardProps {
  approval: ApprovalItem;
  accessToken: string | null;
  onExecuted?: (updatedApproval: ApprovalItem) => void;
  onCancel?: (approvalId: string) => void;
}

export function ChatApprovalCard({
  approval,
  accessToken,
  onExecuted,
  onCancel,
}: ChatApprovalCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Editable fields initialized from approval payload
  const [recipient, setRecipient] = React.useState(approval.payload.recipient || '');
  const [subject, setSubject] = React.useState(approval.payload.subject || '');
  const [body, setBody] = React.useState(approval.payload.body || '');
  const [title, setTitle] = React.useState(approval.payload.title || approval.payload.taskTitle || '');
  const [startTime, setStartTime] = React.useState(approval.payload.startTime || '');
  const [dueDate, setDueDate] = React.useState(approval.payload.dueDate || '');

  const handleExecute = async () => {
    if (!accessToken) {
      setErrorMsg('Please sign in with your Google Account to execute this action.');
      return;
    }

    try {
      setIsExecuting(true);
      setErrorMsg(null);

      const payload = {
        ...approval.payload,
        recipient,
        subject,
        body,
        title,
        taskTitle: title,
        startTime,
        dueDate,
      };

      const res = await fetch('/api/workspace/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: approval.actionType,
          payload,
          accessToken,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Google Workspace API call failed');
      }

      const updated: ApprovalItem = {
        ...approval,
        status: 'executed',
        executionResult: {
          success: true,
          message: data.message,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          id: data.id,
        },
      };

      setIsEditing(false);
      onExecuted?.(updated);
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const isExecuted = approval.status === 'executed';
  const isCancelled = approval.status === 'rejected';

  // Get icon and header badge based on action type
  const getHeaderInfo = () => {
    switch (approval.actionType) {
      case 'send_email':
        return {
          icon: <Mail className="h-4 w-4 text-zinc-100" />,
          label: 'Ready to send',
          actionBtn: 'Send',
        };
      case 'create_calendar_event':
        return {
          icon: <Calendar className="h-4 w-4 text-zinc-100" />,
          label: 'Proposed Event',
          actionBtn: 'Create Event',
        };
      case 'update_calendar_event':
        return {
          icon: <Calendar className="h-4 w-4 text-zinc-100" />,
          label: 'Proposed Reschedule',
          actionBtn: 'Confirm Reschedule',
        };
      case 'create_task':
        return {
          icon: <CheckSquare className="h-4 w-4 text-zinc-100" />,
          label: 'Proposed Task',
          actionBtn: 'Create Task',
        };
      case 'complete_task':
        return {
          icon: <CheckSquare className="h-4 w-4 text-zinc-100" />,
          label: 'Complete Task',
          actionBtn: 'Mark Complete',
        };
      default:
        return {
          icon: <Send className="h-4 w-4 text-zinc-100" />,
          label: 'Proposed Action',
          actionBtn: 'Execute',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="my-3 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 font-sans shadow-lg transition-all">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between border-b border-zinc-850 bg-zinc-900/60 px-3.5 py-2">
        <div className="flex items-center gap-2">
          {headerInfo.icon}
          <span className="font-mono text-xs font-semibold tracking-wide text-zinc-100">
            {headerInfo.label}
          </span>
        </div>

        {isExecuted && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Executed · {approval.executionResult?.timestamp}</span>
          </div>
        )}

        {isCancelled && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
            <XCircle className="h-3.5 w-3.5" />
            <span>Cancelled</span>
          </div>
        )}
      </div>

      {/* Main Content Fields */}
      <div className="p-3.5 space-y-2.5 text-xs text-zinc-200">
        {/* Email Fields */}
        {approval.actionType === 'send_email' && (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-zinc-400 w-16 shrink-0">To:</span>
              {isEditing ? (
                <Input
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="h-7 text-xs bg-zinc-900 border-zinc-750"
                  placeholder="recipient@example.com"
                />
              ) : (
                <span className="font-mono text-zinc-100 select-all font-medium">
                  {recipient || '(No recipient)'}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-zinc-400 w-16 shrink-0">Subject:</span>
              {isEditing ? (
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="h-7 text-xs bg-zinc-900 border-zinc-750"
                  placeholder="Subject"
                />
              ) : (
                <span className="font-medium text-zinc-100">{subject || '(No subject)'}</span>
              )}
            </div>

            <div className="pt-1 border-t border-zinc-850">
              {isEditing ? (
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  className="text-xs bg-zinc-900 border-zinc-750 leading-relaxed font-sans"
                />
              ) : (
                <p className="whitespace-pre-wrap text-zinc-300 leading-relaxed font-sans bg-zinc-900/40 p-2.5 rounded-sm border border-zinc-850/80">
                  {body}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Calendar Fields */}
        {(approval.actionType === 'create_calendar_event' ||
          approval.actionType === 'update_calendar_event') && (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-zinc-400 w-16 shrink-0">Event:</span>
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-7 text-xs bg-zinc-900 border-zinc-750"
                />
              ) : (
                <span className="font-medium text-zinc-100">{title}</span>
              )}
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-zinc-400 w-16 shrink-0">Time:</span>
              {isEditing ? (
                <Input
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-7 text-xs bg-zinc-900 border-zinc-750"
                  placeholder="e.g. 3:00 PM"
                />
              ) : (
                <span className="font-mono text-zinc-200">{startTime || 'Scheduled'}</span>
              )}
            </div>

            {approval.summary && (
              <p className="text-zinc-400 text-[11px] pt-1 border-t border-zinc-850">
                {approval.summary}
              </p>
            )}
          </div>
        )}

        {/* Task Fields */}
        {approval.actionType === 'create_task' && (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-zinc-400 w-16 shrink-0">Task:</span>
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-7 text-xs bg-zinc-900 border-zinc-750"
                />
              ) : (
                <span className="font-medium text-zinc-100">{title}</span>
              )}
            </div>

            {dueDate && (
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-zinc-400 w-16 shrink-0">Due:</span>
                <span className="font-mono text-zinc-300">{dueDate}</span>
              </div>
            )}
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="rounded-xs border border-red-900/60 bg-red-950/40 p-2 text-xs text-red-300">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Action Footer Buttons */}
      {!isExecuted && !isCancelled && (
        <div className="flex items-center justify-between border-t border-zinc-850 bg-zinc-900/40 px-3.5 py-2">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isExecuting}
              className="h-7 text-xs text-zinc-400 hover:text-zinc-100 cursor-pointer"
            >
              {isEditing ? (
                <>
                  <Save className="mr-1.5 h-3 w-3" /> Save Changes
                </>
              ) : (
                <>
                  <Edit3 className="mr-1.5 h-3 w-3" /> Edit
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel?.(approval.id)}
              disabled={isExecuting}
              className="h-7 text-xs border-zinc-750 text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleExecute}
              disabled={isExecuting}
              className="h-7 text-xs bg-zinc-100 text-zinc-950 hover:bg-white font-medium cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Send className="mr-1.5 h-3 w-3" />
                  {headerInfo.actionBtn}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
