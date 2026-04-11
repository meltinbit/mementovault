<?php

namespace App\Providers;

use App\Listeners\CreateWorkspaceOnRegistration;
use App\Models\Asset;
use App\Models\AssetFolder;
use App\Models\Collection;
use App\Models\CollectionDocument;
use App\Models\CollectionMemoryEntry;
use App\Models\CollectionSystemDocument;
use App\Models\Document;
use App\Models\MemoryEntry;
use App\Models\Skill;
use App\Models\Snippet;
use App\Models\SystemDocument;
use App\Observers\ActivityLogObserver;
use App\Observers\ContentLinkObserver;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
        Event::listen(Registered::class, CreateWorkspaceOnRegistration::class);

        Document::observe(ActivityLogObserver::class);
        Skill::observe(ActivityLogObserver::class);
        Snippet::observe(ActivityLogObserver::class);
        Asset::observe(ActivityLogObserver::class);
        Collection::observe(ActivityLogObserver::class);
        SystemDocument::observe(ActivityLogObserver::class);
        CollectionSystemDocument::observe(ActivityLogObserver::class);
        AssetFolder::observe(ActivityLogObserver::class);

        // Content link observers (wikilinks + mentions)
        Document::observe(ContentLinkObserver::class);
        Skill::observe(ContentLinkObserver::class);
        Snippet::observe(ContentLinkObserver::class);
        CollectionDocument::observe(ContentLinkObserver::class);
        MemoryEntry::observe(ContentLinkObserver::class);
        CollectionMemoryEntry::observe(ContentLinkObserver::class);
    }
}
