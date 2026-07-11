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
        $extension = strtolower($file->getClientOriginalExtension());
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        
        if (!in_array($extension, $allowedExtensions)) {
            return null;
        }

        // Generate dynamic name
        $fileName = $prefix . '_' . time() . '_' . rand(100, 999) . '.webp';
        $fullDestDir = public_path($destinationPath);

        if (!file_exists($fullDestDir)) {
            mkdir($fullDestDir, 0755, true);
        }

        $destFilePath = $fullDestDir . '/' . $fileName;

        // If SVG, just move it since SVG cannot be resized/compressed with GD
        if ($extension === 'svg') {
            $svgFileName = $prefix . '_' . time() . '_' . rand(100, 999) . '.svg';
            $file->move($fullDestDir, $svgFileName);
            return '/' . rtrim($destinationPath, '/') . '/' . $svgFileName;
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
}
