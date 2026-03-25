import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Workspace {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
}

export interface SystemDocumentData {
    id: number;
    type: 'identity' | 'instructions' | 'context' | 'memory';
    content: string;
    version: number;
    created_at: string;
    updated_at: string;
}

export interface SystemDocumentRevisionData {
    id: number;
    content: string;
    version: number;
    created_by: string | null;
    created_at: string;
}

export interface DashboardStats {
    documents: number;
    skills: number;
    snippets: number;
    assets: number;
    collections: number;
}

export interface ActivityLogEntry {
    id: number;
    action: string;
    subject_type: string;
    subject_id: number;
    description: string | null;
    created_at: string;
    user: { name: string } | null;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    workspace: Workspace | null;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
