import { SystemDocumentEditor } from '@/components/system-document-editor';
import { type BreadcrumbItem, type SystemDocumentData, type SystemDocumentRevisionData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Identity', href: '/workspace/identity' },
];

interface Props {
    document: SystemDocumentData;
    revisions: SystemDocumentRevisionData[];
}

export default function Identity({ document, revisions }: Props) {
    return (
        <SystemDocumentEditor
            document={document}
            revisions={revisions}
            title="Identity"
            description="This is your AI persona. Define who you are, your expertise, communication style, and values. AI will use this as the foundation for every interaction."
            guidance="Include: your name and role, tech stack or expertise areas, how you want AI to communicate with you, and your core values or working principles. The more specific, the better AI understands you."
            breadcrumbs={breadcrumbs}
        />
    );
}
