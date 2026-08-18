@echo off
chcp 65001 >nul
cd /d "%~dp0.."

title Honeypot - Extraer IoCs

echo.
echo ============================================================
echo   HONEYPOT - EXTRACCION DE IoCs
echo ============================================================
echo.

where docker >nul 2>nul
if errorlevel 1 (
    echo [ERROR] No se encontro "docker" en el PATH.
    echo         Asegurate de tener Docker Desktop instalado y corriendo.
    pause
    exit /b 1
)

echo [OK] Docker disponible.
echo.

echo ============================================================
echo   PASO 1 - SIMULA EL ATAQUE EN OTRA TERMINAL
echo ============================================================
echo.
echo   Conectate al honeypot por telnet:
echo       telnet localhost 2323
echo.
echo   Intentos fallidos (2):
echo       usuario: admin    contrasena: 123456
echo       usuario: admin    contrasena: admin
echo.
echo   Login exitoso:
echo       usuario: admin    contrasena: test123
echo.
echo   Comandos de atacante (escribilos cuando entres):
echo       whoami
echo       uname -a
echo       cat /etc/passwd
echo       ls -la /home
echo       exit
echo.
echo   Podes abrir la UI de n8n en http://localhost:5678
echo   para ver las ejecuciones en vivo.
echo.
echo ============================================================
echo.
echo   Cuando termines de atacar, presiona una tecla para
echo   continuar con la extraccion de IoCs...
echo.
pause >nul

echo.
echo [1/3] Deteniendo n8n (libera el task broker)...
call docker compose stop n8n

echo.
echo [2/3] Ejecutando ioc-extractor...
call docker compose run --rm n8n execute --id=wf-ioc-extractor-0002

echo.
echo [3/3] Levantando n8n de nuevo...
call docker compose start n8n

echo.
echo ============================================================
echo   RESULTADO: IoCs EXTRAIDOS
echo ============================================================
call docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT type, value, count(*) FROM iocs GROUP BY type, value ORDER BY type;"
echo.
call docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT count(*) AS eventos_sin_procesar FROM events WHERE processed = FALSE;"

echo.
echo ============================================================
echo   Fin del proceso.
echo ============================================================
pause
