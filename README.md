<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/hero.svg">
    <img alt="Agent Trace Viewer — Make sense of your coding agent's black box" src="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/hero.svg" width="100%">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/NullLabTests/agent-trace-viewer/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square&labelColor=1a1a2e&color=6366f1" alt="MIT License">
  </a>
  <a href="https://github.com/NullLabTests/agent-trace-viewer/releases">
    <img src="https://img.shields.io/github/v/release/NullLabTests/agent-trace-viewer?style=flat-square&labelColor=1a1a2e&color=10b981&include_prereleases" alt="Latest Release">
  </a>
  <a href="https://github.com/NullLabTests/agent-trace-viewer">
    <img src="https://img.shields.io/github/stars/NullLabTests/agent-trace-viewer?style=flat-square&labelColor=1a1a2e&color=f59e0b" alt="GitHub Stars">
  </a>
  <a href="https://github.com/NullLabTests/agent-trace-viewer/blob/main/README.md">
    <img src="https://img.shields.io/badge/built%20with-Next.js%2016-000?style=flat-square&logo=next.js&labelColor=1a1a2e&color=8b5cf6" alt="Built with Next.js">
  </a>
</p>

<br>

> **"Coding agent transcripts are almost incomprehensible — hundreds of pages of raw tool calls, lossy WebFetch summaries, invisible subagent reasoning, and no way to jump to the interesting parts."**  
> — Inspired by pain points from [Tim Hua's LessWrong post](https://www.lesswrong.com/posts/LCmqd3TKK35pBcyqN/claude-code-s-transparent-misunderstandings)

<br>

<p align="center">
  <b>Ever tried debugging a coding agent by reading raw JSONL?</b><br>
  <i>It's a nightmare of nested objects, stream deltas, and lost context.</i>
</p>

<br>

**Agent Trace Viewer turns that firehose into a readable, searchable, debuggable conversation.** Every tool call, every thought, every result — beautifully laid out, color-coded, and jumpable. **100% local. Zero tracking. Open source.**

<br>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/why.svg">
    <img alt="Why Agent Trace Viewer — Problems and Solutions" src="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/why.svg" width="100%">
  </picture>
</p>

<br>

---

<br>

<p align="center">
  <b>⬇️ Try it in 30 seconds ⬇️</b>
</p>

```bash
git clone https://github.com/NullLabTests/agent-trace-viewer.git
cd agent-trace-viewer
pnpm install
pnpm dev
```

**Open http://localhost:3000** — the demo loads immediately. No config, no signup, no API keys.

<p align="center">
  <sub>Requires Node.js 18+ &middot; Install pnpm: <code>npm install -g pnpm</code></sub>
</p>

<br>

---

<br>

## 🖥️ What It Looks Like

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/showcase.svg">
    <img alt="Agent Trace Viewer app showcase with annotations" src="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/showcase.svg" width="100%">
  </picture>
</p>

<br>

<p align="center">
  <b>①</b> Timeline sidebar &mdash; click any turn to jump &nbsp;&nbsp;&nbsp;
  <b>②</b> Collapse/expand thinking traces &nbsp;&nbsp;&nbsp;
  <b>③</b> Auto-warnings for errors, slow calls, lossy summaries
</p>

<br>

---

<br>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/formats.svg">
    <img alt="Supported Agent Formats" src="https://raw.githubusercontent.com/NullLabTests/agent-trace-viewer/main/public/formats.svg" width="100%">
  </picture>
</p>

<br>

---

<br>

## ✨ Features That Matter

<br>

### 🧠 Actually Understand What Your Agent Did

| What you get | What you don't get |
|-------------|-------------------|
| 🎨 Color-coded cards — user, assistant, thinking, tool calls, results, system | 🗑️ Raw JSONL with nested stream deltas |
| 📖 Collapsible sections — expand what matters, collapse the noise | 🤯 One giant wall of text |
| 🖼️ Rich Markdown + LaTeX rendering via KaTeX | ❌ Escaped JSON strings and truncated output |
| 🏷️ Visual hierarchy — icons, badges, timestamps, durations | 🔍 Having to grep for what you need |

<br>

### ⚠️ Spot Problems Without Reading Every Line

Automatic warning badges flag issues as they appear:

| When this happens | You see this |
|------------------|-------------|
| Tool call takes >30s | <code>&nbsp;🔴 Took 45s&nbsp;</code> |
| Tool result contains "error"/"failed"/traceback | <code>&nbsp;🔴 Tool returned error&nbsp;</code> |
| Tool result is massive (>5,000 chars) | <code>&nbsp;🟡 Large result&nbsp;</code> |
| WebFetch tool was used (lossy summarization risk) | <code>&nbsp;🟡 WebFetch summary&nbsp;</code> |

No need to read every line — **the warnings tell you where to look**.

<br>

### 🔍 Search & Navigate Like a Pro

- **Press `/` or `⌘F`** — instantly search across the entire transcript
- **Timeline sidebar** — a compact bird's-eye view of every turn, clickable to jump
- **Keyboard navigation** — arrow keys through search results, Escape to dismiss
- **Active turn tracking** — the sidebar highlights your current position

<br>

### 📦 Export & Share

- **Export as Markdown** — a clean, readable document of the session
- **Export as JSON** — full annotated data for programmatic analysis
- **Metadata at a glance** — total turns, tool call count, session duration, model name, per-tool usage breakdown

<br>

### 🔒 100% Local, Zero Compromise

> **No data ever leaves your machine.** Parse, render, and search entirely in your browser. No server, no API calls, no telemetry, no signup. Open the app, load a file, and you're offline.

<br>

---

<br>

## 📥 Exporting Transcripts From Your Agent

<br>

<details>
<summary><b>🔬 Claude Code</b> — <i>click to expand</i></summary>
<br>

```bash
# Claude Code saves logs by default. Find them here:
cat ~/.claude/logs/<session-id>.jsonl

# Or capture a session in real time:
claude --log-level debug 2>&1 | tee session.jsonl
```
The format uses `role: "user"` / `role: "assistant"` messages with content blocks: `text`, `thinking`, `tool_use`, `tool_result`.

</details>

<br>

<details>
<summary><b>🦙 Ollama / Local LLMs</b> — <i>click to expand</i></summary>
<br>

```bash
# Log an Ollama chat session to a file:
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": false
}' -o ollama-session.jsonl
```
Each line has `model`, `message.role`, `message.content`, and optional `message.tool_calls`. Duration and token counts are extracted automatically.

</details>

<br>

<details>
<summary><b>🤖 SWE-agent</b> — <i>click to expand</i></summary>
<br>

SWE-agent logs trajectories as JSON arrays with `action`, `observation`, and `thought` fields. Just save the `.traj` or `.json` file and load it. Actions are mapped to human-readable tool names.

</details>

<br>

<details>
<summary><b>🧑‍💻 Aider</b> — <i>click to expand</i></summary>
<br>

Aider logs can be JSONL with `role`, `content`, `toolName`, `toolArgs`, `toolResult` fields, or markdown with `#### User:` / `#### Assistant:` headers. Both are auto-detected.

</details>

<br>

<details>
<summary><b>⚡ Codex / OpenDevin</b> — <i>click to expand</i></summary>
<br>

Any JSON or JSONL with message-based structure and tool call/result fields. The generic parser catches these automatically.

</details>

<br>

<details>
<summary><b>📄 Any JSON/JSONL</b> — <i>click to expand</i></summary>
<br>

Don't see your agent? Just try loading the file. The generic fallback parser will attempt to extract content from any JSON or JSONL file with `role`, `content`, `type`, or `message` fields.

</details>

<br>

---

<br>

## 🔌 Adding a New Parser in 10 Lines

Have a custom agent or a format we don't support? **Add a parser in less time than it takes to read this section:**

```ts
// src/lib/parsers/my-agent.ts
import { Parser, Transcript } from '../types';
import { hashId } from '../utils';

export const myParser: Parser = {
  name: 'My Agent',
  description: 'Parses My Agent log format',
  canParse: (content: string, fileName?: string) => {
    return fileName?.endsWith('.myagent') || false;
  },
  parse: (content: string, fileName?: string): Transcript => ({
    id: hashId(),
    title: fileName || 'My Agent Transcript',
    turns: [/* your turn parsing logic */],
    source: fileName || 'unknown',
  }),
};
```

Then register it:

```ts
// src/lib/parsers/index.ts
import { myParser } from './my-agent';
export const parsers: Parser[] = [myParser, /* ... */];
```

**That's it.** The auto-detection pipeline picks it up automatically. Open a PR and share it!

<br>

---

<br>

## 🏗️ Project Anatomy

```
agent-trace-viewer/
├── src/
│   ├── app/                          # Next.js app router
│   │   ├── page.tsx                  #   Main page (header + viewer mount)
│   │   ├── layout.tsx                #   Root layout (fonts, KaTeX CDN)
│   │   └── globals.css               #   Tailwind v4 tokens (light + dark)
│   ├── components/
│   │   ├── transcript-viewer.tsx     #   🧠 Core orchestrator
│   │   ├── turn-card.tsx             #   🃏 Individual turn + warning logic
│   │   ├── sidebar.tsx               #   📋 Timeline navigation
│   │   ├── search-dialog.tsx         #   🔍 Global search (⌘F)
│   │   ├── theme-toggle.tsx          #   🌓 Dark/light switch
│   │   ├── metadata-panel.tsx        #   📊 Session stats grid
│   │   └── ui/                       #   🧩 Primitives
│   │       ├── badge.tsx, card.tsx, dialog.tsx
│   │       ├── scroll-area.tsx, separator.tsx
│   └── lib/
│       ├── types.ts                  #   📐 TranscriptTurn, Parser interfaces
│       ├── utils.ts                  #   🔧 cn(), formatDuration(), hashId()
│       └── parsers/                  #   🔌 Parser modules
│           ├── index.ts              #     Registry + auto-detection
│           ├── claude-code.ts        #     Claude Code JSONL
│           ├── ollama.ts             #     Ollama / local LLMs
│           ├── swe-agent.ts          #     SWE-agent trajectories
│           ├── aider.ts              #     Aider logs
│           ├── codex.ts              #     Codex / OpenDevin
│           └── generic.ts            #     Fallback for any JSON/JSONL
├── public/
│   ├── hero.svg, why.svg, formats.svg, showcase.svg
│   └── demo-transcripts/
│       ├── claude-code-demo.jsonl
│       ├── ollama-demo.jsonl
│       ├── swe-agent-demo.json
│       └── aider-demo.jsonl
├── package.json
├── next.config.ts
└── tsconfig.json
```

<br>

---

<br>

## 🧰 Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2016-000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind%20CSS%20v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Radix%20UI-6366F1?style=flat-square&logo=radixui&logoColor=white" alt="Radix UI">
  <img src="https://img.shields.io/badge/KaTeX-008080?style=flat-square&logo=latex&logoColor=white" alt="KaTeX">
  <img src="https://img.shields.io/badge/Lucide-5EEAD4?style=flat-square&logo=lucide&logoColor=black" alt="Lucide">
</p>

| Category | Choice | Why |
|----------|--------|-----|
| **Framework** | Next.js 16 (App Router) | File-based routing, fast refreshes, great DX |
| **Language** | TypeScript (strict mode) | Catch bugs before they ship |
| **Styling** | Tailwind CSS v4 (Oklch tokens) | Beautiful colors, tiny bundle, great DX |
| **UI Primitives** | Radix UI | Accessible, unstyled, composable |
| **Icons** | Lucide React | Clean, consistent, tree-shakeable |
| **Markdown** | react-markdown + remark-gfm | Standard Markdown + tables |
| **LaTeX** | rehype-katex + KaTeX CSS | Fast math rendering |
| **Dark Mode** | next-themes | SSR-safe, persistable, zero-config |
| **State** | React hooks (useState, useCallback) | Zero external state deps |

<br>

---

<br>

## 🗺️ Roadmap

### ✅ Done
- [x] Claude Code parser
- [x] Ollama / Local LLM parser
- [x] SWE-agent parser
- [x] Aider parser
- [x] Codex / OpenDevin parser
- [x] Generic JSON/JSONL fallback
- [x] Global search with keyboard navigation
- [x] Timeline sidebar with jump-to-turn
- [x] Collapsible thinking traces and tool results
- [x] Automatic failure/latency warnings
- [x] Dark/light theme
- [x] Markdown + JSON export
- [x] Session metadata panel
- [x] Multi-demo dropdown
- [x] SVG diagrams and visual README

### 🔜 Next
- [ ] Cursor and GitHub Copilot Chat parsers
- [ ] Transcript history (localStorage / IndexedDB)
- [ ] Virtual scrolling for long transcripts (react-window)
- [ ] Keyboard shortcuts: `j`/`k` for turn navigation
- [ ] Better error recovery and parsing diagnostics

### 🚀 Future
- [ ] Anomaly detection — highlight statistical outliers
- [ ] Multi-transcript comparison (side-by-side diff)
- [ ] Smart grouping — auto-collapse tool_call + tool_result pairs
- [ ] Obsidian / Notion export
- [ ] Configurable highlight rules (user-defined regex)
- [ ] Self-hosted web version with optional sharing
- [ ] Real-time streaming view — watch an agent live
- [ ] Plugin system for custom visualizers

<br>

---

<br>

## 👥 Contributing

Contributions are the lifeblood of open source. Here's how you can help:

| Area | How |
|------|-----|
| **New parsers** | ~10 lines of code — see the guide above |
| **Better warnings** | Improve `toolCallNeedsWarning()` in `turn-card.tsx` |
| **UI polish** | Animations, responsive, accessibility |
| **Bug fixes** | Open an issue or PR |
| **Docs** | Improve the README, add examples, fix typos |

```bash
git checkout -b feature/my-contribution
git commit -m "Add awesome feature"
git push origin feature/my-contribution
# Then open a PR on GitHub
```

<br>

---

<br>

## ⚠️ v0.2 Limitations

- **No virtual scrolling** — transcripts >500 turns may feel slower. Collapsible sections mitigate this, but a virtual scroller would be ideal.
- **Single file upload** — no batch/folder upload yet.
- **No Cursor or Copilot Chat parser yet** — contributions welcome!
- **No backend** — client-side by design (privacy first), but no persistence or sharing.

<br>

---

<br>

## 📄 License

<p align="center">
  <a href="https://github.com/NullLabTests/agent-trace-viewer/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/MIT-Open%20source-6366f1?style=for-the-badge&labelColor=1a1a2e" alt="MIT License">
  </a>
</p>

<p align="center">
  Free for any use — commercial or otherwise.
</p>

<br>

---

<br>

## 🙏 Acknowledgements

- **Tim Hua** — for the [LessWrong analysis](https://www.lesswrong.com/posts/LCmqd3TKK35pBcyqN/claude-code-s-transparent-misunderstandings) that directly inspired this project
- **Anthropic's Claude Code team** — for building an agent powerful enough to need debugging
- **shadcn/ui** — for component design patterns
- **You** — for caring about agent transparency

<br>

---

<p align="center">
  <sub>Built with ❤️ for everyone who's ever yelled at an agent log file</sub>
  <br>
  <sub>Agent Trace Viewer &middot; MIT &middot; No data leaves your machine</sub>
</p>
