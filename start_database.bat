@echo off
title MySQL Database Server (Port 3307)
cd /d "%~dp0"
echo Starting project database...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run-db.ps1"
pause
