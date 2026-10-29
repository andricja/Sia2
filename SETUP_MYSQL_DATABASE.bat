@echo off
echo ============================================
echo   MediKiosk - MySQL Database Setup
echo ============================================
echo.

cd laravel_backend

echo Step 1: Creating MySQL database...
echo.
mysql -u root -e "CREATE DATABASE IF NOT EXISTS medikiosk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to create database. Make sure MySQL is running in Laragon!
    echo.
    echo Solutions:
    echo 1. Open Laragon and click "Start All"
    echo 2. Wait for MySQL to start (green indicator)
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo Database 'medikiosk' created successfully!
echo.

echo Step 2: Running migrations (creating tables)...
echo.
php artisan migrate:fresh

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to run migrations!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo Step 3: Seeding initial data...
echo.
php artisan db:seed --class=CategorySeeder
php artisan db:seed --class=AdminUserSeeder
php artisan db:seed --class=MedicineSeeder

echo.
echo ============================================
echo   Database Setup Complete!
echo ============================================
echo.
echo Database: medikiosk
echo Tables created: users, medicines, categories, orders, etc.
echo.
echo Admin Account:
echo   Email: admin@medikiosk.com
echo   Password: admin123
echo.
echo You can now:
echo 1. View database in phpMyAdmin: http://localhost/phpmyadmin
echo 2. Start the backend: START_BACKEND.bat
echo 3. Start the frontend: START_FRONTEND.bat
echo.
pause
