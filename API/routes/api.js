const { Router } = require('express');
const Database = require('../services/database');

module.exports = function apiRoutes(pool) {
  const router = Router();
  const db = new Database(pool);

  // --- Events ---
  router.get('/events', async (req, res) => {
    try {
      const { limit = 50, offset = 0, eventid, src_ip, since } = req.query;
      const events = await db.getEvents({
        limit: parseInt(limit),
        offset: parseInt(offset),
        eventid,
        src_ip,
        since
      });
      res.json({ ok: true, data: events });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get('/events/count', async (req, res) => {
    try {
      const count = await db.getEventCount();
      res.json({ ok: true, total: count });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // --- IoCs ---
  router.get('/iocs', async (req, res) => {
    try {
      const { limit = 50, offset = 0, type } = req.query;
      const iocs = await db.getIoCs({
        limit: parseInt(limit),
        offset: parseInt(offset),
        type
      });
      res.json({ ok: true, data: iocs });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  router.get('/iocs/count', async (req, res) => {
    try {
      const count = await db.getIocCount();
      res.json({ ok: true, total: count });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // --- Reports ---
  router.get('/reports', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const reports = await db.getReports({
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      res.json({ ok: true, data: reports });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // --- Stats ---
  router.get('/stats', async (req, res) => {
    try {
      const stats = await db.getStats();
      res.json({ ok: true, data: stats });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
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
