<?php

namespace App\Providers;

use App\Listeners\CreateWorkspaceOnRegistration;
use App\Models\Asset;
use App\Models\Collection;
use App\Models\CollectionSystemDocument;
use App\Models\Document;
use App\Models\Skill;
use App\Models\Snippet;
use App\Models\SystemDocument;
use App\Observers\ActivityLogObserver;
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
    }
}
