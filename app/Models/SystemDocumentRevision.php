<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemDocumentRevision extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'system_document_id',
        'content',
        'version',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $model) {
            $model->created_at = $model->created_at ?? now();
        });
    }

    public function systemDocument(): BelongsTo
    {
        return $this->belongsTo(SystemDocument::class);
    }
}
