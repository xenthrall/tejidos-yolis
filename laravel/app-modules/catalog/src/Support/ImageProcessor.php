<?php

namespace Tequia\Catalog\Support;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class ImageProcessor
{
    public function store(TemporaryUploadedFile $file): string
    {
        $disk = config('catalog.disk');
        $contents = $file->get();
        $optimized = $this->resize($contents, config('catalog.image_width'));
        $path = 'catalog/products/'.Str::ulid().'.'.($optimized !== null ? 'webp' : $file->guessExtension());
        if (! Storage::disk($disk)->put($path, $optimized ?? $contents)) {
            throw ValidationException::withMessages(['data.images' => 'No se pudo guardar la fotografía. Revisa el almacenamiento.']);
        }

        return $path;
    }

    public function thumbnail(string $path, string $disk): ?string
    {
        $thumbnail = $this->resize(Storage::disk($disk)->get($path), config('catalog.thumbnail_width'));

        if ($thumbnail === null) {
            return null;
        }

        $target = 'catalog/thumbnails/'.Str::ulid().'.webp';
        if (! Storage::disk($disk)->put($target, $thumbnail)) {
            throw ValidationException::withMessages(['data.images' => 'No se pudo guardar la miniatura.']);
        }

        return $target;
    }

    private function resize(string $contents, int $maxWidth): ?string
    {
        if (! function_exists('imagecreatefromstring') || ! function_exists('imagewebp')) {
            return null;
        }

        $image = @imagecreatefromstring($contents);

        if ($image === false) {
            return null;
        }

        $size = min($maxWidth / imagesx($image), $maxWidth / imagesy($image), 1);
        $target = imagecreatetruecolor(max(1, (int) round(imagesx($image) * $size)), max(1, (int) round(imagesy($image) * $size)));
        imagealphablending($target, false);
        imagesavealpha($target, true);
        imagecopyresampled($target, $image, 0, 0, 0, 0, imagesx($target), imagesy($target), imagesx($image), imagesy($image));
        ob_start();
        imagewebp($target, null, 84);
        $result = ob_get_clean();
        imagedestroy($image);
        imagedestroy($target);

        return $result ?: null;
    }
}
