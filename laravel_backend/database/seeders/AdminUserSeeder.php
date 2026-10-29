<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        \App\Models\User::create([
            'name' => 'Admin User',
            'email' => 'admin@medikiosk.com',
            'password' => bcrypt('admin123'),
            'role' => 'admin'
        ]);

        // Create staff user
        \App\Models\User::create([
            'name' => 'Staff User',
            'email' => 'staff@medikiosk.com',
            'password' => bcrypt('staff123'),
            'role' => 'staff'
        ]);
    }
}
