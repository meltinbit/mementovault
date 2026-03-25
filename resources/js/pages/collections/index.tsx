import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { ResourceFilters } from '@/components/resource-filters';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type BreadcrumbItem, type CollectionData, type PaginatedResponse } from '@/types';
import { Plus, Pencil, Trash2, FileText, Zap, Code, Image } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Collections', href: '/collections' }];

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
            <Head title="Collections" />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <Heading title="Collections" description="Packages of context, each with its own MCP endpoint." />
                    <Button asChild size="sm" className="gap-1">
                        <Link href={route('collections.create')}>
                            <Plus className="h-4 w-4" />
                            New Collection
                        </Link>
                    </Button>
                </div>

                <ResourceFilters route="/collections" filters={filters} typeOptions={typeOptions} typePlaceholder="All types" />

                {collections.data.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">No collections yet. Create your first collection.</p>
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
                                            <Button variant="ghost" size="sm" asChild className="h-7 w-7 p-0">
                                                <Link href={route('collections.edit', col.id)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setDeleteCollection(col)} className="h-7 w-7 p-0 text-destructive">
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="mt-2 text-xs capitalize">
                                        {col.type.replace('_', ' ')}
                                    </Badge>
                                    {col.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{col.description}</p>}
                                    <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
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
                description="This will permanently delete this collection, its system documents, and all API tokens."
            />
        </AppLayout>
    );
}
