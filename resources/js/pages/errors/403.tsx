import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Error403() {
    return (
        <>
            <Head title="Access Denied" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <h1 className="text-8xl font-bold text-muted-foreground/20">403</h1>
                <h2 className="mt-4 text-xl font-semibold">Access denied</h2>
                <p className="mt-2 text-muted-foreground">
                    You don't have permission to access this resource.
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
