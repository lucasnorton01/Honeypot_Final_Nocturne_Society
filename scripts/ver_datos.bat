@echo off
chcp 65001 >nul
cd /d "%~dp0.."

title Honeypot - Ver datos de la base

:menu
cls
echo.
echo ============================================================
echo   HONEYPOT - VISOR DE BASE DE DATOS
echo ============================================================
echo.
echo   1 = Eventos recientes (ultimos 10)
echo   2 = IoCs extraidos
echo   3 = Reportes generados
echo   4 = Resumen general
echo   5 = Todo junto
echo   0 = Salir
echo.
set /p op=  Elige una opcion: 

if "%op%"=="1" goto eventos
if "%op%"=="2" goto iocs
if "%op%"=="3" goto reportes
if "%op%"=="4" goto resumen
if "%op%"=="5" goto todo
if "%op%"=="0" exit /b 0
goto menu

:eventos
cls
echo.
echo [EVENTOS RECIENTES]
echo.
call docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT id, eventid, src_ip, username, password, input, timestamp FROM events ORDER BY id DESC LIMIT 10;"
goto fin

:iocs
cls
echo.
echo [IoCs EXTRAIDOS]
echo.
call docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT type, value, count(*) FROM iocs GROUP BY type, value ORDER BY type;"
goto fin

:reportes
cls
echo.
echo [REPORTES GENERADOS]
echo.
call docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT id, period_start, period_end FROM reports ORDER BY id DESC LIMIT 3;"
goto fin

:resumen
cls
echo.
echo [RESUMEN GENERAL]
echo.
call docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT count(*) AS total_eventos, count(*) FILTER (WHERE processed) AS procesados FROM events;"
call docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT type, count(*) FROM iocs GROUP BY type;"
call docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT count(*) AS total_reportes FROM reports;"
goto fin

:todo
cls
echo.
echo [EVENTOS RECIENTES]
call docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT id, eventid, src_ip, username, password, input, timestamp FROM events ORDER BY id DESC LIMIT 10;"
echo.
echo [INTENTOS DE LOGIN]
call docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT id, eventid, src_ip, username, password, message FROM events WHERE eventid LIKE 'cowrie.login%%' ORDER BY id DESC LIMIT 6;"
echo.
echo [IoCs EXTRAIDOS]
call docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT type, value, count(*) FROM iocs GROUP BY type, value ORDER BY type;"
echo.
echo [REPORTES GENERADOS]
call docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT id, period_start, period_end FROM reports ORDER BY id DESC LIMIT 3;"
goto fin

:fin
echo.
echo ============================================================
echo   Presiona una tecla para volver al menu o Ctrl+C para salir.
echo ============================================================
pause >nul
goto menu
