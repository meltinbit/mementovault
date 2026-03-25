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
            description="Define who you are and how AI should understand you."
            breadcrumbs={breadcrumbs}
        />
    );
}
