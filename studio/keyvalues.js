'use strict';
// Valve KeyValues text, not JSON. Keep ordered entries and duplicate keys.
function readKeyValues(source) {
  const tokens = [];
  let cursor = 0;
  while (cursor < source.length) {
    if (/\s|\uFEFF/.test(source[cursor])) { cursor++; continue; }
    if (source.slice(cursor, cursor + 2) === '//') { const end = source.indexOf('\n', cursor); cursor = end < 0 ? source.length : end + 1; continue; }
    if (source.slice(cursor, cursor + 2) === '/*') {
      const end = source.indexOf('*/', cursor + 2); if (end < 0) throw new Error('Unclosed comment'); cursor = end + 2; continue;
    }
    const char = source[cursor++];
    if (char === '{' || char === '}') { tokens.push({brace:char}); continue; }
    let value = '';
    if (char === '"') {
      let closed = false;
      while (cursor < source.length) {
        const next = source[cursor++];
        if (next === '"') { closed = true; break; }
        if (next === '\\') {
          if (cursor >= source.length) throw new Error('Unclosed escape');
          const escaped = source[cursor++];
          value += ({n:'\n',r:'\r',t:'\t','"':'"','\\':'\\'})[escaped] ?? `\\${escaped}`;
        } else value += next;
      }
      if (!closed) throw new Error('Unclosed quoted value');
    } else {
      value = char;
      while (cursor < source.length && !/[\s{}]/.test(source[cursor])) value += source[cursor++];
    }
    tokens.push({value});
  }
  let position = 0;
  function readObject(depth = 0) {
    if (depth > 16) throw new Error('Excessive nesting');
    const entries = [];
    while (position < tokens.length) {
      const key = tokens[position++];
      if (key.brace === '}') { if (!depth) throw new Error('Unexpected closing brace'); return entries; }
      if (key.brace) throw new Error('Missing key');
      const value = tokens[position++];
      if (!value || value.brace === '}') throw new Error('Missing value');
      entries.push([key.value, value.brace === '{' ? readObject(depth + 1) : value.value]);
    }
    if (depth) throw new Error('Unclosed object');
    return entries;
  }
  return readObject();
}

module.exports = {readKeyValues};
