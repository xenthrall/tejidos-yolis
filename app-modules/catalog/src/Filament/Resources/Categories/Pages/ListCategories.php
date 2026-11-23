<?php

namespace Tequia\Catalog\Filament\Resources\Categories\Pages;

use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Gate;
use Livewire\Attributes\Session;
use Livewire\Attributes\Url;
use Livewire\WithPagination;
use Tequia\Catalog\Enums\ProductStatus;
use Tequia\Catalog\Filament\Concerns\HasCustomCatalogHeader;
use Tequia\Catalog\Filament\Resources\Categories\CategoryResource;
use Tequia\Catalog\Models\Category;

class ListCategories extends Page
{
    use HasCustomCatalogHeader;
    use WithPagination;

    protected static string $resource = CategoryResource::class;

    protected static ?string $title = 'Categorías';

    protected string $view = 'catalog::filament.categories.index';

    #[Url(except: '')]
    public string $search = '';

    #[Url(except: '')]
    public string $visibility = '';

    #[Url(except: 'position')]
    public string $sort = 'position';

    #[Session(key: 'catalog.categories.view')]
    public string $viewMode = 'grid';

    public function mount(): void
    {
        Gate::authorize('viewAny', Category::class);
    }

    public function updated(string $property): void
    {
        if (in_array($property, ['search', 'visibility', 'sort'], true)) {
            $this->resetPage();
        }
    }

    public function setViewMode(string $mode): void
    {
        if (in_array($mode, ['grid', 'list'], true)) {
            $this->viewMode = $mode;
        }
    }

    public function clearFilters(): void
    {
        $this->reset('search', 'visibility', 'sort');
        $this->resetPage();
    }

    public function toggleVisibilityAction(): Action
    {
        return Action::make('toggleVisibility')
            ->label(fn (array $arguments): string => ($arguments['active'] ?? true) ? 'Ocultar categoría' : 'Mostrar categoría')
            ->icon(fn (array $arguments): string => ($arguments['active'] ?? true) ? 'heroicon-o-eye-slash' : 'heroicon-o-eye')
            ->color('gray')->requiresConfirmation()
            ->modalHeading(fn (array $arguments): string => ($arguments['active'] ?? true) ? '¿Ocultar esta categoría?' : '¿Mostrar esta categoría?')
            ->modalDescription(fn (array $arguments): string => ($arguments['active'] ?? true)
                ? 'Sus productos dejarán de mostrarse en el catálogo público. Todo se conservará en tu gestión.'
                : 'La categoría volverá a estar visible. Sus productos publicados y con presentaciones activas podrán mostrarse en el catálogo.')
            ->action(function (array $arguments): void {
                $category = Category::findOrFail($arguments['category'] ?? 0);
                Gate::authorize('update', $category);
                $category->update(['is_active' => ! $category->is_active]);
                $this->resetPage();
                Notification::make()->success()->title($category->is_active ? 'Categoría visible' : 'Categoría oculta')->send();
            });
    }

    protected function getViewData(): array
    {
        Gate::authorize('viewAny', Category::class);
        $query = Category::query()->withCount([
            'products',
            'products as published_products_count' => fn (Builder $query): Builder => $query->where('status', ProductStatus::Published),
        ]);
        if (trim($this->search) !== '') {
            $search = '%'.mb_substr(trim($this->search), 0, 100).'%';
            $query->where(fn (Builder $query): Builder => $query->whereLike('name', $search)->orWhereLike('description', $search));
        }
        if (in_array($this->visibility, ['visible', 'hidden'], true)) {
            $query->where('is_active', $this->visibility === 'visible');
        }
        match ($this->sort) {
            'name' => $query->orderBy('name'),
            'products' => $query->orderByDesc('products_count')->orderBy('name'),
            'recent' => $query->orderByDesc('created_at'),
            default => $query->orderBy('sort_order')->orderBy('name'),
        };
        $total = Category::query()->count();
        $visible = Category::query()->where('is_active', true)->count();

        return ['categories' => $query->orderBy('id')->paginate(12), 'total' => $total, 'visible' => $visible, 'hidden' => $total - $visible];
    }
}
