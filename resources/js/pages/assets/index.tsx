import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { ResourceFilters } from '@/components/resource-filters';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type BreadcrumbItem, type AssetData, type TagData, type PaginatedResponse } from '@/types';
import { Plus, Pencil, Trash2, Download, FileText, Image as ImageIcon, File } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Assets', href: '/assets' }];

const mimeOptions = [
    { value: 'image/', label: 'Images' },
    { value: 'application/pdf', label: 'PDFs' },
    { value: 'text/', label: 'Text files' },
];

function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function MimeIcon({ mime }: { mime: string }) {
    if (mime.startsWith('image/')) return <ImageIcon className="h-5 w-5" />;
    if (mime === 'application/pdf') return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
}

interface Props {
    assets: PaginatedResponse<AssetData>;
    filters: Record<string, string | undefined>;
    tags: TagData[];
}

export default function AssetsIndex({ assets, filters, tags }: Props) {
    const [deleteAsset, setDeleteAsset] = useState<AssetData | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assets" />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <Heading title="Assets" description="Files and media stored in your workspace. Add AI-readable descriptions so Claude understands what each file contains." />
                    <Button asChild size="sm" className="gap-1">
                        <Link href={route('assets.create')}>
                            <Plus className="h-4 w-4" />
                            Upload Asset
                        </Link>
                    </Button>
                </div>

                <ResourceFilters route="/assets" filters={filters} typeOptions={mimeOptions} typePlaceholder="All file types" tagOptions={tags} />

                {assets.data.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">No assets found. Upload your first asset to get started.</p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {assets.data.map((asset) => (
                            <Card key={asset.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="rounded-md bg-muted p-2 text-muted-foreground">
                                            <MimeIcon mime={asset.mime_type} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <Link href={route('assets.edit', asset.id)} className="truncate text-sm font-medium hover:underline">
                                                {asset.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">{asset.original_filename}</p>
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
                                        <Button variant="ghost" size="sm" asChild className="h-7">
                                            <a href={route('assets.download', asset.id)}>
                                                <Download className="mr-1 h-3 w-3" /> Download
                                            </a>
                                        </Button>
                                        <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                                            <Link href={route('assets.edit', asset.id)}>
                                                <Pencil className="h-3 w-3" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setDeleteAsset(asset)} className="h-7 w-7 p-0 text-destructive">
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
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
            </div>

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
