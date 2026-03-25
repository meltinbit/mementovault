import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Error404() {
    return (
        <>
            <Head title="Page Not Found" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <h1 className="text-8xl font-bold text-muted-foreground/20">404</h1>
                <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
                <p className="mt-2 text-muted-foreground">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Button asChild className="mt-8 gap-2">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                </Button>
            </div>
        </>
    );
}
