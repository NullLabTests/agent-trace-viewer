# Agent Trace Viewer

> **"Coding agent transcripts are almost incomprehensible — hundreds of pages of raw tool calls, lossy WebFetch summaries, invisible subagent reasoning, and no way to jump to the interesting parts."**  
> — Inspired by pain points from Tim Hua's [LessWrong post on Claude Code transcripts](https://www.lesswrong.com/posts/LCmqd3TKK35pBcyqN/claude-code-s-transparent-misunderstandings)

A polished, local-first web application for viewing, searching, and debugging transcripts from coding agents. See every tool call, thinking trace, sub-agent action, and result in a beautiful, navigable interface. Spot problems fast — repeated failures, lossy summaries, suspicious behavior.

Works out of the box with **Claude Code**, **Codex-style** logs, and **generic JSON/JSONL** formats. Fully extensible.

> **No data leaves your machine.** Everything is local-first — parse, render, and search entirely in the browser.

---

## Features

### Core
- **Load transcripts** from file upload (`.jsonl`, `.json`, `.md`, or folder of session logs) or click "Load Demo" to try instantly
- **Interleaved view** of the full conversation — user messages, thinking traces, tool calls with formatted arguments, tool results, and system events
- **Collapsible sections** — expand/collapse thinking traces, tool results, and large outputs to keep the view clean
- **Rich rendering** — full Markdown support (GFM tables, code blocks) and LaTeX via KaTeX for mathematical content
- **Smart highlighting** — automatic badges for problematic patterns:
  - Tool calls > 30s duration
  - Tool results containing errors/failures
  - Very large tool results (>5000 chars)
  - WebFetch summaries flagged as potentially lossy

### Search & Navigation
- **Global search** — press `/` or `Cmd/Ctrl+F` to search across the entire transcript with keyboard navigation
- **Timeline sidebar** — compact list of all turns, clickable to jump instantly to any point in the conversation
- **Search highlights** — matching turns are visually indicated

### Export & Metadata
- **Export** — download the transcript as cleaned Markdown or annotated JSON
- **Metadata panel** — view total turns, tool call count, session duration, model name, and per-tool usage breakdown
- **Dark mode by default** — easy-on-the-eyes dark theme with a toggle to switch to light mode

---

## Quickstart

```bash
git clone https://github.com/NullLabTests/agent-trace-viewer.git
cd agent-trace-viewer
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The demo transcript loads automatically.

### Requirements
- Node.js 18+
- pnpm (install with `npm install -g pnpm`)

---

## How to Export Transcripts from Coding Agents

### Claude Code

Claude Code (Anthropic's CLI coding agent) produces JSONL logs. To export a session:

```bash
# If you have a Claude Code session log:
cat ~/.claude/logs/<session-id>.jsonl

# Or capture a session during use:
claude --log-level debug 2>&1 | tee session.jsonl
```

The JSONL format contains messages with `role: "user"` or `role: "assistant"` and content blocks of type `text`, `thinking`, `tool_use`, and `tool_result`.

### Codex / OpenDevin / Aider / SWE-agent

These tools often produce JSON or JSONL logs with a similar message/turn structure. Try loading them directly — the generic parser will attempt to extract content.

---

## Supported Formats

| Format | File Extension | Parser | Status |
|--------|---------------|--------|--------|
| Claude Code | `.jsonl` | `claude-code.ts` | ✅ Full support |
| Codex / OpenDevin | `.json`, `.jsonl` | `codex.ts` | ✅ Support |
| Generic JSON/JSONL | `.json`, `.jsonl` | `generic.ts` | ✅ Fallback |
| Markdown transcripts | `.md` | generic | ⚠️ Basic |

### Adding a New Parser

Parsers are modular and easy to add. Create a new file in `src/lib/parsers/` with this interface:

```ts
import { Parser, Transcript } from '../types';

export const myParser: Parser = {
  name: 'My Agent',
  description: 'Parses My Agent logs',
  canParse: (content: string, fileName?: string) => boolean,
  parse: (content: string, fileName?: string) => Transcript,
};
```

Then register it in `src/lib/parsers/index.ts`:

```ts
import { myParser } from './my-agent';
export const parsers: Parser[] = [myParser, claudeCodeParser, codexParser, genericJsonParser];
```

---

## Project Structure

```
agent-trace-viewer/
├── src/
│   ├── app/
│   │   ├── page.tsx             # Main app page
│   │   ├── layout.tsx           # Root layout (fonts, KaTeX CDN)
│   │   └── globals.css          # Tailwind v4 theme tokens
│   ├── components/
│   │   ├── transcript-viewer.tsx # Main viewer orchestrator
│   │   ├── turn-card.tsx        # Individual turn display
│   │   ├── sidebar.tsx          # Timeline navigation
│   │   ├── search-dialog.tsx    # Global search interface
│   │   ├── theme-toggle.tsx     # Dark/light mode switch
│   │   ├── metadata-panel.tsx   # Session stats
│   │   └── ui/                  # shadcn-style primitives
│   │       ├── badge.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── scroll-area.tsx
│   │       └── separator.tsx
│   └── lib/
│       ├── types.ts             # TranscriptTurn, Transcript, Parser types
│       ├── utils.ts             # cn(), formatDuration(), etc.
│       └── parsers/
│           ├── index.ts         # Parser registry + auto-detection
│           ├── claude-code.ts   # Claude Code JSONL parser
│           ├── codex.ts         # Codex / OpenDevin parser
│           └── generic.ts       # Generic JSON/JSONL fallback
├── public/
│   └── demo-transcripts/
│       └── claude-code-demo.jsonl  # Demo transcript
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **UI:** Custom shadcn/ui-style components with Radix UI primitives
- **Icons:** Lucide React
- **Markdown:** react-markdown + remark-gfm + rehype-katex (KaTeX)
- **State:** React hooks (no external state management needed)
- **Dark Mode:** next-themes

---

## v0.1 Limitations

- **Virtualization not implemented** — very long transcripts (>500 turns) may feel slower. The collapsible sections help mitigate this.
- **Single file upload** — drag-and-drop loads one file at a time; no batch/folder upload yet.
- **Parser coverage** — only Claude Code and generic formats. SWE-agent, Aider, and other popular formats need dedicated parsers.
- **No backend** — entirely client-side. This is a feature (privacy) but means no server-side persistence.
- **No diff view** — comparing two sessions side-by-side is not yet supported.

---

## Roadmap

### Short-term
- [ ] Add parsers for SWE-agent, Aider, Cursor, and GitHub Copilot Chat exports
- [ ] Transcript history (localStorage/indexedDB)
- [ ] Better error recovery and parsing diagnostics
- [ ] Virtual scrolling for long transcripts (react-window / tanstack-virtual)
- [ ] Keyboard shortcuts: `j`/`k` to navigate between turns

### Medium-term
- [ ] Anomaly detection — highlight statistical outliers (unusually long tool calls, error cascades, hallucinated files)
- [ ] Multi-transcript comparison (side-by-side diff view)
- [ ] Collapsible groups (auto-group tool_call + tool_result into expandable cards)
- [ ] Obsidian/Notion export
- [ ] Configurable highlight rules (user-defined regex patterns)

### Long-term
- [ ] Self-hosted web version (optional backend for sharing)
- [ ] Real-time streaming view (watch an agent session live)
- [ ] Plugin system for custom visualizers

---

## Contributing

Contributions are welcome, especially:

- **New parsers** — see "Adding a New Parser" above
- **Better highlighting rules** — `src/components/turn-card.tsx` has the `toolCallNeedsWarning` function; add your own heuristics
- **UI polish** — animations, responsive improvements, accessibility

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-parser`)
3. Commit your changes (`git commit -m 'Add parser for Amazing Agent'`)
4. Push to the branch (`git push origin feature/amazing-parser`)
5. Open a Pull Request

---

## License

[MIT](LICENSE)

---

## Acknowledgements

- [Tim Hua](https://www.lesswrong.com/users/tim-hua) for the insightful [analysis](https://www.lesswrong.com/posts/LCmqd3TKK35pBcyqN/claude-code-s-transparent-misunderstandings) of Claude Code transparency issues that inspired this tool
- The [Claude Code](https://docs.anthropic.com/en/docs/claude-code) team for creating a powerful coding agent worth debugging
- [shadcn/ui](https://ui.shadcn.com/) for the component design inspiration
