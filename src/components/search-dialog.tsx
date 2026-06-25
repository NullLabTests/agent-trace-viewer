'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, FileUp, FileDown } from 'lucide-react';
import { TranscriptTurn, SearchMatch } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface SearchDialogProps {
  turns: TranscriptTurn[];
  onSearch: (matches: string[]) => void;
  onClose: () => void;
  onJump: (id: string) => void;
}

export default function SearchDialog({ turns, onSearch, onClose, onJump }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ id: string; snippet: string; type: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      onSearch([]);
      return;
    }
    const lower = query.toLowerCase();
    const matches = turns
      .filter(t => t.content.toLowerCase().includes(lower))
      .map(t => ({
        id: t.id,
        snippet: t.content.slice(0, 120),
        type: t.type,
      }));
    setResults(matches);
    setSelectedIndex(0);
    onSearch(matches.map(m => m.id));
  }, [query, turns, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      onJump(results[selectedIndex].id);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-background border rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search transcript..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
          <kbd className="hidden sm:inline-flex text-[10px] text-muted-foreground/50 border rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        {results.length > 0 && (
          <ScrollArea className="max-h-[50vh]">
            <div className="p-2 space-y-0.5">
              <p className="px-3 py-1 text-[10px] text-muted-foreground/50 uppercase tracking-wider">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => { onJump(r.id); onClose(); }}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors',
                    i === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-muted-foreground'
                  )}
                >
                  <span className="font-medium text-foreground block truncate">{r.type}</span>
                  <span className="line-clamp-1 mt-0.5">{r.snippet}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
        {query && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No results found for &quot;{query}&quot;
          </div>
        )}
      </div>
    </div>
  );
}
