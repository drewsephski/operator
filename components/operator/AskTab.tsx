'use client';

import * as React from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Zap,
  Globe,
  MapPin,
  Brain,
  Video,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  FileVideo,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  EmailItem,
  CalendarEventItem,
  TaskItem,
  DriveFileItem,
  CommitmentItem,
} from '@/lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  groundingChunks?: any[];
  timestamp: string;
}

interface AskTabProps {
  emails: EmailItem[];
  meetings: CalendarEventItem[];
  tasks: TaskItem[];
  files: DriveFileItem[];
  commitments: CommitmentItem[];
  initialPrompt?: string;
}

export function AskTab({
  emails,
  meetings,
  tasks,
  files,
  commitments,
  initialPrompt,
}: AskTabProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Operator Intelligence online. I have synthesized your authorized Google Workspace (Gmail, Calendar, Drive, Tasks, Contacts). Ask cross-service questions, query commitments, draft proposals, or invoke high-thinking reasoning.',
      timestamp: 'Now',
    },
  ]);
  const [input, setInput] = React.useState('');
  const [modelType, setModelType] = React.useState<'general' | 'high_thinking' | 'low_latency'>('general');
  const [useSearchGrounding, setUseSearchGrounding] = React.useState(false);
  const [useMapsGrounding, setUseMapsGrounding] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Video understanding state
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
  const [videoTitle, setVideoTitle] = React.useState('LaunchStack Architecture Walkthrough.mp4');
  const [videoAnalysis, setVideoAnalysis] = React.useState<any>(null);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = React.useState(false);

  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle external query trigger (e.g. from Command Bar)
  React.useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const assembleWorkspaceContext = () => {
    return `
Emails (${emails.length}): ${JSON.stringify(
      emails.map((e) => ({ from: e.senderName, subject: e.subject, snippet: e.snippet, priority: e.priority }))
    )}
Calendar Events (${meetings.length}): ${JSON.stringify(
      meetings.map((m) => ({ title: m.title, time: `${m.startTime}-${m.endTime}`, attendees: m.attendees.map(a => a.name) }))
    )}
Tasks (${tasks.length}): ${JSON.stringify(
      tasks.map((t) => ({ title: t.title, due: t.due, priority: t.priority, source: t.source }))
    )}
Drive Files (${files.length}): ${JSON.stringify(
      files.map((f) => ({ name: f.name, type: f.fileType, modified: f.timeAgo }))
    )}
Commitments (${commitments.length}): ${JSON.stringify(
      commitments.map((c) => ({ title: c.title, type: c.type, counterpart: c.counterpart }))
    )}
`.trim();
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      let userLocation: any = null;
      if (useMapsGrounding && typeof navigator !== 'undefined' && navigator.geolocation) {
        try {
          const pos: any = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 3000 });
          });
          if (pos) {
            userLocation = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
          }
        } catch (e) {
          // ignore location error
        }
      }

      const res = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend.trim(),
          messages: messages.slice(-6),
          modelType,
          useSearchGrounding,
          useMapsGrounding,
          userLocation,
          workspaceContext: assembleWorkspaceContext(),
        }),
      });

      if (!res.ok) {
        throw new Error('Intelligence request failed');
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.text || 'No response generated.',
        modelUsed: data.model,
        groundingChunks: data.groundingChunks || [],
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: `Error synthesizing intelligence: ${err?.message || 'Failed to complete query'}.`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAnalyzeVideo = async () => {
    try {
      setIsAnalyzingVideo(true);
      const res = await fetch('/api/gemini/video-understand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: videoTitle,
          promptText:
            'Extract key takeaways, decisions reached, commitments made, and action items from this meeting recording.',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVideoAnalysis(data);
      }
    } catch (err) {
      console.error('Video analysis failed:', err);
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
        <div>
          <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            <span>Conversational Intelligence Layer</span>
            <Badge variant="outline" className="text-[10px] font-mono">
              Traceable Reasoning
            </Badge>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Query across authorized Gmail, Calendar, Docs, Tasks, and real-time groundings.
          </p>
        </div>

        {/* Model & Grounding Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Model Switcher */}
          <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-950 p-0.5">
            <button
              onClick={() => setModelType('general')}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                modelType === 'general'
                  ? 'bg-zinc-850 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Flash (3.5)
            </button>
            <button
              onClick={() => setModelType('high_thinking')}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                modelType === 'high_thinking'
                  ? 'bg-zinc-850 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Brain className="h-3 w-3 text-zinc-400" />
              <span>High Thinking (Pro)</span>
            </button>
            <button
              onClick={() => setModelType('low_latency')}
              className={`px-2 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                modelType === 'low_latency'
                  ? 'bg-zinc-850 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Zap className="h-3 w-3 text-zinc-400" />
              <span>Fast (Lite)</span>
            </button>
          </div>

          {/* Search Grounding Toggle */}
          <button
            onClick={() => {
              setUseSearchGrounding(!useSearchGrounding);
              if (!useSearchGrounding) setUseMapsGrounding(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono transition-colors cursor-pointer ${
              useSearchGrounding
                ? 'border-emerald-700 bg-emerald-950/40 text-emerald-300'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="h-3 w-3" />
            <span>Search Grounding</span>
          </button>

          {/* Maps Grounding Toggle */}
          <button
            onClick={() => {
              setUseMapsGrounding(!useMapsGrounding);
              if (!useMapsGrounding) setUseSearchGrounding(false);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-mono transition-colors cursor-pointer ${
              useMapsGrounding
                ? 'border-blue-700 bg-blue-950/40 text-blue-300'
                : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MapPin className="h-3 w-3" />
            <span>Maps Grounding</span>
          </button>

          {/* Video Understanding Trigger */}
          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsVideoModalOpen(true)}
            className="gap-1.5 font-mono text-[11px]"
          >
            <Video className="h-3 w-3" />
            <span>Analyze Video</span>
          </Button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
        <span className="text-zinc-500 uppercase tracking-wider shrink-0">Prompts:</span>
        {[
          'What promises did I make this week?',
          'Prepare me for my next meeting',
          'What am I waiting on from other people?',
          'Find the document where we discussed pricing',
        ].map((p) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="px-2 py-0.5 rounded border border-zinc-850 bg-zinc-900/60 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 whitespace-nowrap cursor-pointer transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div
        ref={scrollRef}
        className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-4 min-h-[440px] max-h-[580px] overflow-y-auto"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] font-bold text-zinc-300">
                  Ø
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-md p-3.5 space-y-2 ${
                  isUser
                    ? 'bg-zinc-850 text-zinc-100 border border-zinc-750'
                    : 'bg-zinc-900/50 text-zinc-200 border border-zinc-850'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-zinc-500 pb-1 border-b border-zinc-800/60">
                  <span>{isUser ? 'YOU' : 'OPERATOR INTELLIGENCE'}</span>
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        {msg.modelUsed}
                      </Badge>
                    )}
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-zinc-300 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="font-mono text-xs whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </div>

                {/* Grounding Citations */}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/80 space-y-1">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase block">
                      Grounding References:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.groundingChunks.map((chunk: any, idx: number) => {
                        const web = chunk.web;
                        const maps = chunk.maps;
                        if (web?.uri) {
                          return (
                            <a
                              key={idx}
                              href={web.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300 hover:text-white"
                            >
                              <Globe className="h-2.5 w-2.5 text-emerald-400" />
                              <span className="truncate max-w-[180px]">{web.title || web.uri}</span>
                              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                            </a>
                          );
                        }
                        if (maps?.uri) {
                          return (
                            <a
                              key={idx}
                              href={maps.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-300 hover:text-white"
                            >
                              <MapPin className="h-2.5 w-2.5 text-blue-400" />
                              <span className="truncate max-w-[180px]">{maps.title || maps.uri}</span>
                              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                            </a>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-900 border border-zinc-800 font-mono text-[10px] font-bold text-zinc-300">
              Ø
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded bg-zinc-900/40 border border-zinc-850">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-zinc-300" />
              <span>
                {modelType === 'high_thinking'
                  ? 'Operator Reasoning with High Thinking...'
                  : 'Analyzing Workspace state...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-2 shadow-xs"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Operator about emails, meetings, commitments, or documents..."
          className="border-0 bg-transparent text-xs focus-visible:ring-0 focus-visible:border-0 shadow-none px-3 font-sans"
          disabled={isLoading}
        />

        <Button
          type="submit"
          size="sm"
          variant="default"
          disabled={isLoading || !input.trim()}
          className="gap-1.5 font-semibold shrink-0"
        >
          <span>Ask</span>
          <Send className="h-3 w-3" />
        </Button>
      </form>

      {/* Video Understanding Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-lg border border-zinc-800 bg-zinc-950 p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-850">
              <div className="flex items-center gap-2">
                <FileVideo className="h-4 w-4 text-zinc-300" />
                <h3 className="text-xs font-mono font-semibold uppercase text-zinc-100">
                  Video Intelligence (Gemini Pro)
                </h3>
              </div>
              <Button variant="ghost" size="xs" onClick={() => setIsVideoModalOpen(false)}>
                ✕
              </Button>
            </div>

            <p className="text-xs text-zinc-400">
              Analyze meeting recordings, architectural walkthroughs, or client presentations with Gemini 3.1 Pro Video Understanding.
            </p>

            <div className="space-y-2">
              <span className="font-mono text-[10px] text-zinc-500 uppercase">
                Recording Asset Reference:
              </span>
              <Input
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={handleAnalyzeVideo}
              disabled={isAnalyzingVideo}
              className="w-full gap-2 font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzingVideo ? 'animate-spin' : ''}`} />
              <span>{isAnalyzingVideo ? 'Dissecting Video Recording...' : 'Dissect Video with Gemini Pro'}</span>
            </Button>

            {videoAnalysis && (
              <div className="rounded-md border border-zinc-850 bg-zinc-900/40 p-4 space-y-3 text-xs">
                <div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-1">
                    Executive Summary:
                  </span>
                  <p className="text-zinc-200 leading-relaxed font-sans">
                    {videoAnalysis.executiveSummary}
                  </p>
                </div>

                {videoAnalysis.decisionsMade && (
                  <div>
                    <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-1">
                      Decisions Reached:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-zinc-300">
                      {videoAnalysis.decisionsMade.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {videoAnalysis.commitmentsExtracted && (
                  <div>
                    <span className="font-mono text-[10px] text-zinc-500 uppercase block mb-1">
                      Promises / Commitments:
                    </span>
                    <div className="space-y-1">
                      {videoAnalysis.commitmentsExtracted.map((c: any, i: number) => (
                        <div key={i} className="p-1.5 rounded bg-zinc-950 border border-zinc-850 flex items-center justify-between">
                          <span className="text-zinc-200">{c.commitment}</span>
                          <Badge variant="outline" className="text-[9px] font-mono">
                            {c.person}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
