import { Parser, Transcript, TranscriptTurn } from '../types';
import { hashId } from '../utils';

interface SWEStep {
  action: string;
  observation?: string;
  response?: string;
  thought?: string;
  info?: Record<string, unknown>;
  duration?: number;
  timestamp?: string;
}

interface SWETrajectory {
  trajectory?: SWEStep[];
  steps?: SWEStep[];
  history?: Array<{
    role: string;
    content: string;
    timestamp?: string;
  }>;
  metadata?: {
    model?: string;
    dataset?: string;
    instance_id?: string;
    [key: string]: unknown;
  };
  model?: string;
  instance_id?: string;
  [key: string]: unknown;
}

function detectSWEagent(content: string, fileName?: string): boolean {
  const lower = content.toLowerCase();
  if (fileName?.endsWith('.json') || fileName?.endsWith('.traj')) {
    return lower.includes('trajectory') || lower.includes('"action"') || lower.includes('"observation"');
  }
  const swemarkers = ['trajectory', '"action"', '"observation"', 'swe-agent', 'sweagent'];
  const matchCount = swemarkers.filter(m => lower.includes(m)).length;
  return matchCount >= 2;
}

export const sweAgentParser: Parser = {
  name: 'SWE-agent',
  description: 'Parses SWE-agent trajectory JSON files',
  canParse: detectSWEagent,
  parse: (content: string, fileName?: string): Transcript => {
    let data: SWETrajectory;
    try {
      data = JSON.parse(content);
    } catch {
      return {
        id: hashId(),
        title: fileName || 'SWE-agent Transcript',
        turns: [{ id: hashId(), type: 'assistant_message', content }],
        source: fileName || 'unknown',
      };
    }

    const turns: TranscriptTurn[] = [];
    let modelName = data.model || data.metadata?.model || '';

    const steps = data.trajectory || data.steps || [];

    if (steps.length > 0) {
      for (const step of steps) {
        if (step.thought) {
          turns.push({
            id: hashId(),
            type: 'thinking',
            content: step.thought,
            timestamp: step.timestamp,
          });
        }
        if (step.action) {
          const action = step.action.toLowerCase().trim().split(/\s+/)[0] || '';
          const toolName = action === 'read' ? 'Read' :
                           action === 'write' ? 'Write' :
                           action === 'edit' ? 'Edit' :
                           action === 'run' ? 'Bash' :
                           action === 'bash' ? 'Bash' :
                           action === 'submit' ? 'Submit' :
                           action === 'search' ? 'Search' :
                           action === 'goto' ? 'Navigate' :
                           action === 'scroll' ? 'Scroll' :
                           action === 'finish' ? 'Finish' :
                           action === 'skip' ? 'Skip' :
                           action === 'delegate' ? 'Sub-agent' :
                           action === 'think' ? 'Think' : action;
          turns.push({
            id: hashId(),
            type: 'tool_call',
            toolName,
            content: step.action,
            toolArgs: { action: step.action, info: step.info },
            durationMs: step.duration,
            timestamp: step.timestamp,
          });
        }
        if (step.observation) {
          turns.push({
            id: hashId(),
            type: 'tool_result',
            content: step.observation,
            timestamp: step.timestamp,
          });
        }
        if (step.response) {
          turns.push({
            id: hashId(),
            type: 'assistant_message',
            content: step.response,
            timestamp: step.timestamp,
          });
        }
      }
    } else if (data.history) {
      for (const entry of data.history) {
        const turnType = entry.role === 'user' ? 'user' as const :
                         entry.role === 'assistant' ? 'assistant_message' as const :
                         entry.role === 'system' ? 'system' as const : 'assistant_message' as const;
        turns.push({
          id: hashId(),
          type: turnType,
          role: entry.role,
          content: entry.content,
          timestamp: entry.timestamp,
        });
      }
    } else {
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' && !key.startsWith('_')) {
          turns.push({
            id: hashId(),
            type: key === 'instruction' || key === 'question' ? 'user' : 'assistant_message',
            content: value,
          });
        }
      }
    }

    const metadata: Transcript['metadata'] = {};
    if (modelName) metadata.model = modelName;
    if (data.instance_id) metadata.instance_id = data.instance_id;
    if (data.metadata?.dataset) metadata.dataset = data.metadata.dataset;

    return {
      id: hashId(),
      title: fileName || (data.instance_id ? `SWE-agent: ${data.instance_id}` : 'SWE-agent Transcript'),
      turns,
      source: fileName || 'unknown',
      metadata: Object.keys(metadata).length ? metadata : undefined,
    };
  },
};
