@echo off
echo Resetting admin password...
cd laravel_backend
php artisan tinker --execute="$user = App\Models\User::where('email', 'admin@medikiosk.com')->first(); if($user) { $user->password = bcrypt('admin123'); $user->save(); echo 'Password reset to: admin123'; } else { echo 'User not found!'; }"
pause
