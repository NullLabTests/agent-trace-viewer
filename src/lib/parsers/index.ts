import { Parser, Transcript } from '../types';
import { claudeCodeParser } from './claude-code';
import { codexParser } from './codex';
import { genericJsonParser } from './generic';

export const parsers: Parser[] = [
  claudeCodeParser,
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
  return parser.parse(content, fileName);
}

export { claudeCodeParser, codexParser, genericJsonParser };
