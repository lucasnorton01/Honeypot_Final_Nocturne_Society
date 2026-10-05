# Honeypot Lab — Cowrie + n8n + PostgreSQL

Arquitectura de honeypots integrada con la plataforma de automatización **n8n** para la
generación automatizada de inteligencia de amenazas.

**Validación funcional en entorno aislado** (no expuesto a Internet): los ataques se generan
localmente con el simulador incluido y se procesan por el pipeline completo.

> Proyecto académico — Nocturne Society (Crespo, Norton, Santos) — UTN FRM, Tecnicatura en Programación, 2026.

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
| cowrie       | `cowrie/cowrie`    | 127.0.0.1:2222 (SSH), 127.0.0.1:2323 (Telnet) | Honeypot SSH/Telnet de media interacción |
| forwarder    | build `./forwarder`| —            | Lee `cowrie.json` y lo reenvía a n8n    |
| log-reader   | build `./log-reader`| 127.0.0.1:9000 | Expone `/events` y `/report` del log  |
| postgres     | `postgres:16`      | — (desde el tag Honeypot_Final_2026-10-05e; administración con `docker exec`) | Persistencia estructurada            |
| n8n          | `n8nio/n8n`        | 127.0.0.1:5678 | Automatización de workflows           |
| attack-runner | build `./attack-runner` | —       | Ejecuta `attack_ssh.py` (paramiko) contra `cowrie:2222` por la red interna de Docker y termina; el contenedor no tiene cron propio: cada corrida se dispara desde el anfitrión (`docker compose run --rm attack-runner`), en las validaciones con una tarea programada de Windows |

Segmentación de red (diseño de la Figura 4.2 de la tesis; plan y resultados en `docs/PRUEBAS_SEGMENTACION_MONITOREO.md` y `docs/evidencia/segmentacion/`):

| Red | Subred | Servicios | Nota |
|---|---|---|---|
| `captura` | 10.0.1.0/24 | cowrie, attack-runner | Sin ruta hacia `proceso` ni `datos` |
| `proceso` | 10.0.2.0/24 | forwarder, log-reader, n8n | Sin ruta hacia `datos`, salvo n8n |
| `datos` | 10.0.3.0/24 | n8n, postgres | `internal`: sin salida al exterior ni puertos publicados |

El forwarder y el log-reader leen el log de Cowrie desde el volumen `cowrie-var`, en solo lectura.

Workflows de n8n (`n8n/workflows/`):

| Workflow                | Función                                                                                       |
|--------------------------|------------------------------------------------------------------------------------------------|
| `event-ingest.json`      | Recibe eventos del forwarder, enriquece con el país de la IP (consulta a `ip-api.com` dentro del nodo Code, verificada con IP públicas en prueba) y persiste en `events` |
| `ioc-extractor.json`     | Extrae indicadores de compromiso (`ip`, `credential`, `command`, `hash`) desde `events` hacia `iocs` y registra en `ioc_sessions` cada aparición por sesión   |
| `report-generator.json`  | Genera reportes agregados de inteligencia en `reports` sobre una ventana de 24h, disparado por cron, sin intervención manual |
| `health-monitor.json`    | Cada 5 minutos compara los eventos de Cowrie (vía `log-reader`) con los de `events` en el intervalo de hace 20 a hace 2 minutos y busca eventos sin procesar de más de 35 minutos; registra las alertas en `error_log`. Si no puede consultar la base, su ejecución queda en error en el historial de n8n |

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

   > **Identificador de la credencial:** los tres workflows exportados hacen referencia a
   > la credencial `Postgres` con id `E56uxYa034ezaNIn`, que es el id de la instancia
   > donde se ejecutaron las validaciones. Ese id no existe en una instalación nueva, y la
   > plantilla `n8n/workflows/postgres-credential.example.json` usa otro (`cred-postgres-001`).
   > Por eso, después de importar, n8n muestra los nodos PostgreSQL sin credencial válida.
   > Hay que abrir cada nodo PostgreSQL de los tres workflows y elegir la credencial creada
   > en este paso. Si la importación se hace por CLI (`n8n import:credentials`), se puede
   > cambiar el `id` de la plantilla a `E56uxYa034ezaNIn` antes de importarla, y los
   > workflows la toman sin reasignar nada.

   > **SSL de la credencial:** en este laboratorio PostgreSQL no usa TLS
   > (`PGSSLMODE=disable`), por lo que la credencial debe crearse con `ssl: "disable"`, como
   > hacen las dos plantillas. Con `ssl: false` todas las inserciones fallaron mientras el
   > forwarder seguía informando `[OK]` (validación del 02/10/2026).
4. Activar los tres workflows (toggle **Active**), dejando el cron de `report-generator`
   en su configuración estándar (`0 8 * * *`, una vez por día). El webhook de
   `event-ingest` quedará disponible en `http://localhost:5678/webhook/cowrie`.

> **Nota sobre `ioc-extractor.json`:** el nodo de extracción de IoCs de tipo `ip` debe
> filtrar exclusivamente por `eventid = 'cowrie.session.connect'`. Una versión anterior
> del workflow tomaba la IP de origen de cualquier evento, generando falsos positivos
> (ver [Limitaciones conocidas](#limitaciones-conocidas)). Verificar que el archivo
> importado incluya la condición `e.src_ip && e.eventid === 'cowrie.session.connect'`
> antes de activar el workflow.

> **Nota sobre `report-generator.json`:** las subqueries que agregan `events` para el
> reporte (total de eventos, `top_ips`, distribución por `eventid`, credenciales,
> países) deben incluir el filtro `WHERE timestamp >= now() - interval '24 hours'`,
> consistente con el `period_start`/`period_end` que se persiste junto al reporte. Una
> versión anterior carecía de ese filtro y agregaba el historial completo de eventos
> en lugar de la ventana declarada (ver [Limitaciones conocidas](#limitaciones-conocidas)).

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

> **Recomendación:** monitorear el forwarder durante corridas largas
> (`docker compose logs -f forwarder`). En una validación con 39 sesiones consecutivas se
> detectaron dos interrupciones del forwarder que impidieron persistir 29 de las sesiones
> en PostgreSQL; el problema no vuelve a ocurrir si se supervisa el proceso en vivo, pero
> permanece como una limitación de robustez del componente.

### Credenciales válidas del honeypot

Definidas en `cowrie/userdb.txt` (doce cuentas de laboratorio, por ejemplo `admin:test123`
o `pi:raspberry`). Son credenciales de laboratorio y se publican en claro.

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

---

## Estado de la evidencia

- **`evidencia/`** (no versionada): contiene logs y dumps generados durante los experimentos
  del laboratorio. Su contenido no está sujeto a revisión de código; los archivos se
  obtienen con el script `scripts/recolectar_evidencia.ps1`.
- **`datasets-sinteticos/`** (versionada): datos generados por `generar_dataset.js`.
  **No son evidencia**: totales, distribuciones y tasas están fijados de antemano en el
  script; el dataset no fue procesado por n8n; el mapeo IP→país es una tabla fija, no
  geolocalización real. Ver `datasets-sinteticos/README.md` para detalles.
- **`experimentos/`** (versionada): variantes locales de workflows y archivos de prueba.
  No son evidencia del pipeline canónico.
- **Cron de `report-generator`**: la expresión estándar es `0 8 * * *` (una vez por día,
  a las 08:00). Las validaciones del 28/09 y del 30/09/2026 usaron un cron de validación de
  2 horas y la del 02/10/2026 una expresión diaria adelantada (`50 11 * * *`); el disparo
  de producción de las 08:00 no se observó (tesis, §5.10).

---

## Limitaciones conocidas

- **Restricción de unicidad en `iocs`.** La tabla `iocs` define `UNIQUE(type, value)`, por
  lo que un mismo indicador (una IP o una credencial) repetido en distintas sesiones se
  registra una sola vez, vinculado a la primera sesión que lo generó. Esto puede subestimar
  la cantidad de sesiones con indicador propio cuando varias sesiones comparten el mismo
  valor. Es una limitación de diseño del esquema, independiente del fix aplicado al
  extractor (ver debajo). Desde la validación del 30/09/2026 la tabla `ioc_sessions`
  registra una fila por cada aparición de un indicador en una sesión, lo que permite medir
  la cobertura por sesión sin romper la unicidad de `iocs`; la atribución por `event_id`
  sigue limitada por esa restricción.
- **Resiliencia del forwarder.** En corridas largas y sin supervisión activa se observaron
  interrupciones intermitentes en el reenvío de eventos hacia n8n. Se recomienda monitorear
  el proceso en vivo durante validaciones extensas; queda como trabajo futuro reforzar el
  componente con lógica de reintento (backoff) o una cola de mensajes no entregados.
- **Línea de base manual de tamaño mínimo.** El 02/10/2026 se midió con dos integrantes del
  equipo autor (N = 2, 20 eventos; mediana de 18,44 s por evento para triaje y extracción;
  `docs/evidencia/b1/`). Es descriptiva y no admite inferencia; queda como trabajo futuro
  repetirla con analistas ajenos al equipo.
- **Objetivo específico 5 (enriquecimiento geo/reputación) no ejercido con tráfico real.**
  Todas las sesiones observadas en el laboratorio corresponden a direcciones IP internas;
  el nodo de enriquecimiento nunca procesó una IP pública real, más allá de la verificación
  aislada con IP públicas posterior a la corrección del 29/09/2026.

### Corregido durante la validación

- **Geolocalización por país en `event-ingest`.** La consulta a `ip-api.com` fallaba en
  todos los eventos porque usaba `fetch()` dentro del nodo Code, y el campo `country`
  quedaba en `Desconocido`. Corregido el 29/09/2026: la consulta usa
  `this.helpers.httpRequest()` con tiempo de espera de 2 s y valor por defecto
  `Desconocido`, y se verificó con IP públicas; no se ejercitó con tráfico real, porque todas
  las sesiones observadas provienen de direcciones internas del laboratorio.
- **Extractor de IoCs de tipo IP.** El nodo de `ioc-extractor.json` tomaba la dirección IP
  de origen de **cualquier** evento (`if (e.src_ip)`), no solo de conexiones reales, lo que
  generaba falsos positivos (por ejemplo, IPs asociadas a eventos `cowrie.command.input` o
  `LOGIN_SUCCESSFUL`). Corregido a `if (e.src_ip && e.eventid === 'cowrie.session.connect')`.
  El fix fue verificado en dos entornos independientes sin alterar los eventos e indicadores
  históricos ya persistidos.
- **Agregación sin filtro temporal en `report-generator`.** Las subqueries que arman el
  contenido del reporte no filtraban por `timestamp`, agregando el historial completo de
  `events` en vez de la ventana de 24h declarada en `period_start`/`period_end` (~63 % de
  inflación en los reportes ya generados). Corregido agregando
  `WHERE timestamp >= now() - interval '24 hours'` a las cinco subqueries afectadas; el fix
  es no destructivo, no altera los reportes ya persistidos.

---

## Registro de la búsqueda bibliográfica

El proceso de búsqueda bibliográfica para el estado del arte cuenta con un registro
cuantitativo simplificado, de tipo PRISMA y de carácter retrospectivo, documentado en la
tesis (§2.8). Identifica 52 fuentes mediante búsqueda sistemática en ocho bases/fuentes
(IEEE Xplore, ACM DL, ScienceDirect, SpringerLink, arXiv, informes de industria,
documentación técnica y marco legal/estándares); como el registro es retrospectivo,
sus cifras describen el proceso de búsqueda y no la composición de la lista final (55
referencias); las excepciones a los criterios de búsqueda (conocimiento propio del equipo o
rastreo de citas) se declaran explícitamente en esa sección.

## Estructura del repositorio

Refleja `git ls-files` en el commit `17d0a51` (se omiten los archivos individuales de las
carpetas de skills y de los logs).

```
├─ docker-compose.yml
├─ .env.example
├─ .gitattributes           ← solo protege docs/evidencia/b2/** (sin conversión de saltos de línea)
├─ .gitignore
├─ README.md
├─ BITACORA.md              ← registro de los cambios realizados
├─ EVIDENCIA_REAL.md
├─ Reestructuracion.md
├─ postgres-cred.example.json
├─ cowrie/
│  ├─ cowrie.cfg
│  ├─ moduli
│  └─ userdb.txt
├─ forwarder/
│  ├─ Dockerfile
│  ├─ forwarder.py
│  └─ requirements.txt
├─ log-reader/
│  ├─ Dockerfile
│  └─ server.py
├─ attack-runner/           ← simulador SSH del servicio attack-runner
│  ├─ Dockerfile
│  ├─ attack.py
│  └─ attack_ssh.py
├─ n8n/
│  ├─ check_db.js
│  └─ workflows/
│     ├─ event-ingest.json          ← canónico
│     ├─ ioc-extractor.json         ← canónico
│     ├─ report-generator.json      ← canónico
│     └─ postgres-credential.example.json
├─ db/
│  └─ schema.sql
├─ scripts/                 ← simulación, análisis (B1/B2, Wilson), verificación y utilidades
│  ├─ attack_simulator.py
│  ├─ b2_iniciar.ps1, b2_cerrar.ps1, b2_analisis.js, b1_analisis.js
│  ├─ historicos/           ← scripts puntuales de diagnóstico (ver su README)
│  └─ ... (ver scripts/README.md)
├─ script_entorno/          ← instalación del entorno (setup.sh, setup.ps1, import-n8n.js)
├─ agent/                   ← skills de asistente de código (no forma parte del pipeline)
├─ datasets-sinteticos/     ← datos sintéticos (NO son evidencia)
│  ├─ generar_dataset.js
│  ├─ dataset_m5.json
│  └─ README.md
├─ analitica/               ← solo README: derivados del dataset sintético (el resto no está versionado)
├─ experimentos/            ← variantes locales de workflows y archivos de prueba (NO son evidencia)
│  ├─ report-generator-b2-2026-10-02.json     ← flujo de la ventana B2
│  ├─ report-generator-fixed.json
│  ├─ report-generator-manual.json
│  ├─ test-geo-enrichment.json
│  └─ ... (ver experimentos/README.md)
├─ docs/
│  ├─ EVIDENCIA_HASHES.md
│  ├─ PREREGISTRO_B2.md
│  ├─ M4-PRISMA-template.md
│  ├─ M5-protocolo-evaluadores.md
│  ├─ VERIFICACION_2026-09-28.md
│  ├─ VERIFICACION_2026-09-30.md
│  ├─ figs/                 ← figuras de la tesis
│  └─ evidencia/            ← evidencia publicada (CSV/JSON de las ventanas del 25/09, 28/09 y 30/09)
│     ├─ b1/                ← línea de base manual (02/10/2026)
│     └─ b2/                ← validación con registro previo (02/10/2026), con SHA256SUMS.txt
├─ Logs/                    ← scripts y logs sueltos de la etapa inicial (histórico)
├─ logs 10 septiembre/      ← logs de ataque del 10/09/2026
├─ API/                     ← servidor Node.js (dashboard); FUERA DEL PIPELINE
├─ Landing page/            ← landing HTML estática; FUERA DEL PIPELINE
├─ .agents/, .atl/          ← configuración de herramientas de asistente de código
└─ evidencia/               ← logs y dumps generados (no versionados)
```

## Historia del repositorio

El repositorio contiene **dos historias git independientes sin ancestro común**:

- **Raíz `b669726`** (tag `Honeypot_Cowrie`, 18/08/2026): historial original del proyecto.
- **Raíz `2147ad4`** (rama `main`, 15/09/2026): segunda historia, iniciada sin vínculo con la primera.

```
$ git rev-list --max-parents=0 --all
2147ad47e3141880d0d3bc1a33a7bb0177fdd878
b6697266650cb2ee2c42860d4ab5b983c440567d

$ git merge-base main Honeypot_Cowrie
(no output — sin ancestro común)
```

## Verificar los hashes del registro previo

`docs/PREREGISTRO_B2.md` (§6) fija los SHA-256 de nueve archivos, calculados sobre los
archivos tal como estaban en el equipo del autor (Windows). Los fuentes de ese registro
quedaron en el tag `Honeypot_Final_2026-10-02-B2` (y no cambian en `Honeypot_Final_2026-10-05`).
Los bytes de un archivo dependen de los finales de línea, y el repositorio guarda LF en el
índice; por eso el hash depende del archivo:

```bash
# Archivos registrados con LF: scripts/b2_analisis.js, scripts/b2_iniciar.ps1, scripts/b2_cerrar.ps1
git show Honeypot_Final_2026-10-02-B2:scripts/b2_analisis.js | sha256sum

# Archivos registrados con CRLF: attack-runner/attack_ssh.py, cowrie/userdb.txt,
# n8n/workflows/{event-ingest,ioc-extractor,report-generator}.json,
# experimentos/report-generator-b2-2026-10-02.json
git show Honeypot_Final_2026-10-02-B2:attack-runner/attack_ssh.py | perl -pe 's/\n/\r\n/' | sha256sum
```

Notas:
- La conversión a CRLF debe aplicarse solo a los saltos de línea reales (`perl` como arriba).
  `sed 's/$/\r/'` agrega además un `\r` al final de un archivo sin salto de línea final, y con
  `event-ingest.json` y `ioc-extractor.json` (que no terminan en salto de línea) da un hash
  distinto del registrado.
- Sin conversión se obtiene el hash LF, que no es el registrado para esos seis archivos.
- En un checkout de Windows con `core.autocrlf=true`, `sha256sum` sobre el archivo del
  árbol de trabajo da directamente el hash CRLF registrado.
- No se fuerza `eol=lf` en `.gitattributes` (cambiaría los bytes del checkout en Windows);
  `docs/evidencia/b2/**` sí se guarda byte a byte (`-text`) para coincidir con `SHA256SUMS.txt`.

## Evolución de `cowrie/userdb.txt`

El archivo solo conserva en el árbol su estado final (12 cuentas). Los commits donde tuvo
2, 6 y 12 cuentas (sin contar comentarios) son: `2147ad4` (15/09/2026, 2 cuentas),
`7882a30` (28/09/2026, 6 cuentas) y `1378677` (02/10/2026, 12 cuentas; vigente en
`Honeypot_Final_2026-10-05`). Los tres pertenecen a la historia de `main`; el commit raíz
`b669726`, de la otra historia (tag `Honeypot_Cowrie`), tenía 1 cuenta. Se verifica con
`git show <commit>:cowrie/userdb.txt`.

## Dónde está la evidencia

- `evidencia/` **no está versionada** por diseño: contiene logs y dumps generados durante los experimentos.
- `datasets-sinteticos/` **no es evidencia**: son datos sintéticos generados para pruebas.
- Los hashes SHA-256 de los archivos de evidencia reales se publican en [`docs/EVIDENCIA_HASHES.md`](docs/EVIDENCIA_HASHES.md).

## Seguridad

- El entorno **expone puertos solo en localhost** (`127.0.0.1`). Cowrie escucha en
  `127.0.0.1:2222`/`127.0.0.1:2323` y el resto de servicios se comunican por la red
  interna de Docker.
- **No subir al repositorio**: `.env`, tokens, `evidencia/`, ni bases de datos locales.
  Ver `.gitignore`.
- Los archivos `postgres-cred.json` y `n8n/workflows/postgres-credential.json` contienen
  credenciales y **no están versionados** (sacados del índice). Existen versiones
  `.example.json` con campos vacíos como plantilla.
- **El historial de git contiene la contraseña de laboratorio en texto plano** (commits
  previos). Se recomienda rotar la contraseña y usar `git filter-repo` si el repositorio
  es público.

---

