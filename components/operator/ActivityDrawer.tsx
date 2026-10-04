'use client';

import * as React from 'react';
import { X, History, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivityLogItem } from '@/lib/types';

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityLogItem[];
  onClearHistory?: () => void;
}

export function ActivityDrawer({
  isOpen,
  onClose,
  activities,
  onClearHistory,
}: ActivityDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="h-full w-full max-w-md border-l border-zinc-800 bg-zinc-950 p-5 shadow-2xl flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-zinc-100" />
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-100">
              Audit & Activity Log
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {activities.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400 font-mono">
              <Shield className="mx-auto h-6 w-6 text-zinc-400 mb-2 opacity-60" />
              <p>No activity recorded yet.</p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Actions executed through Operator will be audited here.
              </p>
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                className="rounded-md border border-zinc-850/80 bg-zinc-900/30 p-3 space-y-1.5 text-xs transition-colors hover:border-zinc-800"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-200">{act.action}</span>
                  <span className="font-mono text-[10px] text-zinc-400">{act.timestamp}</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{act.details}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="font-mono text-[10px] uppercase text-zinc-400">
                    {act.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {activities.length > 0 && onClearHistory && (
          <div className="border-t border-zinc-850 pt-3 flex justify-between items-center">
            <span className="font-mono text-[11px] text-zinc-400">
              {activities.length} total events
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-[11px] text-zinc-400 hover:text-red-400"
            >
              Clear log
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
