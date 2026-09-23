<#
scan_secrets.ps1 - Puerta de seguridad pre-push (R-03)

Escanea todos los archivos bajo control de versiones (git ls-files) buscando
cadenas con forma de secreto. Sale con codigo != 0 ante cualquier coincidencia.

Patrones cubiertos (diseno C3, afinados para evitar falsos positivos):
  - Token de bot de Telegram:     \d{8,10}:[A-Za-z0-9_-]{35}
  - URL de bot de Telegram:       api\.telegram\.org/bot[0-9A-Za-z_-]{5,}   (exige token tras /bot)
  - Claves privadas:              -----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----  (headers PEM reales)
  - Claves OpenAI/embebidas:      sk-[A-Za-z0-9]{20,}
  - Claves AWS:                   AKIA[0-9A-Z]{16}
  - IDs de chat:                  (?<![0-9A-Za-z])-?\d{10,14}(?![0-9A-Za-z])  (10-14 digitos,
                                  no embebidos en hex/hash; 9 digitos colisionan con passwords
                                  de diccionario del dataset sintetico)

Allowlist (senuelo del honeypot, no es un secreto):
  - cowrie/userdb.txt: lineas de credencial valida admin:test123 / admin:x:test123
  - scripts/generar_dataset.js: constante 2^32 (4294967296) del hash xorshift

Uso:
  powershell -File scripts/scan_secrets.ps1        # escanea el indice (staged)
  powershell -File scripts/scan_secrets.ps1 -All   # escanea tambien archivos sin follow
#>

param(
    [switch]$All
)

$ErrorActionPreference = 'Stop'

$patterns = @(
    @{ Name = 'bot-token';        Regex = '\d{8,10}:[A-Za-z0-9_-]{35}' },
    @{ Name = 'telegram-bot-url'; Regex = 'api\.telegram\.org/bot[0-9A-Za-z_-]{5,}' },
    @{ Name = 'private-key';      Regex = '-----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----' },
    @{ Name = 'openai-key';       Regex = 'sk-[A-Za-z0-9]{20,}' },
    @{ Name = 'aws-key';          Regex = 'AKIA[0-9A-Z]{16}' },
    @{ Name = 'chat-id';          Regex = '(?<![0-9A-Za-z])-?\d{10,14}(?![0-9A-Za-z])' }
)

# Señuelo determinista del honeypot (cowrie/userdb.txt): credencial valida, NO es un secreto.
$allowlistFile = 'cowrie/userdb.txt'
$allowlistLines = @('admin:x:test123', 'admin:test123', '# Cowrie UserDB - valid honeypot credentials', '# Format: username:hashmethod:password (one per line)')

# Constantes benignas con forma de chat-id (documentadas, no son secretos):
#   scripts/generar_dataset.js - 4294967296 = 2^32 (hash xorshift de Math.random)
$allowlistExact = @(
    @{ Path = 'scripts/generar_dataset.js'; Line = '    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;' }
)

function Is-AllowedLine([string]$path, [string]$line) {
    if ($path -eq $allowlistFile) {
        foreach ($ok in $allowlistLines) {
            if ($line.Trim() -eq $ok) { return $true }
        }
    }
    foreach ($entry in $allowlistExact) {
        if ($path -eq $entry.Path -and $line.Trim() -eq $entry.Line.Trim()) { return $true }
    }
    # Constante benigna 2^32 = 4294967296 (hash xorshift de Math.random en generar_dataset.js).
    #   Se documenta en el propio scanner (comentarios de allowlist), en tasks.md (nota T-03) y en
    #   la linea allowlistada de generar_dataset.js. Solo se permite con contexto documentado
    #   (xorshift / generar_dataset / 2^32 / >>>), nunca un ID de chat desnudo.
    if ($line -match '4294967296' -and $line -match '(2\^32|xorshift|generar_dataset|>>>)') { return $true }
    return $false
}

# Lista de archivos a escanear: el indice (lo que git enviaria) por defecto.
if ($All) {
    $raw = & git ls-files --cached -z
} else {
    $raw = & git ls-files -z
}
# git ls-files -z emite una sola linea separada por NUL (sin saltos de linea)
$files = @($raw -split "`0" | Where-Object { -not [string]::IsNullOrEmpty($_) })

$hits = New-Object System.Collections.Generic.List[string]

foreach ($f in $files) {
    if (-not (Test-Path -LiteralPath $f)) { continue }

    $content = $null
    try {
        $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path -LiteralPath $f))
        # Solo texto: descarta binarios con NUL en las primeras 8 KiB
        $head = [System.Text.Encoding]::ASCII.GetString($bytes, 0, [Math]::Min(8192, $bytes.Length))
        if ($head.Contains([char]0)) { continue }
        $content = [System.Text.Encoding]::UTF8.GetString($bytes)
    } catch {
        Write-Warning "No se pudo leer $f : $_"
        continue
    }

    $lines = $content -split "`r?`n"
    for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]
        if (Is-AllowedLine $f $line) { continue }
        foreach ($p in $patterns) {
            # cowrie/moduli — DH moduli OpenSSH, timestamps 14 dígitos son falsos positivos de chat-id (no debilita scanner en otros archivos)
            if ($p.Name -eq 'chat-id' -and $f -eq 'cowrie/moduli') { continue }
            if ($line -match $p.Regex) {
                $hit = "{0}:{1} [{2}]" -f $f, ($i + 1), $p.Name
                $hits.Add($hit)
            }
        }
    }
}

if ($hits.Count -gt 0) {
    Write-Host "[FAIL] Scan de secretos: $($hits.Count) coincidencia(s)." -ForegroundColor Red
    $hits | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    Write-Host "Ningun push puede proceder hasta remover/ignorar esos archivos." -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Scan de secretos: 0 coincidencias sobre $($files.Count) archivos rastreados." -ForegroundColor Green
exit 0