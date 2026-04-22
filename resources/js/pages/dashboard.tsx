import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Deferred } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type BreadcrumbItem, type DashboardStats, type ActivityLogEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { FileText, Zap, Code, Image, FolderOpen, Check, User, BookText, Key, X, ArrowRight, Plus, Database } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface OnboardingChecklist {
    hasToken: boolean;
    identity: boolean;
    instructions: boolean;
    hasCollection: boolean;
}

interface NeuronData {
    id: number;
    name: string;
    slug: string;
    color: string;
    type: string;
    is_active: boolean;
    documents_count: number;
    memory_count: number;
    content_count: number;
    updated_at: string;
    last_mcp_access: string | null;
}

interface DashboardProps {
    stats?: DashboardStats;
    recentActivity?: ActivityLogEntry[];
    neurons?: NeuronData[];
    onboardingChecklist?: OnboardingChecklist;
    hideOnboarding?: boolean;
}

interface StepItem {
    key: keyof OnboardingChecklist;
    step: number;
    label: string;
    why: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const phases: { title: string; steps: StepItem[] }[] = [
    {
        title: 'Connect',
        steps: [
            {
                key: 'hasToken',
                step: 1,
                label: 'Connect via MCP',
                why: 'This is how your AI clients (Claude Code, Cursor, etc.) read and write to your vault.',
                href: '/settings/workspace?tab=mcp',
                icon: Key,
            },
            {
                key: 'identity',
                step: 2,
                label: 'Set up your Identity',
                why: 'Loaded into every AI conversation so it knows who you are from the start.',
                href: '/workspace/identity',
                icon: User,
            },
        ],
    },
    {
        title: 'Customize',
        steps: [
            {
                key: 'instructions',
                step: 3,
                label: 'Write Instructions',
                why: 'Define rules: response language, code style, things to avoid.',
                href: '/workspace/instructions',
                icon: BookText,
            },
            {
                key: 'hasCollection',
                step: 4,
                label: 'Populate a Collection',
                why: 'Collections organize knowledge by project. Each gets its own MCP endpoint.',
                href: '/collections',
                icon: FolderOpen,
            },
        ],
    },
];

const allSteps = phases.flatMap((p) => p.steps);

function GettingStarted({ checklist, onHide }: { checklist: OnboardingChecklist; onHide: () => void }) {
    const completed = allSteps.filter((s) => checklist[s.key]).length;
    const total = allSteps.length;

    if (completed === total) {
        return null;
    }

    return (
        <Card className="relative">
            <button
                type="button"
                onClick={onHide}
                className="absolute right-3 top-3 rounded-sm p-1 text-muted-foreground opacity-70 hover:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>
            <CardHeader className="pb-4">
                <CardTitle className="text-base">Get started with Memento Vault</CardTitle>
                <p className="text-sm text-muted-foreground">Your AI clients need a bridge to your knowledge. Complete these steps to connect everything.</p>
                <div className="flex items-center gap-3 pt-1">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(completed / total) * 100}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{completed}/{total}</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                {phases.map((phase) => (
                    <div key={phase.title}>
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{phase.title}</p>
                        <div className="space-y-2">
                            {phase.steps.map((item) => {
                                const done = checklist[item.key];
                                const isHighlight = item.key === 'hasToken' && !done;
                                return (
                                    <Link
                                        key={item.key}
                                        href={item.href}
                                        className={`group flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent ${
                                            isHighlight ? 'border-primary/50 bg-primary/5' : ''
                                        } ${done ? 'opacity-50' : ''}`}
                                    >
                                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                            done
                                                ? 'bg-primary text-primary-foreground'
                                                : 'border-2 border-muted-foreground/30 text-muted-foreground'
                                        }`}>
                                            {done ? <Check className="h-3.5 w-3.5" /> : item.step}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-medium ${done ? 'line-through' : ''}`}>{item.label}</p>
                                                {isHighlight && <Badge variant="default" className="text-[10px] px-1.5 py-0">Start here</Badge>}
                                            </div>
                                            <p className="mt-0.5 text-xs text-muted-foreground">{item.why}</p>
                                        </div>
                                        {!done && <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function StatsGrid({ stats }: { stats: DashboardStats }) {
    const items = [
        { label: 'Documents', count: stats.documents, icon: FileText },
        { label: 'Skills', count: stats.skills, icon: Zap },
        { label: 'Snippets', count: stats.snippets, icon: Code },
        { label: 'Assets', count: stats.assets, icon: Image },
        { label: 'Collections', count: stats.collections, icon: FolderOpen },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {items.map((item) => (
                <Card key={item.label}>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="rounded-md bg-muted p-2">
                            <item.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{item.count}</p>
                            <p className="text-sm text-muted-foreground">{item.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function StatsGridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="flex items-center gap-3 p-4">
                        <Skeleton className="h-9 w-9 rounded-md" />
                        <div className="space-y-1">
                            <Skeleton className="h-7 w-10" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function activityDot(neuron: NeuronData): { color: string; pulse: boolean; label: string } {
    if (!neuron.is_active) return { color: 'bg-muted-foreground/40', pulse: false, label: 'Inactive' };
    if (neuron.last_mcp_access) {
        const hoursSinceMcp = (Date.now() - new Date(neuron.last_mcp_access).getTime()) / 3600000;
        if (hoursSinceMcp < 24) return { color: 'bg-green-500', pulse: true, label: 'Active via MCP' };
    }
    const daysSinceUpdate = (Date.now() - new Date(neuron.updated_at).getTime()) / 86400000;
    if (daysSinceUpdate < 7) return { color: 'bg-amber-500', pulse: false, label: 'Updated recently' };
    return { color: 'bg-muted-foreground/40', pulse: false, label: 'Stale' };
}

function NeuronStatus({ neurons }: { neurons: NeuronData[] }) {
    if (neurons.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <FolderOpen className="mb-3 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">No neurons yet</p>
                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">Neurons organize your AI context by project. Create one to get started.</p>
                    <Button asChild size="sm" className="mt-4 gap-1">
                        <Link href={route('collections.create')}>
                            <Plus className="h-4 w-4" /> Create your first Neuron
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Neurons</h3>
                <Button asChild variant="outline" size="sm" className="h-7 gap-1 text-xs">
                    <Link href={route('collections.create')}>
                        <Plus className="h-3 w-3" /> New
                    </Link>
                </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {neurons.map((neuron) => {
                    const dot = activityDot(neuron);
                    return (
                        <Link key={neuron.id} href={route('collections.show', neuron.id)}>
                            <Card className="transition-colors hover:bg-accent/50">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: neuron.color }} />
                                            <span className="truncate text-sm font-medium">{neuron.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className={`h-2 w-2 rounded-full ${dot.color} ${dot.pulse ? 'animate-pulse' : ''}`} title={dot.label} />
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="mt-2 text-[10px] capitalize">{neuron.type.replace(/_/g, ' ')}</Badge>
                                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {neuron.documents_count}</span>
                                        <span className="flex items-center gap-1"><Database className="h-3 w-3" /> {neuron.memory_count}</span>
                                        <span className="flex items-center gap-1"><FolderOpen className="h-3 w-3" /> {neuron.content_count}</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                                        <span>Updated {timeAgo(neuron.updated_at)}</span>
                                        <span>MCP: {neuron.last_mcp_access ? timeAgo(neuron.last_mcp_access) : 'Never'}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

function NeuronStatusSkeleton() {
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function ActivityFeed({ activity }: { activity: ActivityLogEntry[] }) {
    if (activity.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-muted-foreground">
                No activity yet. Start by editing your nucleus documents.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {activity.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between gap-4 text-sm">
                    <div>
                        <span className="font-medium capitalize">{entry.action}</span>
                        {' '}
                        <span className="text-muted-foreground">{entry.subject_type}</span>
                        {entry.description && (
                            <span className="text-muted-foreground"> — {entry.description}</span>
                        )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{entry.created_at}</span>
                </div>
            ))}
        </div>
    );
}

function ActivityFeedSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start justify-between gap-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    );
}

export default function Dashboard({ stats, recentActivity, neurons, onboardingChecklist, hideOnboarding }: DashboardProps) {
    const [showChecklist, setShowChecklist] = useState(!hideOnboarding);

    const dismissChecklist = () => {
        setShowChecklist(false);
        router.post(route('dashboard.hide-onboarding'), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6 p-4">
                {showChecklist && onboardingChecklist && (
                    <GettingStarted checklist={onboardingChecklist} onHide={dismissChecklist} />
                )}

                <Deferred data="stats" fallback={<StatsGridSkeleton />}>
                    <StatsGrid stats={stats!} />
                </Deferred>

                <Deferred data="neurons" fallback={<NeuronStatusSkeleton />}>
                    <NeuronStatus neurons={neurons ?? []} />
                </Deferred>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Deferred data="recentActivity" fallback={<ActivityFeedSkeleton />}>
                            <ActivityFeed activity={recentActivity!} />
                        </Deferred>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
