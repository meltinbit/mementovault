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
        Schema::create('system_document_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('system_document_id')->constrained()->cascadeOnDelete();
            $table->longText('content');
            $table->unsignedInteger('version');
            $table->string('created_by')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['system_document_id', 'version']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_document_revisions');
    }
};
