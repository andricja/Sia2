@echo off
cls
echo ========================================
echo   Creating Database...
echo ========================================
echo.

cd laravel_backend

echo Creating medikiosk database...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS medikiosk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo Done!
echo.

echo Creating tables...
php artisan migrate:fresh
echo.

echo Adding sample data...
php artisan db:seed
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Database: medikiosk
echo Admin: admin@medikiosk.com / admin123
echo.
echo Open phpMyAdmin: http://localhost/phpmyadmin
echo Click 'medikiosk' to see your tables
echo.
pause
