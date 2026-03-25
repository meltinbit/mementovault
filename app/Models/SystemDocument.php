<?php

namespace App\Models;

use App\Models\Traits\BelongsToWorkspace;
use App\Models\Traits\HasRevisions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SystemDocument extends Model
{
    use BelongsToWorkspace, HasFactory, HasRevisions;

    protected $fillable = [
        'workspace_id',
        'type',
        'content',
        'version',
    ];

    protected $attributes = [
        'version' => 1,
    ];

    /** @var class-string */
    protected string $revisionModel = SystemDocumentRevision::class;

    /** @var string */
    protected string $revisionForeignKey = 'system_document_id';

    public function revisions(): HasMany
    {
        return $this->hasMany(SystemDocumentRevision::class);
    }
}
