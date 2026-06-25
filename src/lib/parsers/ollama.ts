import { Parser, Transcript, TranscriptTurn } from '../types';
import { hashId } from '../utils';

interface OllamaMessage {
  role: string;
  content: string;
  images?: string[];
  tool_calls?: Array<{
    function: {
      name: string;
      arguments: Record<string, unknown>;
    };
  }>;
}

interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done_reason?: string;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface OllamaRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
}

function detectOllama(content: string, fileName?: string): boolean {
  if (fileName?.endsWith('.jsonl')) {
    const lines = content.trim().split('\n').filter(Boolean).slice(0, 5);
    try {
      for (const line of lines) {
        const obj = JSON.parse(line);
        if (obj.model && obj.message?.role) return true;
        if (obj.role && obj.content !== undefined && !obj.toolName && !obj.type) return true;
        if (obj.messages && Array.isArray(obj.messages)) return true;
      }
    } catch {}
  }
  const lower = content.toLowerCase();
  return lower.includes('"model"') && (lower.includes('"user"') || lower.includes('"assistant"')) && lower.includes('"content"');
}

function detectLmStudio(content: string, fileName?: string): boolean {
  if (fileName?.endsWith('.jsonl')) {
    const lines = content.trim().split('\n').filter(Boolean).slice(0, 3);
    try {
      for (const line of lines) {
        const obj = JSON.parse(line);
        if (obj.choices && Array.isArray(obj.choices)) return true;
        if (obj.usage?.prompt_tokens !== undefined) return true;
      }
    } catch {}
  }
  return false;
}

export const ollamaParser: Parser = {
  name: 'Ollama / Local LLM',
  description: 'Parses Ollama chat API request/response logs, LM Studio, and generic local LLM formats',
  canParse: (content: string, fileName?: string) => detectOllama(content, fileName) || detectLmStudio(content, fileName),
  parse: (content: string, fileName?: string): Transcript => {
    const lines = content.trim().split('\n').filter(Boolean);
    const turns: TranscriptTurn[] = [];
    let modelName = '';
    let totalDuration = 0;

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);

        if (obj.model && obj.message) {
          modelName = modelName || obj.model;
          const msg = obj as OllamaChatResponse;
          const role = msg.message.role;
          const contentText = msg.message.content || '';

          if (role === 'user') {
            turns.push({
              id: hashId(),
              type: 'user',
              role: 'user',
              content: contentText,
              timestamp: msg.created_at,
              metadata: msg.message.images ? { images: msg.message.images.length } : undefined,
            });
          } else if (role === 'assistant') {
            if (msg.message.tool_calls?.length) {
              for (const tc of msg.message.tool_calls) {
                turns.push({
                  id: hashId(),
                  type: 'tool_call',
                  toolName: tc.function.name,
                  toolArgs: tc.function.arguments,
                  content: JSON.stringify(tc.function.arguments, null, 2),
                  timestamp: msg.created_at,
                });
              }
            } else {
              turns.push({
                id: hashId(),
                type: 'assistant_message',
                role: 'assistant',
                content: contentText,
                timestamp: msg.created_at,
              });
            }
          } else if (role === 'system') {
            turns.push({
              id: hashId(),
              type: 'system',
              role: 'system',
              content: contentText,
              timestamp: msg.created_at,
            });
          } else if (role === 'tool') {
            turns.push({
              id: hashId(),
              type: 'tool_result',
              content: contentText,
              timestamp: msg.created_at,
            });
          }

          if (msg.total_duration) {
            totalDuration += msg.total_duration;
          }
        }

        else if (obj.role && obj.content !== undefined) {
          const role = obj.role as string;
          const turnType = role === 'user' ? 'user' as const :
                           role === 'assistant' ? 'assistant_message' as const :
                           role === 'system' ? 'system' as const : 'assistant_message' as const;
          turns.push({
            id: hashId(),
            type: turnType,
            role,
            content: obj.content,
            timestamp: obj.timestamp || obj.created_at,
          });
        }

        else if (obj.messages && Array.isArray(obj.messages)) {
          for (const msg of obj.messages) {
            const role = msg.role as string;
            const turnType = role === 'user' ? 'user' as const :
                             role === 'assistant' ? 'assistant_message' as const :
                             role === 'system' ? 'system' as const : 'assistant_message' as const;
            turns.push({
              id: hashId(),
              type: turnType,
              role,
              content: msg.content || '',
              timestamp: msg.timestamp,
            });
          }
        }

        else if (obj.choices && Array.isArray(obj.choices)) {
          for (const choice of obj.choices) {
            const msg = choice.message || choice.delta || {};
            const role = msg.role || 'assistant';
            const turnType = role === 'user' ? 'user' as const :
                             role === 'assistant' ? 'assistant_message' as const :
                             role === 'system' ? 'system' as const : 'assistant_message' as const;

            const contentText = obj.choices.length === 1
              ? (msg.content || '')
              : `${role}: ${msg.content || ''}`;

            if (contentText.trim()) {
              turns.push({
                id: hashId(),
                type: turnType,
                role,
                content: contentText,
                timestamp: obj.created ? new Date(obj.created * 1000).toISOString() : undefined,
              });
            }
          }
        }
      } catch {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('{') && !trimmed.startsWith('[')) {
          turns.push({
            id: hashId(),
            type: 'assistant_message',
            content: line,
          });
        }
      }
    }

    const metadata: Transcript['metadata'] = {};
    if (modelName) metadata.model = modelName;
    if (totalDuration) metadata.durationMs = Math.floor(totalDuration / 1_000_000);

    return {
      id: hashId(),
      title: fileName || 'Ollama / Local LLM Transcript',
      turns,
      source: fileName || 'unknown',
      metadata: Object.keys(metadata).length ? metadata : undefined,
    };
  },
};
