<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/hero.svg">
  <img alt="Agent Trace Viewer — Make sense of your coding agent's black box" src="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/hero.svg" width="100%">
</picture>

<br>

> **"Coding agent transcripts are almost incomprehensible — hundreds of pages of raw tool calls, lossy WebFetch summaries, invisible subagent reasoning, and no way to jump to the interesting parts."**  
> — Inspired by pain points from [Tim Hua's LessWrong post](https://www.lesswrong.com/posts/LCmqd3TKK35pBcyqN/claude-code-s-transparent-misunderstandings)

Ever tried debugging a long coding agent session by reading raw JSONL? It's a nightmare of nested objects, stream deltas, and lost context. You end up grepping through thousands of lines looking for what went wrong.

**Agent Trace Viewer turns that firehose into a readable, searchable, debuggable conversation.** Every tool call, every thought, every result — beautifully laid out, color-coded, and jumpable.

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/why.svg">
  <img alt="Why Agent Trace Viewer — Problems and Solutions" src="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/why.svg" width="100%">
</picture>

<br>

## 🚀 Quickstart

```bash
git clone https://github.com/NullLabTests/agent-trace-viewer.git
cd agent-trace-viewer
pnpm install
pnpm dev
```

Open **http://localhost:3000** — the demo transcript loads automatically. Try it before you do anything else.

### Requirements
- **Node.js** 18+  
- **pnpm** — install with `npm install -g pnpm`

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/formats.svg">
  <img alt="Supported Agent Formats" src="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/formats.svg" width="100%">
</picture>

<br>

## ✨ Features

### 🧠 Understand What Your Agent Actually Did

- **Interleaved conversation view** — user messages, assistant replies, thinking traces, tool calls, tool results, and system events all in one scrollable timeline
- **Collapsible sections** — expand/collapse thinking traces and large outputs so you can focus on what matters
- **Rich Markdown + LaTeX rendering** — code blocks, tables, and math render beautifully inline via KaTeX
- **Color-coded cards** — each message type gets its own color and icon for instant visual scanning

### ⚠️ Spot Problems Instantly

Automatic warning badges flag issues like:
| Badge | What it means |
|-------|--------------|
| 🔴 **Took 45s** | Tool call exceeded 30s duration threshold |
| 🔴 **Tool returned error** | Tool result contains "error", "failed", or a traceback |
| 🟡 **Large result** | Tool result is over 5,000 characters |
| 🟡 **WebFetch summary** | WebFetch tool was used — results may be lossy |

### 🔍 Search & Navigate Like a Pro

- **Global search** — press `/` or `⌘F` to search across the entire transcript
- **Timeline sidebar** — compact list of every turn, clickable to jump instantly
- **Keyboard-first** — search with arrow key navigation, dismiss with Escape

### 📦 Export & Analyze

- **Export to Markdown** — cleaned, readable transcript for sharing or documentation
- **Export to JSON** — full annotated data for further analysis
- **Metadata panel** — see total turns, tool call count, session duration, model name, and per-tool usage breakdown at a glance

### 🔒 100% Local, Zero Tracking

- **No data ever leaves your machine.** Parse, render, and search entirely in your browser.
- **No server, no API calls, no telemetry.** Open the app, load a file, and you're offline-capable.
- **Your transcripts stay yours.** Export goes to your downloads, nowhere else.

<br>

---

## 📥 How to Export Transcripts from Your Agent

### Claude Code

```bash
# Claude Code saves logs by default. Find them here:
cat ~/.claude/logs/<session-id>.jsonl

# Or pipe a session in real time:
claude --log-level debug 2>&1 | tee session.jsonl
```

The JSONL format has `role: "user"` / `role: "assistant"` messages with content blocks: `text`, `thinking`, `tool_use`, `tool_result`.

### Ollama / Local LLMs

Ollama's API produces chat completion JSONL with `model`, `message.role`, `message.content`, and optional `message.tool_calls`. Just save the request/response log and load it.

```bash
# Example: log an Ollama chat session
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": false
}' -o ollama-session.jsonl
```

### SWE-agent

SWE-agent logs trajectories as JSON with `trajectory` arrays containing `action`, `observation`, and `thought` fields. Save the JSON file and load it directly.

### Aider

Aider logs can be saved as JSONL with `role`, `content`, `toolName`, `toolArgs`, and `toolResult` fields. Markdown transcripts with `#### User:` / `#### Assistant:` headers are also supported.

### Generic / Any Agent

Any JSONL or JSON file with `role`, `content`, `type`, or `message` fields will be auto-detected by the generic fallback parser. Just try loading it.

<br>

---

## 🔌 Adding a New Parser

Have a custom agent or a format we don't support yet? Adding a parser takes about 10 lines of code:

```ts
// src/lib/parsers/my-agent.ts
import { Parser, Transcript } from '../types';

export const myParser: Parser = {
  name: 'My Agent',
  description: 'Parses My Agent log format',
  canParse: (content: string, fileName?: string) => boolean,
  parse: (content: string, fileName?: string) => Transcript,
};
```

Then register it:

```ts
// src/lib/parsers/index.ts
import { myParser } from './my-agent';
export const parsers: Parser[] = [myParser, /* ...existing... */];
```

That's it. The auto-detection pipeline will pick it up automatically.

<br>

---

## 🏗️ Project Structure

```
agent-trace-viewer/
├── src/
│   ├── app/
│   │   ├── page.tsx             # Main app page with header + viewer
│   │   ├── layout.tsx           # Root layout (Geist fonts, KaTeX CDN)
│   │   └── globals.css          # Tailwind v4 theme (light + dark tokens)
│   ├── components/
│   │   ├── transcript-viewer.tsx # Orchestrator: file loading, state, layout
│   │   ├── turn-card.tsx        # Individual turn display + warning detection
│   │   ├── sidebar.tsx          # Timeline navigation sidebar
│   │   ├── search-dialog.tsx    # Global search with keyboard nav
│   │   ├── theme-toggle.tsx     # Dark/light mode switch
│   │   ├── metadata-panel.tsx   # Session stats grid
│   │   └── ui/                  # Primitive components
│   │       ├── badge.tsx        # Badge with variant support
│   │       ├── card.tsx         # Card layout container
│   │       ├── dialog.tsx       # Modal dialog (Radix)
│   │       ├── scroll-area.tsx  # Styled scrollable area
│   │       └── separator.tsx    # Visual divider
│   ├── lib/
│   │   ├── types.ts             # TranscriptTurn, Transcript, Parser
│   │   ├── utils.ts             # cn(), formatDuration(), hashId()
│   │   └── parsers/
│   │       ├── index.ts         # Registry + auto-detection
│   │       ├── claude-code.ts   # Claude Code JSONL
│   │       ├── ollama.ts        # Ollama / local LLMs
│   │       ├── swe-agent.ts     # SWE-agent trajectories
│   │       ├── aider.ts         # Aider JSONL and markdown
│   │       ├── codex.ts         # Codex / OpenDevin
│   │       └── generic.ts       # Fallback for any JSON/JSONL
├── public/
│   ├── hero.svg                 # Hero diagram
│   ├── why.svg                  # Problem/solution comparison
│   ├── formats.svg              # Supported formats grid
│   └── demo-transcripts/
│       ├── claude-code-demo.jsonl  # Claude Code conversation
│       ├── ollama-demo.jsonl       # Local LLM chat
│       ├── swe-agent-demo.json     # Bug fix trajectory
│       └── aider-demo.jsonl        # AI pair programming
├── package.json
├── next.config.ts
└── tsconfig.json
```

<br>

---

## 🧰 Tech Stack

| Layer | Choice |
|-------|--------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS v4 with Oklch color tokens |
| **UI Primitives** | Radix UI (Dialog, ScrollArea, Separator) |
| **Icons** | Lucide React |
| **Markdown** | react-markdown + remark-gfm + rehype-katex |
| **Dark Mode** | next-themes (default: dark) |
| **State** | React hooks (zero external deps) |

<br>

---

## 🗺️ Roadmap

### Short-term
- [x] ~~Claude Code parser~~ (v0.1)
- [x] ~~Ollama / Local LLM parser~~ (v0.2)
- [x] ~~SWE-agent parser~~ (v0.2)
- [x] ~~Aider parser~~ (v0.2)
- [ ] Cursor and GitHub Copilot Chat parsers
- [ ] Transcript history (localStorage / IndexedDB)
- [ ] Virtual scrolling for very long transcripts (react-window)
- [ ] Better keyboard shortcuts: `j`/`k` for turn navigation

### Medium-term
- [ ] Anomaly detection — highlight statistical outliers (error cascades, hallucinated file paths, unusually long calls)
- [ ] Multi-transcript comparison (side-by-side diff)
- [ ] Smart grouping — auto-collapse tool_call + tool_result into expandable units
- [ ] Obsidian / Notion / Markdown export improvements
- [ ] Configurable highlight rules (user-defined regex patterns)

### Long-term
- [ ] Self-hosted web version with optional backend for sharing
- [ ] Real-time streaming view — watch an agent session live
- [ ] Plugin system for custom visualizers and exporters

<br>

---

## 🤝 Contributing

Contributions are **very welcome**, especially:

| Area | How to help |
|------|-------------|
| **New parsers** | Add a 10-line parser file — see "Adding a New Parser" above |
| **Better warnings** | Improve `toolCallNeedsWarning()` in `turn-card.tsx` |
| **UI polish** | Animations, responsive design, accessibility improvements |
| **Bug fixes** | Open an issue or PR for anything that breaks |

1. Fork the repo
2. `git checkout -b feature/my-contribution`
3. Commit your changes
4. `git push origin feature/my-contribution`
5. Open a Pull Request

<br>

---

## ⚠️ v0.2 Limitations

- **Virtualization not implemented** — transcripts >500 turns may feel slower. Collapsible sections help, but a virtual scroller would be ideal.
- **Single file upload** — drag-and-drop loads one file at a time; no batch/folder upload yet.
- **Cursor and GitHub Copilot Chat** — parsers for these are not yet written (contributions welcome!)
- **No backend** — everything is client-side by design (privacy first), but this means no server-side persistence or sharing.

<br>

---

## 📄 License

[MIT](LICENSE) — free for any use, commercial or otherwise.

<br>

---

## 🙏 Acknowledgements

- **Tim Hua** — for the [excellent LessWrong analysis](https://www.lesswrong.com/posts/LCmqd3TKK35pBcyqN/claude-code-s-transparent-misunderstandings) of Claude Code's transparency problems that directly inspired this project
- **Anthropic's Claude Code team** — for creating a coding agent powerful enough to need debugging
- **shadcn/ui** — for the component design patterns that informed our UI primitives
- **You** — for caring about agent transparency and making debugging suck less
