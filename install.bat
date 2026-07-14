@echo off
REM CS2 Config Installer - by SpiRaL
REM Double-click this file. It runs install.ps1 which locates your CS2 cfg
REM folder and copies autoexec.cfg + pracc.cfg into it.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
