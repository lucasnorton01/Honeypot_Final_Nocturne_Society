# Reestructuración del repositorio — Ronda 4

> Fecha: 2026-09-21  
> Rama: `correcciones-ronda4`  
> Motivo: Auditoría académica — el repositorio no coincidía con lo que dice la tesis y el corpus sintético podía confundirse con evidencia.

---

## Resumen de cambios

Se crearon 8 commits en la rama `correcciones-ronda4`, uno por tarea. El repositorio pasó de tener credenciales expuestas, puertos abiertos y datasets sintéticos mezclados con evidencia, a tener una estructura documentada y verificable.

| Commits | Archivos | Líneas |
|---------|----------|--------|
| 8 | 18 | +1474 / -78 |

---

## T0 — Branch

Se creó `correcciones-ronda4` desde `main`. El working tree tenía un archivo sin trackear (`check_executions.js`).

---

## T1 — Inventario (`docs/INVENTARIO_RONDA4.md`)

Se generó un inventario completo del repositorio con:

- Árbol de carpetas (2 niveles).
- Para cada JSON de n8n: nombre, cantidad de nodos, disparadores, expresión cron.
- Archivos con posibles secretos (grep de password, secret, token, api_key, cred).
- Carpetas ajenas al pipeline (.atl, openspec, PDFs, dashboard, analitica, docs, API, Landing page).
- Estado de carpetas del pipeline (attack-runner, forwarder, log-reader, API, Landing page).
- Tags existentes con fecha y último commit de main.
- Contenido de salidas del generador sintético.

---

## T2 — Datasets sintéticos

### Archivos movidos

| De | A |
|----|---|
| `scripts/dataset_m5.json` | `datasets-sinteticos/dataset_m5.json` |
| `generar_dataset.js` (raíz) | `datasets-sinteticos/generar_dataset.js` |

### Ediciones al script

- **Título**: `"Dataset SINTETICO de dimensionamiento (30 dias, 201.125 eventos). NO es evidencia."`
- **Rutas de salida**: cambiadas de `evidencia/` a `datasets-sinteticos/`.
- **Banner pg_dump**: reemplazado por `"-- DATASET SINTETICO generado por generar_dataset.js. NO es un volcado de la base de datos real ni evidencia."`
- **Frases eliminadas**: "Genera las evidencias", "fuente unica para la tesis", "coherente con el texto de la tesis".
- **Verificación**: `node --check` pasa. `git diff` solo muestra comentarios, rutas y banners.

### 13 eventos reales verbatim

Ubicados en las líneas 478-507 del script, array `CONTROL`. Son la sesión `d7525579e2e2` (telnet, IP 172.18.0.1, 2026-08-11 12:45:36 a 12:47:47 UTC-3). Copiados textualmente de un volcado real de PostgreSQL. No fueron modificados.

### Archivo creado

- `datasets-sinteticos/README.md`: describe qué son, cómo se generan, uso permitido y no permitido.

---

## T3 — Secretos

### Sacados del índice (`git rm --cached`)

| Archivo | Contenido |
|---------|-----------|
| `postgres-cred.json` | Contraseña `[REDACTADO]` en texto plano |
| `n8n/workflows/postgres-credential.json` | Contraseña `[REDACTADO]` en texto plano |

Ambos agregados a `.gitignore`.

### Archivos creados

- `postgres-cred.example.json` — plantilla con campo password vacío.
- `n8n/workflows/postgres-credential.example.json` — plantilla con campo password vacío.

### `.env.example` sanitizado

Valores cambiados de reales a ejemplos genéricos:

| Campo | Antes | Después |
|-------|-------|---------|
| `POSTGRES_USER` | `honeypot` | `.usuario_ejemplo` |
| `POSTGRES_PASSWORD` | `[REDACTADO]` | `contrasena_ejemplo_cambiar` |
| `POSTGRES_DB` | `honeypot` | `nombre_db_ejemplo` |

### Advertencia

El historial de git sigue conteniendo la contraseña en texto plano (commits previos). Se recomienda rotar la contraseña y usar `git filter-repo` si el repositorio es público.

---

## T4 — docker-compose.yml

### Puertos bind a localhost

| Servicio | Antes | Después |
|----------|-------|---------|
| cowrie | `2222:2222`, `2323:2223` | `127.0.0.1:2222:2222`, `127.0.0.1:2323:2223` |
| log-reader | `9000:9000` | `127.0.0.1:9000:9000` |
| postgres | `5433:5432` | `127.0.0.1:5433:5432` |
| n8n | `5678:5678` | `127.0.0.1:5678:5678` |

### TODO sobre imágenes `:latest`

Se agregaron comentarios en las líneas de imagen:

```yaml
image: cowrie/cowrie:latest  # TODO: fijar versión para reproducibilidad
image: n8nio/n8n:latest      # TODO: fijar versión para reproducibilidad
```

### Versiones/digests en uso (comandos de solo lectura)

| Imagen | Tag | Digest | Última actualización |
|--------|-----|--------|---------------------|
| `cowrie/cowrie` | latest | `sha256:42e01e0e5fe7...` | 4 semanas |
| `n8nio/n8n` | latest | `sha256:7406a977895d...` | 11 días |
| `postgres` | 16 | `sha256:f1c3376c26f2...` | 3 semanas |

### Propuesta de separación de redes (no implementada)

Separar `honeypot-net` en dos redes:

```yaml
networks:
  honeypot-frontend:    # cowrie, forwarder, log-reader, attack-runner
    driver: bridge
  honeypot-backend:     # postgres, n8n
    driver: bridge
```

El forwarder y n8n estarían en ambas redes. Cowrie y log-reader solo en `frontend`; postgres y n8n solo en `backend`. Esto limita el acceso directo a PostgreSQL desde el host y desde cowrie.

---

## T5 — README.md

### Cambios

1. **Nombre corregido**: de `README .md` (con espacio) a `README.md`.
2. **Tabla de servicios actualizada**: puertos reflejan el bind a localhost.
3. **"Resultados de validación" reemplazado** por "Estado de la evidencia":
   - `evidencia/` no versionada — contenido de experimentos.
   - `datasets-sinteticos/` NO es evidencia.
   - `experimentos/` contiene variantes que NO son evidencia.
   - Cron de report-generator no se disparó en las ventanas documentadas.
   - Sin cifras de hipótesis ni afirmaciones de validación.
4. **Estructura del repositorio actualizada**: incluye `datasets-sinteticos/`, `experimentos/`, `docs/`, `API/`.
5. **Sección de seguridad actualizada**: puertos localhost, credenciales no versionadas, advertencia sobre historial de git.

---

## T6 — Experimentos

### Archivos movidos

| De | A |
|----|---|
| `n8n/workflows/report-generator-fixed.json` | `experimentos/report-generator-fixed.json` |
| `n8n/workflows/report-generator-manual.json` | `experimentos/report-generator-manual.json` |
| `n8n/workflows/test-geo-enrichment.json` | `experimentos/test-geo-enrichment.json` |

### Archivo creado

- `experimentos/report-generator-verif-cron.json`: copia de `report-generator.json` con:
  - `id`: `wf-report-generator-verif-0004`
  - `name`: `report-generator-verif-cron`
  - Cron: `*/3 * * * *` (cada 3 minutos)

### `experimentos/README.md`

Tabla con archivo, propósito, disparadores y nota "NO es evidencia". Instrucciones de importación y desactivación del verificador de cron.

---

## T7 — Scripts de evidencia

### Archivo movido

| De | A |
|----|---|
| `check_executions.js` (raíz, sin trackear) | `scripts/check_executions.js` |

### Archivo creado

- `scripts/recolectar_evidencia.ps1`: script PowerShell con parámetro obligatorio `-Etiqueta`.
  - Crea `evidencia/<Etiqueta>/`.
  - Copia la base de n8n y ejecuta `check_executions.js`.
  - Ejecuta `pg_dump` via `docker compose exec -T`.
  - Copia `cowrie.json` desde el contenedor `log-reader`.
  - Genera `MANIFIESTO.sha256.txt` con `Get-FileHash SHA256`.
  - Solo lee del stack; nunca escribe en la base ni en n8n.
  - Detiene en el primer error.
  - Sintaxis verificada con parser de PowerShell.

---

## T8 — Bitácora

Se creó `BITACORA.md` con entrada fechada describiendo todos los cambios realizados (archivos movidos, sacados del índice, editados, creados). Lenguaje descriptivo, sin cifras de hipótesis ni frases de validación.

---

## Archivos que quedan pendientes (no tocados en esta ronda)

| Archivo | Problema |
|---------|----------|
| `Pasos para levantar proyecto.txt` | Contiene credenciales en texto plano |
| `db/backup.sql` | Archivo binario de 31 KB versionado |
| `scripts/attack_simulator.py.new` | Archivo temporal sin nombre estándar |
| `scripts/attack_simulator.py.tmp` | Archivo temporal |
| `scripts/calculo_p3p4.py` | Script de cálculo de hipótesis |
| `scripts/calculo_p4_v2.py` | Variante del anterior |
| `scripts/p4_batch_attack.py` | Script de batch de ataques |
| `scripts/p4_large_batch.py` | Variante de batch grande |
| `Logs/` | Scripts de recuperación y logs versionados |
| `logs 10 septiembre/` | Logs de ataques versionados |
| Duplicación de skills | 8 carpetas con los mismos skills de OpenCode |
