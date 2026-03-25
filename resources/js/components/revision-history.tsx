import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { type SystemDocumentRevisionData } from '@/types';
import { History } from 'lucide-react';

interface RevisionHistoryProps {
    revisions: SystemDocumentRevisionData[];
    currentVersion: number;
    onRestore?: (content: string) => void;
}

export function RevisionHistory({ revisions, currentVersion, onRestore }: RevisionHistoryProps) {
    const [selectedRevision, setSelectedRevision] = useState<SystemDocumentRevisionData | null>(null);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <History className="h-4 w-4" />
                    History
                    {revisions.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                            {revisions.length}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Revision History</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
                        <Badge>v{currentVersion}</Badge>
                        <span className="text-sm font-medium">Current version</span>
                    </div>

                    {revisions.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No previous versions yet.
                        </p>
                    ) : (
                        revisions.map((revision) => (
                            <div
                                key={revision.id}
                                className="rounded-md border p-3 space-y-2"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">v{revision.version}</Badge>
                                        <span className="text-xs text-muted-foreground">{revision.created_at}</span>
                                        {revision.created_by && (
                                            <span className="text-xs text-muted-foreground">by {revision.created_by}</span>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => setSelectedRevision(
                                                selectedRevision?.id === revision.id ? null : revision
                                            )}
                                        >
                                            {selectedRevision?.id === revision.id ? 'Hide' : 'View'}
                                        </Button>
                                        {onRestore && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => onRestore(revision.content)}
                                            >
                                                Restore
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {selectedRevision?.id === revision.id && (
                                    <pre className="max-h-64 overflow-auto rounded bg-muted p-3 text-xs whitespace-pre-wrap">
                                        {revision.content}
                                    </pre>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
