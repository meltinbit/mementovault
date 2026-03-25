import { FormEventHandler, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { MarkdownEditor } from '@/components/markdown-editor';
import { TokenManager } from '@/components/token-manager';
import { CollectionItemPicker } from '@/components/collection-item-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    type BreadcrumbItem,
    type CollectionData,
    type CollectionSystemDocumentData,
    type ApiTokenData,
    type DocumentData,
    type SkillData,
    type SnippetData,
    type AssetData,
} from '@/types';
import { Copy, Check } from 'lucide-react';

interface AvailableItem {
    id: number;
    title?: string;
    name?: string;
    type?: string;
    mime_type?: string;
}

interface Props {
    collection: CollectionData;
    systemDocuments: CollectionSystemDocumentData[];
    tokens: ApiTokenData[];
    documents: DocumentData[];
    skills: SkillData[];
    snippets: SnippetData[];
    assets: AssetData[];
    availableDocuments: AvailableItem[];
    availableSkills: AvailableItem[];
    availableSnippets: AvailableItem[];
    availableAssets: AvailableItem[];
    mcpEndpoint: string;
    newToken?: string | null;
}

function SystemDocSection({
    collectionId,
    type,
    label,
    existing,
}: {
    collectionId: number;
    type: string;
    label: string;
    existing?: CollectionSystemDocumentData;
}) {
    const { data, setData, put, processing, recentlySuccessful } = useForm({
        content: existing?.content || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('collections.system-documents.update', [collectionId, type]));
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{label}</span>
                {existing && (
                    <Badge variant="secondary" className="text-xs">
                        v{existing.version}
                    </Badge>
                )}
            </div>
            <form onSubmit={submit} className="space-y-3">
                <MarkdownEditor value={data.content} onChange={(v) => setData('content', v)} minRows={8} placeholder={`Collection-level ${label.toLowerCase()} override...`} />
                <div className="flex items-center gap-4">
                    <Button size="sm" disabled={processing}>
                        Save {label}
                    </Button>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p className="text-sm text-neutral-600">Saved</p>
                    </Transition>
                </div>
            </form>
        </div>
    );
}

export default function CollectionShow({
    collection,
    systemDocuments,
    tokens,
    documents,
    skills,
    snippets,
    assets,
    availableDocuments,
    availableSkills,
    availableSnippets,
    availableAssets,
    mcpEndpoint,
    newToken,
}: Props) {
    const [copied, setCopied] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Collections', href: '/collections' },
        { title: collection.name, href: `/collections/${collection.id}` },
    ];

    const getSystemDoc = (type: string) => systemDocuments.find((d) => d.type === type);

    const copyEndpoint = () => {
        navigator.clipboard.writeText(mcpEndpoint);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={collection.name} />
            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: collection.color }} />
                        <Heading title={collection.name} description={collection.description || undefined} />
                    </div>
                    <Badge variant="outline" className="capitalize">
                        {collection.type.replace('_', ' ')}
                    </Badge>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">MCP Endpoint</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 rounded bg-muted px-3 py-2 font-mono text-sm">{mcpEndpoint}</code>
                            <Button variant="outline" size="sm" onClick={copyEndpoint}>
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">Connect via: {mcpEndpoint}?token=YOUR_TOKEN</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">API Tokens</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TokenManager tokens={tokens} collectionId={collection.id} mcpEndpoint={mcpEndpoint} newToken={newToken} />
                    </CardContent>
                </Card>

                <Separator />

                <div className="space-y-6">
                    <HeadingSmall title="System Document Overrides" description="Collection-level overrides that append to your workspace system documents. Use these to add project-specific instructions, context, or memory that only apply to this collection." />
                    <SystemDocSection collectionId={collection.id} type="instructions" label="Instructions" existing={getSystemDoc('instructions')} />
                    <SystemDocSection collectionId={collection.id} type="context" label="Context" existing={getSystemDoc('context')} />
                    <SystemDocSection collectionId={collection.id} type="memory" label="Memory" existing={getSystemDoc('memory')} />
                </div>

                <Separator />

                <div className="space-y-4">
                    <HeadingSmall title="Content" description="Documents, skills, snippets, and assets in this collection." />
                    <CollectionItemPicker
                        collectionId={collection.id}
                        documents={documents}
                        skills={skills}
                        snippets={snippets}
                        assets={assets}
                        availableDocuments={availableDocuments}
                        availableSkills={availableSkills}
                        availableSnippets={availableSnippets}
                        availableAssets={availableAssets}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
