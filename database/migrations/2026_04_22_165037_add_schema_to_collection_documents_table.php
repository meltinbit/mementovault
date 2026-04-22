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
        Schema::table('collection_documents', function (Blueprint $table) {
            $table->json('schema')->nullable()->after('content');
        });
    }

    public function down(): void
    {
        Schema::table('collection_documents', function (Blueprint $table) {
            $table->dropColumn('schema');
        });
    }
};
