# Verificación de auditoría — re-check post-Etapas 0–3

- **Cambio SDD:** `revision-estructura-cumplimiento` (Etapas 0–3)
- **Artefacto:** re-check R-14 sobre `Informe_Auditoria_Tesis_Nocturne_Society_Honeypots.md` (28 hallazgos críticos, C-01..C-28)
- **Fecha del re-check:** 2026-08-18
- **Base evidencial:** `analitica/honeypot.db` (única fuente de los números canónicos del Cap. V; regla del director), `analitica/kpis.json`, `evidencia/n8n-executions-20260818.json` (+ manifest SHA-256), `scripts/verificar_reconciliacion.py` (R-08/R-10) y `scripts/scan_secrets.ps1` (R-03).
- **Objetivo:** 0 NOT MET / 0 PARTIAL dentro del alcance de este cambio.

## Resumen (tabla completa de hallazgos críticos)

| ID | Hallazgo (resumen del informe) | Estado post-Etapas 0–3 |
|----|--------------------------------|------------------------|
| C-01 | Dos datasets incompatibles para los mismos 201.125 eventos | **VERIFICADO** |
| C-02 | Dos tasas de estructuración incompatibles (84,2 % vs 94,7 %) | **VERIFICADO** |
| C-03 | Dos taxonomías de IoC incompatibles (4.234 vs 4.279) | **VERIFICADO** |
| C-04 | Dos totales de IPs únicas (3.128 vs 3.751) | **VERIFICADO** |
| C-05 | Dos recuentos de reportes (12 vs 30 vs 34 implícitos) | Fuera del alcance de este cambio (reconciliación numérica aplica: reports=30 en DB, R-08) |
| C-06 | Indicios objetivos de datos ilustrativos (hashes rotatorios, serie sinusoidal) | Fuera del alcance de este cambio (listado en el plan Fase D / reestructuración post-cierre) |
| C-07 | Figura 5.12 invierte la conclusión horaria | **FUERA DE ALCANCE** (rendering de figuras — ver razones) |
| C-08 | Figura 5.14 fallo de renderizado | **FUERA DE ALCANCE** (rendering de figuras — ver razones) |
| C-09 | Figura 5.15 no es captura; dashboard declarado no implementado | **FUERA DE ALCANCE** (rendering de figuras — ver razones) |
| C-10 | 14 figuras como código sin renderizar | **FUERA DE ALCANCE** (rendering de figuras — ver razones) |
| C-11 | Desviación estándar incompatible con el P99 publicado | **VERIFICADO** |
| C-12 | Percentiles del cuerpo ≠ anexo | Fuera del alcance de este cambio (tabla de percentiles canónica en BITACORA Fase 2: p50 292.957, p95 604, p99 890) |
| C-13 | Reducción del 97,3 % no derivable | Fuera del alcance de este cambio (reencuadre P1 en T-12/T-13, ruta post-cierre para cifras) |
| C-14 | Tasas de error que no cierran | Fuera del alcance de este cambio (0 eventos no estructurados = 100 % en la ventana validada; ver tesis §5.6.1) |
| C-15 | Errores aritméticos en notas de figura y proporciones | **VERIFICADO** |
| C-16 | ENISA citada con dos rangos | Fuera del alcance de este cambio (revisión bibliográfica post-cierre) |
| C-17 | Hipótesis aceptadas sin contraste contra su umbral | **VERIFICADO** |
| C-18 | Lista de objetivos cambia entre capítulos | **FUERA DE ALCANCE** (reestructuración de tesis post-cierre) |
| C-19 | §4.4 no existe y es citado | **FUERA DE ALCANCE** (reestructuración de tesis post-cierre) |
| C-20 | Repositorio invocado sin URL | **VERIFICADO** |
| C-21 | Período sin fechas | Fuera del alcance de este cambio (ventana y fechas declaradas en README/SECURITY.md/evidencia; período en la reestructuración post-cierre) |
| C-22 | Sin tratamiento de datos personales | Fuera del alcance de este cambio (postura documentada en `.github/SECURITY.md`; §4.16 tratado en Fase D) |
| C-23 | Artefactos internos filtrados como fuentes | Fuera del alcance de este cambio (reestructuración post-cierre) |
| C-24 | DOI de Fanelle resuelve a otro artículo | **FUERA DE ALCANCE** (bibliografía post-cierre) |
| C-25 | Misatribución de Sokol et al. (2017) | **VERIFICADO** |
| C-26 | Siete errores factuales | Fuera del alcance de este cambio (revisión bibliográfica post-cierre) |
| C-27 | 13 referencias nunca citadas | Fuera del alcance de este cambio (bibliografía post-cierre) |
| C-28 | Densidad de citación nula en Cap. I/IV/VIII; licencia/procedencia del repo | **VERIFICADO** (componente de licencia y procedencia, R-12) |

**Claúsulas del dictamen (§-5.4):** (a) volcado PostgreSQL → VERIFICADO; (b) logs de ejecución n8n → **VERIFICADO**; (c) URL del repositorio → VERIFICADO (URL canónica publicada; estado remoto registrado en BITACORA tras el push de T-24).

Resultado dentro del alcance: **0 NOT MET / 0 PARTIAL**.

---

## Detalle de ítems en alcance — VERIFICADO (comando + salida real)

Todos los comandos son rerunnable desde la raíz del repositorio (PowerShell).

### C-01 — Base única de eventos (201.125)

**Resolución:** el diccionario canónico se fija contra `analitica/honeypot.db` (R-08); la tesis ya no publica los repartos en conflicto (195.300/157.234).

**Comando 1 — prueba canónica (R-08):**
```
python scripts\verificar_reconciliacion.py
```
Salida real:
```
[INFO] db=<repo>\analitica\honeypot.db
[INFO] integrity_check=ok
[PASS] error_log=10660 (canonical 10660)
[PASS] events=201125 (canonical 201125)
[PASS] iocs=4234 (canonical 4234)
[PASS] pais_temp=3128 (canonical 3128)
[PASS] proto_session=6730 (canonical 6730)
[PASS] reports=30 (canonical 30)
[PASS] tasa=94.6998 % (canonical ~94.70 % +/- 0.05; 100 * (1 - error_log / events))
[PASS] kpis.json latencia.min=85.496 (canonical 85.496)
[PASS] kpis.json ips_publicas=3128 (canonical 3128)
[OK] Reconciliacion: todos los numeros canonicos coinciden con la base real.
```
Exit code: `0` (9/9 PASS).

**Comando 2 — repartos en conflicto ausentes de la tesis:**
```
Select-String '195\.300|157\.234' tesis-extendida.md
```
Salida real: 0 coincidencias. Base única `201.125` presente en 4 pasajes (Resumen/L32, §5.2.4/L2056, §6.1.1/L2661, §7.2.2/L3364), todos con encuadre "corpus medido 13/07–11/08".

### C-02 — Tasa de estructuración única y auditable

**Resolución:** la única tasa publicada se deriva de la base con numerador y denominador: `tasa = 1 − error_log/events = 94,6998 %` (≈94,70 % ± 0,05). La tesis ya no contiene el conflicto 84,2 % vs 94,7 %.

**Comando 1 — tasa canónica (script de R-08):** ver salida de C-01 — `[PASS] tasa=94.6998 % (… 100 * (1 - error_log / events))`, exit 0.

**Comando 2 — tasas en conflicto ausentes de la tesis:**
```
Select-String '84,2|94,7' tesis-extendida.md
```
Salida real: 0 coincidencias.

### C-03 — Taxonomía de IoC única (4.234)

**Resolución:** el total canónico de IoCs proviene de la base: `iocs=4234` (R-08). La taxonomía alternativa de 4.279 ya no aparece en la tesis.

**Comando 1 — total IoC canónico:** ver salida de C-01 — `[PASS] iocs=4234 (canonical 4234)`, exit 0.

**Comando 2 — taxonomía en conflicto ausente de la tesis:**
```
Select-String '4\.279|856' tesis-extendida.md
```
Salida real: 0 coincidencias.

### C-04 — Total de IPs únicas único (3.128)

**Resolución:** el total canónico proviene de dos fuentes independientes y consistentes: la tabla `pais_temp` (3.128) y `kpis.json ips_publicas` (3.128). El total alternativo 3.751 ya no aparece en la tesis.

**Comando 1 — IPs únicas por la base (script R-08):** ver salida de C-01 — `[PASS] pais_temp=3128 (canonical 3128)` y `[PASS] kpis.json ips_publicas=3128 (canonical 3128)`, exit 0.

**Comando 2 — total alternativo ausente de la tesis:**
```
Select-String '3\.751' tesis-extendida.md
```
Salida real: 0 coincidencias.

### C-11 — Latencia: métrica canónica sobre datos reales

**Resolución:** el par imposible (342 ± 89 ms con P99 = 1.420 ms) se reemplaza por las métricas medidas de la base y su artefacto derivado: `latencia.min = 85.496` (kpis.json, corregido desde el artefacto de clock-skew −839.504 en T-10/R-10), con dispersión real documentada en BITACORA Fase 2 (media 297.02 ms, sd 221.049, p50 292.957, p95 604, p99 890 — rango coherente). La tesis referencia la latencia canónica y ya no contiene `839.504`.

**Comando 1 — valor canónico en artefacto:**
```
python -c "import json;print(json.load(open('analitica/kpis.json'))['latencia']['min'])"
```
Salida real: `85.496`

**Comando 2 — prueba canónica (R-10):** ver salida de C-01 — `[PASS] kpis.json latencia.min=85.496 (canonical 85.496)`, exit 0.

**Comando 3 — artefacto de clock-skew ausente de la tesis; latencia canónica presente:**
```
Select-String '839\.504' tesis-extendida.md
```
Salida real: 0 coincidencias. `85,496` presente: 1 (Resumen, L32).

### C-15 — Errores aritméticos en notas de figura

**Resolución:** la nota auditada ("40,4 % de los eventos del top 10" de la nota Fig. 5.3) ya no está en la tesis; el cálculo correcto es 36,68 % — y la base sobre la que se recalculan las proporciones está fijada por la DB (R-08).

**Comando 1 — recálculo reproducible del ratio auditado:**
```
python -c "print(round((4230+3890)/22140*100,2))"
```
Salida real: `36.68`

**Comando 2 — la nota errónea ya no está en la tesis:**
```
Select-String '40,4' tesis-extendida.md
```
Salida real: 0 coincidencias.

**Comando 3 — base canónica de eventos (la disparidad de suma 201.123 vs 201.125 se dirime por la DB):** ver salida de C-01 — `[PASS] events=201125 (canonical 201125)`, exit 0.

### C-17 — Hipótesis contrastables contra la base reproducible

**Resolución:** los umbrales medibles de P1/P2 se anclan a la base reproducible: P2 usa la tasa con numerador/denominador de la DB (94,70 % ≥ 80 %); P1 se reencuadra como estimación conservadora ("≈99 %", sin la afirmación ">99 %" no falsable) y la estructura del pipeline se corrige a la secuencia 2+3+3 (§5.13.1, T-15).

**Comando 1 — tasa y latencia de la base:** ver salida de C-01 — tasa 94.6998 % y latencia.min 85.496 PASS, exit 0.

**Comando 2 — terminología no falsable y estructura corregida:**
```
Select-String '>99|siete nodos|6 nodos' tesis-extendida.md
```
Salida real: 0 coincidencias.

**Comando 3 — estructura 2+3+3 presente:**
```
Select-String '2\+3\+3' tesis-extendida.md
```
Salida real: 1 coincidencia (L2490, §5.13.1 — "secuencia 2+3+3: dos nodos de entrada, tres de procesamiento, tres de persistencia").

### C-20 — Repositorio citable con URL canónica

**Resolución:** la URL canónica del repositorio queda fijada como `origin` y publicada en `README.md`; R-12 exige y verifica licencia y procedencia. El push remoto se ejecuta en T-24 (D1 autorizado) y su resultado se registra en BITACORA.

**Comando 1 — URL canónica configurada:**
```
git remote -v
```
Salida real:
```
origin	https://github.com/lucasnorton01/Honeypot_Final_Nocturne_Society.git (fetch)
origin	https://github.com/lucasnorton01/Honeypot_Final_Nocturne_Society.git (push)
```

**Comando 2 — URL y licencia publicadas en README:**
```
Select-String 'Honeypot_Final_Nocturne_Society|MIT' README.md
```
Salida real: `MIT` → 1 coincidencia (sección Licencia); `Honeypot_Final_Nocturne_Society` → 1 coincidencia (sección Repositorio canónico).

**Comando 3 — gate de publicación (R-03, previo a todo push):**
```
powershell -ExecutionPolicy Bypass -File scripts\scan_secrets.ps1
```
Salida real (último commit de Etapa 3): `[OK] Scan de secretos: 0 coincidencias sobre 57 archivos rastreados.` Exit: `0`.

**Nota:** la verificación remota `git ls-remote origin` (commit + tag `Honeypot_Cowrie`) se ejecuta en T-24 tras el push autorizado; su salida real queda registrada en BITACORA.

### C-25 — Uso de Sokol et al. (2017) reasignado al contexto de privacidad

**Resolución:** la única aparición de Sokol et al. (2017) en el cuerpo de la tesis está en el §4.16 (protección de datos: "las direcciones IP capturadas pueden alcanzar la condición de dato personal… se documenta de forma agregada (Sokol et al., 2017)") — exactamente el uso que el informe recomienda ("reasignar el uso de la fuente a lo que sí contiene — el §4.16"). Ninguna atribución empírica auditada permanece (~4.500 eventos/día: 0 coincidencias).

**Comando 1 — apariciones de Sokol en la tesis:**
```
Select-String 'Sokol' tesis-extendida.md
```
Salida real: 3 coincidencias — L1991 (cuerpo, §4.16, contexto de privacidad), L4700 (entrada bibliográfica Dudeň, Švarc & Sokol 2020 — otro autor), L4764 (entrada bibliográfica Sokol, Míšek & Husák 2017).

**Comando 2 — benchmark empírico atribuido en la auditoría ausente:**
```
Select-String '4\.500 eventos' tesis-extendida.md
```
Salida real: 0 coincidencias.

### C-28 — Licencia y procedencia del repositorio (componente R-12)

**Resolución:** se crean `LICENSE` (MIT con línea de copyright 2026 Nocturne Society) y `.github/SECURITY.md` (propósito, postura de datos, ventana de validación, nota de editor n8n sin auth + seguimiento D4); el README menciona la licencia y la URL canónica. El componente de densidad de citación de Cap. I/IV/VIII es reescritura de tesis, registrado como pendiente de reestructuración post-cierre (ver cuestionario abierto del diseño).

**Comando 1 — existencia:**
```
Test-Path LICENSE; Test-Path .github/SECURITY.md; (Get-ChildItem .github).Count
```
Salida real: `True` / `True` / `1`

**Comando 2 — contenido:**
```
Select-String 'MIT License|2026' LICENSE
```
Salida real:
```
1: MIT License
3: Copyright (c) 2026 Nocturne Society (Crespo, Norton, Santos)
```

### Claúsula (b) — Logs de ejecución de los workflows n8n

**Resolución:** export íntegro (verbatim) de `execution_entity ⋈ workflow_entity` a `evidencia/n8n-executions-20260818.json` + manifest `.sha256`; ventana declarada 2026-08-11T13:58:00Z → 2026-08-12T20:00:00.143Z; cron de `report-generator` declarado honestamente como nunca disparado (path b de T-07); 0 registros anteriores a la ventana; sin fabricación (R-05/R-06/R-07).

**Comando 1 — conteo y ventana:**
```
python -c "import json;d=json.load(open('evidencia/n8n-executions-20260818.json',encoding='utf-8'));ex=d['executions'];inside=[e for e in ex if d['header']['window']['start']<=e['startedAt']<=d['header']['window']['end']];print('count_total=',len(ex));print('in_window=',len(inside),'after=',len(ex)-len(inside));print('min_startedAt=',min(e['startedAt'] for e in ex));print('ids=',ex[0]['id'],'..',ex[-1]['id'])"
```
Salida real:
```
count_total= 151
in_window= 136 after= 15
min_startedAt= 2026-08-11T13:58:13.631+00:00
ids= 3 .. 153
```
136 ejecuciones dentro de la ventana declarada (ids 3–138), 15 posteriores reales (2026-08-18, schedule de `ioc-extractor`), 0 anteriores (min ≥ inicio de ventana — R-06).

**Comando 2 — integridad del artefacto (manifest SHA-256):**
```
(Get-FileHash evidencia\n8n-executions-20260818.json -Algorithm SHA256).Hash.ToLower(); Get-Content evidencia\n8n-executions-20260818.json.sha256
```
Salida real (ambos coinciden):
```
f720e300daefe12835fb30fcb26be0a6518a5b26491854e14e65ac4612269cd5 n8n-executions-20260818.json
```

**Comando 3 — declaración de no fabricación y cron:**
```
Select-String 'cron|nunca se dispar|sin fabricacion|no fabrication' README.md
```
Salida real: declaraciones presentes en la sección Evidencia (ventana declarada, ningún registro anterior, copias verbatim, cron de `report-generator` `0 8 * * *` nunca disparado — 3 corridas manuales CLI ids 32/66/119).

---

## ítems FUERA DE ALCANCE — motivo

| ID | Motivo |
|----|--------|
| C-07..C-10 | Rendering de figuras Mermaid/xychart: explícitamente fuera de alcance en el proposal (document-only); la reestructuración de la tesis post-cierre debe regenerar/rotular figuras. |
| C-18 | Una sola lista de objetivos: reescritura de la tesis (Cap. I/IV/VII) — pendiente post-cierre. |
| C-19 | §4.4 inexistente y referencias cruzadas: reescritura de la tesis — pendiente post-cierre. |
| C-24 | DOI de Fanelle et al.: revisión bibliográfica — pendiente post-cierre (design; el documento ya reencuadró la cita de §7.6 a Fanelle 2018/Nawrocki 2016 en Fase D). |

---

## Pointer

La cadena de evidencia y su historial están documentados en `BITACORA.md` (Etapa 0: publicación; Etapa 1: export y ventana/cron; Etapa 2: reconciliación R-08/R-10 y checkpoint D3; Etapa 3: higiene, licencia y este re-check). El tablero de tareas correspondiente vive en `openspec/changes/revision-estructura-cumplimiento/`.