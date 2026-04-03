import { FormEventHandler, useState } from 'react';
import { Deferred, Head, Link, useForm, router } from '@inertiajs/react';
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
    type CollectionDocumentData,
    type CollectionDocumentTemplateData,
    type MemoryEntryData,
    type ApiTokenData,
    type DocumentData,
    type SkillData,
    type SnippetData,
    type AssetData,
} from '@/types';
import { ChevronDown, ChevronRight, Copy, Check, Database, Lock, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { type VaultPrompt, getCollectionPrompts } from '@/data/vault-prompts';

interface AvailableItem {
    id: number;
    title?: string;
    name?: string;
    type?: string;
    mime_type?: string;
}

interface Props {
    collection: CollectionData;
    collectionDocuments: CollectionDocumentData[];
    tokens: ApiTokenData[];
    mcpEndpoint: string;
    newToken?: string | null;
    // Deferred props — undefined until loaded
    documentTemplates?: CollectionDocumentTemplateData[];
    documents?: DocumentData[];
    skills?: SkillData[];
    snippets?: SnippetData[];
    assets?: AssetData[];
    availableDocuments?: AvailableItem[];
    availableSkills?: AvailableItem[];
    availableSnippets?: AvailableItem[];
    availableAssets?: AvailableItem[];
    assetFolders?: { id: number; name: string; assets_count: number }[];
    memoryEntries?: MemoryEntryData[];
}

function PromptRow({ prompt }: { prompt: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <div className="flex items-center justify-between gap-2 rounded bg-muted px-2.5 py-1.5">
            <p className="truncate text-xs">{prompt}</p>
            <button
                onClick={() => { navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex-shrink-0 cursor-pointer rounded p-0.5 transition-colors hover:bg-accent"
            >
                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
            </button>
        </div>
    );
}

function CollectionDocSection({ collectionId, doc }: { collectionId: number; doc: CollectionDocumentData }) {
    const [expanded, setExpanded] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const { data, setData, put, processing, recentlySuccessful } = useForm({
        name: doc.name,
        content: doc.content,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('collections.docs.update', [collectionId, doc.id]), { preserveScroll: true });
    };

    return (
        <div className="rounded-md border">
            <div className="flex items-center gap-2 px-3 py-2">
                <button type="button" onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 flex-1 text-left">
                    {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium">{doc.name}</span>
                    {doc.is_required && <Lock className="h-3 w-3 text-muted-foreground" />}
                </button>
                <Badge variant="secondary" className="text-xs">v{doc.version}</Badge>
                {!doc.is_required && (
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeleteConfirm(true)}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {expanded && (
                <form onSubmit={submit} className="space-y-3 border-t px-3 py-3">
                    <div className="grid gap-2">
                        <Label>Name</Label>
                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} className="h-8" />
                    </div>
                    <MarkdownEditor value={data.content} onChange={(v) => setData('content', v)} minRows={8} placeholder={`Write ${doc.name.toLowerCase()} content...`} />
                    <div className="flex items-center gap-4">
                        <Button size="sm" disabled={processing}>Save</Button>
                        <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                            <p className="text-sm text-neutral-600">Saved</p>
                        </Transition>
                    </div>
                </form>
            )}

            <DeleteConfirmation
                open={deleteConfirm}
                onClose={() => setDeleteConfirm(false)}
                onConfirm={() => {
                    router.delete(route('collections.docs.destroy', [collectionId, doc.id]), {
                        onSuccess: () => setDeleteConfirm(false),
                        preserveScroll: true,
                    });
                }}
                title={`Delete "${doc.name}"?`}
                description="This will permanently delete this document and its revision history."
            />
        </div>
    );
}

const colorPalette = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

export default function CollectionShow({
    collection,
    collectionDocuments,
    documentTemplates,
    tokens,
    documents,
    skills,
    snippets,
    assets,
    availableDocuments,
    availableSkills,
    availableSnippets,
    availableAssets,
    assetFolders,
    memoryEntries,
    mcpEndpoint,
    newToken,
}: Props) {
    const [copied, setCopied] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [showAddDoc, setShowAddDoc] = useState(false);

    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const addDocForm = useForm({ name: '', content: '' });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Collections', href: '/collections' },
        { title: collection.name, href: `/collections/${collection.id}` },
    ];

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

    const handleTemplateChange = (value: string) => {
        setSelectedTemplateId(value);
        if (value === 'blank') {
            addDocForm.setData({ name: '', content: '' });
            return;
        }
        const template = (documentTemplates ?? []).find((t) => String(t.id) === value);
        if (template) {
            addDocForm.setData({ name: template.name, content: template.placeholder });
        }
    };

    const handleAddDoc: FormEventHandler = (e) => {
        e.preventDefault();
        addDocForm.post(route('collections.docs.store', collection.id), {
            onSuccess: () => {
                addDocForm.reset();
                setSelectedTemplateId('');
                setShowAddDoc(false);
            },
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={collection.name} />
            <div className="space-y-6 p-4">
                <div className="mb-8 space-y-1.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: collection.color }} />
                            <h2 className="text-xl font-semibold tracking-tight">{collection.name}</h2>
                            <Badge variant="outline" className="capitalize">
                                {collection.type.replace(/_/g, ' ')}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
                                {showDetails ? 'Hide Details' : 'Edit Details'}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)} className="gap-1">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    {collection.description && (
                        <div className="text-muted-foreground max-w-2xl text-sm leading-relaxed">{collection.description}</div>
                    )}
                </div>

                {showDetails && (
                    <Card>
                        <CardContent className="p-4">
                            <form onSubmit={submitDetails} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={detailsForm.data.name} onChange={(e) => detailsForm.setData('name', e.target.value)} />
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
                                                <SelectItem value="sales_agent">Sales Agent</SelectItem>
                                                <SelectItem value="social_manager">Social Manager</SelectItem>
                                                <SelectItem value="strategy_brainstorm">Strategy & Brainstorm</SelectItem>
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
                                    <Label htmlFor="is_active" className="text-sm">Active <span className="font-normal text-muted-foreground">— visible to AI via MCP</span></Label>
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

                <div className="grid gap-6 lg:grid-cols-[6fr_4fr]">
                    {/* Left column: Collection Documents */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <HeadingSmall title="Collection Documents" description="These documents define how AI operates in this collection. They are always included in MCP context." />
                            <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowAddDoc(!showAddDoc)}>
                                <Plus className="h-4 w-4" />
                                Add Document
                            </Button>
                        </div>

                        {showAddDoc && (
                            <form onSubmit={handleAddDoc} className="space-y-3 rounded-md border p-4">
                                <div className="grid gap-2">
                                    <Label>Template</Label>
                                    <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a template or start blank..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="blank">Blank Document</SelectItem>
                                            {(documentTemplates ?? []).map((t) => (
                                                <SelectItem key={t.id} value={String(t.id)}>
                                                    {t.name}
                                                    {t.description && <span className="text-muted-foreground"> — {t.description}</span>}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Document Name</Label>
                                    <Input
                                        value={addDocForm.data.name}
                                        onChange={(e) => addDocForm.setData('name', e.target.value)}
                                        placeholder="e.g. Brand Voice, Architecture, Sales Playbook"
                                        autoFocus
                                    />
                                    <InputError message={addDocForm.errors.name} />
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" type="submit" disabled={addDocForm.processing}>Create</Button>
                                    <Button size="sm" type="button" variant="ghost" onClick={() => { setShowAddDoc(false); setSelectedTemplateId(''); addDocForm.reset(); }}>Cancel</Button>
                                </div>
                            </form>
                        )}

                        {collectionDocuments.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No documents yet. Add one to get started.</p>
                        ) : (
                            <div className="space-y-2">
                                {collectionDocuments.map((doc) => (
                                    <CollectionDocSection key={doc.id} collectionId={collection.id} doc={doc} />
                                ))}
                            </div>
                        )}

                        <Separator />

                        <Deferred data="memoryEntries" fallback={<div className="animate-pulse h-16 rounded-md bg-muted" />}>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Database className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Memory</span>
                                        <Badge variant="secondary" className="text-xs">{(memoryEntries ?? []).length}</Badge>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={route('collections.memory.index', collection.id)}>
                                            Manage Memory
                                        </Link>
                                    </Button>
                                </div>

                                {(memoryEntries ?? []).length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No memory entries yet.</p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {(memoryEntries ?? []).map((entry) => (
                                            <div key={entry.id} className="flex items-start gap-2 rounded border px-3 py-2 text-sm">
                                                {entry.is_pinned && <span className="shrink-0">📌</span>}
                                                <span className="flex-1">{entry.content}</span>
                                                {entry.category && (
                                                    <Badge variant="secondary" className="shrink-0 text-xs">{entry.category}</Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Deferred>
                    </div>

                    {/* Right column: Content + MCP + Tokens */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <HeadingSmall title="Content" description="Manage what's included in this collection." />
                            <Deferred data={['documents', 'skills', 'snippets', 'assets']} fallback={
                                <div className="space-y-2">
                                    {[1, 2, 3, 4].map((i) => <div key={i} className="animate-pulse h-12 rounded-md bg-muted" />)}
                                </div>
                            }>
                                <CollectionItemPicker
                                    collectionId={collection.id}
                                    documents={documents ?? []}
                                    skills={skills ?? []}
                                    snippets={snippets ?? []}
                                    assets={assets ?? []}
                                    availableDocuments={availableDocuments ?? []}
                                    availableSkills={availableSkills ?? []}
                                    availableSnippets={availableSnippets ?? []}
                                    availableAssets={availableAssets ?? []}
                                    assetFolders={assetFolders}
                                />
                            </Deferred>
                        </div>

                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm">MCP Endpoint</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 truncate rounded bg-muted px-2.5 py-1.5 font-mono text-xs">{mcpEndpoint}</code>
                                    <Button variant="outline" size="sm" onClick={copyEndpoint} className="h-7 w-7 shrink-0 p-0">
                                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                    </Button>
                                </div>
                                <p className="mt-1.5 text-xs text-muted-foreground">Add ?token=YOUR_TOKEN to connect</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm">API Tokens</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <TokenManager tokens={tokens} collectionId={collection.id} mcpEndpoint={mcpEndpoint} newToken={newToken} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <MessageSquare className="h-4 w-4" /> What you can ask your AI
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">Copy and paste into your connected AI client</p>
                            </CardHeader>
                            <CardContent className="space-y-3 p-4 pt-0">
                                {Object.entries(
                                    getCollectionPrompts().reduce(
                                        (acc, p) => { (acc[p.category] ??= []).push(p); return acc; },
                                        {} as Record<string, VaultPrompt[]>,
                                    ),
                                ).map(([category, prompts]) => (
                                    <div key={category}>
                                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{category}</p>
                                        <div className="space-y-1">
                                            {prompts.map((p) => (
                                                <PromptRow key={p.prompt} prompt={p.prompt} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <DeleteConfirmation
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={() => router.delete(route('collections.destroy', collection.id))}
                title={`Delete "${collection.name}"?`}
                description="This deletes the collection, its documents, and all API tokens. Content items (documents, skills, etc.) are NOT deleted."
            />
        </AppLayout>
    );
}
