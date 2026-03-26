<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\Workspace;
use Illuminate\Support\Collection as BaseCollection;

class MemoryContextBuilder
{
    public function build(Workspace $workspace, ?Collection $collection = null): string
    {
        $maxEntries = $workspace->settings['memory_max_entries'] ?? 50;

        $pinned = $workspace->memoryEntries()
            ->pinned()
            ->orderByDesc('created_at')
            ->get();

        $regular = $workspace->memoryEntries()
            ->active()
            ->where('is_pinned', false)
            ->orderByDesc('created_at')
            ->limit($maxEntries)
            ->get();

        $lines = $this->formatEntries($pinned, $regular);

        if ($collection) {
            $collectionMax = $workspace->settings['collection_memory_max_entries'] ?? 20;

            $collectionPinned = $collection->collectionMemoryEntries()
                ->pinned()
                ->orderByDesc('created_at')
                ->get();

            $collectionRegular = $collection->collectionMemoryEntries()
                ->active()
                ->where('is_pinned', false)
                ->orderByDesc('created_at')
                ->limit($collectionMax)
                ->get();

            $collectionLines = $this->formatEntries($collectionPinned, $collectionRegular);

            if ($collectionLines) {
                $lines .= ($lines ? "\n\n" : '')."### {$collection->name} Memory\n\n".$collectionLines;
            }
        }

        return $lines;
    }

    private function formatEntries(BaseCollection $pinned, BaseCollection $regular): string
    {
        if ($pinned->isEmpty() && $regular->isEmpty()) {
            return '';
        }

        $lines = [];

        foreach ($pinned as $entry) {
            $cat = $entry->category ? "[{$entry->category}] " : '';
            $lines[] = "- 📌 {$cat}{$entry->content}";
        }

        foreach ($regular as $entry) {
            $cat = $entry->category ? "[{$entry->category}] " : '';
            $date = $entry->created_at->format('Y-m-d');
            $lines[] = "- {$cat}{$entry->content} ({$date})";
        }

        return implode("\n", $lines);
    }
}
