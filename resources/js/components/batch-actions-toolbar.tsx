import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { FolderPickerModal } from '@/components/folder-picker-modal';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type AssetFolderData, type TagData } from '@/types';
import { Copy, FolderInput, Tag, Trash2, X } from 'lucide-react';

interface BatchActionsToolbarProps {
    selectedIds: number[];
    onClearSelection: () => void;
    folders: AssetFolderData[];
    tags?: TagData[];
}

export function BatchActionsToolbar({ selectedIds, onClearSelection, folders, tags = [] }: BatchActionsToolbarProps) {
    const [showMove, setShowMove] = useState(false);
    const [showCopy, setShowCopy] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showTag, setShowTag] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [processing, setProcessing] = useState(false);

    if (selectedIds.length === 0) return null;

    const handleMove = (folderId: number | null) => {
        setProcessing(true);
        router.post(
            route('assets.move'),
            { asset_ids: selectedIds, folder_id: folderId },
            {
                preserveState: true,
                onSuccess: () => { onClearSelection(); setProcessing(false); },
                onError: () => setProcessing(false),
            },
        );
    };

    const handleCopy = (folderId: number | null) => {
        setProcessing(true);
        router.post(
            route('assets.copy'),
            { asset_ids: selectedIds, folder_id: folderId },
            {
                preserveState: true,
                onSuccess: () => { onClearSelection(); setProcessing(false); },
                onError: () => setProcessing(false),
            },
        );
    };

    const handleDelete = () => {
        setProcessing(true);
        router.post(
            route('assets.batch-delete'),
            { asset_ids: selectedIds },
            {
                preserveState: false,
                onSuccess: () => { onClearSelection(); setShowDelete(false); setProcessing(false); },
                onError: () => setProcessing(false),
            },
        );
    };

    const handleTag = () => {
        if (selectedTagIds.length === 0) return;
        setProcessing(true);
        router.post(
            route('assets.batch-tag'),
            { asset_ids: selectedIds, tag_ids: selectedTagIds },
            {
                preserveState: true,
                onSuccess: () => { setShowTag(false); setSelectedTagIds([]); setProcessing(false); },
                onError: () => setProcessing(false),
            },
        );
    };

    return (
        <>
            <div className="sticky bottom-4 z-10 flex items-center gap-2 rounded-lg border bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur">
                <span className="text-sm font-medium">{selectedIds.length} selected</span>
                <div className="ml-auto flex items-center gap-1">
                    {tags.length > 0 && (
                        <Button variant="outline" size="sm" onClick={() => setShowTag(true)} disabled={processing} className="gap-1.5">
                            <Tag className="h-3.5 w-3.5" /> Tag
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setShowMove(true)} disabled={processing} className="gap-1.5">
                        <FolderInput className="h-3.5 w-3.5" /> Move
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowCopy(true)} disabled={processing} className="gap-1.5">
                        <Copy className="h-3.5 w-3.5" /> Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowDelete(true)} disabled={processing} className="gap-1.5 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClearSelection} className="ml-1 h-7 w-7 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <FolderPickerModal open={showMove} onClose={() => setShowMove(false)} onSelect={handleMove} folders={folders} title="Move to folder" processing={processing} />
            <FolderPickerModal open={showCopy} onClose={() => setShowCopy(false)} onSelect={handleCopy} folders={folders} title="Copy to folder" processing={processing} />
            <DeleteConfirmation
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
                title={`Delete ${selectedIds.length} asset${selectedIds.length > 1 ? 's' : ''}?`}
                description="This will permanently delete the selected assets and their files."
                processing={processing}
            />

            <Dialog open={showTag} onOpenChange={(open) => { if (!open) { setShowTag(false); setSelectedTagIds([]); } }}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Tag {selectedIds.length} asset{selectedIds.length > 1 ? 's' : ''}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-64 space-y-1 overflow-y-auto">
                        {tags.map((tag) => (
                            <label key={tag.id} className="flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted">
                                <Checkbox
                                    checked={selectedTagIds.includes(tag.id)}
                                    onCheckedChange={(checked) => {
                                        setSelectedTagIds(checked
                                            ? [...selectedTagIds, tag.id]
                                            : selectedTagIds.filter((id) => id !== tag.id)
                                        );
                                    }}
                                />
                                <Badge variant="secondary" style={tag.color ? { backgroundColor: tag.color + '20', color: tag.color } : undefined}>
                                    {tag.name}
                                </Badge>
                            </label>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => { setShowTag(false); setSelectedTagIds([]); }}>Cancel</Button>
                        <Button size="sm" onClick={handleTag} disabled={processing || selectedTagIds.length === 0}>
                            Apply {selectedTagIds.length > 0 ? `${selectedTagIds.length} tag${selectedTagIds.length > 1 ? 's' : ''}` : ''}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
