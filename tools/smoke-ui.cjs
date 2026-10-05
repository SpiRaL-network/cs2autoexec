'use strict';
const fs=require('node:fs/promises'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict');
const { _electron:electron }=require('playwright');
const root=path.resolve(__dirname,'..');
const core=require('../studio/profile');
async function main(){
  const fixture=await fs.mkdtemp(path.join(os.tmpdir(),'cs2-studio-ui-'));
  const steam=path.join(fixture,'Steam'),account=path.join(steam,'userdata','100000','730','local','cfg'),game=path.join(steam,'steamapps','common','Counter-Strike Global Offensive','game','csgo','cfg');
  await fs.mkdir(account,{recursive:true});await fs.mkdir(game,{recursive:true});await fs.mkdir(path.join(fixture,'exports'));
  const files=[
    {name:'cs2_machine_convars.vcfg',text:'"config" { "convars" { "fps_max" "400" "fps_max_ui$2" "200" "volume" "0.64" "snd_headphone_eq" "0" "snd_menumap_volume$2" "0.25" "snd_voipvolume" "0.81" "snd_spatialize_lerp" "0.2" "snd_steamaudio_enable_perspective_correction" "true" "snd_mute_losefocus" "false" "voice_threshold$2" "-120" "snd_tensecondwarning_volume$4" "0.015" "sound_device_override" "" "unknown_future" "unchanged" } }'},
    {name:'cs2_user_convars_0_slot0.vcfg',text:'"config" { "convars" { "sensitivity" "1.1" "zoom_sensitivity_ratio" "1" "hud_scaling$3" "0.9" "cl_hud_color" "5" "cl_radar_scale" "0.4" "cl_radar_always_centered" "true" "cl_radar_rotate" "true" "cl_crosshair_length" "2" "cl_crosshair_thickness" "2" "cl_crosshaircolor_r" "0" "cl_crosshaircolor_g" "255" "cl_crosshaircolor_b" "0" } }'},
    {name:'cs2_user_keys_0_slot0.vcfg',text:'"config" { "bindings" { "scancode26" "+forward" "scancode22" "+back" "scancode4" "+left" "scancode7" "+right" "SPACE" "+jump" "MOUSE4" "+voicerecord" } "analogbindings" { "MOUSE_X" "yaw" "MOUSE_Y" "pitch" } }'},
    {name:'cs2_video.txt',text:'"video.cfg" { "Version" "17" "VendorID" "4318" "DeviceID" "123" "setting.defaultres" "1280" "setting.defaultresheight" "960" "setting.refreshrate_numerator" "240000" "setting.refreshrate_denominator" "1000" "setting.fullscreen" "0" "setting.nowindowborder" "0" "setting.monitor_index" "0" "setting.mat_vsync" "0" "setting.msaa_samples" "4" "setting.videocfg_shadow_quality" "0" "setting.videocfg_dynamic_shadows" "1" "setting.videocfg_texture_detail" "1" "setting.r_texturefilteringquality" "3" "setting.shaderquality" "0" "setting.videocfg_particle_detail" "0" "setting.videocfg_ao_detail" "2" "setting.videocfg_hdr_detail" "-1" "setting.videocfg_fsr_detail" "0" "setting.r_low_latency" "0" }'}
  ];
  for(const f of files)await fs.writeFile(path.join(account,f.name),f.text);
  await fs.writeFile(path.join(game,'autoexec.cfg'),'// previous personal file\r\n');
  const profilePath=path.join(fixture,'input.cs2profile');await fs.writeFile(profilePath,JSON.stringify(core.createProfile(files,'Mon profil CS2')));
  const userData=path.join(fixture,'app-data');await fs.mkdir(userData);
  const env={...process.env,CS2_STUDIO_TEST_DATA:userData};delete env.ELECTRON_RUN_AS_NODE;
  const executable=process.env.CS2_STUDIO_EXECUTABLE||require('electron');
  const app=await electron.launch({executablePath:executable,args:process.env.CS2_STUDIO_EXECUTABLE?[]:[root],env});
  let page;
  try{
    page=await app.firstWindow();const errors=[],network=[];
    page.setDefaultTimeout(10000);
    page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url());});
    await page.waitForSelector('#server-kinds button',{state:'attached'});
    await page.selectOption('#language','fr');
    assert.equal(await page.evaluate(()=>typeof require),'undefined');
    // Native pickers are stubbed only in this synthetic fixture test.
    await app.evaluate(({dialog},paths)=>{let n=0;dialog.showOpenDialog=async()=>({canceled:false,filePaths:[paths[n++]||paths.at(-1)]});dialog.showSaveDialog=async()=>({canceled:false,filePath:paths[2]});dialog.showMessageBox=async()=>({response:1});},[steam,profilePath,path.join(fixture,'saved.cs2profile'),path.join(fixture,'exports')]);
    await page.click('#choose-steam');await page.waitForFunction(()=>document.querySelector('#account').options[0].text.includes('100000'));
    await page.click('#capture');await page.waitForSelector('#editor:not([hidden])');assert.equal(await page.locator('#source-count').textContent(),'5');
    await page.click('#import-profile');await page.waitForSelector('#editor:not([hidden])');
    await page.waitForFunction(()=>document.getElementById('profile-title').textContent==='Mon profil CS2');
    console.log('UI: profile imported');
    assert.equal(await page.locator('#profile-title').textContent(),'Mon profil CS2');
    await page.locator('#tabs button').filter({hasText:'Clavier'}).click();
    const sens=page.locator('[data-key="sensitivity"] input.numeric');await sens.fill('1.77');await sens.press('Tab');await page.waitForFunction(()=>!document.getElementById('dirty').hidden);
    assert.equal(await sens.inputValue(),'1.77');
    await page.fill('#search','sensitivity');assert.ok(await page.locator('#rows .setting-row').count()<=2);
    await page.fill('#search','');
    await page.locator('[data-key="scancode26"] button.key').click();await page.getByLabel('Nom de touche CS2',{exact:true}).fill('scancode29');await page.locator('#modal button').filter({hasText:'Appliquer'}).click();await page.waitForSelector('[data-key="scancode29"]');
    await page.click('#save-profile');await page.waitForFunction(()=>document.getElementById('status').textContent.includes('sauvegardé'));
    console.log('UI: profile edited and saved');
    const saved=JSON.parse(await fs.readFile(path.join(fixture,'saved.cs2profile'),'utf8'));core.validate(saved);assert.equal(core.describe(saved).rows.find(r=>r.key==='sensitivity').value,'1.77');
    await page.click('#preview');await page.waitForSelector('#modal[open]');assert.match(await page.locator('#modal pre').first().textContent(),/hud_scaling\s+"0.9"/);assert.doesNotMatch(await page.locator('#modal pre').first().textContent(),/hud_scaling\$3/);await page.click('#close-modal');
    await page.locator('#tabs button').filter({hasText:'Audio'}).click();await page.locator('[data-key="snd_tensecondwarning_volume"] .setting-label').click();assert.match(await page.locator('#inspect-description').textContent(),/gain audio/);
    await page.selectOption('#language','en');assert.equal(await page.locator('#capture').textContent(),'Capture settings');
    await page.click('#install-preview');await page.locator('#modal select').selectOption('snapshot');await page.locator('#modal button').filter({hasText:'Preview files'}).click();await page.waitForSelector('#confirm-install:not([hidden])');
    assert.equal(await page.locator('.install-file').count(),3);await page.click('#confirm-install');await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Installed files: 3'));
    console.log('UI: synthetic installation completed');
    assert.match(await fs.readFile(path.join(game,'autoexec.cfg'),'utf8'),/^sensitivity\s+"1.77"/m);
    await page.click('#rollback');await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Previous files restored'));
    assert.equal(await fs.readFile(path.join(game,'autoexec.cfg'),'utf8'),'// previous personal file\r\n');
    await page.click('#server-view');await page.locator('#server-kinds button').filter({hasText:'Bunnyhop'}).click();assert.match(await page.locator('#server-code').textContent(),/sv_autobunnyhopping\s+"1"/);
    await page.locator('#server-kinds button').filter({hasText:'KZ'}).click();assert.match(await page.locator('#server-note').textContent(),/Do not apply both/);
    assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
    console.log('Electron UI OK: import, bilingual menus, edits, rebinding, save, autoexec preview, isolated install/rollback, server profiles, sandbox and zero network requests.');
  }catch(error){console.error('UI failure; current status:',await page?.locator('#status').textContent().catch(()=>''));throw error;}
  finally{await page?.evaluate(()=>{dirty=false;}).catch(()=>{});await app.close();await fs.rm(fixture,{recursive:true,force:true});}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
