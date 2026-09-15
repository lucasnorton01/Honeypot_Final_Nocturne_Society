/**
 * Database service — consultas SQL adaptadas al schema real de la DB.
 * 
 * Schema real:
 *   events: id, eventid, session, src_ip, src_port, username, password, input, message, timestamp, processed, created_at
 *   iocs:   id, type, value, confidence, event_id, source, created_at
 *   reports: id, period_start, period_end, content, created_at
 */

class Database {
  constructor(pool) {
    this.pool = pool;
  }

  // --- Events ---

  async getEvents({ limit = 50, offset = 0, eventid, src_ip, since } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (eventid) {
      conditions.push(`eventid = $${idx++}`);
      params.push(eventid);
    }
    if (src_ip) {
      conditions.push(`src_ip = $${idx++}::inet`);
      params.push(src_ip);
    }
    if (since) {
      conditions.push(`timestamp >= $${idx++}`);
      params.push(since);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT id, eventid, src_ip, session, username, password, input, message, timestamp, processed
      FROM events
      ${where}
      ORDER BY timestamp DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getEventCount() {
    const result = await this.pool.query('SELECT COUNT(*) AS total FROM events');
    return parseInt(result.rows[0].total);
  }

  // --- IoCs ---

  async getIoCs({ limit = 50, offset = 0, type } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (type) {
      conditions.push(`type = $${idx++}`);
      params.push(type);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT id, event_id, type, value, source, confidence, created_at
      FROM iocs
      ${where}
      ORDER BY created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getIocCount() {
    const result = await this.pool.query('SELECT COUNT(*) AS total FROM iocs');
    return parseInt(result.rows[0].total);
  }

  // --- Reports ---

  async getReports({ limit = 20, offset = 0 } = {}) {
    const result = await this.pool.query(
      `SELECT id, period_start, period_end, content, created_at
       FROM reports
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  // --- Stats ---

  async getStats() {
    const [eventCount, iocCount, sessionCount, topEvents, topSourceIps, severityDist] = await Promise.all([
      this.pool.query('SELECT COUNT(*) AS total FROM events'),
      this.pool.query('SELECT COUNT(*) AS total FROM iocs'),
      this.pool.query('SELECT COUNT(DISTINCT session) AS total FROM events WHERE session IS NOT NULL'),
      this.pool.query(
        `SELECT eventid, COUNT(*) AS count
         FROM events
         GROUP BY eventid
         ORDER BY count DESC
         LIMIT 10`
      ),
      this.pool.query(
        `SELECT src_ip::text AS src_ip, COUNT(*) AS count
         FROM events
         WHERE src_ip IS NOT NULL
         GROUP BY src_ip
         ORDER BY count DESC
         LIMIT 10`
      ),
      this.pool.query(
        `SELECT confidence AS severity, COUNT(*) AS count
         FROM iocs
         GROUP BY confidence
         ORDER BY count DESC`
      )
    ]);

    return {
      totalEvents: parseInt(eventCount.rows[0].total),
      totalIocs: parseInt(iocCount.rows[0].total),
      totalSessions: parseInt(sessionCount.rows[0].total),
      topEventTypes: topEvents.rows.map(r => ({ eventid: r.eventid, count: parseInt(r.count) })),
      topSourceIps: topSourceIps.rows.map(r => ({ src_ip: r.src_ip, count: parseInt(r.count) })),
      severityDistribution: severityDist.rows.map(r => ({ severity: r.severity, count: parseInt(r.count) }))
    };
  }
}

module.exports = Database;
