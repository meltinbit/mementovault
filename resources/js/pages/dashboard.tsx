import { Head } from '@inertiajs/react';
import { Deferred } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type BreadcrumbItem, type DashboardStats, type ActivityLogEntry } from '@/types';
import { FileText, Zap, Code, Image, FolderOpen } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

interface DashboardProps {
    stats?: DashboardStats;
    recentActivity?: ActivityLogEntry[];
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
                No activity yet. Start by editing your workspace documents.
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

export default function Dashboard({ stats, recentActivity }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6 p-4">
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
