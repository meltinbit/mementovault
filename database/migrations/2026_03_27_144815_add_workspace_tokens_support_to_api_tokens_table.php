<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('api_tokens', function (Blueprint $table) {
            // Make collection_id nullable for workspace tokens
            $table->foreignId('workspace_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
            $table->foreignId('active_collection_id')->nullable()->after('workspace_id')->constrained('collections')->nullOnDelete();
        });

        // Make collection_id nullable (was NOT NULL)
        Schema::table('api_tokens', function (Blueprint $table) {
            $table->unsignedBigInteger('collection_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('api_tokens', function (Blueprint $table) {
            $table->dropConstrainedForeignId('active_collection_id');
            $table->dropConstrainedForeignId('workspace_id');
        });

        Schema::table('api_tokens', function (Blueprint $table) {
            $table->unsignedBigInteger('collection_id')->nullable(false)->change();
        });
    }
};
