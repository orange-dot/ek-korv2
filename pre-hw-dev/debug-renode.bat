@echo off
echo Starting JEZGRO Debug Session...
echo.
cd /d "%~dp0"
"C:\Program Files\Renode\bin\Renode.exe" -e "include @renode/debug.resc"
