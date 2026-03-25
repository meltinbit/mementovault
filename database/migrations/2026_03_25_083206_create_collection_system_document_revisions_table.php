<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('collection_system_document_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collection_system_document_id')
                ->constrained('collection_system_documents', 'id', 'csd_revisions_csd_id_foreign')
                ->cascadeOnDelete();
            $table->longText('content');
            $table->unsignedInteger('version');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collection_system_document_revisions');
    }
};
