<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\CollectionDocument;

class CollectionTemplateService
{
    private string $templatesPath;

    public function __construct()
    {
        $this->templatesPath = database_path('seeders/templates/collections');
    }

    /** @return array<string, array{type: string, label: string, description: string, documents: array}> */
    public function allTemplates(): array
    {
        $templates = [];

        foreach (glob($this->templatesPath.'/*.json') as $file) {
            $template = json_decode(file_get_contents($file), true);
            $templates[$template['type']] = $template;
        }

        return $templates;
    }

    public function getTemplate(string $type): ?array
    {
        $file = $this->templatesPath.'/'.$type.'.json';

        if (! file_exists($file)) {
            return $this->getTemplate('custom');
        }

        return json_decode(file_get_contents($file), true);
    }

    public function seedDocuments(Collection $collection): void
    {
        $template = $this->getTemplate($collection->type);

        if (! $template) {
            return;
        }

        foreach ($template['documents'] as $doc) {
            CollectionDocument::create([
                'collection_id' => $collection->id,
                'name' => $doc['name'],
                'slug' => $doc['slug'],
                'content' => $doc['placeholder'] ?? '',
                'schema' => $doc['schema'] ?? null,
                'sort_order' => $doc['sort_order'],
                'is_required' => $doc['is_required'] ?? false,
            ]);
        }
    }
}
