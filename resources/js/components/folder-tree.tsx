import { useState } from 'react';
import { router } from '@inertiajs/react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { type AssetFolderData } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ChevronRight,
    Folder,
    FolderOpen,
    FolderRoot,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';

interface FolderTreeProps {
    folders: AssetFolderData[];
    currentFolderId: number | string | null | undefined;
    totalCount: number;
    rootCount: number;
    onCreateFolder: (parentId: number | null) => void;
    onRenameFolder: (folder: AssetFolderData) => void;
    onDeleteFolder: (folder: AssetFolderData) => void;
}

export function FolderTree({ folders, currentFolderId, totalCount, rootCount, onCreateFolder, onRenameFolder, onDeleteFolder }: FolderTreeProps) {
    return (
        <div className="flex flex-col gap-0.5 py-2">
            <AllAssetsItem isActive={currentFolderId === undefined || currentFolderId === null} count={totalCount} />
            <RootItem isActive={currentFolderId === 'root'} count={rootCount} />
            {folders.map((folder) => (
                <FolderNode
                    key={folder.id}
                    folder={folder}
                    depth={0}
                    currentFolderId={currentFolderId}
                    onCreateFolder={onCreateFolder}
                    onRenameFolder={onRenameFolder}
                    onDeleteFolder={onDeleteFolder}
                />
            ))}
            <button
                onClick={() => onCreateFolder(null)}
                className="mt-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
                <Plus className="h-3.5 w-3.5" />
                New Folder
            </button>
        </div>
    );
}

function AllAssetsItem({ isActive, count }: { isActive: boolean; count: number }) {
    return (
        <button
            onClick={() => router.get('/assets', {}, { preserveState: true })}
            className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50',
            )}
        >
            <FolderRoot className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">All Assets</span>
            {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
        </button>
    );
}

function RootItem({ isActive, count }: { isActive: boolean; count: number }) {
    const { setNodeRef, isOver } = useDroppable({ id: 'folder-root' });

    return (
        <button
            ref={setNodeRef}
            onClick={() => router.get('/assets', { folder_id: 'root' }, { preserveState: true })}
            className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                isActive ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-accent/50',
                isOver && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
            )}
        >
            <Folder className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Root</span>
            {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
        </button>
    );
}

interface FolderNodeProps {
    folder: AssetFolderData;
    depth: number;
    currentFolderId: number | string | null | undefined;
    onCreateFolder: (parentId: number | null) => void;
    onRenameFolder: (folder: AssetFolderData) => void;
    onDeleteFolder: (folder: AssetFolderData) => void;
}

function FolderNode({ folder, depth, currentFolderId, onCreateFolder, onRenameFolder, onDeleteFolder }: FolderNodeProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isActive = currentFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    const { setNodeRef, isOver } = useDroppable({ id: `folder-${folder.id}` });

    const navigate = () => {
        router.get('/assets', { folder_id: folder.id }, { preserveState: true });
    };

    return (
        <div>
            <div
                ref={setNodeRef}
                className={cn(
                    'group flex items-center gap-1 rounded-md pr-1 transition-colors',
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50',
                    isOver && 'ring-2 ring-primary ring-offset-1 ring-offset-background',
                )}
                style={{ paddingLeft: `${depth * 16 + 4}px` }}
            >
                <button
                    onClick={() => hasChildren && setIsExpanded(!isExpanded)}
                    className={cn('shrink-0 p-0.5', !hasChildren && 'invisible')}
                >
                    <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-90')} />
                </button>
                <button onClick={navigate} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-sm">
                    {isExpanded ? <FolderOpen className="h-4 w-4 shrink-0" /> : <Folder className="h-4 w-4 shrink-0" />}
                    <span className="truncate">{folder.name}</span>
                    {folder.assets_count > 0 && (
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">{folder.assets_count}</span>
                    )}
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="shrink-0 rounded p-0.5 opacity-0 hover:bg-accent group-hover:opacity-100">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="right">
                        <DropdownMenuItem onClick={() => onCreateFolder(folder.id)}>
                            <Plus className="mr-2 h-4 w-4" /> New Subfolder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRenameFolder(folder)}>
                            <Pencil className="mr-2 h-4 w-4" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteFolder(folder)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {isExpanded && hasChildren && (
                <div>
                    {folder.children.map((child) => (
                        <FolderNode
                            key={child.id}
                            folder={child}
                            depth={depth + 1}
                            currentFolderId={currentFolderId}
                            onCreateFolder={onCreateFolder}
                            onRenameFolder={onRenameFolder}
                            onDeleteFolder={onDeleteFolder}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
