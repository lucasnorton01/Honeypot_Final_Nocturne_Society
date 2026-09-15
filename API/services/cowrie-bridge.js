const { Client } = require('ssh2');
const { EventEmitter } = require('events');

/**
 * CowrieBridge — puente SSH entre el terminal del browser y Cowrie.
 * 
 * Flujo:
 *   browser ←WebSocket→ CowrieBridge ←SSH→ Cowrie (:2222)
 * 
 * Emite:
 *   'output'     — datos de stdout de Cowrie (para enviar al browser)
 *   'connected'  — sesión SSH establecida
 *   'error'      — error de conexión
 *   'close'      — conexión cerrada
 */
class CowrieBridge extends EventEmitter {
  constructor({ host = 'localhost', port = 2222, username = 'admin', password = 'test123' } = {}) {
    super();
    this.host = host;
    this.port = port;
    this.username = username;
    this.password = password;
    this.ssh = null;
    this.stream = null;
    this._connect();
  }

  _connect() {
    this.ssh = new Client();

    this.ssh.on('ready', () => {
      this.ssh.shell({ term: 'xterm-256color' }, (err, stream) => {
        if (err) {
          this.emit('error', err);
          return;
        }

        this.stream = stream;

        stream.on('close', () => {
          this.emit('close');
          this.ssh.end();
        });

        stream.on('data', (data) => {
          this.emit('output', data.toString('utf-8'));
        });

        stream.stderr.on('data', (data) => {
          this.emit('output', data.toString('utf-8'));
        });

        this.emit('connected');
      });
    });

    this.ssh.on('error', (err) => {
      this.emit('error', err);
    });

    this.ssh.connect({
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      // Cowrie acepta cualquier credencial, pero necesita una
      readyTimeout: 10000,
      algorithms: {
        kex: [
          'ecdh-sha2-nistp256',
          'ecdh-sha2-nistp384',
          'ecdh-sha2-nistp521',
          'diffie-hellman-group-exchange-sha256',
          'diffie-hellman-group14-sha256',
          'diffie-hellman-group14-sha1'
        ]
      }
    });
  }

  /**
   * Enviar datos del browser a la terminal de Cowrie
   */
  write(data) {
    if (this.stream) {
      this.stream.write(data);
    }
  }

  /**
   * Redimensionar la terminal
   */
  resize(cols, rows) {
    if (this.stream) {
      this.stream.setWindow(rows, cols, 0, 0);
    }
  }

  /**
   * Cerrar la conexión SSH
   */
  close() {
    if (this.stream) {
      this.stream.close();
    }
    if (this.ssh) {
      this.ssh.end();
    }
  }
}

module.exports = CowrieBridge;
