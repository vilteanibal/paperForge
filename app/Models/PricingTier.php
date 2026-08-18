<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\PricingTierFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingTier extends Model
{
    /** @use HasFactory<PricingTierFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'price',
        'billing_period',
        'features',
        'is_highlighted',
        'cta_label',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'features' => 'array',
            'is_highlighted' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
