<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('list_skills')]
#[Description('Returns a list of all active skills in this collection with their name, description, and slug.')]
#[IsReadOnly]
class ListSkillsTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $skills = $collection->skills()
            ->where('is_active', true)
            ->get(['skills.id', 'name', 'description', 'slug']);

        $list = $skills->map(fn ($s) => "- **{$s->name}** (`{$s->slug}`): {$s->description}")->join("\n");

        return Response::text($list ?: 'No skills in this collection.');
    }
}
