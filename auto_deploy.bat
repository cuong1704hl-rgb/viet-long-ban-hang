@echo off
cd /d "%~dp0"
echo [AI Auto-Deploy] Starting deployment...
git add .
git commit -m "Auto update via AI assistant"
echo [AI Auto-Deploy] Pushing to Vercel/Cloudflare...
git push origin main
if %errorlevel% neq 0 (
    echo [ERROR] Deployment failed. Please check your internet connection or git status.
    pause
    exit /b %errorlevel%
)
echo [SUCCESS] Deployed successfully!
timeout /t 3 >nul
