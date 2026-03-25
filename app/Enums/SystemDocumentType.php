<?php

namespace App\Enums;

class SystemDocumentType
{
    /** @var string[] Core types — always created for every workspace */
    public const CORE = ['identity', 'instructions', 'context', 'memory'];

    /** @var string[] Built-in optional types — available but not auto-created */
    public const BUILTIN = ['soul', 'services', 'portfolio', 'products', 'icp'];

    /**
     * @return array<string, array{label: string, description: string, icon: string, guidance: string}>
     */
    public static function metadata(): array
    {
        return [
            'identity' => [
                'label' => 'Identity',
                'description' => 'This is your AI persona. Define who you are, your expertise, communication style, and values.',
                'icon' => 'User',
                'guidance' => 'Include: your name and role, expertise areas, how you want AI to communicate with you, and your core values or working principles.',
            ],
            'instructions' => [
                'label' => 'Instructions',
                'description' => 'Set the rules for how AI should work with you. Include language preferences, code style, formatting rules, and things to avoid.',
                'icon' => 'BookText',
                'guidance' => 'Define: preferred language, code conventions, formatting rules, framework-specific preferences, and things to avoid.',
            ],
            'context' => [
                'label' => 'Context',
                'description' => 'Share what you\'re working on right now. Active projects, current priorities, deadlines.',
                'icon' => 'Brain',
                'guidance' => 'Keep this updated regularly. Include: active projects, current priorities, upcoming deadlines, and collaborators.',
            ],
            'memory' => [
                'label' => 'Memory',
                'description' => 'Persistent notes that carry across AI conversations. Decisions made, preferences discovered.',
                'icon' => 'Database',
                'guidance' => 'Add things AI should remember long-term: decisions, preferences, project history.',
            ],
            'soul' => [
                'label' => 'Soul',
                'description' => 'Your brand\'s deep identity — mission, vision, core values, and personality that defines everything.',
                'icon' => 'Heart',
                'guidance' => 'Define: your mission, vision, core values, brand personality, and the "why" behind your work.',
            ],
            'services' => [
                'label' => 'Services',
                'description' => 'What you offer, how you deliver it, pricing models, and service-specific details.',
                'icon' => 'Briefcase',
                'guidance' => 'List each service with: description, deliverables, process, pricing model, and ideal client.',
            ],
            'portfolio' => [
                'label' => 'Portfolio',
                'description' => 'Past work, case studies, results achieved, and notable projects.',
                'icon' => 'FolderOpen',
                'guidance' => 'For each project: client/context, challenge, approach, results, and tech/tools used.',
            ],
            'products' => [
                'label' => 'Products',
                'description' => 'Your products or SaaS offerings — features, pricing, positioning, and technical details.',
                'icon' => 'Package',
                'guidance' => 'For each product: description, key features, target audience, pricing, and competitive advantage.',
            ],
            'icp' => [
                'label' => 'ICP',
                'description' => 'Ideal Customer Profile — who your perfect customer is, their pain points, and buying behavior.',
                'icon' => 'Target',
                'guidance' => 'Define: demographics, company size, pain points, goals, buying triggers, and objections.',
            ],
        ];
    }

    public static function label(string $type): string
    {
        return self::metadata()[$type]['label'] ?? ucfirst(str_replace(['-', '_'], ' ', $type));
    }

    public static function description(string $type): string
    {
        return self::metadata()[$type]['description'] ?? '';
    }

    public static function guidance(string $type): string
    {
        return self::metadata()[$type]['guidance'] ?? '';
    }

    public static function icon(string $type): string
    {
        return self::metadata()[$type]['icon'] ?? 'FileText';
    }

    public static function isCore(string $type): bool
    {
        return in_array($type, self::CORE);
    }

    public static function isBuiltin(string $type): bool
    {
        return in_array($type, self::BUILTIN);
    }

    public static function isKnown(string $type): bool
    {
        return self::isCore($type) || self::isBuiltin($type);
    }

    /** @return string[] */
    public static function all(): array
    {
        return array_merge(self::CORE, self::BUILTIN);
    }
}
