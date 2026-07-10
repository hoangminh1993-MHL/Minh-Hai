@echo off
echo ==================================================
echo   DANG DONG BO DU LIEU CRM LEN GITHUB AND RENDER
echo ==================================================
echo.

set GIT_EXE=C:\Users\admin\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe

if not exist "%GIT_EXE%" set GIT_EXE=git

echo [1/3] Preparing files...
"%GIT_EXE%" add -A

echo.
echo [2/3] Committing changes...
"%GIT_EXE%" commit -m "Auto-update CRM"

echo.
echo [3/3] Uploading data to GitHub...
echo.
echo LUU Y: Neu day la lan dau chay, mot trinh duyet se hien ra.
echo Hay chon "Sign in with your browser" de dang nhap.
echo.
"%GIT_EXE%" push origin main

echo.
echo ==================================================
echo   DONG BO HOAN TAT! RENDER DANG TRIEN KHAI LIVE...
echo ==================================================
pause
