import { FormEventHandler, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type AssetFolderData } from '@/types';

interface RenameFolderDialogProps {
    open: boolean;
    onClose: () => void;
    folder: AssetFolderData | null;
}

export function RenameFolderDialog({ open, onClose, folder }: RenameFolderDialogProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: folder?.name ?? '',
    });

    useEffect(() => {
        if (folder) {
            setData('name', folder.name);
        }
    }, [folder]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!folder) return;
        put(route('asset-folders.update', folder.id), {
            onSuccess: () => {
                reset();
                onClose();
            },
            preserveState: true,
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    reset();
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <form onSubmit={submit}>
                    <DialogHeader>
                        <DialogTitle>Rename Folder</DialogTitle>
                        <DialogDescription>Enter a new name for this folder.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 grid gap-2">
                        <Label htmlFor="rename-folder-name">Folder name</Label>
                        <Input
                            id="rename-folder-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            autoFocus
                            required
                        />
                        <InputError message={errors.name} />
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !data.name.trim()}>
                            Rename
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
