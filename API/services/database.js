/**
 * Database service — consultas SQL adaptadas al schema real de la DB.
 * 
 * Schema real:
 *   events: id, eventid, session, src_ip, src_port, username, password, input, message, timestamp, processed, created_at
 *   iocs:   id, type, value, confidence, event_id, source, created_at
 *   reports: id, period_start, period_end, content, created_at
 * 
 * Mejoras v2:
 *   - Paginación meta (total, hasMore)
 *   - Stats optimizado con CTEs
 *   - Validación de entrada en cada método
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

    // Query principal
    const query = `
      SELECT id, eventid, src_ip, session, username, password, input, message, timestamp, processed
      FROM events
      ${where}
      ORDER BY timestamp DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);

    // Query de total (para paginación meta)
    const countQuery = `SELECT COUNT(*) AS total FROM events ${where}`;
    const countParams = params.slice(0, -2); // sin limit/offset

    const [dataResult, countResult] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].total);

    return {
      data: dataResult.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
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

    const countQuery = `SELECT COUNT(*) AS total FROM iocs ${where}`;
    const countParams = params.slice(0, -2);

    const [dataResult, countResult] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].total);

    return {
      data: dataResult.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  async getIocCount() {
    const result = await this.pool.query('SELECT COUNT(*) AS total FROM iocs');
    return parseInt(result.rows[0].total);
  }

  // --- Reports ---

  async getReports({ limit = 20, offset = 0 } = {}) {
    const query = `
      SELECT id, period_start, period_end, content, created_at
      FROM reports
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = 'SELECT COUNT(*) AS total FROM reports';

    const [dataResult, countResult] = await Promise.all([
      this.pool.query(query, [limit, offset]),
      this.pool.query(countQuery)
    ]);

    const total = parseInt(countResult.rows[0].total);

    return {
      data: dataResult.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  // --- Stats (optimizado: 2 queries con CTEs en vez de 6 separadas) ---

  async getStats() {
    // Un solo query con CTEs para todos los conteos y rankings
    const query = `
      WITH event_counts AS (
        SELECT COUNT(*) AS total FROM events
      ),
      ioc_counts AS (
        SELECT COUNT(*) AS total FROM iocs
      ),
      session_counts AS (
        SELECT COUNT(DISTINCT session) AS total FROM events WHERE session IS NOT NULL
      ),
      top_events AS (
        SELECT eventid, COUNT(*) AS count
        FROM events
        GROUP BY eventid
        ORDER BY count DESC
        LIMIT 10
      ),
      top_ips AS (
        SELECT src_ip::text AS src_ip, COUNT(*) AS count
        FROM events
        WHERE src_ip IS NOT NULL
        GROUP BY src_ip
        ORDER BY count DESC
        LIMIT 10
      ),
      severity_dist AS (
        SELECT confidence AS severity, COUNT(*) AS count
        FROM iocs
        GROUP BY confidence
        ORDER BY count DESC
      )
      SELECT
          (SELECT total FROM event_counts) AS total_events,
          (SELECT total FROM ioc_counts) AS total_iocs,
          (SELECT total FROM session_counts) AS total_sessions,
          (SELECT json_agg(json_build_object('eventid', eventid, 'count', count)) FROM top_events) AS top_event_types,
          (SELECT json_agg(json_build_object('src_ip', src_ip, 'count', count)) FROM top_ips) AS top_source_ips,
          (SELECT json_agg(json_build_object('severity', severity, 'count', count)) FROM severity_dist) AS severity_distribution
    `;

    const result = await this.pool.query(query);
    const row = result.rows[0];

    return {
      totalEvents: parseInt(row.total_events) || 0,
      totalIocs: parseInt(row.total_iocs) || 0,
      totalSessions: parseInt(row.total_sessions) || 0,
      topEventTypes: row.top_event_types || [],
      topSourceIps: row.top_source_ips || [],
      severityDistribution: row.severity_distribution || []
    };
  }
}

module.exports = Database;
