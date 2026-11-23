<?php

namespace Tequia\Catalog\Database\Seeders;

use Illuminate\Database\Seeder;
use Tequia\Catalog\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::firstOrCreate(['slug' => 'ruanas'], ['name' => 'Ruanas', 'is_active' => true]);
    }
}
