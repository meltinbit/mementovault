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
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem, type TagData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Skills', href: '/skills' },
    { title: 'Create', href: '/skills/create' },
];

interface Props {
    tags: TagData[];
}

export default function SkillCreate({ tags }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        content: '',
        is_active: true,
        tag_ids: [] as number[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('skills.store'));
    };

    const selectedTags = tags.filter((t) => data.tag_ids.includes(t.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Skill" />
            <div className="space-y-6 p-4">
                <Heading title="Create Skill" description="Add a new skill to your workspace." />
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Trigger Description</Label>
                        <p className="text-xs text-muted-foreground">
                            When should AI activate this skill? This description is used for automatic triggering.
                        </p>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                            required
                        />
                        <InputError message={errors.description} />
                    </div>
                    <div className="space-y-2">
                        <Label>Skill Content</Label>
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
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) => setData('is_active', !!checked)}
                        />
                        <Label htmlFor="is_active" className="text-sm">
                            Active
                        </Label>
                    </div>
                    <Button disabled={processing}>Create Skill</Button>
                </form>
            </div>
        </AppLayout>
    );
}
