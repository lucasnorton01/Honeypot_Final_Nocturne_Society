# Evidencia — Hashes SHA-256

Los archivos listados NO se publican; solo sus hashes. Cualquier persona puede verificar la integridad con `Get-FileHash -Algorithm SHA256 <archivo>`.

## Volúmenes Docker — respaldo-volumenes (entorno original, 10/09)

| Archivo | Tamaño | SHA-256 | Descripción | Entorno / Fechas |
|---------|--------|---------|-------------|------------------|
| `honeypot_final-nocturne--main_cowrie-var.tgz` | 18.399 B | `A50DE65384CAF940DF5797A2B8C4F93FA42211D9447E6A18C74CC7BA0A47A85A` | Volumen Cowrie (orig) | Original 10/09 |
| `honeypot_final-nocturne--main_n8n-data.tgz` | 1.137.272 B | `0CAF737402895EEE4C43EE753F9B41F3427A7E366DE6686D104162ADF34B9710` | Volumen n8n (orig) | Original 10/09 |
| `honeypot_final-nocturne--main_pg-data.tgz` | 7.014.405 B | `8EB9D1916EA3F031987B861694BB48FF5BE1D02248750C6BFDE068749BB43A5C` | Volumen PostgreSQL (orig) | Original 10/09 |

## Volúmenes Docker — respaldo-volumenes (segunda PC, 11–17/09)

| Archivo | Tamaño | SHA-256 | Descripción | Entorno / Fechas |
|---------|--------|---------|-------------|------------------|
| `honeypot_final_nocturne_society-main_cowrie-var.tgz` | 98.420 B | `55F5B2FFE2725C29B9ED2CC8AAB36A5DCED92280279F2E63227BB8668B998E4D` | Volumen Cowrie (2da PC) | 2da PC 11–17/09 |
| `honeypot_final_nocturne_society-main_n8n-data.tgz` | 1.738.106 B | `37ABE9EC23A8D74961BF6DF7D592FB9EF37EDE098D7E1D6A80350A41D44E281E` | Volumen n8n (2da PC) | 2da PC 11–17/09 |
| `honeypot_final_nocturne_society-main_pg-data.tgz` | 9.071.539 B | `D640553406CC6AF5EBC24322771D0EE24506B6A2EB83F859411478DE5A09683A` | Volumen PostgreSQL (2da PC) | 2da PC 11–17/09 |

## Bases SQLite — respaldo-n8n-2daPC

| Archivo | Tamaño | SHA-256 | Descripción | Entorno / Fechas |
|---------|--------|---------|-------------|------------------|
| `n8n_db.sqlite` | 7.372.800 B | `D0A604203F2692F0EC77E96DA17E0B7970E34A4030719A93E3AAE0FECACE7BCB` | Copia n8n DB (16/09 11:00) | 2da PC 16/09 |
| `n8n_db2.sqlite` | 7.372.800 B | `848FEDF1C35F9B781E9C435C7F609727DEA02AD614BB0331F90909B7CEEF1CBB` | Copia n8n DB (16/09 11:42) | 2da PC 16/09 |
| `n8n_db3.sqlite` | 7.372.800 B | `848FEDF1C35F9B781E9C435C7F609727DEA02AD614BB0331F90909B7CEEF1CBB` | Copia n8n DB (16/09 11:42) | 2da PC 16/09 |
| `n8n_db_fix.sqlite` | 7.372.800 B | `F31128B850762DA67D5C2B4786E7D3E19214ADF7A0536EAE7CE9CEAC3DAE9A7D` | Copia n8n DB (fix) | 2da PC 16/09 |

## Archivos cowrie.json

| Archivo | Tamaño | SHA-256 | Descripción | Entorno / Fechas |
|---------|--------|---------|-------------|------------------|
| `cowrie_orig/log/cowrie/cowrie.json` | 107.734 B | `F64EE61D37BF6025F1FFF20ADDB6F74B73255253012F6CD6825ACD41135CC8B8` | Log Cowrie (original) | Original 10/09 |
| `cowrie_2da/log/cowrie/cowrie.json` | 592.510 B | `E207472CC79954D99E395C662DFEDFBC20D36A35B25FDB89A2247D5AA84CDCA2` | Log Cowrie (2da PC) | 2da PC 11–17/09 |

## Ejecuciones n8n — respaldo-volumenes (TSV completos)

| Archivo | Tamaño | SHA-256 | Descripción | Entorno / Fechas |
|---------|--------|---------|-------------|------------------|
| `ejecuciones-2da-completo.tsv` | 133.342 B | `82850BF9128116D7328FADF9FEE9B9AD4AA163A7FA47BB9CC6FE2677C125C238` | Ejecuciones 2da PC completas | 2da PC 11–17/09 |
| `ejecuciones-orig-completo.tsv` | 29.579 B | `4BA5FE3F123148DF07C9CA0F067A37A4FDBA9B77CADBD07CCA4D62B71D197B06` | Ejecuciones orig completas | Original 10/09 |

## Ejecuciones n8n — respaldo-n8n-2daPC (TSV parciales)

| Archivo | Tamaño | SHA-256 | Descripción | Entorno / Fechas |
|---------|--------|---------|-------------|------------------|
| `ejecuciones-n8n_db.tsv` | 77.493 B | `A3DE672A29F8B3A061939644844FC6D24448F7C9FAF988685CFC9F569141618C` | Ejecuciones n8n DB (copia 1) | 2da PC 16/09 |
| `ejecuciones-n8n_db2.tsv` | 77.494 B | `1FDE57D1E7D6F36000103ADDEC9908A9C2A0B5AA44ADD8D0453658FCD954B214` | Ejecuciones n8n DB (copia 2) | 2da PC 16/09 |
| `ejecuciones-n8n_db3.tsv` | 77.494 B | `F564DECD96D04213F9579F0419688C53725C271C9B4F93C41FDE76F8CD52B526` | Ejecuciones n8n DB (copia 3) | 2da PC 16/09 |
| `ejecuciones-n8n_db_fix.tsv` | 77.497 B | `8212BAE112D344FF8FA7AAFD47C9EB6650F24606AF7E18523ABB1DA743103FF1` | Ejecuciones n8n DB (fix) | 2da PC 16/09 |

---

> **Nota**: No se encontró `n8n-executions.json` del 10/09 en las carpetas de respaldo. Los datos de ejecuciones del 10/09 provienen de `ejecuciones-orig-completo.tsv`.
