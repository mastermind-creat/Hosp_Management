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
        Schema::create('clinical_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type'); // complaint, finding, diagnosis, plan
            $table->string('label'); // Short descriptive title
            $table->text('content'); // The actual template text
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinical_templates');
    }
};
