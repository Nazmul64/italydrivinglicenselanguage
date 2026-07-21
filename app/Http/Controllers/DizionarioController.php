<?php

namespace App\Http\Controllers;

use App\Models\Dizionario;
use App\Helpers\ImageHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DizionarioController extends Controller
{
    /**
     * Check if user has permission to manage a module.
     */
    protected function checkPermission($module)
    {
        $user = auth()->user();
        if (!$user) return;
        if ($user->role === 'super_admin') return;

        if ($user->role === 'staff') {
            $permissions = json_decode($user->permissions, true) ?: [];
            if (in_array($module, $permissions)) {
                return;
            }
        }

        abort(403, 'Unauthorized access: You do not have permission to manage ' . $module);
    }

    // ==========================================
    // Public API Endpoints (For User Interface)
    // ==========================================

    /**
     * Get all dictionary terms.
     */
    public function getDictionary()
    {
        $terms = Dizionario::orderBy('word', 'asc')->get();
        return response()->json($terms);
    }

    // ==========================================
    // Admin API Endpoints (For Administrative Interface)
    // ==========================================

    /**
     * Get dictionary terms list for admin panel (paginated).
     */
    public function getDictionaryAdmin(Request $request)
    {
        $search = $request->query('search');
        $perPage = $request->query('per_page', 10);

        $query = Dizionario::query();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('word', 'like', "%{$search}%")
                  ->orWhere('bn', 'like', "%{$search}%")
                  ->orWhere('desc_it', 'like', "%{$search}%")
                  ->orWhere('desc_bn', 'like', "%{$search}%");
            });
        }

        $terms = $query->orderBy('word', 'asc')->paginate($perPage);
        return response()->json($terms);
    }

    /**
     * Store new dictionary word.
     */
    public function storeWord(Request $request)
    {
        $this->checkPermission('dizionario');

        $request->validate([
            'word'    => 'required|string|max:255|unique:dizionaros,word',
            'bn'      => 'required|string|max:255',
            'desc_it' => 'nullable|string',
            'desc_bn' => 'nullable|string',
            'image'   => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
            'audio'   => 'nullable|mimes:mp3,wav,ogg,aac,m4a|max:15360',
            'video'   => 'nullable|file|mimes:mp4,webm,ogg,avi,mov|max:30720',
        ]);

        $data = [
            'word'    => $request->word,
            'bn'      => $request->bn,
            'desc_it' => $request->desc_it,
            'desc_bn' => $request->desc_bn,
        ];

        $term = Dizionario::create($data);

        // Upload Image
        if ($request->hasFile('image')) {
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/dizionario/images', 'dict_img_' . $term->id, 800, 80);
            $term->image = $uploadedPath;
        }

        // Upload Audio (Voice)
        if ($request->hasFile('audio')) {
            $file = $request->file('audio');
            $fileName = 'dict_aud_' . $term->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/dizionario/audios'), $fileName);
            $term->audio = '/uploads/dizionario/audios/' . $fileName;
        }

        // Upload Video
        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $fileName = 'dict_vid_' . $term->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/dizionario/videos'), $fileName);
            $term->video = '/uploads/dizionario/videos/' . $fileName;
        }

        $term->save();

        return response()->json($term);
    }

    /**
     * Update dictionary word.
     */
    public function updateWord(Request $request, $id)
    {
        $this->checkPermission('dizionario');
        $term = Dizionario::findOrFail($id);

        $request->validate([
            'word'    => 'required|string|max:255|unique:dizionaros,word,' . $id,
            'bn'      => 'required|string|max:255',
            'desc_it' => 'nullable|string',
            'desc_bn' => 'nullable|string',
            'image'   => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
            'audio'   => 'nullable|mimes:mp3,wav,ogg,aac,m4a|max:15360',
            'video'   => 'nullable|file|mimes:mp4,webm,ogg,avi,mov|max:30720',
        ]);

        $term->word = $request->word;
        $term->bn = $request->bn;
        $term->desc_it = $request->desc_it;
        $term->desc_bn = $request->desc_bn;

        // Update Image
        if ($request->hasFile('image')) {
            if ($term->image && file_exists(public_path($term->image))) {
                @unlink(public_path($term->image));
            }
            $uploadedPath = ImageHelper::uploadAndOptimize($request->file('image'), 'uploads/dizionario/images', 'dict_img_' . $term->id, 800, 80);
            $term->image = $uploadedPath;
        }

        // Update Audio (Voice)
        if ($request->hasFile('audio')) {
            if ($term->audio && file_exists(public_path($term->audio))) {
                @unlink(public_path($term->audio));
            }
            $file = $request->file('audio');
            $fileName = 'dict_aud_' . $term->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/dizionario/audios'), $fileName);
            $term->audio = '/uploads/dizionario/audios/' . $fileName;
        }

        // Update Video
        if ($request->hasFile('video')) {
            if ($term->video && file_exists(public_path($term->video))) {
                @unlink(public_path($term->video));
            }
            $file = $request->file('video');
            $fileName = 'dict_vid_' . $term->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads/dizionario/videos'), $fileName);
            $term->video = '/uploads/dizionario/videos/' . $fileName;
        }

        $term->save();

        return response()->json($term);
    }

    /**
     * Delete dictionary word.
     */
    public function deleteWord($id)
    {
        $this->checkPermission('dizionario');
        $term = Dizionario::findOrFail($id);

        // Delete associated files
        if ($term->image && file_exists(public_path($term->image))) {
            @unlink(public_path($term->image));
        }
        if ($term->audio && file_exists(public_path($term->audio))) {
            @unlink(public_path($term->audio));
        }
        if ($term->video && file_exists(public_path($term->video))) {
            @unlink(public_path($term->video));
        }

        $term->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Bulk delete dictionary words.
     */
    public function bulkDeleteWord(Request $request)
    {
        $this->checkPermission('dizionario');

        if ($request->input('all') === true) {
            $query = Dizionario::query();
            if ($request->has('search') && $request->search !== '') {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('word', 'like', "%{$search}%")
                      ->orWhere('bn', 'like', "%{$search}%")
                      ->orWhere('desc_it', 'like', "%{$search}%")
                      ->orWhere('desc_bn', 'like', "%{$search}%");
                });
            }
            $terms = $query->get();
            foreach ($terms as $term) {
                if ($term->image && file_exists(public_path($term->image))) {
                    @unlink(public_path($term->image));
                }
                if ($term->audio && file_exists(public_path($term->audio))) {
                    @unlink(public_path($term->audio));
                }
                if ($term->video && file_exists(public_path($term->video))) {
                    @unlink(public_path($term->video));
                }
                $term->delete();
            }
            return response()->json(['success' => true]);
        }

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:dizionaros,id',
        ]);

        $terms = Dizionario::whereIn('id', $request->ids)->get();
        foreach ($terms as $term) {
            if ($term->image && file_exists(public_path($term->image))) {
                @unlink(public_path($term->image));
            }
            if ($term->audio && file_exists(public_path($term->audio))) {
                @unlink(public_path($term->audio));
            }
            if ($term->video && file_exists(public_path($term->video))) {
                @unlink(public_path($term->video));
            }
            $term->delete();
        }

        return response()->json(['success' => true]);
    }
}
