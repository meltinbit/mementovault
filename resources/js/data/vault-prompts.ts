export interface VaultPrompt {
    category: string;
    prompt: string;
    description: string;
    scope: 'collection' | 'general' | 'both';
}

export const VAULT_PROMPTS: VaultPrompt[] = [
    // Memory
    { category: 'Memory', prompt: 'Remember that I prefer TypeScript for new projects', description: 'Saves a preference to memory', scope: 'both' },
    { category: 'Memory', prompt: 'What do you remember about my preferences?', description: 'Lists saved memory entries', scope: 'both' },
    { category: 'Memory', prompt: 'Move the note about API design to the Backend collection', description: 'Moves a memory entry to another collection', scope: 'collection' },
    { category: 'Memory', prompt: 'Delete the memory about the old deployment process', description: 'Removes an outdated memory entry', scope: 'both' },

    // Documents
    { category: 'Documents', prompt: 'Search my docs for the brand guidelines', description: 'Finds relevant documents by content', scope: 'collection' },
    { category: 'Documents', prompt: 'Create a document with today\'s meeting notes', description: 'Creates a new document in the collection', scope: 'collection' },
    { category: 'Documents', prompt: 'What documents do I have in this collection?', description: 'Lists all available documents', scope: 'collection' },
    { category: 'Documents', prompt: 'Update the architecture doc with the new API endpoints', description: 'Updates an existing document', scope: 'collection' },

    // Skills
    { category: 'Skills', prompt: 'List all my skills', description: 'Shows available skills', scope: 'collection' },
    { category: 'Skills', prompt: 'Create a skill for code review with my conventions', description: 'Creates a new reusable skill', scope: 'collection' },

    // Snippets
    { category: 'Snippets', prompt: 'Show me the email signature snippet', description: 'Retrieves a reusable text block', scope: 'collection' },
    { category: 'Snippets', prompt: 'Create a snippet for my standard project intro', description: 'Saves a reusable text block', scope: 'collection' },

    // Assets
    { category: 'Assets', prompt: 'What assets do I have in this collection?', description: 'Lists files, images, and media', scope: 'collection' },
    { category: 'Assets', prompt: 'Get the URL for the logo file', description: 'Gets a download link for an asset', scope: 'collection' },

    // Search
    { category: 'Search', prompt: 'Search everything for authentication', description: 'Full-text search across all content', scope: 'collection' },

    // Collections
    { category: 'Collections', prompt: 'What collections do I have?', description: 'Lists all available collections', scope: 'general' },
    { category: 'Collections', prompt: 'Switch to the Marketing collection', description: 'Changes active collection context', scope: 'general' },

    // System Documents
    { category: 'Identity', prompt: 'Show me my identity document', description: 'Reads your workspace identity', scope: 'general' },
    { category: 'Identity', prompt: 'Update my instructions with the new coding standards', description: 'Updates workspace-level documents', scope: 'general' },
];

export function getCollectionPrompts(limit = 8): VaultPrompt[] {
    return VAULT_PROMPTS.filter((p) => p.scope !== 'general').slice(0, limit);
}

export function getHomepagePrompts(limit = 6): VaultPrompt[] {
    const picks = [0, 1, 4, 9, 14, 15]; // curated indices for variety
    return picks.slice(0, limit).map((i) => VAULT_PROMPTS[i]);
}

export function getDocsPrompts(): Record<string, VaultPrompt[]> {
    return VAULT_PROMPTS.reduce(
        (acc, p) => {
            (acc[p.category] ??= []).push(p);
            return acc;
        },
        {} as Record<string, VaultPrompt[]>,
    );
}
