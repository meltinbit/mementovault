export interface VaultPrompt {
    category: string;
    prompt: string;
    description: string;
    scope: 'collection' | 'general' | 'both';
}

export const VAULT_PROMPTS: VaultPrompt[] = [
    // Memory
    { category: 'Memory', prompt: 'Remember that I prefer [your preference] for [context]', description: 'Saves a preference to memory', scope: 'both' },
    { category: 'Memory', prompt: 'What do you remember about my preferences?', description: 'Lists saved memory entries', scope: 'both' },
    { category: 'Memory', prompt: 'Move the note about [topic] to the [name] neuron', description: 'Moves a memory entry to another neuron', scope: 'collection' },
    { category: 'Memory', prompt: 'Delete the memory about [topic]', description: 'Removes an outdated memory entry', scope: 'both' },

    // Documents
    { category: 'Documents', prompt: 'Search my docs for [topic]', description: 'Finds relevant documents by content', scope: 'collection' },
    { category: 'Documents', prompt: 'Create a document with [description]', description: 'Creates a new document in the neuron', scope: 'collection' },
    { category: 'Documents', prompt: 'What documents do I have in this neuron?', description: 'Lists all available documents', scope: 'collection' },
    { category: 'Documents', prompt: 'Update the [name] doc with [changes]', description: 'Updates an existing document', scope: 'collection' },

    // Skills
    { category: 'Skills', prompt: 'List all my skills', description: 'Shows available skills', scope: 'collection' },
    { category: 'Skills', prompt: 'Create a skill for [task] with my conventions', description: 'Creates a new reusable skill', scope: 'collection' },

    // Snippets
    { category: 'Snippets', prompt: 'Show me the [name] snippet', description: 'Retrieves a reusable text block', scope: 'collection' },
    { category: 'Snippets', prompt: 'Create a snippet for [description]', description: 'Saves a reusable text block', scope: 'collection' },

    // Assets
    { category: 'Assets', prompt: 'What assets do I have in this neuron?', description: 'Lists files, images, and media', scope: 'collection' },
    { category: 'Assets', prompt: 'Get the URL for the [filename]', description: 'Gets a download link for an asset', scope: 'collection' },

    // Search
    { category: 'Search', prompt: 'Search everything for [keyword]', description: 'Full-text search across all content', scope: 'collection' },

    // Neurons
    { category: 'Neurons', prompt: 'What neurons do I have?', description: 'Lists all available neurons', scope: 'general' },
    { category: 'Neurons', prompt: 'Switch to the [name] neuron', description: 'Changes active neuron context', scope: 'general' },

    // System Documents
    { category: 'Identity', prompt: 'Show me my identity document', description: 'Reads your workspace identity', scope: 'general' },
    { category: 'Identity', prompt: 'Update my instructions with [changes]', description: 'Updates workspace-level documents', scope: 'general' },
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
