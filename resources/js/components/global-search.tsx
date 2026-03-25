import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FileText, Zap, Code, Image, FolderOpen, Search } from 'lucide-react';

interface SearchResult {
    type: 'document' | 'skill' | 'snippet' | 'asset' | 'collection';
    id: number;
    title: string;
    subtitle: string;
    url: string;
}

const typeIcons = {
    document: FileText,
    skill: Zap,
    snippet: Code,
    asset: Image,
    collection: FolderOpen,
};

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    // Cmd+K shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Search debounce
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        const timeout = setTimeout(async () => {
            try {
                const response = await fetch(`/search?q=${encodeURIComponent(query)}`, {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                });
                const data = await response.json();
                setResults(data.results || []);
                setSelectedIndex(0);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 200);

        return () => clearTimeout(timeout);
    }, [query]);

    const navigate = useCallback((url: string) => {
        setOpen(false);
        setQuery('');
        setResults([]);
        router.visit(url);
    }, []);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            navigate(results[selectedIndex].url);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent"
            >
                <Search className="h-4 w-4" />
                <span className="flex-1 text-left">Search...</span>
                <kbd className="hidden rounded border border-input bg-muted px-1.5 py-0.5 text-xs font-mono sm:inline-block">
                    &#8984;K
                </kbd>
            </button>

            <Dialog
                open={open}
                onOpenChange={(isOpen) => {
                    setOpen(isOpen);
                    if (!isOpen) {
                        setQuery('');
                        setResults([]);
                    }
                }}
            >
                <DialogContent className="max-w-lg gap-0 p-0">
                    <div className="flex items-center border-b px-3">
                        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search documents, skills, snippets, assets..."
                            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            autoFocus
                        />
                    </div>

                    {query.length >= 2 && (
                        <div className="max-h-72 overflow-y-auto p-2">
                            {loading ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">Searching...</p>
                            ) : results.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    No results for &quot;{query}&quot;
                                </p>
                            ) : (
                                results.map((result, index) => {
                                    const Icon = typeIcons[result.type] || FileText;
                                    return (
                                        <button
                                            key={`${result.type}-${result.id}`}
                                            type="button"
                                            onClick={() => navigate(result.url)}
                                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                                                index === selectedIndex
                                                    ? 'bg-accent text-accent-foreground'
                                                    : 'hover:bg-accent'
                                            }`}
                                        >
                                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">{result.title}</p>
                                                <p className="truncate text-xs text-muted-foreground capitalize">
                                                    {result.subtitle}
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs capitalize text-muted-foreground">
                                                {result.type}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
