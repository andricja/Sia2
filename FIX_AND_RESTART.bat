@echo off
echo ===============================================
echo   Fix Camera Scanner Error and Restart
echo ===============================================
echo.
echo This will:
echo  1. Install missing dependencies (react-webcam, @zxing/library)
echo  2. Restart the frontend server
echo.
echo Please close the current frontend terminal window first!
echo (Press Ctrl+C in the frontend terminal, then Y)
echo.
pause

cd laravel_frontend

echo.
echo ================================================
echo   Step 1: Installing Dependencies...
echo ================================================
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ================================================
    echo   ERROR: Installation failed!
    echo ================================================
    echo.
    echo Try manually:
    echo   cd laravel_frontend
    echo   npm install
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo   Step 2: Starting Frontend Server...
echo ================================================
echo.
echo Server will start on: http://localhost:5174
echo.
echo Frontend is now running with camera scanner!
echo.
echo To test:
echo  1. Login as Staff (staff@medikiosk.com / staff123)
echo  2. Look for the blue "Scan" button in header
echo  3. Click it to open camera scanner
echo.
echo Press Ctrl+C to stop the server when done.
echo.

call npm run dev

pause
