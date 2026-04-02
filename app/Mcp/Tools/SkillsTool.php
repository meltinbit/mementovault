<?php

namespace App\Mcp\Tools;

use App\Models\Collection;
use App\Models\Skill;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('skills')]
#[Description('Manage skills in this collection. Actions: list, get, create, update, append, delete. Use append to add content in chunks.')]
class SkillsTool extends Tool
{
    public function handle(Request $request): Response
    {
        if (! mcp_collection()) {
            return Response::text('No collection active. Call get_context(collection: "slug") to select one.');
        }

        return match ($request->get('action')) {
            'list' => $this->list(),
            'get' => $this->get($request),
            'create' => $this->create($request),
            'update' => $this->update($request),
            'append' => $this->append($request),
            'delete' => $this->delete($request),
            default => Response::error("Unknown action '{$request->get('action')}'. Use: list, get, create, update, append, delete."),
        };
    }

    private function list(): Response
    {
        $collection = app('mcp_collection');
        $skills = $collection->skills()
            ->where('is_active', true)
            ->get(['skills.id', 'name', 'description', 'slug']);

        $list = $skills->map(fn ($s) => "- **{$s->name}** (`{$s->slug}`): {$s->description}")->join("\n");

        return Response::text($list ?: 'No skills in this collection.');
    }

    private function get(Request $request): Response
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

    private function create(Request $request): Response
    {
        $workspace = app('current_workspace');
        $targetCollection = $request->get('target_collection');

        if ($targetCollection) {
            $token = app()->bound('mcp_token') ? app('mcp_token') : null;

            if (! $token || ! $token->isWorkspaceToken()) {
                return Response::error('Cross-collection operations require a workspace token.');
            }

            $collection = Collection::where('workspace_id', $workspace->id)
                ->where('slug', $targetCollection)
                ->first();

            if (! $collection) {
                return Response::error("Collection '{$targetCollection}' not found.");
            }
        } else {
            $collection = app('mcp_collection');
        }

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

    private function update(Request $request): Response
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

        $fields = [];
        if ($request->get('name')) {
            $fields['name'] = $request->get('name');
        }
        if ($request->get('description') !== null) {
            $fields['description'] = $request->get('description');
        }
        if ($request->get('content') !== null) {
            $fields['content'] = $request->get('content');
        }

        $skill->update($fields);

        return Response::text("Updated skill \"{$skill->name}\" (now v{$skill->version}).");
    }

    private function append(Request $request): Response
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

        $skill->update(['content' => $skill->content.$request->get('content')]);

        $length = mb_strlen($skill->content);

        return Response::text("Appended to \"{$skill->name}\" (now v{$skill->version}, {$length} chars total).");
    }

    private function delete(Request $request): Response
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

        $skill->update(['is_active' => false]);

        return Response::text("Deleted skill \"{$skill->name}\".");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'action' => $schema->string()->enum(['list', 'get', 'create', 'update', 'append', 'delete'])->description('The action to perform. Use append to add content in chunks.')->required(),
            'slug' => $schema->string()->description('Skill slug. Required for get/update.'),
            'name' => $schema->string()->description('Skill name. Required for create.'),
            'description' => $schema->string()->description('Trigger description — when should AI activate this skill? Required for create.'),
            'content' => $schema->string()->description('Full skill instructions in markdown. Required for create.'),
            'target_collection' => $schema->string()->description('Create in a different collection by slug (create only). Skips active collection context.'),
        ];
    }
}
