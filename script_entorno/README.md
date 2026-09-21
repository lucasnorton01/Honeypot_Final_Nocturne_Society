# Script de Setup Automático

Scripts para levantar todo el entorno del honeypot en una PC nueva.

## Uso rápido

### Windows (PowerShell)
```powershell
.\script_entorno\setup.ps1
```

### Linux/Mac (Bash)
```bash
chmod +x script_entorno/setup.sh
./script_entorno/setup.sh
```

## Qué hace el setup

1. **Verifica prerequisitos** — Docker, Node.js, Git
2. **Crea archivos .env** — desde las plantillas `.env.example`
3. **Levanta Docker** — PostgreSQL, Cowrie, n8n, forwarder, log-reader
4. **Instala dependencias** — `npm install` en API/
5. **Configura n8n** — owner account, credential Postgres, importa workflows
6. **Verifica estado** — muestra servicios corriendo y eventos en DB

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `setup.ps1` | Script principal para Windows |
| `setup.sh` | Script principal para Linux/Mac |
| `import-n8n.js` | Setup de n8n (owner + credential + workflows) |

## Después del setup

```powershell
# Correr el API server
cd API
npm start
```

## Credenciales

| Servicio | Variable de entorno | Nota |
|----------|-------------------|------|
| n8n | `N8N_EMAIL`, `N8N_PASS` | Definir en `.env` |
| API/SSH | `admin` | Credencial del honeypot (cowrie/userdb.txt) |
| PostgreSQL | `POSTGRES_USER`, `POSTGRES_PASSWORD` | Definir en `.env` |

## Webhooks

| URL | Uso |
|-----|-----|
| `http://localhost:5678/webhook/cowrie` | Recibir eventos de Cowrie |
| `http://localhost:4000/api/stats` | API de estadísticas |
| `http://localhost:4000/api/events` | API de eventos |
| `http://localhost:4000/api/iocs` | API de IoCs |

## Troubleshooting

### PostgreSQL no levanta
```bash
docker logs postgres
# Verificar que schema.sql existe y es válido
```

### n8n no conecta a PostgreSQL
El credential debe tener `ssl: "disable"` (string, no boolean).
Verificar en n8n UI → Settings → Credentials → Postgres.

### Webhook retorna 404
Verificar que el workflow `event-ingest` está ACTIVO en n8n.

### API no muestra datos
Verificar que `npm start` corrió sin errores y que PostgreSQL tiene eventos.
