import { useForm, router } from '@inertiajs/react';
import { useCallback, useState, FormEventHandler } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { ImageLightbox } from '@/components/image-lightbox';
import { type AssetData, type TagData } from '@/types';
import { Download, FileText, Image as ImageIcon, File, Trash2 } from 'lucide-react';

function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function MimeIcon({ mime }: { mime: string }) {
    if (mime.startsWith('image/')) return <ImageIcon className="h-8 w-8" />;
    if (mime === 'application/pdf') return <FileText className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
}

interface AssetDetailPanelProps {
    asset: AssetData | null;
    onClose: () => void;
    tags: TagData[];
}

export function AssetDetailPanel({ asset, onClose, tags }: AssetDetailPanelProps) {
    const [showDelete, setShowDelete] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    const { data, setData, put, processing } = useForm({
        name: asset?.name ?? '',
        description: asset?.description ?? '',
        tag_ids: asset?.tags.map((t) => t.id) ?? [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!asset) return;
        put(route('assets.update', asset.id), { preserveState: true });
    };

    if (!asset) return null;

    return (
        <>
            <Sheet open={!!asset} onOpenChange={(isOpen) => !isOpen && onClose()}>
                <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle className="truncate">{asset.name}</SheetTitle>
                        <SheetDescription>{asset.original_filename}</SheetDescription>
                    </SheetHeader>

                    <div className="mt-4 space-y-6">
                        {asset.thumbnail_url && asset.mime_type.startsWith('video/') ? (
                            <div className="overflow-hidden rounded-lg border bg-muted">
                                <video src={asset.thumbnail_url} controls className="max-h-64 w-full" preload="metadata" />
                            </div>
                        ) : asset.thumbnail_url && asset.mime_type.startsWith('image/') ? (
                            <button
                                type="button"
                                className="w-full cursor-zoom-in overflow-hidden rounded-lg border bg-muted"
                                onClick={() => setLightboxSrc(asset.thumbnail_url!)}
                            >
                                <img src={asset.thumbnail_url} alt={asset.name} className="max-h-48 w-full object-contain" />
                            </button>
                        ) : (
                            <div className="flex items-center justify-center rounded-lg border bg-muted p-8 text-muted-foreground">
                                <MimeIcon mime={asset.mime_type} />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-muted-foreground">Type</span>
                                <p className="font-medium">{asset.mime_type}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Size</span>
                                <p className="font-medium">{formatSize(asset.size_bytes)}</p>
                            </div>
                            {asset.folder && (
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">Folder</span>
                                    <p className="font-medium">{asset.folder.name}</p>
                                </div>
                            )}
                        </div>

                        {asset.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
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

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="panel-name">Name</Label>
                                <Input id="panel-name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="panel-description">Description</Label>
                                <p className="text-xs text-muted-foreground">What Claude sees via MCP.</p>
                                <Textarea
                                    id="panel-description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <Button size="sm" disabled={processing}>
                                Save
                            </Button>
                        </form>

                        <div className="flex gap-2 border-t pt-4">
                            <Button variant="outline" size="sm" asChild className="gap-1.5">
                                <a href={route('assets.download', asset.id)}>
                                    <Download className="h-3.5 w-3.5" /> Download
                                </a>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowDelete(true)} className="gap-1.5 text-destructive">
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <DeleteConfirmation
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={() => {
                    router.delete(route('assets.destroy', asset.id), {
                        onSuccess: () => {
                            setShowDelete(false);
                            onClose();
                        },
                    });
                }}
                title={`Delete "${asset.name}"?`}
                description="This will permanently delete this asset and its file."
            />

            <ImageLightbox src={lightboxSrc} alt={asset.name} onClose={() => setLightboxSrc(null)} />
        </>
    );
}
