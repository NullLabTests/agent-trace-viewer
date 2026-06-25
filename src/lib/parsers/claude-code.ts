import { Parser, Transcript, TranscriptTurn, TurnType } from '../types';
import { hashId } from '../utils';

function detectClaudeCode(content: string, fileName?: string): boolean {
  if (fileName?.endsWith('.jsonl')) {
    const lines = content.trim().split('\n').filter(Boolean);
    const sample = lines.slice(0, 3).map(l => JSON.parse(l));
    return sample.some((s: any) =>
      s.type === 'message' || s.role === 'user' || s.role === 'assistant' || s.content?.some?.((c: any) => c.type === 'tool_use' || c.type === 'tool_result' || c.type === 'thinking')
    );
  }
  return false;
}

function parseClaudeContentBlock(block: any): { type: TurnType; content: string; toolName?: string; toolArgs?: any; toolResult?: any } {
  if (block.type === 'text') {
    return { type: 'assistant_message', content: block.text || '' };
  }
  if (block.type === 'thinking') {
    return { type: 'thinking', content: block.thinking || block.text || '' };
  }
  if (block.type === 'tool_use') {
    return {
      type: 'tool_call',
      content: JSON.stringify(block.input, null, 2),
      toolName: block.name,
      toolArgs: block.input,
    };
  }
  if (block.type === 'tool_result') {
    const resultContent = block.content?.map((c: any) => c.text || c.content || '').join('\n') || '';
    return {
      type: 'tool_result',
      content: resultContent,
      toolResult: block.content,
    };
  }
  return { type: 'assistant_message', content: JSON.stringify(block) };
}

export const claudeCodeParser: Parser = {
  name: 'Claude Code',
  description: 'Parses Claude Code / Anthropic agent transcripts in JSONL format',
  canParse: detectClaudeCode,
  parse: (content: string, fileName?: string): Transcript => {
    const lines = content.trim().split('\n').filter(Boolean);
    const turns: TranscriptTurn[] = [];
    let currentThinking = '';
    let isThinking = false;

    for (const line of lines) {
      try {
        const msg = JSON.parse(line);

        if (msg.type === 'message_start' && msg.message) {
          if (msg.message.metadata?.thinking) {
            isThinking = true;
            currentThinking = msg.message.metadata.thinking;
          }
          continue;
        }

        if (msg.type === 'content_block_start' || msg.type === 'content_block_delta') {
          if (msg.content_block?.type === 'thinking' || msg.delta?.type === 'thinking') {
            isThinking = true;
            const text = msg.content_block?.thinking || msg.delta?.thinking || msg.delta?.text || '';
            currentThinking += text;
            continue;
          }
          if (isThinking && (msg.content_block?.type !== 'thinking' && msg.delta?.type !== 'thinking')) {
            if (currentThinking) {
              turns.push({
                id: hashId(),
                type: 'thinking',
                content: currentThinking,
              });
              currentThinking = '';
              isThinking = false;
            }
          }
        }

        if (msg.type === 'content_block_stop') {
          if (currentThinking) {
            turns.push({
              id: hashId(),
              type: 'thinking',
              content: currentThinking,
            });
            currentThinking = '';
            isThinking = false;
          }
        }

        if (msg.role === 'user' && msg.content) {
          const text = typeof msg.content === 'string' ? msg.content : msg.content.map((c: any) => c.text || c.content || '').join('\n');
          turns.push({
            id: hashId(),
            type: 'user',
            content: text,
            role: msg.role,
            timestamp: msg.timestamp,
          });
        }

        if (msg.role === 'assistant' && msg.content) {
          const blocks = Array.isArray(msg.content) ? msg.content : [msg.content];
          for (const block of blocks) {
            if (typeof block === 'string') {
              turns.push({ id: hashId(), type: 'assistant_message', content: block });
            } else {
              const parsed = parseClaudeContentBlock(block);
              turns.push({
                id: hashId(),
                ...parsed,
                timestamp: msg.timestamp,
              });
            }
          }
        }

        if (msg.type === 'message' && Array.isArray(msg.content)) {
          for (const block of msg.content) {
            const parsed = parseClaudeContentBlock(block);
            turns.push({
              id: hashId(),
              ...parsed,
              ...(msg.role ? { role: msg.role } : {}),
              timestamp: msg.timestamp,
            });
          }
        }
      } catch {
        continue;
      }
    }

    return {
      id: hashId(),
      title: fileName || 'Claude Code Transcript',
      turns,
      source: fileName || 'unknown',
    };
  },
};

export function parseMessageContent(msg: any): TranscriptTurn[] {
  const turns: TranscriptTurn[] = [];

  if (msg.role === 'user') {
    const text = typeof msg.content === 'string'
      ? msg.content
      : Array.isArray(msg.content)
        ? msg.content.map((c: any) => c.text || c.content || '').join('\n')
        : JSON.stringify(msg.content);
    turns.push({
      id: hashId(),
      type: 'user',
      content: text,
      role: 'user',
    });
  }

  if (msg.role === 'assistant' && msg.content) {
    const blocks = Array.isArray(msg.content) ? msg.content : [msg.content];
    for (const block of blocks) {
      if (typeof block === 'string') {
        turns.push({ id: hashId(), type: 'assistant_message', content: block });
      } else {
        turns.push({
          id: hashId(),
          ...parseClaudeContentBlock(block),
        });
      }
    }
  }

  return turns;
}
