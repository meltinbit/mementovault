import { FormEventHandler, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { TagInput } from '@/components/tag-input';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { FolderPickerModal } from '@/components/folder-picker-modal';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type BreadcrumbItem, type AssetData, type AssetFolderData, type TagData } from '@/types';
import { Download, Folder, FolderInput, Trash2, FileText } from 'lucide-react';

interface Props {
    asset: AssetData;
    tags: TagData[];
    folders: AssetFolderData[];
}

function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function AssetEdit({ asset, tags, folders }: Props) {
    const [showDelete, setShowDelete] = useState(false);
    const [showFolderPicker, setShowFolderPicker] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Assets', href: '/assets' },
        { title: asset.name, href: `/assets/${asset.id}/edit` },
    ];

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        name: asset.name,
        description: asset.description || '',
        tag_ids: asset.tags.map((t) => t.id),
        folder_id: asset.folder_id,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('assets.update', asset.id), { preserveScroll: true });
    };

    const handleMoveToFolder = (folderId: number | null) => {
        router.post(
            route('assets.move'),
            { asset_ids: [asset.id], folder_id: folderId },
            { preserveState: true },
        );
    };

    const selectedTags = tags.filter((t) => data.tag_ids.includes(t.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${asset.name}`} />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <Heading title="Edit Asset" description={asset.name} />
                    <Button variant="outline" size="sm" asChild className="gap-1">
                        <a href={route('assets.download', asset.id)}>
                            <Download className="h-4 w-4" /> Download
                        </a>
                    </Button>
                </div>

                <div className="flex items-center gap-3 rounded-md border bg-muted/50 p-3">
                    <div className="rounded-md bg-background p-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{asset.original_filename}</p>
                        <p className="text-xs text-muted-foreground">
                            {asset.mime_type} — {formatSize(asset.size_bytes)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Folder className="h-4 w-4" />
                        <span>{asset.folder?.name ?? 'Root'}</span>
                        <Button variant="ghost" size="sm" onClick={() => setShowFolderPicker(true)} className="h-7 gap-1">
                            <FolderInput className="h-3.5 w-3.5" /> Move
                        </Button>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <p className="text-xs text-muted-foreground">AI-readable description. Important for MCP context.</p>
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

            <FolderPickerModal
                open={showFolderPicker}
                onClose={() => setShowFolderPicker(false)}
                onSelect={handleMoveToFolder}
                folders={folders}
                title="Move asset to folder"
            />

            <DeleteConfirmation
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={() => router.delete(route('assets.destroy', asset.id))}
                title={`Delete "${asset.name}"?`}
                description="This will permanently delete this asset and its file."
            />
        </AppLayout>
    );
}
