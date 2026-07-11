<?php

namespace App\Http\Controllers;

use App\Models\MediaFile;
use App\Helpers\ImageHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FileManagerController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);
        $type = $request->query('type'); // image, pdf, audio, video

        $query = MediaFile::query();

        if ($search) {
            $query->where('filename', 'like', "%{$search}%");
        }

        if ($type) {
            $query->where('filetype', $type);
        }

        $files = $query->orderBy('created_at', 'desc')->paginate($perPage);
        return response()->json($files);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:51200', // max 50MB
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        // Determine general file type category
        $fileType = 'other';
        if (Str::startsWith($mimeType, 'image/')) {
            $fileType = 'image';
        } elseif ($mimeType === 'application/pdf') {
            $fileType = 'pdf';
        } elseif (Str::startsWith($mimeType, 'audio/')) {
            $fileType = 'audio';
        } elseif (Str::startsWith($mimeType, 'video/')) {
            $fileType = 'video';
        }

        $path = '';

        if ($fileType === 'image') {
            // Use ImageHelper to compress & convert to webp
            $uploadedPath = ImageHelper::uploadAndOptimize($file, 'uploads/media', 'media', 1200, 80);
            if ($uploadedPath) {
                $path = $uploadedPath;
            } else {
                $fileName = 'media_' . time() . '_' . rand(100, 999) . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('uploads/media'), $fileName);
                $path = '/uploads/media/' . $fileName;
            }
        } else {
            // Store raw file
            $folderName = 'uploads/media';
            if ($fileType === 'pdf') $folderName = 'uploads/media/pdfs';
            elseif ($fileType === 'audio') $folderName = 'uploads/media/audios';
            elseif ($fileType === 'video') $folderName = 'uploads/media/videos';

            $fullDir = public_path($folderName);
            if (!file_exists($fullDir)) {
                mkdir($fullDir, 0755, true);
            }

            $fileName = time() . '_' . rand(100, 999) . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
            $file->move($fullDir, $fileName);
            $path = '/' . $folderName . '/' . $fileName;
        }

        $mediaFile = MediaFile::create([
            'filename' => $originalName,
            'filepath' => $path,
            'filetype' => $fileType,
            'filesize' => $fileSize,
        ]);

        return response()->json($mediaFile);
    }

    public function rename(Request $request, $id)
    {
        $request->validate([
            'filename' => 'required|string|max:255',
        ]);

        $mediaFile = MediaFile::findOrFail($id);
        
        // Retain original extension
        $ext = pathinfo($mediaFile->filepath, PATHINFO_EXTENSION);
        $newBaseName = pathinfo($request->filename, PATHINFO_FILENAME);
        $newFilename = $newBaseName . '.' . $ext;

        $mediaFile->update([
            'filename' => $newFilename
        ]);

        return response()->json($mediaFile);
    }

    public function destroy($id)
    {
        $mediaFile = MediaFile::findOrFail($id);

        if ($mediaFile->filepath && file_exists(public_path($mediaFile->filepath))) {
            @unlink(public_path($mediaFile->filepath));
        }

        $mediaFile->delete();
        return response()->json(['success' => true]);
    }

    public function download($id)
    {
        $mediaFile = MediaFile::findOrFail($id);
        $path = public_path($mediaFile->filepath);

        if (!file_exists($path)) {
            return response()->json(['error' => 'File not found on server'], 404);
        }

        return response()->download($path, $mediaFile->filename);
    }
}
