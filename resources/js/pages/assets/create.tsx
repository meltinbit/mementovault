import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { AssetUploader } from '@/components/asset-uploader';
import { TagInput } from '@/components/tag-input';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem, type TagData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Assets', href: '/assets' },
    { title: 'Upload', href: '/assets/create' },
];

interface Props {
    tags: TagData[];
}

export default function AssetCreate({ tags }: Props) {
    const { data, setData, post, processing, errors } = useForm<{
        file: File | null;
        name: string;
        description: string;
        tag_ids: number[];
    }>({
        file: null,
        name: '',
        description: '',
        tag_ids: [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('assets.store'), { forceFormData: true });
    };

    const handleFileChange = (file: File | null) => {
        setData((prev) => ({
            ...prev,
            file,
            name: prev.name || (file?.name.replace(/\.[^/.]+$/, '') || ''),
        }));
    };

    const selectedTags = tags.filter((t) => data.tag_ids.includes(t.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload Asset" />
            <div className="space-y-6 p-4">
                <Heading title="Upload Asset" description="Upload a file to your workspace." />
                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>File</Label>
                        <AssetUploader onChange={handleFileChange} />
                        <InputError message={errors.file} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <p className="text-xs text-muted-foreground">AI can't read files directly — this description is what Claude sees via MCP. Be specific about what the file contains, its purpose, and when AI should reference it.</p>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                        />
                        <InputError message={errors.description} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <TagInput
                            selectedTags={selectedTags}
                            availableTags={tags}
                            onChange={(newTags) => setData('tag_ids', newTags.map((t) => t.id))}
                        />
                    </div>
                    <Button disabled={processing || !data.file}>Upload Asset</Button>
                </form>
            </div>
        </AppLayout>
    );
}
