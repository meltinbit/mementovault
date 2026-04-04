import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { MarkdownEditor } from '@/components/markdown-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Code, Megaphone, Briefcase, Users, Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';

const templates = [
    {
        id: 'developer',
        name: 'Developer / Indie Hacker',
        description: 'Stack preferences, code conventions, project context',
        icon: Code,
    },
    {
        id: 'marketer',
        name: 'Marketer / Content Creator',
        description: 'Brand voice, campaigns, content guidelines',
        icon: Megaphone,
    },
    {
        id: 'consultant',
        name: 'Consultant / Freelancer',
        description: 'Client briefs, processes, deliverable templates',
        icon: Briefcase,
    },
    {
        id: 'agency',
        name: 'Agency',
        description: 'Per-client context, team-wide skills',
        icon: Users,
    },
    {
        id: 'custom',
        name: 'Custom (Blank)',
        description: 'Start from scratch with empty templates',
        icon: Sparkles,
    },
];

// Template identity previews
const templatePreviews: Record<string, string> = {
    developer:
        '# Identity\n\n## Who I Am\n[Your name, role (e.g., full-stack developer, CTO, indie hacker), years of experience, areas of specialization]\n\n## Tech Stack\n- **Languages:** [Your primary languages]\n- **Frameworks:** [Your frameworks and libraries]\n- **Tools:** [Your development tools, IDE, version control]\n- **Cloud/Infra:** [Your cloud providers, hosting, CI/CD]\n\n## Voice & Tone\n[How should AI communicate with you? Examples: direct and technical, explain like a colleague, use code examples, skip basics, be verbose, etc.]\n\n## Values\n[What principles guide your work? Examples: clean code, testing, documentation, shipping fast, simplicity, etc.]',
    marketer:
        '# Identity\n\n## Brand\n[Your brand name, what it does, and its personality (e.g., bold, friendly, authoritative)]\n\n## Target Audience\n[Who are you creating content for? Demographics, interests, pain points]\n\n## Voice & Tone\n[Your brand voice traits and how tone varies by channel — social, blog, email, ads]\n\n## Channels\n[Your primary and secondary marketing channels]',
    consultant:
        '# Identity\n\n## Expertise\n[Your areas of specialization and methodology/approach]\n\n## Positioning\n[What makes you unique? How do you differentiate in the market?]\n\n## Client Types\n[Types of clients you work with — industry, size, typical challenges]\n\n## Communication Style\n[How you communicate — with clients, in deliverables, preferred formats]',
    agency:
        '# Identity\n\n## Agency Brand\n[Your agency name, type (digital, creative, full-service), and mission]\n\n## Services\n[List of services you offer with brief descriptions]\n\n## Team Structure\n[Team size, departments, key roles]\n\n## Values\n[Core values that guide your agency]',
    custom: '# Identity\n\n## Who I Am\n[Describe yourself — your role, expertise, and what you do]\n\n## How I Communicate\n[How should AI talk to you?]\n\n## What Matters to Me\n[Your values, priorities, and what you care about in your work]',
};

interface Props {
    templates: string[];
    workspace: { id: number; name: string };
}

export default function Onboarding({ workspace }: Props) {
    const { name: appName } = usePage<SharedData>().props;
    const [step, setStep] = useState(1);
    const { data, setData, post, processing } = useForm({
        template: 'developer',
        identity_content: templatePreviews.developer,
    });

    const selectTemplate = (id: string) => {
        setData({
            template: id,
            identity_content: templatePreviews[id] || '',
        });
    };

    const submit = () => {
        post(route('onboarding.store'));
    };

    return (
        <>
            <Head title={`Welcome to ${appName}`} />
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="w-full max-w-2xl">
                    {/* Progress */}
                    <div className="mb-8 flex items-center justify-center gap-2">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-2 w-12 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`}
                            />
                        ))}
                    </div>

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold">Welcome to {appName}</h1>
                                <p className="mt-2 text-muted-foreground">
                                    Choose a template to get started with pre-filled content.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {templates.map((t) => (
                                    <Card
                                        key={t.id}
                                        className={`cursor-pointer transition-all ${data.template === t.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}
                                        onClick={() => selectTemplate(t.id)}
                                    >
                                        <CardContent className="flex items-start gap-3 p-4">
                                            <div
                                                className={`rounded-lg p-2 ${data.template === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                                            >
                                                <t.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{t.name}</p>
                                                <p className="text-sm text-muted-foreground">{t.description}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={() => setStep(2)} className="gap-2">
                                    Next <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold">Set up your identity</h1>
                                <p className="mt-2 text-muted-foreground">
                                    Tell AI who you are. You can always edit this later.
                                </p>
                            </div>
                            <MarkdownEditor
                                value={data.identity_content}
                                onChange={(v) => setData('identity_content', v)}
                                minRows={12}
                            />
                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                                    <ArrowLeft className="h-4 w-4" /> Back
                                </Button>
                                <Button onClick={() => setStep(3)} className="gap-2">
                                    Next <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Check className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">You're all set!</h1>
                                <p className="mt-2 text-muted-foreground">
                                    Your nucleus &quot;{workspace.name}&quot; is ready. Here's what to do next:
                                </p>
                            </div>
                            <div className="mx-auto max-w-sm space-y-3 text-left">
                                <div className="rounded-md border p-3 text-sm">
                                    <span className="font-medium">1.</span> Complete your Instructions in the
                                    Nucleus section
                                </div>
                                <div className="rounded-md border p-3 text-sm">
                                    <span className="font-medium">2.</span> Configure S3/R2 storage in Settings to
                                    upload assets
                                </div>
                                <div className="rounded-md border p-3 text-sm">
                                    <span className="font-medium">3.</span> Create your first Neuron to organize
                                    content by project
                                </div>
                                <div className="rounded-md border p-3 text-sm">
                                    <span className="font-medium">4.</span> Generate a nucleus token in Settings and
                                    connect via MCP
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                                    <ArrowLeft className="h-4 w-4" /> Back
                                </Button>
                                <Button onClick={submit} disabled={processing} className="gap-2">
                                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
