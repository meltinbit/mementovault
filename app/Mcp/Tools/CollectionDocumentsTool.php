<?php

namespace App\Mcp\Tools;

use App\Models\CollectionDocument;
use App\Models\CollectionDocumentTemplate;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('collection_documents')]
#[Description('Manage collection documents (Instructions, Memory, Architecture, etc.) — these define how AI operates and are always in context. Actions: list, get, create, update, append, delete, reorder, list_templates. Use append to add content in chunks. Use collection_documents for essential project context that AI must ALWAYS know (brand, positioning, USP, architecture, workflows). Use regular documents (not collection_documents) for reference material only needed occasionally. Support [[slug]] wikilink syntax in content.')]
class CollectionDocumentsTool extends Tool
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
            'reorder' => $this->reorder($request),
            'list_templates' => $this->listTemplates(),
            default => Response::error("Unknown action '{$request->get('action')}'. Use: list, get, create, update, append, delete, reorder, list_templates."),
        };
    }

    private function list(): Response
    {
        $collection = app('mcp_collection');
        $docs = $collection->collectionDocuments()->get();

        $list = $docs->map(function ($doc) {
            $required = $doc->is_required ? ' [required]' : '';
            $preview = $doc->content ? ' — '.mb_substr(strip_tags($doc->content), 0, 80).'…' : '';

            return "- **{$doc->name}** (slug: `{$doc->slug}`, v{$doc->version}){$required}{$preview}";
        })->join("\n");

        return Response::text($list ?: 'No collection documents yet.');
    }

    private function get(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $doc = $collection->collectionDocuments()
            ->where('slug', $slug)
            ->first();

        if (! $doc) {
            return Response::error("Collection document with slug '{$slug}' not found.");
        }

        return Response::text("# {$doc->name}\n\n{$doc->content}");
    }

    private function create(Request $request): Response
    {
        $collection = app('mcp_collection');

        $name = $request->get('name');
        $content = $request->get('content') ?? '';

        if ($templateSlug = $request->get('template')) {
            $template = CollectionDocumentTemplate::where('slug', $templateSlug)->first();

            if (! $template) {
                return Response::error("Template with slug '{$templateSlug}' not found. Use action 'list_templates' to see available templates.");
            }

            $name = $name ?: $template->name;
            $content = $content ?: $template->placeholder;
        }

        if (! $name) {
            return Response::error('A name is required (either directly or via template).');
        }

        $maxOrder = $collection->collectionDocuments()->max('sort_order') ?? -1;

        $doc = CollectionDocument::create([
            'collection_id' => $collection->id,
            'name' => $name,
            'content' => $content,
            'sort_order' => $maxOrder + 1,
        ]);

        return Response::text("Created collection document \"{$doc->name}\" (slug: `{$doc->slug}`).");
    }

    private function update(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $doc = $collection->collectionDocuments()
            ->where('slug', $slug)
            ->first();

        if (! $doc) {
            return Response::error("Collection document with slug '{$slug}' not found.");
        }

        $fields = [];
        if ($request->get('name')) {
            $fields['name'] = $request->get('name');
        }
        if ($request->get('content') !== null) {
            $fields['content'] = $request->get('content');
        }

        $doc->update($fields);

        return Response::text("Updated collection document \"{$doc->name}\" (now v{$doc->version}).");
    }

    private function append(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $doc = $collection->collectionDocuments()
            ->where('slug', $slug)
            ->first();

        if (! $doc) {
            return Response::error("Collection document with slug '{$slug}' not found.");
        }

        $doc->update(['content' => $doc->content.$request->get('content')]);

        $length = mb_strlen($doc->content);

        return Response::text("Appended to \"{$doc->name}\" (now v{$doc->version}, {$length} chars total).");
    }

    private function delete(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $doc = $collection->collectionDocuments()
            ->where('slug', $slug)
            ->first();

        if (! $doc) {
            return Response::error("Collection document with slug '{$slug}' not found.");
        }

        if ($doc->is_required) {
            return Response::error("Cannot delete \"{$doc->name}\" — it is a required document.");
        }

        $name = $doc->name;
        $doc->delete();

        return Response::text("Deleted collection document \"{$name}\".");
    }

    private function reorder(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slugs = $request->get('slugs');

        foreach ($slugs as $index => $slug) {
            $collection->collectionDocuments()
                ->where('slug', $slug)
                ->update(['sort_order' => $index]);
        }

        return Response::text('Collection documents reordered successfully.');
    }

    private function listTemplates(): Response
    {
        $templates = CollectionDocumentTemplate::orderBy('sort_order')->get();

        $list = $templates->map(function ($t) {
            $desc = $t->description ? " — {$t->description}" : '';

            return "- **{$t->name}** (slug: `{$t->slug}`){$desc}";
        })->join("\n");

        return Response::text($list ?: 'No document templates available.');
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'action' => $schema->string()->enum(['list', 'get', 'create', 'update', 'append', 'delete', 'reorder', 'list_templates'])->description('The action to perform. Use append to add content in chunks to an existing document.')->required(),
            'slug' => $schema->string()->description('Document slug. Required for get/update/delete.'),
            'name' => $schema->string()->description('Document name. Required for create (unless using template).'),
            'content' => $schema->string()->description('Markdown content. For create/update. Keep under 4000 chars per call.'),
            'template' => $schema->string()->description('Template slug to pre-fill name and content (create only).'),
            'slugs' => $schema->array()->description('Ordered list of document slugs (reorder only).'),
        ];
    }
}
