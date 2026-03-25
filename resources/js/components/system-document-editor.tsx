import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import AppLayout from '@/layouts/app-layout';
import { MarkdownEditor } from '@/components/markdown-editor';
import { RevisionHistory } from '@/components/revision-history';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem, type SystemDocumentData, type SystemDocumentRevisionData } from '@/types';

interface SystemDocumentEditorProps {
    document: SystemDocumentData;
    revisions: SystemDocumentRevisionData[];
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
}

export function SystemDocumentEditor({ document, revisions, title, description, breadcrumbs }: SystemDocumentEditorProps) {
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
                <div className="flex items-start justify-between">
                    <div>
                        <Heading title={title} description={description} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">v{document.version}</Badge>
                        <RevisionHistory
                            revisions={revisions}
                            currentVersion={document.version}
                            onRestore={handleRestore}
                        />
                    </div>
                </div>

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
