<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SkillMarketplaceController extends Controller
{
    public function index(): JsonResponse
    {
        $skills = Cache::remember('marketplace_skills', 3600, function () {
            // Fetch the repo tree to find all SKILL.md files
            $response = Http::get('https://api.github.com/repos/anthropics/skills/git/trees/main', [
                'recursive' => '1',
            ]);

            if (! $response->ok()) {
                return [];
            }

            $tree = $response->json('tree', []);
            $skills = [];

            foreach ($tree as $item) {
                if ($item['type'] === 'blob' && preg_match('#^skills/([^/]+)/SKILL\.md$#', $item['path'], $matches)) {
                    $skillSlug = $matches[1];

                    // Fetch the SKILL.md content
                    $contentResponse = Http::get("https://raw.githubusercontent.com/anthropics/skills/main/skills/{$skillSlug}/SKILL.md");

                    if (! $contentResponse->ok()) {
                        continue;
                    }

                    $content = $contentResponse->body();
                    $name = $skillSlug;
                    $description = '';

                    // Parse YAML frontmatter
                    if (preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)$/s', $content, $fmMatches)) {
                        $frontmatter = $fmMatches[1];
                        $body = $fmMatches[2];

                        if (preg_match('/^name:\s*(.+)$/m', $frontmatter, $nameMatch)) {
                            $name = trim($nameMatch[1]);
                        }
                        if (preg_match('/^description:\s*(.+)$/m', $frontmatter, $descMatch)) {
                            $description = trim($descMatch[1]);
                        }
                    } else {
                        $body = $content;
                    }

                    $skills[] = [
                        'slug' => $skillSlug,
                        'name' => $name,
                        'description' => $description,
                        'content' => $body,
                    ];
                }
            }

            return $skills;
        });

        // Check which are already installed
        $installedSlugs = Skill::pluck('slug')->toArray();

        $skills = array_map(function ($skill) use ($installedSlugs) {
            $skill['installed'] = in_array($skill['slug'], $installedSlugs);

            return $skill;
        }, $skills);

        return response()->json(['skills' => $skills]);
    }

    public function install(): RedirectResponse
    {
        $validated = request()->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'content' => ['required', 'string', 'max:65535'],
        ]);

        // Check if already installed
        if (Skill::where('slug', $validated['slug'])->exists()) {
            return back();
        }

        Skill::create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
            'description' => $validated['description'],
            'content' => $validated['content'],
            'is_active' => true,
        ]);

        return back();
    }

    public function fetchFromGithub(): JsonResponse
    {
        $validated = request()->validate([
            'url' => ['required', 'string', 'url'],
        ]);

        $url = $validated['url'];

        // Support various GitHub URL formats:
        // https://github.com/owner/repo
        // https://github.com/owner/repo/tree/main/path/to/skill
        // https://github.com/owner/repo/blob/main/SKILL.md
        if (! Str::contains($url, 'github.com')) {
            return response()->json(['error' => 'Only GitHub URLs are supported.'], 422);
        }

        // Extract owner/repo and optional path
        $parsed = parse_url($url);
        $pathParts = array_values(array_filter(explode('/', $parsed['path'] ?? '')));

        if (count($pathParts) < 2) {
            return response()->json(['error' => 'Invalid GitHub URL. Expected: github.com/owner/repo'], 422);
        }

        $owner = $pathParts[0];
        $repo = $pathParts[1];
        $branch = 'main';
        $subPath = '';

        // Extract branch and subpath if present (tree/main/path or blob/main/path)
        if (count($pathParts) >= 4 && in_array($pathParts[2], ['tree', 'blob'])) {
            $branch = $pathParts[3];
            $subPath = implode('/', array_slice($pathParts, 4));
        }

        // Try to find SKILL.md
        $skillMdPath = $subPath ? "{$subPath}/SKILL.md" : 'SKILL.md';
        $rawUrl = "https://raw.githubusercontent.com/{$owner}/{$repo}/{$branch}/{$skillMdPath}";

        $response = Http::timeout(10)->get($rawUrl);

        // If no SKILL.md at root/subpath, try README.md as fallback
        if (! $response->ok()) {
            $readmePath = $subPath ? "{$subPath}/README.md" : 'README.md';
            $rawUrl = "https://raw.githubusercontent.com/{$owner}/{$repo}/{$branch}/{$readmePath}";
            $response = Http::timeout(10)->get($rawUrl);
        }

        if (! $response->ok()) {
            return response()->json(['error' => 'Could not find SKILL.md or README.md in this repository.'], 404);
        }

        $content = $response->body();
        $name = $repo;
        $description = '';

        // Parse YAML frontmatter
        if (preg_match('/^---\s*\n(.*?)\n---\s*\n(.*)$/s', $content, $fmMatches)) {
            $frontmatter = $fmMatches[1];
            $body = $fmMatches[2];

            if (preg_match('/^name:\s*(.+)$/m', $frontmatter, $nameMatch)) {
                $name = trim($nameMatch[1]);
            }
            if (preg_match('/^description:\s*(.+)$/m', $frontmatter, $descMatch)) {
                $description = trim($descMatch[1]);
            }
        } else {
            $body = $content;
        }

        $slug = Str::slug($name);

        return response()->json([
            'skill' => [
                'slug' => $slug,
                'name' => $name,
                'description' => $description,
                'content' => $body,
                'source' => "github.com/{$owner}/{$repo}",
                'installed' => Skill::where('slug', $slug)->exists(),
            ],
        ]);
    }
}
