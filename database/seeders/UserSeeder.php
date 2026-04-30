<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        Role::firstOrCreate(['name' => 'superadmin']);
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'user']);

        $user = User::updateOrCreate(
            ['email' => '1@gmail.com'],
            [
                'name' => 'superadmin',
                'password' => Hash::make('password'),
            ]
        );

        $user->assignRole('superadmin');
    }
}