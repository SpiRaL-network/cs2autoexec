# Changelog

## v3.0.0 — 2026-10-05

- Added CS2 Profile Studio: offline Windows app, Steam account/library detection, manual source import and familiar settings categories.
- Complete VCFG/video capture with original bytes, unknown/nested data, versioned keys, player slots, reusable profiles, source inspection and export manifests.
- Added value editing, key reassignment, filters, reset, bilingual UI and portable autoexec generation without injected presets.
- Added video editing, hardware-preserving portable merging, full source restoration, preview, automatic backups, atomic replacement, failure recovery and guarded rollback.
- Added separate practice and vanilla surf/bhop/KZ configurations, plus an upstream-derived CS2KZ plugin CFG and setup notes. Plugin deployment and in-game validation are outside this release.
- Added core restore tests and an isolated Electron smoke test. Front-page documentation now describes the app; original presets/browser editor remain in the legacy guides.

## 2026-10-05

- Replaced duplicated overview comments with executable, aligned configuration tables and English/French descriptions. Removed a repeated spectator crosshair setting.
- Added an offline bilingual editor: search, category filters, editable values and bind keys, per-row disabling/reset, import, preview, duplicate detection and `.cfg` export. The root configurations generate the editor data and README tables.
- Added extraction from CS2’s saved user convars, key bindings and optional machine `.vcfg` files. The generated autoexec contains only the selected setup, includes saved analog axes, and reports skipped/repeated entries and missing file categories. No supplied profile values are added. The KeyValues section structure was checked against tracked [game configuration files](https://github.com/SteamTracking/GameTracking-CS2/tree/master/game/csgo/cfg); custom aliases and video configuration remain separate.
- Split the English and French guides into separate documents with consistent installation and customization steps. Clarified automatic loading, persistence, keyboard hardware differences and local practice requirements.
- Retained the existing sensitivity, networking, crosshair and key bindings. Corrected chat descriptions, sound percentages, radar values and infinite-ammunition documentation.
- Removed development-only `snd_async_flush`, `snd_headphone_pan_exponent`, `snd_front_headphone_position` and `snd_rear_headphone_position` commands from the active autoexec. These names appear with the `developmentonly` flag in the [game command dump](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/DumpSource2/commands.txt) consulted on 2026-10-05; this is a tracked game snapshot, not an in-game test. The remaining commands were checked for presence against that snapshot’s command and variable lists.
- Made practice invulnerability explicit with `god "1"`, so reloading the file does not toggle it off. Removed automatic `host_writeconfig`; saving game settings is now an explicit console action.
- Added installer backups, source/destination checks and an optional noninteractive mode for verification. No game settings are installed by the editor itself.
