require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const CowrieBridge = require('./services/cowrie-bridge');
const EventStream = require('./services/event-stream');
const apiRoutes = require('./routes/api');
const authMiddleware = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// --- Config ---
const PORT = process.env.PORT || 4000;
const COWRIE_HOST = process.env.COWRIE_HOST || 'localhost';
const COWRIE_SSH_PORT = parseInt(process.env.COWRIE_SSH_PORT || '2222');
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'honeypot',
  user: process.env.DB_USER || 'honeypot',
  password: process.env.DB_PASSWORD
};

// Telegram
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// Credenciales válidas (solo estas funcionan)
const VALID_USER = 'admin';
const VALID_PASS = 'test123';

// --- PostgreSQL ---
const pool = new Pool(DB_CONFIG);

// --- Telegram helper ---
async function sendTelegram(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.error('[telegram] Error al enviar:', err.message);
  }
}

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- REST API (requiere auth) ---
app.use('/api', authMiddleware, apiRoutes(pool));

// --- WebSocket + Terminal Bridge ---
const bridges = new Map();

io.on('connection', (socket) => {
  console.log(`[ws] Cliente conectado: ${socket.id}`);

  let loggedIn = false;
  let bridge = null;
  let currentUser = 'unknown';

  // Login via WebSocket — valida credenciales
  socket.on('auth:login', ({ username, password }) => {
    if (username === VALID_USER && password === VALID_PASS) {
      // Login exitoso
      loggedIn = true;
      currentUser = username;
      socket.emit('auth:success', { username });
      sendTelegram(`✅ *Login exitoso*\n👤 Usuario: \`${username}\`\n🌐 IP: \`${socket.handshake.address}\``);

      // Crear bridge SSH a Cowrie
      bridge = new CowrieBridge({
        host: COWRIE_HOST,
        port: COWRIE_SSH_PORT,
        username: currentUser,
        password: password
      });

      bridges.set(socket.id, bridge);

      bridge.on('output', (data) => {
        socket.emit('terminal:output', data);
      });

      bridge.on('connected', () => {
        socket.emit('terminal:connected');
        console.log(`[bridge] Sesión SSH establecida para ${socket.id} (user: ${currentUser})`);
      });

      bridge.on('error', (err) => {
        socket.emit('terminal:error', err.message);
        console.error(`[bridge] Error para ${socket.id}:`, err.message);
      });

      bridge.on('close', () => {
        socket.emit('terminal:closed');
        console.log(`[bridge] Sesión cerrada para ${socket.id}`);
      });

      setTimeout(() => {
        socket.emit('terminal:resize', { cols: 120, rows: 30 });
      }, 500);

    } else {
      // Login fallido — alerta de intento
      socket.emit('auth:failure', { message: 'Usuario o contraseña incorrectos' });
      sendTelegram(
        `🚨 *Intento de acceso no autorizado*\n` +
        `👤 Usuario: \`${username}\`\n` +
        `🔑 Pass: \`${password}\`\n` +
        `🌐 IP: \`${socket.handshake.address}\``
      );
    }
  });

  // Input del terminal
  socket.on('terminal:input', (data) => {
    if (bridge && loggedIn) {
      bridge.write(data);
    }
  });

  // Resize del terminal
  socket.on('terminal:resize', (size) => {
    if (bridge && loggedIn) {
      bridge.resize(size.cols, size.rows);
    }
  });

  // Comando ejecutado — alerta Telegram + broadcast al dashboard
  socket.on('command:executed', (cmd) => {
    sendTelegram(`🖥️ *Comando ejecutado*\n👤 \`${currentUser}\`\n💻 \`${cmd.command}\``);
    socket.emit('command:executed', cmd);
  });

  // Reconexión
  socket.on('terminal:reconnect', () => {
    if (bridge) {
      bridge.close();
      bridges.delete(socket.id);
    }
    if (loggedIn) {
      bridge = new CowrieBridge({
        host: COWRIE_HOST,
        port: COWRIE_SSH_PORT
      });
      bridges.set(socket.id, bridge);
      bridge.on('output', (data) => socket.emit('terminal:output', data));
      bridge.on('connected', () => socket.emit('terminal:connected'));
      bridge.on('error', (err) => socket.emit('terminal:error', err.message));
      bridge.on('close', () => socket.emit('terminal:closed'));
    }
  });

  // Desconexión
  socket.on('disconnect', () => {
    if (bridge) {
      bridge.close();
      bridges.delete(socket.id);
    }
    console.log(`[ws] Cliente desconectado: ${socket.id}`);
  });
});

// --- Event Stream ---
const eventStream = new EventStream(pool, io, sendTelegram);
eventStream.start(2000);

// --- Start ---
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║  Cowrie Web Interface                        ║
║  http://localhost:${PORT}                       ║
╚══════════════════════════════════════════════╝
  `);
  sendTelegram(`🚀 *Cowrie Web iniciado*\n Puerto: ${PORT}`);
});
