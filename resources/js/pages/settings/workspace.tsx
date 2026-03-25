import { type BreadcrumbItem, type Workspace } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Workspace settings',
        href: '/settings/workspace',
    },
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
    storageSettings: StorageSettings | null;
}

export default function WorkspaceSettings({ workspace, storageSettings }: Props) {
    const { data, setData, put, errors, processing, recentlySuccessful } = useForm({
        name: workspace.name,
        description: workspace.description || '',
        storage_driver: storageSettings?.driver || 'local',
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

    const isS3 = data.storage_driver === 's3';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Workspace settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Workspace" description="Manage your workspace name and description." />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                placeholder="A brief description of your workspace"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <Separator />

                        <HeadingSmall title="Asset Storage" description="Configure where your assets are stored. Use S3-compatible storage (AWS S3, Cloudflare R2) for production." />

                        <div className="grid gap-2">
                            <Label>Storage Driver</Label>
                            <Select value={data.storage_driver} onValueChange={(v) => setData('storage_driver', v)}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="local">Local (default)</SelectItem>
                                    <SelectItem value="s3">S3 / R2</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {isS3 && (
                            <div className="space-y-4 rounded-md border p-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="storage_key">Access Key ID</Label>
                                        <Input
                                            id="storage_key"
                                            value={data.storage_key}
                                            onChange={(e) => setData('storage_key', e.target.value)}
                                            placeholder="AKIAIOSFODNN7EXAMPLE"
                                        />
                                        <InputError message={errors.storage_key} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="storage_secret">Secret Access Key</Label>
                                        <Input
                                            id="storage_secret"
                                            type="password"
                                            value={data.storage_secret}
                                            onChange={(e) => setData('storage_secret', e.target.value)}
                                            placeholder="Enter secret key"
                                        />
                                        <InputError message={errors.storage_secret} />
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="storage_bucket">Bucket</Label>
                                        <Input
                                            id="storage_bucket"
                                            value={data.storage_bucket}
                                            onChange={(e) => setData('storage_bucket', e.target.value)}
                                            placeholder="my-assets-bucket"
                                        />
                                        <InputError message={errors.storage_bucket} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="storage_region">Region</Label>
                                        <Input
                                            id="storage_region"
                                            value={data.storage_region}
                                            onChange={(e) => setData('storage_region', e.target.value)}
                                            placeholder="auto"
                                        />
                                        <InputError message={errors.storage_region} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="storage_endpoint">Endpoint</Label>
                                    <Input
                                        id="storage_endpoint"
                                        value={data.storage_endpoint}
                                        onChange={(e) => setData('storage_endpoint', e.target.value)}
                                        placeholder="https://account-id.r2.cloudflarestorage.com"
                                    />
                                    <p className="text-xs text-muted-foreground">Required for Cloudflare R2 and other S3-compatible services.</p>
                                    <InputError message={errors.storage_endpoint} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="storage_url">Public URL (optional)</Label>
                                    <Input
                                        id="storage_url"
                                        value={data.storage_url}
                                        onChange={(e) => setData('storage_url', e.target.value)}
                                        placeholder="https://assets.yourdomain.com"
                                    />
                                    <p className="text-xs text-muted-foreground">Custom domain for public asset access.</p>
                                    <InputError message={errors.storage_url} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="storage_use_path_style"
                                        checked={data.storage_use_path_style_endpoint}
                                        onCheckedChange={(checked) => setData('storage_use_path_style_endpoint', !!checked)}
                                    />
                                    <Label htmlFor="storage_use_path_style" className="text-sm">
                                        Use path-style endpoint (required for R2)
                                    </Label>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved.</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
