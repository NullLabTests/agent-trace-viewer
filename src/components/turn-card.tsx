'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, User, Bot, Brain, Wrench, Bug, AlertTriangle, FlaskConical } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { cn, formatDuration, formatTimestamp } from '@/lib/utils';
import { TranscriptTurn } from '@/lib/types';
import { Badge } from './ui/badge';

interface TurnCardProps {
  turn: TranscriptTurn;
  searchTerm?: string;
  isActive?: boolean;
  onNavigate?: (id: string) => void;
}

const iconMap = {
  user: User,
  assistant_message: Bot,
  thinking: Brain,
  tool_call: Wrench,
  tool_result: Bug,
  subagent: FlaskConical,
  system: AlertTriangle,
} as const;

const colorMap = {
  user: 'border-l-blue-500 bg-blue-500/5',
  assistant_message: 'border-l-emerald-500 bg-emerald-500/5',
  thinking: 'border-l-amber-500 bg-amber-500/10',
  tool_call: 'border-l-violet-500 bg-violet-500/5',
  tool_result: 'border-l-zinc-500 bg-zinc-500/5',
  subagent: 'border-l-rose-500 bg-rose-500/5',
  system: 'border-l-red-500 bg-red-500/10',
} as const;

function highlightText(text: string, term?: string): React.ReactNode {
  if (!term || !term.trim()) return text;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-300/30 dark:bg-yellow-500/30 rounded px-0.5">{part}</mark> : part
  );
}

function toolCallNeedsWarning(turn: TranscriptTurn): { warning: boolean; label: string } | null {
  if (turn.type === 'tool_call' && turn.durationMs && turn.durationMs > 30000) {
    return { warning: true, label: `Took ${formatDuration(turn.durationMs)}` };
  }
  if (turn.type === 'tool_result') {
    const content = turn.content?.toLowerCase() || '';
    if (content.includes('error') || content.includes('failed') || content.includes('traceback')) {
      return { warning: true, label: 'Tool returned error' };
    }
    if (content.length > 5000) {
      return { warning: true, label: 'Large result' };
    }
  }
  if (turn.type === 'tool_call' && turn.toolName === 'WebFetch') {
    return { warning: true, label: 'WebFetch summary - may be lossy' };
  }
  return null;
}

export default function TurnCard({ turn, searchTerm, isActive, onNavigate }: TurnCardProps) {
  const [collapsed, setCollapsed] = useState(turn.type === 'thinking' || turn.type === 'tool_result');
  const Icon = iconMap[turn.type] || Bot;
  const warning = toolCallNeedsWarning(turn);

  const isExpandable = turn.type === 'thinking' || turn.type === 'tool_result' || (turn.type === 'tool_call' && turn.toolArgs);

  return (
    <div
      id={`turn-${turn.id}`}
      className={cn(
        'group relative border-l-2 pl-4 py-3 space-y-2 transition-colors',
        colorMap[turn.type],
        isActive && 'bg-accent/30'
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {isExpandable && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="shrink-0 p-0.5 rounded hover:bg-accent transition-colors"
            >
              {collapsed ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          )}
          <Icon className={cn('h-4 w-4 shrink-0', turn.type === 'thinking' && 'text-amber-500', turn.type === 'tool_call' && 'text-violet-500', turn.type === 'tool_result' && 'text-zinc-500')} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {turn.type === 'assistant_message' ? 'Assistant' : turn.type === 'user' ? 'User' : turn.type === 'tool_call' ? (turn.toolName || 'Tool Call') : turn.type === 'tool_result' ? 'Tool Result' : turn.type === 'thinking' ? 'Thinking' : turn.type === 'subagent' ? 'Sub-agent' : turn.type === 'system' ? 'System' : turn.type}
          </span>
          {turn.toolName && (
            <Badge variant="outline" className="text-[10px] font-mono">{turn.toolName}</Badge>
          )}
          {warning && (
            <Badge variant="destructive" className="text-[10px] gap-1">
              <AlertTriangle className="h-3 w-3" />
              {warning.label}
            </Badge>
          )}
          {turn.durationMs !== undefined && turn.durationMs > 0 && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
              <Clock className="h-3 w-3" />
              {formatDuration(turn.durationMs)}
            </span>
          )}
        </div>
        {turn.timestamp && (
          <span className="text-[10px] text-muted-foreground shrink-0">{formatTimestamp(turn.timestamp)}</span>
        )}
      </div>

      {(!isExpandable || !collapsed) && (
        <div className={cn(
          'pl-1',
          turn.type === 'thinking' && 'text-sm text-amber-700/80 dark:text-amber-300/80 italic'
        )}>
          {turn.type === 'tool_call' && turn.toolArgs ? (
            <div className="space-y-2">
              {turn.content && (
                <div className="text-sm text-muted-foreground">{highlightText(turn.content, searchTerm)}</div>
              )}
              <pre className="text-xs bg-muted/50 rounded-lg p-3 overflow-x-auto font-mono">
                {JSON.stringify(turn.toolArgs, null, 2)}
              </pre>
            </div>
          ) : turn.type === 'tool_call' ? (
            <div className="text-sm text-muted-foreground">{highlightText(turn.content, searchTerm)}</div>
          ) : turn.type === 'tool_result' ? (
            <pre className={cn(
              'text-xs rounded-lg p-3 overflow-x-auto font-mono',
              warning?.label === 'Tool returned error' ? 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20' : 'bg-muted/30'
            )}>
              {highlightText(turn.content, searchTerm)}
            </pre>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeKatex]}
              >
                {turn.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
