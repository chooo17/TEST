<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'store_id',
        'sku',
        'name',
        'description',
        'cost_price',
        'selling_price',
        'stock',
        'unit',
        'image',
        'is_active',
    ];

    protected $appends = ['available_stock'];

    protected $casts = [
        'cost_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }

    public function recipe()
    {
        return $this->hasOne(Recipe::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function getAvailableStockAttribute()
    {
        if (
            !$this->relationLoaded('recipe') ||
            !$this->recipe
        ) {
            return $this->stock ?? 0;
        }

        if (
            !$this->recipe->relationLoaded('items') ||
            $this->recipe->items->isEmpty()
        ) {
            return $this->stock ?? 0;
        }

        $stocks = [];

        foreach ($this->recipe->items as $item) {
            if (
                !$item->relationLoaded('material') ||
                !$item->material
            ) {
                continue;
            }

            if ($item->qty <= 0) {
                continue;
            }

            $stocks[] = floor(
                $item->material->stock / $item->qty
            );
        }

        return count($stocks)
            ? min($stocks)
            : 0;
    }
}