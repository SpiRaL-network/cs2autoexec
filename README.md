# CS2 Autoexec & Practice Config

A clean, **fully-commented** autoexec + practice config for Counter-Strike 2.
**One universal file works on both AZERTY and QWERTY.**

Une config **autoexec + practice** propre et **entièrement commentée** pour
Counter-Strike 2. **Un seul fichier universel fonctionne en AZERTY et en QWERTY.**

**[🇬🇧 English](#-english) · [🇫🇷 Français](#-français) · [⌨️ Key bindings](#️-key-bindings--raccourcis)**

---

## ✨ Why one config works on both layouts

The binds use **scancodes** (physical key positions), not letters. `scancode26`
is always the **physical key** where QWERTY prints `W` and AZERTY prints `Z` — the
same key you press for "forward" on either keyboard. So **ZQSD (AZERTY)** and
**WASD (QWERTY)** are literally the same physical keys, and this single config is
**layout-independent**. You don't need separate AZERTY/QWERTY versions.

The comments inside the files show both labels — e.g. `key: Z (AZERTY) / W (QWERTY)`
— wherever the printed letter differs.

---

## 🇬🇧 English

### Option 1 — Automatic install (easiest)

1. **Download** this repo (green **Code** button → **Download ZIP**) and unzip it.
2. Double-click **`install.bat`**.
   It finds your CS2 `cfg` folder automatically and copies `autoexec.cfg` and
   `pracc.cfg` into it, then prints the next steps.

### Option 2 — Manual install

1. Open your CS2 `cfg` folder:
   ```
   ...\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg
   ```
   (In CS2: right-click the game → **Manage → Browse local files**, then go into
   `game\csgo\cfg`.)
2. Copy **`autoexec.cfg`** and **`pracc.cfg`** into that folder.

### Enable the developer console (required)

**CS2 → Settings → Game → Enable Developer Console = Yes.** The console opens with
the **`~`** key (or **`²`/`F9`** with this config).

### Loading the config — two ways

| | How | When to use |
|---|---|---|
| **A. Every launch** *(recommended)* | Steam → right-click CS2 → **Properties → Launch Options**, add: `+exec autoexec.cfg` | The config is re-applied automatically every time you start the game. |
| **B. Once per session** | Open the console and type: `exec autoexec.cfg` | Applies it **once**. Handy when you want to tweak settings live afterwards — your manual changes **won't be reset** on restart (because it isn't re-executed on launch). |

> In short: **`+exec`** in launch options = automatic every time. **`exec`** in the
> console = one-shot, so you keep any manual tweaks until you run it again.

### Practice mode

Load the practice server in-game with **`F11`**, or type `exec pracc.cfg` in the
console. It gives you infinite money & buy-anywhere, instant respawn, infinite
ammo, grenade trajectories & impacts, bhop/auto-bhop, god mode, and removes bots.

Practice binds: **`F5`** Noclip · **`F6`** Rethrow last grenade · **`F7`** Place bot
at crosshair.

### Is it VAC-safe?

Yes. These are **plain text config files** — only standard console commands, no
code, no injection, no external software. The `sv_cheats` commands in `pracc.cfg`
**only work on your own local practice server** and do nothing on VAC / official
servers. Using config files is allowed by Valve. See the
[disclaimer](#-disclaimer--avertissement).

---

## 🇫🇷 Français

### Option 1 — Installation automatique (le plus simple)

1. **Télécharge** ce repo (bouton vert **Code** → **Download ZIP**) et décompresse-le.
2. Double-clique sur **`install.bat`**.
   Il trouve automatiquement ton dossier `cfg` de CS2, y copie `autoexec.cfg` et
   `pracc.cfg`, puis affiche les étapes suivantes.

### Option 2 — Installation manuelle

1. Ouvre ton dossier `cfg` de CS2 :
   ```
   ...\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg
   ```
   (Dans CS2 : clic droit sur le jeu → **Gérer → Parcourir les fichiers locaux**,
   puis va dans `game\csgo\cfg`.)
2. Copies-y **`autoexec.cfg`** et **`pracc.cfg`**.

### Activer la console développeur (obligatoire)

**CS2 → Paramètres → Jeu → Activer la console développeur = Oui.** La console
s'ouvre avec la touche **`~`** (ou **`²`/`F9`** avec cette config).

### Charger la config — deux méthodes

| | Comment | Quand l'utiliser |
|---|---|---|
| **A. À chaque lancement** *(recommandé)* | Steam → clic droit CS2 → **Propriétés → Options de lancement**, ajoute : `+exec autoexec.cfg` | La config est ré-appliquée automatiquement à chaque démarrage. |
| **B. Une seule fois** | Ouvre la console et tape : `exec autoexec.cfg` | L'applique **une fois**. Pratique si tu veux ensuite bidouiller des réglages en jeu — tes modifs manuelles **ne seront pas remises à zéro** au redémarrage (puisqu'elle n'est pas ré-exécutée au lancement). |

> En résumé : **`+exec`** dans les options de lancement = automatique à chaque
> fois. **`exec`** dans la console = ponctuel, donc tu gardes tes modifs manuelles
> jusqu'à ce que tu la relances.

### Mode entraînement

Charge le serveur d'entraînement en jeu avec **`F11`**, ou tape `exec pracc.cfg`
dans la console. Il donne argent infini & achat partout, réapparition instantanée,
munitions infinies, trajectoires & impacts de grenades, bhop/auto-bhop, mode dieu,
et retire les bots.

Binds d'entraînement : **`F5`** Noclip · **`F6`** Relancer la dernière grenade ·
**`F7`** Placer un bot sous le viseur.

### Est-ce sûr pour le VAC ?

Oui. Ce sont de **simples fichiers texte** — uniquement des commandes console
standard, aucun code, aucune injection, aucun logiciel externe. Les commandes
`sv_cheats` de `pracc.cfg` **ne fonctionnent que sur ton serveur local** et n'ont
aucun effet en VAC / matchmaking officiel. Les fichiers de config sont autorisés
par Valve. Voir l'[avertissement](#-disclaimer--avertissement).

---

## ⌨️ Key bindings — Raccourcis

Same physical keys on both layouts — only the printed letter differs.
*Mêmes touches physiques sur les deux dispositions — seule la lettre imprimée change.*

| Action | AZERTY | QWERTY | Scancode |
|--------|:------:|:------:|:--------:|
| Move forward / Avancer | `Z` | `W` | 26 |
| Move back / Reculer | `S` | `S` | 22 |
| Strafe left / Gauche | `Q` | `A` | 4 |
| Strafe right / Droite | `D` | `D` | 7 |
| Jump / Sauter | `Space` + `Wheel` | `Space` + `Wheel` | 44 |
| Crouch / S'accroupir | `Ctrl` | `Ctrl` | 224 |
| Walk / Marcher | `Shift` | `Shift` | 225 |
| Fire / Alt-fire | `Mouse1` / `Mouse2` | `Mouse1` / `Mouse2` | — |
| Drop / Last weapon | `Mouse4` / `Mouse5` | `Mouse4` / `Mouse5` | — |
| Flash | `A` | `Q` | 20 |
| Smoke | `F` | `F` | 9 |
| HE grenade | `V` | `V` | 25 |
| Molotov | `Mouse3` | `Mouse3` | — |
| Use / Utiliser | `E` | `E` | 8 |
| Reload / Recharger | `R` | `R` | 21 |
| Inspect / Inspecter | `G` | `G` | 10 |
| Buy menu | `B` | `B` | 5 |
| Team menu | `,` | `M` | 16 |
| Voice / Voix | `T` | `T` | 23 |
| Ping | `Alt` | `Alt` | 226 |
| Switch hands | `X` | `X` | 27 |
| Fastswitch (knife) | `C` | `C` | 6 |
| Autobuy / Rebuy | `F1` / `F2` | `F1` / `F2` | 58 / 59 |
| Vote YES / NO | `F3` / `F4` | `F3` / `F4` | 60 / 61 |
| Console | `F9` | `F9` | 66 |
| Load practice | `F11` | `F11` | 68 |
| **Practice:** Noclip / Rethrow / Place bot | `F5` / `F6` / `F7` | `F5` / `F6` / `F7` | 62 / 63 / 64 |

> Note: the radio key uses `scancode100`, an **ISO-keyboard** key (`<` / `\`) that
> does not exist on US-ANSI QWERTY keyboards — rebind it if yours lacks it.

## Customizing / Personnaliser

Every line in `autoexec.cfg` is commented with its action, the key (both labels),
its scancode, and the game default. Edit any bind and re-run `exec autoexec.cfg`.
*Chaque ligne de `autoexec.cfg` est commentée. Modifie un bind et refais
`exec autoexec.cfg`.*

Want to bind a different key? See **[SCANCODES.md](./SCANCODES.md)** — a full cheat
sheet listing the scancode of every key (AZERTY + QWERTY).
*Envie de binder une autre touche ? Vois **[SCANCODES.md](./SCANCODES.md)** — la
fiche complète du scancode de chaque touche (AZERTY + QWERTY).*

## ⚠️ Disclaimer / Avertissement

> **EN** — Personal, unofficial config, **not affiliated with Valve Corporation**.
> "Counter-Strike" is a trademark of Valve. Only standard documented console
> commands are used; provided **"as is"**, without warranty. `sv_cheats` commands
> are for **offline / local practice only**.
>
> **FR** — Config personnelle et non officielle, **non affiliée à Valve
> Corporation**. « Counter-Strike » est une marque de Valve. Seules des commandes
> console standard et documentées sont utilisées ; fournie **« telle quelle »**,
> sans garantie. Les commandes `sv_cheats` sont réservées à l'**entraînement local
> / hors ligne**.

## License / Licence

**MIT** — see [LICENSE](./LICENSE).

## Author / Auteur

**SpiRaL** — https://steamcommunity.com/id/theogspiral
