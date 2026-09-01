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
        try {
            $rankings = DB::table('user_mcq_results')
                ->join('users', 'users.id', '=', 'user_mcq_results.user_id')
                ->select(
                    'users.id',
                    'users.name',
                    'users.email',
                    DB::raw('COUNT(user_mcq_results.id) as total_attempted'),
                    DB::raw('SUM(CASE WHEN user_mcq_results.is_correct = 1 THEN 1 ELSE 0 END) as correct_count'),
                    DB::raw('SUM(CASE WHEN user_mcq_results.is_correct = 0 THEN 1 ELSE 0 END) as wrong_count')
                )
                ->groupBy('users.id', 'users.name', 'users.email')
                ->orderByDesc('correct_count')
                ->orderByDesc('total_attempted')
                ->limit(20)
                ->get();

            $formatted = [];
            $rank = 1;
            foreach ($rankings as $r) {
                $name = $r->name ?: 'Student User';
                $formatted[] = [
                    'rank' => $rank++,
                    'id' => $r->id,
                    'name' => $name,
                    'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=10B981&color=fff&bold=true',
                    'total_attempted' => (int)$r->total_attempted,
                    'correct_count' => (int)$r->correct_count,
                    'wrong_count' => (int)$r->wrong_count,
                    'points' => (int)$r->correct_count * 10,
                ];
            }

            return response()->json([
                'status' => 'success',
                'data' => $formatted
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'success',
                'data' => []
            ]);
        }
    }
}
