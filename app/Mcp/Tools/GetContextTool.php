<?php

namespace App\Mcp\Tools;

use App\Services\ContextMergingService;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_context')]
#[Description('Returns the full merged context for this collection: identity, instructions, context, memory, and available content lists.')]
#[IsReadOnly]
class GetContextTool extends Tool
{
    public function handle(Request $request, ContextMergingService $service): Response
    {
        $collection = app('mcp_collection');

        return Response::text($service->merge($collection));
    }
}
