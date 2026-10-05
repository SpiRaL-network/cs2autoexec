(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ConfigCore = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
  const keyPattern = /^(?:scancode\d+|[a-z0-9_+.-]+|[`,;\/\[\]'=])$/i;

  function parse(text) {
    const newline = text.includes('\r\n') ? '\r\n' : '\n';
    const lines = text.split(/\r?\n/);
    let section = ['Other', 'Autres'];
    const rows = [];
    for (let line = 0; line < lines.length; line++) {
      const heading = lines[line].match(/^\s*\/\/ @section (.+)$/);
      if (heading) { section = heading[1].split(' | '); continue; }
      // Quoted values are matched before comments, including // inside a bind.
      const disabled = lines[line].startsWith('// Disabled: ');
      const content = disabled ? lines[line].slice(13) : lines[line];
      const match = content.match(/^(\s*)((?:bind|alias)\s+(?:"[^"]+"|[^\s"]+)|[a-z_][a-z0-9_]*)(\s+)"([^"\r\n]*)"(\s*(?:\/\/.*)?)$/i);
      if (!match) continue; // Keep all unrecognised commands verbatim on export.
      const [, indent, command, gap, value, suffix] = match;
      if (['echo', 'exec', 'execifexists'].includes(command.toLowerCase())) continue;
      const lowerCommand = command.toLowerCase();
      const kind = lowerCommand.startsWith('bind ') ? 'bind' : lowerCommand.startsWith('alias ') ? 'alias' : 'setting';
      const descriptions = suffix.replace(/^\s*\/\/\s*/, '').split(' | ');
      const key = kind === 'bind' ? command.replace(/^bind\s+/i, '').replaceAll('"', '') : null;
      const type = kind !== 'setting' ? 'text' : /^(true|false)$/i.test(value) ? 'boolean' : numeric.test(value) ? 'number' : 'text';
      rows.push({ id: line, indent, command, gap, original: value, value, suffix, kind, key, originalKey: key, type,
        section: [...section], descriptions, enabled: !disabled, originalEnabled: !disabled });
    }
    return { lines, newline, rows };
  }

  function errors(model) {
    const issues = [];
    for (const row of model.rows) {
      if (row.kind === 'bind' && (!keyPattern.test(row.key) || /^scancode/i.test(row.key) &&
        (!/^scancode\d+$/i.test(row.key) || Number(row.key.slice(8)) < 4 || Number(row.key.slice(8)) > 286))) {
        issues.push({ id: row.id, field: 'key', code: 'key' });
      }
      if ((!row.value.trim() && row.type !== 'text') || /["\\\r\n\x00-\x1f\x7f]/.test(row.value)) issues.push({ id: row.id, field: 'value', code: 'text' });
      else if (row.type === 'number' && (!numeric.test(row.value) || !Number.isFinite(Number(row.value)))) issues.push({ id: row.id, field: 'value', code: 'number' });
      else if (row.type === 'boolean' && !/^(true|false|0|1)$/i.test(row.value)) issues.push({ id: row.id, field: 'value', code: 'boolean' });
    }
    return issues;
  }

  function changed(row) {
    return row.value !== row.original || row.key !== row.originalKey || row.enabled !== row.originalEnabled;
  }

  function serialize(model) {
    if (errors(model).length) throw new Error('Invalid configuration');
    const lines = [...model.lines];
    for (const row of model.rows) {
      if (!changed(row)) continue;
      const command = row.kind === 'bind' ? `bind "${row.key}"` : row.command;
      const content = `${row.indent}${command}${row.gap}"${row.value}"${row.suffix}`;
      lines[row.id] = row.enabled ? content : `// Disabled: ${content}`;
    }
    return lines.join(model.newline);
  }

  function duplicates(model) {
    const seen = new Set(), found = new Set();
    for (const row of model.rows.filter(row => row.enabled)) {
      const name = (row.kind === 'bind' ? `bind ${row.key}` : row.command).toLowerCase();
      if (seen.has(name)) found.add(name);
      seen.add(name);
    }
    return [...found];
  }

  function keyLabels(key) {
    const n = /^scancode(\d+)$/i.exec(key);
    if (!n) return [key.toUpperCase(), key.toUpperCase()];
    const code = Number(n[1]);
    if (code >= 4 && code <= 29) {
      const en = String.fromCharCode(65 + code - 4);
      return [en, ({ A: 'Q', Q: 'A', W: 'Z', Z: 'W', M: ',' })[en] || en];
    }
    if (code >= 30 && code <= 39) return [String((code - 29) % 10), String((code - 29) % 10)];
    if (code >= 58 && code <= 69) return [`F${code - 57}`, `F${code - 57}`];
    const labels = { 40:['Enter','Entrée'], 41:['Escape','Échap'], 42:['Backspace','Retour arrière'], 43:['Tab','Tab'],
      44:['Space','Espace'], 57:['Caps Lock','Verr. Maj'], 76:['Delete','Suppr'],
      100:['ISO \\','ISO <'], 224:['Left Ctrl','Ctrl gauche'], 225:['Left Shift','Maj gauche'], 226:['Left Alt','Alt gauche'] };
    return labels[code] || [key, key];
  }

  return { parse, errors, serialize, changed, duplicates, keyLabels };
});
