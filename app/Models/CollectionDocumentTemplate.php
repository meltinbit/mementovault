<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CollectionDocumentTemplate extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'placeholder',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }
}
