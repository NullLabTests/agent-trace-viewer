import { Parser, Transcript, TranscriptTurn } from '../types';
import { hashId } from '../utils';

export const genericJsonParser: Parser = {
  name: 'Generic JSON/JSONL',
  description: 'Parses standard JSON or JSONL files with turns array or line-delimited objects',
  canParse: (content: string, fileName?: string) => {
    const name = fileName || '';
    if (name.endsWith('.jsonl') || name.endsWith('.json')) return true;
    return content.trim().startsWith('[') || content.trim().startsWith('{');
  },
  parse: (content: string, fileName?: string): Transcript => {
    const lines = content.trim().split('\n').filter(Boolean);
    const turns: TranscriptTurn[] = [];
    let parsed: any[] = [];

    try {
      if (content.trim().startsWith('[')) {
        parsed = JSON.parse(content);
      } else {
        parsed = lines.map(l => JSON.parse(l));
      }
    } catch {
      parsed = [];
    }

    if (!Array.isArray(parsed)) {
      parsed = [parsed];
    }

    for (const item of parsed) {
      const turn: TranscriptTurn = {
        id: hashId(),
        type: item.type || 'assistant_message',
        content: item.content || item.text || item.message || JSON.stringify(item),
        ...(item.toolName ? { toolName: item.toolName } : {}),
        ...(item.toolArgs ? { toolArgs: item.toolArgs } : {}),
        ...(item.toolResult ? { toolResult: item.toolResult } : {}),
        ...(item.durationMs !== undefined ? { durationMs: item.durationMs } : {}),
        ...(item.metadata ? { metadata: item.metadata } : {}),
        ...(item.timestamp ? { timestamp: item.timestamp } : {}),
        ...(item.role ? { role: item.role } : {}),
      };
      turns.push(turn);
    }

    return {
      id: hashId(),
      title: fileName || 'Generic Transcript',
      turns,
      source: fileName || 'unknown',
    };
  },
};
