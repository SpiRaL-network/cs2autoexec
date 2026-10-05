(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'));
  else root.VcfgImport = factory(root.ConfigCore);
})(typeof globalThis === 'object' ? globalThis : this, function (core) {
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

  function extract(files, referenceSource) {
    if (!files.length) throw new Error('No files');
    const reference = core.parse(referenceSource);
    const settingsMetadata = new Map(reference.rows.filter(row => row.kind === 'setting').map(row => [row.command.toLowerCase(), row]));
    const bindMetadata = new Map(reference.rows.filter(row => row.kind === 'bind').map(row => [row.value, row]));
    const additional = [
      ['volume', ['Audio','Audio'], ['Master volume','Volume général']],
      ['fps_max', ['Display & frame rate','Affichage et fréquence'], ['Frame rate limit','Limite de fréquence d’images']],
      ['fps_max_ui', ['Display & frame rate','Affichage et fréquence'], ['Menu frame rate limit','Limite de fréquence dans les menus']],
      ['viewmodel_fov', ['Mouse & viewmodel','Souris et arme à l’écran'], ['Viewmodel field of view','Champ de vision de l’arme']],
      ['m_yaw', ['Mouse & viewmodel','Souris et arme à l’écran'], ['Horizontal mouse multiplier','Multiplicateur horizontal de souris']],
      ['m_pitch', ['Mouse & viewmodel','Souris et arme à l’écran'], ['Vertical mouse multiplier','Multiplicateur vertical de souris']],
      ['cl_crosshair_length', ['Crosshair','Viseur'], ['Crosshair length','Longueur du viseur']],
      ['cl_crosshair_thickness', ['Crosshair','Viseur'], ['Crosshair thickness','Épaisseur du viseur']],
      ['cl_crosshairalpha', ['Crosshair','Viseur'], ['Crosshair opacity (legacy control)','Opacité du viseur (commande historique)']],
      ['cl_crosshairusealpha', ['Crosshair','Viseur'], ['Use crosshair opacity','Utiliser l’opacité du viseur']],
      ['cl_crosshaircolor', ['Crosshair','Viseur'], ['Crosshair color mode','Mode de couleur du viseur']],
      ['cl_crosshairgap', ['Crosshair','Viseur'], ['Crosshair gap (legacy control)','Écartement du viseur (commande historique)']],
      ['cl_crosshair_outlinethickness', ['Crosshair','Viseur'], ['Crosshair outline thickness (legacy control)','Épaisseur du contour (commande historique)']],
      ['voice_modenable', ['Audio','Audio'], ['Enable voice communication','Activer la communication vocale']],
      ['snd_voipvolume', ['Audio','Audio'], ['Voice chat volume','Volume de la discussion vocale']],
      ['snd_headphone_eq', ['Audio','Audio'], ['Headphone equalizer mode','Mode d’égalisation du casque']]
    ];
    for (const [name, section, descriptions] of additional) if (!settingsMetadata.has(name)) settingsMetadata.set(name,{section,descriptions});
    for (const [action, en, fr] of [
      ['slot1','Primary weapon','Arme principale'], ['slot2','Secondary weapon','Arme secondaire'], ['slot3','Knife','Couteau'],
      ['slot4','Cycle grenades','Parcourir les grenades'], ['slot5','Bomb','Bombe'], ['slot9','Decoy grenade','Grenade leurre'],
      ['+showscores','Scoreboard','Tableau des scores'], ['cancelselect','Close menu','Fermer le menu'],
      ['yaw','Horizontal mouse axis','Axe horizontal de souris'], ['pitch','Vertical mouse axis','Axe vertical de souris']
    ]) if (!bindMetadata.has(action)) bindMetadata.set(action,{descriptions:[en,fr]});
    const settings = new Map(), bindings = new Map(), analog = new Map(), skipped = [], overwritten = [];
    let convarFiles = 0, userConvarFiles = 0, bindingFiles = 0;
    // Machine-level values first, user values second, irrespective of picker order.
    const ordered = [...files].sort((a, b) => Number(!/machine/i.test(a.name)) - Number(!/machine/i.test(b.name)) || a.name.localeCompare(b.name));
    for (const file of ordered) {
      const tree = readKeyValues(file.text);
      const configs = tree.filter(([name, value]) => name.toLowerCase() === 'config' && Array.isArray(value));
      if (configs.length !== 1 || tree.length !== 1) throw new Error(`Unsupported VCFG: ${file.name}`);
      let recognised = false;
      for (const [groupName, entries] of configs[0][1]) {
        const group = groupName.toLowerCase();
        if (!['convars','bindings','analogbindings'].includes(group)) { skipped.push({file:file.name, name:groupName, reason:'section'}); continue; }
        if (!Array.isArray(entries)) throw new Error(`Invalid section: ${groupName}`);
        recognised = true;
        if (group === 'convars') { convarFiles++; if (!/machine/i.test(file.name)) userConvarFiles++; }
        if (group === 'bindings') bindingFiles++;
        const target = group === 'convars' ? settings : group === 'bindings' ? bindings : analog;
        for (const [name, value] of entries) {
          if (Array.isArray(value)) { skipped.push({file:file.name, name, reason:'nested'}); continue; }
          if (/["\\\r\n\x00-\x1f\x7f]/.test(name + value)) { skipped.push({file:file.name, name, reason:'syntax'}); continue; }
          if (group === 'convars' && !/^[a-z_][a-z0-9_]*$/i.test(name)) { skipped.push({file:file.name, name, reason:'name'}); continue; }
          const command = group === 'convars' ? name : `bind "${name}"`;
          const candidate = core.parse(`${command} "${value}"\n`);
          if (candidate.rows.length !== 1 || core.errors(candidate).length) { skipped.push({file:file.name, name, reason:'syntax'}); continue; }
          const id = name.toLowerCase();
          if (target.has(id)) overwritten.push({name, file:file.name});
          target.set(id, {name, value});
        }
      }
      if (!recognised) throw new Error(`No configuration settings: ${file.name}`);
    }
    // Avoid mixing two keyboard profiles or two user slots by accident.
    if (bindingFiles > 1 || userConvarFiles > 1 || convarFiles > 2) throw new Error('Choose one user slot, one keyboard profile and an optional machine file');
    if (!settings.size && !bindings.size && !analog.size) throw new Error('No exportable settings');
    const lines = [
      '// CS2 / CURRENT SETUP',
      '// EN: Extracted from selected game VCFG files. No SpiRaL defaults added.',
      '// FR: Extrait des fichiers VCFG sélectionnés. Aucun réglage SpiRaL ajouté.',
      '// EN: Only saved values are included. Review before loading in CS2.',
      '// FR: Seules les valeurs enregistrées sont incluses. Vérifiez avant de charger.',
      '// EN: Custom alias definitions and video settings are not stored here.',
      '// FR: Les définitions d’alias et les réglages vidéo ne sont pas inclus ici.',
      ''
    ];
    const grouped = new Map();
    for (const setting of settings.values()) {
      const metadata = settingsMetadata.get(setting.name.toLowerCase());
      const section = metadata?.section || ['Other saved settings', 'Autres réglages enregistrés'];
      if (!grouped.has(section[0])) grouped.set(section[0], {section, items:[]});
      grouped.get(section[0]).items.push({ ...setting, descriptions:metadata?.descriptions || ['Saved game setting','Réglage du jeu enregistré'] });
    }
    for (const {section, items} of grouped.values()) {
      lines.push(`// @section ${section.join(' | ')}`);
      for (const setting of items) lines.push(`${setting.name.padEnd(45)} "${setting.value}" // ${setting.descriptions.join(' | ')}`);
      lines.push('');
    }
    for (const [entries, section] of [[bindings,['Current key bindings','Raccourcis actuels']], [analog,['Mouse & analog axes','Souris et axes analogiques']]]) {
      if (!entries.size) continue;
      lines.push(`// @section ${section.join(' | ')}`);
      for (const binding of entries.values()) {
        const descriptions = bindMetadata.get(binding.value)?.descriptions || ['Saved binding','Raccourci enregistré'];
        lines.push(`bind "${binding.name}" "${binding.value}" // ${descriptions.join(' | ')}`);
      }
      lines.push('');
    }
    const text = lines.join('\n');
    const model = core.parse(text);
    if (core.errors(model).length) throw new Error('Invalid generated configuration');
    return {text, settings:settings.size, bindings:bindings.size + analog.size, skipped, overwritten,
      hasConvars:convarFiles > 0, hasBindings:bindingFiles > 0, sourceNames:ordered.map(file => file.name)};
  }

  return { readKeyValues, extract };
});
