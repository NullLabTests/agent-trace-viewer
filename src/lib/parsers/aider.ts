import { Parser, Transcript, TranscriptTurn } from '../types';
import { hashId } from '../utils';

interface AiderTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: string;
  timestamp?: string;
}

function detectAider(content: string, fileName?: string): boolean {
  if (fileName?.endsWith('.jsonl') || fileName?.endsWith('.json')) {
    const lines = content.trim().split('\n').filter(Boolean).slice(0, 5);
    try {
      for (const line of lines) {
        const obj = JSON.parse(line);
        if (obj.role && (obj.role === 'user' || obj.role === 'assistant') && obj.content) {
          if (obj.toolName || obj.toolResult !== undefined) return true;
        }
      }
    } catch {}
  }

  const lower = content.toLowerCase();
  const aiderMarkers = [
    'aider', 'added to the chat', '/add', '/drop',
    'commit ', '### repo files', 'to fix the',
    'apply edit', 'did you mean to',
  ];
  const matchCount = aiderMarkers.filter(m => lower.includes(m)).length;

  if (fileName?.endsWith('.md')) {
    if (matchCount >= 2) return true;
  }

  return false;
}

function parseMarkdownAider(content: string): AiderTurn[] {
  const turns: AiderTurn[] = [];
  const lines = content.split('\n');

  const userPatterns = [/^####\s+(.+?):\s*(.*)/, /^>\s*(.*)/, /^##\s+User\s*$/];
  const dividerPattern = /^---+/;
  const codeBlockMarker = /^```/;

  let currentRole: 'user' | 'assistant' | null = null;
  let currentContent: string[] = [];
  let inCodeBlock = false;
  let inUserBlock = false;

  function flush() {
    if (currentRole && currentContent.length > 0) {
      turns.push({
        role: currentRole,
        content: currentContent.join('\n').trim(),
      });
    }
    currentContent = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (dividerPattern.test(trimmed)) {
      flush();
      currentRole = null;
      inUserBlock = false;
      continue;
    }

    if (codeBlockMarker.test(trimmed)) {
      inCodeBlock = !inCodeBlock;
      currentContent.push(line);
      continue;
    }

    if (inCodeBlock) {
      currentContent.push(line);
      continue;
    }

    const userMatch = line.match(/^####\s+(.+?):\s*(.*)/);
    if (userMatch) {
      flush();
      const [_, name, rest] = userMatch;
      if (name.toLowerCase() === 'user' || name.toLowerCase() === 'human' || name.toLowerCase() === 'me') {
        currentRole = 'user';
        if (rest.trim()) currentContent.push(rest.trim());
      } else if (name.toLowerCase() === 'assistant' || name.toLowerCase() === 'aider' || name.toLowerCase() === 'ai') {
        currentRole = 'assistant';
        if (rest.trim()) currentContent.push(rest.trim());
      } else {
        currentRole = 'assistant';
        currentContent.push(line);
      }
      continue;
    }

    if (line.startsWith('> ')) {
      flush();
      currentRole = 'user';
      currentContent.push(line.slice(2));
      continue;
    }

    if (currentRole) {
      currentContent.push(line);
    }
  }

  flush();

  if (turns.length === 0) {
    turns.push({ role: 'assistant', content });
  }

  return turns;
}

export const aiderParser: Parser = {
  name: 'Aider',
  description: 'Parses Aider AI pair programming chat transcripts and logs',
  canParse: detectAider,
  parse: (content: string, fileName?: string): Transcript => {
    const lines = content.trim().split('\n').filter(Boolean);
    const turns: TranscriptTurn[] = [];
    let modelName = '';

    const isJsonl = lines.some(l => {
      try { const o = JSON.parse(l); return o.role && o.content; } catch { return false; }
    });

    if (isJsonl) {
      for (const line of lines) {
        try {
          const obj = JSON.parse(line);
          const role = (obj.role || '').toLowerCase();

          if (obj.model && !modelName) modelName = obj.model;

          const turnType = role === 'user' ? 'user' as const :
                           role === 'assistant' || role === 'ai' ? 'assistant_message' as const :
                           role === 'system' ? 'system' as const : 'assistant_message' as const;

          const turn: TranscriptTurn = {
            id: hashId(),
            type: obj.toolName ? 'tool_call' : turnType,
            content: obj.toolResult !== undefined ? obj.toolResult :
                     obj.toolArgs ? obj.toolArgs :
                     obj.content || '',
            ...(obj.toolName ? { toolName: obj.toolName, toolArgs: obj.toolArgs } : {}),
            ...(obj.toolResult !== undefined ? {
              toolResult: obj.toolResult,
              type: 'tool_result' as const,
            } : {}),
            ...(obj.durationMs !== undefined ? { durationMs: obj.durationMs } : {}),
            ...(obj.timestamp ? { timestamp: obj.timestamp } : {}),
            ...(obj.role ? { role: obj.role } : {}),
          };
          turns.push(turn);
        } catch {}
      }
    } else {
      const mdTurns = parseMarkdownAider(content);
      for (const t of mdTurns) {
        const turnType = t.role === 'user' ? 'user' as const :
                         t.role === 'assistant' ? 'assistant_message' as const :
                         t.role === 'system' ? 'system' as const : 'assistant_message' as const;

        const turn: TranscriptTurn = {
          id: hashId(),
          type: t.toolName ? 'tool_call' : turnType,
          content: t.toolResult || (typeof t.toolArgs === 'string' ? t.toolArgs : '') || t.content || '',
          ...(t.toolName ? { toolName: t.toolName, toolArgs: t.toolArgs } : {}),
          ...(t.toolResult !== undefined ? {
            toolResult: t.toolResult,
            type: 'tool_result' as const,
          } : {}),
          ...(t.timestamp ? { timestamp: t.timestamp } : {}),
          ...(t.role ? { role: t.role } : {}),
        };
        turns.push(turn);
      }
    }

    if (turns.length === 0) {
      turns.push({
        id: hashId(),
        type: 'assistant_message',
        content,
      });
    }

    return {
      id: hashId(),
      title: fileName || 'Aider Transcript',
      turns,
      source: fileName || 'unknown',
      metadata: modelName ? { model: modelName } : undefined,
    };
  },
};
