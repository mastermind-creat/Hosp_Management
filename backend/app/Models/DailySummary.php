<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DailySummary extends Model
{
    use HasUuids;

    protected $fillable = [
        'summary_date',
        'cash_amount',
        'card_amount',
        'mobile_money_amount',
        'insurance_amount',
        'bank_transfer_amount',
        'total_amount',
        'transaction_count',
        'generated_by',
    ];

    protected $casts = [
        'summary_date' => 'date',
    ];

    public function generator()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
