<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class LeaderboardApiController extends Controller
{
    /**
     * Get top 20 student leaderboard rankings.
     */
    public function index()
    {
        $rankings = DB::table('user_mcq_results')
            ->join('users', 'users.id', '=', 'user_mcq_results.user_id')
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.avatar',
                DB::raw('COUNT(user_mcq_results.id) as total_attempted'),
                DB::raw('SUM(CASE WHEN user_mcq_results.is_correct = 1 OR user_mcq_results.is_passed = 1 THEN 1 ELSE 0 END) as correct_count'),
                DB::raw('SUM(CASE WHEN user_mcq_results.is_correct = 0 AND user_mcq_results.is_passed = 0 THEN 1 ELSE 0 END) as wrong_count')
            )
            ->groupBy('users.id', 'users.name', 'users.email', 'users.avatar')
            ->orderByDesc('correct_count')
            ->orderByDesc('total_attempted')
            ->limit(20)
            ->get();

        $formatted = [];
        $rank = 1;
        foreach ($rankings as $r) {
            $formatted[] = [
                'rank' => $rank++,
                'id' => $r->id,
                'name' => $r->name ?: 'Student User',
                'avatar' => $r->avatar ?? ('https://ui-avatars.com/api/?name=' . urlencode($r->name ?: 'S') . '&background=6366F1&color=fff'),
                'total_attempted' => (int)$r->total_attempted,
                'correct_count' => (int)$r->correct_count,
                'wrong_count' => (int)$r->wrong_count,
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $formatted
        ]);
    }
}
