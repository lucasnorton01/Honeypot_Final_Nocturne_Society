# Cowrie Web Interface — Documentación Técnica

## 1. Descripción General

**Cowrie Web Interface** es una aplicación web que permite interactuar con el honeypot Cowrie desde un navegador, visualizar eventos en tiempo real, métricas del sistema, Indicadores de Compromiso (IoCs) y comandos ejecutados. Está diseñada para facilitar la demostración del sistema ante el tribunal de tesis sin requerir instalación de herramientas adicionales.

---

## 2. Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  Navegador del usuario (Browser)                        │
│  ┌───────────────────┐  ┌────────────────────────────┐  │
│  │  Terminal web      │  │  Dashboard en vivo         │  │
│  │  (xterm.js)        │  │  (Eventos, Métricas,       │  │
│  │  ←WebSocket→       │  │   IoCs, Comandos,          │  │
│  │                    │  │   Landing Page embebida)    │  │
│  └─────────┬─────────┘  └─────────────┬──────────────┘  │
└────────────┼───────────────────────────┼─────────────────┘
             │ WebSocket (Socket.IO)     │ HTTP/REST
┌────────────▼───────────────────────────▼─────────────────┐
│  server.js (Node.js + Express + Socket.IO)               │
│  Puerto: 4000                                             │
│                                                           │
│  ┌─────────────────┐  ┌────────────────┐                 │
│  │  CowrieBridge    │  │  EventStream   │                 │
│  │  (Puente SSH)    │  │  (Polling DB)  │                 │
│  └────────┬────────┘  └───────┬────────┘                 │
└───────────┼────────────────────┼─────────────────────────┘
            │ SSH                │ TCP
┌───────────▼────────┐  ┌───────▼─────────────────────────┐
│  Cowrie Honeypot    │  │  PostgreSQL                      │
│  Puerto: 2222 (SSH) │  │  Puerto: 5433 (desde Docker)     │
│  Puerto: 2323 (Tel) │  │  Base: honeypot                   │
└────────────────────┘  └─────────────────────────────────┘
```

---

## 3. Componentes

### 3.1 Backend (Node.js)

| Archivo | Función |
|---------|---------|
| `server.js` | Servidor principal. Express + Socket.IO. Maneja login, WebSocket, y sirve archivos estáticos. |
| `services/cowrie-bridge.js` | Puente SSH entre el navegador y Cowrie. Usa el paquete `ssh2` para conectarse al puerto 2222. |
| `services/database.js` | Consultas SQL a PostgreSQL. Events, IoCs, Reports, Stats. |
| `services/event-stream.js` | Polling cada 2 segundos a la tabla `events`. Emite eventos nuevos por WebSocket y alertas a Telegram. |
| `routes/api.js` | Endpoints REST: `/api/events`, `/api/iocs`, `/api/reports`, `/api/stats`, `/api/health`. |

### 3.2 Frontend (Vanilla JS)

| Archivo | Función |
|---------|---------|
| `public/index.html` | SPA principal. Pantalla de login + layout con terminal y panel de métricas. |
| `public/css/style.css` | Estilos dark theme (SOC dashboard). |
| `public/js/app.js` | Orquestación. Login, inicialización de componentes. |
| `public/js/terminal.js` | xterm.js. Terminal web conectada al bridge SSH. Tracking de comandos. |
| `public/js/dashboard.js` | Eventos en vivo, métricas, IoCs, comandos. |
| `public/landing/index.html` | Landing page de la tesis embebida en pestaña "Dashboard". |

### 3.3 Dependencias

| Paquete | Versión | Uso |
|---------|---------|-----|
| `express` | ^4.21.0 | Servidor HTTP y archivos estáticos |
| `socket.io` | ^4.7.5 | WebSocket bidireccional |
| `pg` | ^8.13.0 | Cliente PostgreSQL |
| `ssh2` | ^1.16.0 | Conexión SSH a Cowrie |
| `dotenv` | ^16.4.5 | Variables de entorno |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing |

---

## 4. Instalación

### 4.1 Prerrequisitos

- Node.js >= 18
- Docker Desktop corriendo
- Cowrie y PostgreSQL levantados via `docker compose up -d`

### 4.2 Pasos

```powershell
# 1. Navegar a la carpeta de la API
cd "C:\Users\lnorton\Desktop\Tesis 15 Septiembre\Honeypot_Final_Nocturne_Society-main\API"

# 2. Instalar dependencias
npm install

# 3. Crear archivo de configuración
Copy-Item .env.example .env

# 4. Editar .env si es necesario (puertos, credenciales DB, Telegram)
notepad .env

# 5. Levantar el servidor
npm start
```

### 4.3 Archivo de Configuración (.env)

```env
PORT=4000
COWRIE_HOST=localhost
COWRIE_SSH_PORT=2222
DB_HOST=localhost
DB_PORT=5433
DB_NAME=honeypot
DB_USER=honeypot
DB_PASSWORD=honeypot_pass
TELEGRAM_BOT_TOKEN=<token-del-bot>
TELEGRAM_CHAT_ID=<chat-id>
```

### 4.4 Acceso

Abrir el navegador en: **http://localhost:4000**

---

## 5. Funcionalidades

### 5.1 Sistema de Autenticación

- Pantalla de login al acceder a la interfaz.
- Credenciales válidas: `admin` / `test123`.
- Login exitoso: acceso al terminal y dashboard.
- Login fallido: mensaje de error + alerta a Telegram con usuario, contraseña intentada e IP.
- Botón "Reconectar": vuelve a mostrar la pantalla de login para re-autenticarse.

### 5.2 Terminal SSH Web

- Emulador de terminal **xterm.js** en el navegador.
- Conexión bidireccional via WebSocket a Cowrie (puerto 2222).
- Soporte de colores ANSI, resize de terminal, scrollback.
- Tracking de comandos: cada comando escrito se registra y se muestra en la pestaña "Comandos".
- Alerta a Telegram por cada comando ejecutado.

### 5.3 Eventos en Tiempo Real

- Polling cada 2 segundos a la tabla `events` de PostgreSQL.
- Nuevos eventos emitidos via WebSocket a todos los clientes conectados.
- Cada evento se muestra con: timestamp, tipo de evento, IP origen, mensaje.
- Alerta a Telegram por cada evento nuevo con ícono según tipo:
  - ✅ Login exitoso
  - ❌ Login fallido
  - 🖥️ Comando ejecutado
  - 🔗 Sesión
  - 📡 Otros eventos

### 5.4 Dashboard de Métricas

- **Eventos totales**: conteo total de la tabla `events`.
- **IoCs extraídos**: conteo total de la tabla `iocs`.
- **Sesiones**: cantidad de sesiones únicas.
- **Reducción P1**: 99% (resultado de la tesis).
- **Top tipos de evento**: los 10 eventos más frecuentes.
- **Top IPs origen**: las 10 IPs que más atacaron.

### 5.5 Indicadores de Compromiso (IoCs)

- Tabla de IoCs extraídos del pipeline automatizado.
- Columnas: tipo, valor, fuente, confianza, fecha de creación.
- Tipos: IP, credencial, hash, URL, dominio.

### 5.6 Landing Page Embebida

- Pestaña "Dashboard" muestra la landing page de la tesis en un iframe.
- Incluye todos los gráficos y métricas de las hipótesis P1-P4.
- Permite al tribunal navegar el análisis completo sin salir de la interfaz.

---

## 6. API REST

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/events` | GET | Listar eventos (params: limit, offset, eventid, src_ip, since) |
| `/api/events/count` | GET | Conteo total de eventos |
| `/api/iocs` | GET | Listar IoCs (params: limit, offset, type) |
| `/api/iocs/count` | GET | Conteo total de IoCs |
| `/api/reports` | GET | Listar reportes |
| `/api/stats` | GET | Métricas agregadas |
| `/api/health` | GET | Health check de PostgreSQL |
| `/api/login` | POST | Login (acepta solo admin/test123) |

---

## 7. WebSocket Events

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `auth:login` | client → server | Credenciales de login |
| `auth:success` | server → client | Login exitoso |
| `auth:failure` | server → client | Login fallido |
| `terminal:input` | client → server | Datos escritos por el usuario |
| `terminal:output` | server → client | Salida de Cowrie |
| `terminal:connected` | server → client | Sesión SSH establecida |
| `terminal:error` | server → client | Error de conexión |
| `terminal:resize` | client → server | Redimensionar terminal |
| `terminal:reconnect` | client → server | Solicitar reconexión |
| `event:new` | server → client | Nuevo evento de honeypot |
| `stats:update` | server → client | Métricas actualizadas |
| `command:executed` | client → server → client | Comando ejecutado |

---

## 8. Integración con Telegram

### 8.1 Configuración

Las credenciales del bot de Telegram se configuran en el archivo `.env`:

```env
TELEGRAM_BOT_TOKEN=8966577069:AAH-...
TELEGRAM_CHAT_ID=8855727280
```

### 8.2 Alertas Enviadas

| Evento | Icono | Contenido |
|--------|-------|-----------|
| Servidor iniciado | 🚀 | Puerto de escucha |
| Login exitoso | ✅ | Usuario, IP del cliente |
| Login fallido | 🚨 | Usuario, contraseña intentada, IP (intento de acceso no autorizado) |
| Comando ejecutado | 🖥️ | Usuario, comando escrito |
| Evento nuevo | 📡/✅/❌/🔗 | Tipo de evento, IP, usuario, detalle |
| Error de conexión | ⚠️ | Usuario, mensaje de error |

---

## 9. Base de Datos

### 9.1 Schema (schema.sql)

```sql
-- Eventos crudos enriquecidos
CREATE TABLE events (
    id          BIGSERIAL PRIMARY KEY,
    eventid     TEXT NOT NULL,
    session     TEXT,
    src_ip      INET,
    src_port    INTEGER,
    username    TEXT,
    password    TEXT,
    input       TEXT,
    message     TEXT,
    timestamp   TIMESTAMPTZ NOT NULL,
    processed   BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Indicadores de compromiso
CREATE TABLE iocs (
    id          BIGSERIAL PRIMARY KEY,
    type        TEXT NOT NULL,
    value       TEXT NOT NULL,
    confidence  TEXT DEFAULT 'BAJO',
    event_id    BIGINT REFERENCES events(id),
    source      TEXT DEFAULT 'cowrie',
    created_at  TIMESTAMPTZ DEFAULT now(),
    UNIQUE (type, value)
);

-- Reportes periódicos
CREATE TABLE reports (
    id           BIGSERIAL PRIMARY KEY,
    period_start TIMESTAMPTZ,
    period_end   TIMESTAMPTZ,
    content      JSONB,
    created_at   TIMESTAMPTZ DEFAULT now()
);

-- Registro de errores
CREATE TABLE error_log (
    id          BIGSERIAL PRIMARY KEY,
    workflow    TEXT,
    node        TEXT,
    error       TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);
```

### 9.2 Datos de Ejemplo

- **201.125** eventos en el corpus sintético
- **4.234** IoCs extraídos
- **30** reportes generados
- **13** eventos en la ventana de observación

---

## 10. Estructura de Archivos

```
API/
├── .env                          # Variables de entorno (no subir al repo)
├── .env.example                  # Template de configuración
├── package.json                  # Dependencias Node.js
├── server.js                     # Servidor principal
├── README.md                     # Instrucciones rápidas
├── services/
│   ├── cowrie-bridge.js          # Puente SSH a Cowrie
│   ├── database.js               # Consultas PostgreSQL
│   └── event-stream.js           # Streaming de eventos en tiempo real
├── routes/
│   └── api.js                    # Endpoints REST
└── public/
    ├── index.html                # SPA principal
    ├── favicon.svg               # Icono de escudo
    ├── css/
    │   └── style.css             # Estilos dark SOC
    ├── js/
    │   ├── app.js                # Orquestación
    │   ├── terminal.js           # xterm.js + comandos
    │   └── dashboard.js          # Métricas, eventos, IoCs
    └── landing/
        ├── index.html            # Landing page de la tesis
        └── chart.umd.min.js     # Librería de gráficos
```

---

## 11. Puertos Utilizados

| Servicio | Puerto | Protocolo |
|----------|--------|-----------|
| Cowrie Web Interface | 4000 | HTTP/WS |
| Cowrie Honeypot (SSH) | 2222 | SSH |
| Cowrie Honeypot (Telnet) | 2323 | Telnet |
| PostgreSQL (Docker) | 5433 | TCP |
| PostgreSQL (Windows) | 5432 | TCP |
| n8n | 5678 | HTTP |
| Log-reader | 9000 | HTTP |

---

## 12. Seguridad

- Las credenciales de login están hardcodeadas para la demostración (admin/test123).
- Los intentos de login fallidos se registran en Telegram con IP del atacante.
- Las variables sensibles (token de Telegram, contraseña de DB) están en `.env`, que no se sube al repositorio.
- La conexión SSH a Cowrie usa las credenciales ingresadas por el usuario.
- PostgreSQL escucha solo en localhost (no expuesto externamente).

---

## 13. Uso para la Defensa de Tesis

1. Levantar Docker: `docker compose up -d`
2. Levantar API: `cd API && npm start`
3. Abrir `http://localhost:4000` en el navegador del tribunal.
4. El tribunal se loguea con `admin` / `test123`.
5. Escribe comandos en la terminal (ej: `ls`, `whoami`, `cat /etc/passwd`).
6. Los eventos aparecen en tiempo real en el panel derecho.
7. Las métricas se actualizan automáticamente.
8. La pestaña "Dashboard" muestra el análisis completo de la tesis.
9. Las alertas de Telegram llegan al investigador en tiempo real.
