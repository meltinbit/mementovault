import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

import { ResourceFilters } from '@/components/resource-filters';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type BreadcrumbItem, type CollectionData, type PaginatedResponse } from '@/types';
import { Plus, Pencil, Trash2, FileText, Zap, Code, Image, FolderOpen } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Neurons', href: '/collections' }];

const typeOptions = [
    { value: 'software_project', label: 'Software Project' },
    { value: 'client_project', label: 'Client Project' },
    { value: 'product_saas', label: 'Product / SaaS' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'custom', label: 'Custom' },
];

interface Props {
    collections: PaginatedResponse<CollectionData>;
    filters: Record<string, string | undefined>;
}

export default function CollectionsIndex({ collections, filters }: Props) {
    const [deleteCollection, setDeleteCollection] = useState<CollectionData | null>(null);

    const handleDelete = () => {
        if (!deleteCollection) return;
        router.delete(route('collections.destroy', deleteCollection.id), {
            onSuccess: () => setDeleteCollection(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Neurons" />
            <div className="space-y-6 p-4">
                <div>
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold tracking-tight">Neurons</h2>
                        <Button asChild size="sm" className="shrink-0 gap-1">
                            <Link href={route('collections.create')}>
                                <Plus className="h-4 w-4" />
                                New Neuron
                            </Link>
                        </Button>
                    </div>
                    <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">Specialized AI roles that bundle documents, skills, snippets, and assets for a specific project. Each neuron gets its own MCP endpoint.</p>
                </div>

                <ResourceFilters route="/collections" filters={filters} typeOptions={typeOptions} typePlaceholder="All types" />

                {collections.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                        <FolderOpen className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">No neurons yet</p>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Neurons are specialized AI roles with their own MCP endpoint. Create one to start organizing your AI context by project.
                        </p>
                        <Button asChild size="sm" className="mt-4 gap-1">
                            <Link href={route('collections.create')}>
                                <Plus className="h-4 w-4" /> Create your first neuron
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {collections.data.map((col) => (
                            <Card key={col.id} className="relative">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: col.color }} />
                                            <Link href={route('collections.show', col.id)} className="font-medium hover:underline">
                                                {col.name}
                                            </Link>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0" title="Edit">
                                                <Link href={route('collections.show', col.id)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setDeleteCollection(col)} className="h-7 w-7 p-0 text-destructive" title="Delete">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="mt-2 text-xs capitalize">
                                        {col.type.replace('_', ' ')}
                                    </Badge>
                                    {col.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{col.description}</p>}
                                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        <span>{new Date(col.created_at).toLocaleDateString()}</span>
                                        <span>·</span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="h-3 w-3" /> {col.documents_count ?? 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Zap className="h-3 w-3" /> {col.skills_count ?? 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Code className="h-3 w-3" /> {col.snippets_count ?? 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Image className="h-3 w-3" /> {col.assets_count ?? 0}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {collections.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {collections.prev_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={collections.prev_page_url}>Previous</Link>
                            </Button>
                        )}
                        <span className="text-sm text-muted-foreground">
                            Page {collections.current_page} of {collections.last_page}
                        </span>
                        {collections.next_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={collections.next_page_url}>Next</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <DeleteConfirmation
                open={!!deleteCollection}
                onClose={() => setDeleteCollection(null)}
                onConfirm={handleDelete}
                title={`Delete "${deleteCollection?.name}"?`}
                description="This will permanently delete this neuron, its documents, and all API tokens."
            />
        </AppLayout>
    );
}
