<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_skill')]
#[Description('Returns the full content of a specific skill by slug.')]
#[IsReadOnly]
class GetSkillTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $skill = $collection->skills()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $skill) {
            return Response::error("Skill with slug '{$slug}' not found in this collection.");
        }

        return Response::text("# {$skill->name}\n\n**Description:** {$skill->description}\n\n{$skill->content}");
    }

    /**
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'slug' => $schema->string()->description('The slug of the skill to retrieve.')->required(),
        ];
    }
}
