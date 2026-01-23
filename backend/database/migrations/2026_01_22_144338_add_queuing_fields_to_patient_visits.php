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
        Schema::table('patient_visits', function (Blueprint $table) {
            $table->foreignUuid('current_department_id')->nullable()->after('doctor_id')->constrained('departments')->onDelete('set null');
            $table->enum('queue_status', ['waiting', 'active', 'finished', 'transferred', 'completed'])->default('waiting')->after('current_department_id');
            $table->enum('priority', ['low', 'normal', 'high', 'emergency'])->default('normal')->after('queue_status');
            $table->timestamp('queued_at')->nullable()->after('priority');
            
            $table->index(['current_department_id', 'queue_status']);
            $table->index('queued_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patient_visits', function (Blueprint $table) {
            $table->dropForeign(['current_department_id']);
            $table->dropColumn(['current_department_id', 'queue_status', 'priority', 'queued_at']);
        });
    }
};
