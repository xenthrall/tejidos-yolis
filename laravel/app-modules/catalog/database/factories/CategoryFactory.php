<?php

namespace Tequia\Catalog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Tequia\Catalog\Models\Category;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return ['name' => fake()->word(), 'slug' => fake()->unique()->slug(), 'is_active' => true];
    }
}
