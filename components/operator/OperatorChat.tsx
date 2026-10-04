'use client';

import * as React from 'react';
import {
  ArrowUp,
  Loader2,
  Command,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage, ApprovalItem, TaskItem } from '@/lib/types';
import { ChatApprovalCard } from './ChatApprovalCard';
import {
  CalendarResultsCard,
  EmailResultsCard,
  DriveResultsCard,
  TasksResultsCard,
  BriefingCard,
} from './ContextualCards';
import type { User } from 'firebase/auth';

interface OperatorChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  accessToken: string | null;
  user: User | null;
  onSignIn: () => void;
  onApprovalExecuted: (updatedApproval: ApprovalItem) => void;
  onApprovalCancelled: (approvalId: string) => void;
  onToggleTask?: (taskId: string, currentStatus: TaskItem['status']) => void;
}

export function OperatorChat({
  messages,
  onSendMessage,
  isLoading,
  accessToken,
  user,
  onSignIn,
  onApprovalExecuted,
  onApprovalCancelled,
  onToggleTask,
}: OperatorChatProps) {
  const [input, setInput] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ⌘K keyboard shortcut to focus the composer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTIONS = [
    { label: 'Email Drew about the upcoming meeting', query: 'Email Drew about the upcoming meeting' },
    { label: 'Move my meeting with John tomorrow to 3 PM', query: 'Move my meeting with John tomorrow to 3 PM' },
    { label: 'What do I need to respond to today?', query: 'What do I need to respond to today?' },
    { label: 'Find the document Sarah sent me about authentication', query: 'Find the document Sarah sent me about authentication' },
    { label: 'Create tasks from anything I promised people this week', query: 'Create tasks from anything I promised people this week' },
    { label: 'Prepare me for my next meeting', query: 'Prepare me for my next meeting' },
  ];

  return (
    <div className="relative flex flex-1 flex-col h-full overflow-hidden bg-black text-zinc-100 font-sans">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 ? (
            /* Pristine Minimalist Empty State */
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center pt-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xs bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-sm font-bold shadow-xs">
                Ø
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                What do you want to do?
              </h1>

              <p className="mt-2 text-xs font-mono text-zinc-400 max-w-md">
                Type natural instructions. Operator reasons across your Calendar, Gmail, Drive, Contacts, and Tasks.
              </p>

              {/* Dynamic Suggestion Chips */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl text-left">
                {SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(item.query);
                      textareaRef.current?.focus();
                    }}
                    className="flex items-center justify-between rounded-md border border-zinc-850/80 bg-zinc-950/60 p-3 text-xs text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60 hover:text-white transition-all cursor-pointer group"
                  >
                    <span className="truncate pr-2 font-medium">{item.label}</span>
                    <span className="font-mono text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      ↵
                    </span>
                  </button>
                ))}
              </div>

              {!user && (
                <div className="mt-8 rounded-md border border-zinc-800 bg-zinc-950 p-3 max-w-md text-center">
                  <p className="text-xs text-zinc-400 mb-2">
                    Connect your real Google Account to inspect calendar, draft emails, and manage tasks.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSignIn}
                    className="h-8 border-zinc-750 text-xs text-zinc-200 hover:bg-zinc-900 hover:text-white"
                  >
                    <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-blue-400" />
                    Sign in with Google
                  </Button>
                </div>
              )}
            </div>
          ) : (
            /* Render Conversation Messages */
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div className="flex items-center gap-2 px-1">
                    <span className="font-mono text-[10px] uppercase font-semibold text-zinc-400">
                      {isUser ? 'You' : 'Operator'}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'rounded-lg bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-zinc-100'
                        : 'w-full text-zinc-200'
                    }`}
                  >
                    {/* Message Text */}
                    {msg.content && (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}

                    {/* Contextual Card: Calendar */}
                    {msg.calendarResults && msg.calendarResults.length > 0 && (
                      <CalendarResultsCard events={msg.calendarResults} />
                    )}

                    {/* Contextual Card: Gmail Threads */}
                    {msg.emailResults && msg.emailResults.length > 0 && (
                      <EmailResultsCard
                        emails={msg.emailResults}
                        onReplyPrompt={(em) => {
                          setInput(`Email ${em.senderName} about "${em.subject}"`);
                          textareaRef.current?.focus();
                        }}
                      />
                    )}

                    {/* Contextual Card: Google Drive */}
                    {msg.fileResults && msg.fileResults.length > 0 && (
                      <DriveResultsCard files={msg.fileResults} />
                    )}

                    {/* Contextual Card: Google Tasks */}
                    {msg.taskResults && msg.taskResults.length > 0 && (
                      <TasksResultsCard
                        tasks={msg.taskResults}
                        onToggleTask={onToggleTask}
                      />
                    )}

                    {/* Contextual Card: Meeting Briefing */}
                    {msg.briefingResult && (
                      <BriefingCard briefing={msg.briefingResult} />
                    )}

                    {/* Inline Action Approval Card */}
                    {msg.approval && (
                      <ChatApprovalCard
                        key={msg.approval.id + '-' + (msg.approval.payload.body?.length || 0)}
                        approval={msg.approval}
                        accessToken={accessToken}
                        onExecuted={onApprovalExecuted}
                        onCancel={onApprovalCancelled}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex flex-col items-start space-y-1.5">
              <span className="font-mono text-[10px] uppercase font-semibold text-zinc-400">
                Operator
              </span>
              <div className="flex items-center gap-2 rounded-md border border-zinc-850 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-300" />
                <span>Reasoning across your Google account...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer Section (The center of the product) */}
      <div className="border-t border-zinc-850/80 bg-zinc-950/90 backdrop-blur-md p-3 sm:p-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-lg border border-zinc-800 bg-zinc-900/60 shadow-lg focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700 transition-all">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you want to do? (e.g. Email Drew about the meeting, move calendar to 3 PM...)"
              rows={2}
              className="w-full resize-none border-0 bg-transparent px-3.5 py-3 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-0 leading-relaxed font-sans"
            />

            {/* Bottom Bar inside composer */}
            <div className="flex items-center justify-between border-t border-zinc-850/60 px-3 py-2">
              <div className="flex items-center gap-2">
                {user ? (
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-400">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="truncate max-w-[200px] sm:max-w-xs">{user.email}</span>
                  </div>
                ) : (
                  <button
                    onClick={onSignIn}
                    className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>Connect Google Account</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-800 bg-zinc-850/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                  <Command className="h-2.5 w-2.5" />K
                </kbd>

                <Button
                  size="icon-xs"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="h-7 w-7 rounded-md bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-40 cursor-pointer"
                  title="Send instruction"
                >
                  <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
