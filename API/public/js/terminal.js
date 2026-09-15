/**
 * Terminal — xterm.js conectado al backend via WebSocket.
 * Trackea comandos escritos por el usuario.
 */
class TerminalManager {
  constructor(socket) {
    this.socket = socket;
    this.term = null;
    this.fitAddon = null;
    this.connected = false;
    this.commandBuffer = '';
    this.commands = [];
  }

  init() {
    const container = document.getElementById('terminal-container');

    this.term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
      theme: {
        background: '#0c0c0c',
        foreground: '#e2e8f0',
        cursor: '#3b82f6',
        cursorAccent: '#0c0c0c',
        selectionBackground: 'rgba(59, 130, 246, 0.3)',
        black: '#1a2236',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#e2e8f0',
        brightBlack: '#64748b',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#facc15',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#f8fafc'
      },
      allowProposedApi: true,
      scrollback: 10000
    });

    this.fitAddon = new FitAddon.FitAddon();
    this.term.loadAddon(this.fitAddon);

    const webLinksAddon = new WebLinksAddon.WebLinksAddon();
    this.term.loadAddon(webLinksAddon);

    this.term.open(container);
    this.fitAddon.fit();

    // --- Input del usuario: trackear comandos ---
    this.term.onData((data) => {
      if (!this.connected) return;

      this.socket.emit('terminal:input', data);

      // Detectar Enter para capturar comandos
      if (data === '\r' || data === '\n') {
        const cmd = this.commandBuffer.trim();
        if (cmd) {
          this._trackCommand(cmd);

          // exit → volver a login
          if (cmd === 'exit') {
            setTimeout(() => this._reconnect(), 500);
          }
        }
        this.commandBuffer = '';
      } else if (data === '\x7f') {
        // Backspace
        this.commandBuffer = this.commandBuffer.slice(0, -1);
      } else if (data >= ' ') {
        // Carácter imprimible
        this.commandBuffer += data;
      }
    });

    // Resize
    window.addEventListener('resize', () => {
      this.fitAddon.fit();
      if (this.connected) {
        this.socket.emit('terminal:resize', {
          cols: this.term.cols,
          rows: this.term.rows
        });
      }
    });

    setTimeout(() => {
      this.fitAddon.fit();
      this.socket.emit('terminal:resize', {
        cols: this.term.cols,
        rows: this.term.rows
      });
    }, 100);

    // --- Socket events ---
    this.socket.on('terminal:output', (data) => {
      this.term.write(data);
    });

    this.socket.on('terminal:connected', () => {
      this.connected = true;
      this._updateStatus('connected');
      this.term.focus();
    });

    this.socket.on('terminal:error', (msg) => {
      this.connected = false;
      this._updateStatus('disconnected');
      this.term.writeln('\r\n\x1b[31m[Error] ' + msg + '\x1b[0m');
    });

    this.socket.on('terminal:closed', () => {
      this.connected = false;
      this._updateStatus('disconnected');
      this.term.writeln('\r\n\x1b[33m[Conexión cerrada]\x1b[0m');
    });

    // Botones
    document.getElementById('btn-reconnect').addEventListener('click', () => {
      this._reconnect();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      this.term.clear();
    });

    console.log('[terminal] xterm.js inicializado');
  }

  _trackCommand(cmd) {
    const entry = {
      command: cmd,
      user: this.socket.id,
      timestamp: new Date().toISOString()
    };
    this.commands.push(entry);

    // Emitir al dashboard para mostrar en la pestaña de comandos
    this.socket.emit('command:executed', entry);

    console.log('[terminal] Comando registrado:', cmd);
  }

  _updateStatus(state) {
    const el = document.getElementById('connection-status');
    el.className = 'status';
    switch (state) {
      case 'connected':
        el.classList.add('status-connected');
        el.textContent = 'Conectado a Cowrie';
        break;
      case 'connecting':
        el.classList.add('status-connecting');
        el.textContent = 'Conectando...';
        break;
      default:
        el.classList.add('status-disconnected');
        el.textContent = 'Desconectado';
    }
  }

  _reconnect() {
    // Cerrar bridge actual
    this.connected = false;
    this._updateStatus('disconnected');

    // Mostrar pantalla de login
    const loginScreen = document.getElementById('login-screen');
    const appScreen = document.getElementById('app');
    appScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');

    // Limpiar campos
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('username').focus();
  }
}
