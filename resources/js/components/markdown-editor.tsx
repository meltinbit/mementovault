import { useCallback, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bold, Code, FileCode, Heading2, Heading3, Italic, List, ListOrdered, Eye, Pencil } from 'lucide-react';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minRows?: number;
}

export function MarkdownEditor({ value, onChange, placeholder = 'Write your content in markdown...', minRows = 20 }: MarkdownEditorProps) {
    const [mode, setMode] = useState<'write' | 'preview'>('preview');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        <div className="space-y-2">
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
                <div className="prose prose-sm dark:prose-invert min-h-[320px] max-w-none overflow-x-auto rounded-md border border-input bg-background p-4">
                    {value ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
                    ) : (
                        <p className="text-muted-foreground">Nothing to preview</p>
                    )}
                </div>
            )}
        </div>
    );
}
