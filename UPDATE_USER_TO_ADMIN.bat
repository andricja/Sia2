@echo off
echo ===============================================
echo   Update Staff User to Admin User
echo ===============================================
echo.
echo This will update the staff@medikiosk.com user to admin role
echo.
pause

cd laravel_backend

echo Running update command...
php artisan tinker --execute="$user = App\Models\User::where('email', 'staff@medikiosk.com')->first(); $user->role = 'admin'; $user->name = 'Admin User'; $user->save(); echo 'User updated successfully!';"

echo.
echo ===============================================
echo   Update Complete!
echo ===============================================
echo.
echo Please logout and login again to see changes.
echo.
pause
