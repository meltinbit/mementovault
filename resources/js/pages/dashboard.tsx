import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Deferred } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type BreadcrumbItem, type DashboardStats, type ActivityLogEntry } from '@/types';
import { FileText, Zap, Code, Image, FolderOpen, Check, User, BookText, Key, X, ArrowRight } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface OnboardingChecklist {
    hasToken: boolean;
    identity: boolean;
    instructions: boolean;
    hasCollection: boolean;
}

interface DashboardProps {
    stats?: DashboardStats;
    recentActivity?: ActivityLogEntry[];
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

export default function Dashboard({ stats, recentActivity, onboardingChecklist, hideOnboarding }: DashboardProps) {
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
