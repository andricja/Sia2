@echo off
echo ====================================
echo Dark Mode Test Helper
echo ====================================
echo.
echo This will help you test the dark mode feature
echo.
echo STEP 1: Make sure the dev server is running
echo If not, run START_FRONTEND.bat first
echo.
echo STEP 2: Open your browser to http://localhost:5174
echo.
echo STEP 3: Open Browser DevTools (Press F12)
echo.
echo STEP 4: Go to Console tab
echo.
echo STEP 5: Run this command to clear localStorage:
echo    localStorage.clear()
echo.
echo STEP 6: Refresh the page (F5)
echo.
echo STEP 7: Look for these console logs:
echo    - "Initial theme from localStorage: null" or "light"
echo    - When you click the Moon icon, you should see:
echo      "Toggle dark mode called. Current state: false"
echo      "Theme changed to: dark"
echo.
echo STEP 8: The Moon icon should change to a yellow Sun icon
echo.
echo STEP 9: The background should turn dark
echo.
echo ====================================
echo Troubleshooting:
echo ====================================
echo.
echo If the icon doesn't change:
echo   1. Check if you see the console logs
echo   2. If no logs, the button isn't connected properly
echo   3. Try refreshing the page
echo.
echo If the background doesn't change:
echo   1. Check if html element has class="dark" (in Elements tab)
echo   2. If yes but still light, restart dev server
echo   3. If no, ThemeContext isn't working
echo.
echo If cards are invisible:
echo   1. The dark mode classes are applied
echo   2. Try toggling to light mode (Sun icon)
echo   3. Then toggle back to dark mode
echo.
echo ====================================
pause
