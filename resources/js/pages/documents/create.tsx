import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { MarkdownEditor } from '@/components/markdown-editor';
import { TagInput } from '@/components/tag-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem, type TagData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Documents', href: '/documents' },
    { title: 'Create', href: '/documents/create' },
];

interface Props {
    tags: TagData[];
}

export default function DocumentCreate({ tags }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        content: '',
        type: 'general',
        is_active: true,
        tag_ids: [] as number[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('documents.store'));
    };

    const selectedTags = tags.filter((t) => data.tag_ids.includes(t.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Document" />
            <div className="space-y-6 p-4">
                <Heading title="Create Document" description="Add a new document to your workspace." />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
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
                        <TagInput selectedTags={selectedTags} availableTags={tags} onChange={(newTags) => setData('tag_ids', newTags.map((t) => t.id))} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', !!checked)} />
                        <Label htmlFor="is_active" className="text-sm">
                            Active
                        </Label>
                    </div>

                    <Button disabled={processing}>Create Document</Button>
                </form>
            </div>
        </AppLayout>
    );
}
