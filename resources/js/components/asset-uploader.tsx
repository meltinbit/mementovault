import { useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB — must match StoreAssetRequest validation

interface AssetUploaderProps {
    onChange: (file: File | null) => void;
    accept?: string;
    onError?: (message: string) => void;
}

export function AssetUploader({ onChange, accept, onError }: AssetUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [sizeError, setSizeError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback(
        (f: File) => {
            if (f.size > MAX_FILE_SIZE) {
                const maxMb = Math.round(MAX_FILE_SIZE / (1024 * 1024));
                const fileMb = (f.size / (1024 * 1024)).toFixed(1);
                const msg = `File is too large (${fileMb} MB). Maximum allowed size is ${maxMb} MB.`;
                setSizeError(msg);
                onError?.(msg);
                return;
            }
            setSizeError(null);
            setFile(f);
            onChange(f);
            if (f.type.startsWith('image/')) {
                const url = URL.createObjectURL(f);
                setPreview(url);
            } else {
                setPreview(null);
            }
        },
        [onChange, onError],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragActive(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
        },
        [handleFile],
    );

    const handleRemove = () => {
        if (preview) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview(null);
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const isImage = file?.type.startsWith('image/');

    if (file) {
        return (
            <div className="rounded-md border bg-muted/50 p-3">
                {preview && (
                    <div className="mb-3 overflow-hidden rounded-md">
                        <img src={preview} alt={file.name} className="max-h-48 w-full object-contain" />
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <div className="rounded-md bg-background p-2">
                        {isImage ? <ImageIcon className="h-5 w-5 text-muted-foreground" /> : <FileIcon className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.type || 'Unknown'} — {formatSize(file.size)}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemove} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
        >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drag & drop a file here, or</p>
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                Browse files
            </Button>
            <p className="text-xs text-muted-foreground">Max {Math.round(MAX_FILE_SIZE / (1024 * 1024))} MB</p>
            {sizeError && <p className="text-sm font-medium text-destructive">{sizeError}</p>}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                }}
            />
        </div>
    );
}
