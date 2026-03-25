import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { type DocumentData, type SkillData, type SnippetData, type AssetData } from '@/types';
import { FileText, Zap, Code, Image, X, Plus } from 'lucide-react';

interface AvailableItem {
    id: number;
    title?: string;
    name?: string;
    type?: string;
    mime_type?: string;
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
}

function AttachedSection({
    title,
    icon: Icon,
    items,
    type,
    collectionId,
    labelKey = 'name',
}: {
    title: string;
    icon: any;
    items: any[];
    type: string;
    collectionId: number;
    labelKey?: string;
}) {
    const detach = (id: number) => {
        router.delete(route('collections.items.destroy', collectionId), {
            data: { items: [{ type, id }] },
            preserveScroll: true,
        });
    };

    return (
        <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4 text-muted-foreground" /> {title} ({items.length})
            </div>
            {items.length === 0 ? (
                <p className="text-xs text-muted-foreground">None attached</p>
            ) : (
                <div className="flex flex-wrap gap-1">
                    {items.map((item) => (
                        <Badge key={item.id} variant="secondary" className="gap-1 pr-1">
                            {item[labelKey] || item.title || item.name}
                            <button type="button" onClick={() => detach(item.id)} className="ml-0.5 rounded-full p-0.5 hover:bg-black/10">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

function AddSection({
    title,
    items,
    type,
    collectionId,
    labelKey = 'name',
}: {
    title: string;
    items: AvailableItem[];
    type: string;
    collectionId: number;
    labelKey?: string;
}) {
    const [selected, setSelected] = useState<number[]>([]);

    const attach = () => {
        if (selected.length === 0) return;
        router.post(
            route('collections.items.store', collectionId),
            {
                items: selected.map((id) => ({ type, id })),
            },
            {
                preserveScroll: true,
                onSuccess: () => setSelected([]),
            },
        );
    };

    if (items.length === 0) return null;

    return (
        <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Add {title}</p>
            <div className="max-h-32 space-y-1 overflow-y-auto">
                {items.map((item) => (
                    <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-muted">
                        <Checkbox
                            checked={selected.includes(item.id)}
                            onCheckedChange={(checked) => {
                                setSelected(checked ? [...selected, item.id] : selected.filter((id) => id !== item.id));
                            }}
                        />
                        {(item as any)[labelKey] || item.title || item.name}
                    </label>
                ))}
            </div>
            {selected.length > 0 && (
                <Button size="sm" onClick={attach} className="gap-1">
                    <Plus className="h-3 w-3" /> Add {selected.length} {title.toLowerCase()}
                </Button>
            )}
        </div>
    );
}

export function CollectionItemPicker(props: CollectionItemPickerProps) {
    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <AttachedSection title="Documents" icon={FileText} items={props.documents} type="document" collectionId={props.collectionId} labelKey="title" />
                    <AddSection title="Documents" items={props.availableDocuments} type="document" collectionId={props.collectionId} labelKey="title" />
                </div>
                <div className="space-y-4">
                    <AttachedSection title="Skills" icon={Zap} items={props.skills} type="skill" collectionId={props.collectionId} />
                    <AddSection title="Skills" items={props.availableSkills} type="skill" collectionId={props.collectionId} />
                </div>
                <div className="space-y-4">
                    <AttachedSection title="Snippets" icon={Code} items={props.snippets} type="snippet" collectionId={props.collectionId} />
                    <AddSection title="Snippets" items={props.availableSnippets} type="snippet" collectionId={props.collectionId} />
                </div>
                <div className="space-y-4">
                    <AttachedSection title="Assets" icon={Image} items={props.assets} type="asset" collectionId={props.collectionId} />
                    <AddSection title="Assets" items={props.availableAssets} type="asset" collectionId={props.collectionId} />
                </div>
            </div>
        </div>
    );
}
