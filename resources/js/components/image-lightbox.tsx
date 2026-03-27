import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
    src: string | null;
    alt?: string;
    onClose: () => void;
}

export function ImageLightbox({ src, alt = '', onClose }: ImageLightboxProps) {
    useEffect(() => {
        if (!src) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [src, onClose]);

    if (!src) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
                <X className="h-5 w-5" />
            </button>
            <img
                src={src}
                alt={alt}
                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
