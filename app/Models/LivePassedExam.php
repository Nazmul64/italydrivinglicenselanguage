<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Helpers\ImageHelper;

class LivePassedExam extends Model
{
    use HasFactory;

    protected $table = 'live_passed_exams';

    protected $fillable = [
        'nome',
        'motorizzazione',
        'exam_date',
        'status',
        'corrette',
        'errori',
        'non_risposte',
        'totale',
        'pdf_path',
    ];

    protected $appends = ['pdf_url'];

    public function getPdfUrlAttribute(): ?string
    {
        if (empty($this->pdf_path)) {
            return null;
        }

        if (str_starts_with($this->pdf_path, 'http://') || str_starts_with($this->pdf_path, 'https://')) {
            return $this->pdf_path;
        }

        return ImageHelper::formatImageUrl($this->pdf_path);
    }
}
