<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collection_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collection_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->longText('content')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_required')->default(false);
            $table->unsignedInteger('version')->default(1);
            $table->timestamps();

            $table->index(['collection_id', 'sort_order']);
            $table->unique(['collection_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_documents');
    }
};
