import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { GlobalSearch } from '@/components/global-search';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import { type LucideIcon, BookOpen, BookText, Brain, Briefcase, Code, Database, FileText, FolderOpen, Heart, Image, LayoutGrid, Package, Plus, Settings, Tag, Target, Trash2, User, Zap } from 'lucide-react';
import { useState } from 'react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
];

const contentNavItems: NavItem[] = [
    { title: 'Documents', url: '/documents', icon: FileText },
    { title: 'Skills', url: '/skills', icon: Zap },
    { title: 'Snippets', url: '/snippets', icon: Code },
    { title: 'Assets', url: '/assets', icon: Image },
];

const organizationNavItems: NavItem[] = [
    { title: 'Collections', url: '/collections', icon: FolderOpen },
    { title: 'Tags', url: '/tags', icon: Tag },
];

const footerNavItems: NavItem[] = [
    { title: 'Docs', url: '/docs', icon: BookOpen },
    { title: 'Settings', url: '/settings', icon: Settings },
];

// Type icon/label registry for known types
const typeIcons: Record<string, LucideIcon> = {
    identity: User, instructions: BookText, context: Brain, memory: Database,
    soul: Heart, services: Briefcase, portfolio: FolderOpen, products: Package, icp: Target,
};

const typeLabels: Record<string, string> = {
    identity: 'Identity', instructions: 'Instructions', context: 'Context', memory: 'Memory',
    soul: 'Soul', services: 'Services', portfolio: 'Portfolio', products: 'Products', icp: 'ICP',
};

const typeDescriptions: Record<string, string> = {
    soul: 'Mission, vision, core values, brand personality',
    services: 'What you offer and how you deliver it',
    portfolio: 'Past work, case studies, results',
    products: 'Products, features, pricing, positioning',
    icp: 'Ideal Customer Profile, pain points, buying behavior',
};

const coreTypes = ['identity', 'instructions'];
const builtinOptionalTypes = ['soul', 'services', 'portfolio', 'products', 'icp'];

export function AppSidebar() {
    const { workspaceSystemDocs } = usePage<SharedData>().props;
    const page = usePage();
    const [showAddDoc, setShowAddDoc] = useState(false);
    const [customType, setCustomType] = useState('');
    const [deleteType, setDeleteType] = useState<string | null>(null);

    // Build workspace nav: core types always, then extras
    const existingTypes = workspaceSystemDocs || [];
    const extraTypes = existingTypes.filter((t: string) => !coreTypes.includes(t) && t !== 'memory' && t !== 'context');

    const workspaceNavItems: NavItem[] = [
        ...coreTypes.map((type) => ({
            title: typeLabels[type] || type,
            url: `/workspace/${type}`,
            icon: typeIcons[type] || FileText,
        })),
        { title: 'Memory', url: '/memory', icon: Database },
        ...extraTypes.map((type: string) => ({
            title: typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/[-_]/g, ' '),
            url: `/workspace/${type}`,
            icon: typeIcons[type] || FileText,
        })),
    ];

    // Available built-in types not yet created
    const availableBuiltins = builtinOptionalTypes.filter((t) => !existingTypes.includes(t));

    const addDocument = (type: string) => {
        router.post('/workspace', { type }, {
            onSuccess: () => {
                setShowAddDoc(false);
                setCustomType('');
            },
        });
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const slug = customType.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        if (slug) addDocument(slug);
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className="px-4 py-2">
                    <GlobalSearch />
                </div>
                <NavMain items={mainNavItems} />
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                    <SidebarMenu>
                        {workspaceNavItems.map((item) => {
                            const isActive = page.url === item.url || page.url.startsWith(item.url + '/');
                            const itemType = item.url.replace('/workspace/', '').replace('/memory', 'memory');
                            const isDeletable = !coreTypes.includes(itemType) && itemType !== 'memory';
                            return (
                                <SidebarMenuItem key={item.title} className="group/item">
                                    <SidebarMenuButton asChild isActive={isActive}>
                                        <Link href={item.url} prefetch>
                                            {item.icon && <item.icon />}
                                            <span className="flex-1">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    {isDeletable && (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setDeleteType(itemType); }}
                                            className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/item:opacity-100"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </SidebarMenuItem>
                            );
                        })}
                        <SidebarMenuItem>
                            <Dialog open={showAddDoc} onOpenChange={setShowAddDoc}>
                                <DialogTrigger asChild>
                                    <SidebarMenuButton className="text-muted-foreground">
                                        <Plus className="h-4 w-4" />
                                        <span>Add document</span>
                                    </SidebarMenuButton>
                                </DialogTrigger>
                                <DialogContent className="max-w-sm">
                                    <DialogHeader>
                                        <DialogTitle>Add Workspace Document</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-1">
                                        {availableBuiltins.map((type) => {
                                            const Icon = typeIcons[type] || FileText;
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => addDocument(type)}
                                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                                                >
                                                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{typeLabels[type]}</p>
                                                        <p className="text-xs text-muted-foreground">{typeDescriptions[type]}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                        {availableBuiltins.length > 0 && <Separator className="my-2" />}
                                        <form onSubmit={handleCustomSubmit} className="flex gap-2 px-1">
                                            <Input
                                                value={customType}
                                                onChange={(e) => setCustomType(e.target.value)}
                                                placeholder="custom-type"
                                                className="h-8 text-sm"
                                            />
                                            <Button size="sm" type="submit" className="h-8 shrink-0">
                                                Add
                                            </Button>
                                        </form>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <DeleteConfirmation
                    open={deleteType !== null}
                    onClose={() => setDeleteType(null)}
                    onConfirm={() => {
                        if (deleteType) {
                            router.delete(`/workspace/${deleteType}`, {
                                onSuccess: () => setDeleteType(null),
                            });
                        }
                    }}
                    title={`Delete "${deleteType ? (typeLabels[deleteType] || deleteType.charAt(0).toUpperCase() + deleteType.slice(1).replace(/[-_]/g, ' ')) : ''}"?`}
                    description="This will permanently delete this workspace document and all its revision history."
                />

                <NavMain items={contentNavItems} label="Content" />
                <NavMain items={organizationNavItems} label="Organization" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
