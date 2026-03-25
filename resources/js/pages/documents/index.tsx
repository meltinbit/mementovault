import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { ResourceFilters } from '@/components/resource-filters';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem, type DocumentData, type TagData, type PaginatedResponse } from '@/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Documents', href: '/documents' }];

const typeOptions = [
    { value: 'general', label: 'General' },
    { value: 'technical', label: 'Technical' },
    { value: 'copy', label: 'Copy' },
    { value: 'brand', label: 'Brand' },
    { value: 'process', label: 'Process' },
];

interface Props {
    documents: PaginatedResponse<DocumentData>;
    filters: Record<string, string | undefined>;
    tags: TagData[];
}

export default function DocumentsIndex({ documents, filters, tags }: Props) {
    const [deleteDoc, setDeleteDoc] = useState<DocumentData | null>(null);

    const handleDelete = () => {
        if (!deleteDoc) return;
        router.delete(route('documents.destroy', deleteDoc.id), {
            onSuccess: () => setDeleteDoc(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documents" />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <Heading title="Documents" description="Reference materials for AI — specs, guides, processes, brand docs. These are retrieved on-demand when AI needs deeper context." />
                    <Button asChild size="sm" className="gap-1">
                        <Link href={route('documents.create')}>
                            <Plus className="h-4 w-4" />
                            New Document
                        </Link>
                    </Button>
                </div>

                <ResourceFilters route="/documents" filters={filters} typeOptions={typeOptions} typePlaceholder="All types" tagOptions={tags} />

                {documents.data.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">No documents found. Create your first document to get started.</p>
                ) : (
                    <div className="space-y-2">
                        {documents.data.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between rounded-md border p-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Link href={route('documents.edit', doc.id)} className="truncate font-medium hover:underline">
                                            {doc.title}
                                        </Link>
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {doc.type}
                                        </Badge>
                                        {!doc.is_active && (
                                            <Badge variant="secondary" className="text-xs">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                    {doc.tags.length > 0 && (
                                        <div className="mt-1 flex gap-1">
                                            {doc.tags.map((tag) => (
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
                                <div className="flex items-center gap-1">
                                    <span className="mr-2 text-xs text-muted-foreground">v{doc.version}</span>
                                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                        <Link href={route('documents.edit', doc.id)}>
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setDeleteDoc(doc)} className="h-8 w-8 p-0 text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {documents.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {documents.prev_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={documents.prev_page_url}>Previous</Link>
                            </Button>
                        )}
                        <span className="text-sm text-muted-foreground">
                            Page {documents.current_page} of {documents.last_page}
                        </span>
                        {documents.next_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={documents.next_page_url}>Next</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <DeleteConfirmation
                open={!!deleteDoc}
                onClose={() => setDeleteDoc(null)}
                onConfirm={handleDelete}
                title={`Delete "${deleteDoc?.title}"?`}
                description="This will permanently delete this document and all its revisions."
            />
        </AppLayout>
    );
}
