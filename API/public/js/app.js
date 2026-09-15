/**
 * App — punto de entrada. Login, WebSocket, terminal, dashboard.
 */
(function () {
  'use strict';

  const socket = io();

  // --- Login ---
  const loginScreen = document.getElementById('login-screen');
  const appScreen = document.getElementById('app');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const userDisplay = document.getElementById('user-display');

  let currentUser = null;
  let terminal = null;
  let dashboard = null;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginError.style.display = 'none';

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      showLoginError('Ingresá usuario y contraseña');
      return;
    }

    // Enviar login via WebSocket
    socket.emit('auth:login', { username, password });
  });

  socket.on('auth:success', ({ username }) => {
    currentUser = username;
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
    userDisplay.textContent = `@${username}`;

    // Inicializar terminal y dashboard
    initApp();
  });

  socket.on('auth:failure', ({ message }) => {
    showLoginError(message);
  });

  function showLoginError(msg) {
    loginError.textContent = msg;
    loginError.style.display = 'block';
    passwordInput.value = '';
    passwordInput.focus();
  }

  // --- App principal ---
  function initApp() {
    // Limpiar instancias anteriores si existen
    if (terminal) {
      terminal = null;
    }
    if (dashboard) {
      dashboard = null;
    }

    // Crear nuevas instancias
    terminal = new TerminalManager(socket);
    dashboard = new Dashboard(socket);

    terminal.init();
    dashboard.init();

    console.log('[app] Componentes inicializados para usuario:', currentUser);
  }

  // --- Log de conexión ---
  socket.on('connect', () => {
    console.log('[app] WebSocket conectado:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('[app] WebSocket desconectado');
    if (appScreen && !appScreen.classList.contains('hidden')) {
      document.getElementById('connection-status').className = 'status status-disconnected';
      document.getElementById('connection-status').textContent = 'Desconectado del servidor';
    }
  });

  console.log('[app] Cowrie Web Interface iniciada');
})();
