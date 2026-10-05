'use strict';
const fs = require('node:fs');
const path = require('node:path');
const core = require('../editor/core.js');
const root = path.resolve(__dirname, '..');
const check = process.argv.includes('--check');
const sources = Object.fromEntries(['autoexec.cfg', 'pracc.cfg'].map(name => [name, fs.readFileSync(path.join(root, name), 'utf8')]));
const model = core.parse(sources['autoexec.cfg']);
for (const [name, source] of Object.entries(sources)) {
  const parsed = core.parse(source);
  if (core.errors(parsed).length || core.duplicates(parsed).length) throw new Error(`Invalid or duplicate rows in ${name}`);
  if (parsed.rows.some(row => row.descriptions.length !== 2 || row.section.length !== 2)) throw new Error(`Missing bilingual text in ${name}`);
}
function save(relative, content) {
  const target = path.join(root, relative);
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) {
      console.error(`Out of sync: ${relative}. Run node tools/sync-editor.js.`); process.exitCode = 1;
    }
  } else fs.writeFileSync(target, content);
}
save('editor/configs.js', '// Generated from the root .cfg files. Run node tools/sync-editor.js.\nconst CONFIG_SOURCES = ' + JSON.stringify(sources, null, 2).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029') + ';\n');
const selected = ['sensitivity', 'zoom_sensitivity_ratio', 'mm_dedicated_search_maxping', 'hud_scaling', 'cl_radar_scale', 'cl_hud_telemetry_frametime_poor'];
const escape = value => value.replaceAll('|', '\\|').replaceAll('\n', ' ');
for (const [file, language] of [['README.md', 0], ['README.fr.md', 1]]) {
  let readme = fs.readFileSync(path.join(root, file), 'utf8');
  const defaults = [language ? '| Réglage du profil | Valeur | Commande |' : '| Profile setting | Value | Command |', '| :--- | :--- | :--- |'];
  for (const command of selected) {
    const row = model.rows.find(row => row.command === command);
    if (!row) throw new Error(`Missing featured setting: ${command}`);
    defaults.push(`| ${escape(row.descriptions[language])} | \`${row.value}\` | \`${row.command}\` |`);
  }
  const bindings = [language ? '| Action | QWERTY | AZERTY | Config key |' : '| Action | QWERTY | AZERTY | Config key |', '| :--- | :--- | :--- | :--- |'];
  for (const row of model.rows.filter(row => row.kind === 'bind')) {
    const [en, fr] = core.keyLabels(row.key);
    bindings.push(`| ${escape(row.descriptions[language])} | ${escape(en)} | ${escape(fr)} | \`${row.key}\` |`);
  }
  for (const [name, lines] of [['defaults', defaults], ['bindings', bindings]]) {
    const expression = new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`);
    if (!expression.test(readme)) throw new Error(`Missing ${name} markers in ${file}`);
    readme = readme.replace(expression, `<!-- ${name}:start -->\n${lines.join('\n')}\n<!-- ${name}:end -->`);
  }
  save(file, readme);
}
if (!process.exitCode) console.log(check ? 'Editor and documentation are synchronized.' : 'Editor and documentation regenerated.');
