import { SystemDocumentEditor } from '@/components/system-document-editor';
import { type BreadcrumbItem, type SystemDocumentData, type SystemDocumentRevisionData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Memory', href: '/workspace/memory' },
];

interface Props {
    document: SystemDocumentData;
    revisions: SystemDocumentRevisionData[];
}

export default function Memory({ document, revisions }: Props) {
    return (
        <SystemDocumentEditor
            document={document}
            revisions={revisions}
            title="Memory"
            description="Persistent notes that carry across AI conversations. Use it for decisions made, preferences discovered, and important context to remember."
            guidance="Add things AI should remember long-term: decisions you've made, preferences you've expressed, project history, and anything that shouldn't be forgotten between conversations. AI reads this every time."
            breadcrumbs={breadcrumbs}
        />
    );
}
