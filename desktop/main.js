'use strict';
const {app,BrowserWindow,ipcMain,dialog,shell}=require('electron');
const path=require('node:path');
const fs=require('node:fs/promises');
const {pathToFileURL}=require('node:url');
const core=require('../studio/profile');
const storage=require('./storage');
const servers=require('../studio/servers');
let window, inventory={accounts:[],installs:[]},pending,override;
// Isolated user-data path for the reproducible Electron smoke test; no game files are used by that test.
if(process.env.CS2_STUDIO_TEST_DATA)app.setPath('userData',process.env.CS2_STUDIO_TEST_DATA);
const page=pathToFileURL(path.join(__dirname,'../studio/index.html')).href;
const backupRoot=()=>path.join(app.getPath('userData'),'backups');
function find(kind,id){const entry=inventory[kind].find(e=>e.id===id);if(!entry)throw Error('Refresh Steam detection / Relancez la détection Steam');return entry;}
async function requireClosedGame(){
  // UI tests operate only on synthetic directories beside their isolated app-data.
  // A running real game is irrelevant to those fixtures; real Steam targets keep the normal guard.
  const testRoot=process.env.CS2_STUDIO_TEST_DATA?path.dirname(app.getPath('userData')):null;
  if(testRoot && inventory.accounts.length && [...inventory.accounts,...inventory.installs].every(e=>{const rel=path.relative(testRoot,e.cfg);return rel&&!rel.startsWith('..')&&!path.isAbsolute(rel);}))return storage.assertGameClosed(async()=>({stdout:''}),'win32');
  return storage.assertGameClosed();
}
function handle(name,fn){ipcMain.handle('studio:'+name,async(event,...args)=>{
  if(event.sender!==window.webContents || event.senderFrame.url!==page)throw Error('Untrusted sender');
  try{return {ok:true,data:await fn(...args)};}catch(error){return {ok:false,error:error.message};}
});}
async function latestBackup(){
  let names;try{names=await fs.readdir(backupRoot());}catch{return null;}
  for(const name of names.sort().reverse())if(/^\d+-[a-f0-9-]+$/.test(name) && await storage.exists(path.join(backupRoot(),name,'manifest.json')) && !await storage.exists(path.join(backupRoot(),name,'restored.txt')))return path.join(backupRoot(),name);
  return null;
}
function register(){
  handle('confirm',async kind=>{const messages={replace:'Discard unsaved changes? / Abandonner les modifications non sauvegardées ?',reset:'Revert edits to the captured values? / Revenir aux valeurs capturées ?',rollback:'Restore the last backup? This stops if files changed after installation. / Restaurer la dernière sauvegarde ? Arrêt si les fichiers ont changé.'};if(!messages[kind])throw Error('Invalid confirmation');const result=await dialog.showMessageBox(window,{type:'question',buttons:['Cancel / Annuler','Continue / Continuer'],defaultId:0,cancelId:0,message:messages[kind]});return result.response===1;});
  handle('discover',async()=>{inventory=await storage.discover(override);return {...inventory,lastBackup:await latestBackup()};});
  handle('chooseSteam',async()=>{const result=await dialog.showOpenDialog(window,{title:'Steam folder / Dossier Steam',properties:['openDirectory']});if(result.canceled)return null;override=result.filePaths[0];inventory=await storage.discover(override);return {...inventory,lastBackup:await latestBackup()};});
  handle('capture',async(a,i)=>{await requireClosedGame();return storage.capture(find('accounts',a),i?find('installs',i):null);});
  handle('importProfile',async()=>{
    const r=await dialog.showOpenDialog(window,{filters:[{name:'CS2 profile',extensions:['cs2profile']}],properties:['openFile']});if(r.canceled)return null;
    const stat=await fs.stat(r.filePaths[0]);if(stat.size>30e6)throw Error('Profile too large');
    const p=JSON.parse(await fs.readFile(r.filePaths[0],'utf8'));core.validate(p);return p;
  });
  handle('importSources',async()=>{
    const r=await dialog.showOpenDialog(window,{title:'Select files from ONE CS2 account / Fichiers d’un seul compte',filters:[{name:'CS2 sources',extensions:['vcfg','txt','cfg']}],properties:['openFile','multiSelections']});if(r.canceled)return null;
    if(r.filePaths.length>32)throw Error('Maximum 32 files');
    const folders=new Set(r.filePaths.filter(f=>/\.vcfg$|cs2_video\.txt$/i.test(f)).map(f=>path.dirname(f)));if(folders.size>1)throw Error('Select a single account source folder');
    const files=[];for(const f of r.filePaths){let name=path.basename(f);if(name==='autoexec.cfg')name='original-autoexec.cfg';if(!core.allowed.test(name))throw Error('Unsupported source: '+name);files.push({name,bytes:await storage.readSafe(f)});}
    return core.createProfile(files);
  });
  handle('saveProfile',async p=>{core.validate(p);const r=await dialog.showSaveDialog(window,{defaultPath:'profile.cs2profile',filters:[{name:'CS2 profile',extensions:['cs2profile']}]});if(r.canceled)return null;await fs.writeFile(r.filePath,JSON.stringify(p,null,2));return r.filePath;});
  handle('describe',p=>core.describe(p));
  handle('preview',p=>core.generateAutoexec(p));
  handle('exportBundle',async p=>{core.validate(p);const r=await dialog.showOpenDialog(window,{title:'Export destination / Destination de l’export',properties:['openDirectory','createDirectory']});if(r.canceled)return null;return storage.exportBundle(p,r.filePaths[0]);});
  handle('plan',async(p,a,i,m,d)=>{await requireClosedGame();pending=await storage.planInstall(p,find('accounts',a),find('installs',i),m,d);return storage.publicPlan(pending);});
  handle('install',async id=>{if(!pending || pending.id!==id)throw Error('Preview installation first');await requireClosedGame();const plan=pending;pending=null;return storage.executePlan(plan,backupRoot());});
  handle('rollback',async()=>{await requireClosedGame();const backup=await latestBackup();if(!backup)throw Error('No backup / Aucune sauvegarde');const result=await storage.rollback(backup,[...inventory.accounts,...inventory.installs].map(x=>x.cfg));await fs.writeFile(path.join(backup,'restored.txt'),new Date().toISOString());return result;});
  handle('serverData',()=>servers.definitions);
  handle('openDocs',()=>shell.openExternal('https://github.com/KZGlobalTeam/cs2kz-metamod'));
  handle('serverPreview',(kind,values)=>servers.generate(kind,values));
  handle('serverExport',async(kind,values)=>{
    const cfg=servers.generate(kind,values);const r=await dialog.showOpenDialog(window,{title:'Export server CFG / Export configuration serveur',properties:['openDirectory','createDirectory']});if(r.canceled)return null;
    const dir=path.join(r.filePaths[0],`CS2-server-${kind}-${Date.now()}`);await fs.mkdir(dir);
    await fs.writeFile(path.join(dir,`studio-${kind}.cfg`),cfg);await fs.writeFile(path.join(dir,'README.txt'),servers.guide);
    if(kind==='kz')await fs.copyFile(path.join(__dirname,'../studio/cs2kz.cfg'),path.join(dir,'cs2kz.cfg'));
    return dir;
  });
}
app.whenReady().then(()=>{
  register();window=new BrowserWindow({width:1360,height:940,minWidth:850,minHeight:660,show:!process.env.CS2_STUDIO_TEST_DATA,icon:path.join(__dirname,'icon.png'),backgroundColor:'#171e23',title:'CS2 Profile Studio',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  window.webContents.on('will-navigate',(event,url)=>{if(url!==page)event.preventDefault();});
  window.webContents.on('will-prevent-unload',event=>{const answer=dialog.showMessageBoxSync(window,{type:'question',buttons:['Keep editing / Continuer','Discard / Abandonner'],defaultId:0,cancelId:0,title:'Unsaved profile / Profil non sauvegardé',message:'Save or export your profile before closing / Sauvegardez ou exportez le profil avant de fermer.'});if(answer===1)event.preventDefault();});
  window.loadURL(page);
});
app.on('window-all-closed',()=>app.quit());
