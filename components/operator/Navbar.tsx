'use client';

import * as React from 'react';
import {
  Search,
  Command,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogOut,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { googleSignIn, logout } from '@/lib/firebase';
import type { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  onUserChange: (user: User | null, token: string | null) => void;
  onOpenCommandBar: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  activeTab: string;
  hasLiveToken: boolean;
}

export function Navbar({
  user,
  onUserChange,
  onOpenCommandBar,
  onRefreshData,
  isRefreshing,
  activeTab,
  hasLiveToken,
}: NavbarProps) {
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const [time, setTime] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const res = await googleSignIn();
      if (res) {
        onUserChange(res.user, res.accessToken);
      }
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onUserChange(null, null);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-850/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-xs bg-zinc-100 font-mono text-[10px] font-bold text-zinc-950 select-none">
              Ø
            </span>
            <span className="font-mono text-xs font-semibold tracking-wider text-zinc-100 uppercase">
              Operator
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ONLINE</span>
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-400 tabular-nums">{time || '09:52:00 AM'}</span>
          </div>
        </div>

        {/* Center: Command Bar Trigger */}
        <div className="flex-1 max-w-md mx-4">
          <button
            onClick={onOpenCommandBar}
            className="flex w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200 cursor-pointer group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300" />
              <span className="truncate">Ask Operator anything or jump to view...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-750 bg-zinc-850 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>
        </div>

        {/* Right: Workspace Connection & Auth */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onRefreshData}
            disabled={isRefreshing}
            title="Refresh Workspace Data"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-zinc-400 ${isRefreshing ? 'animate-spin text-zinc-100' : ''}`}
            />
          </Button>

          {/* Integration pill */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-md border border-zinc-800/80 bg-zinc-900/40 px-2 py-1 text-[11px] font-mono text-zinc-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Workspace 1P</span>
            <span className="text-[10px] text-zinc-500">
              {hasLiveToken ? '(Live OAuth)' : '(Active)'}
            </span>
          </div>

          {/* User auth or Sign-in button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-0.5 ring-1 ring-zinc-800 hover:ring-zinc-600 transition-all cursor-pointer">
                  <Avatar className="h-6 w-6">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                    <AvatarFallback className="text-[10px]">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 font-mono text-xs">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-medium text-zinc-200 truncate">
                      {user.displayName || 'Executive'}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-zinc-300">
                  <Sparkles className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                  Gemini Operations
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-zinc-300"
                  onClick={() =>
                    window.open('https://myaccount.google.com/permissions', '_blank')
                  }
                >
                  <ExternalLink className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                  Google Permissions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:text-red-300">
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
