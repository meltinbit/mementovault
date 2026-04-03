import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { TagInput } from '@/components/tag-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem, type TagData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Snippets', href: '/snippets' },
    { title: 'Create', href: '/snippets/create' },
];

interface Props {
    tags: TagData[];
}

export default function SnippetCreate({ tags }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        content: '',
        is_active: true,
        tag_ids: [] as number[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('snippets.store'), { preserveScroll: true });
    };

    const selectedTags = tags.filter((t) => data.tag_ids.includes(t.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Snippet" />
            <div className="space-y-6 p-4">
                <Heading title="Create Snippet" description="Add a new reusable text block. AI will insert it exactly as written whenever it's referenced. Example: a thank-you email template, a standard project intro, or a meeting agenda format." />
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="content">Content</Label>
                        <p className="text-xs text-muted-foreground">Snippets are raw text — not markdown. Great for: email signatures, prompt templates, disclaimers, code snippets, boilerplate text.</p>
                        <Textarea id="content" value={data.content} onChange={(e) => setData('content', e.target.value)} rows={8} />
                        <InputError message={errors.content} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tags <span className="font-normal text-muted-foreground">(optional)</span></Label>
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
                            Active <span className="font-normal text-muted-foreground">— visible to AI via MCP when enabled</span>
                        </Label>
                    </div>
                    <Button disabled={processing}>Create Snippet</Button>
                </form>
            </div>
        </AppLayout>
    );
}
