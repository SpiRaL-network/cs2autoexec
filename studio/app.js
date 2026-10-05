'use strict';
const $=id=>document.getElementById(id);
let lang=navigator.language.startsWith('fr')?'fr':'en',profile=null,description=null,dirty=false,tab='video',section='',selected=null,installPlan=null,serverKind='practice',serverDefinitions={},serverValues={};
const words={
  tagline:['Your settings. Everywhere.','Vos réglages. Partout.'],offline:['LOCAL · OFFLINE','LOCAL · HORS LIGNE'],workspace:['WORKSPACE','ESPACE DE TRAVAIL'],
  player:['Player profile','Profil joueur'],servers:['Servers & practice','Serveurs & entraînement'],source:['STEAM SOURCE','SOURCE STEAM'],
  account:['Account to capture','Compte à capturer'],installation:['CS2 installation','Installation CS2'],capture:['Capture settings','Capturer les réglages'],
  detect:['Refresh','Actualiser'],steamFolder:['Steam folder…','Dossier Steam…'],captureHint:['Set up the game, then close CS2 before capturing.','Réglez le jeu, puis fermez CS2 avant la capture.'],
  library:['FILES & PROFILES','FICHIERS & PROFILS'],openProfile:['Open a profile','Ouvrir un profil'],importSources:['Import source files','Importer les sources'],
  save:['Save profile','Sauvegarder le profil'],rollback:['Undo installation','Annuler l’installation'],privacy:['No data sent.\nNo account required.','Aucune donnée envoyée.\nAucun compte requis.'],
  eyebrow:['PERSONAL CONFIGURATION','CONFIGURATION PERSONNELLE'],title:['Your setup, saved.','Votre setup, sauvegardé.'],subtitle:['Configure in CS2. Capture here. Take your settings with you.','Configurez dans CS2. Capturez ici. Emportez vos réglages.'],
  unsaved:['Unsaved changes','Modifications non sauvegardées'],welcomeTitle:['Start with your actual settings.','Commencez avec vos vrais réglages.'],
  welcomeText:['Read the settings saved by CS2: video, audio, keys, crosshair, HUD and advanced options. Build a reusable profile and autoexec from your own configuration.','L’application lit les fichiers enregistrés par le jeu : vidéo, audio, touches, viseur, HUD et options avancées. Elle construit un profil réutilisable et un autoexec à partir de votre configuration.'],
  step1:['Configure CS2','Configurez CS2'],step1text:['Your preferences are the starting point.','Vos préférences restent la référence.'],step2:['Capture your profile','Capturez le profil'],step2text:['Keep the complete source files.','Les sources complètes sont conservées.'],step3:['Take your setup with you','Emportez votre setup'],step3text:['Export, edit, restore.','Exportez, modifiez, restaurez.'],
  scope:['An autoexec reapplies settings when executed. It does not lock the menus. Account and hardware data are kept separately.','L’autoexec réapplique les réglages à son exécution. Il ne verrouille pas les menus. Les données liées au compte ou au matériel sont conservées séparément.'],
  profileName:['Profile name','Nom du profil'],slot:['Player slot','Emplacement joueur'],savedValues:['saved values','valeurs enregistrées'],sourceFiles:['source files','fichiers sources'],
  modifiedOnly:['Modified only','Modifiés uniquement'],inspection:['SETTING DETAILS','DÉTAIL DU RÉGLAGE'],selectSetting:['Select a setting','Sélectionnez un réglage'],
  inspectHint:['Values come from the CS2 files. Engine units are preserved.','Les valeurs proviennent des fichiers CS2. Les unités moteur sont conservées.'],
  crosshairHint:['Schematic preview. Exact rendering depends on the game.','Aperçu schématique. Le rendu exact dépend du jeu.'],
  sourceHint:['Source-only data stays in the profile and source files. Raw video and audio values avoid approximate conversions.','Les données non exportables restent dans le profil et les fichiers sources. Les valeurs vidéo et audio brutes évitent les conversions approximatives.'],
  reset:['Revert edits','Annuler les modifications'],preview:['View autoexec','Voir l’autoexec'],export:['Export bundle','Exporter le pack'],install:['Install…','Installer…'],
  serverEyebrow:['YOUR SERVER, YOUR RULES','VOTRE SERVEUR, VOS RÈGLES'],serverTitle:['Prepare a session.','Préparer une session.'],serverSubtitle:['Server configurations separate from your player preferences.','Des configurations serveur séparées de vos préférences joueur.'],
  generatedConfig:['GENERATED CONFIGURATION','CONFIGURATION GÉNÉRÉE'],exportServer:['Export server bundle','Exporter le pack serveur'],
  serverLimits:['Editable starting points; commands checked on 2026-10-05. In-game testing required. Timers, checkpoints and community movement modes require suitable maps and plugins.','Valeurs initiales modifiables, commandes vérifiées le 05/10/2026. Test en jeu à effectuer. Les chronomètres, checkpoints et modes communautaires exigent des cartes et plugins adaptés.'],
  kzLink:['CS2KZ documentation','Documentation CS2KZ'],close:['Close','Fermer'],applyInstall:['Install with backup','Installer et sauvegarder l’existant'],
  noAccounts:['No CS2 account detected','Aucun compte CS2 détecté'],noInstalls:['No CS2 installation detected','Aucune installation CS2 détectée'],
  search:['Search a setting or command…','Rechercher un réglage, une commande…'],all:['All','Tout'],emptyFilter:['No settings match this filter.','Aucun réglage ne correspond au filtre.'],
  loading:['Working…','Opération en cours…'],captured:['Profile captured. Source files preserved.','Profil capturé. Fichiers sources conservés.'],opened:['Profile opened.','Profil ouvert.'],
  saved:['Profile saved: ','Profil sauvegardé : '],exported:['Bundle exported: ','Pack exporté : '],steamDetected:['Steam detection refreshed.','Détection Steam actualisée.'],
  discard:['Discard unsaved changes?','Abandonner les modifications non sauvegardées ?'],resetConfirm:['Revert all edits to the captured source values?','Revenir aux valeurs des fichiers capturés ?'],
  sourceOnly:['Source only','Source uniquement'],hardware:['Hardware / display','Matériel / affichage'],portable:['Portable autoexec','Autoexec portable'],
  rawValue:['Raw engine value','Valeur brute moteur'],original:['Captured value','Valeur capturée'],command:['Command / source key','Commande / clé source'],file:['Source file','Fichier source'],
  audioNote:['Audio gain is nonlinear in the CS2 menu. Edit the saved engine value here; no approximate percent conversion is applied.','Le gain audio du menu CS2 n’est pas linéaire. La valeur moteur sauvegardée est modifiable ici ; aucune conversion approximative en pourcentage n’est appliquée.'],
  videoNote:['Saved video value. Display identifiers can be specific to your PC. Portable installation keeps the target display settings by default.','Valeur vidéo sauvegardée. Les identifiants d’affichage dépendent du PC. L’installation portable conserve l’affichage de la cible par défaut.'],
  sourceOnlyNote:['This value is kept in the profile and complete source files. It is not added to the portable autoexec.','Cette valeur reste dans le profil et les fichiers sources complets. Elle n’est pas ajoutée à l’autoexec portable.'],
  keyTitle:['Edit key binding','Modifier une touche'],keyName:['CS2 key name','Nom de touche CS2'],keyAction:['Command / action','Commande / action'],
  keyHint:['Use game key names: SPACE, MOUSE4, MWHEELUP or scancode26. Existing key names are kept exactly. A duplicate key blocks export.','Utilisez les noms du jeu : SPACE, MOUSE4, MWHEELUP ou scancode26. Les noms existants sont conservés. Une touche en double bloque l’export.'],
  apply:['Apply','Appliquer'],previewTitle:['Generated autoexec','Autoexec généré'],omission:['Values kept only in the source/profile: ','Valeurs conservées seulement dans le profil/sources : '],
  chooseInstall:['Choose restoration mode','Choisir le mode de restauration'],portableMode:['Portable settings · another PC or account','Réglages portables · autre PC ou compte'],snapshotMode:['Full source restore · same PC','Sources complètes · même PC'],
  installHint:['Portable: autoexec + video merge. The destination GPU, display, resolution and refresh rate are kept. Source-only preferences are not applied. Full restore: all captured VCFG/video sources, including machine-specific and account preferences, plus autoexec.','Portable : autoexec + fusion vidéo. Le GPU, l’écran, la résolution et la fréquence de la cible sont conservés. Les préférences réservées aux sources ne sont pas appliquées. Complet : tous les VCFG/vidéo capturés, y compris préférences du compte et de la machine, plus l’autoexec.'],
  displayOpt:['Also transfer source resolution, refresh rate and display mode','Transférer aussi résolution, fréquence et mode d’affichage'],
  cloudHint:['Close CS2. Steam Cloud can synchronize a different copy after launch: check any conflict. A backup is made before replacement. The shared game autoexec applies to every account using this installation.','Fermez CS2. Steam Cloud peut synchroniser une autre copie au lancement : vérifiez les conflits. Une sauvegarde précède le remplacement. L’autoexec de cette installation du jeu est commun à ses comptes.'],
  reviewFiles:['Preview files','Voir les fichiers'],installationPreview:['Installation preview','Aperçu de l’installation'],noChanges:['All target files already match.','Tous les fichiers cibles correspondent déjà.'],
  installed:['Installed files: ','Fichiers installés : '],backup:['Backup: ','Sauvegarde : '],rollbackConfirm:['Restore the backup from the last installation? The operation stops if files changed since then.','Restaurer la sauvegarde de la dernière installation ? L’opération s’arrête si les fichiers ont changé entre-temps.'],
  rolledBack:['Previous files restored.','Fichiers précédents restaurés.'],serverPractice:['Local practice: grenades, unlimited reloadable ammo, impacts and long rounds. Requires your own server and sv_cheats 1.','Entraînement local : grenades, munitions avec rechargement, impacts et manches longues. Sur votre serveur avec sv_cheats 1.'],
  serverMovement:['Vanilla movement sandbox. Adjust air acceleration and auto-jump for your map. This is a configurable starting point, not a community ruleset.','Bac à sable de mouvement vanilla. Adaptez accélération aérienne et saut automatique à votre carte. Ce point de départ ne définit pas un règlement communautaire.'],
  serverKz:['Two files are exported: a vanilla KZ practice sandbox and the upstream CS2KZ plugin configuration. For a full KZ server, install the plugin and let its selected movement mode control physics. Do not apply both configs together.','Deux fichiers sont exportés : un entraînement KZ vanilla et la configuration du plugin CS2KZ issue de sa source officielle. Pour un serveur KZ complet, installez le plugin et laissez son mode gérer la physique. N’appliquez pas les deux fichiers ensemble.']
};
const t=key=>(words[key]||[key,key])[lang==='fr'?1:0];
const loc=a=>Array.isArray(a)?a[lang==='fr'?1:0]||a[0]:a;
const tabs={video:['Video','Vidéo'],audio:['Audio','Audio'],game:['Game','Jeu'],kbmouse:['Keyboard / mouse','Clavier / souris'],crosshair:['Crosshair & scope','Viseur et lunettes'],advanced:['Advanced data','Données avancées']};
const enumFrench={'Yes':'Oui','No':'Non','Enabled':'Activé','Disabled':'Désactivé','Default':'Par défaut','Natural':'Naturel','Crisp':'Clair','Smooth':'Doux','Low':'Faible','Medium':'Moyen','High':'Élevé','Very High':'Très élevé','Hold':'Maintenir','Toggle':'Basculer','Quality':'Qualité','Performance':'Performance','Balanced':'Équilibré','Ultra Quality':'Qualité ultra','Sun Only':'Soleil uniquement','All':'Toutes','None':'Aucun','Enabled + Boost':'Activé + Boost','Bilinear':'Bilinéaire','Trilinear':'Trilinéaire','Normal (4:3)':'Normal (4:3)'};
function optionLabel(a){const text=loc(a);return lang==='fr'?enumFrench[text]||text:text;}
function el(tag,attrs={},...children){const node=document.createElement(tag);for(const [key,value]of Object.entries(attrs)){if(key==='class')node.className=value;else if(key.startsWith('on'))node.addEventListener(key.slice(2),value);else if(key==='text')node.textContent=value;else if(value!==undefined&&value!==null)node.setAttribute(key,String(value));}for(const child of children.flat())if(child!==null&&child!==undefined)node.append(child instanceof Node?child:document.createTextNode(String(child)));return node;}
function notify(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
async function api(name,...args){if(!window.studio)throw Error('Open the desktop application / Ouvrez l’application de bureau');const result=await window.studio[name](...args);if(!result.ok)throw Error(result.error);return result.data;}
async function work(fn,button){if(button)button.disabled=true;notify(t('loading'));try{await fn();}catch(e){notify(e.message,true);}finally{if(button)button.disabled=false;}}
function bind(id,fn){$(id).addEventListener('click',()=>work(fn,$(id)));}
function localize(){document.documentElement.lang=lang;for(const node of document.querySelectorAll('[data-t]'))node.textContent=t(node.dataset.t);$('language').value=lang;$('search').placeholder=t('search');if(profile)renderProfile();renderServers();}
function markDirty(){dirty=true;$('dirty').hidden=false;}
async function mayReplace(){return !dirty||await api('confirm','replace');}
async function openProfile(p,isCapture=false){if(!p)return;const desc=await api('describe',p);profile=p;description=desc;profile.rebindings||={};dirty=isCapture;selected=null;tab='video';section='';renderProfile();notify(t(isCapture?'captured':'opened'));}
function renderInventory(inv){if(!inv)return;for(const [id,list,emptyKey]of [['account',inv.accounts,'noAccounts'],['installation',inv.installs,'noInstalls']]){$(id).replaceChildren(...(list.length?list.map(x=>el('option',{value:x.id},x.label)): [el('option',{value:''},t(emptyKey))]));}$('capture').disabled=!inv.accounts.length;$('rollback').disabled=!inv.lastBackup;}
function activeRows(){return description.rows.filter(r=>!r.slot||r.slot===(profile.activeSlot||'0_slot0'));}
function renderProfile(){
  $('empty').hidden=true;$('editor').hidden=false;$('save-profile').disabled=false;
  $('profile-title').textContent=profile.name;$('profile-subtitle').textContent=t('subtitle');$('profile-name').value=profile.name;$('dirty').hidden=!dirty;
  const slots=[...new Set(description.rows.map(r=>r.slot).filter(Boolean))];if(!slots.includes(profile.activeSlot||'0_slot0'))slots.unshift(profile.activeSlot||'0_slot0');
  $('slot').replaceChildren(...slots.map(s=>el('option',{value:s},s)));$('slot').value=profile.activeSlot||'0_slot0';
  $('setting-count').textContent=activeRows().length;$('source-count').textContent=description.sourceCount;
  $('tabs').replaceChildren(...Object.entries(tabs).map(([id,label])=>el('button',{class:id===tab?'active':'',onclick:()=>{tab=id;section='';renderProfile();}},loc(label))));
  const sections=[...new Map(activeRows().filter(r=>r.tab===tab).map(r=>[r.section[0],r.section])).values()];
  $('sections').replaceChildren(el('button',{class:!section?'active':'',onclick:()=>{section='';renderProfile();}},t('all')),...sections.map(s=>el('button',{class:section===s[0]?'active':'',onclick:()=>{section=s[0];renderProfile();}},loc(s))));
  renderRows();$('source-summary-label').textContent=`${profile.files.length} ${t('sourceFiles')} · ${description.portableCount} ${t('portable').toLowerCase()}`;
  $('source-list').replaceChildren(...profile.files.map(f=>el('div',{class:'source-file'},f.name,el('code',{},'SHA-256 '+f.sha256.slice(0,16)+'…'))));
  $('warnings').replaceChildren(el('p',{class:'code-note'},t('sourceHint')),...description.warnings.map(w=>el('p',{class:'micro'},w)));
  inspect(selected?description.rows.find(r=>r.id===selected):null);
}
function renderRows(){
  const query=$('search').value.trim().toLowerCase();const onlyModified=$('modified-only').checked;
  const rows=activeRows().filter(r=>r.tab===tab&&(!section||section===r.section[0])&&(!onlyModified||r.modified)&&(!query||[r.key,r.rawKey,r.file,...r.label].join(' ').toLowerCase().includes(query)));
  $('visible-count').textContent=String(rows.length);const nodes=[];let group='';
  for(const row of rows){if(row.section[0]!==group){group=row.section[0];nodes.push(el('div',{class:'group-heading'},loc(row.section)));}nodes.push(renderRow(row));}
  $('rows').replaceChildren(...(nodes.length?nodes:[el('p',{class:'micro'},t('emptyFilter'))]));
}
function renderRow(row){
  const control=el('div',{class:'value-control'});
  if(['bindings','analogbindings'].includes(row.group))control.append(el('button',{class:'key',onclick:()=>editKey(row)},row.key));
  else if(row.options?.length){
    const select=el('select',{'aria-label':loc(row.label)});const current=row.value==='true'?'1':row.value==='false'?'0':row.value;
    const options=[...row.options];if(!options.some(o=>o.value===current))options.push({value:current,label:[`${current} · saved value`,`${current} · valeur sauvegardée`]});
    select.replaceChildren(...options.map(o=>el('option',{value:o.value},optionLabel(o.label))));select.value=current;
    select.addEventListener('change',()=>work(()=>editValue(row,select.value)));
    control.append(select);
  }else{
    const input=el('input',{'aria-label':loc(row.label),value:row.value,type:row.numeric?'number':'text',step:'any',class:row.numeric?'numeric':'',min:row.min,max:row.max});
    input.addEventListener('change',()=>work(async()=>{try{await editValue(row,input.value);}catch(e){input.value=row.value;throw e;}}));
    if(row.numeric&&row.sliderMin!==undefined&&row.sliderMax!==undefined&&row.sliderMax>row.sliderMin){const slider=el('input',{type:'range',min:row.sliderMin,max:row.sliderMax,step:(row.sliderMax-row.sliderMin)<=10?'0.001':'1',value:row.value,'aria-label':loc(row.label)+' slider'});slider.addEventListener('input',()=>{input.value=slider.value;});slider.addEventListener('change',()=>work(()=>editValue(row,slider.value)));control.append(slider);}
    control.append(input);
  }
  const note=row.hardware?t('hardware'):row.audioGain?'GAIN · '+row.value:row.portable?'':t('sourceOnly');
  const label=el('div',{class:'setting-label',tabindex:0,onclick:()=>{selected=row.id;inspect(row);renderRows();},onkeydown:e=>{if(e.key==='Enter'){selected=row.id;inspect(row);renderRows();}}},loc(row.label),el('small',{},row.group==='bindings'?row.value:row.key, note?' · '+note:''));
  const reset=el('button',{class:'row-reset',title:t('reset'),onclick:()=>work(async()=>{const next=structuredClone(profile);delete next.changes[row.id];delete next.rebindings[row.id];await commitEdit(next);})},row.modified?'↶':'');if(!row.modified)reset.disabled=true;
  return el('div',{class:'setting-row'+(row.modified?' modified':'')+(row.id===selected?' selected':''),'data-key':row.key},label,control,reset);
}
async function commitEdit(next){const desc=await api('describe',next);profile=next;description=desc;markDirty();renderProfile();notify('');}
async function editValue(row,value){const next=structuredClone(profile);if(value===row.original)delete next.changes[row.id];else next.changes[row.id]=value;selected=row.id;await commitEdit(next);}
function inspect(row){
  $('inspect-title').textContent=row?loc(row.label):t('selectSetting');$('inspect-description').textContent=row?(row.audioGain?t('audioNote'):row.group==='video'?t('videoNote'):!row.portable?t('sourceOnlyNote'):t('inspectHint')):t('inspectHint');
  $('inspect-data').replaceChildren(...(row?[[t('command'),row.rawKey],[t('rawValue'),row.value],[t('original'),row.original],[t('file'),row.file],[t('export'),row.hardware?t('hardware'):row.portable?t('portable'):t('sourceOnly')]].map(([label,value])=>el('div',{class:'inspect-field'},el('span',{},label),value)):[]));
  $('crosshair-preview').hidden=tab!=='crosshair';
}
function showModal(title,content){$('modal-title').textContent=title;$('modal-content').replaceChildren(...(Array.isArray(content)?content:[content]));$('confirm-install').hidden=true;$('modal').showModal();}
function editKey(row){
  const key=el('input',{value:row.key,'aria-label':t('keyName')});const action=el('input',{value:row.value,'aria-label':t('keyAction')});
  const apply=el('button',{class:'primary',onclick:()=>work(async()=>{const next=structuredClone(profile);if(key.value===row.rawKey)delete next.rebindings[row.id];else next.rebindings[row.id]=key.value;if(action.value===row.original)delete next.changes[row.id];else next.changes[row.id]=action.value;await commitEdit(next);$('modal').close();},apply)},t('apply'));
  showModal(t('keyTitle'),[el('div',{class:'key-editor'},el('label',{},t('keyName'),key),el('label',{},t('keyAction'),action)),el('p',{class:'code-note'},t('keyHint')),apply]);
}
async function chooseInstall(){
  const mode=el('select',{},el('option',{value:'portable'},t('portableMode')),el('option',{value:'snapshot'},t('snapshotMode')));
  const display=el('input',{type:'checkbox'});mode.addEventListener('change',()=>{display.disabled=mode.value==='snapshot';});
  const preview=el('button',{class:'primary',onclick:()=>work(async()=>{installPlan=await api('plan',profile,$('account').value,$('installation').value,mode.value,display.checked);renderInstallPlan();},preview)},t('reviewFiles'));
  showModal(t('chooseInstall'),[mode,el('p',{class:'code-note'},t('installHint')),el('label',{},display,t('displayOpt')),el('p',{class:'callout'},t('cloudHint')),preview]);
}
function renderInstallPlan(){
  $('modal-title').textContent=t('installationPreview');$('modal-content').replaceChildren(el('p',{class:'code-note'},installPlan.account+' · '+installPlan.mode),el('p',{class:'code-note'},t('cloudHint')),...installPlan.files.map(f=>el('div',{class:'install-file'},f.name+' · '+f.status+' · '+f.bytes+' B',el('small',{},f.directory),el('small',{},'SHA-256 '+f.afterHash.slice(0,20)+'…'))));
  if(!installPlan.files.length)$('modal-content').append(el('p',{},t('noChanges')));
  $('confirm-install').hidden=!installPlan.files.length;
}
function renderServers(){
  const kinds=Object.entries(serverDefinitions);if(!kinds.length)return;
  $('server-kinds').replaceChildren(...kinds.map(([kind,def])=>el('button',{class:kind===serverKind?'active':'',onclick:()=>work(async()=>{serverKind=kind;serverValues={...def.values};renderServers();await updateServerPreview();})},loc(def.name))));
  $('server-note').textContent=t(serverKind==='practice'?'serverPractice':serverKind==='kz'?'serverKz':'serverMovement');
  $('server-rows').replaceChildren(...Object.entries(serverValues).map(([key,value])=>{const input=el('input',{type:'number',value,step:'any','aria-label':key});input.addEventListener('change',()=>work(async()=>{const previous=serverValues[key];serverValues[key]=input.value;try{await updateServerPreview();}catch(e){serverValues[key]=previous;input.value=previous;throw e;}}));return el('div',{class:'setting-row'},el('div',{class:'setting-label'},key),input);}));
}
async function updateServerPreview(){$('server-code').textContent=await api('serverPreview',serverKind,serverValues);}
$('language').addEventListener('change',()=>{lang=$('language').value;localize();});
$('search').addEventListener('input',()=>{if(profile)renderRows();});$('modified-only').addEventListener('change',()=>{if(profile)renderRows();});
$('profile-name').addEventListener('change',()=>work(async()=>{const next=structuredClone(profile);next.name=$('profile-name').value.trim();await commitEdit(next);}));
$('slot').addEventListener('change',()=>work(async()=>{const next=structuredClone(profile);next.activeSlot=$('slot').value;await commitEdit(next);}));
bind('detect',async()=>{renderInventory(await api('discover'));notify(t('steamDetected'));});bind('choose-steam',async()=>renderInventory(await api('chooseSteam')));
bind('capture',async()=>{if(await mayReplace())await openProfile(await api('capture',$('account').value,$('installation').value),true);});
bind('import-profile',async()=>{if(await mayReplace())await openProfile(await api('importProfile'));});bind('import-sources',async()=>{if(await mayReplace())await openProfile(await api('importSources'),true);});
bind('save-profile',async()=>{const destination=await api('saveProfile',profile);if(destination){dirty=false;$('dirty').hidden=true;notify(t('saved')+destination);}});
bind('export',async()=>{const result=await api('exportBundle',profile);if(result){dirty=false;$('dirty').hidden=true;notify(t('exported')+result.directory);}});
bind('preview',async()=>{const result=await api('preview',profile);showModal(t('previewTitle'),[el('p',{class:'code-note'},`${result.count} ${t('portable').toLowerCase()} · ${t('omission')}${result.omitted.length}`),el('pre',{},result.text),el('details',{},el('summary',{},t('sourceOnly')),el('pre',{},result.omitted.map(x=>x.key+' · '+x.reason).join('\n')))]);notify('');});
bind('reset',async()=>{if(await api('confirm','reset')){const next=structuredClone(profile);next.changes={};next.rebindings={};await commitEdit(next);}});
bind('install-preview',chooseInstall);
bind('confirm-install',async()=>{const result=await api('install',installPlan.id);$('modal').close();installPlan=null;$('rollback').disabled=!result.backup;notify(t('installed')+result.files+' · '+t('backup')+result.backup);});
bind('rollback',async()=>{if(await api('confirm','rollback')){await api('rollback');$('rollback').disabled=true;notify(t('rolledBack'));}});
bind('server-export',async()=>{const destination=await api('serverExport',serverKind,serverValues);if(destination)notify(t('exported')+destination);});
for(const id of ['close-modal','cancel-modal'])$(id).addEventListener('click',()=>$('modal').close());
for(const [id,server]of [['player-view',false],['server-view',true]])$(id).addEventListener('click',()=>{$('player-panel').hidden=server;$('server-panel').hidden=!server;$('player-view').classList.toggle('active',!server);$('server-view').classList.toggle('active',server);});
document.querySelector('a').addEventListener('click',e=>{e.preventDefault();work(()=>api('openDocs'));});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue=false;}});
localize();work(async()=>{renderInventory(await api('discover'));serverDefinitions=await api('serverData');serverValues={...serverDefinitions.practice.values};renderServers();await updateServerPreview();notify('');});
