import { SystemDocumentEditor } from '@/components/system-document-editor';
import { type BreadcrumbItem, type SystemDocumentData, type SystemDocumentRevisionData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Instructions', href: '/workspace/instructions' },
];

interface Props {
    document: SystemDocumentData;
    revisions: SystemDocumentRevisionData[];
}

export default function Instructions({ document, revisions }: Props) {
    return (
        <SystemDocumentEditor
            document={document}
            revisions={revisions}
            title="Instructions"
            description="Set the rules for how AI should work with you. Include language preferences, code style, formatting rules, and things to avoid."
            guidance="Define: preferred language for responses, code conventions, formatting rules, framework-specific preferences, and explicit things to avoid. These rules apply to every AI interaction."
            breadcrumbs={breadcrumbs}
        />
    );
}
