import { FormEventHandler, useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { MarkdownEditor } from '@/components/markdown-editor';
import { TokenManager } from '@/components/token-manager';
import { CollectionItemPicker } from '@/components/collection-item-picker';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
import { Copy, Check, Trash2 } from 'lucide-react';

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

const colorPalette = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

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
    const [showDelete, setShowDelete] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

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

    const detailsForm = useForm({
        name: collection.name,
        description: collection.description || '',
        type: collection.type,
        color: collection.color,
        is_active: collection.is_active,
    });

    const submitDetails: FormEventHandler = (e) => {
        e.preventDefault();
        detailsForm.put(route('collections.update', collection.id));
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
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                            {collection.type.replace('_', ' ')}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
                            {showDetails ? 'Hide Details' : 'Edit Details'}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)} className="gap-1">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {showDetails && (
                    <Card>
                        <CardContent className="p-4">
                            <form onSubmit={submitDetails} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={detailsForm.data.name} onChange={(e) => detailsForm.setData('name', e.target.value)} required />
                                        <InputError message={detailsForm.errors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Type</Label>
                                        <Select value={detailsForm.data.type} onValueChange={(v) => detailsForm.setData('type', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="software_project">Software Project</SelectItem>
                                                <SelectItem value="client_project">Client Project</SelectItem>
                                                <SelectItem value="product_saas">Product / SaaS</SelectItem>
                                                <SelectItem value="marketing">Marketing</SelectItem>
                                                <SelectItem value="custom">Custom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" value={detailsForm.data.description} onChange={(e) => detailsForm.setData('description', e.target.value)} rows={2} />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>Color</Label>
                                    <div className="flex gap-1">
                                        {colorPalette.map((color) => (
                                            <button key={color} type="button" onClick={() => detailsForm.setData('color', color)}
                                                className={`h-6 w-6 rounded-full border-2 transition-transform ${detailsForm.data.color === color ? 'scale-110 border-foreground' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }} />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox id="is_active" checked={detailsForm.data.is_active} onCheckedChange={(checked) => detailsForm.setData('is_active', !!checked)} />
                                    <Label htmlFor="is_active" className="text-sm">Active</Label>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button size="sm" disabled={detailsForm.processing}>Save Details</Button>
                                    <Transition show={detailsForm.recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                        <p className="text-sm text-neutral-600">Saved</p>
                                    </Transition>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

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

                <div className="grid gap-6 lg:grid-cols-[7fr_3fr]">
                    {/* Left column: System Document Overrides */}
                    <div className="space-y-6">
                        <HeadingSmall title="System Document Overrides" description="Collection-level overrides that append to your workspace system documents. Use these to add project-specific instructions, context, or memory that only apply to this collection." />
                        <SystemDocSection collectionId={collection.id} type="instructions" label="Instructions" existing={getSystemDoc('instructions')} />
                        <SystemDocSection collectionId={collection.id} type="context" label="Context" existing={getSystemDoc('context')} />
                        <SystemDocSection collectionId={collection.id} type="memory" label="Memory" existing={getSystemDoc('memory')} />
                    </div>

                    {/* Right column: Content picker */}
                    <div className="space-y-3">
                        <HeadingSmall title="Content" description="Manage what's included in this collection." />
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
            </div>

            <DeleteConfirmation
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={() => router.delete(route('collections.destroy', collection.id))}
                title={`Delete "${collection.name}"?`}
                description="This deletes the collection, system documents, and all API tokens. Content items (documents, skills, etc.) are NOT deleted."
            />
        </AppLayout>
    );
}
