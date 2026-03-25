import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
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
        '# Identity\n\n## Who I Am\n[Describe yourself, your role, and your expertise]\n\n## Tech Stack\n[List your primary languages, frameworks, and tools]\n\n## Voice & Tone\n[How should AI communicate with you? Technical, casual, direct?]\n\n## Values\n[What principles guide your work? Clean code, testing, documentation?]',
    marketer:
        '# Identity\n\n## Brand\n[Describe your brand or the brand you represent]\n\n## Target Audience\n[Who are you creating content for?]\n\n## Voice & Tone\n[Brand voice guidelines: formal, playful, authoritative?]\n\n## Channels\n[Primary marketing channels: social, email, blog, ads?]',
    consultant:
        '# Identity\n\n## Expertise\n[Your areas of specialization]\n\n## Positioning\n[How you differentiate yourself in the market]\n\n## Client Types\n[Types of clients you work with]\n\n## Communication Style\n[How you communicate with clients]',
    agency:
        "# Identity\n\n## Agency Brand\n[Your agency's brand identity and mission]\n\n## Services\n[Services you offer]\n\n## Team Structure\n[How your team is organized]\n\n## Values\n[Core values that guide your agency]",
    custom: '# Identity\n\n[Define who you are and how AI should understand you]',
};

interface Props {
    templates: string[];
    workspace: { id: number; name: string };
}

export default function Onboarding({ workspace }: Props) {
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
            <Head title="Welcome to Context Vault" />
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
                                <h1 className="text-2xl font-bold">Welcome to Context Vault</h1>
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
                                    Your workspace &quot;{workspace.name}&quot; is ready. Here's what to do next:
                                </p>
                            </div>
                            <div className="mx-auto max-w-sm space-y-3 text-left">
                                <div className="rounded-md border p-3 text-sm">
                                    <span className="font-medium">1.</span> Complete your Instructions and Context in
                                    the workspace section
                                </div>
                                <div className="rounded-md border p-3 text-sm">
                                    <span className="font-medium">2.</span> Create your first Collection to organize
                                    content by project
                                </div>
                                <div className="rounded-md border p-3 text-sm">
                                    <span className="font-medium">3.</span> Generate an API token and connect via MCP
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
