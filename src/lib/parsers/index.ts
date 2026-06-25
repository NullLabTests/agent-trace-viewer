import { Parser, Transcript } from '../types';
import { claudeCodeParser } from './claude-code';
import { codexParser } from './codex';
import { genericJsonParser } from './generic';
import { ollamaParser } from './ollama';
import { aiderParser } from './aider';
import { sweAgentParser } from './swe-agent';

export const parsers: Parser[] = [
  claudeCodeParser,
  sweAgentParser,
  ollamaParser,
  aiderParser,
  codexParser,
  genericJsonParser,
];

export function detectParser(content: string, fileName?: string): Parser {
  for (const parser of parsers) {
    if (parser.canParse(content, fileName)) return parser;
  }
  return genericJsonParser;
}

export function parseTranscript(content: string, fileName?: string): Transcript {
  const parser = detectParser(content, fileName);
  const transcript = parser.parse(content, fileName);
  transcript.parserName = parser.name;
  return transcript;
}

export { claudeCodeParser, codexParser, genericJsonParser, ollamaParser, aiderParser, sweAgentParser };
