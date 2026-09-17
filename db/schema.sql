-- ============================================================
-- Honeypot Lab - Esquema PostgreSQL
-- Proyecto: Arquitectura de Honeypots + n8n (Nocturne Society)
-- Se ejecuta automáticamente al primer arranque del contenedor
-- (montado en /docker-entrypoint-initdb.d)
-- ============================================================

-- Eventos crudos enriquecidos (pipeline event-ingest)
CREATE TABLE IF NOT EXISTS events (
    id          BIGSERIAL PRIMARY KEY,
    eventid     TEXT        NOT NULL,
    session     TEXT,
    src_ip      INET,
    src_port    INTEGER,
    username    TEXT,
    password    TEXT,
    input       TEXT,
    message     TEXT,
    timestamp   TIMESTAMPTZ NOT NULL,
    processed   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indicadores de compromiso extraídos (pipeline ioc-extractor)
CREATE TABLE IF NOT EXISTS iocs (
    id          BIGSERIAL PRIMARY KEY,
    type        TEXT        NOT NULL,          -- ip | credential | hash | url | domain
    value       TEXT        NOT NULL,
    confidence  TEXT        DEFAULT 'BAJO',    -- ALTO | MEDIO | BAJO
    event_id    BIGINT      REFERENCES events(id),
    source      TEXT        DEFAULT 'cowrie',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (type, value)
);

-- Reportes periódicos (pipeline report-generator)
CREATE TABLE IF NOT EXISTS reports (
    id           BIGSERIAL PRIMARY KEY,
    period_start TIMESTAMPTZ,
    period_end   TIMESTAMPTZ,
    content      JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Registro de errores transversal (patrón de manejo de errores)
CREATE TABLE IF NOT EXISTS error_log (
    id          BIGSERIAL PRIMARY KEY,
    workflow    TEXT,
    node        TEXT,
    error       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enriquecimiento geográfico (M2: geolocalización de IPs)
ALTER TABLE events ADD COLUMN IF NOT EXISTS country TEXT;

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_events_src_ip    ON events (src_ip);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events (timestamp);
CREATE INDEX IF NOT EXISTS idx_events_processed ON events (processed);
CREATE INDEX IF NOT EXISTS idx_events_country   ON events (country);
CREATE INDEX IF NOT EXISTS idx_iocs_type       ON iocs (type);
