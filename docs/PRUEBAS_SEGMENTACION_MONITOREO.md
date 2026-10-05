# Plan de pruebas: segmentación de red y monitoreo de fallas silenciosas

Este plan se escribió el 05/10/2026, **antes** de ejecutar las pruebas. Cada prueba tiene su resultado esperado, y lo que efectivamente ocurra se registra en `docs/evidencia/segmentacion/`. Si un resultado no coincide con lo esperado, se informa así, sin corregir la prueba a posteriori.

## 1. Segmentación de red (diseño de la Figura 4.2)

El compose pasa de una red bridge única (`honeypot-net`) a tres redes con las subredes de la Figura 4.2. El aislamiento entre segmentos lo da Docker: dos redes bridge distintas no se enrutan entre sí, y una red `internal` no tiene salida.

| Red | Subred | Tipo | Servicios |
|---|---|---|---|
| `captura` | 10.0.1.0/24 | bridge | cowrie, attack-runner |
| `proceso` | 10.0.2.0/24 | bridge | forwarder, log-reader, n8n |
| `datos` | 10.0.3.0/24 | **internal** (sin salida) | n8n, postgres |

- El forwarder y el log-reader leen el log de Cowrie desde el volumen compartido `cowrie-var`, en solo lectura. No necesitan conexión de red con Cowrie.
- n8n es el único servicio presente en dos segmentos: recibe eventos en `proceso` y escribe en `datos`.
- PostgreSQL deja de publicar su puerto en el anfitrión (una red `internal` no admite puertos publicados). La administración se hace con `docker exec`, como ya hacen los scripts de verificación. La herramienta opcional `API/`, que está fuera del prototipo validado, necesitaría volver a publicarlo.

### Pruebas de conectividad (S1 a S10)

| ID | Origen (segmento) | Destino | Esperado |
|---|---|---|---|
| S1 | attack-runner (captura) | cowrie:2222 | Conecta |
| S2 | attack-runner (captura) | n8n:5678 | **No conecta** |
| S3 | attack-runner (captura) | postgres:5432, por nombre | **No conecta** |
| S4 | attack-runner (captura) | IP de postgres en 10.0.3.0/24 | **No conecta** |
| S5 | forwarder (proceso) | n8n:5678 | Conecta |
| S6 | forwarder (proceso) | postgres:5432, por nombre y por IP | **No conecta** |
| S7 | n8n (proceso + datos) | postgres:5432 | Conecta |
| S8 | postgres (datos) | 1.1.1.1:443 (salida a Internet) | **No conecta** |
| S9 | anfitrión | 127.0.0.1:2222, 2323, 5678 y 9000 | Conectan |
| S10 | anfitrión | 127.0.0.1:5433 | **No conecta** |

### Prueba de extremo a extremo (S11)

Una corrida de `attack-runner` con la red segmentada. **Esperado:** todos los eventos que Cowrie registra en esa corrida aparecen en `events`, y el extractor los procesa en su siguiente disparo.

## 2. Monitoreo de fallas silenciosas (workflow `health-monitor`)

En el lote 1 (workflow de ingesta inactivo) y en la preparación del 02/10 (credencial con `ssl: false`) se perdieron eventos sin que el sistema lo registrara: el forwarder informaba `[OK]` igual. El nuevo workflow `health-monitor` corre cada 5 minutos y hace dos controles:

1. **Ingesta:** cuenta los eventos de Cowrie (leídos de `log-reader`) con marca temporal entre hace 20 minutos y hace 2 minutos, y los compara con los eventos de `events` en el mismo intervalo. Si Cowrie tiene más, registra una alerta.
2. **Extracción:** si hay eventos con `processed = false` creados hace más de 35 minutos, registra una alerta.

Las alertas se escriben en `error_log` (workflow `health-monitor`). Si el monitor no puede consultar la base, como ocurre con la credencial rota, su propia ejecución termina en error, y eso queda visible en el historial de n8n.

### Pruebas con fallas provocadas (M0 a M3)

| ID | Condición | Esperado |
|---|---|---|
| M0 | Control negativo: sistema sano, una corrida del simulador y al menos dos disparos del monitor | **Ninguna alerta** |
| M1 | `event-ingest` desactivado, una corrida del simulador | Alerta de ingesta en `error_log` dentro de los 10 minutos siguientes |
| M2 | Contenedor `forwarder` detenido, una corrida del simulador | Alerta de ingesta en `error_log` dentro de los 10 minutos siguientes |
| M3 | Credencial de PostgreSQL con `ssl: false`, una corrida del simulador | Las ejecuciones de `event-ingest` y del monitor terminan en **error** en el historial de n8n. No hay fila en `error_log`, porque la base no es accesible para n8n |

Después de cada falla se restituye la condición sana y se verifica que el monitor deje de alertar.
