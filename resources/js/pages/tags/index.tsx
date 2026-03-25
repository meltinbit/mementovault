import { FormEventHandler, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { type BreadcrumbItem, type TagData } from '@/types';
import { Plus, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tags', href: '/tags' }];

interface Props {
    tags: TagData[];
}

const colorPalette = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

export default function TagsIndex({ tags }: Props) {
    const [deleteTag, setDeleteTag] = useState<TagData | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        color: '#6366f1',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('tags.store'), { onSuccess: () => reset() });
    };

    const handleDelete = () => {
        if (!deleteTag) return;
        router.delete(route('tags.destroy', deleteTag.id), {
            onSuccess: () => setDeleteTag(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tags" />
            <div className="space-y-6 p-4">
                <Heading title="Tags" description="Create and manage tags to organize your content." />

                <form onSubmit={submit} className="flex items-end gap-3">
                    <div className="grid gap-1.5">
                        <Label htmlFor="tag-name">Name</Label>
                        <Input
                            id="tag-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Tag name"
                            className="h-9 w-48"
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label>Color</Label>
                        <div className="flex gap-1">
                            {colorPalette.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setData('color', color)}
                                    className={`h-7 w-7 rounded-full border-2 transition-transform ${data.color === color ? 'scale-110 border-foreground' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <InputError message={errors.color} />
                    </div>
                    <Button type="submit" size="sm" disabled={processing} className="gap-1">
                        <Plus className="h-4 w-4" />
                        Create
                    </Button>
                </form>

                {tags.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">No tags yet. Create your first tag above.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Badge
                                key={tag.id}
                                variant="secondary"
                                className="gap-1.5 pr-1 text-sm"
                                style={tag.color ? { backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' } : undefined}
                            >
                                {tag.name}
                                <button type="button" onClick={() => setDeleteTag(tag)} className="ml-0.5 rounded-full p-0.5 hover:bg-black/10">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            <DeleteConfirmation
                open={!!deleteTag}
                onClose={() => setDeleteTag(null)}
                onConfirm={handleDelete}
                title={`Delete "${deleteTag?.name}"?`}
                description="This will remove the tag from all associated content."
            />
        </AppLayout>
    );
}
