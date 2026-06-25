'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Upload, FileDown, PanelRightClose, PanelRightOpen, ChevronDown } from 'lucide-react';
import { Transcript } from '@/lib/types';
import { parseTranscript } from '@/lib/parsers';
import TurnCard from './turn-card';
import Sidebar from './sidebar';
import SearchDialog from './search-dialog';
import MetadataPanel from './metadata-panel';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface DemoOption {
  label: string;
  url: string;
  fileName: string;
  description: string;
}

const DEMOS: DemoOption[] = [
  { label: 'Claude Code', url: '/demo-transcripts/claude-code-demo.jsonl', fileName: 'claude-code-demo.jsonl', description: 'Anthropic\'s CLI coding agent — full tool calls, thinking traces' },
  { label: 'Ollama / Local LLM', url: '/demo-transcripts/ollama-demo.jsonl', fileName: 'ollama-demo.jsonl', description: 'Local LLM chat via Ollama API format' },
  { label: 'SWE-agent', url: '/demo-transcripts/swe-agent-demo.json', fileName: 'swe-agent-demo.json', description: 'SWE-agent trajectory on a Django bug fix' },
  { label: 'Aider', url: '/demo-transcripts/aider-demo.jsonl', fileName: 'aider-demo.jsonl', description: 'AI pair programming with tool calls' },
];

export default function TranscriptViewer() {
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchHighlights, setSearchHighlights] = useState<string[]>([]);
  const [activeTurnId, setActiveTurnId] = useState<string | undefined>();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  const handleTranscriptLoaded = useCallback((t: Transcript) => {
    setTranscript(t);
    setActiveTurnId(t.turns[0]?.id);
    setSearchHighlights([]);
    setError(null);
  }, []);

  const loadFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const t = parseTranscript(text, file.name);
      handleTranscriptLoaded(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  }, [handleTranscriptLoaded]);

  const loadDemo = useCallback(async (demo: DemoOption) => {
    setLoading(true);
    setError(null);
    setDemoMenuOpen(false);
    try {
      const res = await fetch(demo.url);
      const text = await res.text();
      const t = parseTranscript(text, demo.fileName);
      handleTranscriptLoaded(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : `Failed to load ${demo.label} demo`);
    } finally {
      setLoading(false);
    }
  }, [handleTranscriptLoaded]);

  const loadDefaultDemo = useCallback(async () => {
    await loadDemo(DEMOS[0]);
  }, [loadDemo]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }, [loadFile]);

  const handleSearch = useCallback((ids: string[]) => {
    setSearchHighlights(ids);
  }, []);

  const handleJump = useCallback((id: string) => {
    setActiveTurnId(id);
    const el = document.getElementById(`turn-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleExport = useCallback((format: 'md' | 'json') => {
    if (!transcript) return;
    let content = '';
    let ext = '';
    if (format === 'md') {
      content = transcript.turns.map(t => {
        const header = `## [${t.type}]${t.toolName ? ' ' + t.toolName : ''}\n`;
        return header + t.content;
      }).join('\n\n---\n\n');
      ext = 'md';
    } else {
      content = JSON.stringify(transcript, null, 2);
      ext = 'json';
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-export.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        if (transcript) setSearchOpen(true);
      }
      if (e.key === '/' && !searchOpen) {
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setDemoMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [transcript, searchOpen]);

  useEffect(() => {
    loadDefaultDemo();
  }, []);

  const parserName = transcript?.parserName;

  if (!transcript) {
    return (
      <div
        className="flex flex-col items-center justify-center flex-1 p-8"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <div className="max-w-md text-center space-y-6">
          <div className="p-4 rounded-2xl bg-muted/30 border border-dashed border-muted-foreground/25 inline-block">
            <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-1">Load an Agent Transcript</h2>
            <p className="text-sm text-muted-foreground">
              Upload a JSONL, JSON, or markdown file from Claude Code, Ollama, Aider, SWE-agent, Codex, or any coding agent.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 cursor-pointer transition-opacity">
              <Upload className="h-4 w-4" />
              Choose File
              <input type="file" accept=".jsonl,.json,.md,.txt" onChange={handleFileInput} className="hidden" />
            </label>
            <span className="text-xs text-muted-foreground">or drop a file here</span>
            <Separator className="max-w-[160px]" />
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load Demo Transcript'}
                <ChevronDown className="h-3 w-3" />
              </button>
              {demoMenuOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-popover border rounded-xl shadow-lg z-20 overflow-hidden">
                  {DEMOS.map((demo) => (
                    <button
                      key={demo.label}
                      onClick={() => loadDemo(demo)}
                      className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0"
                    >
                      <div className="text-sm font-medium">{demo.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{demo.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full">
      {sidebarOpen && (
        <aside className="hidden lg:flex w-64 border-r bg-muted/10 flex-col shrink-0">
          <Sidebar
            turns={transcript.turns}
            activeId={activeTurnId}
            onNavigate={handleJump}
          />
        </aside>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center gap-2 px-4 py-2.5 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
            title="Toggle sidebar"
          >
            {sidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-sm font-semibold truncate">{transcript.title}</h1>
            <span className="text-xs text-muted-foreground/50 shrink-0">
              {transcript.turns.length} turns
            </span>
            {parserName && (
              <Badge variant="outline" className="text-[10px] shrink-0">{parserName}</Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline text-[10px] text-muted-foreground/40 border rounded px-1">/</kbd>
            </button>

            <div className="relative group">
              <button className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground">
                <FileDown className="h-4 w-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-36 bg-popover border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <button onClick={() => handleExport('md')} className="w-full text-left px-3 py-2 text-xs hover:bg-accent rounded-t-lg">Export Markdown</button>
                <button onClick={() => handleExport('json')} className="w-full text-left px-3 py-2 text-xs hover:bg-accent rounded-b-lg">Export JSON</button>
              </div>
            </div>
          </div>
        </header>

        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-1" ref={viewerRef}>
            <div className="mb-6">
              <MetadataPanel transcript={transcript} />
            </div>

            {transcript.turns.map((turn) => (
              <TurnCard
                key={turn.id}
                turn={turn}
                isActive={activeTurnId === turn.id}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      {searchOpen && (
        <SearchDialog
          turns={transcript.turns}
          onSearch={handleSearch}
          onClose={() => setSearchOpen(false)}
          onJump={handleJump}
        />
      )}
    </div>
  );
}
