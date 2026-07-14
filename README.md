# CS2 Autoexec & Practice Config

Clean, fully-commented **autoexec** and **practice** configs for Counter-Strike 2
— AZERTY by default (switchable to QWERTY), tuned for competitive play and
efficient training.

Configs CS2 **autoexec** et **practice**, propres et entièrement commentées —
AZERTY par défaut (convertible en QWERTY), pensées pour le jeu compétitif et
l'entraînement.

**[🇬🇧 English](#-english) · [🇫🇷 Français](#-français)**

---

## 🇬🇧 English

### Installation

1. Open your CS2 config folder:
   ```
   ...\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg
   ```
2. Copy **`autoexec.cfg`** and **`pracc.cfg`** into it.
3. In Steam: right-click **CS2 → Properties → Launch Options**, and add:
   ```
   +exec autoexec.cfg
   ```

### What's inside

**`autoexec.cfg`** — loaded automatically at startup. Contains movement, mouse,
grenade, and utility binds (AZERTY scancodes), plus network tuning, viewmodel &
sensitivity, low-latency sound, fastswitch, HUD, radar, crosshair, scope,
grenade-crosshair, damage-prediction and telemetry settings. **Every line is
commented** with the bound key, its scancode, and the game default value.

**`pracc.cfg`** — a ready-to-use practice server: infinite money & buy-anywhere,
instant respawn, infinite ammo, grenade trajectory & bullet impacts, bhop /
auto-bhop, god mode, bots removed, warmup skipped.

### Default binds (AZERTY)

| Key | Action |
|-----|--------|
| `Z` `S` `Q` `D` | Move forward / back / left / right |
| `Space` / `Ctrl` / `Shift` | Jump / Crouch / Walk |
| `Mouse1` / `Mouse2` | Fire / Alt-fire |
| `Mouse Wheel` | Jump |
| `Mouse4` / `Mouse5` | Drop / Last weapon |
| `A` / `F` / `V` / `Mouse3` | Flash / Smoke / HE / Molotov |
| `E` / `R` / `G` | Use / Reload / Inspect |
| `C` | Fastswitch (knife quick-swap) |
| `T` / `Alt` | Voice / Ping |
| `F1` / `F2` | Autobuy / Rebuy |
| `F3` / `F4` | Vote YES / NO |
| `F9` / `F11` | Console / Load practice mode (`pracc.cfg`) |

**Practice binds:** `F5` Noclip · `F6` Rethrow last grenade · `F7` Place bot at
crosshair. Load practice mode with **`F11`**, or type `exec pracc.cfg` in the
console.

### Switch AZERTY → QWERTY

In `autoexec.cfg`, section **[1] MOVEMENT**, change:

```
bind scancode26 "+forward"  ->  bind scancode29 "+forward"
bind scancode4  "+left"     ->  bind scancode20 "+left"
```

### Is it safe? (VAC)

These are **plain text config files** — console commands only. No code, no
injection, no external software, nothing that touches the game process. The
`sv_cheats`-based commands in `pracc.cfg` **only work on your own local practice
server** and have no effect on VAC-secured / official matchmaking servers. Using
config files is permitted by Valve. See the [disclaimer](#disclaimer--avertissement).

---

## 🇫🇷 Français

### Installation

1. Ouvre ton dossier de config CS2 :
   ```
   ...\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg
   ```
2. Copies-y **`autoexec.cfg`** et **`pracc.cfg`**.
3. Dans Steam : clic droit sur **CS2 → Propriétés → Options de lancement**, ajoute :
   ```
   +exec autoexec.cfg
   ```

### Contenu

**`autoexec.cfg`** — chargée automatiquement au démarrage. Contient les binds de
déplacement, souris, grenades et utilitaires (scancodes AZERTY), ainsi que les
réglages réseau, viewmodel & sensibilité, son basse latence, fastswitch, HUD,
radar, viseur, viseur de grenade, prédiction des dégâts et télémétrie. **Chaque
ligne est commentée** avec la touche assignée, son scancode et la valeur par
défaut du jeu.

**`pracc.cfg`** — un serveur d'entraînement prêt à l'emploi : argent infini &
achat partout, réapparition instantanée, munitions infinies, trajectoire des
grenades & impacts de balles, bhop / auto-bhop, mode dieu, bots retirés, warmup
sauté.

### Binds par défaut (AZERTY)

| Touche | Action |
|--------|--------|
| `Z` `S` `Q` `D` | Avancer / reculer / gauche / droite |
| `Espace` / `Ctrl` / `Maj` | Sauter / s'accroupir / marcher |
| `Souris1` / `Souris2` | Tirer / tir alternatif |
| `Molette` | Sauter |
| `Souris4` / `Souris5` | Lâcher / arme précédente |
| `A` / `F` / `V` / `Souris3` | Flash / Smoke / HE / Molotov |
| `E` / `R` / `G` | Utiliser / recharger / inspecter |
| `C` | Fastswitch (sortie rapide du couteau) |
| `T` / `Alt` | Voix / ping |
| `F1` / `F2` | Achat auto / rachat |
| `F3` / `F4` | Vote OUI / NON |
| `F9` / `F11` | Console / charger le mode practice (`pracc.cfg`) |

**Binds d'entraînement :** `F5` Noclip · `F6` Relancer la dernière grenade ·
`F7` Placer un bot sous le viseur. Charge le mode practice avec **`F11`**, ou
tape `exec pracc.cfg` dans la console.

### Passer d'AZERTY à QWERTY

Dans `autoexec.cfg`, section **[1] MOVEMENT**, remplace :

```
bind scancode26 "+forward"  ->  bind scancode29 "+forward"
bind scancode4  "+left"     ->  bind scancode20 "+left"
```

### Est-ce sûr ? (VAC)

Ce sont de **simples fichiers texte** — uniquement des commandes console. Aucun
code, aucune injection, aucun logiciel externe, rien qui touche au processus du
jeu. Les commandes `sv_cheats` de `pracc.cfg` **ne fonctionnent que sur ton
propre serveur d'entraînement local** et n'ont aucun effet sur les serveurs
sécurisés VAC / matchmaking officiel. L'utilisation de fichiers de config est
autorisée par Valve. Voir l'[avertissement](#disclaimer--avertissement).

---

## Disclaimer / Avertissement

> **EN** — This project is a personal, unofficial configuration. It is **not
> affiliated with, endorsed by, or sponsored by Valve Corporation**.
> "Counter-Strike" is a trademark of Valve. The configs contain only standard,
> documented console commands; they are provided **"as is"**, without warranty,
> and you use them at your own discretion. Cheat commands are intended for
> **offline / local practice only**.
>
> **FR** — Ce projet est une configuration personnelle et non officielle. Il
> n'est **ni affilié, ni approuvé, ni sponsorisé par Valve Corporation**.
> « Counter-Strike » est une marque de Valve. Les configs ne contiennent que des
> commandes console standard et documentées ; elles sont fournies **« telles
> quelles »**, sans garantie, et tu les utilises à ta seule discrétion. Les
> commandes de triche sont destinées **à l'entraînement local / hors ligne
> uniquement**.

## License / Licence

Released under the **MIT License** — see [LICENSE](./LICENSE).

## Author / Auteur

**SpiRaL** — https://steamcommunity.com/id/theogspiral
