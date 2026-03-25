import { SystemDocumentEditor } from '@/components/system-document-editor';
import { type BreadcrumbItem, type SystemDocumentData, type SystemDocumentRevisionData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Context', href: '/workspace/context' },
];

interface Props {
    document: SystemDocumentData;
    revisions: SystemDocumentRevisionData[];
}

export default function Context({ document, revisions }: Props) {
    return (
        <SystemDocumentEditor
            document={document}
            revisions={revisions}
            title="Context"
            description="Share what you're working on right now. Active projects, current priorities, deadlines, and anything AI needs to know about your current situation."
            guidance="Keep this updated regularly. Include: active projects with brief descriptions, current priorities and focus areas, upcoming deadlines, and team members or collaborators involved."
            breadcrumbs={breadcrumbs}
        />
    );
}
