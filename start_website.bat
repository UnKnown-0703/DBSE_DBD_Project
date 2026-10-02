@echo off
title Launch College ERP Website
cd /d "%~dp0"
echo Launching database, backend, and frontend servers...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-project.ps1"
pause
