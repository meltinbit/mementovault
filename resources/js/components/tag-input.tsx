import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type TagData } from '@/types';
import { X, Plus } from 'lucide-react';
import { router } from '@inertiajs/react';

interface TagInputProps {
    selectedTags: TagData[];
    availableTags: TagData[];
    onChange: (tags: TagData[]) => void;
}

export function TagInput({ selectedTags, availableTags, onChange }: TagInputProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedIds = new Set(selectedTags.map((t) => t.id));

    const filtered = availableTags
        .filter((tag) => !selectedIds.has(tag.id))
        .filter((tag) => tag.name.toLowerCase().includes(query.toLowerCase()));

    const canCreate = query.trim().length > 0 && !availableTags.some(
        (tag) => tag.name.toLowerCase() === query.trim().toLowerCase()
    );

    const addTag = (tag: TagData) => {
        onChange([...selectedTags, tag]);
        setQuery('');
        setIsOpen(false);
    };

    const removeTag = (tagId: number) => {
        onChange(selectedTags.filter((t) => t.id !== tagId));
    };

    const createTag = () => {
        const name = query.trim();
        if (!name) return;

        const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        router.post(route('tags.store'), { name, color }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page: any) => {
                const allTags = (page.props as any).tags || (page.props as any).availableTags;
                if (Array.isArray(allTags)) {
                    const newTag = allTags.find((t: TagData) => t.name.toLowerCase() === name.toLowerCase());
                    if (newTag) {
                        addTag(newTag);
                    }
                }
                setQuery('');
            },
        });
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="space-y-2">
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
                        <Badge
                            key={tag.id}
                            variant="secondary"
                            className="gap-1 pr-1"
                            style={tag.color ? { backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' } : undefined}
                        >
                            {tag.name}
                            <button
                                type="button"
                                onClick={() => removeTag(tag.id)}
                                className="ml-0.5 rounded-full p-0.5 hover:bg-black/10"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            <div className="relative">
                <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search or create tags..."
                    className="h-8 text-sm"
                />

                {isOpen && (filtered.length > 0 || canCreate) && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
                        {filtered.slice(0, 8).map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => addTag(tag)}
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                            >
                                {tag.color && (
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} />
                                )}
                                {tag.name}
                            </button>
                        ))}
                        {canCreate && (
                            <button
                                type="button"
                                onClick={createTag}
                                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent"
                            >
                                <Plus className="h-3 w-3" />
                                Create "{query.trim()}"
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
