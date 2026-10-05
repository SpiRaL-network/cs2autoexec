'use strict';
const catalog=require('./catalog.json');
const definitions={
  practice:{name:['Practice','Entraînement'],values:{sv_cheats:1,bot_quota:0,mp_freezetime:0,mp_roundtime:60,mp_roundtime_defuse:60,mp_roundtime_hostage:60,mp_ignore_round_win_conditions:1,mp_limitteams:0,mp_autoteambalance:0,mp_buy_anywhere:1,mp_buytime:60000,mp_maxmoney:65535,mp_startmoney:65535,sv_infinite_ammo:2,ammo_grenade_limit_total:5,sv_grenade_trajectory_prac_pipreview:1,sv_showimpacts:1}},
  surf:{name:['Surf · vanilla sandbox','Surf · bac à sable vanilla'],values:{sv_cheats:0,bot_quota:0,mp_freezetime:0,mp_roundtime:60,mp_ignore_round_win_conditions:1,mp_limitteams:0,mp_autoteambalance:0,sv_accelerate:10,sv_airaccelerate:800,sv_gravity:800,sv_maxvelocity:3500,sv_enablebunnyhopping:1,sv_autobunnyhopping:0,sv_staminamax:0,sv_staminajumpcost:0,sv_staminalandcost:0,sv_falldamage_scale:0}},
  bhop:{name:['Bunnyhop · vanilla sandbox','Bunnyhop · bac à sable vanilla'],values:{sv_cheats:0,bot_quota:0,mp_freezetime:0,mp_roundtime:60,mp_ignore_round_win_conditions:1,mp_limitteams:0,mp_autoteambalance:0,sv_airaccelerate:100,sv_accelerate:5.5,sv_gravity:800,sv_maxvelocity:3500,sv_enablebunnyhopping:1,sv_autobunnyhopping:1,sv_staminamax:0,sv_staminajumpcost:0,sv_staminalandcost:0,sv_falldamage_scale:0}},
  kz:{name:['KZ · vanilla movement sandbox','KZ · entraînement vanilla'],values:{sv_cheats:0,bot_quota:0,mp_freezetime:0,mp_roundtime:60,mp_ignore_round_win_conditions:1,mp_limitteams:0,mp_autoteambalance:0,sv_airaccelerate:12,sv_accelerate:5.5,sv_gravity:800,sv_maxvelocity:3500,sv_enablebunnyhopping:0,sv_autobunnyhopping:0,sv_staminamax:80,sv_staminajumpcost:0.08,sv_staminalandcost:0.05,sv_falldamage_scale:0}}
};
function generate(kind,overrides={}){
  const def=definitions[kind];if(!def || !overrides || typeof overrides!=='object')throw Error('Invalid server preset');
  for(const key of Object.keys(overrides))if(!Object.hasOwn(def.values,key))throw Error('Unknown server setting');
  const values={...def.values,...overrides};
  const lines=[`// CS2 Profile Studio / ${def.name.join(' / ')}`,`// Command names / limits checked against GameTracking-CS2 on ${catalog.checkedAt}.`,
    '// Gameplay values below are editable starting points, not a league or plugin ruleset.',
    '// Use on your own local / dedicated server, after loading the map and game mode.',
    '// Surf / BHOP / KZ timers, checkpoints and official movement need suitable maps and plugins.',
    '// This does not start, host or expose a network server.', ''];
  for(const [key,input] of Object.entries(values)){
    const value=Number(input),meta=catalog.convars[key];
    if(!meta || !Number.isFinite(value) || meta.min!==undefined&&value<meta.min || meta.max!==undefined&&value>meta.max)throw Error(`${key}: invalid value`);
    lines.push(`${key.padEnd(42)} "${value}"`);
  }
  lines.push('','bot_kick','mp_warmup_end','mp_restartgame "1"','');
  return lines.join('\n');
}
const guide=[
  'SERVER PROFILES / PROFILS SERVEUR', '',
  'Copy the chosen CFG to game/csgo/cfg on your own local or dedicated CS2 server.',
  'Load a suitable map (surf / bhop / kz workshop map for movement), then execute: exec studio-surf.cfg (or the selected file).',
  'Game-mode files and map scripts can override cvars; reapply after loading the map. No tickrate or CS:GO-only tuning is assumed.',
  'Practice uses sv_cheats 1. Movement sandboxes use sv_cheats 0 and contain no timer, ranking or checkpoint plugin.',
  'Use the console to check effective values. These presets have not been play-tested inside CS2.', '',
  'For a full KZ server, install Metamod:Source and the CS2KZ plugin with the dependencies documented upstream.',
  'https://github.com/KZGlobalTeam/cs2kz-metamod',
  'https://docs.cs2kz.org/',
  'The plugin README currently describes a work-in-progress. Install versions compatible with your CS2 build.',
  'cs2kz.cfg is generated separately from verified upstream keys; copy it beside the plugin config only after installing the plugin.',
  'Do not apply the vanilla KZ movement sandbox on top of a plugin mode; let that mode control its movement rules.', '',
  'Copiez le CFG choisi dans game/csgo/cfg du serveur local ou dédié, chargez une carte adaptée, puis exec studio-surf.cfg (ou le fichier choisi).',
  'Les scripts de carte et de mode peuvent remplacer les valeurs. Vérifiez les valeurs effectives dans la console.',
  'Les modes de mouvement vanilla n’incluent ni chronomètre ni checkpoints. Ces presets ne sont pas testés en jeu.',
  'Pour un serveur KZ complet, installez Metamod et CS2KZ selon la documentation ci-dessus. Laissez le plugin gérer les règles de mouvement.',
  'L’application génère des fichiers ; elle n’installe pas les plugins, ne démarre pas un serveur et ne configure pas le réseau.'
].join('\n');
module.exports={definitions,generate,guide};
