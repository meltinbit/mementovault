import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpen, Check, CheckCircle, Copy, Loader2, MessageSquare } from 'lucide-react';
import { getHomepagePrompts } from '@/data/vault-prompts';
import { type FormEventHandler, useState } from 'react';

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex-shrink-0 cursor-pointer rounded p-1 transition-colors hover:bg-white/10"
            title="Copy"
        >
            {copied ? <Check className="size-3.5" style={{ color: '#28c840' }} /> : <Copy className="size-3.5" style={{ color: '#55556a' }} />}
        </button>
    );
}

export default function Welcome() {
    const { auth, name: appName, registrationEnabled, trialEnabled } = usePage<SharedData & { trialEnabled: boolean }>().props;

    return (
        <>
            <Head title={`${appName} — AI brain, centralized`}>
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
                    .gradient-text-galaxy {
                        background: linear-gradient(135deg, #a855f7, #7c3aed, #0d9488, #166534);
                        background-size: 200% auto;
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        background-clip: text;
                        animation: gradient-shift 6s ease infinite;
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
                {/* Hero */}
                <section className="relative overflow-hidden">
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

                    <div className="relative mx-auto max-w-4xl px-6 pt-24 pb-24 text-center lg:pt-36 lg:pb-36">
                        <div className="animate-fade-in-up flex flex-col items-center">
                            <div className="flex size-20 items-center justify-center lg:size-24">
                                <img src="/logo.png" alt="Logo" className="size-20 object-contain lg:size-24" />
                            </div>
                            <h1 className="gradient-text-galaxy mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{appName}</h1>
                            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.25em] sm:text-base" style={{ color: '#8888a0' }}>
                                AI brain, centralized.
                            </p>
                        </div>
                        {/* Flow diagram inline */}
                        <div className="animate-fade-in-up stagger-1 mx-auto mt-14 max-w-4xl">
                            <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center md:gap-6">
                                <div className="flex gap-3 md:flex-col md:gap-3">
                                    {['Claude.ai / Claude Desktop', 'Claude Code', 'Any MCP client'].map((client) => (
                                        <div key={client} className="glass-card rounded-lg px-4 py-2.5 text-xs font-medium" style={{ color: '#a1a1aa' }}>{client}</div>
                                    ))}
                                </div>
                                <div className="flex items-center">
                                    <div className="hidden h-px w-10 md:block" style={{ background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.6))' }} />
                                    <div className="h-8 w-px md:hidden" style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.3), rgba(99, 102, 241, 0.6))' }} />
                                </div>
                                <div className="relative flex flex-col items-center rounded-xl border border-indigo-500/30 px-8 py-5" style={{ background: 'rgba(99, 102, 241, 0.08)', boxShadow: '0 0 40px rgba(99, 102, 241, 0.1)' }}>
                                    <img src="/brain.png" alt="Brain" className="mb-2 size-10" />
                                    <div className="text-sm font-bold" style={{ color: '#6366f1' }}>{appName}</div>
                                    <div className="mt-0.5 text-xs" style={{ color: '#8888a0' }}>MCP Server</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="hidden h-px w-10 md:block" style={{ background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.6), rgba(99, 102, 241, 0.3))' }} />
                                    <div className="h-8 w-px md:hidden" style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.6), rgba(99, 102, 241, 0.3))' }} />
                                </div>
                                <div className="flex gap-4 md:flex-col md:gap-4">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#55556a' }}>Nucleus</p>
                                        <div className="glass-card rounded-lg px-4 py-2 text-xs font-medium" style={{ color: '#6366f1' }}>Identity & Instructions</div>
                                        <div className="glass-card rounded-lg px-4 py-2 text-xs font-medium" style={{ color: '#6366f1' }}>Memory</div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#55556a' }}>Content</p>
                                        <div className="glass-card rounded-lg px-4 py-2 text-xs font-medium" style={{ color: '#8b5cf6' }}>Documents & Skills</div>
                                        <div className="glass-card rounded-lg px-4 py-2 text-xs font-medium" style={{ color: '#8b5cf6' }}>Snippets & Assets</div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#55556a' }}>Organization</p>
                                        <div className="glass-card rounded-lg px-4 py-2 text-xs font-medium" style={{ color: '#a78bfa' }}>Neurons</div>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-8 text-sm leading-relaxed sm:text-base" style={{ color: '#8888a0', fontWeight: 300 }}>
                                Your AI context is scattered across local files and chat histories.{' '}
                                <span className="font-semibold text-white">Every new conversation starts from zero.</span>
                            </p>
                        </div>

                        {/* Quick Start */}
                        <div className="animate-fade-in-up stagger-2 mx-auto mt-14 max-w-xl">
                            <p className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: '#a855f7' }}>
                                <ArrowRight className="size-4" /> Quick Start
                            </p>
                            <div className="overflow-hidden rounded-xl" style={{ background: 'rgba(17, 17, 24, 0.9)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                    <div className="size-3 rounded-full" style={{ background: '#ff5f57' }} />
                                    <div className="size-3 rounded-full" style={{ background: '#febc2e' }} />
                                    <div className="size-3 rounded-full" style={{ background: '#28c840' }} />
                                </div>
                                <div className="space-y-3 px-5 py-4 text-left text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                    <div>
                                        <span style={{ color: '#55556a' }}># Clone & start</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span style={{ color: '#28c840' }}>$</span>{' '}
                                            <span style={{ color: '#e2e2e8' }}>git clone https://github.com/meltinbit/mementovault.git</span>
                                        </div>
                                        <CopyButton text="git clone https://github.com/meltinbit/mementovault.git" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span style={{ color: '#28c840' }}>$</span>{' '}
                                            <span style={{ color: '#e2e2e8' }}>cd mementovault && docker compose up -d</span>
                                        </div>
                                        <CopyButton text="cd mementovault && docker compose up -d" />
                                    </div>
                                    <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                        <span style={{ color: '#55556a' }}># Open http://localhost:4242</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#55556a' }}>Login:</span>{' '}
                                        <span style={{ color: '#a855f7' }}>mementovault@example.com</span>{' '}
                                        <span style={{ color: '#55556a' }}>/</span>{' '}
                                        <span style={{ color: '#a855f7' }}>password</span>
                                    </div>
                                    <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                        <span style={{ color: '#55556a' }}># Create a nucleus API key in Settings → API Keys</span>
                                    </div>
                                    <div className="mt-3">
                                        <span style={{ color: '#55556a' }}># Connect with Claude Code:</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span style={{ color: '#28c840' }}>$</span>{' '}
                                            <span style={{ color: '#e2e2e8' }}>claude mcp add --transport http memento-vault \</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span style={{ color: '#e2e2e8' }}>{'  '}http://localhost:4242/mcp?token=YOUR_TOKEN</span>
                                        </div>
                                        <CopyButton text="claude mcp add --transport http memento-vault http://localhost:4242/mcp?token=YOUR_TOKEN" />
                                    </div>
                                    <div className="mt-3">
                                        <span style={{ color: '#55556a' }}># For Claude Desktop use a tunnel (e.g. ngrok):</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span style={{ color: '#28c840' }}>$</span>{' '}
                                            <span style={{ color: '#e2e2e8' }}>ngrok http 4242</span>
                                        </div>
                                        <CopyButton text="ngrok http 4242" />
                                    </div>
                                    <div>
                                        <span style={{ color: '#55556a' }}># Then add https://your-tunnel.ngrok.io/mcp?token=YOUR_TOKEN</span>
                                    </div>
                                    <div>
                                        <span style={{ color: '#55556a' }}># in Customize → Connectors → Add custom connector</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="animate-fade-in-up stagger-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {registrationEnabled && (
                                <Link href={route('register')} className="btn-primary-glow inline-flex items-center gap-2.5 rounded-xl px-8 py-3.5 text-base font-semibold text-white">
                                    Get Started Free <ArrowRight className="size-4" />
                                </Link>
                            )}
                            <Link href="/docs" className="btn-glass inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium" style={{ color: '#8888a0' }}>
                                <BookOpen className="size-3.5" /> Docs
                            </Link>
                            <a href="https://github.com/meltinbit/mementovault" target="_blank" rel="noopener noreferrer" className="btn-glass inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium" style={{ color: '#8888a0' }}>
                                <svg className="size-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                                GitHub
                            </a>
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

                {/* How it's structured */}
                <section className="relative mx-auto max-w-5xl px-6 py-20 lg:py-28">
                    <div className="absolute top-0 right-0 left-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent)' }} />

                    <div className="mb-14 text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">How your vault is structured</h2>
                    </div>

                    {/* Top row: Workspace + Content */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Workspace */}
                        <div className="glass-card rounded-2xl p-8">
                            <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: '#6366f1' }}>Nucleus</p>
                            <p className="text-base" style={{ color: '#55556a' }}>Your global AI persona — always included</p>
                            <ul className="mt-5 space-y-3 text-base" style={{ color: '#8888a0' }}>
                                <li><span className="text-white font-medium">Identity</span> — who you are</li>
                                <li><span className="text-white font-medium">Instructions</span> — how AI should work</li>
                                <li><span className="text-white font-medium">Memory</span> — what to remember</li>
                            </ul>
                        </div>

                        {/* Content */}
                        <div className="glass-card rounded-2xl p-8">
                            <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: '#8b5cf6' }}>Content</p>
                            <p className="text-base" style={{ color: '#55556a' }}>Your knowledge base — assign to neurons</p>
                            <ul className="mt-5 space-y-3 text-base" style={{ color: '#8888a0' }}>
                                <li><span className="text-white font-medium">Documents</span> — specs, guides, notes</li>
                                <li><span className="text-white font-medium">Skills</span> — operational instructions</li>
                                <li><span className="text-white font-medium">Snippets</span> — reusable text blocks</li>
                                <li><span className="text-white font-medium">Assets</span> — images, videos, files</li>
                            </ul>
                        </div>
                    </div>

                    {/* Arrows down — differentiated */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="flex flex-col items-center py-4">
                            <div className="h-8 w-px" style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.5), rgba(99, 102, 241, 0.15))' }} />
                            <p className="text-xs" style={{ color: '#6366f1' }}>always inherited <span style={{ color: '#55556a' }}>(Nucleus)</span></p>
                        </div>
                        <div className="flex flex-col items-center py-4">
                            <div className="h-8 w-px" style={{ background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.5), rgba(139, 92, 246, 0.15))' }} />
                            <p className="text-xs" style={{ color: '#8b5cf6' }}>you choose what to assign <span style={{ color: '#55556a' }}>(Content)</span></p>
                        </div>
                    </div>

                    {/* Bottom: Organization */}
                    <div className="glass-card mx-auto max-w-2xl rounded-2xl border-indigo-500/20 p-8" style={{ background: 'rgba(99, 102, 241, 0.04)' }}>
                        <p className="mb-2 text-sm font-semibold uppercase tracking-widest" style={{ color: '#a78bfa' }}>Organization</p>
                        <p className="text-base" style={{ color: '#55556a' }}>Create neurons to organize context by project. Connect via a single nucleus token or per-neuron tokens.</p>
                        <ul className="mt-5 space-y-3 text-base" style={{ color: '#8888a0' }}>
                            <li><span style={{ color: '#6366f1' }}>+</span> Nucleus identity & instructions <span className="text-sm" style={{ color: '#55556a' }}>(automatic)</span></li>
                            <li><span style={{ color: '#8b5cf6' }}>+</span> Content you assign <span className="text-sm" style={{ color: '#55556a' }}>(you pick which docs, skills, assets)</span></li>
                            <li><span style={{ color: '#a78bfa' }}>+</span> <span className="text-white font-medium">Own documents</span> — project-specific instructions, architecture, etc.</li>
                            <li><span style={{ color: '#a78bfa' }}>+</span> <span className="text-white font-medium">Own memory</span> — project-specific memory</li>
                        </ul>
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

                    {/* Main screenshot */}
                    <div className="animate-fade-in-up stagger-2 mx-auto mt-12 max-w-5xl">
                        <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)' }}>
                            <img src="/screenshots/dashboard.png" alt="Memento Vault dashboard showing getting started checklist, stats, and recent activity" className="w-full" />
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section id="how-it-works" className="relative mx-auto max-w-6xl overflow-hidden px-6 py-20 lg:py-32">
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
                            <div className="overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}>
                                <img src="/screenshots/identity.png" alt="Nucleus identity editor with markdown preview" className="w-full max-w-full" />
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
                                    Create neurons for each project or client. Add documents, skills, snippets, and assets. Each neuron gets its own set of instructions and its own MCP endpoint.
                                </p>
                            </div>
                            <div className="overflow-hidden rounded-xl lg:order-1" style={{ border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}>
                                <img src="/screenshots/collection.png" alt="Neuron detail showing documents, content items, and MCP endpoint" className="w-full max-w-full" />
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
                                    <pre className="overflow-x-auto px-4 py-3 text-sm" style={{ color: '#6366f1', fontFamily: "'JetBrains Mono', monospace" }}>https://your-vault.com/mcp?token=cv_ws_...</pre>
                                </div>
                            </div>
                            <div className="overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}>
                                <img src="/screenshots/claude-connected.png" alt="Claude Desktop connected with context loaded" className="w-full max-w-full" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* What you can ask */}
                <section className="relative mx-auto max-w-5xl px-6 py-20 lg:py-28">
                    <div className="absolute top-0 right-0 left-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.15), transparent)' }} />

                    <div className="mb-14 text-center">
                        <h2 className="animate-fade-in-up text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">What you can ask your vault</h2>
                        <p className="animate-fade-in-up stagger-1 mt-5 text-base lg:text-lg" style={{ color: '#8888a0' }}>
                            Just talk to your AI naturally. Here are some things you can say.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {getHomepagePrompts().map((p) => (
                            <div key={p.prompt} className="glass-card group relative rounded-xl p-5">
                                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#6366f1' }}>{p.category}</p>
                                <p className="mt-2 text-sm font-medium leading-relaxed text-white">"{p.prompt}"</p>
                                <p className="mt-1.5 text-xs" style={{ color: '#55556a' }}>{p.description}</p>
                                <div className="absolute top-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
                                    <CopyButton text={p.prompt} />
                                </div>
                            </div>
                        ))}
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
                        {registrationEnabled && (
                            <div className="animate-fade-in-up stagger-1 mt-10">
                                <Link href={route('register')} className="btn-primary-glow inline-flex items-center gap-2.5 rounded-xl px-10 py-4 text-base font-semibold text-white">
                                    Get Started Free <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        )}
                        <p className="mt-8 text-lg font-medium tracking-tight sm:text-xl" style={{ color: '#9999b0' }}>
                            Self-hosted. Open source. Your data stays yours.
                        </p>
                        {!registrationEnabled && trialEnabled && <TrialRequestForm />}
                    </div>
                </section>

                {/* Footer */}
                <footer className="relative" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
                        <div className="flex items-center gap-2.5 text-sm font-semibold">
                            <div className="flex size-6 items-center justify-center overflow-hidden rounded">
                                <img src="/logo2.png" alt="Logo" className="size-6 object-cover" />
                            </div>
                            {appName}
                        </div>
                        <div className="flex items-center gap-6 text-sm" style={{ color: '#55556a' }}>
                            <Link href="/docs" className="transition-colors duration-200 hover:text-white">Docs</Link>
                            <a href="https://github.com/meltinbit/mementovault" target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-white">GitHub</a>
                            {registrationEnabled && (
                                <>
                                    <Link href={route('login')} className="transition-colors duration-200 hover:text-white">Login</Link>
                                    <Link href={route('register')} className="transition-colors duration-200 hover:text-white">Register</Link>
                                </>
                            )}
                        </div>
                        <p className="text-sm" style={{ color: '#55556a' }}>
                            &copy; {new Date().getFullYear()} {appName} — Built by{' '}
                            <a href="https://meltinbit.com" target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-white">MeltinBit</a>
                            {' '}| AGPL-3.0 Licensed
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function TrialRequestForm() {
    const { data, setData, post, processing, errors, wasSuccessful, reset } = useForm({ email: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('trial-request.store'), { preserveScroll: true, onSuccess: () => reset() });
    };

    if (wasSuccessful) {
        return (
            <div className="animate-fade-in-up mt-8 flex items-center justify-center gap-2 text-sm" style={{ color: '#8b8ba0' }}>
                <CheckCircle className="size-4 text-green-400" />
                <span>Request sent! We'll be in touch soon.</span>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up mt-8">
            <p className="mb-4 text-sm" style={{ color: '#8b8ba0' }}>
                Don't want to self-host? Request a free test account.
            </p>
            <form onSubmit={submit} className="mx-auto flex max-w-md gap-2">
                <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                />
                <button
                    type="submit"
                    disabled={processing}
                    className="btn-primary-glow inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                    {processing ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                    Request Access
                </button>
            </form>
            {errors.email && <p className="mt-2 text-center text-xs text-red-400">{errors.email}</p>}
        </div>
    );
}
