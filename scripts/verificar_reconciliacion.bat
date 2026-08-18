@echo off
rem verificar_reconciliacion.bat - Windows wrapper for verificar_reconciliacion.py (R-08/R-10).
rem Delegates to the Python script and preserves its exit code (0 = all canonical
rem numbers match the real DB; 1 = one or more checks failed).
python "%~dp0verificar_reconciliacion.py" %*
exit /b %ERRORLEVEL%