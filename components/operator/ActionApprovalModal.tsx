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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Mail,
  Calendar,
  CheckSquare,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ApprovalItem } from '@/lib/types';

interface ActionApprovalModalProps {
  isOpen: boolean;
  approval: ApprovalItem | null;
  onClose: () => void;
  onApprove: (updatedPayload?: any) => Promise<void>;
  onDismiss: () => void;
}

export function ActionApprovalModal({
  isOpen,
  approval,
  onClose,
  onApprove,
  onDismiss,
}: ActionApprovalModalProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedRecipient, setEditedRecipient] = React.useState<string | null>(null);
  const [editedSubject, setEditedSubject] = React.useState<string | null>(null);
  const [editedBody, setEditedBody] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const recipient = editedRecipient ?? (approval?.payload?.recipient || '');
  const subject = editedSubject ?? (approval?.payload?.subject || approval?.title || '');
  const body = editedBody ?? (approval?.payload?.body || approval?.summary || '');

  const handleClose = () => {
    setIsEditing(false);
    setEditedRecipient(null);
    setEditedSubject(null);
    setEditedBody(null);
    onClose();
  };

  if (!approval) return null;

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await onApprove({
        ...approval.payload,
        recipient,
        subject,
        body,
      });
      handleClose();
    } catch (err) {
      console.error('Approval execution failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionIcon = () => {
    switch (approval.actionType) {
      case 'send_email':
        return <Mail className="h-4 w-4 text-zinc-300" />;
      case 'reschedule_meeting':
        return <Calendar className="h-4 w-4 text-zinc-300" />;
      case 'create_task':
        return <CheckSquare className="h-4 w-4 text-zinc-300" />;
      case 'update_doc':
        return <FileText className="h-4 w-4 text-zinc-300" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-zinc-300" />;
    }
  };

  const getActionLabel = () => {
    switch (approval.actionType) {
      case 'send_email':
        return 'Send Email';
      case 'reschedule_meeting':
        return 'Update Calendar';
      case 'create_task':
        return 'Create Google Task';
      case 'update_doc':
        return 'Update Document';
      default:
        return 'External Mutation';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-zinc-950 border border-zinc-800 text-zinc-100 p-5 font-sans">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-zinc-900 border border-zinc-800">
                {getActionIcon()}
              </span>
              <DialogTitle className="text-sm font-mono tracking-tight font-semibold uppercase text-zinc-200">
                {getActionLabel()}
              </DialogTitle>
            </div>
            <Badge variant="urgent" className="text-[10px]">
              Explicit Approval Required
            </Badge>
          </div>
          <DialogDescription className="text-xs text-zinc-400 mt-1">
            Operator requires your explicit consent before modifying data outside of this workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          {/* Email / Target Parameters */}
          {approval.actionType === 'send_email' && (
            <div className="rounded-md border border-zinc-850 bg-zinc-900/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-zinc-500 w-12 text-[11px]">To:</span>
                {isEditing ? (
                  <Input
                    value={recipient}
                    onChange={(e) => setEditedRecipient(e.target.value)}
                    className="h-7 text-xs"
                  />
                ) : (
                  <span className="font-mono text-zinc-200">{recipient || 'Recipient'}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-zinc-500 w-12 text-[11px]">Re:</span>
                {isEditing ? (
                  <Input
                    value={subject}
                    onChange={(e) => setEditedSubject(e.target.value)}
                    className="h-7 text-xs"
                  />
                ) : (
                  <span className="font-medium text-zinc-300">{subject}</span>
                )}
              </div>
            </div>
          )}

          {/* Action Body Preview / Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>PROPOSED PAYLOAD:</span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
              >
                {isEditing ? 'Preview' : 'Edit content'}
              </button>
            </div>

            {isEditing ? (
              <Textarea
                rows={6}
                value={body}
                onChange={(e) => setEditedBody(e.target.value)}
                className="font-mono text-xs bg-zinc-900 text-zinc-100"
              />
            ) : (
              <div className="relative rounded-md border border-zinc-800 bg-zinc-900/40 p-3.5 text-zinc-200 font-mono text-xs leading-relaxed whitespace-pre-wrap border-l-2 border-l-zinc-400">
                {body}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            <span>Traceable source: Generated from authorized Google Workspace context.</span>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-3 border-t border-zinc-900">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-zinc-400 hover:text-zinc-200"
          >
            Dismiss
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Done Editing' : 'Edit'}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleApprove}
              disabled={isSubmitting}
              className="gap-1.5 font-semibold"
            >
              <span>{approval.actionType === 'send_email' ? 'Approve & Send' : 'Approve & Execute'}</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
