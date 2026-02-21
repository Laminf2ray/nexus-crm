@echo off
REM ============================================================
REM NexusCRM — GitHub Push Script (Windows)
REM Run from your project root: deploy-github.bat
REM ============================================================

setlocal enabledelayedexpansion

set REPO_NAME=nexus-crm
set BRANCH=main
set "COMMIT_MSG=feat: initial NexusCRM release — lead tracking, pipeline kanban, email campaigns"

echo.
echo ⚡ NexusCRM — GitHub Push Script (Windows)
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set /p GITHUB_USERNAME="Enter your GitHub username: "
set REPO_URL=https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo.
echo [1/5] Installing dependencies...
call npm install

echo.
echo [2/5] Building for production...
call npm run build

echo.
echo [3/5] Initialising Git...
if not exist ".git" (
  git init
  echo Git initialised.
) else (
  echo Git already initialised.
)

git checkout -b %BRANCH% 2>nul || git checkout %BRANCH%

echo.
echo [4/5] Staging and committing...
git add .
git commit -m "%COMMIT_MSG%"

echo.
echo [5/5] Pushing to GitHub...
echo.
echo Repository: %REPO_URL%
echo.
echo IMPORTANT: Make sure you have created the repo at:
echo   https://github.com/new
echo   Name: %REPO_NAME%
echo   DO NOT initialise with README
echo.
pause

git remote remove origin 2>nul
git remote add origin %REPO_URL%
git push -u origin %BRANCH%

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ Successfully pushed to GitHub!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Repository: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo.
echo Next steps:
echo   Deploy to Vercel: https://vercel.com/new
echo   Deploy to Netlify: https://app.netlify.com/start
echo.
pause
