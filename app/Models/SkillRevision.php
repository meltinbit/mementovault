<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SkillRevision extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'skill_id',
        'content',
        'version',
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

    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }
}
