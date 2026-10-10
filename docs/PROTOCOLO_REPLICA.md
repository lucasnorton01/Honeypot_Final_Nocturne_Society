# Protocolo de la réplica independiente (validación C)

**Estado:** preparado el 10/10/2026; no se ejecutó. Si en la fecha de entrega no hay una persona disponible, la tesis declara que la réplica no se realizó.

## 1. Pregunta

¿Puede una persona ajena al equipo, en una máquina limpia y siguiendo **solo** el `README.md` del tag de código, levantar el sistema y comprobar que los eventos que registra Cowrie llegan a la tabla `events`?

C responde únicamente a esa pregunta: mide la replicabilidad de la puesta en marcha. No evalúa hipótesis ni modifica ningún veredicto (P1 a P4), y no se compara con otras validaciones.

## 2. Participante y equipo

- **Persona:** ajena al equipo y a la dirección del trabajo, con formación técnica (por ejemplo, estudiante o profesional de sistemas o programación). No participó en el desarrollo ni leyó la tesis. Se registra, sin identificarla, su experiencia previa con Docker (ninguna, básica o avanzada) y con PostgreSQL y n8n.
- **Máquina limpia:** equipo propio de la persona, sin este repositorio, sin contenedores ni imágenes del proyecto y sin variables de entorno del autor. Se registran el sistema operativo, la RAM y la versión de Docker. Puede ser una máquina virtual nueva.
- **Qué se le entrega:** solo el nombre del tag de código, `Honeypot_Final_2026-10-08g` (el que cita la portada de la tesis), y la dirección del repositorio público. No se le entrega la tesis, el anexo ni explicaciones.
- **Qué debe tener instalado antes:** lo que el README lista en «Requisitos» (Docker Desktop con `docker compose`; Python 3.12). Si no lo tiene, se registra el tiempo de instalarlo por separado.
- **Telegram:** no se configura (las alertas son opcionales según el README).

## 3. Procedimiento

1. La persona clona el repositorio en el tag indicado: `git clone <url>` y `git checkout Honeypot_Final_2026-10-08g`.
2. Sigue el `README.md` desde «Puesta en marcha» hasta tener los cuatro workflows activos. Puede consultar internet, pero no a los autores.
3. Ejecuta una **corrida corta del simulador**: `docker compose run --rm attack-runner` (una sola corrida del simulador SSH, que ejecuta de 4 a 14 intentos fallidos y una a dos sesiones exitosas).
4. Espera a que el forwarder reenvíe los eventos (hasta 5 minutos) y compara dos números (el primero lo cuenta con un comando que el README no trae; el segundo, con la consulta de «Verificación del pipeline»):
   - cantidad de eventos de Cowrie desde el inicio de la corrida: líneas de `cowrie.json`, que se copia con `docker cp cowrie:/cowrie/cowrie-git/var/log/cowrie/cowrie.json .`;
   - cantidad de filas de `events` creadas desde el inicio de la corrida.
5. Anota el resultado: **réplica exitosa** si los dos números coinciden, **parcial** si hay eventos y faltan algunos, **fallida** si no llegan eventos o no se logra levantar el sistema.

## 4. Qué se registra (lo anota la persona; el equipo solo transcribe)

| Dato | Cómo se registra |
|---|---|
| Tiempo total | Hora de inicio (primer comando) y hora de fin (resultado de la corrida corta). Se informa también el tiempo por paso: clonar; configurar `.env`; levantar el stack; crear el esquema; importar y activar los workflows; la corrida |
| Pasos donde se trabó | Número de paso del README, qué intentó y cuánto tardó en resolverlo, con el mensaje de error textual |
| Preguntas que hizo | Cada pregunta al equipo, con la hora y la respuesta. Una pregunta cuenta como intervención |
| Intervenciones del equipo | Cada una, con su motivo, antes y después. Solo se interviene en estos casos: (a) la persona no puede continuar por una causa ajena al proyecto (por ejemplo, un problema de su equipo); (b) un error del README que ella no puede resolver. Se registra siempre si se resolvió con una corrección o con una instrucción nueva |
| Resultado | Eventos de Cowrie frente a filas de `events` (números exactos), versión de Docker y comandos ejecutados (historial de la terminal) |
| Valoración | Dos preguntas al final, sin guion: «¿qué fue lo más difícil?» y «¿qué agregarías al README?» |

El equipo guarda el registro como `docs/evidencia/rep/registro_replica.md`, con su SHA-256 en `docs/evidencia/rep/SHA256SUMS.txt`, y conserva el historial de la terminal y las capturas de pantalla que la persona entregue. No se publican nombre, correo ni ninguna otra identificación.

## 5. Cómo se informa

- Se informan tal como ocurrieron el tiempo total, los pasos donde se trabó, las preguntas y las intervenciones, y el resultado (exitosa, parcial o fallida). **Una réplica con intervenciones del equipo no se informa como «replicada sin ayuda»**: se informa como «replicada con N intervenciones».
- Si la réplica falla, se informa la falla y su causa; no se repite hasta que salga bien.
- Las correcciones que el equipo haga al README a partir de lo que registre la persona se declaran como posteriores y no cambian el resultado ya registrado.
- Con una sola persona, C es un caso, no una estadística: no se generaliza ni se calcula ningún porcentaje.

## 6. Limitaciones declaradas de antemano

- Una sola persona, elegida por disponibilidad.
- La corrida corta usa el simulador de los autores, no tráfico real.
- La persona sabe que la están observando.
- La instalación depende de servicios externos (descarga de imágenes y de dependencias): una falla de red se informa como tal.
