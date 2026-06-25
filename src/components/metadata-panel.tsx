'use client';

import { Transcript } from '@/lib/types';
import { Clock, Cpu, Activity, Wrench, Hash, BarChart3 } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

interface MetadataPanelProps {
  transcript: Transcript;
}

export default function MetadataPanel({ transcript }: MetadataPanelProps) {
  const meta = transcript.metadata;
  const toolCalls = transcript.turns.filter(t => t.type === 'tool_call');
  const toolUsage = toolCalls.reduce<Record<string, number>>((acc, t) => {
    const name = t.toolName || 'unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border">
        <Hash className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="text-xs text-muted-foreground">Total Turns</div>
          <div className="text-sm font-semibold">{transcript.turns.length}</div>
        </div>
      </div>
      <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border">
        <Wrench className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="text-xs text-muted-foreground">Tool Calls</div>
          <div className="text-sm font-semibold">{toolCalls.length}</div>
        </div>
      </div>
      {meta?.durationMs && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Duration</div>
            <div className="text-sm font-semibold">{formatDuration(meta.durationMs)}</div>
          </div>
        </div>
      )}
      {meta?.model && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border">
          <Cpu className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-xs text-muted-foreground">Model</div>
            <div className="text-sm font-semibold truncate max-w-[120px]">{meta.model}</div>
          </div>
        </div>
      )}
      {Object.keys(toolUsage).length > 0 && (
        <div className="col-span-full flex flex-wrap gap-2">
          {Object.entries(toolUsage).map(([name, count]) => (
            <div key={name} className="flex items-center gap-1.5 text-xs bg-muted/40 rounded-full px-3 py-1 border">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{name}</span>
              <span className="text-muted-foreground">x{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
