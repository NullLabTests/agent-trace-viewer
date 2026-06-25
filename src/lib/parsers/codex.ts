import { Parser, Transcript, TranscriptTurn } from '../types';
import { hashId } from '../utils';

function detectCodex(content: string, fileName?: string): boolean {
  const lower = content.toLowerCase();
  return lower.includes('codex') || lower.includes('"type"') && (lower.includes('"tool_call"') || lower.includes('"tool_result"'));
}

export const codexParser: Parser = {
  name: 'Codex / OpenDevin',
  description: 'Parses Codex-style or OpenDevin agent trace logs',
  canParse: detectCodex,
  parse: (content: string, fileName?: string): Transcript => {
    const lines = content.trim().split('\n').filter(Boolean);
    const turns: TranscriptTurn[] = [];

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        const turn: TranscriptTurn = {
          id: hashId(),
          type: obj.type || 'assistant_message',
          content: obj.content || obj.text || obj.message || JSON.stringify(obj),
          ...(obj.toolName ? { toolName: obj.toolName } : {}),
          ...(obj.toolArgs ? { toolArgs: obj.toolArgs } : {}),
          ...(obj.toolResult ? { toolResult: obj.toolResult } : {}),
          ...(obj.durationMs !== undefined ? { durationMs: obj.durationMs } : {}),
          ...(obj.metadata ? { metadata: obj.metadata } : {}),
          ...(obj.timestamp ? { timestamp: obj.timestamp } : {}),
          ...(obj.role ? { role: obj.role } : {}),
        };
        turns.push(turn);
      } catch {
        turns.push({
          id: hashId(),
          type: 'assistant_message',
          content: line,
        });
      }
    }

    return {
      id: hashId(),
      title: fileName || 'Codex / OpenDevin Transcript',
      turns,
      source: fileName || 'unknown',
    };
  },
};
