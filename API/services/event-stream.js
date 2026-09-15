/**
 * EventStream — emite eventos nuevos de PostgreSQL a todos los clientes WebSocket.
 * Envía alertas a Telegram en cada evento nuevo.
 */
class EventStream {
  constructor(pool, io, sendTelegram) {
    this.pool = pool;
    this.io = io;
    this.sendTelegram = sendTelegram || (() => {});
    this.lastEventId = 0;
    this.timer = null;
    this.statsTimer = null;
  }

  start(intervalMs = 2000) {
    console.log(`[event-stream] Iniciando polling cada ${intervalMs}ms`);
    this._initLastId();
    this.timer = setInterval(() => this._pollEvents(), intervalMs);
    this.statsTimer = setInterval(() => this._pollStats(), 10000);
    this._pollStats();
  }

  async _initLastId() {
    try {
      const result = await this.pool.query('SELECT COALESCE(MAX(id), 0) AS max_id FROM events');
      this.lastEventId = result.rows[0].max_id;
      console.log(`[event-stream] Último ID de evento: ${this.lastEventId}`);
    } catch (err) {
      console.error('[event-stream] Error al obtener último ID:', err.message);
    }
  }

  async _pollEvents() {
    try {
      const result = await this.pool.query(
        `SELECT id, eventid, src_ip, session, username, message, timestamp
         FROM events
         WHERE id > $1
         ORDER BY id ASC
         LIMIT 50`,
        [this.lastEventId]
      );

      if (result.rows.length > 0) {
        this.lastEventId = result.rows[result.rows.length - 1].id;

        for (const event of result.rows) {
          // Emitir al frontend
          this.io.emit('event:new', {
            id: event.id,
            eventid: event.eventid,
            src_ip: event.src_ip,
            session: event.session,
            username: event.username,
            timestamp: event.timestamp,
            message: event.message
          });

          // Alerta Telegram
          const icon = this._getEventIcon(event.eventid);
          const detail = event.message || event.input || event.eventid;
          this.sendTelegram(
            `${icon} *Evento honeypot*\n` +
            `📋 \`${event.eventid}\`\n` +
            `🌐 IP: \`${event.src_ip || 'N/A'}\`\n` +
            `👤 User: \`${event.username || 'N/A'}\`\n` +
            `💬 ${detail}`
          );
        }

        console.log(`[event-stream] ${result.rows.length} eventos nuevos emitidos`);
      }
    } catch (err) {
      console.error('[event-stream] Error al pollear eventos:', err.message);
    }
  }

  _getEventIcon(eventid) {
    if (!eventid) return '📡';
    if (eventid.includes('login_success')) return '✅';
    if (eventid.includes('login_failed')) return '❌';
    if (eventid.includes('command.input')) return '🖥️';
    if (eventid.includes('session')) return '🔗';
    return '📡';
  }

  async _pollStats() {
    try {
      const [events, iocs, sessions, topEvents] = await Promise.all([
        this.pool.query('SELECT COUNT(*) AS total FROM events'),
        this.pool.query('SELECT COUNT(*) AS total FROM iocs'),
        this.pool.query('SELECT COUNT(DISTINCT session) AS total FROM events WHERE session IS NOT NULL'),
        this.pool.query(
          `SELECT eventid, COUNT(*) AS count
           FROM events
           GROUP BY eventid
           ORDER BY count DESC
           LIMIT 10`
        )
      ]);

      this.io.emit('stats:update', {
        totalEvents: parseInt(events.rows[0].total),
        totalIocs: parseInt(iocs.rows[0].total),
        totalSessions: parseInt(sessions.rows[0].total),
        topEvents: topEvents.rows.map(r => ({
          eventid: r.eventid,
          count: parseInt(r.count)
        }))
      });
    } catch (err) {
      console.error('[event-stream] Error al obtener stats:', err.message);
    }
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    if (this.statsTimer) clearInterval(this.statsTimer);
    console.log('[event-stream] Detenido');
  }
}

module.exports = EventStream;
