<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 160)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestampsTz();
        });

        Schema::create('catalog_products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('catalog_categories')->restrictOnDelete();
            $table->string('name', 180);
            $table->string('slug', 200)->unique();
            $table->text('description')->nullable();
            $table->json('characteristics')->nullable();
            $table->string('status', 20)->default('draft');
            $table->boolean('is_unique')->default(true);
            $table->boolean('has_variants')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->timestampTz('published_at')->nullable();
            $table->timestampsTz();
            $table->index(['status', 'published_at']);
            $table->index('category_id');
        });

        Schema::create('catalog_product_variants', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained('catalog_products')->cascadeOnDelete();
            $table->string('name', 120)->default('Presentación única');
            $table->string('sku', 100)->unique();
            $table->json('attributes')->nullable();
            $table->decimal('price', 14, 2);
            $table->char('currency', 3)->default('COP');
            $table->unsignedInteger('stock')->default(1);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestampsTz();
            $table->index(['product_id', 'is_active', 'sort_order']);
        });

        Schema::create('catalog_product_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained('catalog_products')->cascadeOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('catalog_product_variants')->nullOnDelete();
            $table->string('disk', 80);
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->string('alt', 250)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestampsTz();
            $table->index(['product_id', 'sort_order']);
            $table->index('variant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog_product_images');
        Schema::dropIfExists('catalog_product_variants');
        Schema::dropIfExists('catalog_products');
        Schema::dropIfExists('catalog_categories');
    }
};
