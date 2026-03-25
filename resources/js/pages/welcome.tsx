import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Boxes,
    BrainCircuit,
    Briefcase,
    FileText,
    FolderKanban,
    History,
    Key,
    Megaphone,
    MonitorSmartphone,
    Network,
    Pencil,
    Server,
    Users,
} from 'lucide-react';

const COLORS = {
    bg: '#0e0e12',
    surface: '#111118',
    border: '#1a1a22',
    primary: '#6366f1',
    primaryHover: '#818cf8',
    textPrimary: '#f0f0f5',
    textSecondary: '#9393a8',
    textMuted: '#6b6b80',
};

const features = [
    {
        icon: BrainCircuit,
        title: 'Centralized context management',
        description: 'Store your AI identity, instructions, skills, and project context in one organized vault.',
    },
    {
        icon: Server,
        title: 'MCP-native delivery',
        description: 'Serve context directly to AI clients through the Model Context Protocol — no copy-paste needed.',
    },
    {
        icon: History,
        title: 'Version history on everything',
        description: 'Track every change to your context items. Roll back anytime with full audit trails.',
    },
    {
        icon: FolderKanban,
        title: 'Collection-based organization',
        description: 'Group context by project, client, or domain. Each collection gets its own MCP endpoint.',
    },
    {
        icon: FileText,
        title: 'Asset management with AI descriptions',
        description: 'Upload files and documents. AI-generated descriptions make your assets searchable and contextual.',
    },
    {
        icon: Key,
        title: 'Token-based auth per collection',
        description: 'Fine-grained access control. Generate unique tokens for each collection and AI client.',
    },
    {
        icon: MonitorSmartphone,
        title: 'Works with Claude.ai, Claude Code, Cowork',
        description: 'Compatible with any MCP-enabled AI client. Connect once, use everywhere.',
    },
];

const useCases = [
    {
        icon: Pencil,
        role: 'Developers',
        description: 'Stack preferences, code conventions, and project context — so your AI pair programmer actually knows your codebase.',
    },
    {
        icon: Megaphone,
        role: 'Marketers',
        description: 'Brand voice, campaign briefs, and content guidelines — consistent AI outputs across every channel.',
    },
    {
        icon: Briefcase,
        role: 'Consultants',
        description: 'Client briefs, processes, and deliverable templates — switch between clients without losing context.',
    },
    {
        icon: Users,
        role: 'Agencies',
        description: 'Per-client context and team-wide skills — everyone on the team gets the same AI quality.',
    },
];

const steps = [
    {
        icon: BrainCircuit,
        step: '01',
        title: 'Define your AI identity',
        description: 'Create a detailed identity with your background, communication style, expertise, and preferences. Your AI will know who you are from the first message.',
    },
    {
        icon: Boxes,
        step: '02',
        title: 'Organize by project',
        description: 'Create collections for each project, client, or domain. Add context items, skills, and assets. Structure your knowledge the way that makes sense for you.',
    },
    {
        icon: Network,
        step: '03',
        title: 'Connect via MCP',
        description: 'Generate a token, add the MCP endpoint to your AI client, and start chatting. Your AI now has full access to the context it needs.',
    },
];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Context Vault — Your AI brain, centralized" />
            <div className="scroll-smooth" style={{ background: COLORS.bg, color: COLORS.textPrimary, fontFamily: "'DM Sans', sans-serif" }}>
                {/* Navigation */}
                <nav
                    className="sticky top-0 z-50 border-b backdrop-blur-md"
                    style={{ borderColor: COLORS.border, background: `${COLORS.bg}ee` }}
                >
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
                                <div className="flex size-8 items-center justify-center overflow-hidden rounded-md">
                                    <img src="/logo.jpg" alt="Logo" className="size-8 object-cover" />
                                </div>
                                Context Vault
                            </Link>
                            <div className="hidden items-center gap-6 text-sm md:flex" style={{ color: COLORS.textSecondary }}>
                                <a href="#features" className="transition-colors hover:text-white">
                                    Features
                                </a>
                                <a href="#use-cases" className="transition-colors hover:text-white">
                                    Use Cases
                                </a>
                                <Link href="/docs" className="transition-colors hover:text-white">
                                    Docs
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors"
                                    style={{ background: COLORS.primary }}
                                >
                                    Dashboard
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="hidden rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:text-white sm:inline-block"
                                        style={{ color: COLORS.textSecondary }}
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
                                        style={{ background: COLORS.primary }}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="relative overflow-hidden">
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${COLORS.primary}18 0%, transparent 70%)`,
                        }}
                    />
                    <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-20 text-center lg:pt-36 lg:pb-32">
                        <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
                            Your AI brain,{' '}
                            <span style={{ color: COLORS.primary }}>centralized.</span>
                        </h1>
                        <p
                            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
                            style={{ color: COLORS.textSecondary }}
                        >
                            Organize identity, context, skills, and assets in one place. Serve them to any AI client via MCP.
                        </p>
                        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href={route('register')}
                                className="inline-flex items-center gap-2 rounded-lg px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                                style={{ background: COLORS.primary, boxShadow: `0 4px 24px ${COLORS.primary}40` }}
                            >
                                Get Started Free
                                <ArrowRight className="size-4" />
                            </Link>
                            <Link
                                href="/docs"
                                className="inline-flex items-center gap-2 rounded-lg border px-8 py-3 text-base font-semibold transition-colors hover:bg-white/5"
                                style={{ borderColor: COLORS.border, color: COLORS.textSecondary }}
                            >
                                <BookOpen className="size-4" />
                                View Docs
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Problem */}
                <section className="mx-auto max-w-3xl px-6 py-16 text-center lg:py-24">
                    <div className="rounded-2xl border p-8 sm:p-12" style={{ background: COLORS.surface, borderColor: COLORS.border }}>
                        <p className="text-lg leading-relaxed sm:text-xl" style={{ color: COLORS.textSecondary }}>
                            Your AI context is scattered across local folders, copy-pasted prompts, and chat histories.{' '}
                            <span className="font-semibold text-white">Every new conversation starts from zero.</span>
                        </p>
                    </div>
                </section>

                {/* How It Works */}
                <section className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
                    <div className="mb-12 text-center lg:mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
                        <p className="mt-4 text-base" style={{ color: COLORS.textSecondary }}>
                            Three steps to give your AI the context it deserves.
                        </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                        {steps.map((step) => (
                            <div
                                key={step.step}
                                className="group relative rounded-2xl border p-8 transition-colors hover:border-[#2a2a36]"
                                style={{ background: COLORS.surface, borderColor: COLORS.border }}
                            >
                                <span
                                    className="mb-4 inline-block text-sm font-bold tracking-wider"
                                    style={{ color: COLORS.primary }}
                                >
                                    STEP {step.step}
                                </span>
                                <div
                                    className="mb-4 flex size-12 items-center justify-center rounded-xl"
                                    style={{ background: `${COLORS.primary}15` }}
                                >
                                    <step.icon className="size-6" style={{ color: COLORS.primary }} />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
                    <div className="mb-12 text-center lg:mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need</h2>
                        <p className="mt-4 text-base" style={{ color: COLORS.textSecondary }}>
                            Built from the ground up for AI context management.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-2xl border p-6 transition-colors hover:border-[#2a2a36]"
                                style={{ background: COLORS.surface, borderColor: COLORS.border }}
                            >
                                <div
                                    className="mb-4 flex size-10 items-center justify-center rounded-lg"
                                    style={{ background: `${COLORS.primary}15` }}
                                >
                                    <feature.icon className="size-5" style={{ color: COLORS.primary }} />
                                </div>
                                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Use Cases */}
                <section id="use-cases" className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
                    <div className="mb-12 text-center lg:mb-16">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for every workflow</h2>
                        <p className="mt-4 text-base" style={{ color: COLORS.textSecondary }}>
                            Context Vault adapts to how you work with AI.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                        {useCases.map((useCase) => (
                            <div
                                key={useCase.role}
                                className="rounded-2xl border p-8 transition-colors hover:border-[#2a2a36]"
                                style={{ background: COLORS.surface, borderColor: COLORS.border }}
                            >
                                <div
                                    className="mb-4 flex size-12 items-center justify-center rounded-xl"
                                    style={{ background: `${COLORS.primary}15` }}
                                >
                                    <useCase.icon className="size-6" style={{ color: COLORS.primary }} />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">{useCase.role}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: COLORS.textSecondary }}>
                                    {useCase.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Footer */}
                <section className="mx-auto max-w-4xl px-6 py-16 text-center lg:py-24">
                    <div
                        className="rounded-2xl border p-10 sm:p-16"
                        style={{
                            background: COLORS.surface,
                            borderColor: COLORS.border,
                            boxShadow: `0 0 80px ${COLORS.primary}08`,
                        }}
                    >
                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                            Stop repeating yourself to AI.
                            <br />
                            <span style={{ color: COLORS.primary }}>Start building your vault.</span>
                        </h2>
                        <div className="mt-8">
                            <Link
                                href={route('register')}
                                className="inline-flex items-center gap-2 rounded-lg px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                                style={{ background: COLORS.primary, boxShadow: `0 4px 24px ${COLORS.primary}40` }}
                            >
                                Get Started Free
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t" style={{ borderColor: COLORS.border }}>
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <div className="flex size-6 items-center justify-center overflow-hidden rounded">
                                <img src="/logo.jpg" alt="Logo" className="size-6 object-cover" />
                            </div>
                            Context Vault
                        </div>
                        <div className="flex items-center gap-6 text-sm" style={{ color: COLORS.textMuted }}>
                            <Link href="/docs" className="transition-colors hover:text-white">
                                Docs
                            </Link>
                            <Link href={route('login')} className="transition-colors hover:text-white">
                                Login
                            </Link>
                            <Link href={route('register')} className="transition-colors hover:text-white">
                                Register
                            </Link>
                        </div>
                        <p className="text-sm" style={{ color: COLORS.textMuted }}>
                            &copy; {new Date().getFullYear()} Context Vault
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
