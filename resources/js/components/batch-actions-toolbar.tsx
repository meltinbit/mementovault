import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { FolderPickerModal } from '@/components/folder-picker-modal';
import { type AssetFolderData } from '@/types';
import { Copy, FolderInput, Trash2, X } from 'lucide-react';

interface BatchActionsToolbarProps {
    selectedIds: number[];
    onClearSelection: () => void;
    folders: AssetFolderData[];
}

export function BatchActionsToolbar({ selectedIds, onClearSelection, folders }: BatchActionsToolbarProps) {
    const [showMove, setShowMove] = useState(false);
    const [showCopy, setShowCopy] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [processing, setProcessing] = useState(false);

    if (selectedIds.length === 0) return null;

    const handleMove = (folderId: number | null) => {
        setProcessing(true);
        router.post(
            route('assets.move'),
            { asset_ids: selectedIds, folder_id: folderId },
            {
                preserveState: true,
                onSuccess: () => {
                    onClearSelection();
                    setProcessing(false);
                },
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
                onSuccess: () => {
                    onClearSelection();
                    setProcessing(false);
                },
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
                onSuccess: () => {
                    onClearSelection();
                    setShowDelete(false);
                    setProcessing(false);
                },
                onError: () => setProcessing(false),
            },
        );
    };

    return (
        <>
            <div className="sticky bottom-4 z-10 flex items-center gap-2 rounded-lg border bg-background/95 px-4 py-2.5 shadow-lg backdrop-blur">
                <span className="text-sm font-medium">{selectedIds.length} selected</span>
                <div className="ml-auto flex items-center gap-1">
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
        </>
    );
}
