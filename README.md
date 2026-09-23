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
| cowrie       | `cowrie/cowrie`    | 127.0.0.1:2222 (SSH), 127.0.0.1:2323 (Telnet) | Honeypot de baja interacción |
| forwarder    | build `./forwarder`| —            | Lee `cowrie.json` y lo reenvía a n8n    |
| log-reader   | build `./log-reader`| 127.0.0.1:9000 | Expone `/events` y `/report` del log  |
| postgres     | `postgres:16`      | 127.0.0.1:5433 | Persistencia estructurada            |
| n8n          | `n8nio/n8n`        | 127.0.0.1:5678 | Automatización de workflows           |

Workflows de n8n (`n8n/workflows/`):

| Workflow                | Función                                                                                       |
|--------------------------|------------------------------------------------------------------------------------------------|
| `event-ingest.json`      | Recibe eventos del forwarder, enriquece con geolocalización (parcial, ver [Limitaciones conocidas](#limitaciones-conocidas)) y persiste en `events` |
| `ioc-extractor.json`     | Extrae indicadores de compromiso (`ip`, `credential`, `command`) desde `events` hacia `iocs`   |
| `report-generator.json`  | Genera reportes agregados de inteligencia en `reports` sobre una ventana de 24h, disparado por cron, sin intervención manual |

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
  a las 08:00). En las ventanas documentadas de experimentación, el cron no se disparó
  porque los workflows se activaron manualmente o con expresiones temporales distintas.

---

## Limitaciones conocidas

- **Nodo de enriquecimiento por geolocalización (`GeoIP Lookup`).** El servicio externo
  consumido (`ip-api.com`) responde correctamente y la inserción directa del campo
  `country` en PostgreSQL funciona a nivel de esquema, pero el workflow `event-ingest` no
  persiste el valor de país al recibir un evento por webhook. El diagnóstico apunta al nodo
  intermedio **"Set Country"**, que no estaría propagando correctamente el resultado del
  nodo HTTP hacia el nodo de inserción en PostgreSQL. Pendiente de corrección — no afecta
  la persistencia del resto de los campos del evento.
- **Restricción de unicidad en `iocs`.** La tabla `iocs` define `UNIQUE(type, value)`, por
  lo que un mismo indicador (una IP o una credencial) repetido en distintas sesiones se
  registra una sola vez, vinculado a la primera sesión que lo generó. Esto puede subestimar
  la cantidad de sesiones con indicador propio cuando varias sesiones comparten el mismo
  valor. Es una limitación de diseño del esquema, independiente del fix aplicado al
  extractor (ver debajo), y queda como línea de trabajo futuro evaluar un esquema de
  indicadores por sesión.
- **Resiliencia del forwarder.** En corridas largas y sin supervisión activa se observaron
  interrupciones intermitentes en el reenvío de eventos hacia n8n. Se recomienda monitorear
  el proceso en vivo durante validaciones extensas; queda como trabajo futuro reforzar el
  componente con lógica de reintento (backoff) o una cola de mensajes no entregados.
- **Baseline de procesamiento manual estimado, no medido.** La comparación entre
  automatización y análisis manual (P1, Capítulo VI) se apoya en una estimación propia del
  equipo (30 s/evento), no en una medición con evaluadores humanos reales. Queda como línea
  de trabajo futuro cronometrar el análisis manual de una muestra con 2-3 evaluadores.
- **Objetivo específico 5 (enriquecimiento geo/reputación) no ejercido con tráfico real.**
  Todas las sesiones observadas en el laboratorio corresponden a direcciones IP internas;
  el nodo de enriquecimiento nunca procesó una IP pública real, más allá de la verificación
  aislada del servicio externo mencionada arriba.

### Corregido durante la validación

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
documentación técnica y marco legal/estándares); las 11 fuentes restantes de la
bibliografía final (63 en total) se incorporaron por conocimiento propio del equipo o por
rastreo de citas, declarado explícitamente en esa sección.

## Estructura del repositorio

```
├─ docker-compose.yml
├─ .env.example
├─ .gitignore
├─ README.md
├─ BITACORA.md              ← registro de los cambios realizados
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
├─ n8n/
│  └─ workflows/
│     ├─ event-ingest.json          ← canónico
│     ├─ ioc-extractor.json         ← canónico
│     ├─ report-generator.json      ← canónico
│     ├─ report-generator-fixed.json
│     ├─ report-generator-manual.json
│     ├─ test-geo-enrichment.json
│     └─ postgres-credential.example.json
├─ db/
│  └─ schema.sql
├─ scripts/
│  ├─ attack_simulator.py
│  ├─ check_executions.js
│  └─ ... (scripts de simulación y verificación)
├─ datasets-sinteticos/     ← datos sintéticos (NO son evidencia)
│  ├─ generar_dataset.js
│  ├─ dataset_m5.json
│  └─ README.md
├─ experimentos/            ← variantes locales (NO son evidencia)
├─ evidencia/               ← logs y dumps generados (no versionados)
├─ docs/
│  ├─ INVENTARIO_RONDA4.md
│  ├─ M4-PRISMA-template.md
│  └─ M5-protocolo-evaluadores.md
├─ API/                     ← servidor Node.js (dashboard, no parte del pipeline)
└─ Landing page/            ← landing HTML estática
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

