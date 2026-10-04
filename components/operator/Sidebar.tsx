'use client';

import * as React from 'react';
import {
  Plus,
  MessageSquare,
  History,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from 'firebase/auth';

interface ConversationMeta {
  id: string;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isSigningIn: boolean;
  hasLiveToken: boolean;
  conversations: ConversationMeta[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onOpenActivity: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  user,
  onSignIn,
  onSignOut,
  isSigningIn,
  hasLiveToken,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onOpenActivity,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside
      className={`relative flex flex-col border-r border-zinc-850 bg-zinc-950 transition-all duration-200 select-none ${
        isCollapsed ? 'w-14' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div className="flex h-12 items-center justify-between border-b border-zinc-850 px-3">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-xs bg-zinc-100 font-mono text-[10px] font-bold text-zinc-950">
              Ø
            </span>
            <span className="font-mono text-xs font-semibold tracking-wider text-zinc-100 uppercase">
              Operator
            </span>
          </div>
        )}

        {isCollapsed && (
          <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-xs bg-zinc-100 font-mono text-xs font-bold text-zinc-950">
            Ø
          </span>
        )}

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onToggleCollapse}
          className="text-zinc-400 hover:text-white"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* New Conversation Button */}
      <div className="p-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onNewConversation}
          className={`w-full justify-start gap-2 border-zinc-800 bg-zinc-900/60 text-xs text-zinc-200 hover:bg-zinc-850 hover:text-white cursor-pointer ${
            isCollapsed ? 'px-0 justify-center' : ''
          }`}
          title="New conversation"
        >
          <Plus className="h-3.5 w-3.5 shrink-0" />
          {!isCollapsed && <span>New conversation</span>}
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {!isCollapsed && (
          <div className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            Recent
          </div>
        )}

        {conversations.length === 0 ? (
          !isCollapsed && (
            <div className="px-2 py-3 text-center font-mono text-[11px] text-zinc-400">
              No conversations yet
            </div>
          )
        ) : (
          conversations.map((c) => {
            const isActive = c.id === activeConversationId;
            return (
              <div
                key={c.id}
                className={`group flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                }`}
                onClick={() => onSelectConversation(c.id)}
                title={c.title}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-zinc-400 group-hover:text-zinc-300" />
                  {!isCollapsed && <span className="truncate">{c.title || 'Conversation'}</span>}
                </div>

                {!isCollapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-400 p-0.5 transition-opacity"
                    title="Delete thread"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Audit Log / Activity Button */}
      <div className="border-t border-zinc-850 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onOpenActivity}
          className={`w-full justify-start gap-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 cursor-pointer ${
            isCollapsed ? 'px-0 justify-center' : ''
          }`}
          title="Activity & Audit Log"
        >
          <History className="h-3.5 w-3.5 shrink-0" />
          {!isCollapsed && <span>Activity & Audit</span>}
        </Button>
      </div>

      {/* Account / Auth Profile Footer */}
      <div className="border-t border-zinc-850 p-2.5 bg-zinc-950/60">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex w-full items-center gap-2.5 rounded-md p-1.5 transition-colors hover:bg-zinc-900 cursor-pointer text-left ${
                  isCollapsed ? 'justify-center p-0' : ''
                }`}
              >
                <Avatar className="h-7 w-7 ring-1 ring-zinc-800 shrink-0">
                  {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                  <AvatarFallback className="text-xs bg-zinc-850 text-zinc-200">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                {!isCollapsed && (
                  <div className="flex-1 truncate">
                    <p className="truncate text-xs font-medium text-zinc-200">
                      {user.displayName || 'Google User'}
                    </p>
                    <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>{hasLiveToken ? 'Connected' : 'Signed In'}</span>
                    </div>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 font-mono text-xs">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-medium text-zinc-200 truncate">{user.displayName}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-zinc-300"
                onClick={() => window.open('https://myaccount.google.com/permissions', '_blank')}
              >
                <ExternalLink className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                Google Permissions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut} className="text-red-400 focus:text-red-300">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onSignIn}
            disabled={isSigningIn}
            className={`w-full justify-start gap-2 border-zinc-800 bg-zinc-900 text-xs text-zinc-200 hover:text-white cursor-pointer ${
              isCollapsed ? 'px-0 justify-center' : ''
            }`}
            title="Sign in with Google"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            {!isCollapsed && <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>}
          </Button>
        )}
      </div>
    </aside>
  );
}
