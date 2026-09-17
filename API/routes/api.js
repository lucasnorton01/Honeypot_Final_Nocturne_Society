const { Router } = require('express');
const Database = require('../services/database');
const { validateSrcIp, validateEventId, validateIocType, validateSince } = require('../middleware/validate');

module.exports = function apiRoutes(pool) {
  const router = Router();
  const db = new Database(pool);

  // --- Events ---
  router.get('/events', async (req, res) => {
    try {
      const { limit = 50, offset = 0, eventid, src_ip, since } = req.query;

      // Validar parámetros
      const evCheck = validateEventId(eventid);
      const ipCheck = validateSrcIp(src_ip);
      const sinceCheck = validateSince(since);
      const errors = [...evCheck.errors, ...ipCheck.errors, ...sinceCheck.errors];

      if (errors.length > 0) {
        return res.status(400).json({ ok: false, error: 'Parámetros inválidos', details: errors });
      }

      const result = await db.getEvents({
        limit: Math.min(parseInt(limit) || 50, 200),
        offset: Math.max(parseInt(offset) || 0, 0),
        eventid: evCheck.value,
        src_ip: ipCheck.value,
        since: sinceCheck.value
      });

      res.json({
        ok: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      console.error('[api] GET /events error:', err.message);
      res.status(500).json({ ok: false, error: 'Error interno al consultar eventos' });
    }
  });

  router.get('/events/count', async (req, res) => {
    try {
      const count = await db.getEventCount();
      res.json({ ok: true, total: count });
    } catch (err) {
      console.error('[api] GET /events/count error:', err.message);
      res.status(500).json({ ok: false, error: 'Error interno al contar eventos' });
    }
  });

  // --- IoCs ---
  router.get('/iocs', async (req, res) => {
    try {
      const { limit = 50, offset = 0, type } = req.query;

      const typeCheck = validateIocType(type);
      if (typeCheck.errors.length > 0) {
        return res.status(400).json({ ok: false, error: 'Parámetros inválidos', details: typeCheck.errors });
      }

      const result = await db.getIoCs({
        limit: Math.min(parseInt(limit) || 50, 200),
        offset: Math.max(parseInt(offset) || 0, 0),
        type: typeCheck.value
      });

      res.json({
        ok: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      console.error('[api] GET /iocs error:', err.message);
      res.status(500).json({ ok: false, error: 'Error interno al consultar IoCs' });
    }
  });

  router.get('/iocs/count', async (req, res) => {
    try {
      const count = await db.getIocCount();
      res.json({ ok: true, total: count });
    } catch (err) {
      console.error('[api] GET /iocs/count error:', err.message);
      res.status(500).json({ ok: false, error: 'Error interno al contar IoCs' });
    }
  });

  // --- Reports ---
  router.get('/reports', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;

      const result = await db.getReports({
        limit: Math.min(parseInt(limit) || 20, 100),
        offset: Math.max(parseInt(offset) || 0, 0)
      });

      res.json({
        ok: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (err) {
      console.error('[api] GET /reports error:', err.message);
      res.status(500).json({ ok: false, error: 'Error interno al consultar reportes' });
    }
  });

  // --- Stats ---
  router.get('/stats', async (req, res) => {
    try {
      const stats = await db.getStats();
      res.json({ ok: true, data: stats });
    } catch (err) {
      console.error('[api] GET /stats error:', err.message);
      res.status(500).json({ ok: false, error: 'Error interno al consultar estadísticas' });
    }
  });

  // --- Health ---
  router.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ ok: true, status: 'healthy', timestamp: new Date().toISOString() });
    } catch (err) {
      res.status(503).json({ ok: false, status: 'unhealthy', error: err.message });
    }
  });

  return router;
};
