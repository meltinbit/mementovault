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
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Plus, Pencil, Trash2, PackageOpen, Download, Check, Github, Loader2, Zap } from 'lucide-react';

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
    const [githubUrl, setGithubUrl] = useState('');
    const [githubSkill, setGithubSkill] = useState<any | null>(null);
    const [githubLoading, setGithubLoading] = useState(false);
    const [githubError, setGithubError] = useState('');

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

    const fetchGithubSkill = async () => {
        if (!githubUrl.trim()) return;
        setGithubLoading(true);
        setGithubError('');
        setGithubSkill(null);
        try {
            const response = await fetch('/skills/marketplace/fetch-github', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''),
                },
                body: JSON.stringify({ url: githubUrl }),
            });
            const data = await response.json();
            if (!response.ok) {
                setGithubError(data.error || 'Failed to fetch skill.');
            } else {
                setGithubSkill(data.skill);
            }
        } catch {
            setGithubError('Network error. Check the URL and try again.');
        } finally {
            setGithubLoading(false);
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
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <Heading title="Skills" description="Operational instructions that AI activates automatically when a specific situation arises. Each skill has a trigger description (tells AI when to activate) and content (the full instructions to follow). Example: a skill named 'Code Review' that triggers when reviewing PRs, with rules like 'check for security vulnerabilities, enforce naming conventions'." />
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setShowMarketplace(true); fetchMarketplace(); }} className="gap-1">
                            <PackageOpen className="h-4 w-4" /> <span className="hidden sm:inline">Browse Community Skills</span><span className="sm:hidden">Community</span>
                        </Button>
                        <Button asChild size="sm" className="gap-1">
                            <Link href={route('skills.create')}>
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">New Skill</span><span className="sm:hidden">New</span>
                            </Link>
                        </Button>
                    </div>
                </div>

                <ResourceFilters route="/skills" filters={filters} tagOptions={tags} />

                {skills.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                        <Zap className="mb-3 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">No skills yet</p>
                        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                            Skills are instructions that AI activates automatically based on triggers. Browse community skills or create your own.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setShowMarketplace(true); fetchMarketplace(); }} className="gap-1">
                                <PackageOpen className="h-4 w-4" /> Browse Community
                            </Button>
                            <Button asChild size="sm" className="gap-1">
                                <Link href={route('skills.create')}>
                                    <Plus className="h-4 w-4" /> Create Skill
                                </Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {skills.data.map((skill) => (
                            <div key={skill.id} className="flex items-center justify-between gap-2 overflow-hidden rounded-md border p-3">
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

            <Dialog open={showMarketplace} onOpenChange={(open) => { setShowMarketplace(open); if (!open) { setGithubUrl(''); setGithubSkill(null); setGithubError(''); } }}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Install Skills</DialogTitle>
                        <p className="text-sm text-muted-foreground">Browse community skills or install from any GitHub repository.</p>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {/* GitHub URL install */}
                        <div className="space-y-2 rounded-md border p-3">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Github className="h-4 w-4" />
                                Install from GitHub
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    placeholder="https://github.com/owner/repo"
                                    className="h-8 text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && fetchGithubSkill()}
                                />
                                <Button size="sm" onClick={fetchGithubSkill} disabled={githubLoading || !githubUrl.trim()} className="h-8 shrink-0">
                                    {githubLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Fetch'}
                                </Button>
                            </div>
                            {githubError && <p className="text-xs text-destructive">{githubError}</p>}
                            {githubSkill && (
                                <div className="flex items-start justify-between gap-3 rounded-md border bg-muted/30 p-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-medium">{githubSkill.name}</h3>
                                            {githubSkill.installed && <Badge variant="secondary" className="text-xs">Installed</Badge>}
                                        </div>
                                        {githubSkill.description && <p className="mt-0.5 text-xs text-muted-foreground">{githubSkill.description}</p>}
                                        <p className="mt-0.5 text-xs text-muted-foreground">{githubSkill.source}</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant={githubSkill.installed ? 'outline' : 'default'}
                                        disabled={githubSkill.installed}
                                        onClick={() => installSkill(githubSkill)}
                                        className="shrink-0 gap-1"
                                    >
                                        {githubSkill.installed ? <><Check className="h-3.5 w-3.5" /> Installed</> : <><Download className="h-3.5 w-3.5" /> Install</>}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Separator />
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
