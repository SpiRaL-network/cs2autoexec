'use strict';
const fs=require('node:fs/promises');
const path=require('node:path');
const crypto=require('node:crypto');
const {promisify}=require('node:util');
const execFile=promisify(require('node:child_process').execFile);
const profileCore=require('../studio/profile');
const {readKeyValues}=require('../editor/vcfg');
async function exists(file){try{await fs.access(file);return true;}catch{return false;}}
async function assertGameClosed(listProcesses=execFile,platform=process.platform){
  if(platform!=='win32')throw Error('Automatic installation currently supports Windows / Installation automatique : Windows');
  const {stdout}=await listProcesses('tasklist.exe',['/FI','IMAGENAME eq cs2.exe','/FO','CSV','/NH'],{windowsHide:true});
  if(/"cs2\.exe"/i.test(stdout))throw Error('Close CS2 before capturing or installing / Fermez CS2 avant la capture ou l’installation');
}
async function discover(override){
  let steam=override;
  if(!steam){try{
    const {stdout}=await execFile('reg.exe',['query','HKCU\\Software\\Valve\\Steam','/v','SteamPath'],{windowsHide:true});
    steam=stdout.match(/SteamPath\s+REG_SZ\s+(.+)/i)?.[1]?.trim();
  }catch{}}
  if(!steam||!await exists(steam))return {steam:null,accounts:[],installs:[]};
  steam=await fs.realpath(steam);
  const roots=new Set([steam]);
  try{
    const tree=readKeyValues(await fs.readFile(path.join(steam,'steamapps','libraryfolders.vdf'),'utf8'));
    for(const [,value] of tree[0][1])if(Array.isArray(value)){const p=value.find(([k])=>k==='path')?.[1];if(typeof p==='string')roots.add(p);}
  }catch{}
  const installs=[];
  for(const root of roots){
    const cfg=path.join(root,'steamapps','common','Counter-Strike Global Offensive','game','csgo','cfg');
    if(await exists(cfg))installs.push({id:crypto.randomUUID(),cfg:await fs.realpath(cfg),label:root});
  }
  const accounts=[];const userRoot=path.join(steam,'userdata');
  if(await exists(userRoot))for(const entry of await fs.readdir(userRoot,{withFileTypes:true})){
    if(!entry.isDirectory()||!/^\d+$/.test(entry.name))continue;
    const cfg=path.join(userRoot,entry.name,'730','local','cfg');
    if(await exists(cfg)){
      const stat=await fs.stat(cfg);
      accounts.push({id:crypto.randomUUID(),account:entry.name,label:`Steam · ${entry.name}`,cfg:await fs.realpath(cfg),modified:stat.mtime.toISOString()});
    }
  }
  accounts.sort((a,b)=>b.modified.localeCompare(a.modified));
  return {steam,accounts,installs};
}
async function readSafe(file){
  const stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>3e6)throw Error('Source is not a regular file or too large');
  return fs.readFile(file);
}
async function capture(account,install){
  const files=[];
  for(const name of await fs.readdir(account.cfg))if(profileCore.allowed.test(name) && name!=='original-autoexec.cfg')files.push({name,bytes:await readSafe(path.join(account.cfg,name))});
  if(install && await exists(path.join(install.cfg,'autoexec.cfg')))files.push({name:'original-autoexec.cfg',bytes:await readSafe(path.join(install.cfg,'autoexec.cfg'))});
  return profileCore.createProfile(files);
}
async function exportBundle(profile,directory){
  profileCore.validate(profile);const generated=profileCore.generateAutoexec(profile);
  await fs.mkdir(directory,{recursive:true});
  // The native dialog chooses a parent; always create a new bundle, never overwrite another export.
  const bundle=path.join(directory,`CS2-profile-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`);await fs.mkdir(bundle);
  await fs.writeFile(path.join(bundle,'autoexec.cfg'),generated.text);
  await fs.writeFile(path.join(bundle,'profile.cs2profile'),JSON.stringify(profile,null,2));
  const raw=path.join(bundle,'raw-source'),edited=path.join(bundle,'edited-source');await fs.mkdir(raw);await fs.mkdir(edited);
  for(const f of profile.files){
    await fs.writeFile(path.join(raw,f.name),Buffer.from(f.content,'base64'));
    if(f.name!=='original-autoexec.cfg')await fs.writeFile(path.join(edited,f.name),profileCore.materialize(profile,f.name));
  }
  if(profile.files.some(f=>f.name==='cs2_video.txt'))await fs.writeFile(path.join(bundle,'cs2_video.txt'),profileCore.materialize(profile,'cs2_video.txt'));
  const manifest={format:profile.format,schema:profile.schema,appVersion:profile.appVersion,exportedAt:new Date().toISOString(),autoexecCommands:generated.count,excludedFromAutoexec:generated.omitted,files:profile.files.map(f=>({name:f.name,sourceSha256:f.sha256,editedSha256:f.name==='original-autoexec.cfg'?f.sha256:profileCore.sha(profileCore.materialize(profile,f.name))}))};
  await fs.writeFile(path.join(bundle,'manifest.json'),JSON.stringify(manifest,null,2));
  await fs.writeFile(path.join(bundle,'README.txt'),[
    'CS2 PROFILE STUDIO / ENGLISH + FRANÇAIS', '',
    'autoexec.cfg: portable commands; copy to game/csgo/cfg, then exec autoexec in the CS2 console.',
    'cs2_video.txt: complete source video settings, includes hardware/display values. Use the app for a safe merge on a different PC.',
    'profile.cs2profile: reopen in the app to edit / install / export again.',
    'raw-source: original bytes, including settings not representable in an autoexec.',
    'edited-source: source files with your edits, for a full same-machine restore.',
    'Aliases from the original autoexec are included. Other original console commands / exec dependencies must be reviewed separately.',
    'Close CS2 before replacing saved files. Steam Cloud may offer a synchronization conflict; verify which copy you keep.', '',
    'autoexec.cfg : commandes portables, à placer dans game/csgo/cfg ; exec autoexec dans la console.',
    'cs2_video.txt : vidéo complète, avec données matérielles. Utilisez l’application pour fusionner sur un autre PC.',
    'profile.cs2profile : profil réouvrable, modifiable et réinstallable.',
    'raw-source : fichiers originaux complets ; edited-source : fichiers modifiés pour restauration sur la même machine.',
    'Les alias de l’ancien autoexec sont inclus. Vérifiez séparément ses autres commandes et fichiers exec.',
    'Fermez CS2 avant la restauration. Vérifiez les éventuels conflits Steam Cloud.', '',
    'An autoexec reapplies settings when executed. It does not permanently lock settings / Il ne verrouille pas les menus.'
  ].join('\n'));
  return {directory:bundle,manifest};
}
async function planInstall(profile,account,install,mode='portable',includeDisplay=false){
  profileCore.validate(profile);
  if(!['portable','snapshot'].includes(mode)||typeof includeDisplay!=='boolean')throw Error('Invalid install mode');
  if(!install)throw Error('Select CS2 installation / Sélectionnez l’installation CS2');
  const writes=[{directory:install.cfg,name:'autoexec.cfg',bytes:Buffer.from(profileCore.generateAutoexec(profile).text)}];
  if(mode==='snapshot'){
    for(const file of profile.files)if(file.name!=='original-autoexec.cfg')writes.push({directory:account.cfg,name:file.name,bytes:profileCore.materialize(profile,file.name)});
  }else if(profile.files.some(f=>f.name==='cs2_video.txt')){
    const target=path.join(account.cfg,'cs2_video.txt');
    const targetText=await exists(target)?(await readSafe(target)).toString('utf8'):null;
    writes.push({directory:account.cfg,name:'cs2_video.txt',bytes:profileCore.mergedVideo(profile,targetText,includeDisplay)});
  }
  for(const write of writes){
    const file=path.join(write.directory,write.name);
    write.previous=await exists(file)?await readSafe(file):null;
    write.beforeHash=write.previous===null?null:profileCore.sha(write.previous);
    write.afterHash=profileCore.sha(write.bytes);
  }
  return {id:crypto.randomUUID(),account:account.label,mode,includeDisplay,writes:writes.filter(w=>w.beforeHash!==w.afterHash)};
}
function publicPlan(plan){return {id:plan.id,account:plan.account,mode:plan.mode,files:plan.writes.map(w=>({name:w.name,directory:w.directory,status:w.previous===null?'new':'replace',bytes:w.bytes.length,beforeHash:w.beforeHash,afterHash:w.afterHash}))};}
async function atomicWrite(file,bytes){
  const temp=file+'.studio-'+crypto.randomUUID()+'.tmp';
  try{await fs.writeFile(temp,bytes,{flag:'wx'});await fs.rename(temp,file);}finally{await fs.rm(temp,{force:true});}
}
async function executePlan(plan,backupRoot){
  // Recheck every file before mutation: a preview must never authorize a changed target.
  for(const w of plan.writes){const file=path.join(w.directory,w.name);const now=await exists(file)?profileCore.sha(await readSafe(file)):null;if(now!==w.beforeHash)throw Error('Target changed since preview / La configuration a changé depuis l’aperçu');}
  if(!plan.writes.length)return {backup:null,files:0};
  const directory=path.join(backupRoot,`${Date.now()}-${plan.id}`);await fs.mkdir(directory,{recursive:true});
  const manifest={id:plan.id,createdAt:new Date().toISOString(),account:plan.account,entries:[]};
  for(const [i,w] of plan.writes.entries()){
    const backupName=`${i}.bin`;
    if(w.previous!==null)await fs.writeFile(path.join(directory,backupName),w.previous,{flag:'wx'});
    manifest.entries.push({target:path.join(w.directory,w.name),backupName,existed:w.previous!==null,beforeHash:w.beforeHash,afterHash:w.afterHash});
  }
  await fs.writeFile(path.join(directory,'manifest.json'),JSON.stringify(manifest,null,2),{flag:'wx'});
  const applied=[];
  try{for(const w of plan.writes){await atomicWrite(path.join(w.directory,w.name),w.bytes);applied.push(w);}}
  catch(error){
    const rollbackErrors=[];
    for(const w of applied.reverse())try{if(w.previous!==null)await atomicWrite(path.join(w.directory,w.name),w.previous);else await fs.rm(path.join(w.directory,w.name));}catch(e){rollbackErrors.push(e.message);}
    if(rollbackErrors.length)throw Error(`${error.message}; rollback failed: ${rollbackErrors.join('; ')}; backup: ${directory}`);
    throw error;
  }
  return {backup:directory,files:plan.writes.length};
}
async function rollback(directory,allowedDirectories){
  const manifest=JSON.parse(await fs.readFile(path.join(directory,'manifest.json'),'utf8'));
  if(!Array.isArray(manifest.entries)||manifest.entries.length>33)throw Error('Invalid backup');
  const writes=[];
  for(const e of manifest.entries){
    if(!allowedDirectories.includes(path.dirname(e.target)) || !/^(autoexec\.cfg|cs2_machine_convars\.vcfg|cs2_video\.txt|cs2_user_(convars|keys)_\d+_slot\d+\.vcfg)$/.test(path.basename(e.target)) || !/^\d+\.bin$/.test(e.backupName))throw Error('Backup target outside CS2 directories');
    const current=await exists(e.target)?profileCore.sha(await readSafe(e.target)):null;
    if(current!==e.afterHash)throw Error('Target modified after installation; rollback stopped / Le fichier a changé après installation');
    const bytes=e.existed?await readSafe(path.join(directory,e.backupName)):null;
    if(bytes!==null&&profileCore.sha(bytes)!==e.beforeHash)throw Error('Corrupt backup');
    writes.push({e,bytes});
  }
  for(const {e,bytes} of writes)if(bytes===null)await fs.rm(e.target,{force:true});else await atomicWrite(e.target,bytes);
  return {files:writes.length};
}
module.exports={exists,discover,capture,exportBundle,planInstall,publicPlan,executePlan,rollback,assertGameClosed,readSafe};
