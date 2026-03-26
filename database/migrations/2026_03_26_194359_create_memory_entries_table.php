<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memory_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->text('content');
            $table->string('category', 100)->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_archived')->default(false);
            $table->timestamps();

            $table->index(['workspace_id', 'is_archived']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memory_entries');
    }
};
