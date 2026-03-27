import { useState } from 'react';
import { cn } from '@/lib/utils';
import { type AssetFolderData } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronRight, Folder, FolderOpen, FolderRoot } from 'lucide-react';

interface FolderPickerModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (folderId: number | null) => void;
    folders: AssetFolderData[];
    title?: string;
    excludeFolderIds?: number[];
    processing?: boolean;
}

export function FolderPickerModal({
    open,
    onClose,
    onSelect,
    folders,
    title = 'Select folder',
    excludeFolderIds = [],
    processing = false,
}: FolderPickerModalProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const handleConfirm = () => {
        onSelect(selectedId);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Choose a destination folder.</DialogDescription>
                </DialogHeader>
                <div className="max-h-64 overflow-y-auto rounded-md border p-2">
                    <button
                        onClick={() => setSelectedId(null)}
                        className={cn(
                            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                            selectedId === null ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50',
                        )}
                    >
                        <FolderRoot className="h-4 w-4" />
                        Root (no folder)
                    </button>
                    {folders.map((folder) => (
                        <PickerNode
                            key={folder.id}
                            folder={folder}
                            depth={0}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                            excludeFolderIds={excludeFolderIds}
                        />
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={processing}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={processing}>
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface PickerNodeProps {
    folder: AssetFolderData;
    depth: number;
    selectedId: number | null;
    onSelect: (id: number) => void;
    excludeFolderIds: number[];
}

function PickerNode({ folder, depth, selectedId, onSelect, excludeFolderIds }: PickerNodeProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isExcluded = excludeFolderIds.includes(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;
    const isSelected = selectedId === folder.id;

    if (isExcluded) return null;

    return (
        <div>
            <div
                className={cn(
                    'flex items-center gap-1 rounded-md transition-colors',
                    isSelected ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50',
                )}
                style={{ paddingLeft: `${depth * 16 + 4}px` }}
            >
                <button
                    onClick={() => hasChildren && setIsExpanded(!isExpanded)}
                    className={cn('shrink-0 p-0.5', !hasChildren && 'invisible')}
                >
                    <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-90')} />
                </button>
                <button onClick={() => onSelect(folder.id)} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-sm">
                    {isExpanded ? <FolderOpen className="h-4 w-4 shrink-0" /> : <Folder className="h-4 w-4 shrink-0" />}
                    <span className="truncate">{folder.name}</span>
                </button>
            </div>
            {isExpanded && hasChildren && (
                <div>
                    {folder.children
                        .filter((c) => !excludeFolderIds.includes(c.id))
                        .map((child) => (
                            <PickerNode
                                key={child.id}
                                folder={child}
                                depth={depth + 1}
                                selectedId={selectedId}
                                onSelect={onSelect}
                                excludeFolderIds={excludeFolderIds}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}
