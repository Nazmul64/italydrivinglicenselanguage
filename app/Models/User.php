<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'uuid',
        'name',
        'first_name',
        'last_name',
        'phone',
        'email',
        'password',
        'role',
        'permissions',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function licenses()
    {
        return $this->hasMany(License::class, 'user_id', 'uuid');
    }

    public function license()
    {
        return $this->hasOne(License::class, 'user_id', 'uuid')->latestOfMany();
    }

    public function activeLicense()
    {
        return $this->hasOne(License::class, 'user_id', 'uuid')->where('status', 'active');
    }

    public function conversation()
    {
        return $this->hasOne(Conversation::class, 'user_id', 'uuid');
    }
}

