# Cowrie Web Interface

Interfaz web para el honeypot Cowrie — terminal SSH en el browser + dashboard de métricas en tiempo real.

## Arquitectura

```
Browser (xterm.js)  ←──WebSocket──→  server.js (Node.js)  ←──SSH──→  Cowrie (:2222)
                                         ↕
                                    PostgreSQL (:5432)
```

## Requisitos

- Node.js >= 18
- Cowrie corriendo en Docker (puerto 2222 SSH)
- PostgreSQL corriendo en Docker (puerto 5432)

## Instalación

```bash
cd API
npm install
cp .env.example .env
# Editar .env si es necesario
npm start
```

Abrir http://localhost:3000

## Uso

1. Abrir la interfaz en el browser
2. Hacer clic en la terminal
3. Loguearte con credenciales de Cowrie (cualquier user/pass funciona, Cowrie las registra)
4. Los eventos aparecen en tiempo real en el panel derecho
5. Las métricas se actualizan automáticamente

## Estructura

```
API/
├── server.js                    # Servidor principal (Express + Socket.IO)
├── .env.example                 # Template de variables de entorno
├── package.json
├── services/
│   ├── cowrie-bridge.js         # Puente SSH entre browser y Cowrie
│   ├── database.js              # Consultas PostgreSQL
│   └── event-stream.js          # Streaming de eventos en tiempo real
├── routes/
│   └── api.js                   # Endpoints REST (/api/events, /api/iocs, etc.)
└── public/
    ├── index.html               # SPA principal
    ├── css/style.css            # Estilos dark SOC
    └── js/
        ├── app.js               # Orquestación
        ├── terminal.js          # xterm.js + WebSocket bridge
        └── dashboard.js         # Eventos en vivo + métricas + IoCs
```

## API REST

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/events` | GET | Listar eventos (params: limit, offset, eventid, src_ip, since) |
| `/api/events/count` | GET | Conteo total de eventos |
| `/api/iocs` | GET | Listar IoCs (params: limit, offset, type) |
| `/api/iocs/count` | GET | Conteo total de IoCs |
| `/api/reports` | GET | Listar reportes |
| `/api/stats` | GET | Métricas agregadas |
| `/api/health` | GET | Health check |

## WebSocket Events

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `terminal:input` | browser → server | Datos escritos por el usuario |
| `terminal:output` | server → browser | Salida de Cowrie |
| `terminal:connected` | server → browser | Sesión SSH establecida |
| `terminal:error` | server → browser | Error de conexión |
| `terminal:resize` | browser → server | Redimensionar terminal |
| `event:new` | server → browser | Nuevo evento de honeypot |
| `stats:update` | server → browser | Métricas actualizadas |
