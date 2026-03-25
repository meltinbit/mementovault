<?php

namespace App\Mcp\Tools;

use App\Models\Skill;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('create_skill')]
#[Description('Creates a new skill in the workspace and adds it to the current collection. Skills have a trigger description (when AI should activate it) and content (the actual instructions).')]
class CreateSkillTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $workspace = app('current_workspace');

        $skill = Skill::withoutGlobalScopes()->create([
            'workspace_id' => $workspace->id,
            'name' => $request->get('name'),
            'description' => $request->get('description'),
            'content' => $request->get('content'),
            'is_active' => true,
        ]);

        $collection->skills()->syncWithoutDetaching([$skill->id]);

        return Response::text("Created skill \"{$skill->name}\" (slug: `{$skill->slug}`). Added to collection \"{$collection->name}\".");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('The skill name.')->required(),
            'description' => $schema->string()->description('Trigger description — when should AI activate this skill? This is shown in the available skills list.')->required(),
            'content' => $schema->string()->description('The full skill instructions in markdown.')->required(),
        ];
    }
}
