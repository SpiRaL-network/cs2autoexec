# CS2 key reference / Référence des touches

**EN** — `bind scancodeXX "command"` assigns a physical key position. The tables
show US QWERTY and French AZERTY labels; other layouts can print different labels
or omit keys. Find a position below and use its scancode, or edit it in the
[offline configuration editor](editor/index.html).

**FR** — `bind scancodeXX "commande"` attribue une position physique de touche.
Les tableaux indiquent les inscriptions QWERTY américain et AZERTY français ;
d’autres dispositions peuvent les modifier ou omettre certaines touches.
Choisissez un scancode ci-dessous ou utilisez le
[tableau de configuration hors ligne](editor/index.html).

Example / Exemple:
```
bind scancode26 "+forward"      // physical W-position (Z on AZERTY)
```

> The **AZERTY** column shows the letter printed on a French AZERTY keyboard for
> that same physical key. Where it's blank, the label is the same as QWERTY.
> *La colonne AZERTY montre la lettre imprimée sur un clavier AZERTY français pour
> cette même touche physique. Si vide, le label est identique au QWERTY.*

---

## Letters — Lettres

| Scancode | QWERTY | AZERTY |
|:--------:|:------:|:------:|
| 4  | A | **Q** |
| 5  | B | |
| 6  | C | |
| 7  | D | |
| 8  | E | |
| 9  | F | |
| 10 | G | |
| 11 | H | |
| 12 | I | |
| 13 | J | |
| 14 | K | |
| 15 | L | |
| 16 | M | **,** (comma) |
| 17 | N | |
| 18 | O | |
| 19 | P | |
| 20 | Q | **A** |
| 21 | R | |
| 22 | S | |
| 23 | T | |
| 24 | U | |
| 25 | V | |
| 26 | W | **Z** |
| 27 | X | |
| 28 | Y | |
| 29 | Z | **W** |

## Number row — Rangée des chiffres

Same physical keys on both layouts (AZERTY prints symbols unshifted, but the key
position is identical). / Mêmes touches physiques (AZERTY affiche des symboles,
mais la position est identique).

| Scancode | Key |
|:--------:|:---:|
| 30 | 1 |
| 31 | 2 |
| 32 | 3 |
| 33 | 4 |
| 34 | 5 |
| 35 | 6 |
| 36 | 7 |
| 37 | 8 |
| 38 | 9 |
| 39 | 0 |

## Function keys — Touches de fonction

| Scancode | Key | | Scancode | Key |
|:--------:|:---:|:-:|:--------:|:---:|
| 58 | F1 | | 64 | F7 |
| 59 | F2 | | 65 | F8 |
| 60 | F3 | | 66 | F9 |
| 61 | F4 | | 67 | F10 |
| 62 | F5 | | 68 | F11 |
| 63 | F6 | | 69 | F12 |

## Modifiers & main keys — Modificateurs et touches principales

| Scancode | Key |
|:--------:|:----|
| 40 | Enter / Entrée |
| 41 | Escape / Échap |
| 42 | Backspace / Retour arrière |
| 43 | Tab / Tabulation |
| 44 | Space / Espace |
| 57 | Caps Lock (AZERTY: **Verr. Maj / MAJ**) |
| 224 | Left Ctrl / Ctrl gauche |
| 225 | Left Shift / Maj gauche |
| 226 | Left Alt / Alt gauche |
| 227 | Left Windows / Win gauche |
| 228 | Right Ctrl / Ctrl droit |
| 229 | Right Shift / Maj droite |
| 230 | Right Alt / AltGr |
| 101 | Menu / Application key |

## Navigation & editing — Navigation et édition

| Scancode | Key | | Scancode | Key |
|:--------:|:----|:-:|:--------:|:----|
| 73 | Insert | | 79 | Arrow Right / Droite |
| 74 | Home / Début | | 80 | Arrow Left / Gauche |
| 75 | Page Up | | 81 | Arrow Down / Bas |
| 76 | Delete / Suppr | | 82 | Arrow Up / Haut |
| 77 | End / Fin | | 70 | Print Screen / Impr. écran |
| 78 | Page Down | | 72 | Pause |

## Numpad — Pavé numérique

| Scancode | Key | | Scancode | Key |
|:--------:|:----|:-:|:--------:|:----|
| 83 | Num Lock / Verr. Num | | 92 | Keypad 4 |
| 84 | Keypad / | | 93 | Keypad 5 |
| 85 | Keypad * | | 94 | Keypad 6 |
| 86 | Keypad - | | 95 | Keypad 7 |
| 87 | Keypad + | | 96 | Keypad 8 |
| 88 | Keypad Enter | | 97 | Keypad 9 |
| 89 | Keypad 1 | | 98 | Keypad 0 |
| 90 | Keypad 2 | | 99 | Keypad . |
| 91 | Keypad 3 | | | |

## Symbols — Symboles

The physical key is the same; the printed symbol differs between layouts. Values
below are typical **US-QWERTY** / **French AZERTY**. Punctuation placement can vary
by exact layout, so verify in game if unsure.
*La touche physique est la même ; le symbole imprimé diffère. Valeurs typiques
US-QWERTY / AZERTY français — vérifie en jeu en cas de doute.*

| Scancode | QWERTY | AZERTY (typical) |
|:--------:|:------:|:----------------:|
| 45 | `-` `_` | `)` `°` |
| 46 | `=` `+` | `=` `+` |
| 47 | `[` `{` | `^` `¨` |
| 48 | `]` `}` | `$` `£` |
| 49 | `\` `\|` | `*` `µ` |
| 51 | `;` `:` | **M** |
| 52 | `'` `"` | `ù` `%` |
| 53 | `` ` `` `~` | `²` (console key) |
| 54 | `,` `<` | `;` |
| 55 | `.` `>` | `:` |
| 56 | `/` `?` | `!` `§` |
| 100 | *(ISO key)* `\` `\|` | `<` `>` |

> **Scancode 100** is the extra ISO key next to Left Shift. It exists on
> ISO/European keyboards but **not on US-ANSI QWERTY** boards.
> *Scancode 100 = la touche ISO à côté de Maj gauche ; absente des claviers
> US-ANSI QWERTY.*

## Mouse — Souris

Mouse buttons are **not** scancodes; bind them by name:

| Name | Button |
|:-----|:-------|
| `MOUSE1` | Left click / Clic gauche |
| `MOUSE2` | Right click / Clic droit |
| `MOUSE3` | Middle click / Molette (clic) |
| `MOUSE4` | Side button 1 / Bouton latéral 1 |
| `MOUSE5` | Side button 2 / Bouton latéral 2 |
| `MWHEELUP` | Wheel up / Molette haut |
| `MWHEELDOWN` | Wheel down / Molette bas |

---

## How to verify a scancode — Vérifier un scancode

On a local map, note the key’s existing binding (`bind scancode54` in the console),
then temporarily bind a console message and press the key:

```text
bind scancode54 "echo SCANCODE_TEST"
```

Restore the previous binding afterwards, or reload your configuration if it defines
that key. This test prints in the console and does not send a chat message.

Sur une carte locale, notez le raccourci existant (`bind scancode54` dans la console),
puis attribuez temporairement le message ci-dessus et appuyez sur la touche.
Rétablissez ensuite le raccourci précédent, ou rechargez votre configuration si
elle définit cette touche. Le test écrit dans la console sans envoyer de message.
