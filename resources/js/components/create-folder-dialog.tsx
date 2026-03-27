import { FormEventHandler } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateFolderDialogProps {
    open: boolean;
    onClose: () => void;
    parentId: number | null;
}

export function CreateFolderDialog({ open, onClose, parentId }: CreateFolderDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        parent_id: parentId,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('asset-folders.store'), {
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
                        <DialogTitle>New Folder</DialogTitle>
                        <DialogDescription>Create a new folder to organize your assets.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 grid gap-2">
                        <Label htmlFor="folder-name">Folder name</Label>
                        <Input
                            id="folder-name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Logos, Brand Assets..."
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
                            Create Folder
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
