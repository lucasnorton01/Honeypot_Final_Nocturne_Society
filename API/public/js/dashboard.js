/**
 * Dashboard — eventos en vivo, métricas, IoCs, comandos.
 */
class Dashboard {
  constructor(socket) {
    this.socket = socket;
    this.eventCount = 0;
    this.eventsFeed = document.getElementById('events-feed');
    this.commandsFeed = document.getElementById('commands-feed');
  }

  init() {
    this._initTabs();
    this._initSocketListeners();
    this._loadInitialData();
    console.log('[dashboard] Inicializado');
  }

  // --- Tabs ---
  _initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('tabindex', '-1');
        });
        document.querySelectorAll('.tab-content').forEach(c => {
          c.classList.remove('active');
          c.setAttribute('aria-hidden', 'true');
          c.setAttribute('tabindex', '-1');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        tab.setAttribute('tabindex', '0');
        const tabId = tab.getAttribute('data-tab');
        const panel = document.getElementById('tab-' + tabId);
        panel.classList.add('active');
        panel.removeAttribute('aria-hidden');
        panel.setAttribute('tabindex', '0');

        if (tabId === 'iocs') this._loadIoCs();
        if (tabId === 'metrics') this._loadMetrics();
      });
    });
  }

  // --- Cargar datos iniciales ---
  async _loadInitialData() {
    await this._loadMetrics();
    await this._loadIoCs();
  }

  // --- Socket listeners ---
  _initSocketListeners() {
    // Evento nuevo en tiempo real
    this.socket.on('event:new', (event) => {
      this._addEventToFeed(event);
      this.eventCount++;
      document.getElementById('event-counter').textContent = this.eventCount + ' eventos (esta sesión)';
    });

    // Stats actualizados
    this.socket.on('stats:update', (stats) => {
      this._updateStats(stats);
    });

    // Comando ejecutado
    this.socket.on('command:executed', (cmd) => {
      this._addCommandToFeed(cmd);
    });
  }

  // --- Events Feed ---
  _addEventToFeed(event) {
    const empty = this.eventsFeed.querySelector('.events-empty');
    if (empty) empty.remove();

    const div = document.createElement('div');
    div.className = 'event-item';

    if (event.eventid && event.eventid.includes('login_success')) {
      div.classList.add('event-login');
    } else if (event.eventid && event.eventid.includes('login_failed')) {
      div.classList.add('event-login');
    } else if (event.eventid && event.eventid.includes('command.input')) {
      div.classList.add('event-input');
    } else if (event.eventid && event.eventid.includes('session')) {
      div.classList.add('event-session');
    }

    const time = event.timestamp ? new Date(event.timestamp).toLocaleTimeString('es-AR') : '--:--';
    const typeClass = this._getEventClass(event.eventid);

    div.innerHTML = `
      <span class="event-time">${time}</span>
      <span class="event-type ${typeClass}">${this._formatEventId(event.eventid)}</span>
      <span class="event-detail">${this._escapeHtml(event.message || '')}</span>
      <span class="event-ip">${event.src_ip || ''}</span>
    `;

    this.eventsFeed.insertBefore(div, this.eventsFeed.firstChild);

    while (this.eventsFeed.children.length > 100) {
      this.eventsFeed.removeChild(this.eventsFeed.lastChild);
    }
  }

  _getEventClass(eventid) {
    if (!eventid) return '';
    if (eventid.includes('login_success')) return 'type-login_success';
    if (eventid.includes('login_failed')) return 'type-login_failed';
    if (eventid.includes('command.input')) return 'type-command_input';
    if (eventid.includes('session')) return 'type-session_open';
    return '';
  }

  _formatEventId(eventid) {
    if (!eventid) return 'unknown';
    return eventid.replace('cowrie.ssh.', '').replace('cowrie.telnet.', '');
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // --- Commands Feed ---
  _addCommandToFeed(cmd) {
    const empty = this.commandsFeed.querySelector('.events-empty');
    if (empty) empty.remove();

    const div = document.createElement('div');
    div.className = 'command-item';

    const time = new Date(cmd.timestamp).toLocaleTimeString('es-AR');

    div.innerHTML = `
      <span class="command-time">${time}</span>
      <span class="command-text">$ ${this._escapeHtml(cmd.command)}</span>
    `;

    this.commandsFeed.insertBefore(div, this.commandsFeed.firstChild);

    while (this.commandsFeed.children.length > 50) {
      this.commandsFeed.removeChild(this.commandsFeed.lastChild);
    }
  }

  // --- Stats ---
  _updateStats(stats) {
    document.getElementById('stat-events').textContent = this._formatNumber(stats.totalEvents);
    document.getElementById('stat-iocs').textContent = this._formatNumber(stats.totalIocs);
    document.getElementById('stat-sessions').textContent = this._formatNumber(stats.totalSessions);

    const topEventsList = document.getElementById('top-events-list');
    topEventsList.innerHTML = '';
    if (stats.topEvents) {
      stats.topEvents.forEach(item => {
        const div = document.createElement('div');
        div.className = 'top-item';
        div.innerHTML = `
          <span class="top-item-label">${this._formatEventId(item.eventid)}</span>
          <span class="top-item-count">${this._formatNumber(item.count)}</span>
        `;
        topEventsList.appendChild(div);
      });
    }
  }

  async _loadMetrics() {
    try {
      const res = await fetch('/api/stats');
      const json = await res.json();
      if (json.ok && json.data) {
        this._updateStats({
          totalEvents: json.data.totalEvents,
          totalIocs: json.data.totalIocs,
          totalSessions: json.data.totalSessions,
          topEvents: json.data.topEventTypes
        });

        // Top IPs
        const topIpsList = document.getElementById('top-ips-list');
        topIpsList.innerHTML = '';
        if (json.data.topSourceIps) {
          json.data.topSourceIps.forEach(item => {
            const div = document.createElement('div');
            div.className = 'top-item';
            div.innerHTML = `
              <span class="top-item-label">${item.src_ip}</span>
              <span class="top-item-count">${this._formatNumber(item.count)}</span>
            `;
            topIpsList.appendChild(div);
          });
        }
      }
    } catch (err) {
      console.error('[dashboard] Error al cargar métricas:', err);
    }
  }

  _formatNumber(n) {
    if (n === undefined || n === null) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  }

  // --- IoCs ---
  async _loadIoCs() {
    try {
      const res = await fetch('/api/iocs?limit=50');
      const json = await res.json();
      const tbody = document.getElementById('iocs-tbody');

      if (!json.ok || !json.data.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No hay IoCs registrados</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      json.data.forEach(ioc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="badge badge-sm">${ioc.type}</span></td>
          <td style="font-family: var(--font-mono); font-size: 11px;">${this._escapeHtml(ioc.value)}</td>
          <td>${this._escapeHtml(ioc.context || '')}</td>
          <td>${ioc.confidence || '-'}</td>
          <td>${ioc.created_at ? new Date(ioc.created_at).toLocaleString('es-AR') : '-'}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('[dashboard] Error al cargar IoCs:', err);
    }
  }
}
