/**
 * Validation middleware — valida y saneariza query params.
 */

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 50;

/**
 * Valida y convierte query params de paginación.
 * Retorna { limit, offset, errors }.
 */
function validatePagination(query) {
  const errors = [];
  let limit = DEFAULT_LIMIT;
  let offset = 0;

  if (query.limit !== undefined) {
    const parsed = parseInt(query.limit, 10);
    if (isNaN(parsed) || parsed < 1) {
      errors.push('limit debe ser un entero positivo');
    } else {
      limit = Math.min(parsed, MAX_LIMIT);
    }
  }

  if (query.offset !== undefined) {
    const parsed = parseInt(query.offset, 10);
    if (isNaN(parsed) || parsed < 0) {
      errors.push('offset debe ser un entero no negativo');
    } else {
      offset = parsed;
    }
  }

  return { limit, offset, errors };
}

/**
 * Valida src_ip (formato inet válido).
 */
function validateSrcIp(ip) {
  if (!ip) return { value: null, errors: [] };
  // Permitir IPv4 e IPv6 básicos
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
  const ipv6Regex = /^([0-9a-fA-F:]+:+)+[0-9a-fA-F]+(\/\d{1,2})?$/;
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    return { value: null, errors: ['src_ip no es un formato IP válido'] };
  }
  return { value: ip, errors: [] };
}

/**
 * Valida eventid (alfanumérico + puntos y guiones bajos).
 */
function validateEventId(eventid) {
  if (!eventid) return { value: null, errors: [] };
  if (!/^[a-zA-Z0-9._-]+$/.test(eventid)) {
    return { value: null, errors: ['eventid contiene caracteres inválidos'] };
  }
  return { value: eventid, errors: [] };
}

/**
 * Valida tipo de IoC.
 */
function validateIocType(type) {
  if (!type) return { value: null, errors: [] };
  const allowed = ['credential', 'command', 'ip', 'url', 'hash'];
  if (!allowed.includes(type)) {
    return { value: null, errors: [`type debe ser uno de: ${allowed.join(', ')}`] };
  }
  return { value: type, errors: [] };
}

/**
 * Valida since (ISO timestamp válido).
 */
function validateSince(since) {
  if (!since) return { value: null, errors: [] };
  const date = new Date(since);
  if (isNaN(date.getTime())) {
    return { value: null, errors: ['since debe ser un timestamp ISO válido'] };
  }
  return { value: since, errors: [] };
}

/**
 * Middleware factory: valida los query params para un endpoint dado.
 */
function validateQuery(validators) {
  return (req, res, next) => {
    const allErrors = [];
    const validated = {};

    for (const [field, validator] of Object.entries(validators)) {
      const result = validator(req.query[field]);
      allErrors.push(...result.errors);
      validated[field] = result.value;
    }

    // Para paginación, extraer limit/offset del primer validador
    const pag = validatePagination(req.query);
    allErrors.push(...pag.errors);
    validated.limit = pag.limit;
    validated.offset = pag.offset;

    if (allErrors.length > 0) {
      return res.status(400).json({
        ok: false,
        error: 'Parámetros inválidos',
        details: allErrors
      });
    }

    req.validated = validated;
    next();
  };
}

module.exports = {
  validatePagination,
  validateSrcIp,
  validateEventId,
  validateIocType,
  validateSince,
  validateQuery,
  MAX_LIMIT
};
