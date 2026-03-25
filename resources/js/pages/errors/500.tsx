import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function Error500() {
    return (
        <>
            <Head title="Server Error" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <h1 className="text-8xl font-bold text-muted-foreground/20">500</h1>
                <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
                <p className="mt-2 text-muted-foreground">An unexpected error occurred. Please try again.</p>
                <Button onClick={() => window.location.reload()} className="mt-8 gap-2">
                    <RefreshCw className="h-4 w-4" /> Reload Page
                </Button>
            </div>
        </>
    );
}
