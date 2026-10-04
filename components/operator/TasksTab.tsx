'use client';

import * as React from 'react';
import {
  CheckSquare,
  Plus,
  Sparkles,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TaskItem, CommitmentItem, ApprovalItem } from '@/lib/types';

interface TasksTabProps {
  tasks: TaskItem[];
  commitments: CommitmentItem[];
  onAddTask: (title: string, priority: 'p1' | 'p2' | 'p3', due?: string) => void;
  onCompleteTask: (taskId: string) => void;
  onInitiateApproval: (approval: ApprovalItem) => void;
}

export function TasksTab({
  tasks,
  commitments,
  onAddTask,
  onCompleteTask,
  onInitiateApproval,
}: TasksTabProps) {
  const [newTitle, setNewTitle] = React.useState('');
  const [newPriority, setNewPriority] = React.useState<'p1' | 'p2' | 'p3'>('p1');
  const [filter, setFilter] = React.useState<string>('all');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), newPriority, 'Today');
    setNewTitle('');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'p1' && t.priority !== 'p1') return false;
    if (filter === 'ai_discovered' && t.source !== 'gemini_extracted') return false;
    if (filter === 'completed' && t.status !== 'completed') return false;
    if (filter !== 'completed' && t.status === 'completed') return false;
    return true;
  });

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
        <div>
          <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            <span>Unified Task Intelligence</span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {tasks.length} tasks synced
            </Badge>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Google Tasks synced seamlessly with commitments Gemini extracted from email threads and meeting notes.
          </p>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form
        onSubmit={handleCreate}
        className="flex items-center gap-2 p-2 rounded-lg border border-zinc-800 bg-zinc-950 shadow-xs"
      >
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add an actionable task or delegation..."
          className="border-0 bg-transparent text-xs focus-visible:ring-0 focus-visible:border-0 shadow-none px-2"
        />

        <div className="flex items-center gap-1.5 shrink-0 pr-1">
          <select
            value={newPriority}
            onChange={(e: any) => setNewPriority(e.target.value)}
            className="h-7 rounded border border-zinc-800 bg-zinc-900 px-2 text-[11px] font-mono text-zinc-300 focus:outline-hidden cursor-pointer"
          >
            <option value="p1">P1 Urgent</option>
            <option value="p2">P2 Medium</option>
            <option value="p3">P3 Normal</option>
          </select>

          <Button type="submit" size="xs" variant="default" className="font-semibold gap-1">
            <Plus className="h-3 w-3" />
            <span>Add Task</span>
          </Button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5">
        {[
          { id: 'all', label: 'Active Tasks' },
          { id: 'p1', label: 'P1 Urgent' },
          { id: 'ai_discovered', label: 'Gemini Discovered' },
          { id: 'completed', label: 'Completed' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              filter === t.id
                ? 'bg-zinc-850 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => {
          const isDone = task.status === 'completed';
          return (
            <div
              key={task.id}
              className={`flex items-start justify-between p-3 rounded-md border transition-all ${
                isDone
                  ? 'border-zinc-900 bg-zinc-950/40 opacity-60'
                  : 'border-zinc-850 bg-zinc-950 hover:border-zinc-750'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onCompleteTask(task.id)}
                  className={`mt-0.5 h-4 w-4 rounded-xs border flex items-center justify-center transition-colors cursor-pointer ${
                    isDone
                      ? 'border-zinc-400 bg-zinc-100 text-zinc-950'
                      : 'border-zinc-700 hover:border-zinc-400 bg-zinc-900/60'
                  }`}
                >
                  {isDone && <CheckCircle2 className="h-3 w-3" />}
                </button>

                <div className="space-y-1">
                  <p
                    className={`text-xs font-medium leading-snug ${
                      isDone ? 'line-through text-zinc-500' : 'text-zinc-100'
                    }`}
                  >
                    {task.title}
                  </p>

                  {task.notes && (
                    <p className="text-[11px] text-zinc-400 font-sans">
                      {task.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-500">
                    <span>Due: {task.due || 'Today'}</span>
                    {task.source === 'gemini_extracted' ? (
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        Discovered from {task.sourceContext?.type || 'Workspace'}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0">
                        Google Tasks
                      </Badge>
                    )}
                    {task.counterpart && <span>with {task.counterpart}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant={task.priority === 'p1' ? 'urgent' : 'outline'}
                  className="font-mono text-[9px] uppercase"
                >
                  {task.priority}
                </Badge>

                {task.counterpart && !isDone && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      onInitiateApproval({
                        id: `app-task-nudge-${task.id}`,
                        actionType: 'send_email',
                        title: `Nudge ${task.counterpart}`,
                        summary: `Send quick check-in email about "${task.title}"`,
                        payload: {
                          recipient: `${(task.counterpart || 'sarah.chen').toLowerCase().replace(' ', '.')}@acme.corp`,
                          subject: `Check-in: ${task.title}`,
                          body: `Hi ${task.counterpart || 'there'},\n\nFollowing up on our progress regarding "${task.title}". Let me know if you need anything from my side.\n\nBest,\nDrew`,
                        },
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                      });
                    }}
                    className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200"
                  >
                    Nudge
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="rounded-md border border-zinc-850 p-8 text-center text-zinc-500 text-xs">
            No tasks found in this view.
          </div>
        )}
      </div>
    </div>
  );
}
