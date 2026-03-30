import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BreadcrumbItem } from '@/types';
import { ArrowRight, FolderOpen, FileText, Key } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Collections', href: '/collections' },
    { title: 'Create', href: '/collections/create' },
];

const colorPalette = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

export default function CollectionCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        type: 'custom',
        color: '#6366f1',
        is_active: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('collections.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Collection" />
            <div className="space-y-6 p-4">
                <Heading title="Create Collection" description="Create a new context package with its own MCP endpoint." />

                {/* Steps indicator */}
                <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <FolderOpen className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Step 1 — Define your collection</p>
                        <p className="text-xs text-muted-foreground">Name, type, and description</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Step 2 — Add content</p>
                        <p className="text-xs text-muted-foreground">Documents, skills, snippets</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground">
                        <Key className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Step 3 — Connect via MCP</p>
                        <p className="text-xs text-muted-foreground">Generate token and connect</p>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Type</Label>
                        <Select value={data.type} onValueChange={(v) => setData('type', v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
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
                        <InputError message={errors.type} />
                        <p className="text-xs text-muted-foreground">Each type pre-populates relevant documents. You can always add, rename, or remove documents later.</p>
                    </div>

                    <div className="grid gap-1.5">
                        <Label>Color</Label>
                        <div className="flex gap-1">
                            {colorPalette.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setData('color', color)}
                                    className={`h-7 w-7 rounded-full border-2 transition-transform ${data.color === color ? 'scale-110 border-foreground' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                        <InputError message={errors.color} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', !!checked)} />
                        <Label htmlFor="is_active" className="text-sm">
                            Active <span className="font-normal text-muted-foreground">— visible to AI via MCP when enabled</span>
                        </Label>
                    </div>

                    <Button disabled={processing} className="gap-2">
                        Create Collection <ArrowRight className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
