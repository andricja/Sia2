<?php
// Run this in the laravel_backend folder
// Command: php reset_admin_password.php

require __DIR__ . '/laravel_backend/vendor/autoload.php';

$app = require_once __DIR__ . '/laravel_backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Reset admin password
$user = \App\Models\User::where('email', 'admin@medikiosk.com')->first();

if ($user) {
    $user->password = bcrypt('admin123');
    $user->role = 'admin';
    $user->save();
    echo "✅ Password reset successfully!\n";
    echo "Email: admin@medikiosk.com\n";
    echo "Password: admin123\n";
} else {
    echo "❌ Admin user not found. Creating new one...\n";
    \App\Models\User::create([
        'name' => 'Admin User',
        'email' => 'admin@medikiosk.com',
        'password' => bcrypt('admin123'),
        'role' => 'admin'
    ]);
    echo "✅ Admin user created!\n";
    echo "Email: admin@medikiosk.com\n";
    echo "Password: admin123\n";
}
