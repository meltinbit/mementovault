import { type ApiTokenData, type BreadcrumbItem, type Workspace } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { WorkspaceTokenManager } from '@/components/workspace-token-manager';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Workspace settings', href: '/settings/workspace' },
];

interface StorageSettings {
    driver: string;
    key: string;
    secret: string;
    region: string;
    bucket: string;
    endpoint: string;
    url: string;
    use_path_style_endpoint: boolean;
}

interface Props {
    workspace: Workspace;
    workspaceTokens: ApiTokenData[];
    mcpEndpoint: string;
    newWorkspaceToken?: string | null;
    storageSettings: StorageSettings | null;
    mcpInstructions: string;
    mcpCustomPrompt: string;
    memoryMaxEntries: number;
    collectionMemoryMaxEntries: number;
}

const tabs = [
    { id: 'general', label: 'General' },
    { id: 'mcp', label: 'MCP Connection' },
    { id: 'storage', label: 'Asset Storage' },
    { id: 'ai', label: 'AI Behavior' },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function WorkspaceSettings({ workspace, workspaceTokens, mcpEndpoint, newWorkspaceToken, storageSettings, mcpInstructions, mcpCustomPrompt, memoryMaxEntries, collectionMemoryMaxEntries }: Props) {
    const initialTab = (new URLSearchParams(window.location.search).get('tab') as TabId) || 'general';
    const [activeTab, setActiveTab] = useState<TabId>(tabs.some(t => t.id === initialTab) ? initialTab : 'general');
    const [mcpInstructionsUnlocked, setMcpInstructionsUnlocked] = useState(false);

    const { data, setData, put, errors, processing, recentlySuccessful } = useForm({
        name: workspace.name,
        description: workspace.description || '',
        mcp_instructions: mcpInstructions || '',
        mcp_custom_prompt: mcpCustomPrompt || '',
        memory_max_entries: memoryMaxEntries || 50,
        collection_memory_max_entries: collectionMemoryMaxEntries || 20,
        storage_key: storageSettings?.key || '',
        storage_secret: storageSettings?.secret || '',
        storage_region: storageSettings?.region || 'auto',
        storage_bucket: storageSettings?.bucket || '',
        storage_endpoint: storageSettings?.endpoint || '',
        storage_url: storageSettings?.url || '',
        storage_use_path_style_endpoint: storageSettings?.use_path_style_endpoint ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('workspace.settings.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workspace settings" />

            <SettingsLayout>
                <form onSubmit={submit} className="space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── General ── */}
                    {activeTab === 'general' && (
                        <div className="space-y-4">
                            <HeadingSmall title="General" description="Your workspace name and description." />

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={2} placeholder="A brief description of your workspace" />
                                <InputError message={errors.description} />
                            </div>
                        </div>
                    )}

                    {/* ── MCP Connection ── */}
                    {activeTab === 'mcp' && (
                        <div className="space-y-4">
                            <HeadingSmall title="MCP Connection" description="Generate a workspace token to connect any AI client. One token gives access to all your collections." />

                            <WorkspaceTokenManager
                                tokens={workspaceTokens}
                                mcpEndpoint={mcpEndpoint}
                                newToken={newWorkspaceToken}
                            />
                        </div>
                    )}

                    {/* ── Asset Storage ── */}
                    {activeTab === 'storage' && (
                        <div className="space-y-4">
                            <HeadingSmall title="Asset Storage" description="S3-compatible storage for images, videos, and files." />

                            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                                We recommend <a href="https://developers.cloudflare.com/r2/" target="_blank" rel="noopener noreferrer" className="font-medium underline">Cloudflare R2</a> — S3-compatible with 10GB free storage. No egress fees.
                            </div>

                            <div className="space-y-4 rounded-md border p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="storage_key">Access Key ID</Label>
                                        <Input id="storage_key" value={data.storage_key} onChange={(e) => setData('storage_key', e.target.value)} placeholder="AKIAIOSFODNN7EXAMPLE" />
                                        <InputError message={errors.storage_key} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="storage_secret">Secret Access Key</Label>
                                        <Input id="storage_secret" type="password" value={data.storage_secret} onChange={(e) => setData('storage_secret', e.target.value)} placeholder="Enter secret key" />
                                        <InputError message={errors.storage_secret} />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="storage_bucket">Bucket</Label>
                                        <Input id="storage_bucket" value={data.storage_bucket} onChange={(e) => setData('storage_bucket', e.target.value)} placeholder="my-assets-bucket" />
                                        <InputError message={errors.storage_bucket} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="storage_region">Region</Label>
                                        <Input id="storage_region" value={data.storage_region} onChange={(e) => setData('storage_region', e.target.value)} placeholder="auto" />
                                        <InputError message={errors.storage_region} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="storage_endpoint">Endpoint</Label>
                                    <Input id="storage_endpoint" value={data.storage_endpoint} onChange={(e) => setData('storage_endpoint', e.target.value)} placeholder="https://account-id.r2.cloudflarestorage.com" />
                                    <p className="text-xs text-muted-foreground">Your S3 API endpoint. For R2: found in bucket overview.</p>
                                    <InputError message={errors.storage_endpoint} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="storage_url">Public URL <span className="text-destructive">*</span></Label>
                                    <Input id="storage_url" value={data.storage_url} onChange={(e) => setData('storage_url', e.target.value)} placeholder="https://pub-xxxx.r2.dev" required />
                                    <p className="text-xs text-muted-foreground">Required. Used by MCP to return direct asset URLs. For R2: found in bucket settings under "Public access".</p>
                                    <InputError message={errors.storage_url} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox id="storage_use_path_style" checked={data.storage_use_path_style_endpoint} onCheckedChange={(checked) => setData('storage_use_path_style_endpoint', !!checked)} />
                                    <Label htmlFor="storage_use_path_style" className="text-sm">Use path-style endpoint (required for R2)</Label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── AI Behavior ── */}
                    {activeTab === 'ai' && (
                        <div className="space-y-4">
                            <HeadingSmall title="AI Behavior" description="Fine-tune how AI agents interact with your workspace." />

                            <div className="grid gap-2">
                                <Label htmlFor="mcp_custom_prompt">Custom Prompt</Label>
                                <Textarea
                                    id="mcp_custom_prompt"
                                    value={data.mcp_custom_prompt}
                                    onChange={(e) => setData('mcp_custom_prompt', e.target.value)}
                                    rows={3}
                                    maxLength={2000}
                                    placeholder="e.g. Always respond in Italian. Be concise. Call me by name."
                                />
                                <div className="flex justify-between">
                                    <p className="text-xs text-muted-foreground">Additional instructions appended to every MCP connection.</p>
                                    <p className="text-xs text-muted-foreground">{data.mcp_custom_prompt.length}/2000</p>
                                </div>
                                <InputError message={errors.mcp_custom_prompt} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="memory_max_entries">Workspace memory limit</Label>
                                    <Input id="memory_max_entries" type="number" min={1} max={500} value={data.memory_max_entries} onChange={(e) => setData('memory_max_entries', parseInt(e.target.value) || 50)} className="w-24" />
                                    <InputError message={errors.memory_max_entries} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="collection_memory_max_entries">Collection memory limit</Label>
                                    <Input id="collection_memory_max_entries" type="number" min={1} max={200} value={data.collection_memory_max_entries} onChange={(e) => setData('collection_memory_max_entries', parseInt(e.target.value) || 20)} className="w-24" />
                                    <InputError message={errors.collection_memory_max_entries} />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Max memory entries included in AI context. Pinned entries are always included.</p>

                            {/* Advanced: MCP Instructions */}
                            <div className="rounded-md border p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">MCP System Instructions</p>
                                        <p className="text-xs text-muted-foreground">Core instructions that control how AI loads context. Don't edit unless you know what you're doing.</p>
                                    </div>
                                    {!mcpInstructionsUnlocked && (
                                        <Button type="button" variant="outline" size="sm" onClick={() => setMcpInstructionsUnlocked(true)}>
                                            Unlock
                                        </Button>
                                    )}
                                </div>

                                {mcpInstructionsUnlocked && (
                                    <div className="mt-4 grid gap-2">
                                        <Textarea
                                            id="mcp_instructions"
                                            value={data.mcp_instructions}
                                            onChange={(e) => setData('mcp_instructions', e.target.value)}
                                            rows={8}
                                            maxLength={5000}
                                            className="font-mono text-sm"
                                        />
                                        <div className="flex justify-end">
                                            <p className="text-xs text-muted-foreground">{data.mcp_instructions.length}/5000</p>
                                        </div>
                                        <InputError message={errors.mcp_instructions} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Save — always visible */}
                    <div className="flex items-center gap-4 border-t pt-4">
                        <Button disabled={processing}>Save Settings</Button>
                        <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                            <p className="text-sm text-neutral-600">Saved.</p>
                        </Transition>
                    </div>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
