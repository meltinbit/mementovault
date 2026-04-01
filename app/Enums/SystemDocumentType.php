<?php

namespace App\Enums;

class SystemDocumentType
{
    /** @var string[] Core types — always created for every workspace */
    public const CORE = ['identity', 'instructions', 'context'];

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
                'description' => 'Your AI persona — who you are, your expertise, and how you communicate. This is always loaded into every AI conversation, so the AI knows you from the start. Example: "I\'m a senior fullstack developer specializing in Laravel and React."',
                'icon' => 'User',
                'guidance' => 'Include: your name and role, expertise areas, how you want AI to communicate with you, and your core values or working principles.',
            ],
            'instructions' => [
                'label' => 'Instructions',
                'description' => 'The rules AI must follow when working with you — language preferences, code style, formatting, and things to avoid. Always loaded alongside your Identity. Example: "Always respond in Italian. Use strict TypeScript. Never suggest jQuery."',
                'icon' => 'BookText',
                'guidance' => 'Define: preferred language, code conventions, formatting rules, framework-specific preferences, and things to avoid.',
            ],
            'context' => [
                'label' => 'Context',
                'description' => 'What you\'re working on right now — active projects, current priorities, and deadlines. Keep this updated so AI always knows your current situation. Example: "Launching v2.0 by April 15. Currently focused on payment integration."',
                'icon' => 'Brain',
                'guidance' => 'Keep this updated regularly. Include: active projects, current priorities, upcoming deadlines, and collaborators.',
            ],
            'soul' => [
                'label' => 'Soul',
                'description' => 'Your brand\'s deep identity — the mission, vision, and personality that drives everything you do. AI uses this to stay aligned with your voice. Example: "We believe software should be simple, transparent, and privacy-first."',
                'icon' => 'Heart',
                'guidance' => 'Define: your mission, vision, core values, brand personality, and the "why" behind your work.',
            ],
            'services' => [
                'label' => 'Services',
                'description' => 'What you offer, how you deliver it, and at what price. AI references this when writing proposals, answering client questions, or generating content. Example: "Web app development — 3-month sprints, fixed price, Laravel + React stack."',
                'icon' => 'Briefcase',
                'guidance' => 'List each service with: description, deliverables, process, pricing model, and ideal client.',
            ],
            'portfolio' => [
                'label' => 'Portfolio',
                'description' => 'Past work and results — case studies, notable projects, and achievements. AI uses this to reference your track record. Example: "Built an e-commerce platform for XYZ Corp — 40% increase in conversion rate."',
                'icon' => 'FolderOpen',
                'guidance' => 'For each project: client/context, challenge, approach, results, and tech/tools used.',
            ],
            'products' => [
                'label' => 'Products',
                'description' => 'Your products or SaaS offerings — features, pricing, and positioning. AI uses this for sales copy, support answers, and technical docs. Example: "Memento Vault — AI context manager, self-hosted, AGPL-3.0, free tier available."',
                'icon' => 'Package',
                'guidance' => 'For each product: description, key features, target audience, pricing, and competitive advantage.',
            ],
            'icp' => [
                'label' => 'ICP',
                'description' => 'Your Ideal Customer Profile — who your perfect customer is and what drives their decisions. AI uses this to tailor messaging and qualify leads. Example: "SaaS founders, 10-50 employees, struggling with onboarding churn."',
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
