<?php

namespace App\Services;

use Illuminate\Support\Str;

class WebpOptimizer
{
    /**
     * Convert an image file path to WebP format if GD / Imagick is available.
     * Returns the relative path to the converted WebP image or original path on fallback.
     */
    public static function convertToWebp($imagePath, $quality = 82)
    {
        if (empty($imagePath)) {
            return $imagePath;
        }

        $fullPath = public_path(ltrim($imagePath, '/'));
        if (!file_exists($fullPath) || is_dir($fullPath)) {
            return $imagePath;
        }

        $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
        if ($ext === 'webp' || $ext === 'svg' || $ext === 'gif') {
            return $imagePath;
        }

        $webpPath = pathinfo($fullPath, PATHINFO_DIRNAME) . '/' . pathinfo($fullPath, PATHINFO_FILENAME) . '.webp';
        $relativeWebp = str_replace(public_path(), '', $webpPath);

        // If WebP version already exists and is newer than original, return it
        if (file_exists($webpPath) && filemtime($webpPath) >= filemtime($fullPath)) {
            return ltrim($relativeWebp, '/');
        }

        try {
            if (function_exists('imagecreatefromjpeg') && ($ext === 'jpg' || $ext === 'jpeg')) {
                $image = @imagecreatefromjpeg($fullPath);
            } elseif (function_exists('imagecreatefrompng') && $ext === 'png') {
                $image = @imagecreatefrompng($fullPath);
                if ($image) {
                    imagepalettetotruecolor($image);
                    imagealphablending($image, true);
                    imagesavealpha($image, true);
                }
            } else {
                return $imagePath;
            }

            if ($image && function_exists('imagewebp')) {
                imagewebp($image, $webpPath, $quality);
                imagedestroy($image);
                return ltrim($relativeWebp, '/');
            }
        } catch (\Exception $e) {
            // Fallback to original image if conversion fails
        }

        return $imagePath;
    }

    /**
     * Render an SEO-optimized <img> or <picture> tag with lazy loading and width/height dimensions.
     */
    public static function renderOptimizedImage($src, $alt = '', $class = '', $width = null, $height = null, $attributes = '')
    {
        if (empty($src)) return '';

        $webpSrc = self::convertToWebp($src);
        $fullSrcUrl = asset($src);
        $fullWebpUrl = asset($webpSrc);

        $widthAttr = $width ? 'width="' . (int)$width . '"' : '';
        $heightAttr = $height ? 'height="' . (int)$height . '"' : '';

        return '<picture>
            <source srcset="' . e($fullWebpUrl) . '" type="image/webp">
            <img src="' . e($fullSrcUrl) . '" alt="' . e($alt) . '" title="' . e($alt) . '" class="' . e($class) . '" loading="lazy" decoding="async" ' . $widthAttr . ' ' . $heightAttr . ' ' . $attributes . '>
        </picture>';
    }
}
