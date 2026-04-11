<?php

namespace App\Console\Commands;

use App\Models\CollectionDocument;
use App\Models\ContentLink;
use App\Models\Document;
use App\Models\MemoryEntry;
use App\Models\Skill;
use App\Models\Snippet;
use App\Models\Workspace;
use App\Services\MentionDetector;
use App\Services\WikilinkParser;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\LazyCollection;

class SyncWikilinksCommand extends Command
{
    protected $signature = 'wikilinks:sync
        {--workspace= : Workspace ID to sync}
        {--all : Sync all workspaces}
        {--mentions : Only run mention detection}
        {--wikilinks-only : Only run wikilink parsing}';

    protected $description = 'Scan content and sync wikilinks and mentions to the content_links table';

    public function handle(WikilinkParser $wikilinkParser, MentionDetector $mentionDetector): int
    {
        $doWikilinks = ! $this->option('mentions');
        $doMentions = ! $this->option('wikilinks-only');

        $workspaces = $this->getWorkspaces();

        if ($workspaces->isEmpty()) {
            $this->error('No workspaces found.');

            return self::FAILURE;
        }

        foreach ($workspaces as $workspace) {
            $this->info("Workspace \"{$workspace->name}\" — scanning...");

            // Flush existing links for this workspace based on flags
            $deleteQuery = ContentLink::withoutGlobalScopes()
                ->where('workspace_id', $workspace->id);

            if ($this->option('mentions')) {
                $deleteQuery->where('link_type', 'mention');
            } elseif ($this->option('wikilinks-only')) {
                $deleteQuery->where('link_type', 'wikilink');
            }

            $deleteQuery->delete();

            $models = $this->getLinkableModels($workspace);

            $totals = ['scanned' => 0, 'wikilinks' => 0, 'mentions' => 0];

            foreach ($models as $label => $items) {
                $scanned = 0;
                $wikilinks = 0;
                $mentions = 0;

                foreach ($items as $item) {
                    if (empty($item->content)) {
                        continue;
                    }

                    $scanned++;

                    if ($doWikilinks) {
                        $before = ContentLink::withoutGlobalScopes()
                            ->where('source_type', ContentLink::typeKeyForModel($item))
                            ->where('source_id', $item->id)
                            ->where('link_type', 'wikilink')
                            ->count();

                        $wikilinkParser->syncLinks($item);

                        $after = ContentLink::withoutGlobalScopes()
                            ->where('source_type', ContentLink::typeKeyForModel($item))
                            ->where('source_id', $item->id)
                            ->where('link_type', 'wikilink')
                            ->count();

                        $wikilinks += $after - $before;
                    }

                    if ($doMentions) {
                        $before = ContentLink::withoutGlobalScopes()
                            ->where('source_type', ContentLink::typeKeyForModel($item))
                            ->where('source_id', $item->id)
                            ->where('link_type', 'mention')
                            ->count();

                        $mentionDetector->syncMentions($item);

                        $after = ContentLink::withoutGlobalScopes()
                            ->where('source_type', ContentLink::typeKeyForModel($item))
                            ->where('source_id', $item->id)
                            ->where('link_type', 'mention')
                            ->count();

                        $mentions += $after - $before;
                    }
                }

                $parts = ["{$label}: {$scanned} scanned"];
                if ($doWikilinks) {
                    $parts[] = "{$wikilinks} wikilinks found";
                }
                if ($doMentions) {
                    $parts[] = "{$mentions} mentions found";
                }

                $this->line('  '.implode(', ', $parts));

                $totals['scanned'] += $scanned;
                $totals['wikilinks'] += $wikilinks;
                $totals['mentions'] += $mentions;
            }

            $totalParts = ["Total: {$totals['scanned']} content items"];
            if ($doWikilinks) {
                $totalParts[] = "{$totals['wikilinks']} wikilinks";
            }
            if ($doMentions) {
                $totalParts[] = "{$totals['mentions']} mentions";
            }

            $this->info('  '.implode(', ', $totalParts));
            $this->newLine();
        }

        $this->info('Done.');

        return self::SUCCESS;
    }

    private function getWorkspaces()
    {
        if ($this->option('all')) {
            return Workspace::all();
        }

        if ($workspaceId = $this->option('workspace')) {
            $workspace = Workspace::find($workspaceId);

            return $workspace ? collect([$workspace]) : collect();
        }

        return Workspace::all();
    }

    /**
     * @return array<string, LazyCollection>
     */
    private function getLinkableModels(Workspace $workspace): array
    {
        $collectionIds = DB::table('collections')
            ->where('workspace_id', $workspace->id)
            ->pluck('id');

        return [
            'Documents' => Document::withoutGlobalScopes()
                ->where('workspace_id', $workspace->id)
                ->cursor(),
            'Collection Documents' => CollectionDocument::whereIn('collection_id', $collectionIds)
                ->cursor(),
            'Skills' => Skill::withoutGlobalScopes()
                ->where('workspace_id', $workspace->id)
                ->cursor(),
            'Snippets' => Snippet::withoutGlobalScopes()
                ->where('workspace_id', $workspace->id)
                ->cursor(),
            'Memories' => MemoryEntry::withoutGlobalScopes()
                ->where('workspace_id', $workspace->id)
                ->cursor(),
        ];
    }
}
