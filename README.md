# CS2 Autoexec & Practice Config

Clean and well-structured CS2 autoexec and practice configs (AZERTY), optimized for competitive play and efficient training.

---

## Installation

1. Go to your CS2 config folder:

C:\Program Files (x86)\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg

2. Copy the files from this repo:

- autoexec.cfg  
- pracc.cfg  

into your CS2 config folder.

3. Add this launch option in Steam:

+exec autoexec.cfg

---

## Usage

### Autoexec

Automatically loaded at game startup (+exec autoexec.cfg)

Contains:
- Movement binds (AZERTY via scancodes)
- Mouse & combat binds
- Grenade direct binds (no cycling)
- Utility & communication binds
- Practice config loader (pracc.cfg)
- Network optimization settings
- Viewmodel & sensitivity tuning
- Sound optimization (low latency, no distractions)
- Fastswitch system (knife quick swap)
- HUD & UI customization
- Spectator camera settings
- Radar configuration
- Crosshair configuration
- Scope & sniper behavior
- Grenade crosshair setup
- Damage prediction settings
- Telemetry (FPS, ping, network stats)

---

### Practice Mode

F11 → Load practice mode

Or load manually in-game: Type in the console → "exec pracc.cfg"

Contains:
- Practice server setup (cheats, economy, round settings)
- Instant respawn (CT & T)
- Infinite money and buy anywhere
- Infinite ammo (reload required)
- Grenade trajectory and preview
- Bullet impact visualization
- Movement training (bhop, auto-bhop)
- Utility tools (god mode, warmup skip)
- Practice binds (noclip, rethrow, bot placement)

---

### Practice Binds

- F5 → Noclip  
- F6 → Rethrow last grenade  
- F7 → Place bot at crosshair  

---

## Customization

### Change binds

Edit autoexec.cfg in sections:

- [1] MOVEMENT  
- [2] MOUSE  
- [3] GRENADES  
- [4] UTILITY  
- ...

Example:

bind scancode26 "+forward"

---

### Switch AZERTY → QWERTY

Modify:

scancode26 → scancode29  
scancode4  → scancode20  

---

### Modify Practice Mode

Edit pracc.cfg:

- Economy  
- Respawn  
- Movement  
- Debug tools  

---

## Author

SpiRaL  
https://steamcommunity.com/id/theogspiral
