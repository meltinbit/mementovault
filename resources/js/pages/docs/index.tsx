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
            { id: 'what-is-it', title: 'What is it' },
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
            { id: 'workspace-documents', title: 'Workspace Documents' },
            { id: 'collections', title: 'Collections' },
            { id: 'collection-documents', title: 'Collection Documents' },
            { id: 'content-types', title: 'Documents, Skills, Snippets, Assets' },
            { id: 'context-merging', title: 'How Context Loading Works' },
        ],
    },
    {
        id: 'connecting-to-clients',
        title: 'Connecting to Clients',
        children: [
            { id: 'workspace-vs-collection-tokens', title: 'Workspace vs Collection Tokens' },
            { id: 'claude-desktop', title: 'Claude Desktop' },
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
            { id: 'asset-folders', title: 'Asset Folders' },
            { id: 'tagging', title: 'Tagging' },
        ],
    },
    {
        id: 'templates',
        title: 'Templates',
        children: [
            { id: 'workspace-templates', title: 'Workspace Templates' },
            { id: 'collection-templates', title: 'Collection Templates' },
            { id: 'document-templates', title: 'Document Templates' },
        ],
    },
    {
        id: 'api-mcp-reference',
        title: 'API / MCP Reference',
        children: [
            { id: 'available-tools', title: 'Available Tools' },
            { id: 'authentication', title: 'Authentication' },
            { id: 'collection-switching', title: 'Collection Switching' },
            { id: 'writing-long-content', title: 'Writing Long Content' },
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
    const { auth, name: appName } = usePage<SharedData>().props;
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
                                <span className="text-sm font-semibold text-white">{appName}</span>
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

                            <section id="what-is-it" className="mb-12">
                                <Markdown>{`## What is ${appName}

${appName} is an **AI Context Manager** — a centralized platform for managing all the context your AI assistants need. Think of it as **1Password for AI context**.

Instead of repeating yourself in every conversation, you define your identity, instructions, project details, and reusable content once. Then any AI client (Claude Desktop, Claude Code, Cowork) connects via MCP and receives everything it needs automatically.

- **One source of truth** for all your AI context
- **Project-specific packages** via collections with their own documents and MCP endpoints
- **Rich content types**: documents, skills, snippets, and assets
- **Lazy context loading** — minimal initial context, everything else fetched on demand`}</Markdown>
                            </section>

                            <section id="create-your-workspace" className="mb-12">
                                <Markdown>{`## Create Your Workspace

After registration, a workspace is automatically created for you with core system documents (Identity and Instructions).

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

Navigate to the **Workspace** section in the sidebar and find **Identity** and **Instructions**:

**Identity** — Who you are. This tells AI about your background, role, and expertise:

> I'm a senior full-stack developer specializing in Laravel and React. I work at Acme Corp building SaaS products.

**Instructions** — How AI should work with you. Define preferences for tone, code style, and behavior:

> Always use TypeScript. Prefer functional components. Write tests for all new features. Be concise.

These are always included when AI loads context via MCP.`}</Markdown>
                            </section>

                            <section id="create-your-first-collection" className="mb-12">
                                <Markdown>{`## Create Your First Collection

Collections are **project packages**. Each collection has its own set of documents and MCP endpoint.

1. Navigate to the **Collections** page
2. Click **New Collection**
3. Choose a name and type (the type selects a template)
4. The template pre-populates collection documents (Instructions, Architecture, etc.)

Once created, you can:
- Edit collection documents that define how AI operates in this project
- Add workspace content (documents, skills, snippets, assets) to the collection
- Generate API tokens for MCP connections
- Manage project-specific memory entries`}</Markdown>
                            </section>
                        </section>

                        {/* Core Concepts */}
                        <section id="core-concepts" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">Core Concepts</h1>

                            <section id="workspace" className="mb-12">
                                <Markdown>{`## Workspace

Your workspace is your **account container**. One user equals one workspace. It holds all your content — workspace documents, collections, documents, skills, snippets, assets, tags, and memory entries.

Workspace-level settings (Identity and Instructions) apply globally to all MCP connections.`}</Markdown>
                            </section>

                            <section id="workspace-documents" className="mb-12">
                                <Markdown>{`## Workspace Documents

Workspace documents are global documents that define your AI persona across all collections:

| Document | Purpose |
|----------|---------|
| **Identity** | Who you are — background, role, expertise, personality |
| **Instructions** | How AI should work — coding style, response format, behavior rules |

These two are **core** and always present. You can also add **optional** workspace documents:

| Optional | Purpose |
|----------|---------|
| **Soul** | Mission, vision, core values, brand personality |
| **Services** | What you offer and how you deliver it |
| **Portfolio** | Past work, case studies, results |
| **Products** | Products, features, pricing, positioning |
| **ICP** | Ideal Customer Profile, pain points, buying behavior |

You can also create **custom** workspace documents with any name. Optional and custom documents can be deleted; core documents (Identity, Instructions) cannot.

All workspace documents support markdown and version history.`}</Markdown>
                            </section>

                            <section id="collections" className="mb-12">
                                <Markdown>{`## Collections

Collections are **project packages** with their own documents and MCP endpoints. They scope AI context to specific projects.

Key features:
- **Own MCP endpoint** — Each collection has a unique URL for AI client connections
- **Collection documents** — Each collection has its own set of named documents (Instructions, Architecture, Brand Voice, etc.)
- **Content assignment** — Workspace documents, skills, snippets, and assets can be assigned to multiple collections
- **Memory** — Each collection can have its own memory entries
- **Templates** — Collection type selects a template that pre-populates initial documents`}</Markdown>
                            </section>

                            <section id="collection-documents" className="mb-12">
                                <Markdown>{`## Collection Documents

Collection documents are **system-level documents that belong to a collection**. They define how AI operates within that specific project and are always available in the MCP context.

Unlike workspace content (documents, skills, snippets) which is shared across collections, collection documents are **exclusive** to one collection.

Examples:
- **Instructions** — Operating rules for this specific project
- **Architecture** — System architecture, database schema, API design
- **Brand Voice** — Tone guidelines specific to this project
- **Memory** — Structured memory for this project
- **Roadmap** — Project status, priorities, backlog

Collection documents are created from **templates** when you create a collection, but you can add, rename, or remove them freely. Required documents (like Instructions) are protected from deletion.

When adding a new document, you can choose from 20+ built-in templates (Architecture, Brand Voice, FAQ, Competitor Analysis, etc.) or start blank.`}</Markdown>
                            </section>

                            <section id="content-types" className="mb-12">
                                <Markdown>{`## Documents, Skills, Snippets, Assets

${appName} supports four workspace-level content types that can be assigned to collections:

**Documents** — Markdown reference materials. API docs, specs, technical guides. AI retrieves them on demand — they're listed in context so AI knows they exist, and fetches full content when needed.

**Skills** — Operational instructions with a **trigger description**. The description tells AI *when* to activate the skill. The content contains the full instruction set. Think of skills as specialized playbooks.

**Snippets** — Reusable text blocks inserted as-is. Email signatures, disclaimers, prompt templates, boilerplate. No markdown — raw text.

**Assets** — Binary files (images, videos, PDFs) with AI-readable descriptions. Assets can be organized in **folders** with nested hierarchy. Videos can be played inline.`}</Markdown>
                            </section>

                            <section id="context-merging" className="mb-12">
                                <Markdown>{`## How Context Loading Works

When AI connects via MCP, it calls \`get_context\` which returns a **minimal, lazy context**:

1. **Workspace Identity** — Your identity content
2. **Workspace Instructions** — Your global instructions
3. **Collection name** and description
4. **Collection document slugs** — Just the names, no content
5. **Content counts** — How many skills, documents, snippets, assets are available

This keeps the initial context small (under 2KB). AI then fetches specific content on demand using tools like \`collection_documents\`, \`documents\`, \`skills\`, etc.

This lazy approach is intentional — it prevents context overflow and lets AI decide what it needs based on the conversation.`}</Markdown>
                            </section>
                        </section>

                        {/* Connecting to Clients */}
                        <section id="connecting-to-clients" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">Connecting to Clients</h1>

                            <section id="workspace-vs-collection-tokens" className="mb-12">
                                <Markdown>{`## Workspace vs Collection Tokens

${appName} supports two types of API tokens:

**Workspace tokens** (\`cv_ws_\` prefix) — A single token that gives access to **all collections** in your workspace. AI can list available collections and switch between them dynamically. Great when you want one MCP connection for everything.

**Collection tokens** (\`cv_live_\` prefix) — Scoped to a single collection. AI only sees that collection's content. Use when you want a dedicated, focused connection.

| Feature | Workspace Token | Collection Token |
|---------|----------------|-----------------|
| Prefix | \`cv_ws_\` | \`cv_live_\` |
| Scope | All collections | One collection |
| Collection switching | Yes, via \`get_context\` | No |
| Create from | Settings → Workspace | Collection page |

With a workspace token, AI calls \`get_context\` to see available collections, then \`get_context(collection: "slug")\` to select one. After selection, all tools work as if using a collection token.`}</Markdown>
                            </section>

                            <section id="claude-desktop" className="mb-12">
                                <Markdown>{`## Claude Desktop

To connect Claude Desktop to ${appName}:

1. Open Claude Desktop → **Customize** → **Connectors**
2. Click **+** → **Add custom connector**
3. Enter your MCP endpoint URL:

\`\`\`
https://yourdomain.com/mcp?token=YOUR_TOKEN
\`\`\`

Replace \`yourdomain.com\` with your ${appName} domain and \`YOUR_TOKEN\` with a workspace or collection token.`}</Markdown>
                            </section>

                            <section id="claude-code" className="mb-12">
                                <Markdown>{`## Claude Code

Add ${appName} to your \`.claude/settings.json\` file:

\`\`\`json
{
  "mcpServers": {
    "memento-vault": {
      "url": "https://yourdomain.com/mcp?token=YOUR_TOKEN"
    }
  }
}
\`\`\`

Claude Code will automatically connect and have access to your context and content.`}</Markdown>
                            </section>

                            <section id="cowork" className="mb-12">
                                <Markdown>{`## Cowork

Cowork supports the same MCP configuration. Add your MCP server URL in Cowork's settings:

\`\`\`
https://yourdomain.com/mcp?token=YOUR_TOKEN
\`\`\`

Refer to Cowork's documentation for the exact location of MCP server settings.`}</Markdown>
                            </section>

                            <section id="token-management" className="mb-12">
                                <Markdown>{`## Token Management

Key details about API tokens:

- **Workspace tokens**: generated from **Settings → Workspace**
- **Collection tokens**: generated from the **collection detail page**
- **Security**: tokens are SHA-256 hashed — the plain token is shown only once at creation
- **Expiration**: optional expiration date per token
- **Last used**: automatically tracked for each token
- **Revocation**: tokens can be revoked independently at any time

You can create multiple tokens per collection or workspace (e.g., one for Claude Desktop, one for Claude Code).`}</Markdown>
                            </section>
                        </section>

                        {/* Content Management */}
                        <section id="content-management" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">Content Management</h1>

                            <section id="creating-documents" className="mb-12">
                                <Markdown>{`## Creating Documents

**Documents are reference materials that AI retrieves on demand.** They're the knowledge base your AI draws from.

**What to put in documents:**
- **Technical:** API documentation, architecture decisions, database schemas
- **Copy:** Brand guidelines, tone of voice docs, content templates
- **Process:** SOPs, workflows, review checklists
- **General:** Meeting notes, project briefs, research findings

**How AI uses them:** Documents are NOT sent automatically. They're listed in context so AI *knows they exist*, and AI retrieves them on demand using the \`documents\` tool with \`action: "get"\`.

**To create a document:**
1. Go to **Documents** → **New Document**
2. Set a title, choose a type, and write content in markdown
3. Add tags for organization
4. Assign to one or more collections`}</Markdown>
                            </section>

                            <section id="writing-effective-skills" className="mb-12">
                                <Markdown>{`## Writing Effective Skills

Skills have two key fields:

**Description** — The most important field. It tells AI *when* to activate the skill. Write it as a trigger condition:

> "Apply when writing React components or discussing frontend architecture."

> "Use when the user asks about database schema design or migration strategies."

**Content** — The full instruction set that AI follows when activated. Can be as detailed as needed.

A well-written description ensures skills activate at the right time.`}</Markdown>
                            </section>

                            <section id="using-snippets" className="mb-12">
                                <Markdown>{`## Using Snippets

**Snippets are short, reusable text blocks that AI inserts as-is.** They're raw text, not markdown documents.

**The difference from documents:**
- **Documents** = reference material AI reads for context (markdown, can be long)
- **Snippets** = ready-to-use text AI copies verbatim (raw text, short)

**What to put in snippets:**
- Email signatures, legal disclaimers, prompt templates
- Boilerplate paragraphs, standard responses, code snippets
- API keys format, standard headers, quick references`}</Markdown>
                            </section>

                            <section id="uploading-assets" className="mb-12">
                                <Markdown>{`## Uploading Assets

Upload files by **dragging and dropping** onto the upload area, or click to browse. Supported: images, videos, PDFs, and other files.

The **AI description** field is critical:
- This is what AI sees when it accesses the asset
- **Without a description**, assets are listed but not understood by AI
- Write descriptions that explain what the file contains and when it's relevant

Videos can be **played inline** directly from the asset list. Images show thumbnails with lightbox zoom.`}</Markdown>
                            </section>

                            <section id="asset-folders" className="mb-12">
                                <Markdown>{`## Asset Folders

Organize assets into **folders** with nested hierarchy:

- Create folders and sub-folders
- Drag assets between folders or use batch move
- Batch operations: move, copy, or delete multiple assets at once
- Folder tree navigation in the sidebar

Folders are workspace-level — the same folder structure is visible regardless of which collection you're in.`}</Markdown>
                            </section>

                            <section id="tagging" className="mb-12">
                                <Markdown>{`## Tagging

Tags help organize your content across all types:

- **Create tags** with custom names and colors
- **Apply tags** to documents, skills, snippets, and assets
- **Filter lists** by tag to quickly find related content

Tags are workspace-level — the same tag can be applied to any content type.`}</Markdown>
                            </section>
                        </section>

                        {/* Templates */}
                        <section id="templates" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">Templates</h1>

                            <section id="workspace-templates" className="mb-12">
                                <Markdown>{`## Workspace Templates

Workspace templates pre-populate your workspace documents during setup:

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

When creating a collection, the **type** you choose determines which collection documents are pre-created:

| Type | Documents Created |
|------|------------------|
| **Software Project** | Instructions, Architecture, Roadmap |
| **Client Project** | Instructions, Client Brief, Deliverables |
| **Sales Agent** | Instructions, Products & Services, Target Market, Sales Playbook |
| **Social Manager** | Instructions, Content Strategy, Brand Voice, Channels & Formats |
| **Marketing** | Instructions, Brand & Positioning, Campaigns, Content Bank |
| **Strategy & Brainstorm** | Instructions, Ideas Pipeline, Market Context, Validation Framework |
| **Custom** | Instructions only |

Each template pre-fills documents with placeholder content to guide you.`}</Markdown>
                            </section>

                            <section id="document-templates" className="mb-12">
                                <Markdown>{`## Document Templates

When adding a new collection document, you can choose from **20+ built-in templates**:

Architecture, Roadmap, Brand Voice, Products & Services, Target Market, Sales Playbook, Content Strategy, Channels & Formats, Client Brief, Deliverables, Ideas Pipeline, Market Context, Validation Framework, Brand & Positioning, Campaigns, Content Bank, FAQ, Competitor Analysis, Guidelines, and more.

Each template pre-fills the document name and placeholder content. You can also start with a **blank document** and name it anything.`}</Markdown>
                            </section>
                        </section>

                        {/* API / MCP Reference */}
                        <section id="api-mcp-reference" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">API / MCP Reference</h1>

                            <section id="available-tools" className="mb-12">
                                <Markdown>{`## Available Tools

${appName} exposes **9 tools** via MCP. Most tools use an \`action\` parameter to select the operation:

| Tool | Actions | Description |
|------|---------|-------------|
| \`get_context\` | — | Load context. Pass a collection slug to switch collections (workspace tokens). |
| \`collection_documents\` | list, get, create, update, append, delete, reorder, list_templates | Manage collection documents (Instructions, Architecture, etc.) |
| \`documents\` | list, get, create, update, append | Manage workspace documents assigned to the collection |
| \`skills\` | list, get, create, update, append | Manage skills |
| \`snippets\` | list, get, create, update, append | Manage snippets |
| \`assets\` | list, get_url, list_folders, create_folder, move | Manage assets and folders |
| \`search\` | — | Full-text search across documents, skills, and snippets |
| \`update_system_document\` | — | Update workspace-level documents (Identity, Instructions, etc.) |
| \`append_memory\` | — | Save short memory entries (workspace or collection scoped) |`}</Markdown>
                            </section>

                            <section id="authentication" className="mb-12">
                                <Markdown>{`## Authentication

API requests are authenticated using bearer tokens:

**Header authentication:**
\`\`\`
Authorization: Bearer YOUR_TOKEN
\`\`\`

**Query parameter authentication:**
\`\`\`
https://yourdomain.com/mcp?token=YOUR_TOKEN
\`\`\`

Token types:
- \`cv_ws_\` — **Workspace token**: access to all collections, supports switching
- \`cv_live_\` — **Collection token**: scoped to one collection

Tokens are SHA-256 hashed server-side. The plain token is shown only once at creation.`}</Markdown>
                            </section>

                            <section id="collection-switching" className="mb-12">
                                <Markdown>{`## Collection Switching

With a **workspace token**, you can switch between collections dynamically:

1. Call \`get_context\` with no parameters — returns list of available collections
2. Call \`get_context(collection: "project-slug")\` — switches to that collection
3. All subsequent tool calls are scoped to the selected collection
4. Call \`get_context(collection: "other-slug")\` — switches to a different collection

The active collection is **persisted on the token**, so it survives across conversations using the same MCP endpoint.

With a **collection token**, the collection is fixed — no switching is needed or possible.`}</Markdown>
                            </section>

                            <section id="writing-long-content" className="mb-12">
                                <Markdown>{`## Writing Long Content

Due to AI output token limits, content updates should be **chunked**:

- **Max 1500 characters** per tool call
- Use \`update\` for the first chunk
- Use \`append\` for subsequent chunks
- **One document per conversation turn** — updating multiple documents in a single turn may cause output truncation

The \`append\` action is available on: \`collection_documents\`, \`documents\`, \`skills\`, \`snippets\`.`}</Markdown>
                            </section>
                        </section>
                    </main>
                </div>
            </div>
        </>
    );
}
