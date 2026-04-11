/**
 * Replace [[slug]] and [[slug|label]] wikilinks in markdown content with
 * rendered HTML spans. Used in preview mode for markdown editors.
 *
 * Valid links render as accent-colored clickable links.
 * Broken links render as red text with a tooltip.
 */

const WIKILINK_REGEX = /\[\[([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(?:\|([^\]]+))?\]\]/gi;

export interface ResolvedLink {
    slug: string;
    url: string | null;
    label: string;
}

/**
 * Process wikilinks in markdown text and replace with anchor tags or broken-link spans.
 * The resolvedLinks map is slug -> url (null means broken link).
 */
export function renderWikilinks(
    content: string,
    resolvedLinks: Map<string, string | null>,
): string {
    return content.replace(WIKILINK_REGEX, (_match, slug: string, label?: string) => {
        const displayText = label || slug;
        const normalizedSlug = slug.toLowerCase();
        const url = resolvedLinks.get(normalizedSlug);

        if (url) {
            return `<a href="${url}" class="wikilink wikilink--valid" data-slug="${normalizedSlug}">${displayText}</a>`;
        }

        return `<span class="wikilink wikilink--broken" title="Content not found: ${normalizedSlug}">${displayText}</span>`;
    });
}

/**
 * Extract all wikilink slugs from content.
 */
export function extractWikilinkSlugs(content: string): string[] {
    const slugs: string[] = [];
    let match;
    const regex = new RegExp(WIKILINK_REGEX.source, 'gi');

    while ((match = regex.exec(content)) !== null) {
        slugs.push(match[1].toLowerCase());
    }

    return [...new Set(slugs)];
}
