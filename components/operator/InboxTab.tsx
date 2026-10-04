'use client';

import * as React from 'react';
import {
  Mail,
  Send,
  CheckSquare,
  Archive,
  Search,
  Plus,
  Sparkles,
  AlertCircle,
  Clock,
  Filter,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmailItem, ApprovalItem } from '@/lib/types';

interface InboxTabProps {
  emails: EmailItem[];
  onInitiateApproval: (approval: ApprovalItem) => void;
  onQuickDraft: (email: EmailItem) => void;
  onArchiveEmail: (emailId: string) => void;
  onOpenCompose: () => void;
}

export function InboxTab({
  emails,
  onInitiateApproval,
  onQuickDraft,
  onArchiveEmail,
  onOpenCompose,
}: InboxTabProps) {
  const [filter, setFilter] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [selectedEmail, setSelectedEmail] = React.useState<EmailItem | null>(
    emails[0] || null
  );

  const filteredEmails = emails.filter((e) => {
    if (filter === 'needs_response' && e.category !== 'needs_response') return false;
    if (filter === 'waiting_on' && e.category !== 'waiting_on') return false;
    if (filter === 'urgent' && e.priority !== 'urgent') return false;
    if (
      searchQuery &&
      !e.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.senderName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.snippet.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
        <div>
          <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            <span>Inbox Intelligence</span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {emails.length} threads processed
            </Badge>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gmail transformed into actionable decisions, commitments, and drafted responses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={onOpenCompose}
            className="gap-1.5 font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Compose with Approval</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'needs_response', label: 'Needs Response' },
            { id: 'urgent', label: 'Urgent' },
            { id: 'waiting_on', label: 'Waiting On' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-zinc-850 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email intelligence..."
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      {/* Split view: Email list (left) & Intelligence detail (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-1">
        {/* List */}
        <div className="lg:col-span-5 space-y-2 max-h-[680px] overflow-y-auto pr-1">
          {filteredEmails.map((email) => {
            const isSelected = selectedEmail?.id === email.id;
            return (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`p-3 rounded-md border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-zinc-500 bg-zinc-900/80 shadow-xs'
                    : 'border-zinc-850 bg-zinc-950 hover:border-zinc-750 hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-xs text-zinc-100 truncate">
                    {email.senderName}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {email.priority === 'urgent' && (
                      <Badge variant="urgent" className="text-[9px] px-1 py-0">
                        Urgent
                      </Badge>
                    )}
                    <span className="font-mono text-[10px] text-zinc-500">
                      {email.timeAgo}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-medium text-zinc-200 truncate mb-1">
                  {email.subject}
                </p>

                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {email.aiSummary || email.snippet}
                </p>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-7">
          {selectedEmail ? (
            <div className="rounded-md border border-zinc-800 bg-zinc-950 p-5 space-y-4">
              {/* Sender & Meta Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-zinc-850">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 leading-tight">
                    {selectedEmail.subject}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400 font-mono">
                    <span className="text-zinc-200 font-medium">
                      {selectedEmail.senderName}
                    </span>
                    <span>&lt;{selectedEmail.senderEmail}&gt;</span>
                    <span className="text-zinc-600">·</span>
                    <span>{selectedEmail.timeAgo}</span>
                  </div>
                </div>

                <Badge
                  variant={selectedEmail.priority === 'urgent' ? 'urgent' : 'outline'}
                  className="font-mono text-[10px] uppercase"
                >
                  {selectedEmail.category.replace('_', ' ')}
                </Badge>
              </div>

              {/* Operator AI Extraction Insight */}
              <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase text-zinc-300">
                  <Sparkles className="h-3.5 w-3.5 text-zinc-300" />
                  <span>Operator Extraction</span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                  {selectedEmail.aiSummary ||
                    'Actionable request extracted from sender message.'}
                </p>
              </div>

              {/* Email Full Body */}
              <div className="rounded-md border border-zinc-900 bg-zinc-950 p-4 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {selectedEmail.fullBody || selectedEmail.snippet}
              </div>

              {/* Action Proposals */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-850">
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onQuickDraft(selectedEmail)}
                    className="gap-1.5 font-semibold"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Review Draft Reply</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onInitiateApproval({
                        id: `app-task-${selectedEmail.id}`,
                        actionType: 'create_task',
                        title: `Follow up with ${selectedEmail.senderName}`,
                        summary: `Create task from email "${selectedEmail.subject}"`,
                        payload: {
                          taskTitle: `Follow up with ${selectedEmail.senderName} regarding ${selectedEmail.subject}`,
                          dueDate: 'Today',
                        },
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                      });
                    }}
                    className="gap-1.5"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>Convert to Task</span>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onArchiveEmail(selectedEmail.id)}
                  className="text-zinc-400 hover:text-zinc-200 gap-1.5"
                >
                  <Archive className="h-3.5 w-3.5" />
                  <span>Archive</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-zinc-850 p-12 text-center text-zinc-500 text-xs">
              Select an email thread to inspect intelligence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
