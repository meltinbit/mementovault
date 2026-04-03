import { FormEventHandler, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { TagInput } from '@/components/tag-input';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem, type SnippetData, type TagData } from '@/types';
import { Trash2 } from 'lucide-react';

interface Props {
    snippet: SnippetData;
    tags: TagData[];
}

export default function SnippetEdit({ snippet, tags }: Props) {
    const [showDelete, setShowDelete] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Snippets', href: '/snippets' },
        { title: snippet.name, href: `/snippets/${snippet.id}/edit` },
    ];

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name: snippet.name,
        content: snippet.content,
        is_active: snippet.is_active,
        tag_ids: snippet.tags.map((t) => t.id),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('snippets.update', snippet.id), { preserveScroll: true });
    };

    const selectedTags = tags.filter((t) => data.tag_ids.includes(t.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${snippet.name}`} />
            <div className="space-y-6 p-4">
                <Heading title="Edit Snippet" description={snippet.name} />
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea id="content" value={data.content} onChange={(e) => setData('content', e.target.value)} rows={8} />
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
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', !!checked)}
                        />
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
                onConfirm={() => router.delete(route('snippets.destroy', snippet.id))}
                title={`Delete "${snippet.name}"?`}
                description="This will permanently delete this snippet."
            />
        </AppLayout>
    );
}
