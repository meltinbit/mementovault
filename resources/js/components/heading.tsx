export default function Heading({ title, description }: { title: string; description?: string | React.ReactNode }) {
    return (
        <div className="mb-8 space-y-1.5">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            {description && (
                <div className="text-muted-foreground max-w-2xl text-sm leading-relaxed">{description}</div>
            )}
        </div>
    );
}
