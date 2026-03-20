@echo off
title Inventory Management System - Launcher

echo.
echo  =============================================
echo     INVENTORY MANAGEMENT SYSTEM
echo  =============================================
echo.

:: Auto-create Desktop shortcut if it doesn't exist yet
if not exist "%USERPROFILE%\Desktop\Inventory Management System.lnk" (
    echo  [SETUP] Creating Desktop shortcut...
    PowerShell -ExecutionPolicy Bypass -File "%~dp0create-shortcut.ps1"
)

echo  Starting servers, please wait...
echo.

:: Step 1: Start MongoDB (mongod) in user home data directory
echo  [1/3] Starting MongoDB...
start "IMS - MongoDB" cmd /k "mongod --dbpath "C:\Users\sb\data\db""

:: Wait for MongoDB to fully start
timeout /t 5 /nobreak > nul

:: Step 2: Start Backend Server
echo  [2/3] Starting Backend server on port 5000...
start "IMS - Backend Server" cmd /k "cd /d "%~dp0backend" && npm start"

:: Give backend a few seconds to connect to MongoDB
timeout /t 5 /nobreak > nul

:: Step 3: Start Frontend Dev Server
echo  [3/3] Starting Frontend on port 3000...
start "IMS - Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo  Waiting for React app to compile...
echo  (This may take up to 30 seconds on first run)
echo.

timeout /t 22 /nobreak > nul

:: Open browser
start http://localhost:3000

echo  [OK] Browser opened at http://localhost:3000
echo.
echo  All 3 servers are running in their own windows.
echo  Close those windows to stop them.
echo.

timeout /t 5 /nobreak > nul
