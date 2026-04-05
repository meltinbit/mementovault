import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { type DocumentData, type SkillData, type SnippetData, type AssetData } from '@/types';
import { FileText, Zap, Code, Image, Folder, X, Plus, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface AvailableItem {
    id: number;
    title?: string;
    name?: string;
    type?: string;
    mime_type?: string;
}

interface AssetFolderItem {
    id: number;
    name: string;
    assets_count: number;
}

interface CollectionItemPickerProps {
    collectionId: number;
    documents: DocumentData[];
    skills: SkillData[];
    snippets: SnippetData[];
    assets: AssetData[];
    availableDocuments: AvailableItem[];
    availableSkills: AvailableItem[];
    availableSnippets: AvailableItem[];
    availableAssets: AvailableItem[];
    assetFolders?: AssetFolderItem[];
}

const contentTypes = [
    { key: 'document', label: 'Documents', icon: FileText, color: '#3b82f6', labelKey: 'title' },
    { key: 'skill', label: 'Skills', icon: Zap, color: '#f59e0b', labelKey: 'name' },
    { key: 'snippet', label: 'Snippets', icon: Code, color: '#10b981', labelKey: 'name' },
    { key: 'asset', label: 'Assets', icon: Image, color: '#8b5cf6', labelKey: 'name' },
] as const;

function ContentSection({
    type,
    label,
    icon: Icon,
    color,
    labelKey,
    attached,
    available,
    collectionId,
    folders,
}: {
    type: string;
    label: string;
    icon: any;
    color: string;
    labelKey: string;
    attached: any[];
    available: AvailableItem[];
    collectionId: number;
    folders?: AssetFolderItem[];
}) {
    const [expanded, setExpanded] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [selectedFolders, setSelectedFolders] = useState<number[]>([]);
    const [search, setSearch] = useState('');

    const detach = (id: number) => {
        router.delete(route('collections.items.destroy', collectionId), {
            data: { items: [{ type, id }] },
            preserveScroll: true,
        });
    };

    const attach = () => {
        if (selected.length === 0 && selectedFolders.length === 0) return;
        const items = [
            ...selected.map((id) => ({ type, id })),
            ...selectedFolders.map((id) => ({ type: 'asset_folder', id })),
        ];
        router.post(
            route('collections.items.store', collectionId),
            { items },
            { preserveScroll: true, onSuccess: () => { setSelected([]); setSelectedFolders([]); setSearch(''); } },
        );
    };

    const filteredAvailable = available.filter((item) => {
        const name = ((item as any)[labelKey] || item.title || item.name || '').toLowerCase();
        return name.includes(search.toLowerCase());
    });

    return (
        <Card className="overflow-hidden">
            <CardHeader className="p-0">
                <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-accent/50"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: color + '18' }}>
                            <Icon className="h-3.5 w-3.5" style={{ color }} />
                        </div>
                        <CardTitle className="text-sm font-medium">{label}</CardTitle>
                        <span
                            className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold"
                            style={{ backgroundColor: attached.length > 0 ? color + '20' : undefined, color: attached.length > 0 ? color : undefined }}
                        >
                            {attached.length}
                        </span>
                    </div>
                    {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>
            </CardHeader>

            {expanded && (
                <CardContent className="border-t p-0">
                    {/* Attached items */}
                    {attached.length > 0 && (
                        <div className="border-b px-4 py-3">
                            <div className="space-y-1">
                                {attached.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-muted"
                                    >
                                        <Link
                                            href={route(`${type}s.edit`, item.id)}
                                            className="truncate hover:underline"
                                        >
                                            {(item as any)[labelKey] || item.title || item.name}
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => detach(item.id)}
                                            className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add items */}
                    {(available.length > 0 || (folders && folders.length > 0)) ? (
                        <div className="px-4 py-3">
                            <div className="relative mb-2">
                                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={`Add ${label.toLowerCase()}...`}
                                    className="h-8 pl-7 text-xs"
                                />
                            </div>
                            <div className="max-h-48 space-y-0.5 overflow-y-auto">
                                {folders && folders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())).map((folder) => (
                                    <label
                                        key={`folder-${folder.id}`}
                                        className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-muted"
                                    >
                                        <Checkbox
                                            checked={selectedFolders.includes(folder.id)}
                                            onCheckedChange={(checked) => {
                                                setSelectedFolders(checked ? [...selectedFolders, folder.id] : selectedFolders.filter((id) => id !== folder.id));
                                            }}
                                        />
                                        <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span className="truncate">{folder.name}</span>
                                        <span className="ml-auto text-xs text-muted-foreground">{folder.assets_count} assets</span>
                                    </label>
                                ))}
                                {folders && folders.length > 0 && filteredAvailable.length > 0 && (
                                    <div className="my-1 border-t" />
                                )}
                                {filteredAvailable.map((item) => (
                                    <label
                                        key={item.id}
                                        className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-muted"
                                    >
                                        <Checkbox
                                            checked={selected.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                                setSelected(checked ? [...selected, item.id] : selected.filter((id) => id !== item.id));
                                            }}
                                        />
                                        <span className="truncate">{(item as any)[labelKey] || item.title || item.name}</span>
                                    </label>
                                ))}
                                {filteredAvailable.length === 0 && (!folders || folders.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())).length === 0) && (
                                    <p className="py-2 text-center text-xs text-muted-foreground">No matches</p>
                                )}
                            </div>
                            {(selected.length > 0 || selectedFolders.length > 0) && (
                                <Button size="sm" onClick={attach} className="mt-2 h-7 w-full gap-1 text-xs">
                                    <Plus className="h-3 w-3" /> Add {selected.length + selectedFolders.length} item{selected.length + selectedFolders.length !== 1 ? 's' : ''}
                                </Button>
                            )}
                        </div>
                    ) : attached.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                            <p className="text-xs text-muted-foreground">
                                No {label.toLowerCase()} in your nucleus yet.
                            </p>
                        </div>
                    ) : null}
                </CardContent>
            )}
        </Card>
    );
}

export function CollectionItemPicker(props: CollectionItemPickerProps) {
    const dataMap = {
        document: { attached: props.documents, available: props.availableDocuments, folders: undefined as AssetFolderItem[] | undefined },
        skill: { attached: props.skills, available: props.availableSkills, folders: undefined as AssetFolderItem[] | undefined },
        snippet: { attached: props.snippets, available: props.availableSnippets, folders: undefined as AssetFolderItem[] | undefined },
        asset: { attached: props.assets, available: props.availableAssets, folders: props.assetFolders },
    };

    const totalAttached = props.documents.length + props.skills.length + props.snippets.length + props.assets.length;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    {totalAttached} item{totalAttached !== 1 ? 's' : ''} in this collection
                </p>
            </div>
            {contentTypes.map((ct) => (
                <ContentSection
                    key={ct.key}
                    type={ct.key}
                    label={ct.label}
                    icon={ct.icon}
                    color={ct.color}
                    labelKey={ct.labelKey}
                    attached={dataMap[ct.key].attached}
                    available={dataMap[ct.key].available}
                    collectionId={props.collectionId}
                    folders={dataMap[ct.key].folders}
                />
            ))}
        </div>
    );
}
