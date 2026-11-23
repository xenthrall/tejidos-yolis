<?php

namespace Tequia\Catalog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Tequia\Catalog\Models\Product;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return ['name' => fake()->words(3, true), 'slug' => fake()->unique()->slug(), 'status' => 'draft', 'is_unique' => true];
    }
}
