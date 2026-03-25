import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { ResourceFilters } from '@/components/resource-filters';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { type BreadcrumbItem, type SkillData, type TagData, type PaginatedResponse } from '@/types';
import { Plus, Pencil, Trash2, PackageOpen, Download, Check } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Skills', href: '/skills' }];

interface Props {
    skills: PaginatedResponse<SkillData>;
    filters: Record<string, string | undefined>;
    tags: TagData[];
}

export default function SkillsIndex({ skills, filters, tags }: Props) {
    const [deleteSkill, setDeleteSkill] = useState<SkillData | null>(null);
    const [showMarketplace, setShowMarketplace] = useState(false);
    const [marketplaceSkills, setMarketplaceSkills] = useState<any[]>([]);
    const [loadingMarketplace, setLoadingMarketplace] = useState(false);

    const fetchMarketplace = async () => {
        setLoadingMarketplace(true);
        try {
            const response = await fetch('/skills/marketplace', {
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            const data = await response.json();
            setMarketplaceSkills(data.skills || []);
        } catch {
            setMarketplaceSkills([]);
        } finally {
            setLoadingMarketplace(false);
        }
    };

    const installSkill = (skill: any) => {
        router.post(route('skills.marketplace.install'), {
            name: skill.name,
            slug: skill.slug,
            description: skill.description,
            content: skill.content,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setMarketplaceSkills((prev: any[]) =>
                    prev.map((s: any) => s.slug === skill.slug ? { ...s, installed: true } : s)
                );
            },
        });
    };

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
                    <Heading title="Skills" description="Operational instructions that AI activates automatically based on triggers. Each skill has a description that tells AI when to use it, and content with the full instructions." />
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setShowMarketplace(true); fetchMarketplace(); }} className="gap-1">
                            <PackageOpen className="h-4 w-4" /> Browse Community Skills
                        </Button>
                        <Button asChild size="sm" className="gap-1">
                            <Link href={route('skills.create')}>
                                <Plus className="h-4 w-4" />
                                New Skill
                            </Link>
                        </Button>
                    </div>
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

                {skills.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {skills.prev_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={skills.prev_page_url}>Previous</Link>
                            </Button>
                        )}
                        <span className="text-sm text-muted-foreground">
                            Page {skills.current_page} of {skills.last_page}
                        </span>
                        {skills.next_page_url && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={skills.next_page_url}>Next</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <Dialog open={showMarketplace} onOpenChange={setShowMarketplace}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Community Skills</DialogTitle>
                        <p className="text-sm text-muted-foreground">Browse and install skills from the Anthropic community repository.</p>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {loadingMarketplace ? (
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="rounded-md border p-4">
                                        <Skeleton className="h-5 w-32 mb-2" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : marketplaceSkills.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Unable to load skills. Check your connection.</p>
                        ) : (
                            marketplaceSkills.map((skill: any) => (
                                <div key={skill.slug} className="flex items-start justify-between gap-4 rounded-md border p-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{skill.name}</h3>
                                            {skill.installed && (
                                                <Badge variant="secondary" className="text-xs">Installed</Badge>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{skill.description}</p>
                                    </div>
                                    <Button
                                        variant={skill.installed ? "outline" : "default"}
                                        size="sm"
                                        disabled={skill.installed}
                                        onClick={() => installSkill(skill)}
                                        className="shrink-0 gap-1"
                                    >
                                        {skill.installed ? (
                                            <><Check className="h-3.5 w-3.5" /> Installed</>
                                        ) : (
                                            <><Download className="h-3.5 w-3.5" /> Install</>
                                        )}
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>

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
