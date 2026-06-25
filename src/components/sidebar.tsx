'use client';

import { useMemo } from 'react';
import { ScrollArea } from './ui/scroll-area';
import { TranscriptTurn } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MessageSquare, Brain, Wrench, Bug, User, Bot, FlaskConical } from 'lucide-react';

interface SidebarProps {
  turns: TranscriptTurn[];
  activeId?: string;
  onNavigate: (id: string) => void;
}

const typeIcon = {
  user: User,
  assistant_message: Bot,
  thinking: Brain,
  tool_call: Wrench,
  tool_result: Bug,
  subagent: FlaskConical,
  system: Bug,
} as const;

export default function Sidebar({ turns, activeId, onNavigate }: SidebarProps) {
  const items = useMemo(() => {
    return turns.map((t, i) => ({
      id: t.id,
      index: i,
      type: t.type,
      label: t.type === 'assistant_message' ? 'Assistant' :
             t.type === 'user' ? 'User' :
             t.type === 'thinking' ? 'Thinking' :
             t.type === 'tool_call' ? (t.toolName || 'Tool Call') :
             t.type === 'tool_result' ? 'Tool Result' :
             t.type === 'subagent' ? 'Sub-agent' :
             t.type === 'system' ? 'System' : t.type,
      preview: t.content.slice(0, 60),
    }));
  }, [turns]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Timeline</h2>
        <p className="text-xs text-muted-foreground/60">{turns.length} turns</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {items.map((item) => {
            const Icon = typeIcon[item.type];
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start gap-2.5',
                  activeId === item.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                    {item.preview}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
