import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Menu, X } from 'lucide-react';

interface Section {
    id: string;
    title: string;
    children?: { id: string; title: string }[];
}

const sections: Section[] = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        children: [
            { id: 'what-is-context-vault', title: 'What is Context Vault' },
            { id: 'create-your-workspace', title: 'Create Your Workspace' },
            { id: 'set-up-identity-instructions', title: 'Set Up Identity & Instructions' },
            { id: 'create-your-first-collection', title: 'Create Your First Collection' },
        ],
    },
    {
        id: 'core-concepts',
        title: 'Core Concepts',
        children: [
            { id: 'workspace', title: 'Workspace' },
            { id: 'system-documents', title: 'System Documents' },
            { id: 'collections', title: 'Collections' },
            { id: 'documents-skills-snippets-assets', title: 'Documents, Skills, Snippets, Assets' },
            { id: 'context-merging', title: 'How Context Merging Works' },
        ],
    },
    {
        id: 'connecting-to-clients',
        title: 'Connecting to Clients',
        children: [
            { id: 'claude-ai', title: 'Claude.ai' },
            { id: 'claude-code', title: 'Claude Code' },
            { id: 'cowork', title: 'Cowork' },
            { id: 'token-management', title: 'Token Management' },
        ],
    },
    {
        id: 'content-management',
        title: 'Content Management',
        children: [
            { id: 'creating-documents', title: 'Creating Documents' },
            { id: 'writing-effective-skills', title: 'Writing Effective Skills' },
            { id: 'using-snippets', title: 'Using Snippets' },
            { id: 'uploading-assets', title: 'Uploading Assets' },
            { id: 'tagging', title: 'Tagging' },
        ],
    },
    {
        id: 'templates',
        title: 'Templates',
        children: [
            { id: 'workspace-templates', title: 'Workspace Templates' },
            { id: 'collection-templates', title: 'Collection Templates' },
            { id: 'customizing-templates', title: 'Customizing Templates' },
        ],
    },
    {
        id: 'api-mcp-reference',
        title: 'API / MCP Reference',
        children: [
            { id: 'available-tools', title: 'Available Tools' },
            { id: 'authentication', title: 'Authentication' },
            { id: 'context-merging-order', title: 'Context Merging Order' },
            { id: 'rate-limits', title: 'Rate Limits' },
        ],
    },
];

function getAllSectionIds(): string[] {
    const ids: string[] = [];
    for (const section of sections) {
        ids.push(section.id);
        if (section.children) {
            for (const child of section.children) {
                ids.push(child.id);
            }
        }
    }
    return ids;
}

function Markdown({ children }: { children: string }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                h1: ({ children }) => <h1 className="mb-4 text-3xl font-bold text-white">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-3 mt-8 text-2xl font-semibold text-white">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-2 mt-6 text-xl font-semibold text-white">{children}</h3>,
                p: ({ children }) => <p className="mb-4 leading-relaxed text-[#a1a1aa]">{children}</p>,
                ul: ({ children }) => <ul className="mb-4 ml-4 list-disc space-y-1 text-[#a1a1aa]">{children}</ul>,
                ol: ({ children }) => <ol className="mb-4 ml-4 list-decimal space-y-1 text-[#a1a1aa]">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                a: ({ href, children }) => (
                    <a href={href} className="text-[#6366f1] underline underline-offset-2 hover:text-[#818cf8]">
                        {children}
                    </a>
                ),
                code: ({ className, children }) => {
                    const isBlock = className?.includes('language-');
                    if (isBlock) {
                        return (
                            <code className="block overflow-x-auto rounded-lg border border-[#1a1a22] bg-[#0e0e12] p-4 text-sm text-[#e4e4e7]">
                                {children}
                            </code>
                        );
                    }
                    return (
                        <code className="rounded bg-[#1a1a22] px-1.5 py-0.5 text-sm text-[#e4e4e7]">{children}</code>
                    );
                },
                pre: ({ children }) => <pre className="mb-4">{children}</pre>,
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                blockquote: ({ children }) => (
                    <blockquote className="mb-4 border-l-2 border-[#6366f1] pl-4 text-[#a1a1aa] italic">
                        {children}
                    </blockquote>
                ),
                table: ({ children }) => (
                    <div className="mb-4 overflow-x-auto">
                        <table className="w-full border-collapse border border-[#1a1a22] text-sm">{children}</table>
                    </div>
                ),
                th: ({ children }) => (
                    <th className="border border-[#1a1a22] bg-[#111118] px-3 py-2 text-left font-semibold text-white">
                        {children}
                    </th>
                ),
                td: ({ children }) => (
                    <td className="border border-[#1a1a22] px-3 py-2 text-[#a1a1aa]">{children}</td>
                ),
            }}
        >
            {children}
        </ReactMarkdown>
    );
}

function SidebarNav({
    activeSection,
    onNavigate,
}: {
    activeSection: string;
    onNavigate?: () => void;
}) {
    return (
        <nav className="space-y-1">
            {sections.map((section) => (
                <div key={section.id}>
                    <a
                        href={`#${section.id}`}
                        onClick={onNavigate}
                        className={`block rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                            activeSection === section.id
                                ? 'bg-[#6366f1]/10 text-[#6366f1]'
                                : 'text-[#e4e4e7] hover:bg-[#1a1a22] hover:text-white'
                        }`}
                    >
                        {section.title}
                    </a>
                    {section.children && (
                        <div className="ml-3 border-l border-[#1a1a22] pl-2">
                            {section.children.map((child) => (
                                <a
                                    key={child.id}
                                    href={`#${child.id}`}
                                    onClick={onNavigate}
                                    className={`block rounded-md px-3 py-1.5 text-sm transition-colors ${
                                        activeSection === child.id
                                            ? 'text-[#6366f1]'
                                            : 'text-[#71717a] hover:text-[#a1a1aa]'
                                    }`}
                                >
                                    {child.title}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </nav>
    );
}

export default function DocsIndex() {
    const { auth } = usePage<SharedData>().props;
    const [activeSection, setActiveSection] = useState('getting-started');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
            setActiveSection(visible[0].target.id);
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(handleObserver, {
            rootMargin: '-80px 0px -60% 0px',
            threshold: 0,
        });

        const allIds = getAllSectionIds();
        for (const id of allIds) {
            const el = document.getElementById(id);
            if (el) {
                observer.observe(el);
            }
        }

        return () => observer.disconnect();
    }, [handleObserver]);

    return (
        <>
            <Head title="Documentation">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="min-h-screen scroll-smooth bg-[#0e0e12] text-[#e4e4e7]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
                {/* Top nav */}
                <header className="sticky top-0 z-50 border-b border-[#1a1a22] bg-[#0e0e12]/95 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
                        <div className="flex items-center gap-4">
                            <Link href={route('home')} className="flex items-center gap-2">
                                <div className="flex size-8 items-center justify-center overflow-hidden rounded-md">
                                    <img src="/logo.jpg" alt="Logo" className="size-8 object-cover" />
                                </div>
                                <span className="text-sm font-semibold text-white">Context Vault</span>
                            </Link>
                            <span className="hidden text-sm text-[#71717a] sm:inline">Documentation</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href={route('home')}
                                className="hidden rounded-md px-3 py-1.5 text-sm text-[#a1a1aa] transition-colors hover:text-white sm:inline-block"
                            >
                                Back to Home
                            </Link>
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-md border border-[#6366f1] bg-[#6366f1] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#5558e6]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="rounded-md px-3 py-1.5 text-sm text-[#a1a1aa] transition-colors hover:text-white"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-md border border-[#6366f1] bg-[#6366f1] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#5558e6]"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="rounded-md p-1.5 text-[#a1a1aa] hover:text-white lg:hidden"
                                aria-label="Toggle navigation"
                            >
                                {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="mx-auto flex max-w-7xl">
                    {/* Mobile sidebar overlay */}
                    {sidebarOpen && (
                        <div
                            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar */}
                    <aside
                        className={`fixed top-[57px] left-0 z-40 h-[calc(100vh-57px)] w-64 overflow-y-auto border-r border-[#1a1a22] bg-[#0e0e12] p-4 transition-transform lg:sticky lg:translate-x-0 lg:bg-transparent ${
                            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                    >
                        <SidebarNav
                            activeSection={activeSection}
                            onNavigate={() => setSidebarOpen(false)}
                        />
                    </aside>

                    {/* Content */}
                    <main ref={contentRef} className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-12">
                        {/* Getting Started */}
                        <section id="getting-started" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">Getting Started</h1>

                            <section id="what-is-context-vault" className="mb-12">
                                <Markdown>{`## What is Context Vault

Context Vault is an **AI Context Manager** — a centralized platform for managing all the context your AI assistants need. Think of it as **1Password for AI context**.

Instead of repeating yourself in every conversation, you define your identity, instructions, project details, and reusable content once. Then any AI client (Claude.ai, Claude Code, Cowork) connects via MCP and receives everything it needs automatically.

- **One source of truth** for all your AI context
- **Project-specific packages** via collections with their own MCP endpoints
- **Rich content types**: documents, skills, snippets, and assets
- **Smart merging** of workspace and collection-level context`}</Markdown>
                            </section>

                            <section id="create-your-workspace" className="mb-12">
                                <Markdown>{`## Create Your Workspace

After registration, a workspace is automatically created for you with **4 system documents** (Identity, Instructions, Context, and Memory).

During setup, you'll choose a **template** that pre-populates your workspace with relevant starting content:

- **Developer** — Stack preferences, code style, development workflow
- **Marketer** — Brand voice, campaign frameworks, audience definitions
- **Consultant** — Areas of expertise, client management patterns
- **Agency** — Service offerings, team structure, client workflows
- **Custom** — Start with a blank slate

Templates are just starting points — you can modify everything freely after creation.`}</Markdown>
                            </section>

                            <section id="set-up-identity-instructions" className="mb-12">
                                <Markdown>{`## Set Up Your Identity & Instructions

Navigate to **Workspace** and find the **Identity** and **Instructions** tabs. Use markdown to define:

**Identity** — Who you are. This tells AI about your background, role, and expertise. For example:

> I'm a senior full-stack developer specializing in Laravel and React. I work at Acme Corp building SaaS products.

**Instructions** — How AI should work with you. Define preferences for tone, code style, response format, and anything else that shapes AI behavior. For example:

> Always use TypeScript. Prefer functional components. Write tests for all new features. Be concise — skip obvious explanations.`}</Markdown>
                            </section>

                            <section id="create-your-first-collection" className="mb-12">
                                <Markdown>{`## Create Your First Collection

Collections are **project packages**. Each collection gets its own MCP endpoint, so you can connect different AI clients to different projects.

1. Navigate to the **Collections** page
2. Click **New Collection**
3. Choose a name and type
4. Pick a collection template if desired

Once created, you can:
- Add documents, skills, snippets, and assets
- Override workspace instructions, context, and memory at the collection level
- Generate API tokens for MCP connections`}</Markdown>
                            </section>
                        </section>

                        {/* Core Concepts */}
                        <section id="core-concepts" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">Core Concepts</h1>

                            <section id="workspace" className="mb-12">
                                <Markdown>{`## Workspace

Your workspace is your **account container**. One user equals one workspace. It holds all your content — system documents, collections, documents, skills, snippets, assets, and tags.

Everything you create lives within your workspace, and workspace-level settings (like Identity and Instructions) apply globally to all MCP connections unless overridden at the collection level.`}</Markdown>
                            </section>

                            <section id="system-documents" className="mb-12">
                                <Markdown>{`## System Documents

Every workspace has exactly **4 system documents**, each serving a distinct purpose:

| Document | Purpose |
|----------|---------|
| **Identity** | Who you are — your background, role, expertise, and personality |
| **Instructions** | How AI should work — coding style, response format, behavior rules |
| **Context** | Current projects and priorities — what you're working on right now |
| **Memory** | Persistent information — things AI should remember across conversations |

System documents use markdown and support versioning. Each edit creates a new version, so you can track changes over time.`}</Markdown>
                            </section>

                            <section id="collections" className="mb-12">
                                <Markdown>{`## Collections

Collections are **project packages** with their own MCP endpoints. They let you scope AI context to specific projects.

Key features:
- **Own MCP endpoint** — Each collection has a unique URL for AI client connections
- **Override system documents** — Collections can override workspace-level Instructions, Context, and Memory (Identity is always workspace-level)
- **Many-to-many content** — Documents, skills, snippets, and assets can belong to multiple collections
- **API tokens** — Each token is scoped to one collection`}</Markdown>
                            </section>

                            <section id="documents-skills-snippets-assets" className="mb-12">
                                <Markdown>{`## Documents, Skills, Snippets, Assets

Context Vault supports four content types:

**Documents** — Markdown content like specifications, reference notes, technical docs, or anything you want AI to be able to read. Documents support full markdown with preview.

**Skills** — Operational instructions with a **trigger description**. The description field is critical — it tells AI *when* to activate the skill. The content contains the full instruction set. Skills are like specialized playbooks that AI activates on demand.

**Snippets** — Reusable text blocks. No markdown rendering — raw text that gets inserted as-is. Great for email signatures, disclaimers, prompt templates, or boilerplate text.

**Assets** — Binary files (images, PDFs, etc.) with AI-readable descriptions. The description is what Claude sees via MCP. Without a description, assets are listed but not understood by AI.`}</Markdown>
                            </section>

                            <section id="context-merging" className="mb-12">
                                <Markdown>{`## How Context Merging Works

When Claude connects to Context Vault via MCP, it receives a **merged context** assembled from multiple layers:

1. **Workspace Identity** — Always included, cannot be overridden
2. **Instructions** — Workspace instructions, with collection override appended if present
3. **Context** — Workspace context, with collection override appended if present
4. **Memory** — Workspace memory, with collection override appended if present
5. **Available content lists** — Skills, documents, snippets, and assets available in the collection

Collection overrides don't replace workspace content — they **extend** it. This means your global preferences always apply, with project-specific additions layered on top.`}</Markdown>
                            </section>
                        </section>

                        {/* Connecting to Clients */}
                        <section id="connecting-to-clients" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">Connecting to Clients</h1>

                            <section id="claude-ai" className="mb-12">
                                <Markdown>{`## Claude.ai

To connect Claude.ai to Context Vault:

1. Open Claude.ai and go to **Settings**
2. Navigate to the **MCP** section
3. Add a new MCP server with your collection URL:

\`\`\`
https://yourdomain.com/mcp?token=YOUR_TOKEN
\`\`\`

Replace \`yourdomain.com\` with your Context Vault domain and \`YOUR_TOKEN\` with a token generated from your collection.`}</Markdown>
                            </section>

                            <section id="claude-code" className="mb-12">
                                <Markdown>{`## Claude Code

Add Context Vault to your \`.claude/settings.json\` file:

\`\`\`json
{
  "mcpServers": {
    "context-vault": {
      "url": "https://yourdomain.com/mcp?token=YOUR_TOKEN"
    }
  }
}
\`\`\`

Claude Code will automatically connect to Context Vault and have access to all your collection's context and content.`}</Markdown>
                            </section>

                            <section id="cowork" className="mb-12">
                                <Markdown>{`## Cowork

Cowork supports the same MCP configuration. Add your Context Vault MCP server URL in Cowork's settings using the same format:

\`\`\`
https://yourdomain.com/mcp?token=YOUR_TOKEN
\`\`\`

Refer to Cowork's documentation for the exact location of MCP server settings.`}</Markdown>
                            </section>

                            <section id="token-management" className="mb-12">
                                <Markdown>{`## Token Management

API tokens authenticate MCP connections. Key details:

- **Generate tokens** from the collection detail page
- **Each token is scoped** to exactly one collection
- **Token format**: tokens start with \`cv_live_\`
- **Security**: tokens are shown only once at creation — store them securely
- **Server-side**: tokens are SHA-256 hashed before storage

You can create multiple tokens per collection (e.g., one for Claude.ai, one for Claude Code) and revoke them independently.`}</Markdown>
                            </section>
                        </section>

                        {/* Content Management */}
                        <section id="content-management" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">Content Management</h1>

                            <section id="creating-documents" className="mb-12">
                                <Markdown>{`## Creating Documents

1. Navigate to **Documents** in the sidebar
2. Click **New Document**
3. Set a **title** and choose a **type**
4. Write your content in **markdown** (with live preview)
5. Add **tags** for organization

Documents support full markdown including headings, lists, code blocks, tables, and links. Use the preview tab to see how your content will render.`}</Markdown>
                            </section>

                            <section id="writing-effective-skills" className="mb-12">
                                <Markdown>{`## Writing Effective Skills

Skills have two key fields:

**Description** — This is the most important field. It tells AI *when* to activate the skill. Write it as a trigger condition. For example:

> "Apply when writing React components or discussing frontend architecture."

> "Use when the user asks about database schema design or migration strategies."

**Content** — The full instruction set that AI follows when the skill is activated. This can be as detailed as needed — coding standards, step-by-step processes, decision frameworks, etc.

A well-written description ensures your skills activate at the right time, not too broadly and not too narrowly.`}</Markdown>
                            </section>

                            <section id="using-snippets" className="mb-12">
                                <Markdown>{`## Using Snippets

Snippets are quick, reusable text blocks. Unlike documents, snippets have **no markdown rendering** — they're raw text that gets inserted as-is.

Good uses for snippets:
- **Email signatures** and sign-offs
- **Legal disclaimers** or standard notices
- **Prompt templates** for common tasks
- **Boilerplate text** you use frequently

Snippets are available to AI via the \`list_snippets\` and \`get_snippet\` MCP tools.`}</Markdown>
                            </section>

                            <section id="uploading-assets" className="mb-12">
                                <Markdown>{`## Uploading Assets

Upload files by **dragging and dropping** onto the upload area, or click to browse.

The **AI description** field is critical:
- This is what Claude sees when it accesses the asset via MCP
- **Without a description**, assets are listed but not understood by AI
- Write descriptions that explain what the file contains and when it's relevant

Example description for a design mockup:
> "Homepage redesign mockup showing the new hero section with gradient background, feature cards, and updated navigation. Use this as reference when implementing frontend changes."`}</Markdown>
                            </section>

                            <section id="tagging" className="mb-12">
                                <Markdown>{`## Tagging

Tags help organize your content across all types:

- **Create tags** with custom names and colors
- **Apply tags** to documents, skills, snippets, and assets
- **Filter lists** by tag to quickly find related content

Tags are workspace-level — the same tag can be applied to any content type, making it easy to group related items across different categories.`}</Markdown>
                            </section>
                        </section>

                        {/* Templates */}
                        <section id="templates" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">Templates</h1>

                            <section id="workspace-templates" className="mb-12">
                                <Markdown>{`## Workspace Templates

Workspace templates pre-populate your system documents with relevant starting content:

| Template | Focus |
|----------|-------|
| **Developer** | Stack preferences, code style, development workflows |
| **Marketer** | Brand voice, campaign frameworks, audience definitions |
| **Consultant** | Areas of expertise, client management, advisory patterns |
| **Agency** | Service offerings, team structure, client workflows |
| **Custom** | Blank slate — build from scratch |`}</Markdown>
                            </section>

                            <section id="collection-templates" className="mb-12">
                                <Markdown>{`## Collection Templates

Collection templates provide starting content tailored to specific project types:

| Template | Focus |
|----------|-------|
| **Software Project** | Architecture decisions, coding conventions, tech stack |
| **Client Project** | Project brief, communication preferences, deliverables |
| **Product / SaaS** | Product roadmap, brand guidelines, feature specs |
| **Marketing** | Campaign plans, tone of voice, content calendar |
| **Custom** | Blank collection — define your own structure |`}</Markdown>
                            </section>

                            <section id="customizing-templates" className="mb-12">
                                <Markdown>{`## Customizing Templates

Templates are **just starting content**. After creation, you can modify everything freely:

- Edit or replace all system documents
- Add, remove, or reorganize content
- Change collection settings and overrides
- Create your own patterns and structures

There's no lock-in — templates simply save you from starting with a blank page.`}</Markdown>
                            </section>
                        </section>

                        {/* API / MCP Reference */}
                        <section id="api-mcp-reference" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">API / MCP Reference</h1>

                            <section id="available-tools" className="mb-12">
                                <Markdown>{`## Available Tools

Context Vault exposes the following tools via MCP:

| Tool | Description |
|------|-------------|
| \`get_context\` | Returns the full merged context (identity + instructions + context + memory) |
| \`list_documents\` | Browse available documents with titles and types |
| \`get_document\` | Read the full content of a specific document |
| \`list_skills\` | Browse available skills with names and descriptions |
| \`get_skill\` | Read the full content of a specific skill |
| \`list_snippets\` | Browse available snippets |
| \`get_snippet\` | Read the full content of a specific snippet |
| \`list_assets\` | Browse available assets with descriptions |
| \`get_asset_url\` | Get a download URL for a specific asset |
| \`search\` | Full-text search across all content types |`}</Markdown>
                            </section>

                            <section id="authentication" className="mb-12">
                                <Markdown>{`## Authentication

API requests are authenticated using bearer tokens:

**Header authentication:**
\`\`\`
Authorization: Bearer cv_live_YOUR_TOKEN
\`\`\`

**Query parameter authentication:**
\`\`\`
https://yourdomain.com/mcp?token=cv_live_YOUR_TOKEN
\`\`\`

Security details:
- Tokens are **SHA-256 hashed** server-side — the plain token is never stored
- Each token is **scoped to one collection** — it can only access that collection's content
- Tokens are shown **only once** at creation — store them in a secure location`}</Markdown>
                            </section>

                            <section id="context-merging-order" className="mb-12">
                                <Markdown>{`## Context Merging Order

When \`get_context\` is called, the response is assembled in this order:

1. **Identity** — Workspace identity (always included)
2. **Instructions** — Workspace instructions + collection override (if present)
3. **Context** — Workspace context + collection override (if present)
4. **Memory** — Workspace memory + collection override (if present)
5. **Available Skills** — List of skills in the collection
6. **Available Documents** — List of documents in the collection
7. **Available Snippets** — List of snippets in the collection
8. **Available Assets** — List of assets in the collection

Each layer builds on the previous one, giving AI a complete picture of who you are, how to work with you, what you're working on, and what resources are available.`}</Markdown>
                            </section>

                            <section id="rate-limits" className="mb-12">
                                <Markdown>{`## Rate Limits

**Current (v1):** There are no rate limits. All MCP tools can be called without restriction.

**Future:** Per-token rate limiting is planned for a future release to support multi-tenant and team usage scenarios.`}</Markdown>
                            </section>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
