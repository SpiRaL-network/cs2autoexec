<#
  CS2 Config Installer - by SpiRaL
  Locates your CS2 'cfg' folder and copies autoexec.cfg + pracc.cfg into it.
  Launched by install.bat (double-click). No admin rights needed.
#>

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
            $libraries.Add($m.Groups[1].Value -replace '\\\\', '\')
        }
    }
}

# --- 3. Find the CS2 cfg folder in any library ------------------------------
$rel = 'steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg'
$cfg = $null
foreach ($lib in $libraries) {
    $candidate = Join-Path $lib $rel
    if (Test-Path $candidate) { $cfg = $candidate; break }
}

# --- 4. Fallback: ask the user ----------------------------------------------
if (-not $cfg) {
    Write-Host "Could not auto-detect your CS2 cfg folder." -ForegroundColor Yellow
    Write-Host "In CS2: right-click the game -> Manage -> Browse local files, then go to"
    Write-Host "   ...\Counter-Strike Global Offensive\game\csgo\cfg"
    Write-Host ""
    $cfg = (Read-Host "Paste your full cfg folder path here").Trim('"').Trim()
}

if (-not (Test-Path $cfg)) {
    Write-Host "[X] Folder not found: $cfg" -ForegroundColor Red
    Read-Host "Press ENTER to close"
    exit 1
}

# --- 5. Copy the config files ------------------------------------------------
Write-Step "Installing to: $cfg"
Copy-Item -Path (Join-Path $here 'autoexec.cfg') -Destination $cfg -Force
Copy-Item -Path (Join-Path $here 'pracc.cfg')    -Destination $cfg -Force
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
Write-Host "    B) ONCE for the current session (so your in-game tweaks"
Write-Host "       are NOT reset on restart): open the console (~ key) and type:"
Write-Host "         exec autoexec.cfg" -ForegroundColor Green
Write-Host ""
Write-Host " 3) In game, press F11 (or type: exec pracc.cfg) to load practice mode."
Write-Host "------------------------------------------------------------"
Write-Host ""
Read-Host "Done! Press ENTER to close"
