<?php

namespace App\Models\Traits;

use App\Models\Collection;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

trait Collectable
{
    public function collections(): MorphToMany
    {
        return $this->morphToMany(Collection::class, 'collectable');
    }
}
