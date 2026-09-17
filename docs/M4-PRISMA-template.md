# Diagrama PRISMA — Revisión Sistemática Retrospectiva

> **Referencia:** Page MJ, McKenzie JE, Bossuyt PM, et al. The PRISMA 2020 statement: an updated guideline for reporting systematic reviews. BMJ. 2021;372:n71.

---

## Flujo PRISMA

```
┌─────────────────────────────────────────────────────────────────────┐
│                        IDENTIFICACIÓN                               │
│                                                                     │
│  Registros identificados via bases de datos (n = ?)                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ IEEE Xplore           (n = ?)                               │    │
│  │ ACM Digital Library   (n = ?)                               │    │
│  │ Google Scholar        (n = ?)                               │    │
│  │ Scopus                (n = ?)                               │    │
│  │ SciELO                (n = ?)                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Registros identificados via otras fuentes (n = ?)                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Referencias de papers incluidos (n = ?)                     │    │
│  │ Documentación técnica / whitepapers (n = ?)                 │    │
│  │ Repositorios GitHub (n = ?)                                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│                              ▼                                      │
│                    Registros totales (n = ?)                        │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        IDENTIFICACIÓN                               │
│                                                                     │
│  Duplicados removidos (n = ?)                                       │
│                                                                     │
│                              ▼                                      │
│                    Registros únicos (n = ?)                         │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        ELEGIBILIDAD                                  │
│                                                                     │
│  Registros evaluados por título y resumen (n = ?)                   │
│                                                                     │
│                              ▼                                      │
│                                                                     │
│  Registros excluidos (n = ?)                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ No relacionados con honeypots/análisis de amenazas (n = ?)  │    │
│  │ Sin revisión por pares / publicación no académica (n = ?)   │    │
│  │ Antes del año de corte 2018 (n = ?)                         │    │
│  │ Idioma no incluido (español/inglés) (n = ?)                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│                              ▼                                      │
│  Registros elegibles para texto completo (n = ?)                    │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                        INCLUSIÓN                                     │
│                                                                     │
│  Textos completos evaluados (n = ?)                                  │
│                                                                     │
│                              ▼                                      │
│                                                                     │
│  Textos excluidos (n = ?)                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ No reportan resultados experimentales (n = ?)               │    │
│  │ Arquitectura no compatible con el alcance del estudio (n = ?)│   │
│  │ Datos no reproducibles / sin evidencia empírica (n = ?)     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│                              ▼                                      │
│                                                                     │
│  Estudios incluidos en la revisión (n = ?)                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Honeypots de baja interacción (n = ?)                       │    │
│  │ Honeypots de media/alta interacción (n = ?)                 │    │
│  │ Pipelines de análisis automatizado (n = ?)                  │    │
│  │ Integración n8n/workflows de seguridad (n = ?)              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Criterios de Búsqueda

### Strings de búsqueda por base de datos

| Base de datos | String de búsqueda |
|---------------|-------------------|
| IEEE Xplore | `("honeypot" OR "honeypots") AND ("automation" OR "automated" OR "n8n" OR "workflow") AND ("analysis" OR "threat" OR "IOC")` |
| ACM DL | `honeypot AND (automation OR automated OR workflow) AND (analysis OR threat intelligence)` |
| Google Scholar | `honeypot automation analysis n8n workflow security` |
| Scopus | `TITLE-ABS-KEY(honeypot AND (automation OR workflow) AND (analysis OR threat))` |
| SciELO | `honeypot AND (automatización OR análisis) AND (seguridad OR amenazas)` |

### Filtros de selección

| Criterio | Valor |
|----------|-------|
| Idioma | Español, Inglés |
| Año de publicación | 2018–2026 |
| Tipo de publicación | Papers con revisión por pares, tesis, reportes técnicos |
| Temática | Honeypot O análisis de amenazas O automatización de seguridad ORQ |

### Criterios de exclusión

1. **No relacionados:** Papers que mencionan honeypots solo como referencia incidental, sin contribución al diseño/análisis
2. **Sin revisión por pares:** Blog posts, presentaciones sin peer-review, notas técnicas no revisadas
3. **Fuera de rango temporal:** Publicaciones anteriores a 2018 (pre-Docker, pre-n8n)
4. **Idioma:** Publicaciones en idiomas distintos a español e inglés
5. **Sin evidencia empírica:** Papers puramente teóricos sin validación experimental o simulación

---

## Instrucciones de Uso

1. **Buscar** en cada base de datos con los strings definidos
2. **Registrar** el total de resultados por base de datos
3. **Exportar** a gestor de referencias (Zotero/Mendeley)
4. **Remover duplicados**
5. **Aplicar criterios de exclusión** por título y resumen
6. **Aplicar criterios de exclusión** por texto completo
7. **Llenar** los valores `n = ?` en el diagrama
8. **Generar** la versión final con draw.io, Lucidchart, o PRISMA Flow Diagram Generator

### Generadores automáticos

- **PRISMA 2020 Flow Diagram Generator:** https://www.prisma-statement.org/prisma-2020-flow-diagram
- **draw.io template:** Buscar "PRISMA flow diagram" en la galería de templates
- **R package:** `PRISMA2020` en CRAN
