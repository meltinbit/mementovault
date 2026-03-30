import { useCallback, useRef, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useDraggable, useSensors, useSensor } from '@dnd-kit/core';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { FolderTree } from '@/components/folder-tree';
import { CreateFolderDialog } from '@/components/create-folder-dialog';
import { RenameFolderDialog } from '@/components/rename-folder-dialog';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { BatchActionsToolbar } from '@/components/batch-actions-toolbar';
import { AssetDetailPanel } from '@/components/asset-detail-panel';
import { ImageLightbox } from '@/components/image-lightbox';
import { FolderPickerModal } from '@/components/folder-picker-modal';
import { ResourceFilters } from '@/components/resource-filters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { type BreadcrumbItem, type AssetData, type AssetFolderData, type TagData, type PaginatedResponse } from '@/types';
import {
    CheckSquare,
    ChevronRight,
    Download,
    File,
    FileText,
    FolderRoot,
    Image as ImageIcon,
    LayoutGrid,
    List,
    Loader2,
    Pencil,
    Plus,
    Square,
    Trash2,
    Upload,
    Video,
} from 'lucide-react';

const mimeOptions = [
    { value: 'image/', label: 'Images' },
    { value: 'video/', label: 'Videos' },
    { value: 'application/pdf', label: 'PDFs' },
    { value: 'text/', label: 'Text files' },
];

function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function MimeIcon({ mime, className = 'h-5 w-5' }: { mime: string; className?: string }) {
    if (mime.startsWith('image/')) return <ImageIcon className={className} />;
    if (mime.startsWith('video/')) return <Video className={className} />;
    if (mime === 'application/pdf') return <FileText className={className} />;
    return <File className={className} />;
}

interface Props {
    assets: PaginatedResponse<AssetData>;
    filters: Record<string, string | undefined>;
    tags: TagData[];
    folders: AssetFolderData[];
    currentFolder: AssetFolderData | null;
    totalCount: number;
    rootCount: number;
    storageConfigured: boolean;
}

export default function AssetsIndex({ assets, filters, tags, folders, currentFolder, totalCount, rootCount, storageConfigured }: Props) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [detailAsset, setDetailAsset] = useState<AssetData | null>(null);
    const [deleteAsset, setDeleteAsset] = useState<AssetData | null>(null);
    const [draggedAsset, setDraggedAsset] = useState<AssetData | null>(null);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [createFolderParent, setCreateFolderParent] = useState<number | null | false>(false);
    const [renameFolder, setRenameFolder] = useState<AssetFolderData | null>(null);
    const [deleteFolder, setDeleteFolder] = useState<AssetFolderData | null>(null);

    const lastClickedIndex = useRef<number | null>(null);
    const currentFolderId = filters.folder_id === 'root' ? 'root' : filters.folder_id ? Number(filters.folder_id) : null;

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Assets', href: '/assets' }];
    if (currentFolder) {
        const folderBreadcrumbs = buildFolderBreadcrumbs(currentFolder);
        breadcrumbs.push(...folderBreadcrumbs);
    }

    const toggleSelect = useCallback(
        (id: number, index: number, shiftKey: boolean) => {
            setSelectedIds((prev) => {
                const next = new Set(prev);
                if (shiftKey && lastClickedIndex.current !== null) {
                    const start = Math.min(lastClickedIndex.current, index);
                    const end = Math.max(lastClickedIndex.current, index);
                    for (let i = start; i <= end; i++) {
                        next.add(assets.data[i].id);
                    }
                } else if (next.has(id)) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return next;
            });
            lastClickedIndex.current = index;
        },
        [assets.data],
    );

    const handleDragStart = (event: DragStartEvent) => {
        const asset = assets.data.find((a) => a.id === event.active.id);
        if (asset) setDraggedAsset(asset);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setDraggedAsset(null);
        const { over, activatorEvent } = event;
        if (!over) return;

        const droppedId = over.id as string;
        const isAltKey = (activatorEvent as MouseEvent)?.altKey ?? false;

        let targetFolderId: number | null = null;
        if (droppedId === 'folder-root') {
            targetFolderId = null;
        } else if (droppedId.startsWith('folder-')) {
            targetFolderId = Number(droppedId.replace('folder-', ''));
        } else {
            return;
        }

        const assetIds = selectedIds.size > 0 && selectedIds.has(event.active.id as number) ? Array.from(selectedIds) : [event.active.id as number];

        const routeName = isAltKey ? 'assets.copy' : 'assets.move';
        router.post(
            route(routeName),
            { asset_ids: assetIds, folder_id: targetFolderId },
            {
                preserveState: true,
                onSuccess: () => setSelectedIds(new Set()),
            },
        );
    };

    const [isDraggingFile, setIsDraggingFile] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<{ name: string; done: boolean }[]>([]);
    const dragCounter = useRef(0);

    const handleFileDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            dragCounter.current = 0;
            setIsDraggingFile(false);
            const files = e.dataTransfer.files;
            if (!files.length) return;

            const entries = Array.from(files).map((f) => ({ name: f.name, done: false }));
            setUploadingFiles((prev) => [...prev, ...entries]);

            Array.from(files).forEach((file, i) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('name', file.name.replace(/\.[^/.]+$/, ''));
                if (currentFolderId && currentFolderId !== 'root') formData.append('folder_id', String(currentFolderId));

                router.post(route('assets.store'), formData as any, {
                    forceFormData: true,
                    preserveState: true,
                    onSuccess: () => {
                        setUploadingFiles((prev) => {
                            const next = prev.map((f) => (f.name === file.name && !f.done ? { ...f, done: true } : f));
                            if (next.every((f) => f.done)) {
                                setTimeout(() => setUploadingFiles([]), 1500);
                            }
                            return next;
                        });
                    },
                    onError: () => {
                        setUploadingFiles((prev) => {
                            const next = prev.map((f) => (f.name === file.name && !f.done ? { ...f, done: true } : f));
                            if (next.every((f) => f.done)) {
                                setTimeout(() => setUploadingFiles([]), 1500);
                            }
                            return next;
                        });
                    },
                });
            });
        },
        [currentFolderId],
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current++;
        if (e.dataTransfer.types.includes('Files')) {
            setIsDraggingFile(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDraggingFile(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assets" />
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex h-full">
                    {/* Left panel — Folder tree */}
                    <div className="hidden w-56 shrink-0 border-r px-3 lg:block">
                        <FolderTree
                            folders={folders}
                            currentFolderId={currentFolderId}
                            totalCount={totalCount}
                            rootCount={rootCount}
                            onCreateFolder={(parentId) => setCreateFolderParent(parentId)}
                            onRenameFolder={setRenameFolder}
                            onDeleteFolder={setDeleteFolder}
                        />
                    </div>

                    {/* Right panel — Assets */}
                    <div
                        className="relative flex-1 overflow-y-auto"
                        onDrop={handleFileDrop}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                    >
                        {isDraggingFile && (
                            <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5 backdrop-blur-[1px]">
                                <div className="flex flex-col items-center gap-2 text-primary">
                                    <Upload className="h-10 w-10" />
                                    <p className="text-sm font-medium">Drop files to upload</p>
                                    {currentFolder && (
                                        <p className="text-xs text-muted-foreground">into {currentFolder.name}</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {uploadingFiles.length > 0 && (
                            <div className="mx-4 mt-4 rounded-lg border bg-muted/50 p-3">
                                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                    {uploadingFiles.every((f) => f.done) ? (
                                        <CheckSquare className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {uploadingFiles.every((f) => f.done)
                                        ? `${uploadingFiles.length} file${uploadingFiles.length > 1 ? 's' : ''} uploaded`
                                        : `Uploading ${uploadingFiles.filter((f) => !f.done).length} of ${uploadingFiles.length} file${uploadingFiles.length > 1 ? 's' : ''}...`}
                                </div>
                                <div className="space-y-1">
                                    {uploadingFiles.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {file.done ? (
                                                <CheckSquare className="h-3 w-3 shrink-0 text-green-500" />
                                            ) : (
                                                <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                                            )}
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="space-y-4 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <Heading
                                        title={currentFolder ? currentFolder.name : currentFolderId === 'root' ? 'Root' : 'All Assets'}
                                        description={currentFolderId === 'root' ? 'Assets not in any folder.' : 'Files and media stored in your workspace.'}
                                    />
                                    {currentFolder && <FolderBreadcrumbs folder={currentFolder} />}
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <div className="flex rounded-md border">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`rounded-l-md p-1.5 ${viewMode === 'grid' ? 'bg-accent' : 'hover:bg-accent/50'}`}
                                        >
                                            <LayoutGrid className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`rounded-r-md p-1.5 ${viewMode === 'list' ? 'bg-accent' : 'hover:bg-accent/50'}`}
                                        >
                                            <List className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <Button asChild size="sm" className="gap-1">
                                        <Link
                                            href={route('assets.create', currentFolderId ? { folder_id: currentFolderId } : {})}
                                        >
                                            <Upload className="h-4 w-4" />
                                            Upload
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            <ResourceFilters
                                route="/assets"
                                filters={filters}
                                typeOptions={mimeOptions}
                                typePlaceholder="All file types"
                                tagOptions={tags}
                            />

                            {assets.data.length > 0 && (
                                <div className="flex items-center gap-3 text-sm">
                                    <button
                                        onClick={() => {
                                            if (selectedIds.size === assets.data.length) {
                                                setSelectedIds(new Set());
                                            } else {
                                                setSelectedIds(new Set(assets.data.map((a) => a.id)));
                                            }
                                        }}
                                        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                                    >
                                        {selectedIds.size === assets.data.length && assets.data.length > 0 ? (
                                            <CheckSquare className="h-4 w-4" />
                                        ) : (
                                            <Square className="h-4 w-4" />
                                        )}
                                        {selectedIds.size > 0
                                            ? `${selectedIds.size} of ${assets.total} selected`
                                            : 'Select all'}
                                    </button>
                                </div>
                            )}

                            {!storageConfigured && totalCount === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                                    <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm font-medium">Storage not configured</p>
                                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                                        To upload assets, configure S3-compatible storage (like{' '}
                                        <a href="https://developers.cloudflare.com/r2/" target="_blank" rel="noopener noreferrer" className="underline">Cloudflare R2</a>
                                        {' '}— 10GB free) in{' '}
                                        <Link href="/settings/workspace" className="underline">Settings</Link>.
                                    </p>
                                </div>
                            ) : assets.data.length === 0 ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                                    <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        {currentFolder ? 'This folder is empty.' : 'No assets found.'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">Drag files here or click Upload to add assets.</p>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {assets.data.map((asset, index) => (
                                        <DraggableAssetCard
                                            key={asset.id}
                                            asset={asset}
                                            index={index}
                                            isSelected={selectedIds.has(asset.id)}
                                            anySelected={selectedIds.size > 0}
                                            onToggleSelect={toggleSelect}
                                            onDetail={setDetailAsset}
                                            onDelete={setDeleteAsset}
                                            onLightbox={setLightboxSrc}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="w-8 p-2">
                                                    <Checkbox
                                                        checked={selectedIds.size === assets.data.length && assets.data.length > 0}
                                                        onCheckedChange={() => {
                                                            if (selectedIds.size === assets.data.length) {
                                                                setSelectedIds(new Set());
                                                            } else {
                                                                setSelectedIds(new Set(assets.data.map((a) => a.id)));
                                                            }
                                                        }}
                                                    />
                                                </th>
                                                <th className="p-2">Name</th>
                                                <th className="hidden p-2 md:table-cell">Type</th>
                                                <th className="hidden p-2 md:table-cell">Size</th>
                                                <th className="p-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {assets.data.map((asset, index) => (
                                                <tr
                                                    key={asset.id}
                                                    className="cursor-pointer border-b last:border-0 hover:bg-accent/50"
                                                    onClick={(e) => toggleSelect(asset.id, index, e.shiftKey)}
                                                >
                                                    <td className="p-2">
                                                        <Checkbox
                                                            checked={selectedIds.has(asset.id)}
                                                            onCheckedChange={() => toggleSelect(asset.id, index, false)}
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <button onClick={() => setDetailAsset(asset)} className="flex items-center gap-2 hover:underline">
                                                            <MimeIcon mime={asset.mime_type} className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                            <span className="truncate">{asset.name}</span>
                                                        </button>
                                                    </td>
                                                    <td className="hidden p-2 text-muted-foreground md:table-cell">{asset.mime_type}</td>
                                                    <td className="hidden p-2 text-muted-foreground md:table-cell">{formatSize(asset.size_bytes)}</td>
                                                    <td className="p-2">
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                                                                <a href={route('assets.download', asset.id)}>
                                                                    <Download className="h-3 w-3" />
                                                                </a>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setDeleteAsset(asset)}
                                                                className="h-7 w-7 p-0 text-destructive"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {assets.last_page > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                    {assets.prev_page_url && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={assets.prev_page_url}>Previous</Link>
                                        </Button>
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                        Page {assets.current_page} of {assets.last_page}
                                    </span>
                                    {assets.next_page_url && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={assets.next_page_url}>Next</Link>
                                        </Button>
                                    )}
                                </div>
                            )}

                            <BatchActionsToolbar
                                selectedIds={Array.from(selectedIds)}
                                onClearSelection={() => setSelectedIds(new Set())}
                                folders={folders}
                            />
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {draggedAsset && (
                        <div className="rounded-md border bg-background p-2 shadow-lg">
                            <div className="flex items-center gap-2 text-sm">
                                <MimeIcon mime={draggedAsset.mime_type} className="h-4 w-4" />
                                <span className="truncate">{draggedAsset.name}</span>
                                {selectedIds.size > 1 && selectedIds.has(draggedAsset.id) && (
                                    <Badge variant="secondary" className="text-xs">
                                        +{selectedIds.size - 1}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

            <ImageLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />

            <AssetDetailPanel asset={detailAsset} onClose={() => setDetailAsset(null)} tags={tags} />

            <CreateFolderDialog
                open={createFolderParent !== false}
                onClose={() => setCreateFolderParent(false)}
                parentId={createFolderParent === false ? null : createFolderParent}
            />

            <RenameFolderDialog open={!!renameFolder} onClose={() => setRenameFolder(null)} folder={renameFolder} />

            <DeleteConfirmation
                open={!!deleteFolder}
                onClose={() => setDeleteFolder(null)}
                onConfirm={() => {
                    if (deleteFolder) {
                        router.delete(route('asset-folders.destroy', deleteFolder.id), {
                            preserveState: true,
                            onSuccess: () => setDeleteFolder(null),
                        });
                    }
                }}
                title={`Delete folder "${deleteFolder?.name}"?`}
                description="Assets inside will be moved to root. Sub-folders will also be moved to root."
            />

            <DeleteConfirmation
                open={!!deleteAsset}
                onClose={() => setDeleteAsset(null)}
                onConfirm={() => {
                    if (deleteAsset) {
                        router.delete(route('assets.destroy', deleteAsset.id), {
                            onSuccess: () => setDeleteAsset(null),
                        });
                    }
                }}
                title={`Delete "${deleteAsset?.name}"?`}
                description="This will permanently delete this asset and its file."
            />
        </AppLayout>
    );
}

// --- Sub-components ---

interface DraggableAssetCardProps {
    asset: AssetData;
    index: number;
    isSelected: boolean;
    anySelected: boolean;
    onToggleSelect: (id: number, index: number, shiftKey: boolean) => void;
    onDetail: (asset: AssetData) => void;
    onDelete: (asset: AssetData) => void;
    onLightbox: (src: string) => void;
}

function DraggableAssetCard({ asset, index, isSelected, anySelected, onToggleSelect, onDetail, onDelete, onLightbox }: DraggableAssetCardProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: asset.id });

    return (
        <Card
            ref={setNodeRef}
            className={`cursor-pointer transition-opacity ${isDragging ? 'opacity-40' : ''} ${isSelected ? 'ring-2 ring-primary' : ''}`}
            onClick={(e) => onToggleSelect(asset.id, index, e.shiftKey)}
            {...attributes}
            {...listeners}
        >
            <CardContent className="p-4">
                {asset.thumbnail_url && asset.mime_type.startsWith('video/') && (
                    <div className="mb-3 overflow-hidden rounded-md bg-muted" onClick={(e) => e.stopPropagation()}>
                        <video src={asset.thumbnail_url} controls className="h-32 w-full object-contain" preload="metadata" />
                    </div>
                )}
                {asset.thumbnail_url && asset.mime_type.startsWith('image/') && (
                    <button
                        type="button"
                        className="mb-3 w-full cursor-zoom-in overflow-hidden rounded-md bg-muted"
                        onClick={(e) => {
                            e.stopPropagation();
                            onLightbox(asset.thumbnail_url!);
                        }}
                    >
                        <img src={asset.thumbnail_url} alt={asset.name} className="h-32 w-full object-contain" loading="lazy" />
                    </button>
                )}
                <div className="flex items-start gap-3">
                    <div className="shrink-0">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => onToggleSelect(asset.id, index, false)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    {!asset.thumbnail_url && (
                        <div className="rounded-md bg-muted p-2 text-muted-foreground">
                            <MimeIcon mime={asset.mime_type} />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <button onClick={() => onDetail(asset)} className="block w-full truncate text-left text-sm font-medium hover:underline">
                            {asset.name}
                        </button>
                        <p className="truncate text-xs text-muted-foreground">{asset.original_filename}</p>
                        <p className="text-xs text-muted-foreground">
                            {asset.mime_type} — {formatSize(asset.size_bytes)}
                        </p>
                        {asset.tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                                {asset.tags.map((tag) => (
                                    <Badge
                                        key={tag.id}
                                        variant="secondary"
                                        className="text-xs"
                                        style={tag.color ? { backgroundColor: tag.color + '20', color: tag.color } : undefined}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-3 flex justify-end gap-1">
                    <Button variant="ghost" size="sm" asChild className="h-7" onClick={(e) => e.stopPropagation()}>
                        <a href={route('assets.download', asset.id)}>
                            <Download className="mr-1 h-3 w-3" /> Download
                        </a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                        <Link href={route('assets.edit', asset.id)}>
                            <Pencil className="h-3 w-3" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(asset);
                        }}
                        className="h-7 w-7 p-0 text-destructive"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function FolderBreadcrumbs({ folder }: { folder: AssetFolderData }) {
    const crumbs: { id: number | null; name: string }[] = [];
    let current: AssetFolderData | null | undefined = folder;

    while (current) {
        crumbs.unshift({ id: current.id, name: current.name });
        current = (current as any).parent;
    }

    return (
        <nav className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <button onClick={() => router.get('/assets', {}, { preserveState: true })} className="hover:text-foreground">
                <FolderRoot className="h-3.5 w-3.5" />
            </button>
            {crumbs.map((crumb) => (
                <span key={crumb.id} className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" />
                    <button onClick={() => router.get('/assets', { folder_id: crumb.id }, { preserveState: true })} className="hover:text-foreground">
                        {crumb.name}
                    </button>
                </span>
            ))}
        </nav>
    );
}

function buildFolderBreadcrumbs(folder: AssetFolderData): BreadcrumbItem[] {
    const crumbs: BreadcrumbItem[] = [];
    let current: any = folder;
    while (current) {
        crumbs.unshift({ title: current.name, href: `/assets?folder_id=${current.id}` });
        current = current.parent;
    }
    return crumbs;
}
