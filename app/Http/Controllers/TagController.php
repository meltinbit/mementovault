<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTagRequest;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('tags/index', [
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    private const TAG_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#06b6d4'];

    public function store(StoreTagRequest $request): RedirectResponse|JsonResponse
    {
        $data = $request->validated();
        if (empty($data['color'])) {
            $data['color'] = self::TAG_COLORS[array_rand(self::TAG_COLORS)];
        }

        $tag = Tag::create($data);

        if ($request->wantsJson()) {
            return response()->json(['tag' => $tag]);
        }

        return back();
    }

    public function destroy(Tag $tag): RedirectResponse
    {
        $tag->delete();

        return back();
    }
}
