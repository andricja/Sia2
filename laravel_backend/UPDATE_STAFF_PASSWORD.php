<?php
// Simple script to update staff password
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$user = User::where('email', 'staff@medikiosk.com')->first();

if ($user) {
    $user->password = bcrypt('staff123');
    $user->role = 'staff';
    $user->save();
    echo "\n✅ SUCCESS! Staff password updated!\n\n";
    echo "Login with:\n";
    echo "Email: staff@medikiosk.com\n";
    echo "Password: staff123\n\n";
} else {
    echo "\n❌ Staff user not found! Creating new one...\n\n";
    User::create([
        'name' => 'Staff User',
        'email' => 'staff@medikiosk.com',
        'password' => bcrypt('staff123'),
        'role' => 'staff'
    ]);
    echo "✅ Staff user created!\n";
    echo "Email: staff@medikiosk.com\n";
    echo "Password: staff123\n\n";
}
