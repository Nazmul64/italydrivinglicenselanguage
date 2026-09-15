<?php

namespace App\Helpers;

use Illuminate\Http\Request;
use App\Helpers\ImageHelper;

class ChatAttachmentHelper
{
    /**
     * Process incoming chat image/attachment from request and store in public/uploads/live_chat/.
     *
     * @param Request $request
     * @return string|null Relative URL path (e.g. /uploads/live_chat/live_chat_12345.webp)
     */
    public static function processUpload(Request $request)
    {
        $file = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
        } elseif ($request->hasFile('image')) {
            $file = $request->file('image');
        } elseif ($request->hasFile('screenshot')) {
            $file = $request->file('screenshot');
        } elseif ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
        }

        if ($file && $file->isValid()) {
            $path = ImageHelper::uploadAndOptimize($file, 'uploads/live_chat', 'live_chat', 1200, 85);
            if ($path) {
                return str_starts_with($path, '/') ? $path : '/' . $path;
            }
        }

        // Check if attachment is base64 string
        $attachment = $request->input('attachment_path') 
            ?: $request->input('attachment') 
            ?: $request->input('image_url')
            ?: $request->input('image');

        if ($attachment && is_string($attachment) && preg_match('/^data:image\/(\w+);base64,/', $attachment, $type)) {
            $data = substr($attachment, strpos($attachment, ',') + 1);
            $type = strtolower($type[1]);
            if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                $type = 'jpg';
            }
            $data = base64_decode($data);
            if ($data !== false) {
                $dir = public_path('uploads/live_chat');
                if (!file_exists($dir)) {
                    mkdir($dir, 0755, true);
                }
                $fileName = 'live_chat_' . time() . '_' . rand(100, 999) . '.' . $type;
                file_put_contents($dir . '/' . $fileName, $data);
                return '/uploads/live_chat/' . $fileName;
            }
        }

        if ($attachment && is_string($attachment) && !empty(trim($attachment))) {
            $trimmed = trim($attachment);
            if (!str_starts_with($trimmed, 'http') && !str_starts_with($trimmed, '/')) {
                return '/' . $trimmed;
            }
            return $trimmed;
        }

        return null;
    }
}
