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
import { useEffect, useState } from 'react';

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
        title: 'Works with Claude Desktop, Claude Code, Cowork',
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
        description:
            'Create a detailed identity with your background, communication style, expertise, and preferences. Your AI will know who you are from the first message.',
    },
    {
        icon: Boxes,
        step: '02',
        title: 'Organize by project',
        description:
            'Create collections for each project, client, or domain. Add context items, skills, and assets. Structure your knowledge the way that makes sense for you.',
    },
    {
        icon: Network,
        step: '03',
        title: 'Connect via MCP',
        description:
            'Generate a token, add the MCP endpoint to your AI client, and start chatting. Your AI now has full access to the context it needs.',
    },
];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Head title="Context Vault — Your AI brain, centralized">
                <style>{`
                    @keyframes gradient-shift {
                        0%, 100% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                    }
                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(24px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes pulse-glow {
                        0%, 100% { opacity: 0.3; }
                        50% { opacity: 0.7; }
                    }
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-8px); }
                    }
                    @keyframes mesh-rotate {
                        0% { transform: rotate(0deg) scale(1); }
                        33% { transform: rotate(120deg) scale(1.1); }
                        66% { transform: rotate(240deg) scale(0.95); }
                        100% { transform: rotate(360deg) scale(1); }
                    }
                    @keyframes flow-dot {
                        0% { opacity: 0; transform: translate(var(--start-x), var(--start-y)) scale(0.5); }
                        40% { opacity: 1; transform: translate(calc(var(--start-x) * 0.3), calc(var(--start-y) * 0.3)) scale(1); }
                        80% { opacity: 0.6; transform: translate(0px, 0px) scale(0.8); }
                        100% { opacity: 0; transform: translate(0px, 0px) scale(0); }
                    }
                    .animate-fade-in-up {
                        animation: fade-in-up 0.7s ease-out both;
                    }
                    .animate-gradient-shift {
                        background-size: 200% 200%;
                        animation: gradient-shift 8s ease infinite;
                    }
                    .animate-mesh {
                        animation: mesh-rotate 20s ease-in-out infinite;
                    }
                    .animate-mesh-reverse {
                        animation: mesh-rotate 25s ease-in-out infinite reverse;
                    }
                    .animate-mesh-slow {
                        animation: mesh-rotate 30s ease-in-out infinite;
                    }
                    .flow-dot {
                        animation: flow-dot 4s ease-in-out infinite;
                    }
                    .glass-card {
                        background: rgba(17, 17, 24, 0.8);
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.06);
                        transition: border-color 0.3s ease, box-shadow 0.3s ease;
                    }
                    .glass-card:hover {
                        border-color: rgba(99, 102, 241, 0.3);
                        box-shadow: 0 0 30px rgba(99, 102, 241, 0.08);
                    }
                    .gradient-text {
                        background: linear-gradient(135deg, #6366f1, #8b5cf6, #6366f1);
                        background-size: 200% auto;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        animation: gradient-shift 4s ease infinite;
                    }
                    .btn-primary-glow {
                        background: linear-gradient(135deg, #6366f1, #8b5cf6);
                        box-shadow: 0 4px 24px rgba(99, 102, 241, 0.4), 0 0 60px rgba(99, 102, 241, 0.15);
                        transition: box-shadow 0.3s ease, transform 0.2s ease;
                    }
                    .btn-primary-glow:hover {
                        box-shadow: 0 6px 32px rgba(99, 102, 241, 0.55), 0 0 80px rgba(99, 102, 241, 0.2);
                        transform: translateY(-1px);
                    }
                    .btn-glass {
                        background: rgba(255, 255, 255, 0.03);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(8px);
                        -webkit-backdrop-filter: blur(8px);
                        transition: background 0.3s ease, border-color 0.3s ease;
                    }
                    .btn-glass:hover {
                        background: rgba(255, 255, 255, 0.06);
                        border-color: rgba(255, 255, 255, 0.18);
                    }
                    .stagger-1 { animation-delay: 0.1s; }
                    .stagger-2 { animation-delay: 0.2s; }
                    .stagger-3 { animation-delay: 0.3s; }
                    .stagger-4 { animation-delay: 0.4s; }
                    .stagger-5 { animation-delay: 0.5s; }
                    .stagger-6 { animation-delay: 0.6s; }
                    .stagger-7 { animation-delay: 0.7s; }
                    .icon-glow {
                        background: rgba(99, 102, 241, 0.12);
                        box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
                    }
                `}</style>
            </Head>

            <div className="scroll-smooth" style={{ background: '#0a0a0f', color: '#f0f0f5', fontFamily: "'DM Sans', sans-serif" }}>
                {/* Navigation */}
                <nav
                    className="fixed top-0 right-0 left-0 z-50 transition-all duration-300"
                    style={{
                        background: scrolled ? 'rgba(10, 10, 15, 0.85)' : 'rgba(10, 10, 15, 0.5)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderBottom: `1px solid ${scrolled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)'}`,
                    }}
                >
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
                                <div className="flex size-8 items-center justify-center overflow-hidden rounded-md">
                                    <img src="/logo.jpg" alt="Logo" className="size-8 object-cover" />
                                </div>
                                Context Vault
                            </Link>
                            <div className="hidden items-center gap-6 text-sm font-medium md:flex" style={{ color: '#8888a0' }}>
                                <a href="#features" className="transition-colors duration-200 hover:text-white">
                                    Features
                                </a>
                                <a href="#use-cases" className="transition-colors duration-200 hover:text-white">
                                    Use Cases
                                </a>
                                <Link href="/docs" className="transition-colors duration-200 hover:text-white">
                                    Docs
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="btn-primary-glow inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white"
                                >
                                    Dashboard
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="hidden rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 hover:text-white sm:inline-block"
                                        style={{ color: '#8888a0' }}
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="btn-primary-glow inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="relative overflow-hidden pt-20">
                    {/* Animated gradient mesh background */}
                    <div className="pointer-events-none absolute inset-0">
                        <div
                            className="animate-mesh absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full opacity-30"
                            style={{
                                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
                                filter: 'blur(80px)',
                            }}
                        />
                        <div
                            className="animate-mesh-reverse absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full opacity-25"
                            style={{
                                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)',
                                filter: 'blur(80px)',
                            }}
                        />
                        <div
                            className="animate-mesh-slow absolute bottom-[-10%] left-[30%] h-[400px] w-[400px] rounded-full opacity-20"
                            style={{
                                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                                filter: 'blur(80px)',
                            }}
                        />
                    </div>

                    {/* Context flow dots */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        {[
                            { x: '-180px', y: '-120px', delay: '0s' },
                            { x: '200px', y: '-80px', delay: '0.8s' },
                            { x: '-150px', y: '100px', delay: '1.6s' },
                            { x: '170px', y: '130px', delay: '2.4s' },
                            { x: '-60px', y: '-160px', delay: '3.2s' },
                            { x: '90px', y: '160px', delay: '1.2s' },
                            { x: '-200px', y: '20px', delay: '2s' },
                            { x: '220px', y: '-30px', delay: '0.4s' },
                        ].map((dot, i) => (
                            <div
                                key={i}
                                className="flow-dot absolute size-1.5 rounded-full"
                                style={{
                                    background: '#6366f1',
                                    boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)',
                                    '--start-x': dot.x,
                                    '--start-y': dot.y,
                                    animationDelay: dot.delay,
                                } as React.CSSProperties}
                            />
                        ))}
                        {/* Central convergence point */}
                        <div
                            className="absolute size-3 rounded-full"
                            style={{
                                background: '#6366f1',
                                boxShadow: '0 0 20px rgba(99, 102, 241, 0.5), 0 0 40px rgba(99, 102, 241, 0.2)',
                                animation: 'pulse-glow 3s ease-in-out infinite',
                            }}
                        />
                    </div>

                    <div className="relative mx-auto max-w-4xl px-6 pt-32 pb-24 text-center lg:pt-44 lg:pb-36">
                        <h1 className="animate-fade-in-up text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-7xl">
                            Your AI brain,
                            <br />
                            <span className="gradient-text">centralized.</span>
                        </h1>
                        <p className="animate-fade-in-up stagger-1 mx-auto mt-8 max-w-2xl text-lg leading-relaxed sm:text-xl" style={{ color: '#8888a0' }}>
                            Organize identity, context, skills, and assets in one place. Serve them to any AI client via MCP.
                        </p>
                        <div className="animate-fade-in-up stagger-2 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link
                                href={route('register')}
                                className="btn-primary-glow inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-base font-semibold text-white"
                            >
                                Get Started Free
                                <ArrowRight className="size-4" />
                            </Link>
                            <Link href="/docs" className="btn-glass inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-base font-semibold" style={{ color: '#8888a0' }}>
                                <BookOpen className="size-4" />
                                View Docs
                            </Link>
                        </div>

                        {/* Works with */}
                        <div className="animate-fade-in-up stagger-3 mt-16">
                            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: '#55556a' }}>
                                Works with
                            </p>
                            <div className="flex items-center justify-center gap-8 text-sm" style={{ color: '#55556a', fontFamily: "'DM Mono', 'SF Mono', monospace" }}>
                                <span className="transition-colors duration-200 hover:text-white/50">Claude Desktop</span>
                                <span style={{ color: '#2a2a35' }}>|</span>
                                <span className="transition-colors duration-200 hover:text-white/50">Claude Code</span>
                                <span style={{ color: '#2a2a35' }}>|</span>
                                <span className="transition-colors duration-200 hover:text-white/50">Cowork</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem */}
                <section className="relative">
                    {/* Diagonal divider */}
                    <div
                        className="absolute top-0 right-0 left-0 h-px"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent)',
                        }}
                    />
                    <div className="mx-auto max-w-3xl px-6 py-20 text-center lg:py-28">
                        <div className="animate-fade-in-up">
                            <p className="text-xl leading-relaxed sm:text-2xl lg:text-3xl" style={{ color: '#8888a0', fontWeight: 300 }}>
                                Your AI context is scattered across local folders, copy-pasted prompts, and chat histories.{' '}
                                <span className="font-semibold text-white">Every new conversation starts from zero.</span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="relative mx-auto max-w-6xl px-6 py-20 lg:py-32">
                    <div className="mb-16 text-center lg:mb-20">
                        <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">How it works</h2>
                        <p className="animate-fade-in-up stagger-1 mt-5 text-base lg:text-lg" style={{ color: '#8888a0' }}>
                            Three steps to give your AI the context it deserves.
                        </p>
                    </div>
                    <div className="relative grid gap-8 md:grid-cols-3">
                        {/* Connecting line (desktop) */}
                        <div
                            className="pointer-events-none absolute top-24 right-[calc(33.33%+1rem)] left-[calc(33.33%-1rem)] hidden h-px md:block"
                            style={{
                                background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.4), rgba(99, 102, 241, 0.2))',
                            }}
                        />
                        {steps.map((step, index) => (
                            <div key={step.step} className={`animate-fade-in-up stagger-${index + 1} glass-card group relative rounded-2xl p-10 lg:p-12`}>
                                {/* Oversized step number */}
                                <span
                                    className="pointer-events-none absolute top-6 right-8 text-8xl font-bold leading-none select-none"
                                    style={{ color: 'rgba(99, 102, 241, 0.06)' }}
                                >
                                    {step.step}
                                </span>
                                <div className="icon-glow mb-6 flex size-14 items-center justify-center rounded-xl">
                                    <step.icon className="size-7" style={{ color: '#6366f1' }} />
                                </div>
                                <h3 className="mb-4 text-xl font-semibold lg:text-2xl">{step.title}</h3>
                                <p className="text-lg font-light leading-loose" style={{ color: '#9999b0' }}>
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="relative mx-auto max-w-6xl px-6 py-20 lg:py-32">
                    <div
                        className="absolute top-0 right-0 left-0 h-px"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.15), transparent)',
                        }}
                    />
                    <div className="mb-16 text-center lg:mb-20">
                        <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Everything you need</h2>
                        <p className="animate-fade-in-up stagger-1 mt-5 text-base lg:text-lg" style={{ color: '#8888a0' }}>
                            Built from the ground up for AI context management.
                        </p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className={`animate-fade-in-up stagger-${index + 1} glass-card group rounded-2xl p-8 lg:p-10`}
                            >
                                <div className="icon-glow mb-6 flex size-12 items-center justify-center rounded-xl">
                                    <feature.icon className="size-6" style={{ color: '#6366f1' }} />
                                </div>
                                <h3 className="mb-3 text-lg font-semibold">{feature.title}</h3>
                                <p className="text-base font-light leading-loose" style={{ color: '#9999b0' }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Use Cases */}
                <section id="use-cases" className="relative mx-auto max-w-6xl px-6 py-20 lg:py-32">
                    <div
                        className="absolute top-0 right-0 left-0 h-px"
                        style={{
                            background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.15), transparent)',
                        }}
                    />
                    <div className="mb-16 text-center lg:mb-20">
                        <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Built for every workflow</h2>
                        <p className="animate-fade-in-up stagger-1 mt-5 text-base lg:text-lg" style={{ color: '#8888a0' }}>
                            Context Vault adapts to how you work with AI.
                        </p>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {useCases.map((useCase, index) => (
                            <div key={useCase.role} className={`animate-fade-in-up stagger-${index + 1} glass-card group relative overflow-hidden rounded-2xl p-8`}>
                                {/* Subtle gradient overlay at top */}
                                <div
                                    className="pointer-events-none absolute inset-x-0 top-0 h-24"
                                    style={{
                                        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.04) 0%, transparent 100%)',
                                    }}
                                />
                                <div className="relative">
                                    <div
                                        className="mb-5 flex size-14 items-center justify-center rounded-full"
                                        style={{
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            boxShadow: '0 0 24px rgba(99, 102, 241, 0.12)',
                                        }}
                                    >
                                        <useCase.icon className="size-6" style={{ color: '#6366f1' }} />
                                    </div>
                                    <h3 className="mb-4 text-2xl font-semibold">{useCase.role}</h3>
                                    <p className="text-lg font-light leading-loose" style={{ color: '#9999b0' }}>
                                        {useCase.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="relative py-20 lg:py-32">
                    {/* Radial gradient background */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                        }}
                    />
                    <div className="relative mx-auto max-w-3xl px-6 text-center">
                        <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            Stop repeating yourself to AI.
                            <br />
                            <span className="gradient-text">Start building your vault.</span>
                        </h2>
                        <div className="animate-fade-in-up stagger-1 mt-10">
                            <Link
                                href={route('register')}
                                className="btn-primary-glow inline-flex items-center gap-2.5 rounded-xl px-10 py-4 text-base font-semibold text-white"
                            >
                                Get Started Free
                                <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer
                    className="relative"
                    style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}
                >
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
                        <div className="flex items-center gap-2.5 text-sm font-semibold">
                            <div className="flex size-6 items-center justify-center overflow-hidden rounded">
                                <img src="/logo.jpg" alt="Logo" className="size-6 object-cover" />
                            </div>
                            Context Vault
                        </div>
                        <div className="flex items-center gap-6 text-sm" style={{ color: '#55556a' }}>
                            <Link href="/docs" className="transition-colors duration-200 hover:text-white">
                                Docs
                            </Link>
                            <Link href={route('login')} className="transition-colors duration-200 hover:text-white">
                                Login
                            </Link>
                            <Link href={route('register')} className="transition-colors duration-200 hover:text-white">
                                Register
                            </Link>
                        </div>
                        <p className="text-sm" style={{ color: '#55556a' }}>
                            &copy; {new Date().getFullYear()} Context Vault
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
