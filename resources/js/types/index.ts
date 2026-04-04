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
    type: string;
    content: string;
    version: number;
    created_at: string;
    updated_at: string;
}

export interface SystemDocumentMeta {
    label: string;
    description: string;
    guidance: string;
    icon: string;
    isCore: boolean;
}

export interface SystemDocumentRevisionData {
    id: number;
    content: string;
    version: number;
    created_by: string | null;
    created_at: string;
}

export type RevisionData = SystemDocumentRevisionData;

export interface TagData {
    id: number;
    name: string;
    slug: string;
    color: string | null;
}

export interface DocumentData {
    id: number;
    title: string;
    slug: string;
    content: string;
    type: string;
    is_active: boolean;
    version: number;
    created_at: string;
    updated_at: string;
    tags: TagData[];
}

export interface SkillData {
    id: number;
    name: string;
    slug: string;
    description: string;
    content: string;
    is_active: boolean;
    version: number;
    created_at: string;
    updated_at: string;
    tags: TagData[];
}

export interface SnippetData {
    id: number;
    name: string;
    slug: string;
    content: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    tags: TagData[];
}

export interface AssetFolderData {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    sort_order: number;
    assets_count: number;
    children: AssetFolderData[];
    created_at: string;
    updated_at: string;
}

export interface AssetData {
    id: number;
    folder_id: number | null;
    folder?: AssetFolderData | null;
    name: string;
    original_filename: string;
    mime_type: string;
    size_bytes: number;
    description: string | null;
    is_active: boolean;
    updated_at: string;
    tags: TagData[];
    download_url?: string;
    thumbnail_url?: string;
}

export interface MemoryEntryData {
    id: number;
    content: string;
    category: string | null;
    is_pinned: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export interface CollectionData {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    color: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    documents_count?: number;
    skills_count?: number;
    snippets_count?: number;
    assets_count?: number;
}

export interface CollectionSystemDocumentData {
    id: number;
    type: string;
    content: string;
    version: number;
    updated_at: string;
}

export interface CollectionDocumentData {
    id: number;
    name: string;
    slug: string;
    content: string;
    sort_order: number;
    is_required: boolean;
    version: number;
    updated_at: string;
}

export interface CollectionDocumentTemplateData {
    id: number;
    name: string;
    description: string | null;
    placeholder: string;
}

export interface ApiTokenData {
    id: number;
    name: string;
    last_used_at: string | null;
    expires_at: string | null;
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
    registrationEnabled: boolean;
    quote: { message: string; author: string };
    auth: Auth;
    workspace: Workspace | null;
    workspaceSystemDocs: string[];
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
