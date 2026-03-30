import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Welcome() {
    const { auth, name: appName } = usePage<SharedData>().props;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Head title={`${appName} — Your AI brain, centralized`}>
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
                    .animate-fade-in-up { animation: fade-in-up 0.7s ease-out both; }
                    .animate-gradient-shift { background-size: 200% 200%; animation: gradient-shift 8s ease infinite; }
                    .animate-mesh { animation: mesh-rotate 20s ease-in-out infinite; }
                    .animate-mesh-reverse { animation: mesh-rotate 25s ease-in-out infinite reverse; }
                    .animate-mesh-slow { animation: mesh-rotate 30s ease-in-out infinite; }
                    .flow-dot { animation: flow-dot 4s ease-in-out infinite; }
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
                        transition: background 0.3s ease, border-color 0.3s ease;
                    }
                    .btn-glass:hover {
                        background: rgba(255, 255, 255, 0.06);
                        border-color: rgba(255, 255, 255, 0.18);
                    }
                    .stagger-1 { animation-delay: 0.1s; }
                    .stagger-2 { animation-delay: 0.2s; }
                    .stagger-3 { animation-delay: 0.3s; }
                    .glass-card {
                        background: rgba(17, 17, 24, 0.8);
                        backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.06);
                        transition: border-color 0.3s ease;
                    }
                    .glass-card:hover { border-color: rgba(99, 102, 241, 0.3); }
                    .screenshot-placeholder {
                        background: linear-gradient(135deg, rgba(17, 17, 24, 0.9), rgba(25, 25, 35, 0.9));
                        border: 1px solid rgba(255, 255, 255, 0.08);
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
                                {appName}
                            </Link>
                            <div className="hidden items-center gap-6 text-sm font-medium md:flex" style={{ color: '#8888a0' }}>
                                <a href="#how-it-works" className="transition-colors duration-200 hover:text-white">How it works</a>
                                <a href="#product" className="transition-colors duration-200 hover:text-white">Product</a>
                                <Link href="/docs" className="transition-colors duration-200 hover:text-white">Docs</Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link href={route('dashboard')} className="btn-primary-glow inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white">
                                    Dashboard <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link href={route('login')} className="hidden rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 hover:text-white sm:inline-block" style={{ color: '#8888a0' }}>
                                        Log in
                                    </Link>
                                    <Link href={route('register')} className="btn-primary-glow inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="relative overflow-hidden pt-20">
                    <div className="pointer-events-none absolute inset-0">
                        <div className="animate-mesh absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                        <div className="animate-mesh-reverse absolute top-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                        <div className="animate-mesh-slow absolute bottom-[-10%] left-[30%] h-[400px] w-[400px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)', filter: 'blur(80px)' }} />
                    </div>

                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        {[
                            { x: '-180px', y: '-120px', delay: '0s' }, { x: '200px', y: '-80px', delay: '0.8s' },
                            { x: '-150px', y: '100px', delay: '1.6s' }, { x: '170px', y: '130px', delay: '2.4s' },
                            { x: '-60px', y: '-160px', delay: '3.2s' }, { x: '90px', y: '160px', delay: '1.2s' },
                        ].map((dot, i) => (
                            <div key={i} className="flow-dot absolute size-1.5 rounded-full" style={{ background: '#6366f1', boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)', '--start-x': dot.x, '--start-y': dot.y, animationDelay: dot.delay } as React.CSSProperties} />
                        ))}
                        <div className="absolute size-3 rounded-full" style={{ background: '#6366f1', boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)', animation: 'pulse-glow 3s ease-in-out infinite' }} />
                    </div>

                    <div className="relative mx-auto max-w-4xl px-6 pt-32 pb-24 text-center lg:pt-44 lg:pb-36">
                        <h1 className="animate-fade-in-up text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-7xl">
                            Your AI brain,<br /><span className="gradient-text">centralized.</span>
                        </h1>
                        <p className="animate-fade-in-up stagger-1 mx-auto mt-8 max-w-2xl text-lg leading-relaxed sm:text-xl" style={{ color: '#8888a0' }}>
                            Define your identity, instructions, and project context once. Every AI client gets it automatically via MCP.
                        </p>
                        <div className="animate-fade-in-up stagger-2 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link href={route('register')} className="btn-primary-glow inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-base font-semibold text-white">
                                Get Started Free <ArrowRight className="size-4" />
                            </Link>
                            <Link href="/docs" className="btn-glass inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-base font-semibold" style={{ color: '#8888a0' }}>
                                <BookOpen className="size-4" /> View Docs
                            </Link>
                        </div>
                        <div className="animate-fade-in-up stagger-3 mt-16">
                            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em]" style={{ color: '#55556a' }}>Works with</p>
                            <div className="flex items-center justify-center gap-8 text-sm" style={{ color: '#55556a', fontFamily: "'JetBrains Mono', monospace" }}>
                                <span className="transition-colors duration-200 hover:text-white/50">Claude Desktop</span>
                                <span style={{ color: '#2a2a35' }}>|</span>
                                <span className="transition-colors duration-200 hover:text-white/50">Claude Code</span>
                                <span style={{ color: '#2a2a35' }}>|</span>
                                <span className="transition-colors duration-200 hover:text-white/50">Any MCP Client</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Flow — visual diagram */}
                <section className="relative py-20 lg:py-28">
                    <div className="absolute top-0 right-0 left-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent)' }} />

                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <p className="animate-fade-in-up text-xl leading-relaxed sm:text-2xl" style={{ color: '#8888a0', fontWeight: 300 }}>
                            Your AI context is scattered across local files and chat histories.{' '}
                            <span className="font-semibold text-white">Every new conversation starts from zero.</span>
                        </p>

                        {/* Visual flow diagram */}
                        <div className="animate-fade-in-up stagger-1 mx-auto mt-16 max-w-3xl">
                            <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-6">
                                {/* AI Clients */}
                                <div className="flex gap-3 md:flex-col md:gap-3">
                                    {['Claude.ai', 'Claude Code', 'Any MCP client'].map((client) => (
                                        <div key={client} className="glass-card rounded-lg px-4 py-2.5 text-xs font-medium" style={{ color: '#a1a1aa' }}>
                                            {client}
                                        </div>
                                    ))}
                                </div>

                                {/* Arrow */}
                                <div className="flex items-center">
                                    <div className="hidden h-px w-12 md:block" style={{ background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.6))' }} />
                                    <div className="h-8 w-px md:hidden" style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.6))' }} />
                                </div>

                                {/* Memento Vault */}
                                <div className="relative rounded-xl border border-indigo-500/30 px-8 py-5" style={{ background: 'rgba(99, 102, 241, 0.08)', boxShadow: '0 0 40px rgba(99, 102, 241, 0.1)' }}>
                                    <div className="text-sm font-bold" style={{ color: '#6366f1' }}>{appName}</div>
                                    <div className="mt-0.5 text-xs" style={{ color: '#8888a0' }}>MCP Server</div>
                                </div>

                                {/* Arrow */}
                                <div className="flex items-center">
                                    <div className="hidden h-px w-12 md:block" style={{ background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.6), rgba(99, 102, 241, 0.3))' }} />
                                    <div className="h-8 w-px md:hidden" style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.6), rgba(99, 102, 241, 0.3))' }} />
                                </div>

                                {/* Content */}
                                <div className="flex gap-3 md:flex-col md:gap-3">
                                    {[
                                        { label: 'Identity & Instructions', color: '#6366f1' },
                                        { label: 'Skills & Documents', color: '#8b5cf6' },
                                        { label: 'Assets & Snippets', color: '#a78bfa' },
                                    ].map((item) => (
                                        <div key={item.label} className="glass-card rounded-lg px-4 py-2.5 text-xs font-medium" style={{ color: item.color }}>
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <p className="mt-10 text-sm" style={{ color: '#55556a' }}>
                                One connection. All your context. Always up to date.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Product Screenshot */}
                <section id="product" className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
                    <div className="text-center">
                        <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">See it in action</h2>
                        <p className="animate-fade-in-up stagger-1 mt-5 text-base lg:text-lg" style={{ color: '#8888a0' }}>
                            A clean dashboard to manage all your AI context.
                        </p>
                    </div>

                    {/* Main screenshot placeholder */}
                    <div className="animate-fade-in-up stagger-2 mx-auto mt-12 max-w-5xl">
                        <div className="screenshot-placeholder flex aspect-video items-center justify-center rounded-2xl">
                            <div className="text-center">
                                <div className="mx-auto mb-3 size-12 rounded-xl" style={{ background: 'rgba(99, 102, 241, 0.15)' }} />
                                <p className="text-sm" style={{ color: '#55556a' }}>screenshot-dashboard.png</p>
                                <p className="mt-1 text-xs" style={{ color: '#333345' }}>Dashboard overview showing collections, stats, and getting started guide</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section id="how-it-works" className="relative mx-auto max-w-6xl px-6 py-20 lg:py-32">
                    <div className="absolute top-0 right-0 left-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.15), transparent)' }} />

                    <div className="mb-16 text-center lg:mb-20">
                        <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Three steps to get started</h2>
                    </div>

                    <div className="grid gap-16 lg:gap-24">
                        {/* Step 1 */}
                        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                            <div>
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex size-8 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>1</span>
                                    <h3 className="text-xl font-semibold lg:text-2xl">Define your AI identity</h3>
                                </div>
                                <p className="text-base leading-relaxed" style={{ color: '#9999b0' }}>
                                    Tell AI who you are, how you work, and what you expect. Your identity and instructions follow you across every project and every AI client.
                                </p>
                            </div>
                            <div className="screenshot-placeholder flex aspect-[4/3] items-center justify-center rounded-xl">
                                <div className="text-center">
                                    <p className="text-sm" style={{ color: '#55556a' }}>screenshot-identity.png</p>
                                    <p className="mt-1 text-xs" style={{ color: '#333345' }}>Workspace identity editor with markdown preview</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                            <div className="lg:order-2">
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex size-8 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>2</span>
                                    <h3 className="text-xl font-semibold lg:text-2xl">Organize by project</h3>
                                </div>
                                <p className="text-base leading-relaxed" style={{ color: '#9999b0' }}>
                                    Create collections for each project or client. Add documents, skills, snippets, and assets. Each collection gets its own set of instructions and its own MCP endpoint.
                                </p>
                            </div>
                            <div className="screenshot-placeholder flex aspect-[4/3] items-center justify-center rounded-xl lg:order-1">
                                <div className="text-center">
                                    <p className="text-sm" style={{ color: '#55556a' }}>screenshot-collection.png</p>
                                    <p className="mt-1 text-xs" style={{ color: '#333345' }}>Collection detail showing documents, content items, and MCP endpoint</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                            <div>
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="flex size-8 items-center justify-center rounded-full text-sm font-bold" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>3</span>
                                    <h3 className="text-xl font-semibold lg:text-2xl">Connect via MCP</h3>
                                </div>
                                <p className="text-base leading-relaxed" style={{ color: '#9999b0' }}>
                                    Generate a token, paste the MCP endpoint in your AI client, and start chatting. Your AI now knows who you are and what you're working on.
                                </p>
                                <div className="mt-6 overflow-hidden rounded-lg" style={{ background: 'rgba(17, 17, 24, 0.9)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                    <div className="px-4 py-2 text-xs" style={{ color: '#55556a', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>MCP Endpoint</div>
                                    <pre className="px-4 py-3 text-sm" style={{ color: '#6366f1', fontFamily: "'JetBrains Mono', monospace" }}>
                                        https://your-vault.com/mcp?token=cv_ws_...
                                    </pre>
                                </div>
                            </div>
                            <div className="screenshot-placeholder flex aspect-[4/3] items-center justify-center rounded-xl">
                                <div className="text-center">
                                    <p className="text-sm" style={{ color: '#55556a' }}>screenshot-claude-connected.png</p>
                                    <p className="mt-1 text-xs" style={{ color: '#333345' }}>Claude Desktop connected with context loaded</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What you can store */}
                <section className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
                    <div className="absolute top-0 right-0 left-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.15), transparent)' }} />

                    <div className="mb-16 text-center">
                        <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Everything your AI needs</h2>
                    </div>

                    <div className="grid gap-px overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4" style={{ background: 'rgba(255, 255, 255, 0.04)' }}>
                        {[
                            { title: 'Identity & Instructions', desc: 'Who you are, how you work, your preferences and constraints. Always loaded.', color: '#6366f1' },
                            { title: 'Documents', desc: 'Specs, guides, notes — reference material AI retrieves when it needs deeper context.', color: '#3b82f6' },
                            { title: 'Skills', desc: 'Operational instructions AI activates automatically. Code review, content writing, analysis.', color: '#8b5cf6' },
                            { title: 'Assets', desc: 'Images, videos, files organized in folders. AI gets direct URLs for instant access.', color: '#a78bfa' },
                        ].map((item) => (
                            <div key={item.title} className="p-8 lg:p-10" style={{ background: '#0a0a0f' }}>
                                <div className="mb-4 h-1 w-8 rounded-full" style={{ background: item.color }} />
                                <h3 className="mb-3 text-base font-semibold">{item.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: '#8888a0' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Who it's for */}
                <section className="relative mx-auto max-w-4xl px-6 py-20 lg:py-28">
                    <div className="absolute top-0 right-0 left-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.15), transparent)' }} />

                    <div className="mb-12 text-center">
                        <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Built for people who use AI daily</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            { role: 'Developers', desc: 'Stack, conventions, project context — your AI pair programmer actually knows your codebase.' },
                            { role: 'Marketers', desc: 'Brand voice, campaigns, guidelines — consistent AI outputs across every channel.' },
                            { role: 'Consultants', desc: 'Client briefs, processes, deliverables — switch between clients without losing context.' },
                            { role: 'Agencies', desc: 'Per-client context, team-wide skills — everyone gets the same AI quality.' },
                        ].map((item) => (
                            <div key={item.role} className="glass-card rounded-xl p-6">
                                <h3 className="mb-2 font-semibold">{item.role}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: '#8888a0' }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="relative py-20 lg:py-32">
                    <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%)' }} />
                    <div className="relative mx-auto max-w-3xl px-6 text-center">
                        <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            Stop repeating yourself to AI.<br />
                            <span className="gradient-text">Start building your vault.</span>
                        </h2>
                        <div className="animate-fade-in-up stagger-1 mt-10">
                            <Link href={route('register')} className="btn-primary-glow inline-flex items-center gap-2.5 rounded-xl px-10 py-4 text-base font-semibold text-white">
                                Get Started Free <ArrowRight className="size-4" />
                            </Link>
                        </div>
                        <p className="mt-6 text-sm" style={{ color: '#55556a' }}>
                            Self-hosted. Open source. Your data stays yours.
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
                        <div className="flex items-center gap-2.5 text-sm font-semibold">
                            <div className="flex size-6 items-center justify-center overflow-hidden rounded">
                                <img src="/logo.jpg" alt="Logo" className="size-6 object-cover" />
                            </div>
                            {appName}
                        </div>
                        <div className="flex items-center gap-6 text-sm" style={{ color: '#55556a' }}>
                            <Link href="/docs" className="transition-colors duration-200 hover:text-white">Docs</Link>
                            <Link href={route('login')} className="transition-colors duration-200 hover:text-white">Login</Link>
                            <Link href={route('register')} className="transition-colors duration-200 hover:text-white">Register</Link>
                        </div>
                        <p className="text-sm" style={{ color: '#55556a' }}>
                            &copy; {new Date().getFullYear()} {appName} — Built by{' '}
                            <a href="https://meltinbit.com" target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-white">MeltinBit</a>
                            {' '}| BSL 1.1 Licensed
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
