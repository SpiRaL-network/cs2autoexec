'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const core=require('../studio/profile');
const storage=require('../desktop/storage');
const {readKeyValues}=require('../editor/vcfg');
const servers=require('../studio/servers');
function sources(){return [
  {name:'cs2_machine_convars.vcfg',text:'\uFEFF"config"\r\n{\r\n "convars" { "fps_max" "350" "volume" "0.5" "sound_device_override" "device-A" "unknown_future_setting" "a\\\\b" "nested" { "x" "y" } }\r\n}\r\n'},
  {name:'cs2_user_convars_0_slot0.vcfg',text:'"config" { "convars" { "sensitivity" "1.77" "hud_scaling$3" "1.02" "snd_tensecondwarning_volume$4" "0.015" "voice_threshold$2" "-120" "volume" "0.65" "cl_crosshair_length" "2" } }'},
  {name:'cs2_user_keys_0_slot0.vcfg',text:'"config" { "bindings" { "w" "+forward" "MOUSE4" "+voicerecord" ";" "radio" "SPACE" "+jump" } "analogbindings" { "MOUSE_X" "yaw" "MOUSE_Y" "pitch" } }'},
  {name:'cs2_user_keys_0_slot1.vcfg',text:'"config" { "bindings" { "w" "+back" } }'},
  {name:'cs2_video.txt',text:'"video.cfg" { "Version" "17" "VendorID" "4318" "DeviceID" "123" "setting.monitor_index" "1" "setting.defaultres" "1280" "setting.defaultresheight" "960" "setting.refreshrate_numerator" "240000" "setting.refreshrate_denominator" "1000" "setting.mat_vsync" "0" "setting.videocfg_shadow_quality" "0" "setting.future_unknown" "x" }'}
];}
const get=(p,key)=>core.describe(p).rows.find(r=>r.key===key);
test('complete capture retains original bytes, nested and unknown keys; version suffixes map to real commands',()=>{
  const files=sources(),p=core.createProfile(files);assert.equal(p.files.length,5);
  for(const f of files)assert.deepEqual(core.materialize(p,f.name),Buffer.from(f.text));
  const generated=core.generateAutoexec(p);
  for(const k of ['hud_scaling','snd_tensecondwarning_volume','voice_threshold'])assert.match(generated.text,new RegExp('^'+k+'\\s+"','m'));
  assert.doesNotMatch(generated.text,/\$\d|device-A|unknown_future_setting|^sv_cheats|bind "w"\s+"\+back"/m);
  assert.match(generated.text,/^volume\s+"0.65"/m);
  assert.equal(get(p,'snd_tensecondwarning_volume').value,'0.015');
  assert.ok(generated.omitted.some(x=>x.key==='sound_device_override'));
  assert.equal(get(p,'hud_scaling').rawKey,'hud_scaling$3');
});
test('edits round-trip with unknown structures intact and original bytes unchanged',()=>{
  const p=core.createProfile(sources());const before=p.files[1].content;
  p.changes[get(p,'hud_scaling').id]='0.95';
  const saved=JSON.parse(JSON.stringify(p));core.validate(saved);
  assert.match(core.materialize(saved,'cs2_user_convars_0_slot0.vcfg').toString(),/"hud_scaling\$3"\s+"0.95"/);
  assert.match(core.generateAutoexec(saved).text,/^hud_scaling\s+"0.95"/m);assert.equal(p.files[1].content,before);
  const unknown=get(p,'unknown_future_setting');p.changes[unknown.id]='a"b\\c';
  const tree=readKeyValues(core.materialize(p,unknown.file).toString());
  assert.equal(tree[0][1][0][1].find(([k])=>k==='unknown_future_setting')[1],'a"b\\c');
  assert.deepEqual(tree[0][1][0][1].find(([k])=>k==='nested')[1],[['x','y']]);
});
test('rebind supports scancodes and punctuation, rejects collisions and supports atomic swaps',()=>{
  const p=core.createProfile(sources());const w=get(p,'w'),space=get(p,'SPACE');
  p.rebindings[w.id]='scancode26';core.validate(p);assert.match(core.generateAutoexec(p).text,/^bind "scancode26"\s+"\+forward"/m);
  p.rebindings[w.id]='SPACE';assert.throws(()=>core.validate(p),/Duplicate key/);
  p.rebindings[space.id]='w';core.validate(p);
  const tree=readKeyValues(core.materialize(p,w.file).toString());const entries=tree[0][1].find(([k])=>k==='bindings')[1];
  assert.equal(entries.find(([k])=>k==='SPACE')[1],'+forward');assert.equal(entries.find(([k])=>k==='w')[1],'+jump');
});
test('selected split-screen slot is exported independently',()=>{
  const p=core.createProfile(sources());p.activeSlot='0_slot1';const text=core.generateAutoexec(p).text;
  assert.match(text,/^bind "w"\s+"\+back"/m);assert.doesNotMatch(text,/hud_scaling|\+forward|\+jump/);
});
test('invalid, tampered and path-traversing profiles fail before writes',()=>{
  const p=core.createProfile(sources());
  for(const mutation of [q=>q.files[0].name='../autoexec.cfg',q=>q.files[0].content='YWJj',q=>q.changes.bad='1',q=>q.activeSlot='../x',q=>q.rebindings[get(q,'w').id]='";quit',q=>q.changes[get(q,'sensitivity').id]='NaN',q=>q.changes[get(q,'sensitivity').id]='-1']){const clone=structuredClone(p);mutation(clone);assert.throws(()=>core.validate(clone));}
});
test('safe CFG output excludes unrepresentable strings but preserves them in complete sources',()=>{
  const p=core.createProfile([{name:'cs2_user_keys_0_slot0.vcfg',text:'"config" { "bindings" { "w" "+forward" } }'}]);
  const row=get(p,'w');p.changes[row.id]='a";quit';
  assert.ok(core.generateAutoexec(p).omitted.some(x=>x.reason==='cfg-syntax'));assert.doesNotMatch(core.generateAutoexec(p).text,/quit/);
  assert.match(core.materialize(p,row.file).toString(),/quit/);
});
test('portable video merge retains target hardware and display; optional display transfers only display preferences',()=>{
  const p=core.createProfile(sources());
  const target='"video.cfg" { "Version" "18" "VendorID" "4098" "DeviceID" "999" "setting.defaultres" "1920" "setting.defaultresheight" "1080" "setting.monitor_index" "0" "setting.mat_vsync" "1" "target_only" "keep" }';
  const read=text=>Object.fromEntries(readKeyValues(text.toString())[0][1]);
  const portable=read(core.mergedVideo(p,target));assert.equal(portable.VendorID,'4098');assert.equal(portable['setting.defaultres'],'1920');assert.equal(portable['setting.mat_vsync'],'0');assert.equal(portable.target_only,'keep');
  const display=read(core.mergedVideo(p,target,true));assert.equal(display.VendorID,'4098');assert.equal(display['setting.defaultres'],'1280');assert.equal(display['setting.monitor_index'],'1');
  assert.throws(()=>core.mergedVideo(p,null,false));
});
test('export contains complete raw files, edited files, manifest hashes and reusable profile',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'cs2-studio-test-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const p=core.createProfile(sources());p.changes[get(p,'sensitivity').id]='1.9';
  const result=await storage.exportBundle(p,dir);
  for(const f of p.files)assert.deepEqual(await fs.readFile(path.join(result.directory,'raw-source',f.name)),Buffer.from(f.content,'base64'));
  const saved=JSON.parse(await fs.readFile(path.join(result.directory,'profile.cs2profile'),'utf8'));core.validate(saved);assert.equal(get(saved,'sensitivity').value,'1.9');
  assert.ok(result.manifest.files.every(f=>f.editedSha256.length===64));
});
test('installation preview, full restore, backup and rollback recover byte-for-byte including newly created files',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'cs2-studio-install-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const cfg=path.join(dir,'account'),game=path.join(dir,'game'),backups=path.join(dir,'backups');await fs.mkdir(cfg);await fs.mkdir(game);
  const old=Buffer.from('old\r\nautoexec\r\n');await fs.writeFile(path.join(game,'autoexec.cfg'),old);
  const account={cfg,label:'Fixture account'},install={cfg:game};const p=core.createProfile(sources());
  const plan=await storage.planInstall(p,account,install,'snapshot');assert.equal(plan.writes.length,6);assert.equal(storage.publicPlan(plan).files[0].status,'replace');
  const result=await storage.executePlan(plan,backups);assert.equal(result.files,6);
  assert.deepEqual(await fs.readFile(path.join(cfg,'cs2_machine_convars.vcfg')),Buffer.from(p.files[0].content,'base64'));
  await storage.rollback(result.backup,[cfg,game]);assert.deepEqual(await fs.readFile(path.join(game,'autoexec.cfg')),old);assert.deepEqual(await fs.readdir(cfg),[]);
});
test('changed target or changed post-install files stop mutations and rollback',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'cs2-studio-guard-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const cfg=path.join(dir,'account'),game=path.join(dir,'game');await fs.mkdir(cfg);await fs.mkdir(game);const file=path.join(game,'autoexec.cfg');await fs.writeFile(file,'old');
  const p=core.createProfile(sources());const plan=await storage.planInstall(p,{cfg,label:'Test'},{cfg:game},'snapshot');await fs.writeFile(file,'changed');
  await assert.rejects(storage.executePlan(plan,path.join(dir,'backups')),/Target changed/);assert.equal(await fs.readFile(file,'utf8'),'changed');
  const next=await storage.planInstall(p,{cfg,label:'Test'},{cfg:game},'snapshot');const result=await storage.executePlan(next,path.join(dir,'backups'));await fs.writeFile(file,'later');
  await assert.rejects(storage.rollback(result.backup,[cfg,game]),/Target modified/);assert.equal(await fs.readFile(file,'utf8'),'later');
});
test('server configs use only catalogued commands and validate ranges without mixing with player autoexec',()=>{
  for(const kind of Object.keys(servers.definitions))assert.match(servers.generate(kind),/mp_restartgame "1"/);
  assert.throws(()=>servers.generate('surf',{sv_airaccelerate:'1;quit'}));assert.throws(()=>servers.generate('bhop',{mp_roundtime:100}));assert.throws(()=>servers.generate('kz',{unknown:1}));
});
test('running-game and process-enumeration guards fail closed',async()=>{
  await assert.rejects(storage.assertGameClosed(async()=>({stdout:'"cs2.exe","123","Console","1","100 K"'}),'win32'),/Close CS2/);
  await assert.rejects(storage.assertGameClosed(async()=>{throw Error('enumeration failed');},'win32'),/enumeration failed/);
  await storage.assertGameClosed(async()=>({stdout:'INFO: No tasks match the criteria.'}),'win32');
});
test('original repeated keys remain capturable and intact; nonzero source slot is selected automatically',()=>{
  const source={name:'cs2_user_keys_1_slot2.vcfg',text:'"config" { "bindings" { "w" "+forward" "w" "+back" } }'};
  const p=core.createProfile([source]);assert.equal(p.activeSlot,'1_slot2');assert.equal(core.materialize(p,source.name).toString(),source.text);
  assert.match(core.generateAutoexec(p).text,/^bind "w"\s+"\+back"/m);assert.ok(core.describe(p).warnings.some(w=>w.includes('repeated key')));
  assert.equal(core.describe(core.createProfile(sources())).rows.filter(r=>r.modified).length,0);
});
test('engine values outside a menu slider remain editable when the engine has no range restriction',()=>{
  const p=core.createProfile(sources());const fps=get(p,'fps_max');p.changes[fps.id]='0';core.validate(p);assert.match(core.generateAutoexec(p).text,/^fps_max\s+"0"/m);
  p.changes[fps.id]='1500';core.validate(p);
});
test('an interrupted install restores files already applied and keeps the backup',async t=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'cs2-studio-failure-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const file=path.join(dir,'autoexec.cfg'),before=Buffer.from('previous bytes\r\n');await fs.writeFile(file,before);
  const bytes=Buffer.from('replacement'),plan={id:'failure-fixture',account:'Fixture',writes:[
    {directory:dir,name:'autoexec.cfg',bytes,previous:before,beforeHash:core.sha(before),afterHash:core.sha(bytes)},
    {directory:path.join(dir,'missing-folder'),name:'cs2_video.txt',bytes,previous:null,beforeHash:null,afterHash:core.sha(bytes)}
  ]};
  const backups=path.join(dir,'backups');await assert.rejects(storage.executePlan(plan,backups));assert.deepEqual(await fs.readFile(file),before);
  const backup=path.join(backups,(await fs.readdir(backups))[0]);assert.deepEqual(await fs.readFile(path.join(backup,'0.bin')),before);
});
