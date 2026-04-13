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
            { id: 'create-your-workspace', title: 'Create Your Nucleus' },
            { id: 'set-up-identity-instructions', title: 'Set Up Identity & Instructions' },
            { id: 'create-your-first-collection', title: 'Create Your First Collection' },
        ],
    },
    {
        id: 'core-concepts',
        title: 'Core Concepts',
        children: [
            { id: 'workspace', title: 'Nucleus' },
            { id: 'workspace-documents', title: 'Nucleus Documents' },
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
            { id: 'workspace-vs-collection-tokens', title: 'Nucleus vs Collection Tokens' },
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
        id: 'graph-wikilinks',
        title: 'Graph & Wikilinks',
        children: [
            { id: 'graph-view', title: 'Graph View' },
            { id: 'wikilinks', title: 'Wikilinks' },
            { id: 'mentions', title: 'Mentions' },
        ],
    },
    {
        id: 'templates',
        title: 'Templates',
        children: [
            { id: 'workspace-templates', title: 'Nucleus Templates' },
            { id: 'collection-templates', title: 'Collection Templates' },
            { id: 'document-templates', title: 'Document Templates' },
        ],
    },
    {
        id: 'api-mcp-reference',
        title: 'API / MCP Reference',
        children: [
            { id: 'available-tools', title: 'Available Tools' },
            { id: 'recommended-workflow', title: 'Recommended MCP Workflow' },
            { id: 'built-in-instructions', title: 'Built-in AI Instructions' },
            { id: 'example-prompts', title: 'Example Prompts' },
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
    const { auth, name: appName, registrationEnabled } = usePage<SharedData>().props;
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
                                    {registrationEnabled && (
                                        <Link
                                            href={route('register')}
                                            className="rounded-md border border-[#6366f1] bg-[#6366f1] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#5558e6]"
                                        >
                                            Register
                                        </Link>
                                    )}
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

Your vault is organized into three areas — matching the app sidebar:

- **Nucleus** — Identity, Instructions, Memory. Your global AI persona, shared across all projects.
- **Cortex** — Documents, Skills, Snippets, Assets. Reference materials and tools AI can use.
- **Neurons** — Collections. Project packages that bundle nucleus content with their own documents and MCP endpoints.

AI clients connect via MCP and get lazy-loaded context: a minimal index first, then specific content on demand.`}</Markdown>
                            </section>

                            <section id="create-your-workspace" className="mb-12">
                                <Markdown>{`## Create Your Nucleus

After registration, a nucleus is automatically created for you with core system documents (Identity and Instructions).

During setup, you'll choose a **template** that pre-populates your nucleus with relevant starting content:

- **Developer** — Stack preferences, code style, development workflow
- **Marketer** — Brand voice, campaign frameworks, audience definitions
- **Consultant** — Areas of expertise, client management patterns
- **Agency** — Service offerings, team structure, client workflows
- **Custom** — Start with a blank slate

Templates are just starting points — you can modify everything freely after creation.`}</Markdown>
                            </section>

                            <section id="set-up-identity-instructions" className="mb-12">
                                <Markdown>{`## Set Up Your Identity & Instructions

Navigate to the **Nucleus** section in the sidebar and find **Identity** and **Instructions**:

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
- Add nucleus content (documents, skills, snippets, assets) to the collection
- Generate API tokens for MCP connections
- Manage project-specific memory entries`}</Markdown>
                            </section>
                        </section>

                        {/* Core Concepts */}
                        <section id="core-concepts" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">Core Concepts</h1>

                            <section id="workspace" className="mb-12">
                                <Markdown>{`## Nucleus

Your nucleus is your **account container**. One user equals one nucleus. It holds all your content — nucleus documents, collections, documents, skills, snippets, assets, tags, and memory entries.

Nucleus-level settings (Identity and Instructions) apply globally to all MCP connections.`}</Markdown>
                            </section>

                            <section id="workspace-documents" className="mb-12">
                                <Markdown>{`## Nucleus Documents

Nucleus documents are global documents that define your AI persona across all collections:

| Document | Purpose |
|----------|---------|
| **Identity** | Who you are — background, role, expertise, personality |
| **Instructions** | How AI should work — coding style, response format, behavior rules |

These two are **core** and always present. You can also add **optional** nucleus documents:

| Optional | Purpose |
|----------|---------|
| **Soul** | Mission, vision, core values, brand personality |
| **Services** | What you offer and how you deliver it |
| **Portfolio** | Past work, case studies, results |
| **Products** | Products, features, pricing, positioning |
| **ICP** | Ideal Customer Profile, pain points, buying behavior |

You can also create **custom** nucleus documents with any name. Optional and custom documents can be deleted; core documents (Identity, Instructions) cannot.

All nucleus documents support markdown and version history.`}</Markdown>
                            </section>

                            <section id="collections" className="mb-12">
                                <Markdown>{`## Collections

Collections are **project packages** with their own documents and MCP endpoints. They scope AI context to specific projects.

Key features:
- **Own MCP endpoint** — Each collection has a unique URL for AI client connections
- **Collection documents** — Each collection has its own set of named documents (Instructions, Architecture, Brand Voice, etc.)
- **Content assignment** — Nucleus documents, skills, snippets, and assets can be assigned to multiple collections
- **Memory** — Each collection can have its own memory entries
- **Templates** — Collection type selects a template that pre-populates initial documents`}</Markdown>
                            </section>

                            <section id="collection-documents" className="mb-12">
                                <Markdown>{`## Collection Documents

Collection documents are **system-level documents that belong to a collection**. They define how AI operates within that specific project and are always available in the MCP context.

Unlike nucleus content (documents, skills, snippets) which is shared across collections, collection documents are **exclusive** to one collection.

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

${appName} supports four nucleus-level content types that can be assigned to collections:

**Documents** — Markdown reference materials. API docs, specs, technical guides. AI retrieves them on demand — they're listed in context so AI knows they exist, and fetches full content when needed.

**Skills** — Operational instructions with a **trigger description**. The description tells AI *when* to activate the skill. The content contains the full instruction set. Think of skills as specialized playbooks.

**Snippets** — Reusable text blocks inserted as-is. Email signatures, disclaimers, prompt templates, boilerplate. No markdown — raw text.

**Assets** — Binary files (images, videos, PDFs) with AI-readable descriptions. Assets can be organized in **folders** with nested hierarchy. Videos can be played inline.`}</Markdown>
                            </section>

                            <section id="context-merging" className="mb-12">
                                <Markdown>{`## How Context Loading Works

When AI connects via MCP, it calls \`get_context\` which returns a **minimal, lazy context**:

1. **Nucleus Identity** — Your identity content
2. **Nucleus Instructions** — Your global instructions
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
                                <Markdown>{`## Nucleus vs Collection Tokens

${appName} supports two types of API tokens:

**Nucleus tokens** (\`cv_ws_\` prefix) — A single token that gives access to **all collections** in your nucleus. AI can list available collections and switch between them dynamically. Great when you want one MCP connection for everything.

**Collection tokens** (\`cv_live_\` prefix) — Scoped to a single collection. AI only sees that collection's content. Use when you want a dedicated, focused connection.

| Feature | Nucleus Token | Collection Token |
|---------|----------------|-----------------|
| Prefix | \`cv_ws_\` | \`cv_live_\` |
| Scope | All collections | One collection |
| Collection switching | Yes, via \`get_context\` | No |
| Create from | Settings → Nucleus | Collection page |

With a nucleus token, AI calls \`get_context\` to see available collections, then \`get_context(collection: "slug")\` to select one. After selection, all tools work as if using a collection token.`}</Markdown>
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

Replace \`yourdomain.com\` with your ${appName} domain and \`YOUR_TOKEN\` with a nucleus or collection token.`}</Markdown>
                            </section>

                            <section id="claude-code" className="mb-12">
                                <Markdown>{`## Claude Code

Run from your terminal:

\`\`\`bash
claude mcp add --transport http memento-vault https://yourdomain.com/mcp?token=YOUR_TOKEN
\`\`\`

Claude Code will automatically connect and have access to your context and content.

> For local Docker setup, use \`http://localhost:4242/mcp?token=YOUR_TOKEN\`. Claude Desktop requires HTTPS — use a tunnel (e.g. \`ngrok http 4242\`) for local testing with Claude Desktop.`}</Markdown>
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

- **Nucleus tokens**: generated from **Settings → Nucleus**
- **Collection tokens**: generated from the **collection detail page**
- **Security**: tokens are SHA-256 hashed — the plain token is shown only once at creation
- **Expiration**: optional expiration date per token
- **Last used**: automatically tracked for each token
- **Revocation**: tokens can be revoked independently at any time

You can create multiple tokens per collection or nucleus (e.g., one for Claude Desktop, one for Claude Code).`}</Markdown>
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

Folders are nucleus-level — the same folder structure is visible regardless of which collection you're in.`}</Markdown>
                            </section>

                            <section id="tagging" className="mb-12">
                                <Markdown>{`## Tagging

Tags help organize your content across all types:

- **Create tags** with custom names and colors
- **Apply tags** to documents, skills, snippets, and assets
- **Filter lists** by tag to quickly find related content

Tags are nucleus-level — the same tag can be applied to any content type.`}</Markdown>
                            </section>
                        </section>

                        {/* Graph & Wikilinks */}
                        <section id="graph-wikilinks" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">Graph & Wikilinks</h1>

                            <section id="graph-view" className="mb-12">
                                <Markdown>{`## Graph View

The Graph View provides an interactive, force-directed visualization of your entire vault — inspired by Obsidian's graph view.

Navigate to **Graph** in the sidebar to explore your content as a network of interconnected nodes.

### Node types

- **Nucleus** — the central node representing your workspace
- **Collections** — first-level nodes around the nucleus, colored per collection
- **Collection Documents** — core project docs, shown with a solid accent color
- **Documents** — reference material, shown in muted tones
- **Skills** — green nodes
- **Snippets** — orange nodes
- **Memory** — purple nodes

### Edge types

| Type | Appearance | Description |
|------|-----------|-------------|
| **Hierarchy** | Dashed, light | Structural relationships (Nucleus → Collection → content) |
| **Wikilink** | Solid, with arrow | Explicit links created with \`[[slug]]\` syntax |
| **Mention** | Dotted, subtle | Implicit connections detected by slug or title matches |

### Controls

- **Zoom/Pan** — mouse wheel and drag
- **Click** a node to navigate to that content
- **Hover** a node to see its type and collection
- **Toggle edge types** — show/hide hierarchy, wikilinks, and mentions independently
- **Filter by type** — show only specific content types (documents, skills, etc.)
- **Filter by collection** — focus on a single collection's subgraph
- **Orphans toggle** — show or hide content with no connections`}</Markdown>
                            </section>

                            <section id="wikilinks" className="mb-12">
                                <Markdown>{`## Wikilinks

Wikilinks let you create explicit connections between any content in your vault.

### Syntax

Use double brackets in any content field:

- \`[[slug]]\` — link to a document, skill, snippet, or collection document by its slug
- \`[[slug|Custom Label]]\` — link with alternative display text

### How they work

1. When you save content containing wikilinks, the system parses and resolves them
2. Resolved links create edges in the graph and render as clickable links in the editor preview
3. Broken links (unresolved slugs) appear in red in the preview

### Slug resolution order

1. Collection documents in the active collection
2. Workspace-level content (documents, skills, snippets)
3. Collection documents in other collections

### Example

\`\`\`markdown
See the [[brand-positioning]] document for tone guidelines.
This follows the [[content-writer|content writing skill]] conventions.
\`\`\`

In preview mode, these render as clickable links that navigate to the referenced content.`}</Markdown>
                            </section>

                            <section id="mentions" className="mb-12">
                                <Markdown>{`## Mentions

Mentions are implicit connections detected automatically — no special syntax needed.

### How detection works

The system scans all content and creates mention edges when:

1. **Slug match** — a content's slug appears as a word in another content's text (case-insensitive, word boundary matching)
2. **Title match** — a content's title (minimum 3 words) appears in another content's text

### What's excluded

- Self-references
- Matches inside code blocks
- Generic titles (e.g. "Instructions", "Architecture", "Roadmap")
- Duplicate mentions where a wikilink already exists to the same target

### Backfill command

To scan all existing content and build mention connections:

\`\`\`bash
php artisan wikilinks:sync --all
\`\`\`

Options:
- \`--workspace=ID\` — sync a specific workspace
- \`--mentions\` — only run mention detection
- \`--wikilinks-only\` — only parse wikilinks

This command is idempotent and can be re-run at any time.`}</Markdown>
                            </section>
                        </section>

                        {/* Templates */}
                        <section id="templates" className="mb-16">
                            <h1 className="mb-8 text-3xl font-bold text-white">Templates</h1>

                            <section id="workspace-templates" className="mb-12">
                                <Markdown>{`## Nucleus Templates

Nucleus templates pre-populate your nucleus documents during setup:

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
| \`get_context\` | — | Load context. Pass a collection slug to switch collections (nucleus tokens). |
| \`collection_documents\` | list, get, create, update, append, delete, reorder, list_templates | Manage collection documents (Instructions, Architecture, etc.) |
| \`documents\` | list, get, create, update, append, delete | Manage nucleus documents assigned to the collection |
| \`skills\` | list, get, create, update, append, delete | Manage skills |
| \`snippets\` | list, get, create, update, append, delete | Manage snippets |
| \`assets\` | list, get_url, list_folders, create_folder, move, delete | Manage assets and folders |
| \`search\` | — | Full-text search across documents, skills, and snippets |
| \`system_documents\` | list, get, update, append | Manage nucleus-level system documents (Identity, Instructions, etc.) |
| \`memory\` | list, get, create, update, delete, move, copy | Manage memory entries (nucleus or collection scoped) |
| \`collections\` | list, get, create, update, delete | Manage collections (neurons) |
| \`graph\` | overview, collection, connections, path | Navigate the workspace knowledge graph |`}</Markdown>
                            </section>

                            <section id="recommended-workflow" className="mb-12">
                                <Markdown>{`## Recommended MCP Workflow

When an AI client connects to your vault via MCP, it should follow this workflow to get oriented and work efficiently.

### First connection

1. **\`graph(action: "overview")\`** — First call. Gets the full workspace map: all collections, their contents, and connection counts. This gives the AI a complete picture of your vault before diving into any specific collection.
2. **\`get_context(collection: "slug")\`** — Activate the collection the user needs to work with. This loads the collection's identity, instructions, and collection documents into context.
3. **\`graph(action: "connections", slug: "...")\`** — When looking for related content or trying to understand how something fits into the bigger picture.

### Where to create content

| Level | Tool | Purpose | Auto-loaded? |
|-------|------|---------|:------------:|
| **System Documents** | \`system_documents\` | Global identity (identity, instructions, soul) | Yes |
| **Collection Documents** | \`collection_documents\` | Essential project context (brand, architecture, workflows) | Yes |
| **Documents** | \`documents\` | Reference material (drafts, specs, templates) | No |

**Rule of thumb:** If the AI must know it every time it works on this project, it's a collection document. If it's reference material needed occasionally, it's a regular document.

### Creating connections

Use \`[[slug]]\` or \`[[slug|label]]\` syntax in any content field to create explicit wikilinks between content. These are parsed on save and appear as edges in the graph.

### Cross-collection operations

When creating content that belongs to a different collection than the active one, use the \`target_collection\` parameter (available on documents, skills, snippets, memory) instead of switching collections.

This workflow is automatically taught to AI clients via the tool descriptions and built-in instructions, but understanding it helps you structure your vault more effectively.`}</Markdown>
                            </section>

                            <section id="built-in-instructions" className="mb-12">
                                <Markdown>{`## Built-in AI Instructions

When an AI client connects to ${appName} via MCP, it automatically receives a **built-in instruction guide** as part of the MCP handshake. This guide teaches the AI how to work with your vault efficiently — without you having to explain it every time.

### What the instructions cover

The built-in guide teaches AI clients:

1. **What context is auto-loaded** — Identity, Instructions, and collection inventory (document slugs, content counts) are already in the conversation. No need to call tools to discover what's available.

2. **How to find content efficiently** — Use \`search\` first (it searches documents, skills, snippets, assets, and collection documents in a single call) instead of listing then getting items one by one.

3. **Tool reference** — Which tool to use for each task, with all available actions listed.

4. **Cross-collection operations** — How to create content in a different collection by passing \`target_collection\` on \`create\`, avoiding the switch-create-switch pattern that wastes 3 tool calls.

5. **Content chunking** — How to write long content using \`create\` then \`append\` (max ~1500 chars per call).

6. **Key distinctions** — The difference between collection documents (always in context), workspace documents (on-demand), and system documents (identity, shared across collections).

### Custom MCP prompt

You can extend the built-in instructions with your own rules in **Settings → AI Behavior → Custom MCP Prompt**. Your custom text is appended after the built-in guide.

Use this to add:
- Project-specific rules ("Always respond in Italian", "Use formal tone")
- Workflow preferences ("Check memory before starting any task")
- Domain knowledge ("Our API uses v2 endpoints")

### Where it lives

The instructions are defined in \`app/Mcp/Servers/ContextVaultServer.php\` in the \`buildInstructions()\` method. They are designed to minimize token waste by teaching AI to work smart from the first interaction.`}</Markdown>
                            </section>

                            <section id="example-prompts" className="mb-12">
                                <Markdown>{`## Example Prompts

You don't need to know MCP commands. Just talk to your AI naturally — it will use the right tools automatically.

### Memory
- **"Remember that I prefer [your preference] for [context]"** — Saves a preference to memory
- **"What do you remember about my preferences?"** — Lists saved memory entries
- **"Move the note about [topic] to the [name] collection"** — Moves a memory entry between collections
- **"Delete the memory about [topic]"** — Removes an outdated entry

### Documents
- **"Search my docs for [topic]"** — Finds relevant documents by content
- **"Create a document with [description]"** — Creates a new document
- **"Update the [name] doc with [changes]"** — Updates existing content
- **"What documents do I have in this collection?"** — Lists available documents

### Skills & Snippets
- **"List all my skills"** — Shows available operational skills
- **"Create a skill for [task] with my conventions"** — Creates a reusable skill
- **"Show me the [name] snippet"** — Retrieves a reusable text block

### Assets
- **"What assets do I have in this collection?"** — Lists files, images, and media
- **"Get the URL for the [filename]"** — Gets a download link for an asset

### Search
- **"Search everything for [keyword]"** — Full-text search across all content

### Collections & Identity
- **"What collections do I have?"** — Lists all available collections
- **"Switch to the [name] collection"** — Changes active collection context
- **"Show me my identity document"** — Reads your nucleus identity
- **"Update my instructions with [changes]"** — Updates nucleus-level documents

### Graph
- **"Show me a graph overview of my vault"** — High-level workspace structure with connection counts
- **"What's connected to the [slug] document?"** — Find all related content via wikilinks and mentions
- **"Show the graph for the [name] collection"** — Explore a single collection's nodes and connections
- **"How are [slug-a] and [slug-b] connected?"** — Find the shortest path between two content nodes`}</Markdown>
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
- \`cv_ws_\` — **Nucleus token**: access to all collections, supports switching
- \`cv_live_\` — **Collection token**: scoped to one collection

Tokens are SHA-256 hashed server-side. The plain token is shown only once at creation.`}</Markdown>
                            </section>

                            <section id="collection-switching" className="mb-12">
                                <Markdown>{`## Collection Switching

With a **nucleus token**, you can switch between collections dynamically:

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
