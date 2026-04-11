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
        Schema::create('content_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();

            $table->string('source_type', 50);
            $table->unsignedBigInteger('source_id');

            $table->string('target_type', 50);
            $table->unsignedBigInteger('target_id');

            $table->string('link_type', 20)->default('wikilink');

            $table->timestamp('created_at')->useCurrent();

            $table->unique(['source_type', 'source_id', 'target_type', 'target_id', 'link_type'], 'unique_content_link');
            $table->index(['source_type', 'source_id']);
            $table->index(['target_type', 'target_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('content_links');
    }
};
