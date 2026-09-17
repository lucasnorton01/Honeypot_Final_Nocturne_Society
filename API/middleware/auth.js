/**
 * Auth middleware — simple token-based para REST API.
 * Misma credencial que WebSocket: admin/test123.
 * 
 * Uso: Authorization: Bearer <token>
 * Token = base64("admin:test123")
 */

const VALID_USER = process.env.API_USER || 'admin';
const VALID_PASS = process.env.API_PASS || 'test123';
const EXPECTED_TOKEN = Buffer.from(`${VALID_USER}:${VALID_PASS}`).toString('base64');

function authMiddleware(req, res, next) {
  // Health check no requiere auth
  if (req.path === '/health') {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      error: 'Token de autenticación requerido',
      hint: 'Envíe Authorization: Bearer <token>'
    });
  }

  const token = authHeader.slice(7);

  if (token !== EXPECTED_TOKEN) {
    return res.status(403).json({
      ok: false,
      error: 'Credenciales inválidas'
    });
  }

  next();
}

module.exports = authMiddleware;
