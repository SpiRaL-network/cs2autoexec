# CS2 Autoexec

A readable Counter-Strike 2 configuration with a local practice profile and an offline editor. SpiRaL’s settings are a starting point: adapt them to your hardware and preferences.

**English** · [Français](README.fr.md) · [Configuration editor](editor/index.html) · [Key reference](SCANCODES.md)

| File | Purpose |
| :--- | :--- |
| [`autoexec.cfg`](autoexec.cfg) | Sensitivity, networking, audio, HUD, crosshair and key bindings. |
| [`pracc.cfg`](pracc.cfg) | Local practice server settings and grenade tools. |
| [`editor/index.html`](editor/index.html) | An offline table for editing and exporting both configurations. |
| [`install.bat`](install.bat) | Windows installer with Steam detection and backups of existing files. |

![The offline configuration editor, with editable values and English/French support](docs/editor-preview.png)

## Customize

### Start from your current CS2 setup

Open the offline editor and select **Extract CS2 setup**. Close CS2 first so the selected files reflect its saved settings. Inside the Steam installation, open:

```text
userdata/<account>/730/local/cfg
```

Select `cs2_user_convars_0_slot0.vcfg` and `cs2_user_keys_0_slot0.vcfg` together. Optionally include `cs2_machine_convars.vcfg` for machine-level console settings. Select files from the same account and user slot. If your active slot uses different numbers, select its matching pair of files.

The editor generates an autoexec **from your saved settings and bindings alone**. It does not fill missing values with SpiRaL’s profile or add practice shortcuts. Named keys remain as saved; mouse axes are included when present. User values take precedence over machine values, regardless of selection order. The report shows omitted entries and repeated values, and tells you if a settings or key file is missing. Review the result, make any adjustments, then export `autoexec.cfg`.

This extracts saved console settings, rather than a complete game backup. Settings absent from the selected files remain absent. Keep definitions of custom aliases from your existing `.cfg` files separately: the saved key file may refer to them without containing their definitions. `cs2_video.txt` is not converted, and values requiring escaped quotes, backslashes or control characters are omitted with a report. Your game files are read only and stay on your computer.

### Start from the supplied profile or an existing .cfg

**Use the editor:** [download the repository](https://github.com/SpiRaL-network/cs2autoexec/archive/refs/heads/main.zip), extract it, and open `editor/index.html` in your browser. GitHub’s file link displays the HTML source; open the application from the downloaded folder.

Choose a language and a file. Search for a command or filter by category. Change a value, reassign a key, or disable a row. Review the preview, then select **Export .cfg**. You can also import an existing file: quoted values are editable, and other lines are preserved.

The editor needs no installation, connection or account. Imports and edits stay in the page until it closes or reloads: export files to keep your changes. Validation checks syntax, not every value range or command’s availability in your game version. Duplicate commands or keys are flagged; later lines take precedence.

**Use a text editor:** the tables in `autoexec.cfg` and `pracc.cfg` contain the actual commands executed by the game. Edit the quoted value. There is no second list of values to keep in sync.

<!-- defaults:start -->
| Profile setting | Value | Command |
| :--- | :--- | :--- |
| Mouse sensitivity | `1.1` | `sensitivity` |
| Scoped sensitivity multiplier | `1.0` | `zoom_sensitivity_ratio` |
| Maximum matchmaking ping (ms) | `25` | `mm_dedicated_search_maxping` |
| HUD scale | `0.9` | `hud_scaling` |
| Radar map zoom | `0.4` | `cl_radar_scale` |
| Frametime warning threshold (ms) | `4.2` | `cl_hud_telemetry_frametime_poor` |
<!-- defaults:end -->

Sensitivity also depends on mouse DPI. A 25 ms matchmaking limit can restrict available regions. A 4.2 ms frametime threshold corresponds to about 238 FPS and may trigger frequent warnings. These values describe the supplied profile; they are not universal recommendations.

## Install

1. In Steam, open **CS2 → Manage → Browse local files**.
2. Open `game/csgo/cfg`.
3. Back up any existing files, then copy `autoexec.cfg` and `pracc.cfg` into that folder. If you used the editor, copy the exported files.

On Windows, `install.bat` finds the game folder across Steam libraries and copies the two `.cfg` files beside the script. It backs up existing destination files in a timestamped subfolder before replacing them. Administrator rights are not required. To install your exports with this script, first replace the `.cfg` files in the downloaded folder.

On Linux, use the manual installation through Steam’s game folder. The editor works in a modern browser on either system.

## Load in CS2

Enable **Settings → Game → Enable Developer Console**. In the console, run:

```text
exec autoexec.cfg
```

To explicitly request loading at each startup, add `+exec autoexec.cfg` to Steam’s launch options. CS2 may also load a file named `autoexec.cfg` automatically from its `cfg` folder: removing the launch option does not guarantee one-time loading. For a manual-only profile, rename it to `personal.cfg` and use `exec personal.cfg`.

Reload the file after editing it. Settings saved by the game may persist; loading a configuration does not automatically restore your previous profile afterwards. `host_writeconfig` is an optional console command you can run yourself to save game settings.

## Key bindings

Scancodes identify **physical positions**, including WASD on US QWERTY and ZQSD on French AZERTY. Printed labels can differ on other layouts. Keys not assigned by this profile retain their existing game bindings.

<!-- bindings:start -->
| Action | QWERTY | AZERTY | Config key |
| :--- | :--- | :--- | :--- |
| Quick knife switch | C | C | `scancode6` |
| Move forward | W | Z | `scancode26` |
| Move backward | S | S | `scancode22` |
| Strafe left | A | Q | `scancode4` |
| Strafe right | D | D | `scancode7` |
| Jump | Space | Espace | `scancode44` |
| Crouch | Left Ctrl | Ctrl gauche | `scancode224` |
| Walk | Left Shift | Maj gauche | `scancode225` |
| Primary fire | MOUSE1 | MOUSE1 | `MOUSE1` |
| Secondary fire | MOUSE2 | MOUSE2 | `MOUSE2` |
| Drop current weapon | MOUSE4 | MOUSE4 | `MOUSE4` |
| Switch to previous weapon | MOUSE5 | MOUSE5 | `MOUSE5` |
| Jump via mouse wheel up | MWHEELUP | MWHEELUP | `MWHEELUP` |
| Jump via mouse wheel down | MWHEELDOWN | MWHEELDOWN | `MWHEELDOWN` |
| Select flashbang | Q | A | `scancode20` |
| Select smoke grenade | F | F | `scancode9` |
| Select HE grenade | V | V | `scancode25` |
| Select molotov/incendiary | MOUSE3 | MOUSE3 | `MOUSE3` |
| Use / interact | E | E | `scancode8` |
| Reload weapon | R | R | `scancode21` |
| Open buy menu | B | B | `scancode5` |
| Open team selection menu | M | , | `scancode16` |
| Contextual ping | Left Alt | Alt gauche | `scancode226` |
| Inspect weapon | G | G | `scancode10` |
| Switch weapon hand | X | X | `scancode27` |
| Open spray menu | Delete | Suppr | `scancode76` |
| Push-to-talk voice chat | T | T | `scancode23` |
| All text chat | Y | Y | `scancode28` |
| Team text chat | U | U | `scancode24` |
| Radio menu | Z | W | `scancode29` |
| Radio commands (ISO key) | ISO \ | ISO < | `scancode100` |
| Execute autobuy preset | F1 | F1 | `scancode58` |
| Rebuy last purchase | F2 | F2 | `scancode59` |
| Vote YES | F3 | F3 | `scancode60` |
| Vote NO | F4 | F4 | `scancode61` |
| Load practice config | F11 | F11 | `scancode68` |
| Toggle developer console | F9 | F9 | `scancode66` |
| Toggle radar zoom | Caps Lock | Verr. Maj | `scancode57` |
<!-- bindings:end -->

`Mouse4` and `Mouse5` require side buttons. If your mouse lacks them, reassign **drop** and **lastinv** to available keyboard keys. `scancode100` is the extra ISO keyboard key, absent on US ANSI boards; disable or reassign it. The editor supports these changes, and [SCANCODES.md](SCANCODES.md) provides the full reference.

## Local practice

Open a local map, then press **F11** or run `exec pracc.cfg`. The file sets $60,000 starting money, buying anywhere, 60-minute rounds, respawn for both teams, ammunition without reloading, grenade previews and bullet impacts. It removes bots and requests a round restart after one second.

| Key | Action |
| :--- | :--- |
| F5 | Toggle free flight (`noclip`). |
| F6 | Rethrow the last grenade. |
| F7 | Add and place a bot at the crosshair. |

`sv_infinite_ammo "1"` supplies ammunition without reloading; use `"2"` to retain reloading. Automatic bunnyhopping changes movement compared with competitive servers. Air acceleration is left unchanged. `god "1"` requests invulnerability; its availability and effect depend on the game. The practice file does not create a server and requires server control to change protected settings. Reload a map or start a normal session to leave this environment.

## Maintenance

The root `.cfg` files are the source of truth for the supplied profile. After changing them, regenerate the editor’s embedded values and documentation tables with Node.js 18 or later:

```sh
node tools/sync-editor.js
node --test tests/*.test.js
node tools/sync-editor.js --check
```

Checks cover synchronization, import/export and syntax; they do not launch CS2. Commands can change with game updates. Old development-only audio commands have been removed from the active profile. See [CHANGELOG.md](CHANGELOG.md).

## Project

An independent project by [SpiRaL](https://steamcommunity.com/id/theogspiral), available under the [MIT license](LICENSE). Not affiliated with Valve. These files use the game console; protected practice commands require `sv_cheats` and server control. This configuration is not a Valve certification.
