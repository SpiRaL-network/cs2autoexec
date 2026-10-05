<#
  CS2 Config Installer - by SpiRaL
  Locates your CS2 'cfg' folder and copies autoexec.cfg + pracc.cfg into it.
  Launched by install.bat (double-click). No admin rights needed.
#>

[CmdletBinding()]
param(
    [string]$CfgPath,
    [switch]$NoPause
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Step($t) { Write-Host $t -ForegroundColor Cyan }

Write-Host ""
Write-Host "============================================================"
Write-Host "   CS2 CONFIG INSTALLER            by SpiRaL"
Write-Host "============================================================"
Write-Host ""

# --- 1. Find the Steam install folder ---------------------------------------
$steam = $null
foreach ($k in @(
    @{ Path = 'HKCU:\Software\Valve\Steam';                 Name = 'SteamPath' },
    @{ Path = 'HKLM:\SOFTWARE\WOW6432Node\Valve\Steam';     Name = 'InstallPath' },
    @{ Path = 'HKLM:\SOFTWARE\Valve\Steam';                 Name = 'InstallPath' }
)) {
    try {
        $v = (Get-ItemProperty -Path $k.Path -Name $k.Name -ErrorAction Stop).$($k.Name)
        if ($v) { $steam = $v; break }
    } catch {}
}

# --- 2. Collect all Steam library folders -----------------------------------
$libraries = New-Object System.Collections.Generic.List[string]
if ($steam) { $libraries.Add($steam) }

if ($steam) {
    $vdf = Join-Path $steam 'steamapps\libraryfolders.vdf'
    if (Test-Path $vdf) {
        foreach ($m in [regex]::Matches((Get-Content $vdf -Raw), '"path"\s*"([^"]+)"')) {
            $libraries.Add(($m.Groups[1].Value -replace '\\\\', '\'))
        }
    }
}

# --- 3. Find the CS2 cfg folder in any library ------------------------------
$rel = 'steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg'
$cfg = $CfgPath
if (-not $cfg) {
    foreach ($lib in $libraries) {
        $candidate = Join-Path $lib $rel
        if (Test-Path -LiteralPath $candidate -PathType Container) { $cfg = $candidate; break }
    }
}

# --- 4. Fallback: ask the user ----------------------------------------------
if (-not $cfg) {
    if ($NoPause) { throw 'CS2 cfg folder not found. Supply -CfgPath.' }
    Write-Host "Could not auto-detect your CS2 cfg folder." -ForegroundColor Yellow
    Write-Host "In CS2: right-click the game -> Manage -> Browse local files, then go to"
    Write-Host "   ...\Counter-Strike Global Offensive\game\csgo\cfg"
    Write-Host ""
    $cfg = (Read-Host "Paste your full cfg folder path here").Trim('"').Trim()
}

if (-not (Test-Path -LiteralPath $cfg -PathType Container)) {
    Write-Host "[X] Folder not found: $cfg" -ForegroundColor Red
    if (-not $NoPause) { Read-Host "Press ENTER to close" }
    exit 1
}

$cfg = (Resolve-Path -LiteralPath $cfg).Path
$csgoFolder = Split-Path -Parent $cfg
$gameFolder = Split-Path -Parent $csgoFolder
if ((Split-Path -Leaf $cfg) -ne 'cfg' -or
    (Split-Path -Leaf $csgoFolder) -ne 'csgo' -or
    (Split-Path -Leaf $gameFolder) -ne 'game') {
    Write-Host '[X] Choose the game\csgo\cfg folder inside your CS2 installation.' -ForegroundColor Red
    if (-not $NoPause) { Read-Host 'Press ENTER to close' }
    exit 1
}

$files = @('autoexec.cfg', 'pracc.cfg')
foreach ($file in $files) {
    if (-not (Test-Path -LiteralPath (Join-Path $here $file) -PathType Leaf)) {
        throw "Missing source file: $file. Extract the entire repository before installing."
    }
    if ([string]::Equals($here, $cfg, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw 'The source and destination folders are identical. No files were changed.'
    }
}

# Back up both existing files before replacing either one.
$existing = @($files | Where-Object { Test-Path -LiteralPath (Join-Path $cfg $_) -PathType Leaf })
if ($existing.Count -gt 0) {
    $suffix = (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [guid]::NewGuid().ToString('N').Substring(0, 8)
    $backup = Join-Path $cfg ('cs2autoexec-backup-' + $suffix)
    New-Item -ItemType Directory -Path $backup | Out-Null
    foreach ($file in $existing) {
        Copy-Item -LiteralPath (Join-Path $cfg $file) -Destination (Join-Path $backup $file) -ErrorAction Stop
    }
    Write-Host "[OK] Existing files backed up to: $backup" -ForegroundColor Green
}

# --- 5. Copy the config files ------------------------------------------------
Write-Step "Installing to: $cfg"
foreach ($file in $files) {
    Copy-Item -LiteralPath (Join-Path $here $file) -Destination (Join-Path $cfg $file) -Force
}
Write-Host "[OK] autoexec.cfg and pracc.cfg copied." -ForegroundColor Green

# --- 6. Next steps -----------------------------------------------------------
Write-Host ""
Write-Host "------------------------------------------------------------"
Write-Host " NEXT STEPS" -ForegroundColor Cyan
Write-Host "------------------------------------------------------------"
Write-Host " 1) Enable the developer console:"
Write-Host "      CS2 -> Settings -> Game -> Enable Developer Console = Yes"
Write-Host ""
Write-Host " 2) Choose how to load the config:"
Write-Host "    A) EVERY launch (recommended):"
Write-Host "       Steam -> CS2 -> Properties -> Launch Options, add:"
Write-Host "         +exec autoexec.cfg" -ForegroundColor Green
Write-Host ""
Write-Host "    B) APPLY NOW: open the developer console and type:"
Write-Host "         exec autoexec.cfg" -ForegroundColor Green
Write-Host "       autoexec.cfg may also load automatically at startup."
Write-Host "       For manual-only loading, rename it to personal.cfg and run:"
Write-Host "         exec personal.cfg"
Write-Host ""
Write-Host " 3) On a local practice map, press F11 (or type: exec pracc.cfg)."
Write-Host "------------------------------------------------------------"
Write-Host ""
if (-not $NoPause) { Read-Host "Done! Press ENTER to close" }
