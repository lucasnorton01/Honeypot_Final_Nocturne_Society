# scripts/

Scripts de utilidad para el laboratorio honeypot.

## recolectar_evidencia.ps1

Crea una carpeta de evidencia con volcado de la base de datos, logs de n8n y cowrie.

```powershell
powershell -ExecutionPolicy Bypass -File scripts\recolectar_evidencia.ps1 -Etiqueta <nombre>
```

## check_executions.js

Consulta la base de datos de n8n y exporta las ejecuciones de workflows.

## attack_simulator.py

Simula un atacante conectándose al honeypot vía Telnet/SSH, ejecuta comandos y captura evidencia.
