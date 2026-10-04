'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  AlertCircle,
  FileText,
  Mail,
  Calendar,
  CheckSquare,
  Bot,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (query: string) => void;
  onNavigateTab: (tab: string) => void;
}

const PRESET_QUERIES = [
  {
    icon: <AlertCircle className="h-3.5 w-3.5 text-zinc-300" />,
    label: 'What actually needs my attention today?',
    category: 'Operational Brief',
  },
  {
    icon: <Briefcase className="h-3.5 w-3.5 text-zinc-300" />,
    label: 'Show me everything related to LaunchStack',
    category: 'Cross-Service Search',
  },
  {
    icon: <Clock className="h-3.5 w-3.5 text-zinc-300" />,
    label: 'What promises did I make this week?',
    category: 'Commitments',
  },
  {
    icon: <Calendar className="h-3.5 w-3.5 text-zinc-300" />,
    label: 'Prepare me for my next meeting',
    category: 'Meeting Intelligence',
  },
  {
    icon: <CheckSquare className="h-3.5 w-3.5 text-zinc-300" />,
    label: 'What am I waiting on from other people?',
    category: 'Pending Blockers',
  },
  {
    icon: <FileText className="h-3.5 w-3.5 text-zinc-300" />,
    label: 'Find the document where we discussed pricing',
    category: 'Drive Intelligence',
  },
  {
    icon: <Mail className="h-3.5 w-3.5 text-zinc-300" />,
    label: 'Draft responses to everything that actually needs a reply',
    category: 'Action Proposals',
  },
];

const NAVIGATION_ITEMS = [
  { id: 'today', label: 'Go to Today Overview', shortcut: '1' },
  { id: 'inbox', label: 'Go to Inbox Intelligence', shortcut: '2' },
  { id: 'calendar', label: 'Go to Calendar & Prep', shortcut: '3' },
  { id: 'tasks', label: 'Go to Tasks & Commitments', shortcut: '4' },
  { id: 'projects', label: 'Go to Projects', shortcut: '5' },
  { id: 'people', label: 'Go to People Context', shortcut: '6' },
  { id: 'ask', label: 'Ask Operator (Chat & Grounding)', shortcut: '7' },
  { id: 'activity', label: 'Go to Activity Log', shortcut: '8' },
];

export function CommandBar({
  isOpen,
  onClose,
  onExecuteCommand,
  onNavigateTab,
}: CommandBarProps) {
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        setQuery('');
        setSelectedIndex(0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const filteredPresets = PRESET_QUERIES.filter((q) =>
    q.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredNav = NAVIGATION_ITEMS.filter((n) =>
    n.label.toLowerCase().includes(query.toLowerCase())
  );

  const totalItems = filteredPresets.length + filteredNav.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (totalItems || 1)) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim() && totalItems === 0) {
        onExecuteCommand(query);
        onClose();
        return;
      }
      if (selectedIndex < filteredPresets.length) {
        onExecuteCommand(filteredPresets[selectedIndex].label);
        onClose();
      } else {
        const navIndex = selectedIndex - filteredPresets.length;
        if (filteredNav[navIndex]) {
          onNavigateTab(filteredNav[navIndex].id);
          onClose();
        }
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 max-w-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden rounded-lg">
        {/* Input Bar */}
        <div className="flex items-center gap-3 border-b border-zinc-850 px-4 py-3 bg-zinc-900/40">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command across your entire Google Workspace..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden font-sans"
          />
          {query.trim() && (
            <button
              onClick={() => {
                onExecuteCommand(query);
                onClose();
              }}
              className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-950 hover:bg-white cursor-pointer"
            >
              <span>Ask</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 font-sans divide-y divide-zinc-900/60">
          {/* Custom query prompt hint */}
          {query.trim() && (
            <div
              onClick={() => {
                onExecuteCommand(query);
                onClose();
              }}
              className="flex items-center justify-between p-2.5 rounded-md text-xs text-zinc-200 hover:bg-zinc-900 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-zinc-300" />
                <span>
                  Query Workspace intelligence:{' '}
                  <span className="font-semibold text-zinc-100">&ldquo;{query}&rdquo;</span>
                </span>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                Gemini 3.5
              </Badge>
            </div>
          )}

          {/* Preset Executive Operations */}
          {filteredPresets.length > 0 && (
            <div className="py-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Operations & Synthesis
              </div>
              {filteredPresets.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.label}
                    onClick={() => {
                      onExecuteCommand(item.label);
                      onClose();
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-850 text-zinc-100'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="opacity-70">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {item.category}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Navigation */}
          {filteredNav.length > 0 && (
            <div className="py-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Navigation
              </div>
              {filteredNav.map((nav, idx) => {
                const itemIndex = filteredPresets.length + idx;
                const isSelected = itemIndex === selectedIndex;
                return (
                  <div
                    key={nav.id}
                    onClick={() => {
                      onNavigateTab(nav.id);
                      onClose();
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-850 text-zinc-100'
                        : 'text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{nav.label}</span>
                    </div>
                    <kbd className="font-mono text-[10px] text-zinc-500 border border-zinc-800 rounded px-1">
                      {nav.shortcut}
                    </kbd>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-zinc-850 bg-zinc-950 px-3 py-1.5 text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </div>
          <span>Operator Intelligence Layer</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
