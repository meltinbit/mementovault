<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSkillRequest;
use App\Http\Requests\UpdateSkillRequest;
use App\Models\Skill;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SkillController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Skill::with('tags');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($tagId = $request->input('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $tagId));
        }

        return Inertia::render('skills/index', [
            'skills' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'tag']),
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('skills/create', [
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function store(StoreSkillRequest $request): RedirectResponse
    {
        $skill = Skill::create($request->safe()->except('tag_ids'));

        if ($request->has('tag_ids')) {
            $skill->tags()->sync($request->validated('tag_ids', []));
        }

        return to_route('skills.edit', $skill);
    }

    public function edit(Skill $skill): Response
    {
        $skill->load('tags');

        $revisions = $skill->revisions()
            ->latest('version')
            ->limit(20)
            ->get()
            ->map(fn ($revision) => [
                'id' => $revision->id,
                'content' => $revision->content,
                'version' => $revision->version,
                'created_by' => null,
                'created_at' => $revision->created_at->diffForHumans(),
            ]);

        return Inertia::render('skills/edit', [
            'skill' => $skill,
            'revisions' => $revisions,
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function update(UpdateSkillRequest $request, Skill $skill): RedirectResponse
    {
        $skill->update($request->safe()->except('tag_ids'));

        if ($request->has('tag_ids')) {
            $skill->tags()->sync($request->validated('tag_ids', []));
        }

        return back();
    }

    public function destroy(Skill $skill): RedirectResponse
    {
        $skill->delete();

        return to_route('skills.index');
    }
}
