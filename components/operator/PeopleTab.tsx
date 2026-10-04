'use client';

import * as React from 'react';
import {
  Users,
  Mail,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ContactItem, ApprovalItem } from '@/lib/types';

interface PeopleTabProps {
  contacts: ContactItem[];
  onInitiateApproval: (approval: ApprovalItem) => void;
}

export function PeopleTab({ contacts, onInitiateApproval }: PeopleTabProps) {
  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
        <div>
          <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            <span>People & Relationship Context</span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {contacts.length} core collaborators
            </Badge>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Google Contacts synthesized with email cadence, meeting participation, and shared document activity.
          </p>
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-3 transition-all hover:border-zinc-700 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header: Avatar, Name, Company */}
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9 rounded-md border border-zinc-700">
                  <AvatarFallback className="font-mono text-xs font-semibold bg-zinc-900 text-zinc-200">
                    {contact.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-0.5 truncate">
                  <h3 className="text-xs font-semibold text-zinc-100 truncate">
                    {contact.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {contact.role}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                    <Building className="h-2.5 w-2.5" />
                    <span>{contact.company}</span>
                  </p>
                </div>
              </div>

              {/* Relationship Summary */}
              <div className="rounded-md border border-zinc-850 bg-zinc-900/40 p-2.5 text-xs text-zinc-300 leading-relaxed font-sans">
                <p>{contact.relationshipSummary}</p>
              </div>

              {/* Topics & Meta */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>LAST INTERACTION:</span>
                  <span className="text-zinc-400">{contact.lastInteraction}</span>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {contact.recentTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-[9px] text-zinc-300"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-500">
                {contact.openThreadsCount} open threads
              </span>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    onInitiateApproval({
                      id: `app-email-${contact.id}`,
                      actionType: 'send_email',
                      title: `Draft message to ${contact.name}`,
                      summary: `Send quick email update to ${contact.name}`,
                      payload: {
                        recipient: contact.email,
                        subject: `Sync & Update`,
                        body: `Hi ${contact.name.split(' ')[0]},\n\nHope your week is going well. Let me know if you have time for a quick operational sync today.\n\nBest,\nDrew`,
                      },
                      status: 'pending',
                      createdAt: new Date().toISOString(),
                    });
                  }}
                  className="gap-1 font-mono text-[10px]"
                >
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
