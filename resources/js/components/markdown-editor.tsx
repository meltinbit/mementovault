import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bold, Code, FileCode, Heading2, Heading3, Italic, List, ListOrdered, Eye, Pencil } from 'lucide-react';
import { extractWikilinkSlugs, renderWikilinks } from '@/lib/wikilinks';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minRows?: number;
}

export function MarkdownEditor({ value, onChange, placeholder = 'Write your content in markdown...', minRows = 20 }: MarkdownEditorProps) {
    const [mode, setMode] = useState<'write' | 'preview'>('preview');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [resolvedLinks, setResolvedLinks] = useState<Map<string, string | null>>(new Map());

    // Resolve wikilink slugs when switching to preview or when value changes in preview mode
    useEffect(() => {
        if (mode !== 'preview') return;

        const slugs = extractWikilinkSlugs(value);
        if (slugs.length === 0) {
            setResolvedLinks(new Map());
            return;
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        fetch('/graph/resolve-slugs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
            },
            body: JSON.stringify({ slugs }),
        })
            .then(res => res.json())
            .then((data: Record<string, string | null>) => {
                setResolvedLinks(new Map(Object.entries(data)));
            })
            .catch(() => {
                // If resolution fails, show all as broken
                setResolvedLinks(new Map(slugs.map(s => [s, null])));
            });
    }, [mode, value]);

    const insertMarkdown = useCallback((before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = value.substring(start, end);
        const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
        onChange(newValue);

        requestAnimationFrame(() => {
            textarea.focus();
            const cursorPos = start + before.length + selected.length + after.length;
            textarea.setSelectionRange(cursorPos, cursorPos);
        });
    }, [value, onChange]);

    const toolbarActions = [
        { icon: Bold, action: () => insertMarkdown('**', '**'), label: 'Bold' },
        { icon: Italic, action: () => insertMarkdown('_', '_'), label: 'Italic' },
        { icon: Heading2, action: () => insertMarkdown('## '), label: 'Heading 2' },
        { icon: Heading3, action: () => insertMarkdown('### '), label: 'Heading 3' },
        { icon: List, action: () => insertMarkdown('- '), label: 'Bullet list' },
        { icon: ListOrdered, action: () => insertMarkdown('1. '), label: 'Numbered list' },
        { icon: Code, action: () => insertMarkdown('`', '`'), label: 'Inline code' },
        { icon: FileCode, action: () => insertMarkdown('```\n', '\n```'), label: 'Code block' },
    ];

    return (
        <div className="min-w-0 space-y-2 overflow-hidden">
            <div className="flex flex-wrap items-center gap-2">
                <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as 'write' | 'preview')}>
                    <ToggleGroupItem value="write" aria-label="Write" className="h-8 gap-1 px-2 text-xs">
                        <Pencil className="h-3 w-3" />
                        Write
                    </ToggleGroupItem>
                    <ToggleGroupItem value="preview" aria-label="Preview" className="h-8 gap-1 px-2 text-xs">
                        <Eye className="h-3 w-3" />
                        Preview
                    </ToggleGroupItem>
                </ToggleGroup>
                <div className="flex flex-wrap items-center gap-1">
                    {mode === 'write' && toolbarActions.map((item) => (
                        <Button
                            key={item.label}
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={item.action}
                            title={item.label}
                        >
                            <item.icon className="h-4 w-4" />
                        </Button>
                    ))}
                </div>
            </div>

            {mode === 'write' ? (
                <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={minRows}
                    className="font-mono text-sm"
                />
            ) : (
                <div className="prose prose-sm dark:prose-invert min-h-[320px] max-w-none overflow-hidden rounded-md border border-input bg-background p-4 [&_.wikilink--valid]:text-violet-400 [&_.wikilink--valid]:underline [&_.wikilink--valid]:decoration-violet-400/40 [&_.wikilink--valid]:cursor-pointer [&_.wikilink--broken]:text-red-400 [&_.wikilink--broken]:line-through [&_.wikilink--broken]:cursor-not-allowed" style={{ overflowWrap: 'anywhere' }}>
                    {value ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {renderWikilinks(value, resolvedLinks)}
                        </ReactMarkdown>
                    ) : (
                        <p className="text-muted-foreground">Nothing to preview</p>
                    )}
                </div>
            )}
        </div>
    );
}
