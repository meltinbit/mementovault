import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Deferred } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type BreadcrumbItem, type DashboardStats, type ActivityLogEntry } from '@/types';
import { FileText, Zap, Code, Image, FolderOpen, Check, Circle, User, BookText, HardDrive, Key, X } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface OnboardingChecklist {
    identity: boolean;
    instructions: boolean;
    hasStorage: boolean;
    hasCollection: boolean;
    hasToken: boolean;
}

interface DashboardProps {
    stats?: DashboardStats;
    recentActivity?: ActivityLogEntry[];
    onboardingChecklist?: OnboardingChecklist;
    hideOnboarding?: boolean;
}

const checklistItems = [
    { key: 'identity', label: 'Set up your Identity', description: 'Tell AI who you are', href: '/workspace/identity', icon: User },
    { key: 'instructions', label: 'Write Instructions', description: 'Define how AI should work with you', href: '/workspace/instructions', icon: BookText },
    { key: 'hasStorage', label: 'Configure Storage', description: 'Set up S3/R2 to upload assets', href: '/settings/workspace?tab=storage', icon: HardDrive },
    { key: 'hasCollection', label: 'Create a Neuron', description: 'Organize content by project', href: '/collections/create', icon: FolderOpen },
    { key: 'hasToken', label: 'Connect via MCP', description: 'Generate a token and connect your AI client', href: '/settings/workspace?tab=mcp', icon: Key },
];

function GettingStarted({ checklist, onHide }: { checklist: OnboardingChecklist; onHide: () => void }) {
    const completed = Object.values(checklist).filter(Boolean).length;
    const total = Object.keys(checklist).length;

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
            <CardHeader>
                <CardTitle className="text-base">Getting Started</CardTitle>
                <p className="text-sm text-muted-foreground">{completed} of {total} steps completed</p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(completed / total) * 100}%` }} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {checklistItems.map((item) => {
                        const done = checklist[item.key as keyof OnboardingChecklist];
                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-md border p-3 text-sm transition-colors hover:bg-accent ${done ? 'opacity-60' : ''}`}
                            >
                                {done ? (
                                    <Check className="h-5 w-5 shrink-0 text-primary" />
                                ) : (
                                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                                )}
                                <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <div>
                                    <p className={`font-medium ${done ? 'line-through' : ''}`}>{item.label}</p>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
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
        { label: 'Neurons', count: stats.collections, icon: FolderOpen },
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6 p-4">
                {showChecklist && onboardingChecklist && (
                    <GettingStarted checklist={onboardingChecklist} onHide={() => setShowChecklist(false)} />
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
