import { FormEventHandler, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
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
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem, type SkillData, type RevisionData, type TagData } from '@/types';
import { Trash2 } from 'lucide-react';

interface Props {
    skill: SkillData;
    revisions: RevisionData[];
    tags: TagData[];
}

export default function SkillEdit({ skill, revisions, tags }: Props) {
    const [showDelete, setShowDelete] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Skills', href: '/skills' },
        { title: skill.name, href: `/skills/${skill.id}/edit` },
    ];

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name: skill.name,
        description: skill.description,
        content: skill.content,
        is_active: skill.is_active,
        tag_ids: skill.tags.map((t) => t.id),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('skills.update', skill.id), { preserveScroll: true });
    };

    const selectedTags = tags.filter((t) => data.tag_ids.includes(t.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${skill.name}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <Heading title="Edit Skill" description={skill.name} />
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">v{skill.version}</Badge>
                        <RevisionHistory
                            revisions={revisions}
                            currentVersion={skill.version}
                            onRestore={(content) => setData('content', content)}
                        />
                    </div>
                </div>
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Trigger Description</Label>
                        <p className="text-xs text-muted-foreground">When should AI activate this skill?</p>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
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
                onConfirm={() => router.delete(route('skills.destroy', skill.id))}
                title={`Delete "${skill.name}"?`}
                description="This will permanently delete this skill and all its revisions."
            />
        </AppLayout>
    );
}
