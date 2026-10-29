<?php
// Simple script to update admin password
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$user = User::where('email', 'admin@medikiosk.com')->first();

if ($user) {
    $user->password = bcrypt('admin123');
    $user->role = 'admin';
    $user->save();
    echo "\n✅ SUCCESS! Password updated!\n\n";
    echo "Login with:\n";
    echo "Email: admin@medikiosk.com\n";
    echo "Password: admin123\n\n";
} else {
    echo "\n❌ User not found!\n\n";
}
