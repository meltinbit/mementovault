import { FormEventHandler, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import AppLayout from '@/layouts/app-layout';
import { MarkdownEditor } from '@/components/markdown-editor';
import { RevisionHistory } from '@/components/revision-history';
import Heading from '@/components/heading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, X } from 'lucide-react';
import { type BreadcrumbItem, type SystemDocumentData, type SystemDocumentRevisionData } from '@/types';

interface SystemDocumentEditorProps {
    document: SystemDocumentData;
    revisions: SystemDocumentRevisionData[];
    title: string;
    description: string;
    guidance?: string;
    breadcrumbs: BreadcrumbItem[];
}

export function SystemDocumentEditor({ document, revisions, title, description, guidance, breadcrumbs }: SystemDocumentEditorProps) {
    const [showGuidance, setShowGuidance] = useState(true);
    const { data, setData, put, processing, recentlySuccessful } = useForm({
        content: document.content,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('workspace.update', { type: document.type }));
    };

    const handleRestore = (content: string) => {
        setData('content', content);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="space-y-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <Heading title={title} description={description} />
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="secondary">v{document.version}</Badge>
                        <RevisionHistory
                            revisions={revisions}
                            currentVersion={document.version}
                            onRestore={handleRestore}
                        />
                    </div>
                </div>

                {guidance && showGuidance && (
                    <Alert className="relative">
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>{guidance}</AlertDescription>
                        <button
                            type="button"
                            onClick={() => setShowGuidance(false)}
                            className="absolute right-2 top-2 rounded-sm p-1 opacity-70 hover:opacity-100"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Alert>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <MarkdownEditor
                        value={data.content}
                        onChange={(value) => setData('content', value)}
                    />

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Save</Button>
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Saved</p>
                        </Transition>
                        <span className="text-xs text-muted-foreground">
                            Last updated {document.updated_at}
                        </span>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
