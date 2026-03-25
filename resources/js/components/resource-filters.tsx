import { useCallback, useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type TagData } from '@/types';
import { Search } from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
}

interface ResourceFiltersProps {
    route: string;
    filters: Record<string, string | undefined>;
    tagOptions?: TagData[];
    typeOptions?: FilterOption[];
    typePlaceholder?: string;
}

export function ResourceFilters({ route: routeName, filters, tagOptions, typeOptions, typePlaceholder = 'All types' }: ResourceFiltersProps) {
    const [search, setSearch] = useState(filters.search || '');

    const applyFilters = useCallback(
        (newFilters: Record<string, string | undefined>) => {
            const params: Record<string, string> = {};
            const merged = { ...filters, ...newFilters };
            Object.entries(merged).forEach(([key, value]) => {
                if (value && value !== '' && value !== 'all') {
                    params[key] = value;
                }
            });
            router.get(routeName, params, { preserveState: true, preserveScroll: true });
        },
        [filters, routeName],
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search || '')) {
                applyFilters({ search: search || undefined });
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="h-9 pl-8"
                />
            </div>

            {typeOptions && (
                <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) => applyFilters({ type: value === 'all' ? undefined : value })}
                >
                    <SelectTrigger className="h-9 w-[160px]">
                        <SelectValue placeholder={typePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{typePlaceholder}</SelectItem>
                        {typeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {tagOptions && tagOptions.length > 0 && (
                <Select
                    value={filters.tag || 'all'}
                    onValueChange={(value) => applyFilters({ tag: value === 'all' ? undefined : value })}
                >
                    <SelectTrigger className="h-9 w-[160px]">
                        <SelectValue placeholder="All tags" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All tags</SelectItem>
                        {tagOptions.map((tag) => (
                            <SelectItem key={tag.id} value={String(tag.id)}>
                                {tag.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
