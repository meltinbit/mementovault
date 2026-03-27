<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collection_document_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collection_document_id')->constrained()->cascadeOnDelete();
            $table->longText('content');
            $table->unsignedInteger('version');
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_document_revisions');
    }
};
