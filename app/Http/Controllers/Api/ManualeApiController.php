<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Manuale;
use Illuminate\Http\Request;

class ManualeApiController extends Controller
{
    /**
     * Get Manuale theory topics/chapters inserted from Admin Panel.
     */
    public function getChapters()
    {
        $items = Manuale::where('status', true)
            ->orderBy('chapter_number', 'asc')
            ->orderBy('order_index', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'chapter_number' => $item->chapter_number,
                    'name' => $item->title ?: "Capitolo {$item->chapter_number}",
                    'title' => $item->title ?: "Capitolo {$item->chapter_number}",
                    'sort_order' => $item->chapter_number,
                    'content' => $item->content,
                    'image' => $item->image_path,
                    'image_path' => $item->image_path,
                    'vocabulary' => $item->vocabulary,
                    'pages_count' => 1,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $items
        ]);
    }

    /**
     * Get Manuale pages for a specific chapter/topic ID.
     */
    public function getPages($chapterId)
    {
        $item = Manuale::find($chapterId);
        $data = [];
        if ($item) {
            $data[] = [
                'id' => $item->id,
                'title' => $item->title,
                'content' => $item->content,
                'image' => $item->image_path,
                'image_path' => $item->image_path,
                'vocabulary' => $item->vocabulary,
            ];
        } else {
            $items = Manuale::where('status', true)
                ->where('chapter_number', $chapterId)
                ->get();
            foreach ($items as $it) {
                $data[] = [
                    'id' => $it->id,
                    'title' => $it->title,
                    'content' => $it->content,
                    'image' => $it->image_path,
                    'image_path' => $it->image_path,
                    'vocabulary' => $it->vocabulary,
                ];
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    /**
     * Get Manuale page details.
     */
    public function getPageContent($id)
    {
        $item = Manuale::find($id);
        if (!$item) {
            return response()->json(['status' => 'error', 'message' => 'Not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $item->id,
                'title' => $item->title,
                'content' => $item->content,
                'image' => $item->image_path,
                'image_path' => $item->image_path,
                'vocabulary' => $item->vocabulary,
                'chapter' => [
                    'id' => $item->id,
                    'name' => "Capitolo {$item->chapter_number}",
                ]
            ]
        ]);
    }
}
