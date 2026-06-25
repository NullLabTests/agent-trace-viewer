export type TurnType =
  | 'user'
  | 'assistant_message'
  | 'thinking'
  | 'tool_call'
  | 'tool_result'
  | 'subagent'
  | 'system';

export interface TranscriptTurn {
  id: string;
  type: TurnType;
  role?: string;
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export interface Transcript {
  id: string;
  title: string;
  turns: TranscriptTurn[];
  metadata?: {
    model?: string;
    totalTokens?: number;
    totalTurns?: number;
    durationMs?: number;
    toolUsage?: Record<string, number>;
    [key: string]: unknown;
  };
  source?: string;
}

export interface Parser {
  name: string;
  description: string;
  canParse: (content: string, fileName?: string) => boolean;
  parse: (content: string, fileName?: string) => Transcript;
}

export interface SearchMatch {
  turnId: string;
  snippet: string;
  indices: [number, number][];
}
