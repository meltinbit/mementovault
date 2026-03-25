import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { ResourceFilters } from '@/components/resource-filters';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem, type SnippetData, type TagData, type PaginatedResponse } from '@/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Snippets', href: '/snippets' }];

interface Props {
    snippets: PaginatedResponse<SnippetData>;
    filters: Record<string, string | undefined>;
    tags: TagData[];
}

export default function SnippetsIndex({ snippets, filters, tags }: Props) {
    const [deleteSnippet, setDeleteSnippet] = useState<SnippetData | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Snippets" />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <Heading title="Snippets" description="Reusable text blocks — prompts, signatures, templates, disclaimers." />
                    <Button asChild size="sm" className="gap-1">
                        <Link href={route('snippets.create')}>
                            <Plus className="h-4 w-4" />
                            New Snippet
                        </Link>
                    </Button>
                </div>

                <ResourceFilters route="/snippets" filters={filters} tagOptions={tags} />

                {snippets.data.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">No snippets found. Create your first snippet to get started.</p>
                ) : (
                    <div className="space-y-2">
                        {snippets.data.map((snippet) => (
                            <div key={snippet.id} className="flex items-center justify-between rounded-md border p-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Link href={route('snippets.edit', snippet.id)} className="truncate font-medium hover:underline">
                                            {snippet.name}
                                        </Link>
                                        {!snippet.is_active && (
                                            <Badge variant="secondary" className="text-xs">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{snippet.content.substring(0, 80)}</p>
                                    {snippet.tags.length > 0 && (
                                        <div className="mt-1 flex gap-1">
                                            {snippet.tags.map((tag) => (
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
                                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                        <Link href={route('snippets.edit', snippet.id)}>
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setDeleteSnippet(snippet)} className="h-8 w-8 p-0 text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {snippets.meta.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {snippets.links.prev && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={snippets.links.prev}>Previous</Link>
                            </Button>
                        )}
                        <span className="text-sm text-muted-foreground">
                            Page {snippets.meta.current_page} of {snippets.meta.last_page}
                        </span>
                        {snippets.links.next && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={snippets.links.next}>Next</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <DeleteConfirmation
                open={!!deleteSnippet}
                onClose={() => setDeleteSnippet(null)}
                onConfirm={() => {
                    if (deleteSnippet) {
                        router.delete(route('snippets.destroy', deleteSnippet.id), {
                            onSuccess: () => setDeleteSnippet(null),
                        });
                    }
                }}
                title={`Delete "${deleteSnippet?.name}"?`}
                description="This will permanently delete this snippet."
            />
        </AppLayout>
    );
}
