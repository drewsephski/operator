'use client';

import * as React from 'react';
import {
  History,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ActivityLogItem } from '@/lib/types';

interface ActivityTabProps {
  activities: ActivityLogItem[];
}

export function ActivityTab({ activities }: ActivityTabProps) {
  const [filter, setFilter] = React.useState<string>('all');

  const filtered = activities.filter((act) => {
    if (filter === 'completed' && act.status !== 'completed') return false;
    if (filter === 'approved' && act.status !== 'approved') return false;
    return true;
  });

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
        <div>
          <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            <span>Audit & Activity Log</span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {activities.length} entries
            </Badge>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            A transparent, chronological record of what Operator suggested, what the user approved, and what external operations executed.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          {['all', 'completed', 'approved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-zinc-850 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-2.5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between p-3.5 rounded-md border border-zinc-850 bg-zinc-950 hover:border-zinc-750 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-zinc-100">
                    {item.action}
                  </span>
                  <Badge variant="outline" className="text-[9px] font-mono">
                    {item.actor}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {item.details}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] text-zinc-500">
                {item.timestamp}
              </span>
              <Badge
                variant={item.status === 'completed' ? 'success' : 'outline'}
                className="font-mono text-[9px] uppercase"
              >
                {item.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
