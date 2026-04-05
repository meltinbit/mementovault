import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteConfirmation } from '@/components/delete-confirmation';
import { type ApiTokenData } from '@/types';
import { Copy, Key, Plus, Trash2, Check } from 'lucide-react';

interface WorkspaceTokenManagerProps {
    tokens: ApiTokenData[];
    mcpEndpoint: string;
    newToken?: string | null;
}

export function WorkspaceTokenManager({ tokens, mcpEndpoint, newToken: initialNewToken }: WorkspaceTokenManagerProps) {
    const [newToken, setNewToken] = useState<string | null>(initialNewToken || null);
    const [copied, setCopied] = useState<string | null>(null);
    const [deleteToken, setDeleteToken] = useState<ApiTokenData | null>(null);
    const { data, setData, post, processing } = useForm({ name: '' });

    const generateToken = () => {
        post(route('workspace.tokens.store'), {
            onSuccess: (page: any) => {
                const token = (page.props as any).newWorkspaceToken;
                if (token) {
                    setNewToken(token);
                }
                setData('name', '');
            },
        });
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const revokeToken = () => {
        if (!deleteToken) return;
        router.delete(route('workspace.tokens.destroy', deleteToken.id), {
            onSuccess: () => setDeleteToken(null),
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-end gap-3">
                <div className="grid flex-1 gap-1.5">
                    <Label htmlFor="ws-token-name">Token Name</Label>
                    <Input id="ws-token-name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="default" className="h-9" />
                </div>
                <Button size="sm" onClick={generateToken} disabled={processing} className="gap-1">
                    <Plus className="h-4 w-4" /> Generate
                </Button>
            </div>

            {tokens.length === 0 && !newToken ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No nucleus tokens yet. Generate one to access all collections via a single MCP endpoint.</p>
            ) : (
                <div className="space-y-2">
                    {tokens.map((token) => (
                        <div key={token.id} className="flex items-center justify-between rounded-md border p-3">
                            <div className="flex items-center gap-2">
                                <Key className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{token.name}</span>
                                <span className="text-xs text-muted-foreground">Created {token.created_at}</span>
                                {token.last_used_at && (
                                    <Badge variant="secondary" className="text-xs">
                                        Used {token.last_used_at}
                                    </Badge>
                                )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteToken(token)} className="h-8 w-8 p-0 text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={!!newToken} onOpenChange={(open) => !open && setNewToken(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nucleus Token Generated</DialogTitle>
                        <DialogDescription>Copy this token now. It won't be shown again. This token gives access to all collections.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Token</Label>
                            <div className="flex gap-2">
                                <code className="flex-1 break-all rounded bg-muted px-3 py-2 font-mono text-sm">{newToken}</code>
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(newToken!, 'token')} className="shrink-0">
                                    {copied === 'token' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">MCP Endpoint</Label>
                            <div className="flex gap-2">
                                <code className="flex-1 break-all rounded bg-muted px-3 py-2 font-mono text-sm">
                                    {mcpEndpoint}?token={newToken}
                                </code>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(`${mcpEndpoint}?token=${newToken}`, 'endpoint')}
                                    className="shrink-0"
                                >
                                    {copied === 'endpoint' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setNewToken(null)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DeleteConfirmation
                open={!!deleteToken}
                onClose={() => setDeleteToken(null)}
                onConfirm={revokeToken}
                title={`Revoke "${deleteToken?.name}"?`}
                description="Any clients using this token will lose access to all collections."
            />
        </div>
    );
}
