@echo off
setlocal
for /L %i in (1,1,10) do (
    echo.
    echo === Sesion %i ===
    python scripts\attack_simulator.py
    echo.
    echo Esperando 5 segundos para que el pipeline procese...
    timeout /t 5 /nobreak >nul
)
echo.
echo === Todas las sesiones completadas ===