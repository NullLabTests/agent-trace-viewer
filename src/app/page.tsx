'use client';

import { ThemeProvider } from 'next-themes';
import TranscriptViewer from '@/components/transcript-viewer';
import ThemeToggle from '@/components/theme-toggle';
import { ExternalLink, Search } from 'lucide-react';

function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-2.5 border-b bg-background/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <Search className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">Agent Trace Viewer</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/NullLabTests/agent-trace-viewer"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          title="View on GitHub"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="h-full flex flex-col bg-background text-foreground">
        <Header />
        <TranscriptViewer />
      </div>
    </ThemeProvider>
  );
}
