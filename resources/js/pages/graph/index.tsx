import { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type CollectionData } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Graph', href: '/graph' },
];

interface GraphNode {
    id: string;
    type: string;
    label: string;
    group: string | null;
    color?: string;
    contentId?: number;
    url?: string;
    x?: number;
    y?: number;
}

interface GraphEdge {
    source: string | GraphNode;
    target: string | GraphNode;
    type: string;
}

interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

interface GraphProps {
    collections: CollectionData[];
}

const NODE_COLORS: Record<string, string> = {
    nucleus: '#8b5cf6',
    collection: '#6366f1',
    collection_document: '#a78bfa',
    document: '#64748b',
    skill: '#22c55e',
    snippet: '#f97316',
    memory: '#a855f7',
    asset: '#6b7280',
};

const NODE_SIZES: Record<string, number> = {
    nucleus: 12,
    collection: 8,
    collection_document: 5,
    document: 5,
    skill: 5,
    snippet: 5,
    memory: 4,
    asset: 4,
};

const EDGE_STYLES_DARK: Record<string, { color: string; width: number; dash?: number[] }> = {
    hierarchy: { color: '#444444', width: 0.5, dash: [4, 4] },
    wikilink: { color: '#ffffff', width: 1.5 },
    mention: { color: '#888888', width: 0.5, dash: [2, 2] },
};

const EDGE_STYLES_LIGHT: Record<string, { color: string; width: number; dash?: number[] }> = {
    hierarchy: { color: '#c0c0c0', width: 0.5, dash: [4, 4] },
    wikilink: { color: '#334155', width: 1.5 },
    mention: { color: '#a0a0a0', width: 0.5, dash: [2, 2] },
};

export default function GraphIndex({ collections }: GraphProps) {
    const graphRef = useRef<ForceGraphMethods | undefined>();
    const containerRef = useRef<HTMLDivElement>(null);
    const [graphData, setGraphData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

    // Detect dark mode
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Filters
    const [showHierarchy, setShowHierarchy] = useState(true);
    const [showWikilinks, setShowWikilinks] = useState(true);
    const [showMentions, setShowMentions] = useState(true);
    const [showOrphans, setShowOrphans] = useState(true);
    const [filterCollection, setFilterCollection] = useState<string>('');
    const [filterTypes, setFilterTypes] = useState<Set<string>>(new Set([
        'collection_document', 'document', 'skill', 'snippet', 'memory',
    ]));

    // Load graph data
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterCollection) {
            params.set('scope', 'collection');
            params.set('collection_id', filterCollection);
        }
        params.set('include_orphans', showOrphans ? 'true' : 'false');

        fetch(`/graph/data?${params.toString()}`, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: GraphData) => {
                setGraphData({
                    nodes: data.nodes || [],
                    edges: data.edges || [],
                });
                setLoading(false);
            })
            .catch(() => {
                setGraphData({ nodes: [], edges: [] });
                setLoading(false);
            });
    }, [filterCollection, showOrphans]);

    // Responsive sizing
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Filter nodes and edges
    const filteredData = useCallback(() => {
        if (!graphData) return { nodes: [], links: [] };

        const visibleTypes = new Set(['nucleus', 'collection', ...filterTypes]);

        const visibleNodes = graphData.nodes.filter(n => visibleTypes.has(n.type));
        const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

        const visibleEdges = graphData.edges.filter(e => {
            const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
            const targetId = typeof e.target === 'string' ? e.target : e.target.id;

            if (!visibleNodeIds.has(sourceId) || !visibleNodeIds.has(targetId)) return false;

            if (e.type === 'hierarchy' && !showHierarchy) return false;
            if (e.type === 'wikilink' && !showWikilinks) return false;
            if (e.type === 'mention' && !showMentions) return false;

            return true;
        });

        return { nodes: visibleNodes, links: visibleEdges };
    }, [graphData, filterTypes, showHierarchy, showWikilinks, showMentions]);

    const toggleType = (type: string) => {
        setFilterTypes(prev => {
            const next = new Set(prev);
            if (next.has(type)) {
                next.delete(type);
            } else {
                next.add(type);
            }
            return next;
        });
    };

    const handleNodeClick = useCallback((node: GraphNode) => {
        if (node.url) {
            router.visit(node.url);
        }
    }, []);

    const drawNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const size = NODE_SIZES[node.type] || 5;
        const color = node.color || NODE_COLORS[node.type] || '#6b7280';
        const x = node.x || 0;
        const y = node.y || 0;

        // Draw node circle
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        // Draw border for nucleus
        if (node.type === 'nucleus') {
            ctx.strokeStyle = '#c4b5fd';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Label with outline for readability in both light and dark mode
        const fontSize = Math.max(10 / globalScale, 2);
        if (globalScale > 0.5) {
            ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            const labelY = y + size + 2;

            // Draw text outline (background halo) for contrast
            ctx.strokeStyle = isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 3 / globalScale;
            ctx.lineJoin = 'round';
            ctx.strokeText(node.label, x, labelY);

            // Draw text fill
            ctx.fillStyle = isDark ? '#e2e8f0' : '#1e293b';
            ctx.fillText(node.label, x, labelY);
        }
    }, [isDark]);

    const drawLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const edgeStyles = isDark ? EDGE_STYLES_DARK : EDGE_STYLES_LIGHT;
        const style = edgeStyles[link.type] || edgeStyles.hierarchy;
        const source = link.source;
        const target = link.target;

        if (!source?.x || !target?.x) return;

        ctx.beginPath();
        ctx.strokeStyle = style.color;
        ctx.lineWidth = style.width;

        if (style.dash) {
            ctx.setLineDash(style.dash);
        } else {
            ctx.setLineDash([]);
        }

        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow for wikilinks
        if (link.type === 'wikilink') {
            const angle = Math.atan2(target.y - source.y, target.x - source.x);
            const targetSize = NODE_SIZES[target.type] || 5;
            const arrowX = target.x - Math.cos(angle) * (targetSize + 3);
            const arrowY = target.y - Math.sin(angle) * (targetSize + 3);
            const arrowLen = 4;

            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(
                arrowX - arrowLen * Math.cos(angle - Math.PI / 6),
                arrowY - arrowLen * Math.sin(angle - Math.PI / 6),
            );
            ctx.lineTo(
                arrowX - arrowLen * Math.cos(angle + Math.PI / 6),
                arrowY - arrowLen * Math.sin(angle + Math.PI / 6),
            );
            ctx.closePath();
            ctx.fillStyle = style.color;
            ctx.fill();
        }
    }, [isDark]);

    const data = filteredData();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Graph View" />
            <div className="flex h-[calc(100vh-4rem)] flex-col">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
                    <span className="text-xs font-medium text-muted-foreground mr-1">Edges:</span>
                    <Button
                        size="sm"
                        variant={showHierarchy ? 'default' : 'outline'}
                        onClick={() => setShowHierarchy(!showHierarchy)}
                        className="h-7 text-xs"
                    >
                        Hierarchy
                    </Button>
                    <Button
                        size="sm"
                        variant={showWikilinks ? 'default' : 'outline'}
                        onClick={() => setShowWikilinks(!showWikilinks)}
                        className="h-7 text-xs"
                    >
                        Wikilinks
                    </Button>
                    <Button
                        size="sm"
                        variant={showMentions ? 'default' : 'outline'}
                        onClick={() => setShowMentions(!showMentions)}
                        className="h-7 text-xs"
                    >
                        Mentions
                    </Button>

                    <span className="mx-2 h-4 w-px bg-border" />

                    <span className="text-xs font-medium text-muted-foreground mr-1">Types:</span>
                    {[
                        { key: 'collection_document', label: 'Col. Docs', color: NODE_COLORS.collection_document },
                        { key: 'document', label: 'Documents', color: NODE_COLORS.document },
                        { key: 'skill', label: 'Skills', color: NODE_COLORS.skill },
                        { key: 'snippet', label: 'Snippets', color: NODE_COLORS.snippet },
                        { key: 'memory', label: 'Memory', color: NODE_COLORS.memory },
                    ].map(({ key, label, color }) => (
                        <Button
                            key={key}
                            size="sm"
                            variant={filterTypes.has(key) ? 'default' : 'outline'}
                            onClick={() => toggleType(key)}
                            className="h-7 text-xs"
                        >
                            <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                            {label}
                        </Button>
                    ))}

                    <span className="mx-2 h-4 w-px bg-border" />

                    <Button
                        size="sm"
                        variant={showOrphans ? 'default' : 'outline'}
                        onClick={() => setShowOrphans(!showOrphans)}
                        className="h-7 text-xs"
                    >
                        Orphans
                    </Button>

                    {collections.length > 0 && (
                        <>
                            <span className="mx-2 h-4 w-px bg-border" />
                            <select
                                className="h-7 rounded-md border border-input bg-background px-2 text-xs"
                                value={filterCollection}
                                onChange={(e) => setFilterCollection(e.target.value)}
                            >
                                <option value="">All collections</option>
                                {collections.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </>
                    )}

                    <span className="ml-auto text-xs text-muted-foreground">
                        {data.nodes.length} nodes, {data.links.length} edges
                    </span>
                </div>

                {/* Graph canvas */}
                <div ref={containerRef} className="relative flex-1 bg-background">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <Skeleton className="h-64 w-64 rounded-full" />
                        </div>
                    ) : (
                        <ForceGraph2D
                            ref={graphRef}
                            width={dimensions.width}
                            height={dimensions.height}
                            graphData={data}
                            nodeId="id"
                            nodeCanvasObject={drawNode}
                            nodePointerAreaPaint={(node: GraphNode, color, ctx) => {
                                const size = NODE_SIZES[node.type] || 5;
                                ctx.fillStyle = color;
                                ctx.beginPath();
                                ctx.arc(node.x || 0, node.y || 0, size + 2, 0, 2 * Math.PI);
                                ctx.fill();
                            }}
                            linkCanvasObject={drawLink}
                            linkDirectionalArrowLength={0}
                            onNodeClick={handleNodeClick}
                            onNodeHover={setHoveredNode}
                            backgroundColor="transparent"
                            cooldownTicks={100}
                            onEngineStop={() => {
                                graphRef.current?.zoomToFit(400, 60);
                            }}
                            d3AlphaDecay={0.02}
                            d3VelocityDecay={0.3}
                        />
                    )}

                    {/* Hover tooltip */}
                    {hoveredNode && hoveredNode.type !== 'nucleus' && (
                        <div className="pointer-events-none absolute left-4 bottom-4 rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                            <div className="flex items-center gap-2">
                                <span
                                    className="inline-block h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: hoveredNode.color || NODE_COLORS[hoveredNode.type] || '#6b7280' }}
                                />
                                <span className="text-sm font-medium">{hoveredNode.label}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                                {hoveredNode.type.replace('_', ' ')}
                                {hoveredNode.group ? ` \u00b7 ${hoveredNode.group}` : ''}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
