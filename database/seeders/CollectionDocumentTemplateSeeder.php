<?php

namespace Database\Seeders;

use App\Models\CollectionDocumentTemplate;
use Illuminate\Database\Seeder;

class CollectionDocumentTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Instructions',
                'slug' => 'instructions',
                'description' => 'Operating rules, tone, language, and constraints',
                'sort_order' => 0,
                'placeholder' => "# Instructions\n\n## Tone\nHow should you communicate?\n\n## Language\nWhat language to use?\n\n## Rules\nWhat to always do / never do?",
            ],
            [
                'name' => 'Architecture',
                'slug' => 'architecture',
                'description' => 'System architecture, database schema, API design',
                'sort_order' => 1,
                'placeholder' => "# System Architecture\n\n## Overview\nHigh-level architecture description.\n\n## Database\nSchema overview, key tables, relationships.\n\n## API\nEndpoints, authentication, data flow.\n\n## Infrastructure\nHosting, CI/CD, deployment.",
            ],
            [
                'name' => 'Roadmap',
                'slug' => 'roadmap',
                'description' => 'Project status, priorities, and backlog',
                'sort_order' => 2,
                'placeholder' => "# Project Status & Plan\n\n## Current State\nWhat's built, what's working, known issues.\n\n## Next Steps\nImmediate priorities.\n\n## Backlog\nFuture features and improvements.",
            ],
            [
                'name' => 'Brand Voice',
                'slug' => 'brand-voice',
                'description' => 'Brand personality, tone guidelines, do\'s and don\'ts',
                'sort_order' => 3,
                'placeholder' => "# Brand Voice\n\n## Personality\nAdjectives that describe the brand voice.\n\n## Do's\nPhrases, styles, approaches that fit.\n\n## Don'ts\nThings that are off-brand.\n\n## Examples\nExample outputs that nail the voice.",
            ],
            [
                'name' => 'Products & Services',
                'slug' => 'products-services',
                'description' => 'Product catalog, features, pricing, value proposition',
                'sort_order' => 4,
                'placeholder' => "# Products & Services\n\n## Products\nList your products, features, pricing.\n\n## Services\nList your services, deliverables, pricing.\n\n## Value Proposition\nWhy should someone buy from you?",
            ],
            [
                'name' => 'Target Market',
                'slug' => 'target-market',
                'description' => 'Ideal customer profile, segments, disqualifiers',
                'sort_order' => 5,
                'placeholder' => "# Target Market\n\n## Ideal Customer Profile\nIndustry, company size, role, pain points.\n\n## Segments\nDifferent customer segments and how to approach each.\n\n## Disqualifiers\nWho is NOT a good fit?",
            ],
            [
                'name' => 'Sales Playbook',
                'slug' => 'sales-playbook',
                'description' => 'Sales process, objection handling, email templates',
                'sort_order' => 6,
                'placeholder' => "# Sales Playbook\n\n## Process\nSteps from first contact to close.\n\n## Common Objections\nFrequent pushbacks and how to handle them.\n\n## Email Templates\nOutreach templates, follow-up templates.\n\n## Qualification Criteria\nHow to determine if a lead is worth pursuing.",
            ],
            [
                'name' => 'Content Strategy',
                'slug' => 'content-strategy',
                'description' => 'Content pillars, calendar, goals',
                'sort_order' => 7,
                'placeholder' => "# Content Strategy\n\n## Content Pillars\nMain themes and topics.\n\n## Content Calendar\nPosting frequency, best times, recurring series.\n\n## Goals\nWhat are we trying to achieve? Followers, engagement, leads?",
            ],
            [
                'name' => 'Channels & Formats',
                'slug' => 'channels-formats',
                'description' => 'Platforms, post types, hashtag strategy',
                'sort_order' => 8,
                'placeholder' => "# Channels & Formats\n\n## Platforms\nWhich platforms, any platform-specific rules.\n\n## Formats\nPost types: text, carousel, video, story, thread.\n\n## Hashtag Strategy\nHashtag groups, limits per platform.",
            ],
            [
                'name' => 'Client Brief',
                'slug' => 'client-brief',
                'description' => 'Client overview, needs, key contacts',
                'sort_order' => 9,
                'placeholder' => "# Client Brief\n\n## Who They Are\nCompany, industry, size.\n\n## What They Need\nProject goals, desired outcomes.\n\n## Key Contacts\nWho to reference, decision makers.",
            ],
            [
                'name' => 'Deliverables',
                'slug' => 'deliverables',
                'description' => 'Scope, timeline, milestones, progress',
                'sort_order' => 10,
                'placeholder' => "# Deliverables\n\n## Scope\nDetailed deliverables list.\n\n## Timeline\nMilestones and deadlines.\n\n## Status\nCurrent progress per deliverable.",
            ],
            [
                'name' => 'Ideas Pipeline',
                'slug' => 'ideas-pipeline',
                'description' => 'Ideas being explored, status, initial thoughts',
                'sort_order' => 11,
                'placeholder' => "# Ideas Pipeline\n\nList current ideas, their status, initial thoughts on each.",
            ],
            [
                'name' => 'Market Context',
                'slug' => 'market-context',
                'description' => 'Trends, competitors, opportunities',
                'sort_order' => 12,
                'placeholder' => "# Market Context\n\n## Trends\nWhat's happening in the market.\n\n## Competitors\nWho's doing similar things.\n\n## Opportunities\nGaps I see.",
            ],
            [
                'name' => 'Validation Framework',
                'slug' => 'validation-framework',
                'description' => 'Criteria for evaluating and validating ideas',
                'sort_order' => 13,
                'placeholder' => "# Validation Framework\n\n## Criteria\nWhat makes an idea worth pursuing?\n\n## Process\nSteps from idea to MVP decision.\n\n## Kill Criteria\nWhen to abandon an idea.",
            ],
            [
                'name' => 'Brand & Positioning',
                'slug' => 'brand-positioning',
                'description' => 'Value proposition, differentiators, target audience',
                'sort_order' => 14,
                'placeholder' => "# Brand & Positioning\n\n## Value Proposition\nCore message.\n\n## Differentiators\nWhat makes us unique.\n\n## Target Audience\nWho we're talking to.",
            ],
            [
                'name' => 'Campaigns',
                'slug' => 'campaigns',
                'description' => 'Active campaigns, goals, status, metrics',
                'sort_order' => 15,
                'placeholder' => "# Active Campaigns\n\nCurrent campaigns, goals, status, metrics.",
            ],
            [
                'name' => 'Content Bank',
                'slug' => 'content-bank',
                'description' => 'Key messages, proof points, keywords',
                'sort_order' => 16,
                'placeholder' => "# Content Bank\n\n## Key Messages\nCore messages to reinforce.\n\n## Proof Points\nCase studies, testimonials, data points.\n\n## Keywords\nSEO keywords, phrases to target.",
            ],
            [
                'name' => 'FAQ',
                'slug' => 'faq',
                'description' => 'Frequently asked questions and answers',
                'sort_order' => 17,
                'placeholder' => "# FAQ\n\n## General\nCommon questions about the project/product.\n\n## Technical\nTechnical questions and answers.\n\n## Pricing & Plans\nQuestions about pricing, plans, billing.",
            ],
            [
                'name' => 'Competitor Analysis',
                'slug' => 'competitor-analysis',
                'description' => 'Competitor overview, strengths, weaknesses, differentiation',
                'sort_order' => 18,
                'placeholder' => "# Competitor Analysis\n\n## Competitors\nList key competitors.\n\n## Comparison\nStrengths and weaknesses vs. us.\n\n## Differentiation\nHow we stand out.",
            ],
            [
                'name' => 'Guidelines',
                'slug' => 'guidelines',
                'description' => 'General guidelines and operating procedures',
                'sort_order' => 19,
                'placeholder' => "# Guidelines\n\n## Principles\nCore principles to follow.\n\n## Procedures\nStandard operating procedures.\n\n## Exceptions\nWhen and how to deviate from the rules.",
            ],
        ];

        foreach ($templates as $template) {
            CollectionDocumentTemplate::updateOrCreate(
                ['slug' => $template['slug']],
                $template,
            );
        }
    }
}
