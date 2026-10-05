'use strict';
(() => {
  const core = ConfigCore;
  const $ = id => document.getElementById(id);
  const dictionaries = {
    en: {
      offline:'Offline · private', language:'Language', eyebrow:'COUNTER-STRIKE 2 / CONFIGURATION WORKSPACE',
      title:'Your settings.\nYour game.', intro:'A clear view of every value. Adjust your profile, review the file, and take it into CS2.',
      workflow:'A SIMPLE WORKFLOW', step1:'Choose a configuration', step2:'Edit values and key bindings', step3:'Export to your game’s cfg folder',
      local:'Everything stays in this browser. No account, no upload.', search:'Search settings or commands…', category:'Category',
      all:'All categories', changedOnly:'Modified only', import:'Import .cfg', reset:'Reset file', export:'Export .cfg ↓',
      active:'On', setting:'Setting / command', value:'Value / action', description:'Description', resetRow:'Reset row',
      tableCaption:'Editable configuration values', empty:'No settings match your filters.', preview:'Review the exported file',
      previewNote:'Comments and commands outside the table are preserved. Imports and edits are kept only until you close or reload this page.',
      installLabel:'01 / INSTALL', installTitle:'From browser to game.',
      installBody:'Place the exported file in game/csgo/cfg inside your CS2 installation. Open the console and run:',
      startup:'For startup loading, add +exec autoexec.cfg to Steam’s launch options. CS2 may also load autoexec.cfg automatically.',
      keysLabel:'02 / KEYBOARD', keysTitle:'Physical keys. Familiar layouts.',
      keysBody:'Scancodes refer to key positions. The table shows US QWERTY and French AZERTY labels. Edit a binding’s key to suit your keyboard or mouse.',
      keysNote:'Mouse4/5 need side buttons. Scancode100 needs an ISO keyboard. Disable or reassign bindings you cannot use.',
      keyReference:'Full key reference ↗', footer:'An independent configuration project. Personal defaults, adaptable to your setup.',
      autoNote:'Personal starting profile. Adjust sensitivity and ping for your setup. Values are checked for syntax; the game may restrict their range.',
      practiceNote:'Local practice only. Open a local map before running this file. F5: noclip · F6: rethrow · F7: place bot. Requires server control.',
      changes:n => `${n} modified`, enable:name => `Enable ${name}`, valueLabel:name => `Value for ${name}`,
      keyLabel:name => `Key for ${name}`, rowReset:name => `Reset ${name}`, count:n => `${n} settings`,
      invalid:n => `${n} invalid field(s). Correct them before exporting.`, duplicate:n => `Duplicate commands or keys: ${n}. Later lines take precedence.`,
      number:'Enter a finite number using a decimal point.', boolean:'Use true, false, 0 or 1.',
      text:'Enter a value without quotes, backslashes or control characters.',
      resetConfirm:'Reset this file to the repository profile? Your edits and imported content for this file will be discarded.',
      importConfirm:'Replace this file with the import? Your current edits for this file will be discarded.',
      imported:name => `Imported ${name}. Unrecognised lines are kept unchanged.`, importEmpty:'No editable quoted values found. Your current file was kept.',
      importLarge:'Choose a .cfg file smaller than 2 MB.', importError:'Could not read the file.',
      exported:name => `Exported ${name}. Copy the download into your game’s cfg folder.`, invalidPreview:'Correct invalid values to review the export.',
      exportReminder:'Export your changes before leaving this page.',
      extractLabel:'START WITH YOUR EXISTING SETUP', extractTitle:'Already comfortable in CS2?',
      extractBody:'Turn your saved game settings into an autoexec that starts from your own values and bindings.',
      extractButton:'Extract CS2 setup ↗', extractHelp:'Where to find your files',
      extractPath:'Close CS2, then open the account’s cfg folder inside your Steam installation:',
      extractSelect:'Select these files together from the same account and slot:', optional:'(optional)',
      extractLimits:'Only saved values are extracted. Keep custom alias definitions separately. Video settings are not included.',
      extractReport:'Extraction details', extractConfirm:'Replace the autoexec editor with your saved CS2 setup? Its current edits or imported content will be discarded.',
      extractError:'Extraction failed. Choose the user convars, user keys and optional machine .vcfg files from one account and slot. Your editor content was kept.',
      extracting:'Reading your saved setup…',
      extracted:result => `${result.settings} settings and ${result.bindings} bindings extracted. ${result.skipped.length} omitted, ${result.overwritten.length} repeated values resolved. Review autoexec.cfg below, then export it.`,
      missingConvars:'No convar file selected: game settings are not included.', missingBindings:'No key file selected: keyboard bindings are not included.',
      omitted:'Omitted entries', overridden:'Repeated entries (later values retained)',
      currentNote:'Your saved CS2 setup. No SpiRaL values or practice bindings were added. Review the extraction details and export when ready.',
      importedNote:'Your imported file. Quoted values are editable; other commands are preserved.',
      key:'Use a key name, a single punctuation key, or scancode4–286.',
      namedKey:name => `Key: ${name}`, syntax:'unsupported key or value', section:'unsupported section', nested:'nested value', name:'invalid command name'
    },
    fr: {
      offline:'Hors ligne · privé', language:'Langue', eyebrow:'COUNTER-STRIKE 2 / ESPACE DE CONFIGURATION',
      title:'Vos réglages.\nVotre jeu.', intro:'Chaque valeur, clairement présentée. Adaptez votre profil, vérifiez le fichier et chargez-le dans CS2.',
      workflow:'EN TROIS ÉTAPES', step1:'Choisissez une configuration', step2:'Modifiez les valeurs et raccourcis', step3:'Exportez vers le dossier cfg du jeu',
      local:'Tout reste dans ce navigateur. Aucun compte, aucun envoi.', search:'Rechercher un réglage ou une commande…', category:'Catégorie',
      all:'Toutes les catégories', changedOnly:'Modifiés uniquement', import:'Importer un .cfg', reset:'Réinitialiser', export:'Exporter le .cfg ↓',
      active:'Actif', setting:'Réglage / commande', value:'Valeur / action', description:'Description', resetRow:'Réinitialiser la ligne',
      tableCaption:'Valeurs de configuration modifiables', empty:'Aucun réglage ne correspond aux filtres.', preview:'Vérifier le fichier exporté',
      previewNote:'Les commentaires et commandes hors tableau sont conservés. Les imports et modifications restent disponibles jusqu’à la fermeture ou au rechargement de cette page.',
      installLabel:'01 / INSTALLATION', installTitle:'Du navigateur au jeu.',
      installBody:'Placez le fichier exporté dans game/csgo/cfg, dans le dossier d’installation de CS2. Ouvrez la console et tapez :',
      startup:'Pour charger au démarrage, ajoutez +exec autoexec.cfg aux options de lancement Steam. CS2 peut également charger autoexec.cfg automatiquement.',
      keysLabel:'02 / CLAVIER', keysTitle:'Touches physiques. Repères familiers.',
      keysBody:'Les scancodes désignent des positions physiques. Le tableau affiche les touches QWERTY américain et AZERTY français. Adaptez chaque raccourci à votre clavier ou souris.',
      keysNote:'Mouse4/5 nécessitent des boutons latéraux. Scancode100 nécessite un clavier ISO. Désactivez ou réattribuez les raccourcis inutilisables.',
      keyReference:'Référence complète des touches ↗', footer:'Un projet de configuration indépendant. Un profil personnel à adapter à votre matériel.',
      autoNote:'Profil de départ personnel. Adaptez sensibilité et ping à votre matériel. La syntaxe est vérifiée ; le jeu peut limiter les valeurs.',
      practiceNote:'Entraînement local uniquement. Ouvrez une carte locale avant de charger ce fichier. F5 : vol libre · F6 : relancer · F7 : placer un bot. Contrôle du serveur requis.',
      changes:n => `${n} modification${n === 1 ? '' : 's'}`, enable:name => `Activer ${name}`, valueLabel:name => `Valeur de ${name}`,
      keyLabel:name => `Touche de ${name}`, rowReset:name => `Réinitialiser ${name}`, count:n => `${n} réglages`,
      invalid:n => `${n} champ(s) invalide(s). Corrigez-les avant d’exporter.`, duplicate:n => `Commandes ou touches en double : ${n}. Les dernières lignes sont prioritaires.`,
      number:'Saisissez un nombre fini avec un point décimal.', boolean:'Utilisez true, false, 0 ou 1.',
      text:'Saisissez une valeur sans guillemets, antislashs ni caractères de contrôle.',
      resetConfirm:'Rétablir le profil du dépôt pour ce fichier ? Ses modifications et son contenu importé seront perdus.',
      importConfirm:'Remplacer ce fichier par l’import ? Ses modifications actuelles seront perdues.',
      imported:name => `${name} importé. Les lignes non reconnues sont conservées.`, importEmpty:'Aucune valeur modifiable entre guillemets. Le fichier actuel est conservé.',
      importLarge:'Choisissez un fichier .cfg de moins de 2 Mo.', importError:'Lecture du fichier impossible.',
      exported:name => `${name} exporté. Copiez le téléchargement dans le dossier cfg du jeu.`, invalidPreview:'Corrigez les valeurs invalides pour vérifier l’export.',
      exportReminder:'Exportez vos modifications avant de quitter cette page.',
      extractLabel:'PARTEZ DE VOTRE SETUP ACTUEL', extractTitle:'Déjà à l’aise dans CS2 ?',
      extractBody:'Transformez vos réglages enregistrés en autoexec, à partir de vos propres valeurs et raccourcis.',
      extractButton:'Extraire mon setup CS2 ↗', extractHelp:'Où trouver vos fichiers',
      extractPath:'Fermez CS2, puis ouvrez le dossier cfg du compte dans votre installation Steam :',
      extractSelect:'Sélectionnez ensemble ces fichiers du même compte et du même profil :', optional:'(facultatif)',
      extractLimits:'Seules les valeurs enregistrées sont extraites. Gardez les définitions d’alias personnalisés à part. Les réglages vidéo ne sont pas inclus.',
      extractReport:'Détails de l’extraction', extractConfirm:'Remplacer l’autoexec du tableau par votre setup CS2 enregistré ? Ses modifications et son contenu importé seront perdus.',
      extractError:'Extraction impossible. Choisissez les fichiers .vcfg de réglages utilisateur, de touches et éventuellement de machine, depuis un seul compte et profil. Le contenu du tableau est conservé.',
      extracting:'Lecture de votre setup enregistré…',
      extracted:result => `${result.settings} réglages et ${result.bindings} raccourcis extraits. ${result.skipped.length} entrées omises, ${result.overwritten.length} valeurs répétées résolues. Vérifiez autoexec.cfg ci-dessous, puis exportez-le.`,
      missingConvars:'Aucun fichier de réglages sélectionné : les valeurs du jeu ne sont pas incluses.', missingBindings:'Aucun fichier de touches sélectionné : les raccourcis clavier ne sont pas inclus.',
      omitted:'Entrées omises', overridden:'Entrées répétées (dernières valeurs conservées)',
      currentNote:'Votre setup CS2 enregistré. Aucun réglage SpiRaL ni raccourci d’entraînement n’a été ajouté. Vérifiez les détails de l’extraction, puis exportez.',
      importedNote:'Votre fichier importé. Les valeurs entre guillemets sont modifiables ; les autres commandes sont conservées.',
      key:'Nom de touche, touche de ponctuation ou scancode4–286.',
      namedKey:name => `Touche : ${name}`, syntax:'touche ou valeur non prise en charge', section:'section non prise en charge', nested:'valeur imbriquée', name:'nom de commande invalide'
    }
  };
  let language = navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  let file = 'autoexec.cfg';
  const models = Object.fromEntries(Object.entries(CONFIG_SOURCES).map(([name, text]) => [name, core.parse(text)]));
  const importedFiles = new Set();
  const profileKinds = { 'autoexec.cfg':'spiral', 'pracc.cfg':'spiral' };
  let extraction = null;
  const stamp = model => JSON.stringify([model.lines, model.rows.map(row => [row.value, row.key, row.enabled])]);
  const savedStates = Object.fromEntries(Object.entries(models).map(([name, model]) => [name, stamp(model)]));
  let message = '';
  const t = (key, value) => typeof dictionaries[language][key] === 'function' ? dictionaries[language][key](value) : dictionaries[language][key];
  const label = pair => pair[language === 'fr' ? 1 : 0] || pair[0] || '';
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function updateSummary() {
    const model = models[file], issues = core.errors(model), duplicates = core.duplicates(model);
    $('change-count').textContent = t('changes', model.rows.filter(core.changed).length);
    $('export').disabled = issues.length > 0;
    $('notice').textContent = [issues.length ? t('invalid', issues.length) : '', duplicates.length ? t('duplicate', duplicates.join(', ')) : '', message].filter(Boolean).join(' ');
    $('notice').classList.toggle('has-error', issues.length > 0 || duplicates.length > 0);
    $('preview').textContent = issues.length ? t('invalidPreview') : core.serialize(model);
    for (const row of model.rows) {
      const tr = document.querySelector(`tr[data-row="${row.id}"]`);
      if (!tr) continue;
      tr.classList.toggle('modified', core.changed(row));
      tr.classList.toggle('disabled', !row.enabled);
      for (const field of ['key', 'value']) {
        const input = tr.querySelector(`[data-field="${field}"]`);
        if (!input) continue;
        const issue = issues.find(item => item.id === row.id && item.field === field);
        input.setAttribute('aria-invalid', String(Boolean(issue)));
        tr.querySelector(`[data-error="${field}"]`).textContent = issue ? t(issue.code) : '';
      }
      const keyLabel = tr.querySelector('.key-label');
      if (keyLabel) { const [en, fr] = core.keyLabels(row.key); keyLabel.textContent = /^scancode/i.test(row.key) ? `QWERTY ${en} / AZERTY ${fr}` : t('namedKey', row.key); }
    }
  }

  function renderRows() {
    const model = models[file], query = $('search').value.toLowerCase().trim(), selected = $('section').value;
    const rows = model.rows.filter(row => (!selected || row.section[0] === selected) && (!$('changed-only').checked || core.changed(row)) &&
      [row.command, row.key || '', row.value, ...row.descriptions, ...row.section, ...(row.key ? core.keyLabels(row.key) : [])].join(' ').toLowerCase().includes(query));
    const fragment = document.createDocumentFragment();
    let group = null;
    for (const row of rows) {
      if (group !== row.section[0]) {
        group = row.section[0];
        const tr = make('tr', 'group'), td = make('td', '', label(row.section)); td.colSpan = 5; tr.append(td); fragment.append(tr);
      }
      const tr = make('tr'); tr.dataset.row = row.id;
      const onCell = make('td'), checkbox = make('input'); checkbox.type = 'checkbox'; checkbox.checked = row.enabled;
      checkbox.setAttribute('aria-label', t('enable', row.command));
      checkbox.addEventListener('change', () => { row.enabled = checkbox.checked; message = ''; updateSummary(); }); onCell.append(checkbox);
      const commandCell = make('td'); commandCell.append(make('div', 'command', row.command));
      if (row.kind === 'bind') {
        commandCell.append(createInput(row, 'key', 'key-input'), make('span', 'key-label'), errorNode(row, 'key'));
      }
      const valueCell = make('td'); valueCell.append(createInput(row, 'value', 'value-input'), errorNode(row, 'value'));
      const descriptionCell = make('td', 'description', label(row.descriptions));
      const resetCell = make('td'), reset = make('button', 'row-reset', '↺'); reset.type = 'button';
      reset.setAttribute('aria-label', t('rowReset', row.command)); reset.title = t('rowReset', row.command);
      reset.addEventListener('click', () => { row.value = row.original; row.key = row.originalKey; row.enabled = row.originalEnabled; message = ''; renderRows(); });
      resetCell.append(reset); tr.append(onCell, commandCell, valueCell, descriptionCell, resetCell); fragment.append(tr);
    }
    $('rows').replaceChildren(fragment);
    $('empty').hidden = rows.length > 0;
    updateSummary();
  }

  function errorNode(row, field) {
    const node = make('span', 'field-error'); node.dataset.error = field; node.id = `${field}-error-${row.id}`; return node;
  }

  function createInput(row, field, className) {
    const input = make('input', className); input.type = 'text'; input.value = row[field]; input.dataset.field = field;
    input.spellcheck = false; input.autocomplete = 'off';
    input.setAttribute('aria-label', t(field === 'key' ? 'keyLabel' : 'valueLabel', row.command));
    input.setAttribute('aria-describedby', `${field}-error-${row.id}`);
    if (row.type === 'number' && field === 'value') input.inputMode = 'decimal';
    input.addEventListener('input', () => { row[field] = input.value; message = ''; updateSummary(); });
    // Apply filters after editing, so a focused input is not destroyed per keystroke.
    input.addEventListener('change', () => { if ($('changed-only').checked) renderRows(); });
    return input;
  }

  function render() {
    document.documentElement.lang = language;
    $('language').value = language;
    document.querySelectorAll('[data-i18n]').forEach(node => {
      const text = t(node.dataset.i18n);
      if (node.dataset.i18n === 'title') {
        const [first, second] = text.split('\n'); node.replaceChildren(document.createTextNode(first), document.createElement('br'), document.createTextNode(second));
      } else node.textContent = text;
    });
    $('search').placeholder = t('search');
    $('profile-note').textContent = t(profileKinds[file] === 'current' ? 'currentNote' : profileKinds[file] === 'import' ? 'importedNote' : file === 'autoexec.cfg' ? 'autoNote' : 'practiceNote');
    renderExtraction();
    $('exec-command').textContent = `exec ${file}`;
    const selected = $('section').value;
    $('section').replaceChildren(new Option(t('all'), ''));
    const sections = new Map(models[file].rows.map(row => [row.section[0], row.section]));
    sections.forEach((pair, name) => $('section').append(new Option(label(pair), name)));
    if (sections.has(selected)) $('section').value = selected;
    renderRows();
  }

  document.querySelectorAll('[data-file]').forEach(tab => {
    tab.addEventListener('click', () => {
      file = tab.dataset.file; message = ''; $('section').value = ''; $('search').value = ''; $('changed-only').checked = false;
      document.querySelectorAll('[data-file]').forEach(node => { node.setAttribute('aria-selected', String(node === tab)); node.tabIndex = node === tab ? 0 : -1; });
      $('config-panel').setAttribute('aria-labelledby', tab.id); document.querySelector('.table-wrap').scrollTop = 0; render();
    });
    tab.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault(); const tabs = [...document.querySelectorAll('[data-file]')];
        const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[1] : tabs.find(node => node !== tab);
        next.click(); next.focus();
      }
    });
  });
  $('language').addEventListener('change', () => { language = $('language').value; message = ''; render(); });
  $('search').addEventListener('input', renderRows);
  $('section').addEventListener('change', renderRows);
  $('changed-only').addEventListener('change', renderRows);
  $('reset').addEventListener('click', () => {
    if ((importedFiles.has(file) || models[file].rows.some(core.changed)) && !confirm(t('resetConfirm'))) return;
    models[file] = core.parse(CONFIG_SOURCES[file]); savedStates[file] = stamp(models[file]); importedFiles.delete(file); profileKinds[file] = 'spiral';
    if (file === 'autoexec.cfg') extraction = null;
    message = ''; render();
  });
  $('import').addEventListener('click', () => $('import-file').click());
  $('import-file').addEventListener('change', async () => {
    const uploaded = $('import-file').files[0]; $('import-file').value = ''; if (!uploaded) return;
    const targetFile = file;
    if (uploaded.size > 2 * 1024 * 1024 || !/\.cfg$/i.test(uploaded.name)) { message = t('importLarge'); updateSummary(); return; }
    if ((importedFiles.has(targetFile) || models[targetFile].rows.some(core.changed)) && !confirm(t('importConfirm'))) return;
    try {
      const model = core.parse((await uploaded.text()).replace(/^\uFEFF/, ''));
      if (!model.rows.length) { message = t('importEmpty'); updateSummary(); return; }
      models[targetFile] = model; importedFiles.add(targetFile); profileKinds[targetFile] = 'import';
      if (targetFile === 'autoexec.cfg') extraction = null;
      if (targetFile === file) { message = t('imported', uploaded.name); $('section').value = ''; $('search').value = ''; $('changed-only').checked = false; render(); }
    } catch { message = t('importError'); updateSummary(); }
  });
  function renderExtraction() {
    $('extract-status').hidden = !extraction;
    $('extract-report').hidden = !extraction || (!extraction.skipped.length && !extraction.overwritten.length);
    if (!extraction) return;
    $('extract-status').textContent = [t('extracted', extraction), !extraction.hasConvars ? t('missingConvars') : '', !extraction.hasBindings ? t('missingBindings') : ''].filter(Boolean).join(' ');
    const lines = [];
    if (extraction.skipped.length) lines.push(t('omitted'), ...extraction.skipped.map(item => `${item.file}: ${item.name} (${t(item.reason)})`));
    if (extraction.overwritten.length) lines.push(t('overridden'), ...extraction.overwritten.map(item => `${item.file}: ${item.name}`));
    $('extract-details').textContent = lines.join('\n');
  }
  $('extract').addEventListener('click', () => $('extract-files').click());
  $('extract-files').addEventListener('change', async () => {
    const uploaded = [...$('extract-files').files]; $('extract-files').value = '';
    if (!uploaded.length) return;
    if (uploaded.length > 3 || uploaded.some(item => item.size > 2 * 1024 * 1024 || !/\.vcfg$/i.test(item.name))) {
      $('extract-status').hidden = false; $('extract-status').textContent = t('extractError'); return;
    }
    if ((importedFiles.has('autoexec.cfg') || models['autoexec.cfg'].rows.some(core.changed)) && !confirm(t('extractConfirm'))) return;
    $('extract').disabled = true; $('extract-status').hidden = false; $('extract-status').textContent = t('extracting');
    try {
      const files = await Promise.all(uploaded.map(async item => ({name:item.name, text:await item.text()})));
      const result = VcfgImport.extract(files, CONFIG_SOURCES['autoexec.cfg']);
      models['autoexec.cfg'] = core.parse(result.text); importedFiles.add('autoexec.cfg'); profileKinds['autoexec.cfg'] = 'current'; extraction = result;
      $('auto-tab').click();
    } catch {
      $('extract-status').textContent = t('extractError');
    } finally { $('extract').disabled = false; }
  });
  $('export').addEventListener('click', () => {
    if (core.errors(models[file]).length) return;
    const url = URL.createObjectURL(new Blob([core.serialize(models[file])], { type:'text/plain;charset=utf-8' }));
    const link = make('a'); link.href = url; link.download = file; document.body.append(link); link.click(); link.remove();
    savedStates[file] = stamp(models[file]);
    setTimeout(() => URL.revokeObjectURL(url), 1000); message = t('exported', file); updateSummary();
  });
  window.addEventListener('beforeunload', event => {
    if (Object.entries(models).some(([name, model]) => stamp(model) !== savedStates[name])) { event.preventDefault(); event.returnValue = ''; }
  });
  render();
})();
