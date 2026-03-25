import { SystemDocumentEditor } from '@/components/system-document-editor';
import { type BreadcrumbItem, type SystemDocumentData, type SystemDocumentMeta, type SystemDocumentRevisionData } from '@/types';

interface Props {
    document: SystemDocumentData;
    revisions: SystemDocumentRevisionData[];
    meta: SystemDocumentMeta;
}

export default function Show({ document, revisions, meta }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: meta.label, href: `/workspace/${document.type}` },
    ];

    return (
        <SystemDocumentEditor
            document={document}
            revisions={revisions}
            title={meta.label}
            description={meta.description}
            guidance={meta.guidance}
            breadcrumbs={breadcrumbs}
        />
    );
}
