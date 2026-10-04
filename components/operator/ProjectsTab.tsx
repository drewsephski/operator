'use client';

import * as React from 'react';
import {
  Briefcase,
  Users,
  FileText,
  Mail,
  Calendar,
  CheckSquare,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectItem, EmailItem, DriveFileItem, CalendarEventItem } from '@/lib/types';

interface ProjectsTabProps {
  projects: ProjectItem[];
  emails: EmailItem[];
  files: DriveFileItem[];
  meetings: CalendarEventItem[];
  onOpenMeetingPrep: (meeting: CalendarEventItem) => void;
  onQuickDraft: (email: EmailItem) => void;
}

export function ProjectsTab({
  projects,
  emails,
  files,
  meetings,
  onOpenMeetingPrep,
  onQuickDraft,
}: ProjectsTabProps) {
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>(
    projects[0]?.id || ''
  );

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
        <div>
          <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-zinc-100 flex items-center gap-2">
            <span>Project Workspaces</span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {projects.length} assembled
            </Badge>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Operator continuously links cross-service emails, calendar syncs, Google Docs, and decisions into cohesive hubs.
          </p>
        </div>
      </div>

      {/* Project Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {projects.map((proj) => {
          const isSelected = proj.id === currentProject?.id;
          return (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'border-zinc-500 bg-zinc-900 text-zinc-100 shadow-xs'
                  : 'border-zinc-850 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
              }`}
            >
              <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
              <span>{proj.name}</span>
              <span className="font-mono text-[10px] text-zinc-500">
                ({proj.metrics.emailsCount + proj.metrics.docsCount} items)
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Project View */}
      {currentProject && (
        <div className="space-y-6">
          {/* Project Summary Banner */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="success" className="text-[10px] font-mono uppercase">
                    {currentProject.status}
                  </Badge>
                  {currentProject.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] font-mono">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="text-base font-semibold text-zinc-100">
                  {currentProject.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                  {currentProject.description}
                </p>
              </div>

              {/* Members Context */}
              <div className="rounded-md border border-zinc-850 bg-zinc-900/50 p-2.5 text-xs text-zinc-300 space-y-1">
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                  Connected Team
                </span>
                <p className="font-medium text-zinc-200">
                  {currentProject.members.join(' · ')}
                </p>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-900">
              <div className="p-2.5 rounded bg-zinc-900/40 border border-zinc-850">
                <span className="font-mono text-[10px] text-zinc-500 uppercase block">
                  Threads Linked
                </span>
                <span className="text-sm font-semibold font-mono text-zinc-100">
                  {currentProject.metrics.emailsCount}
                </span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900/40 border border-zinc-850">
                <span className="font-mono text-[10px] text-zinc-500 uppercase block">
                  Sync Meetings
                </span>
                <span className="text-sm font-semibold font-mono text-zinc-100">
                  {currentProject.metrics.meetingsCount}
                </span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900/40 border border-zinc-850">
                <span className="font-mono text-[10px] text-zinc-500 uppercase block">
                  Docs & Sheets
                </span>
                <span className="text-sm font-semibold font-mono text-zinc-100">
                  {currentProject.metrics.docsCount}
                </span>
              </div>
              <div className="p-2.5 rounded bg-zinc-900/40 border border-zinc-850">
                <span className="font-mono text-[10px] text-zinc-500 uppercase block">
                  Open Tasks
                </span>
                <span className="text-sm font-semibold font-mono text-zinc-100">
                  {currentProject.metrics.openTasksCount}
                </span>
              </div>
            </div>
          </div>

          {/* Decisions Log & Attached Files */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Key Decisions (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-zinc-300" />
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                  Operator Decision Log
                </h4>
              </div>

              <div className="space-y-2">
                {currentProject.keyDecisions.map((decision, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-md border border-zinc-850 bg-zinc-950 text-xs text-zinc-200 space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>DECISION #{i + 1}</span>
                      <span>Recorded</span>
                    </div>
                    <p className="font-medium text-zinc-100">{decision}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Attached Drive Documents (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-zinc-300" />
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                  Referenced Google Files
                </h4>
              </div>

              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2.5 rounded-md border border-zinc-850 bg-zinc-950 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <FileText className="h-3 w-3" />
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-medium text-zinc-200 truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-500">
                          {file.timeAgo} by {file.lastModifyingUser}
                        </p>
                      </div>
                    </div>

                    {file.webViewLink && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => window.open(file.webViewLink, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 text-zinc-400" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
