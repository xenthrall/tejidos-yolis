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
            throw ValidationException::withMessages(['gallery' => 'No se pudo guardar la fotografía. Revisa el almacenamiento.']);
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
            throw ValidationException::withMessages(['gallery' => 'No se pudo guardar la miniatura.']);
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

        $image = $this->orient($image, $contents);

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

    private function orient(\GdImage $image, string $contents): \GdImage
    {
        if (! function_exists('exif_read_data') || ! str_starts_with($contents, "\xFF\xD8")) {
            return $image;
        }
        $stream = fopen('php://temp', 'w+b');
        if ($stream === false) {
            return $image;
        }
        try {
            fwrite($stream, $contents);
            rewind($stream);
            $orientation = (int) ((@exif_read_data($stream))['Orientation'] ?? 1);
        } finally {
            fclose($stream);
        }
        if (in_array($orientation, [2, 5, 7], true)) {
            imageflip($image, IMG_FLIP_HORIZONTAL);
        } elseif ($orientation === 4) {
            imageflip($image, IMG_FLIP_VERTICAL);
        }
        $angle = match ($orientation) {
            3 => 180,
            5, 8 => 90,
            6, 7 => -90,
            default => 0,
        };
        if ($angle !== 0) {
            $rotated = imagerotate($image, $angle, 0);
            if ($rotated !== false) {
                imagedestroy($image);

                return $rotated;
            }
        }

        return $image;
    }
}
