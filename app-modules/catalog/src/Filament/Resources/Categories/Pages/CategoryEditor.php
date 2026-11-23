<?php

namespace Tequia\Catalog\Filament\Resources\Categories\Pages;

use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Locked;
use Tequia\Catalog\Enums\ProductStatus;
use Tequia\Catalog\Filament\Concerns\HasCustomCatalogHeader;
use Tequia\Catalog\Filament\Resources\Categories\CategoryResource;
use Tequia\Catalog\Models\Category;
use Throwable;

abstract class CategoryEditor extends Page
{
    use HasCustomCatalogHeader;

    protected static string $resource = CategoryResource::class;

    protected string $view = 'catalog::filament.categories.editor';

    #[Locked]
    public ?int $categoryId = null;

    public string $name = '';

    public string $categorySlug = '';

    public string $description = '';

    public string $sortOrder = '0';

    public bool $isActive = true;

    public bool $hasUnsavedChanges = false;

    protected function initializeEditor(?Category $category = null): void
    {
        if (! $category) {
            $this->sortOrder = (string) min(2147483647, ((int) Category::max('sort_order')) + 10);

            return;
        }
        $this->categoryId = $category->id;
        $this->name = $category->name;
        $this->categorySlug = $category->slug;
        $this->description = $category->description ?? '';
        $this->sortOrder = (string) $category->sort_order;
        $this->isActive = $category->is_active;
    }

    public function updated(string $property): void
    {
        if (in_array($property, ['name', 'categorySlug', 'description', 'sortOrder', 'isActive'], true)) {
            $this->hasUnsavedChanges = true;
            $this->resetValidation($property);
        }
    }

    public function save(): void
    {
        $this->authorizeEditor();
        $automaticSlug = trim($this->categorySlug) === '';
        try {
            DB::transaction(function (): void {
                $category = $this->categoryId ? Category::query()->lockForUpdate()->findOrFail($this->categoryId) : new Category;
                Gate::authorize($category->exists ? 'update' : 'create', $category->exists ? $category : Category::class);
                $this->name = trim($this->name);
                $this->categorySlug = trim($this->categorySlug);
                if ($this->categorySlug === '') {
                    $base = Str::slug($this->name) ?: 'categoria';
                    $slug = $base;
                    $suffix = 2;
                    while (Category::where('slug', $slug)->when($category->exists, fn ($query) => $query->whereKeyNot($category->id))->exists()) {
                        $slug = $base.'-'.$suffix++;
                    }
                    $this->categorySlug = $slug;
                }
                $data = $this->validate([
                    'name' => ['required', 'string', 'max:120'],
                    'description' => ['nullable', 'string', 'max:3000'],
                    'categorySlug' => ['required', 'string', 'max:160', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('catalog_categories', 'slug')->ignore($category->id)],
                    'sortOrder' => ['required', 'integer', 'min:0', 'max:2147483647'],
                    'isActive' => ['boolean'],
                ], [
                    'name.required' => 'Escribe el nombre de la categoría.',
                    'name.max' => 'El nombre puede tener hasta 120 caracteres.',
                    'description.max' => 'La descripción puede tener hasta 3000 caracteres.',
                    'categorySlug.unique' => 'Esta dirección ya está en uso. Elige otra.',
                    'categorySlug.regex' => 'Usa letras minúsculas, números y guiones en la dirección.',
                    'categorySlug.max' => 'La dirección puede tener hasta 160 caracteres.',
                    'sortOrder.required' => 'Indica la posición de la categoría.',
                    'sortOrder.integer' => 'La posición debe ser un número entero.',
                    'sortOrder.min' => 'La posición no puede ser negativa.',
                    'sortOrder.max' => 'La posición indicada es demasiado grande.',
                ]);
                $category->fill([
                    'name' => $data['name'], 'description' => trim($data['description'] ?? '') ?: null,
                    'slug' => $data['categorySlug'], 'sort_order' => (int) $data['sortOrder'], 'is_active' => $data['isActive'],
                ])->save();
            });
            Notification::make()->success()->title($this->categoryId ? 'Categoría actualizada' : 'Categoría creada')->send();
            $this->redirect(CategoryResource::getUrl('index'));
        } catch (ValidationException $exception) {
            if ($automaticSlug) {
                $this->categorySlug = '';
            }
            $this->dispatch('catalog-category-invalid', editorId: $this->getId(), openOptions: $exception->validator->errors()->hasAny(['sortOrder', 'categorySlug']));
            throw $exception;
        } catch (Throwable $exception) {
            if ($automaticSlug) {
                $this->categorySlug = '';
            }
            report($exception);
            $this->addError('save', 'No se pudo guardar la categoría. Tus cambios siguen aquí; inténtalo de nuevo.');
            $this->dispatch('catalog-category-invalid', editorId: $this->getId());
        }
    }

    protected function authorizeEditor(): void
    {
        Gate::authorize($this->categoryId ? 'update' : 'create', $this->categoryId ? Category::findOrFail($this->categoryId) : Category::class);
    }

    protected function getViewData(): array
    {
        $this->authorizeEditor();
        $category = $this->categoryId ? Category::withCount([
            'products', 'products as published_products_count' => fn ($query) => $query->where('status', ProductStatus::Published),
        ])->findOrFail($this->categoryId) : null;

        return ['categorySummary' => $category];
    }
}
