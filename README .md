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
| cowrie       | `cowrie/cowrie`    | 2222 (SSH), 2323 (Telnet) | Honeypot de baja interacción |
| forwarder    | build `./forwarder`| —            | Lee `cowrie.json` y lo reenvía a n8n    |
| log-reader   | build `./log-reader`| 9000         | Expone `/events` y `/report` del log    |
| postgres     | `postgres:16`      | — (interno)  | Persistencia estructurada               |
| n8n          | `n8nio/n8n`        | 5678         | Automatización de workflows             |

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

## Resultados de validación

Verificación de las hipótesis operativas P1-P4 (criterios definidos en la tesis, §4.9).
La medición de referencia de cada hipótesis es la reportada en la Tabla 7.1 del
documento; P3 y P4 cuentan además con validaciones complementarias realizadas en
entornos y momentos posteriores, documentadas en el Anexo V.

| Hipótesis | Umbral exigido | Resultado | Veredicto |
|-----------|-----------------|-----------|-----------|
| **P1** — Reducción de tiempo de procesamiento | ≥ 50 % frente al tiempo manual estimado (30 s) | 297 ms/evento (99 % de reducción) | **Aceptada** |
| **P2** — Estructuración de datos | ≥ 80 % de eventos en JSON válido | 100 % estructurados | **Aceptada** |
| **P3** — Generación de IoCs | ≥ 70 % de sesiones maliciosas confirmadas | 9/9 sesiones (100 %, n = 9, IC 95 % Wilson [70,1 %, 100 %]); IoCs de tipo comando en 1/9 | **Confirmada** (sostenida y reforzada en validaciones complementarias, ver abajo) |
| **P4** — Reportes automatizados | ≥ 90 % de ataques de interés (sesión con autenticación exitosa) | 7/8 (87,5 %) en la medición original | **No confirmada** (cuatro mediciones independientes son consistentes; ninguna alcanza el umbral con 95 % de confianza, ver abajo) |

### Validaciones complementarias de P3

| Validación | n | P3 amplio (≥1 IoC) | P3 comando | Entorno |
|------------|---|---------------------|------------|---------|
| Original (Tabla 7.1) | 9 | 100 % [70,1 %, 100 %] | 1/9 (11,1 %) | Laboratorio original, primera validación |
| Complementaria 1 | 10 | 100 % [72,2 %, 100 %] | 2/10 (20 %) | Laboratorio original, ventana 09:44–11:05 ART |
| Complementaria 2 | 10 | 100 % [72,2 %, 100 %] | 6/10 (60 %) [31,3 %, 83,2 %] | Laboratorio original, muestra con comandos post-explotación diversificados a propósito |

El indicador amplio se sostiene en 100 % en las tres validaciones. El indicador de tipo
comando aumenta progresivamente porque las dos primeras validaciones usaron mayormente
comandos de reconocimiento estándar (`whoami`, `uname -a`, `cat`, `ls`, `w`), que no
coinciden con el patrón que define un IoC de comando (`wget|curl|nc|python|/bin|sh|bash|
chmod|tftp`); al diversificar deliberadamente los comandos post-explotación, el indicador
subió a 60 %.

### Mediciones complementarias de P4

| Medición | n | P4 | IC 95 % Wilson | Método |
|----------|---|-----|-----------------|--------|
| M1 (original, Tabla 7.1) | 8 | 87,5 % | [50,0 %, 99,7 %] | Verificación original |
| M2 (validación complementaria) | 4 | 100 % | [47,8 %, 100 %] | Verificación original |
| M3 (ventana ampliada, primer intento) | 41 | — | — | **Descartada** — cobertura definida por presencia de IP en `top_ips`, trivialmente satisfecha en un laboratorio con 2-3 IPs distintas |
| M4 (cobertura por sesión) | 12 | 100 % | [75,7 %, 100 %] | Cobertura verificada por `session_id` específico contra el campo `sesiones_cubiertas` del reporte, aislando exclusivamente las sesiones de una corrida puntual |

Las cuatro mediciones válidas son consistentes entre sí (87,5 %–100 %), pero ninguna
alcanza el umbral de ≥ 90 % con el límite inferior de su intervalo de confianza al 95 %.
M4 corrige un defecto metodológico real de M3 (cobertura por IP en lugar de por sesión) y
se ejecutó con el cron acelerado temporalmente solo a fines de la medición, restaurado a
su configuración original (`0 8 * * *`) al finalizar; por ese motivo valida la lógica de
conteo del mecanismo, pero no reproduce exactamente el *timing* operativo de un cron
diario en producción.

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

## Seguridad

- El entorno **no expone puertos a Internet**. Cowrie escucha solo en `localhost`
  (puertos 2222/2323) y el resto de servicios se comunican por la red interna de Docker.
- **No subir al repositorio**: `.env`, tokens, `evidencia/`, ni bases de datos locales.
  Ver `.gitignore`.
- Todo dato utilizado en la validación de las hipótesis proviene de tráfico generado
  localmente contra el propio laboratorio; no se fabricaron ni sustituyeron eventos,
  indicadores ni reportes para alcanzar un resultado — los intentos de replicación que no
  lograron generar evidencia verificable, y las mediciones descartadas por defectos
  metodológicos, se documentan como tales (ver Anexo V de la tesis), no se completan ni se
  reemplazan con datos artificiales.

---

