@echo off
echo ===============================================
echo   Installing Camera Scanner Dependencies
echo ===============================================
echo.
echo This will install:
echo  - react-webcam (Camera access)
echo  - @zxing/library (Barcode detection)
echo.
pause

cd laravel_frontend

echo.
echo Installing dependencies...
call npm install

echo.
echo ===============================================
echo   Installation Complete!
echo ===============================================
echo.
echo Dependencies installed:
echo  ✓ react-webcam@^7.2.0
echo  ✓ @zxing/library@^0.21.3
echo.
echo Next steps:
echo  1. Restart your frontend server
echo  2. Run START_FRONTEND.bat
echo  3. Test the camera scanner in Staff POS
echo.
pause
