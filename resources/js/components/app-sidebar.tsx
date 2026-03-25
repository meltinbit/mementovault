import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    BookText,
    Brain,
    Code,
    Database,
    FileText,
    FolderOpen,
    Image,
    LayoutGrid,
    Settings,
    Tag,
    User,
    Zap,
} from 'lucide-react';
import AppLogo from './app-logo';
import { GlobalSearch } from '@/components/global-search';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
];

const workspaceNavItems: NavItem[] = [
    {
        title: 'Identity',
        url: '/workspace/identity',
        icon: User,
    },
    {
        title: 'Instructions',
        url: '/workspace/instructions',
        icon: BookText,
    },
    {
        title: 'Context',
        url: '/workspace/context',
        icon: Brain,
    },
    {
        title: 'Memory',
        url: '/workspace/memory',
        icon: Database,
    },
];

const contentNavItems: NavItem[] = [
    {
        title: 'Documents',
        url: '/documents',
        icon: FileText,
    },
    {
        title: 'Skills',
        url: '/skills',
        icon: Zap,
    },
    {
        title: 'Snippets',
        url: '/snippets',
        icon: Code,
    },
    {
        title: 'Assets',
        url: '/assets',
        icon: Image,
    },
];

const organizationNavItems: NavItem[] = [
    {
        title: 'Collections',
        url: '/collections',
        icon: FolderOpen,
    },
    {
        title: 'Tags',
        url: '/tags',
        icon: Tag,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Settings',
        url: '/settings',
        icon: Settings,
    },
];

export function AppSidebar() {
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
                <NavMain items={workspaceNavItems} label="Workspace" />
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
