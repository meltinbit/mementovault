<?php

namespace App\Services;

use InvalidArgumentException;

class WorkspaceTemplateService
{
    /** @var array<string> */
    private const AVAILABLE_TEMPLATES = [
        'developer',
        'marketer',
        'consultant',
        'agency',
        'custom',
    ];

    /**
     * Get the content for a workspace template.
     *
     * @return array{identity: array{content: string}, instructions: array{content: string}, context: array{content: string}, memory: array{content: string}}
     */
    public function getTemplate(string $templateName): array
    {
        if (! in_array($templateName, self::AVAILABLE_TEMPLATES)) {
            throw new InvalidArgumentException("Template '{$templateName}' does not exist.");
        }

        $path = database_path("seeders/templates/{$templateName}.json");

        if (! file_exists($path)) {
            throw new InvalidArgumentException("Template file not found: {$path}");
        }

        return json_decode(file_get_contents($path), true);
    }

    /**
     * Get all available template names.
     *
     * @return array<string>
     */
    public function availableTemplates(): array
    {
        return self::AVAILABLE_TEMPLATES;
    }
}
