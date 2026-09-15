@echo off
setlocal enabledelayedexpansion

echo === CORRENDO 10 SESIONES VARIADAS DE ATAQUE SIMULADO ===
echo.
echo Cada sesion tendra configuraciones diferentes:
echo - Credenciales variadas
echo - Intentos fallidos variables
echo - Comandos distintos
echo.

set /a contador=1
set /a total_sesiones=10

:BUCLE_PRINCIPAL
if !contador! GTR %total_sesiones% goto FIN

echo.
echo ===== SESION !contador! ============================================
echo.

:: Configuracion diferente para cada sesion
set /a idx = !contador!

:: Sesion 1: Credenciales por defecto (login exitoso admin:test123)
if !idx! equ 1 (
    set FAILED_ATTEMPTS=admin:123456|admin:admin
    set SUCCESS_ATTEMPT=admin:test123
    set COMMANDS=whoami|uname -a|cat /etc/passwd|ls -la /home|w|exit
    echo [Sesion 1] Defecto: login exitoso admin:test123
)

:: Sesion 2: Solo intentos fallidos (sin login exitoso)
if !idx! equ 2 (
    set FAILED_ATTEMPTS=admin:wrongpass|root:toor|admin:pass123
    set SUCCESS_ATTEMPT=
    set COMMANDS=whoami
    echo [Sesion 2] Sin login exitoso: todas las credenciales fallan
)

:: Sesion 3: Múltiples usuarios con logins exitosos
if !idx! equ 3 (
    set FAILED_ATTEMPTS=root:root|test:test|user:password
    set SUCCESS_ATTEMPT=admin:test123|user:pass123
    set COMMANDS=whoami|uname -a
    echo [Sesion 3] Múltiples usuarios: algunos logins exitosos
)

:: Sesion 4: Credenciales de servicio
if !idx! equ 4 (
    set FAILED_ATTEMPTS=svc_account:pass123|daemon:system|nobody:guest
    set SUCCESS_ATTEMPT=svc_account:correctpass
    set COMMANDS=whoami|ls -la /home
    echo [Sesion 4] Credenciales de servicio
)

:: Sesion 5: Brute force corto
if !idx! equ 5 (
    set FAILED_ATTEMPTS=admin:11111|admin:22222|admin:33333|admin:44444
    set SUCCESS_ATTEMPT=admin:55555
    set COMMANDS=whoami
    echo [Sesion 5] Brute force corto
)

:: Sesion 6: Credenciales admin variadas
if !idx! equ 6 (
    set FAILED_ATTEMPTS=admin:abc123|admin:xyz789|root:pass|test:1234
    set SUCCESS_ATTEMPT=admin:test123
    set COMMANDS=uname -a|cat /etc/passwd
    echo [Sesion 6] Credenciales admin variadas
)

:: Sesion 7: Comandos de reconocimiento
if !idx! equ 7 (
    set FAILED_ATTEMPTS=admin:wrong|root:wrong
    set SUCCESS_ATTEMPT=admin:test123
    set COMMANDS=cat /etc/passwd|ls -la /home|w|exit
    echo [Sesion 7] Comandos de reconocimiento
)

:: Sesion 8: Mínimo de comandos
if !idx! equ 8 (
    set FAILED_ATTEMPTS=admin:badpass
    set SUCCESS_ATTEMPT=admin:test123
    set COMMANDS=whoami
    echo [Sesion 8] Minimo de comandos: solo whoami
)

:: Sesion 9: Comandio extensos
if !idx! equ 9 (
    set FAILED_ATTEMPTS=admin:pass1|admin:pass2|admin:pass3
    set SUCCESS_ATTEMPT=admin:test123
    set COMMANDS=whoami|uname -a|cat /etc/passwd|ls -la /home|w|exit|df -h|top -bn1
    echo [Sesion 9] Comandios extensos
)

:: Sesion 10: Aleatorio mixto
if !idx! equ 10 (
    set FAILED_ATTEMPTS=admin:test123|root:test123|user:test123
    set SUCCESS_ATTEMPT=admin:test123
    set COMMANDS=whoami
    echo [Sesion 10] Mixto: algunas credenciales repetidas
)

echo.
echo Ejecutando ataque simulado con configuracion actual...
echo.

:: Ejecutar el simulador Python
python3 scripts/attack_simulator.py > evidencia\sesion_!contador!_%DATE:~-4%%DATE:~-7%_%TIME:~-11,2%_%TIME:~-8,2%.log 2>&1

:: Esperar 5 segundos para que el pipeline procese
echo.
echo Esperando 5 segundos para que el pipeline procese...
timeout /t 5 /nobreak >nul

:: Incrementar contador
set /a contador=!contador!+1

goto BUCLE_PRINCIPAL

:FIN
echo.
echo === TODAS LAS SESSIONES COMPLETADAS ===
echo.
echo Sesiones generadas: 1 a 10
echo Revisa los archivos en la carpeta evidencia/
echo.
pause