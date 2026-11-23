<?php

namespace Tequia\Catalog\Filament\Resources\Products\Pages;

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
use Tequia\Catalog\Filament\Resources\Products\ProductResource;
use Tequia\Catalog\Models\Category;
use Tequia\Catalog\Models\Product;

class ListProducts extends Page
{
    use HasCustomCatalogHeader;
    use WithPagination;

    protected static string $resource = ProductResource::class;

    protected static ?string $title = 'Productos';

    protected string $view = 'catalog::filament.products.index';

    #[Url(except: '')]
    public string $search = '';

    #[Url(except: '')]
    public string $status = '';

    #[Url(except: '')]
    public string $category = '';

    #[Url(except: '')]
    public string $availability = '';

    #[Url(except: 'recent')]
    public string $sort = 'recent';

    #[Session(key: 'catalog.products.view')]
    public string $viewMode = 'grid';

    public function mount(): void
    {
        Gate::authorize('viewAny', Product::class);
    }

    public function updated(string $property): void
    {
        if (in_array($property, ['search', 'status', 'category', 'availability', 'sort'], true)) {
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
        $this->reset('search', 'status', 'category', 'availability', 'sort');
        $this->resetPage();
    }

    public function archiveProductAction(): Action
    {
        return Action::make('archiveProduct')->label(fn (array $arguments): string => ($arguments['archived'] ?? false) ? 'Volver a borrador' : 'Archivar')
            ->icon('heroicon-o-archive-box')->color('gray')->requiresConfirmation()
            ->modalHeading(fn (array $arguments): string => ($arguments['archived'] ?? false) ? '¿Recuperar este producto?' : '¿Archivar este producto?')
            ->modalDescription('El producto se conservará en tu gestión y no aparecerá en el catálogo público.')
            ->action(function (array $arguments): void {
                $product = Product::findOrFail($arguments['product'] ?? 0);
                Gate::authorize('update', $product);
                $product->update(['status' => $product->status === ProductStatus::Archived ? ProductStatus::Draft : ProductStatus::Archived]);
                $this->resetPage();
                Notification::make()->success()->title('Producto actualizado')->send();
            });
    }

    protected function getViewData(): array
    {
        Gate::authorize('viewAny', Product::class);
        $query = Product::query()->with(['category', 'images', 'variants']);
        if (trim($this->search) !== '') {
            $search = '%'.mb_substr(trim($this->search), 0, 100).'%';
            $query->where(fn (Builder $query): Builder => $query->whereLike('name', $search)->orWhereHas('variants', fn (Builder $variants): Builder => $variants->whereLike('sku', $search)));
        }
        if (ProductStatus::tryFrom($this->status)) {
            $query->where('status', $this->status);
        }
        if (ctype_digit($this->category)) {
            $query->where('category_id', (int) $this->category);
        }
        if ($this->availability === 'available') {
            $query->available();
        } elseif ($this->availability === 'sold') {
            $query->whereDoesntHave('variants', fn (Builder $variant): Builder => $variant->where('is_active', true)->where('stock', '>', 0));
        }
        match ($this->sort) {
            'name' => $query->orderBy('name'),
            'updated' => $query->orderByDesc('updated_at'),
            default => $query->orderByDesc('created_at'),
        };
        $counts = Product::query()->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        return [
            'products' => $query->orderByDesc('id')->paginate(12),
            'categories' => Category::query()->orderBy('sort_order')->orderBy('name')->get(),
            'counts' => $counts, 'total' => $counts->sum(),
        ];
    }
}
