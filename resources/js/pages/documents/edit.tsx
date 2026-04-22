import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { MarkdownEditor } from '@/components/markdown-editor';
import { RevisionHistory } from '@/components/revision-history';
import { TagInput } from '@/components/tag-input';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem, type DocumentData, type RevisionData, type TagData } from '@/types';
import { FolderOpen, Trash2 } from 'lucide-react';

interface Props {
    document: DocumentData;
    revisions: RevisionData[];
    tags: TagData[];
}

export default function DocumentEdit({ document, revisions, tags }: Props) {
    const [showDelete, setShowDelete] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Documents', href: '/documents' },
        { title: document.title, href: `/documents/${document.id}/edit` },
    ];

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        title: document.title,
        content: document.content,
        type: document.type,
        is_active: document.is_active,
        tag_ids: document.tags.map((t) => t.id),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('documents.update', document.id), { preserveScroll: true });
    };

    const handleRestore = (content: string) => {
        setData('content', content);
    };

    const handleDelete = () => {
        router.delete(route('documents.destroy', document.id));
    };

    const selectedTags = tags.filter((t) => data.tag_ids.includes(t.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${document.title}`} />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <Heading title="Edit Document" description={document.title} />
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="secondary">v{document.version}</Badge>
                        <RevisionHistory revisions={revisions} currentVersion={document.version} onRestore={handleRestore} />
                    </div>
                </div>

                {document.collections && document.collections.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">In:</span>
                        {document.collections.map((col) => (
                            <Link
                                key={col.id}
                                href={route('collections.show', col.id)}
                                className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors hover:bg-accent"
                            >
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.color }} />
                                {col.name}
                            </Link>
                        ))}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
                            <InputError message={errors.title} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="copy">Copy</SelectItem>
                                    <SelectItem value="brand">Brand</SelectItem>
                                    <SelectItem value="process">Process</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.type} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Content</Label>
                        <MarkdownEditor value={data.content} onChange={(v) => setData('content', v)} />
                        <InputError message={errors.content} />
                    </div>

                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <TagInput
                            selectedTags={selectedTags}
                            availableTags={tags}
                            onChange={(newTags) => setData('tag_ids', newTags.map((t) => t.id))}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', !!checked)} />
                        <Label htmlFor="is_active" className="text-sm">
                            Active
                        </Label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                        <Button type="button" variant="destructive" size="sm" onClick={() => setShowDelete(true)} className="gap-1">
                            <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                    </div>
                </form>
            </div>

            <DeleteConfirmation
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
                title={`Delete "${document.title}"?`}
                description="This will permanently delete this document and all its revisions."
            />
        </AppLayout>
    );
}
