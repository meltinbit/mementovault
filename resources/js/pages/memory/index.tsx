import { FormEventHandler, useCallback, useEffect, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem, type CollectionData, type MemoryEntryData, type PaginatedResponse } from '@/types';
import { Archive, ArchiveRestore, ArrowLeft, Check, Pencil, Pin, PinOff, Plus, Search, Trash2, X } from 'lucide-react';

interface Props {
    entries: PaginatedResponse<MemoryEntryData>;
    filters: Record<string, string | undefined>;
    categories: string[];
    collection?: { id: number; name: string; slug: string };
}

const statusTabs = [
    { value: 'active', label: 'Active' },
    { value: 'pinned', label: 'Pinned' },
    { value: 'archived', label: 'Archived' },
    { value: 'all', label: 'All' },
];

export default function MemoryIndex({ entries, filters, categories, collection }: Props) {
    const isCollection = !!collection;
    const baseRoute = isCollection ? `/collections/${collection!.id}/memory` : '/memory';
    const storeRoute = isCollection ? route('collections.memory.store', collection!.id) : route('memory.store');

    const breadcrumbs: BreadcrumbItem[] = isCollection
        ? [
              { title: 'Collections', href: '/collections' },
              { title: collection!.name, href: `/collections/${collection!.id}` },
              { title: 'Memory', href: baseRoute },
          ]
        : [{ title: 'Memory', href: '/memory' }];

    const currentStatus = filters.status || 'active';
    const [search, setSearch] = useState(filters.search || '');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteEntry, setDeleteEntry] = useState<MemoryEntryData | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const addForm = useForm({ content: '', category: '', is_pinned: false });
    const editForm = useForm({ content: '', category: '' });

    // Debounced search
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters({ search: search || undefined });
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const applyFilters = useCallback(
        (newFilters: Record<string, string | undefined>) => {
            const params: Record<string, string> = {};
            const merged = { ...filters, ...newFilters };
            Object.entries(merged).forEach(([key, value]) => {
                if (value && value !== '' && value !== 'all' && !(key === 'status' && value === 'active')) {
                    params[key] = value;
                }
            });
            router.get(baseRoute, params, { preserveState: true, preserveScroll: true });
        },
        [filters, baseRoute],
    );

    const handleAdd: FormEventHandler = (e) => {
        e.preventDefault();
        addForm.post(storeRoute, {
            onSuccess: () => {
                addForm.reset();
                setShowAddForm(false);
            },
            preserveScroll: true,
        });
    };

    const startEdit = (entry: MemoryEntryData) => {
        setEditingId(entry.id);
        editForm.setData({ content: entry.content, category: entry.category || '' });
    };

    const handleEdit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!editingId) return;
        const updateRoute = isCollection
            ? route('collections.memory.update', [collection!.id, editingId])
            : route('memory.update', editingId);
        editForm.put(updateRoute, {
            onSuccess: () => setEditingId(null),
            preserveScroll: true,
        });
    };

    const togglePin = (entry: MemoryEntryData) => {
        const pinRoute = isCollection
            ? route('collections.memory.pin', [collection!.id, entry.id])
            : route('memory.pin', entry.id);
        router.post(pinRoute, {}, { preserveScroll: true });
    };

    const archiveEntry = (entry: MemoryEntryData) => {
        const archiveRoute = isCollection
            ? route('collections.memory.archive', [collection!.id, entry.id])
            : route('memory.archive', entry.id);
        router.post(archiveRoute, {}, { preserveScroll: true });
    };

    const unarchiveEntry = (entry: MemoryEntryData) => {
        const unarchiveRoute = isCollection
            ? route('collections.memory.unarchive', [collection!.id, entry.id])
            : route('memory.unarchive', entry.id);
        router.post(unarchiveRoute, {}, { preserveScroll: true });
    };

    const handleDelete = () => {
        if (!deleteEntry) return;
        const destroyRoute = isCollection
            ? route('collections.memory.destroy', [collection!.id, deleteEntry.id])
            : route('memory.destroy', deleteEntry.id);
        router.delete(destroyRoute, {
            onSuccess: () => setDeleteEntry(null),
            preserveScroll: true,
        });
    };

    const handleBatchArchive = () => {
        const batchRoute = isCollection
            ? route('collections.memory.batch-archive', collection!.id)
            : route('memory.batch-archive');
        router.post(batchRoute, { ids: Array.from(selectedIds) }, {
            onSuccess: () => setSelectedIds(new Set()),
            preserveScroll: true,
        });
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isCollection ? `${collection!.name} Memory` : 'Memory'} />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {isCollection && (
                            <Button variant="outline" size="sm" asChild className="h-8 w-8 p-0">
                                <Link href={`/collections/${collection!.id}`}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                        <Heading
                            title={isCollection ? `${collection!.name} — Memory` : 'Memory'}
                            description="Structured entries that persist across AI conversations. Decisions, preferences, and patterns."
                        />
                    </div>
                    <Button size="sm" className="gap-1" onClick={() => setShowAddForm(!showAddForm)}>
                        <Plus className="h-4 w-4" />
                        Add Entry
                    </Button>
                </div>

                {/* Add form */}
                {showAddForm && (
                    <form onSubmit={handleAdd} className="space-y-3 rounded-md border p-4">
                        <div className="grid gap-2">
                            <Label htmlFor="new-content">Content</Label>
                            <Textarea
                                id="new-content"
                                value={addForm.data.content}
                                onChange={(e) => addForm.setData('content', e.target.value)}
                                rows={2}
                                placeholder="What should AI remember?"
                                autoFocus
                            />
                            <InputError message={addForm.errors.content} />
                        </div>
                        <div className="flex items-end gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="new-category">Category</Label>
                                <Input
                                    id="new-category"
                                    value={addForm.data.category}
                                    onChange={(e) => addForm.setData('category', e.target.value)}
                                    placeholder="e.g. preference, decision"
                                    className="w-48"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" size="sm" disabled={addForm.processing}>
                                    Save
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex rounded-md border">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => applyFilters({ status: tab.value })}
                                className={`px-3 py-1.5 text-sm transition-colors ${
                                    currentStatus === tab.value
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search memories..."
                            className="h-8 w-48 pl-8"
                        />
                    </div>

                    {categories.length > 0 && (
                        <Select
                            value={filters.category || 'all'}
                            onValueChange={(v) => applyFilters({ category: v === 'all' ? undefined : v })}
                        >
                            <SelectTrigger className="h-8 w-40">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* Entry list */}
                {entries.data.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                        No memory entries found. Add your first entry to get started.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {entries.data.map((entry) => (
                            <div key={entry.id} className="flex items-start gap-3 rounded-md border p-3">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.has(entry.id)}
                                    onChange={() => toggleSelect(entry.id)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300"
                                />

                                <div className="min-w-0 flex-1">
                                    {editingId === entry.id ? (
                                        <form onSubmit={handleEdit} className="space-y-2">
                                            <Textarea
                                                value={editForm.data.content}
                                                onChange={(e) => editForm.setData('content', e.target.value)}
                                                rows={2}
                                                autoFocus
                                            />
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={editForm.data.category}
                                                    onChange={(e) => editForm.setData('category', e.target.value)}
                                                    placeholder="Category"
                                                    className="h-7 w-36 text-xs"
                                                />
                                                <Button type="submit" size="sm" className="h-7 gap-1" disabled={editForm.processing}>
                                                    <Check className="h-3 w-3" /> Save
                                                </Button>
                                                <Button type="button" variant="ghost" size="sm" className="h-7" onClick={() => setEditingId(null)}>
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="flex items-start gap-2">
                                                {entry.is_pinned && <span className="text-sm">📌</span>}
                                                <p className="text-sm">{entry.content}</p>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2">
                                                {entry.category && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {entry.category}
                                                    </Badge>
                                                )}
                                                {entry.is_archived && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Archived
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(entry.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {editingId !== entry.id && (
                                    <div className="flex shrink-0 items-center gap-0.5">
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => togglePin(entry)} title={entry.is_pinned ? 'Unpin' : 'Pin'}>
                                            {entry.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEdit(entry)} title="Edit">
                                            <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        {entry.is_archived ? (
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => unarchiveEntry(entry)} title="Unarchive">
                                                <ArchiveRestore className="h-3.5 w-3.5" />
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => archiveEntry(entry)} title="Archive">
                                                <Archive className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteEntry(entry)} title="Delete">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {entries.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {entries.prev_page_url && (
                            <Button variant="outline" size="sm" onClick={() => router.get(entries.prev_page_url!)}>
                                Previous
                            </Button>
                        )}
                        <span className="text-sm text-muted-foreground">
                            Page {entries.current_page} of {entries.last_page}
                        </span>
                        {entries.next_page_url && (
                            <Button variant="outline" size="sm" onClick={() => router.get(entries.next_page_url!)}>
                                Next
                            </Button>
                        )}
                    </div>
                )}

                {/* Batch actions toolbar */}
                {selectedIds.size > 0 && (
                    <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-lg border bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur">
                        <span className="text-sm font-medium">{selectedIds.size} selected</span>
                        <div className="ml-auto flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={handleBatchArchive}>
                                <Archive className="mr-1 h-3.5 w-3.5" />
                                Archive
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <DeleteConfirmation
                open={!!deleteEntry}
                onClose={() => setDeleteEntry(null)}
                onConfirm={handleDelete}
                title="Delete memory entry?"
                description="This will permanently delete this memory entry."
            />
        </AppLayout>
    );
}
