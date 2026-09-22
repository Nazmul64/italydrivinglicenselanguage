<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;

class ImageHelper
{
    /**
     * Optimize, resize, compress and save image as WebP.
     *
     * @param UploadedFile $file
     * @param string $destinationPath Relative to public_path()
     * @param string $prefix
     * @param int $maxWidth
     * @param int $quality
     * @return string|null The public URL path of the saved file
     */
    public static function uploadAndOptimize(UploadedFile $file, $destinationPath, $prefix = 'img', $maxWidth = 1200, $quality = 80)
    {
        $extension = '';
        try {
            $extension = strtolower($file->getClientOriginalExtension() ?: '');
        } catch (\Throwable $e) {}

        if (empty($extension)) {
            try {
                if (extension_loaded('fileinfo') || function_exists('finfo_open')) {
                    $extension = strtolower($file->guessExtension() ?: '');
                }
            } catch (\Throwable $e) {}
        }

        if (empty($extension)) {
            $extension = 'jpg';
        }

        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'jfif', 'pjp', 'pjpeg', 'tif', 'tiff', 'bmp', 'avif', 'ico'];
        
        if (!in_array($extension, $allowedExtensions)) {
            // Safely check if mime type is an image
            try {
                if (extension_loaded('fileinfo') || function_exists('finfo_open')) {
                    $mime = $file->getMimeType();
                    if (!$mime || !str_starts_with($mime, 'image/')) {
                        return null;
                    }
                }
            } catch (\Throwable $e) {}
            $extension = 'jpg';
        }

        // Generate dynamic name
        $fileName = $prefix . '_' . time() . '_' . rand(100, 999) . '.webp';
        $fullDestDir = public_path($destinationPath);

        if (!file_exists($fullDestDir)) {
            mkdir($fullDestDir, 0755, true);
        }

        $destFilePath = $fullDestDir . '/' . $fileName;

        // If SVG, GIF, TIF, TIFF, ICO, AVIF or direct formats, move directly
        if (in_array($extension, ['svg', 'gif', 'tif', 'tiff', 'ico', 'avif'])) {
            $rawFileName = $prefix . '_' . time() . '_' . rand(100, 999) . '.' . $extension;
            $file->move($fullDestDir, $rawFileName);
            return '/' . rtrim($destinationPath, '/') . '/' . $rawFileName;
        }

        // Try using GD library to optimize and save as webp
        try {
            $imageInfo = getimagesize($file->getRealPath());
            if ($imageInfo === false) {
                // Fallback to simple move
                $file->move($fullDestDir, $fileName);
                return '/' . rtrim($destinationPath, '/') . '/' . $fileName;
            }

            list($width, $height, $type) = $imageInfo;

            // Load source image
            switch ($type) {
                case IMAGETYPE_JPEG:
                    $srcImage = imagecreatefromjpeg($file->getRealPath());
                    break;
                case IMAGETYPE_PNG:
                    $srcImage = imagecreatefrompng($file->getRealPath());
                    // Preserve transparency
                    imagealphablending($srcImage, false);
                    imagesavealpha($srcImage, true);
                    break;
                case IMAGETYPE_GIF:
                    $srcImage = imagecreatefromgif($file->getRealPath());
                    break;
                case IMAGETYPE_WEBP:
                    if (function_exists('imagecreatefromwebp')) {
                        $srcImage = imagecreatefromwebp($file->getRealPath());
                    } else {
                        $srcImage = null;
                    }
                    break;
                default:
                    $srcImage = null;
                    break;
            }

            if (!$srcImage) {
                // Fallback to simple move if GD fails to load
                $file->move($fullDestDir, $fileName);
                return '/' . rtrim($destinationPath, '/') . '/' . $fileName;
            }

            // Calculate new dimensions if resizing is needed
            $newWidth = $width;
            $newHeight = $height;

            if ($width > $maxWidth) {
                $newWidth = $maxWidth;
                $newHeight = round(($height / $width) * $maxWidth);
            }

            // Create canvas
            $dstImage = imagecreatetruecolor($newWidth, $newHeight);

            // Handle transparency for PNG/WebP/GIF
            if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) {
                imagealphablending($dstImage, false);
                imagesavealpha($dstImage, true);
                $transparent = imagecolorallocatealpha($dstImage, 255, 255, 255, 127);
                imagefilledrectangle($dstImage, 0, 0, $newWidth, $newHeight, $transparent);
            }

            // Resize
            imagecopyresampled($dstImage, $srcImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

            // Output webp if supported, else output jpeg
            if (function_exists('imagewebp')) {
                imagewebp($dstImage, $destFilePath, $quality);
            } else {
                // Fallback to jpeg
                $jpegFileName = $prefix . '_' . time() . '_' . rand(100, 999) . '.jpg';
                $destFilePathJpeg = $fullDestDir . '/' . $jpegFileName;
                imagejpeg($dstImage, $destFilePathJpeg, $quality);
                $fileName = $jpegFileName;
            }

            // Free memory
            imagedestroy($srcImage);
            imagedestroy($dstImage);

            return '/' . rtrim($destinationPath, '/') . '/' . $fileName;

        } catch (\Throwable $e) {
            // Ultimate fallback to standard upload if anything goes wrong (e.g. missing GD extension)
            $fallbackFileName = $prefix . '_' . time() . '_' . rand(100, 999) . '.' . $extension;
            $file->move($fullDestDir, $fallbackFileName);
            return '/' . rtrim($destinationPath, '/') . '/' . $fallbackFileName;
        }
    }

    /**
     * Format an image path into a fully qualified HTTPS URL.
     * Handles local paths, relative paths, external URLs, and filters out bad device paths.
     *
     * @param mixed $path
     * @return string
     */
    public static function formatImageUrl($path)
    {
        if (empty($path) || !is_string($path)) {
            return '';
        }
        $path = trim($path);
        if (empty($path)) {
            return '';
        }

        // Filter out bad mobile local device / emulator paths
        if (
            str_starts_with($path, '/data/user/') ||
            str_starts_with($path, '/data/data/') ||
            str_starts_with($path, 'file://') ||
            str_starts_with($path, '/storage/emulated/') ||
            str_contains($path, 'scaled_IMG') ||
            str_contains($path, 'com.example.')
        ) {
            return '';
        }

        // Check if already an absolute URL
        if (preg_match('/^https?:\/\//i', $path)) {
            // If it contains localhost or 127.0.0.1 or mbanglapatenteb.com, normalize to active app URL
            if (str_contains($path, 'localhost') || str_contains($path, '127.0.0.1') || str_contains($path, 'mbanglapatenteb.com')) {
                $parsed = parse_url($path);
                $rel = isset($parsed['path']) ? ltrim($parsed['path'], '/') : '';
                if (!empty($rel)) {
                    $root = app()->runningInConsole() ? url('/') : request()->getSchemeAndHttpHost();
                    return rtrim($root, '/') . '/' . $rel;
                }
            }
            return $path;
        }

        // If it's a relative path e.g. "uploads/chapters/..." or "/uploads/..."
        $clean = ltrim($path, '/');
        $root = app()->runningInConsole() ? url('/') : request()->getSchemeAndHttpHost();
        return rtrim($root, '/') . '/' . $clean;
    }

    /**
     * Format audio or video media path into fully qualified URL.
     *
     * @param mixed $path
     * @return string
     */
    public static function formatMediaUrl($path)
    {
        if (empty($path) || !is_string($path)) {
            return '';
        }
        $path = trim($path);
        if (empty($path)) {
            return '';
        }

        if (
            str_starts_with($path, '/data/user/') ||
            str_starts_with($path, '/data/data/') ||
            str_starts_with($path, 'file://') ||
            str_starts_with($path, '/storage/emulated/')
        ) {
            return '';
        }

        // YouTube or external URLs
        if (preg_match('/^https?:\/\//i', $path)) {
            if (str_contains($path, 'localhost') || str_contains($path, '127.0.0.1') || str_contains($path, 'mbanglapatenteb.com')) {
                $parsed = parse_url($path);
                $rel = isset($parsed['path']) ? ltrim($parsed['path'], '/') : '';
                if (!empty($rel)) {
                    $root = app()->runningInConsole() ? url('/') : request()->getSchemeAndHttpHost();
                    return rtrim($root, '/') . '/' . $rel;
                }
            }
            return $path;
        }

        $clean = ltrim($path, '/');
        $root = app()->runningInConsole() ? url('/') : request()->getSchemeAndHttpHost();
        return rtrim($root, '/') . '/' . $clean;
    }

    /**
     * Format vocabulary array items so image paths are full URLs.
     *
     * @param mixed $vocab
     * @return array
     */
    public static function formatVocabulary($vocab)
    {
        $arr = is_array($vocab) ? $vocab : (is_string($vocab) ? (json_decode($vocab, true) ?: []) : []);
        if (!empty($arr) && is_array($arr)) {
            foreach ($arr as &$item) {
                if (is_array($item) && !empty($item['image'])) {
                    $item['image'] = self::formatImageUrl($item['image']);
                }
            }
        }
        return $arr;
    }
}
