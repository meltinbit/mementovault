<?php

namespace App\Observers;

use App\Models\ContentLink;
use App\Services\MentionDetector;
use App\Services\WikilinkParser;
use Illuminate\Database\Eloquent\Model;

class ContentLinkObserver
{
    public function __construct(
        private WikilinkParser $wikilinkParser,
        private MentionDetector $mentionDetector,
    ) {}

    public function saved(Model $model): void
    {
        if (! $model->wasChanged('content') && ! $model->wasRecentlyCreated) {
            return;
        }

        $this->wikilinkParser->syncLinks($model);
        $this->mentionDetector->syncMentions($model);

        if ($model->wasRecentlyCreated) {
            $this->mentionDetector->syncReverseMentions($model);
        }
    }

    public function deleted(Model $model): void
    {
        $typeKey = ContentLink::typeKeyForModel($model);

        ContentLink::where(function ($q) use ($typeKey, $model) {
            $q->where('source_type', $typeKey)->where('source_id', $model->id);
        })
            ->orWhere(function ($q) use ($typeKey, $model) {
                $q->where('target_type', $typeKey)->where('target_id', $model->id);
            })
            ->delete();
    }
}
