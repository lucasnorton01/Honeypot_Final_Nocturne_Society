# Honeypot Lab — Cowrie + n8n + PostgreSQL

Arquitectura de honeypots integrada con la plataforma de automatización **n8n** para la
generación automatizada de inteligencia de amenazas.

**Validación funcional en entorno aislado** (no expuesto a Internet): los ataques se generan
localmente con el simulador incluido y se procesan por el pipeline completo.

> Proyecto académico — Nocturne Society (Crespo, Norton, Santos) — UTN FRM, Tecnicatura en Programación, 2026.

**Licencia:** MIT — ver [LICENSE](LICENSE).

**Repositorio canónico:** https://github.com/lucasnorton01/Honeypot_Final_Nocturne_Society

---

## Arquitectura

```
Atacante simulado (localhost)
        │
        ▼
┌───────────────────┐   cowrie.json   ┌───────────┐  HTTP POST   ┌───────────────┐
│  Cowrie           │ ──────────────► │ Forwarder │ ───────────► │ n8n           │
│  (SSH/Telnet)     │   (tail -f)     └───────────┘              │ event-ingest  │
└───────────────────┘                                            └───────┬───────┘
                                                                          ▼
                                                                    ┌───────────┐
                                                                    │ PostgreSQL│
                                                                    │ events /  │
                                                                    │ iocs /    │
                                                                    │ reports   │
                                                                    └───────────┘
```

Servicios definidos en `docker-compose.yml`:

| Servicio     | Imagen             | Puertos      | Rol                                     |
|--------------|--------------------|--------------|-----------------------------------------|
| cowrie       | `cowrie/cowrie`    | 2222 (SSH), 2323 (Telnet) | Honeypot de baja interacción |
| forwarder    | build `./forwarder`| —            | Lee `cowrie.json` y lo reenvía a n8n    |
| log-reader   | build `./log-reader`| 9000         | Expone `/events` y `/report` del log    |
| postgres     | `postgres:16`      | — (interno)  | Persistencia estructurada               |
| n8n          | `n8nio/n8n`        | 5678         | Automatización de workflows             |

---

## Requisitos

- Docker Desktop (con `docker compose`)
- Python 3.12 (para el simulador)

## Puesta en marcha

```bash
# 1. Crear variables de entorno
cp .env.example .env
#    - Definir N8N_ENCRYPTION_KEY (clave fija aleatoria)
#    - (Opcional) TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID para alertas

# 2. Levantar el stack
docker compose up -d --build

# 3. Crear el esquema (la primera vez lo hace el contenedor postgres)
docker compose exec postgres psql -U honeypot -d honeypot -f /docker-entrypoint-initdb.d/schema.sql
```

## Importar los workflows en n8n

1. Abrir `http://localhost:5678` y completar el onboarding.
2. En la UI de n8n: **Workflows → Import from File** y subir cada archivo de
   `n8n/workflows/`:
   - `event-ingest.json`
   - `ioc-extractor.json`
   - `report-generator.json`
3. Crear una credencial **PostgreSQL** (host `postgres`, puerto `5432`, db `honeypot`,
   usuario/password según `.env`) y asignarla a los nodos PostgreSQL de los tres workflows.
4. Activar los tres workflows (toggle **Active**). El webhook de `event-ingest` quedará
   disponible en `http://localhost:5678/webhook/cowrie`.

## Simular un ataque

```bash
python scripts/attack_simulator.py
```

El simulador:
1. Se conecta a Cowrie por Telnet (`localhost:2323`) y ejecuta un ataque real contra el
   honeypot (logins fallidos + login válido `admin:test123` + comandos).
2. Espera a que el forwarder reenvíe los eventos a n8n.
3. Captura evidencia: resumen del `log-reader`, logs del forwarder y estado del pipeline.
4. Genera un reporte fechado en `evidencia/ataque_<timestamp>.log`.

### Credenciales válidas del honeypot

Definidas en `cowrie/userdb.txt`:

```
admin:test123
```

## Verificación del pipeline

```bash
# Eventos persistidos
docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT count(*) FROM events;"

# IoCs extraídos
docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT type, count(*) FROM iocs GROUP BY type;"

# Reportes generados
docker compose exec postgres psql -U honeypot -d honeypot -c "SELECT id, created_at FROM reports;"

# Reporte agregado del log de Cowrie
curl http://localhost:9000/report
```

## Estructura del repositorio

```
├─ docker-compose.yml
├─ .env.example
├─ .gitignore
├─ README.md
├─ BITACORA.md          ← registro de los cambios realizados
├─ ESPECIFICACIONES.md  ← plan de reestructuración
├─ cowrie/
│  ├─ cowrie.cfg
│  └─ userdb.txt
├─ forwarder/
│  ├─ Dockerfile
│  ├─ forwarder.py
│  └─ requirements.txt
├─ log-reader/
│  ├─ Dockerfile
│  └─ server.py
├─ n8n/
│  └─ workflows/
│     ├─ event-ingest.json
│     ├─ ioc-extractor.json
│     └─ report-generator.json
├─ db/
│  └─ schema.sql
├─ scripts/
│  └─ attack_simulator.py
└─ evidencia/            ← logs y dumps generados (no versionados)
```

## Evidencia

Los artefactos de evidencia del pipeline se generan en `evidencia/` (no versionados por diseño;
ver `.gitignore`).

### Registro de ejecuciones n8n — ventana declarada

`evidencia/n8n-executions-20260818.json` (+ manifest `.sha256`) registra las ejecuciones reales de
los workflows de n8n (`event-ingest`, `ioc-extractor`, `report-generator`), extraídas del
`execution_entity ⋈ workflow_entity` de la base interna de n8n (snapshot del 2026-08-18;
`PRAGMA integrity_check` = ok).

- **Ventana de validación declarada:** `2026-08-11T13:58Z` → `2026-08-12T20:00:00.143Z`. n8n
  almacena los timestamps como instantes UTC (equivalente local −03:00: 10:58 → 17:00). La ventana
  coincide con el primer (13:58:13Z) y el último arranque (20:00:00Z) de la campaña de validación
  documentada en BITACORA.md.
- **Ningún registro anterior a la ventana:** 0 ejecuciones antes de `2026-08-11T13:58Z`; todos los
  registros fueron copiados verbatim — sin fabricaciones ni relleno (136 ejecuciones dentro de la
  ventana, ids 3–138).
- **15 ejecuciones posteriores a la ventana** (2026-08-18; disparadores de schedule de
  `ioc-extractor` con el stack nuevamente en ejecución) — reales e incluidas en el export.
- **Cron de `report-generator` (`0 8 * * *`): nunca se disparó.** No hay ninguna ejecución
  programada de `report-generator` en el registro; sus únicas 3 ejecuciones fueron corridas
  manuales por CLI durante la verificación del 2026-08-11 (ids 32, 66, 119). No se creó ningún
  registro simulado.

## Evidencia

`evidencia/` guarda los registros reales del pipeline (no versionados por diseño).

### Registro de ejecuciones n8n — ventana declarada de validación

`evidencia/n8n-executions-20260818.json` (+ manifest `.sha256`) es la copia íntegra de las
ejecuciones de los tres workflows n8n (`execution_entity` ⋈ `workflow_entity`), extraída de
`database.sqlite` del contenedor (snapshot 2026-08-18, `integrity_check` ok).

- **Ventana declarada:** `2026-08-11T13:58Z` → `2026-08-12T20:00:00.143Z`. n8n almacena
  timestamps como instantes UTC; equivalente local (−03:00): 10:58 → 17:00.
- **136 ejecuciones dentro de la ventana** (ids 3–138) y **0 anteriores a su inicio**: no
  existen ejecuciones previas a `2026-08-11T13:58Z`. Ningún registro fue fabricado ni rellenado.
- **15 ejecuciones posteriores a la ventana** (2026-08-18, schedule de `ioc-extractor` con el
  stack nuevamente en ejecución) — reales, incluidas en el export.
- **Cron de `report-generator` (`0 8 * * *`): nunca se disparó.** El registro no contiene
  ejecución programada de `report-generator`; sus únicas 3 ejecuciones fueron corridas manuales
  CLI del 2026-08-11 (ids 32, 66, 119). No se creó ningún registro simulado.

## Monitoreo

- El estado del pipeline se verifica con los comandos de la sección
  «Verificación del pipeline» (conteos en PostgreSQL + `/report` del log-reader).
- Las evidencias son artefactos fechados y reproducibles: cada export de n8n
  incluye ventana declarada, fecha de snapshot y manifest SHA-256.
- El cron de `report-generator` (`0 8 * * *`) no se disparó durante la
  validación (declaración íntegra en «Evidencia»); se re-verifica de forma
  oportunista cuando el stack está en ejecución y cualquier ejecución real
  posterior al export se documenta en `BITACORA.md`.

## Seguridad

- El entorno **no expone puertos a Internet**. Cowrie escucha solo en `localhost`
  (puertos 2222/2323) y el resto de servicios se comunican por la red interna de Docker.
- **No subir al repositorio**: `.env`, tokens, `evidencia/`, ni bases de datos locales.
  Ver `.gitignore`.
- **Editor de n8n (`http://localhost:5678`): actualmente SIN autenticación** —
  aceptable solo por ser un laboratorio local aislado. Habilitar
  `N8N_BASIC_AUTH_*` es el seguimiento documentado (D4; ver `.env.example` y
  `.github/SECURITY.md`). No exponer el puerto 5678 hasta completarlo.
