'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vcfg = require('../editor/vcfg.js');
const core = require('../editor/core.js');
const reference = fs.readFileSync(path.join(__dirname,'../autoexec.cfg'), 'utf8');
const user = text => ({name:'cs2_user_convars_0_slot0.vcfg',text:`"config" { "convars" { ${text} } }`});
const keys = text => ({name:'cs2_user_keys_0_slot0.vcfg',text:`"config" { "bindings" { ${text} } }`});

test('KeyValues parser handles BOM, comments, nested sections and braces in quoted strings', () => {
  const tree = vcfg.readKeyValues('\uFEFF// header\n"config" { /* note */ "convars" { "example" "a { b } // c" } }');
  assert.deepEqual(tree, [['config', [['convars', [['example','a { b } // c']]]]]]);
  for (const malformed of ['"config" {', '"config" { "convars" }', '"config" { "x" "unclosed', '/* unclosed']) assert.throws(() => vcfg.readKeyValues(malformed));
});

test('extraction starts only from the saved setup, retaining sensitivity and personal bindings', () => {
  const result = vcfg.extract([user('"sensitivity" "1.77" "zoom_sensitivity_ratio" "0.8" "volume" "0.65"'), keys('"w" "+forward" "MOUSE4" "+voicerecord" "SPACE" "+jump"')], reference);
  const model = core.parse(result.text);
  assert.equal(result.settings,3); assert.equal(result.bindings,3); assert.equal(result.skipped.length,0);
  assert.equal(model.rows.find(row => row.command === 'sensitivity').value,'1.77');
  assert.equal(model.rows.find(row => row.key === 'MOUSE4').value,'+voicerecord');
  assert.equal(model.rows.find(row => row.key === 'w').value,'+forward');
  assert.equal(model.rows.length,6);
  assert.doesNotMatch(result.text,/^hud_scaling|^sv_cheats|exec pracc\.cfg|^alias /m);
  assert.deepEqual(core.errors(model),[]);
  assert.equal(core.serialize(model),result.text);
});

test('user values override optional machine values regardless of picker order', () => {
  const machine = {name:'cs2_machine_convars.vcfg',text:'"config" { "convars" { "sensitivity" "2.3" "fps_max" "300" } }'};
  const saved = user('"sensitivity" "1.9"');
  const first = vcfg.extract([saved,machine],reference), second = vcfg.extract([machine,saved],reference);
  assert.equal(first.text,second.text);
  assert.match(first.text,/^sensitivity\s+"1.9"/m);
  assert.equal(first.overwritten.length,1);
  assert.equal(first.hasBindings,false);
});

test('saved punctuation keys, empty values and analog axes survive round trips', () => {
  const keyFile = {name:'cs2_user_keys_0_slot0.vcfg',text:'"config" { "bindings" { ";" "radio" "`" "toggleconsole" "," "" } "analogbindings" { "MOUSE_X" "yaw" "MOUSE_Y" "pitch" } }'};
  const result = vcfg.extract([user('"cl_clanid" ""'), keyFile],reference);
  const model = core.parse(result.text);
  assert.equal(result.bindings,5);
  assert.deepEqual(core.errors(model),[]);
  const punctuation = model.rows.find(row => row.key === ';'); punctuation.value = 'radio1';
  assert.match(core.serialize(model),/bind ";" "radio1"/);
  assert.match(result.text,/^bind "MOUSE_X" "yaw"/m);
  assert.match(result.text,/^cl_clanid\s+""/m);
});

test('unsafe names and escaped values are omitted and reported, without introducing commands', () => {
  const source = user('"sensitivity" "1.2" "bad;quit" "1" "path" "C:\\\\folder" "quoted" "a\\\"; quit" "multiline" "1\\nquit"');
  const result = vcfg.extract([source],reference);
  assert.equal(result.settings,1); assert.equal(result.skipped.length,4);
  assert.doesNotMatch(result.text,/quit|C:\\folder/);
  assert.deepEqual(core.errors(core.parse(result.text)),[]);
});

test('malformed, video-only, empty and mixed user profiles cannot replace a setup', () => {
  for (const files of [
    [], [{name:'video.txt',text:'"video.cfg" { "setting.defaultres" "1920" }'}],
    [user('')], [{name:'broken.vcfg',text:'"config" {'}],
    [user('"sensitivity" "1"'),{...user('"sensitivity" "2"'),name:'cs2_user_convars_1_slot1.vcfg'}],
    [keys('"a" "+left"'),{...keys('"d" "+right"'),name:'cs2_user_keys_1_slot1.vcfg'}]
  ]) assert.throws(() => vcfg.extract(files,reference));
});

test('duplicate saved values resolve to the last occurrence and report the overwrite', () => {
  const result = vcfg.extract([user('"sensitivity" "1.5" "sensitivity" "1.6"')],reference);
  assert.equal(result.settings,1); assert.equal(result.overwritten.length,1);
  assert.match(result.text,/^sensitivity\s+"1.6"/m);
});
