import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { ResourceFilters } from '@/components/resource-filters';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem, type SkillData, type TagData, type PaginatedResponse } from '@/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Skills', href: '/skills' }];

interface Props {
    skills: PaginatedResponse<SkillData>;
    filters: Record<string, string | undefined>;
    tags: TagData[];
}

export default function SkillsIndex({ skills, filters, tags }: Props) {
    const [deleteSkill, setDeleteSkill] = useState<SkillData | null>(null);

    const handleDelete = () => {
        if (!deleteSkill) return;
        router.delete(route('skills.destroy', deleteSkill.id), {
            onSuccess: () => setDeleteSkill(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Skills" />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <Heading title="Skills" description="Operational instructions with triggering metadata for AI." />
                    <Button asChild size="sm" className="gap-1">
                        <Link href={route('skills.create')}>
                            <Plus className="h-4 w-4" />
                            New Skill
                        </Link>
                    </Button>
                </div>

                <ResourceFilters route="/skills" filters={filters} tagOptions={tags} />

                {skills.data.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">No skills found. Create your first skill to get started.</p>
                ) : (
                    <div className="space-y-2">
                        {skills.data.map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between rounded-md border p-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Link href={route('skills.edit', skill.id)} className="truncate font-medium hover:underline">
                                            {skill.name}
                                        </Link>
                                        {!skill.is_active && (
                                            <Badge variant="secondary" className="text-xs">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{skill.description.substring(0, 100)}</p>
                                    {skill.tags.length > 0 && (
                                        <div className="mt-1 flex gap-1">
                                            {skill.tags.map((tag) => (
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
                                    <span className="mr-2 text-xs text-muted-foreground">v{skill.version}</span>
                                    <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                        <Link href={route('skills.edit', skill.id)}>
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setDeleteSkill(skill)} className="h-8 w-8 p-0 text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {skills.meta.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {skills.links.prev && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={skills.links.prev}>Previous</Link>
                            </Button>
                        )}
                        <span className="text-sm text-muted-foreground">
                            Page {skills.meta.current_page} of {skills.meta.last_page}
                        </span>
                        {skills.links.next && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={skills.links.next}>Next</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <DeleteConfirmation
                open={!!deleteSkill}
                onClose={() => setDeleteSkill(null)}
                onConfirm={handleDelete}
                title={`Delete "${deleteSkill?.name}"?`}
                description="This will permanently delete this skill and all its revisions."
            />
        </AppLayout>
    );
}
