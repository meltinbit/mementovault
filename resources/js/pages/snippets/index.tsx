import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { ResourceFilters } from '@/components/resource-filters';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem, type SnippetData, type TagData, type PaginatedResponse } from '@/types';
import { Plus, Pencil, Trash2, Code } from 'lucide-react';

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
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <Heading title="Snippets" description="Reusable text blocks that AI can insert exactly as written — no interpretation, no modification. Perfect for content that must stay consistent every time. Example: an email signature, a legal disclaimer, a prompt template, or a standard reply." />
                    </div>
                    <Button asChild size="sm" className="shrink-0 gap-1">
                        <Link href={route('snippets.create')}>
                            <Plus className="h-4 w-4" />
                            New Snippet
                        </Link>
                    </Button>
                </div>

                <ResourceFilters route="/snippets" filters={filters} tagOptions={tags} />

                {snippets.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                        <Code className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">No snippets yet</p>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Snippets are reusable text blocks AI inserts as-is — email signatures, disclaimers, prompt templates.
                        </p>
                        <Button asChild size="sm" className="mt-4 gap-1">
                            <Link href={route('snippets.create')}>
                                <Plus className="h-4 w-4" /> Create your first snippet
                            </Link>
                        </Button>
                    </div>
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

                {snippets.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {snippets.prev_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={snippets.prev_page_url}>Previous</Link>
                            </Button>
                        )}
                        <span className="text-sm text-muted-foreground">
                            Page {snippets.current_page} of {snippets.last_page}
                        </span>
                        {snippets.next_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={snippets.next_page_url}>Next</Link>
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
