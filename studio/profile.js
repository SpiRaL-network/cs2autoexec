'use strict';
const crypto = require('node:crypto');
const {readKeyValues} = require('./keyvalues');
const catalog = require('./catalog.json');
const allowed = /^(cs2_machine_convars\.vcfg|cs2_user_(convars|keys)_\d+_slot\d+\.vcfg|cs2_video\.txt|original-autoexec\.cfg)$/;
const displayVideo=new Set(['setting.monitor_index','setting.defaultres','setting.defaultresheight','setting.refreshrate_numerator','setting.refreshrate_denominator','setting.fullscreen','setting.coop_fullscreen','setting.nowindowborder','setting.high_dpi','setting.aspectratiomode']);
const hardwareVideo = new Set(['Version','VendorID','DeviceID','setting.knowndevice','setting.cpu_level','setting.gpu_level','setting.gpu_mem_level','setting.r_low_latency','setting.Autoconfig',...displayVideo]);
const portableVideo=new Set(['setting.shaderquality','setting.r_texturefilteringquality','setting.msaa_samples','setting.r_csgo_cmaa_enable','setting.videocfg_shadow_quality','setting.videocfg_dynamic_shadows','setting.videocfg_texture_detail','setting.videocfg_particle_detail','setting.videocfg_ao_detail','setting.videocfg_hdr_detail','setting.videocfg_fsr_detail','setting.mat_vsync','setting.fullscreen_min_on_focus_loss']);
const machineOnly = /^(sound_device_override|voice_device_override|cl_graphics_driver|ui_|panorama_|engine_|r_low_latency|sys_|demo_|cl_clanid|cl_inventory_|cl_invites_|player_competitive_maplist|player_wargames_list)/i;
const sha = data => crypto.createHash('sha256').update(data).digest('hex');
const cleanName = name => name.replace(/\$\d+$/,'');
const textOf = file => Buffer.from(file.content,'base64').toString('utf8');
const rowId = (file,group,key) => JSON.stringify([file,group,key]);
function createProfile(files, name='My CS2 setup') {
  const profile={format:'cs2-profile-studio',schema:1,appVersion:'3.1.0',name,createdAt:new Date().toISOString(),files:files.map(f=>{
    const bytes=Buffer.isBuffer(f.bytes)?f.bytes:Buffer.from(f.text,'utf8');
    return {name:f.name,content:bytes.toString('base64'),sha256:sha(bytes)};
  }),changes:{},rebindings:{},activeSlot:'0_slot0'};
  const slots=profile.files.map(f=>f.name.match(/cs2_user_(?:keys|convars)_(\d+_slot\d+)/)?.[1]).filter(Boolean);
  profile.activeSlot=slots.includes('0_slot0')?'0_slot0':slots[0]||'0_slot0';
  validate(profile); return profile;
}
function validate(profile) {
  if (!profile || profile.format!=='cs2-profile-studio' || profile.schema!==1 || typeof profile.name!=='string' || profile.name.length>120 || !profile.name.trim()) throw Error('Invalid profile / Profil invalide');
  if (!Array.isArray(profile.files) || !profile.files.length || profile.files.length>32) throw Error('Select 1–32 source files / Sélectionnez 1–32 fichiers');
  const names=new Set(); let size=0;
  for (const file of profile.files) {
    if (!allowed.test(file.name) || names.has(file.name) || typeof file.content!=='string' || file.content.length>4e6 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(file.content)) throw Error('Invalid source file / Fichier source invalide');
    names.add(file.name); const bytes=Buffer.from(file.content,'base64');size+=bytes.length;
    if (sha(bytes)!==file.sha256) throw Error('Source checksum mismatch / Empreinte du fichier source incorrecte');
    if (file.name!=='original-autoexec.cfg') {
      const tree=readKeyValues(textOf(file));
      const root=file.name==='cs2_video.txt'?'video.cfg':'config';
      if (tree.length!==1 || tree[0][0].toLowerCase()!==root || !Array.isArray(tree[0][1])) throw Error('Invalid CS2 source structure / Structure CS2 invalide');
    }
  }
  if(size>20e6) throw Error('Profile too large / Profil trop volumineux');
  if (!profile.changes || typeof profile.changes!=='object' || Array.isArray(profile.changes) || Object.keys(profile.changes).length>3000) throw Error('Invalid edits / Modifications invalides');
  if(profile.activeSlot!==undefined && !/^\d+_slot\d+$/.test(profile.activeSlot))throw Error('Invalid player slot');
  const rows=describe(profile,false).rows;const index=new Map(rows.map(r=>[r.id,r]));
  for(const [id,value] of Object.entries(profile.changes)) {
    const row=index.get(id); if(!row || typeof value!=='string' || value.length>4096 || /[\x00-\x1f\x7f]/.test(value)) throw Error('Invalid setting value / Valeur invalide');
    if(row.numeric && (!value.trim() || !Number.isFinite(Number(value)))) throw Error(`${row.key}: finite number required / nombre requis`);
    if(row.numeric && row.min!==undefined && Number(value)<row.min) throw Error(`${row.key}: minimum ${row.min}`);
    if(row.numeric && row.max!==undefined && Number(value)>row.max) throw Error(`${row.key}: maximum ${row.max}`);
    if(row.boolean && !/^(true|false|0|1)$/i.test(value))throw Error(`${row.key}: boolean required / booléen requis`);
  }
  if(profile.rebindings!==undefined && (!profile.rebindings || typeof profile.rebindings!=='object' || Array.isArray(profile.rebindings)))throw Error('Invalid key edits');
  for(const [id,key] of Object.entries(profile.rebindings||{})) {
    const row=index.get(id);
    if(!row || !['bindings','analogbindings'].includes(row.group) || typeof key!=='string' || !key.length || key.length>64 || /["\\\s\x00-\x1f\x7f]/.test(key))throw Error('Invalid key name / Nom de touche invalide');
  }
  const bound=new Map();
  for(const r of rows.filter(r=>['bindings','analogbindings'].includes(r.group))){const key=r.file+':'+r.key.toLowerCase();const earlier=bound.get(key);if(earlier && (earlier.key.toLowerCase()!==earlier.rawKey.toLowerCase() || r.key.toLowerCase()!==r.rawKey.toLowerCase()))throw Error('Duplicate key / Touche en double : '+r.key);bound.set(key,r);}
  return profile;
}
function describe(profile,check=true) {
  if(check)validate(profile);
  const rows=[],warnings=[];
  for(const file of profile.files) {
    if(file.name==='original-autoexec.cfg') continue;
    const tree=readKeyValues(textOf(file));
    const groups=file.name==='cs2_video.txt'?[['video',tree[0][1]]]:tree[0][1];
    for(const [group,entries] of groups) {
      if(!Array.isArray(entries)) {warnings.push(`${file.name}: ${group} retained in source`);continue;}
      for(const [rawKey,original] of entries) {
        if(Array.isArray(original)) {warnings.push(`${file.name}: ${rawKey} retained in source`);continue;}
        const id=rowId(file.name,group,rawKey);
        const key=group==='convars'?cleanName(rawKey):profile.rebindings?.[id]||rawKey;
        const cv=catalog.convars[key.toLowerCase()];
        const meta=group==='bindings'?catalog.binds[original]:catalog.menus[key];
        const flags=cv?.flags||'';
        const portable=group==='bindings' || group==='analogbindings' || (group==='convars' && !!cv && /\barchive\b/.test(flags) && !/\b(developmentonly|cheat|replicated|protected)\b/.test(flags) && !machineOnly.test(key));
        const tab=group==='video'?'video':group==='bindings'||group==='analogbindings'?'kbmouse':meta?.tab||'advanced';
        const numeric=group==='video'? /^-?\d+(\.\d+)?$/.test(original) : group==='convars' && (meta?.type==='number' || /^-?\d+(\.\d+)?$/.test(original));
        const value=Object.hasOwn(profile.changes,id)?profile.changes[id]:original;
        rows.push({id,file:file.name,group,key,rawKey,original,value,portable,tab,numeric,boolean:cv?.default==='true'||cv?.default==='false',slot:file.name.match(/cs2_user_(?:keys|convars)_(\d+_slot\d+)/)?.[1]||null,
          section:meta?.section || (group==='video'?['Video file','Fichier vidéo']:['Other saved data','Autres données sauvegardées']),
          label:meta?.label || [key,key],options:meta?.options,min:cv?cv.min:meta?.min,max:cv?cv.max:meta?.max,
          sliderMin:['fps_max','fps_max_ui'].includes(key)?0:meta?.min??cv?.min,sliderMax:meta?.max??cv?.max,
          audioGain:meta?.audioGain||false,percentage:meta?.percentage||false,
          hardware:group==='video'&&hardwareVideo.has(key),modified:value!==original || ['bindings','analogbindings'].includes(group)&&key!==rawKey});
      }
    }
  }
  const videoLabels={
    'setting.defaultres':['Resolution · width','Résolution · largeur'], 'setting.defaultresheight':['Resolution · height','Résolution · hauteur'],
    'setting.refreshrate_numerator':['Refresh rate numerator','Fréquence · numérateur'], 'setting.refreshrate_denominator':['Refresh rate denominator','Fréquence · dénominateur'],
    'setting.fullscreen':['Fullscreen','Plein écran'], 'setting.nowindowborder':['Borderless window','Fenêtre sans bordure'],
    'setting.mat_vsync':['Vertical synchronization','Synchronisation verticale'], 'setting.msaa_samples':['MSAA samples','Échantillons MSAA'],
    'setting.shaderquality':['Shader quality','Qualité des shaders'], 'setting.r_texturefilteringquality':['Texture filtering','Filtrage des textures'],
    'setting.videocfg_shadow_quality':['Global shadow quality','Qualité globale des ombres'], 'setting.videocfg_dynamic_shadows':['Dynamic shadows','Ombres dynamiques'],
    'setting.videocfg_texture_detail':['Texture / model detail','Détail textures / modèles'], 'setting.videocfg_particle_detail':['Particle detail','Détail des particules'],
    'setting.videocfg_ao_detail':['Ambient occlusion','Occlusion ambiante'], 'setting.videocfg_hdr_detail':['HDR','HDR'],
    'setting.videocfg_fsr_detail':['FidelityFX Super Resolution','FidelityFX Super Resolution'], 'setting.r_low_latency':['NVIDIA Reflex','NVIDIA Reflex'],
    'setting.monitor_index':['Monitor index','Index de l’écran'], 'setting.aspectratiomode':['Aspect ratio mode','Rapport hauteur-largeur'],
  };
  for(const r of rows.filter(r=>r.group==='video')) {
    r.label=videoLabels[r.key]||[r.key,r.key];
    r.section=r.hardware?['Display & hardware','Affichage et matériel']:['Advanced video','Vidéo avancée'];
    r.options=catalog.videoMenus?.[r.key];
    if(r.key==='setting.msaa_samples')r.options=[0,2,4,8].map(n=>({value:String(n),label:[n?n+'× MSAA':'None',n?n+'× MSAA':'Aucun']}));
    if(['setting.fullscreen','setting.nowindowborder','setting.coop_fullscreen'].includes(r.key))r.options=[{value:'0',label:['No','Non']},{value:'1',label:['Yes','Oui']}];
    if(['setting.defaultres','setting.defaultresheight','setting.refreshrate_denominator'].includes(r.key))r.min=1;
    if(r.key==='setting.refreshrate_numerator'||r.key==='setting.monitor_index')r.min=0;
  }
  // Alias definitions are preserved, but arbitrary imported console commands are never added automatically.
  const original=profile.files.find(f=>f.name==='original-autoexec.cfg');
  const seenRows=new Set();
  for(const row of rows){if(seenRows.has(row.id))warnings.push(`${row.file}: repeated key ${row.rawKey} — last value wins in autoexec`);seenRows.add(row.id);}
  const aliases=original ? textOf(original).split(/\r?\n/).filter(line=>/^\s*alias\s+/i.test(line) && !/[\x00-\x08]/.test(line)) : [];
  const aliasNames=new Set(aliases.map(line=>line.match(/^\s*alias\s+"?([^\s"]+)/i)?.[1]).filter(Boolean));
  for(const r of rows.filter(r=>r.group==='bindings' && r.value && !catalog.binds[r.value] && !/^(yaw|pitch|cancelselect|toggleconsole)$/.test(r.value))) {
    if(/^[+\w]+$/.test(r.value) && aliasNames.has(r.value)) continue;
    if(!catalog.binds[r.value]) warnings.push(`${r.key}: custom binding — check alias / exec dependencies`);
  }
  return {rows,warnings,aliases,sourceCount:profile.files.length,portableCount:rows.filter(r=>r.portable).length,checkedAt:catalog.checkedAt};
}
function quote(value) {
  if(/["\\\x00-\x1f\x7f]/.test(value)) throw Error('Not representable in safe CFG / Valeur non représentable dans le CFG');
  return '"'+value+'"';
}
function generateAutoexec(profile) {
  const {rows,aliases}=describe(profile);const omitted=[],settings=new Map(),binds=new Map();
  const order=[...rows].sort((a,b)=> Number(!a.file.includes('machine'))-Number(!b.file.includes('machine')));
  for(const row of order) {
    if(row.slot && row.slot!==(profile.activeSlot||'0_slot0'))continue;
    if(!row.portable) {if(row.group!=='video')omitted.push({key:row.rawKey,reason:'source-only'});continue;}
    try {
      quote(row.value);quote(row.key);
      if(row.group==='convars') {
        if(!/^[a-z_][a-z0-9_]*$/i.test(row.key)) throw Error('name');
        settings.set(row.key.toLowerCase(),row);
      } else binds.set(row.key.toLowerCase(),row);
    } catch {omitted.push({key:row.rawKey,reason:'cfg-syntax'});}
  }
  const lines=['// CS2 Profile Studio — portable player settings', '// Generated from your saved CS2 setup. No player preset applied.', '// Source-only data stays in the .cs2profile and raw-source backup.', '// This file applies settings when executed; it does not lock the game menus.', ''];
  if(aliases.length) lines.push('// Custom alias definitions from the original autoexec',...aliases,'');
  let section='';
  for(const row of settings.values()) {
    const next=row.section.join(' / ');
    if(next!==section){section=next;lines.push('',`// ${section}`);}
    lines.push(`${row.key.padEnd(48)} ${quote(row.value)}`);
  }
  lines.push('','// Keyboard / mouse bindings');
  for(const row of binds.values()) lines.push(`bind ${quote(row.key).padEnd(24)} ${quote(row.value)}`);
  lines.push('','echo "CS2 Profile Studio: player profile loaded"','');
  return {text:lines.join('\n'),omitted,count:settings.size+binds.size};
}
function kvQuote(value) {return '"'+value.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t')+'"';}
function writeTree(entries,depth=0) {
  return entries.map(([key,value])=>`${'\t'.repeat(depth)}${kvQuote(key)}${Array.isArray(value)?`\n${'\t'.repeat(depth)}{\n${writeTree(value,depth+1)}${'\t'.repeat(depth)}}\n`:`\t\t${kvQuote(value)}\n`}`).join('');
}
function materialize(profile,fileName) {
  validate(profile);const file=profile.files.find(f=>f.name===fileName); if(!file)throw Error('Missing source');
  const changes=Object.entries(profile.changes).filter(([id])=>JSON.parse(id)[0]===fileName);
  const rebindings=Object.entries(profile.rebindings||{}).filter(([id])=>JSON.parse(id)[0]===fileName);
  if(!changes.length&&!rebindings.length)return Buffer.from(file.content,'base64');
  const tree=readKeyValues(textOf(file));
  for(const [id,value] of changes) {
    const [,group,key]=JSON.parse(id);
    const entries=group==='video'?tree[0][1]:tree[0][1].find(([name])=>name===group)?.[1];
    // Preserve duplicate keys while editing all occurrences of an addressed value.
    for(const entry of entries||[])if(entry[0]===key && !Array.isArray(entry[1]))entry[1]=value;
  }
  for(const [group,entries] of tree[0][1])if(Array.isArray(entries))for(const entry of entries){const id=rowId(fileName,group,entry[0]);if(Object.hasOwn(profile.rebindings||{},id))entry[0]=profile.rebindings[id];}
  return Buffer.from(writeTree(tree),'utf8');
}
function mergedVideo(profile,targetText,includeDisplay=false) {
  const file=profile.files.find(f=>f.name==='cs2_video.txt');if(!file)return null;
  const src=readKeyValues(materialize(profile,file.name).toString('utf8'))[0][1];
  if(!targetText && !includeDisplay)throw Error('Target video file required for portable merge / Lancez CS2 une fois sur ce compte');
  const dst=targetText?readKeyValues(targetText):[['video.cfg',[]]];
  if(dst.length!==1 || dst[0][0]!=='video.cfg' || !Array.isArray(dst[0][1]))throw Error('Invalid target video file');
  for(const [key,value] of src) {
    if(Array.isArray(value) || !(portableVideo.has(key)||includeDisplay&&displayVideo.has(key)))continue;
    const entry=dst[0][1].find(([name])=>name===key);if(entry)entry[1]=value;else dst[0][1].push([key,value]);
  }
  return Buffer.from(writeTree(dst));
}
module.exports={createProfile,validate,describe,generateAutoexec,materialize,mergedVideo,sha,allowed,cleanName,hardwareVideo};
