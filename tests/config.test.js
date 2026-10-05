'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../editor/core.js');
const root = path.resolve(__dirname, '..');

for (const filename of ['autoexec.cfg', 'pracc.cfg']) {
  test(`${filename}: valid, unique and lossless`, () => {
    const source = fs.readFileSync(path.join(root, filename), 'utf8');
    const model = core.parse(source);
    assert.ok(model.rows.length > 25);
    assert.deepEqual(core.errors(model), []);
    assert.deepEqual(core.duplicates(model), []);
    assert.equal(core.serialize(model), source);
    const executable = source.split('\n').filter(line => line.trim() && !line.startsWith('//'));
    assert.equal(executable.length, model.rows.length + (filename === 'autoexec.cfg' ? 1 : 3));
  });
}

test('editing changes only the selected value and preserves imported commands/comments/CRLF', () => {
  const source = '// Custom file\r\nsensitivity "1.1" // Keep me\r\nunknown_command 42\r\necho "hello"\r\nbind "MOUSE4" "drop; say // example"\r\n';
  const model = core.parse(source);
  assert.equal(core.serialize(model), source);
  model.rows[0].value = '2.25';
  assert.equal(core.serialize(model), source.replace('"1.1"', '"2.25"'));
  model.rows[1].key = 'scancode11';
  assert.match(core.serialize(model), /bind "scancode11" "drop; say \/\/ example"/);
});

test('disabled rows survive export/import and can be re-enabled', () => {
  const model = core.parse('sensitivity "1.1" // Mouse | Souris\n');
  model.rows[0].value = '1.4'; model.rows[0].enabled = false;
  const exported = core.serialize(model), imported = core.parse(exported);
  assert.equal(imported.rows[0].enabled, false);
  assert.equal(imported.rows[0].value, '1.4');
  assert.equal(core.serialize(imported), exported);
  imported.rows[0].enabled = true;
  assert.equal(core.serialize(imported), 'sensitivity "1.4" // Mouse | Souris\n');
});

test('export rejects line/quote injection, malformed numeric values and invalid keys', () => {
  for (const value of ['1,5', 'NaN', 'Infinity', '1e999', '1; quit', '"; quit', '1\nquit', '1\\']) {
    const model = core.parse('sensitivity "1.1"\n'); model.rows[0].value = value;
    assert.ok(core.errors(model).length, value); assert.throws(() => core.serialize(model));
    model.rows[0].enabled = false;
    assert.throws(() => core.serialize(model), 'Disabled rows cannot introduce executable lines either');
  }
  for (const key of ['scancode0', 'scancode287', 'MOUSE4;quit', 'two words', '"']) {
    const model = core.parse('bind scancode26 "+forward"\n'); model.rows[0].key = key;
    assert.ok(core.errors(model).length, key);
  }
  const model = core.parse('cl_crosshair_gap "0"\nsnd_mute_losefocus "false"\n');
  model.rows[0].value = '-2.5'; model.rows[1].value = '1'; assert.deepEqual(core.errors(model), []);
  model.rows[1].value = '2'; assert.equal(core.errors(model)[0].code, 'boolean');
});

test('duplicate commands and rebound keys are visible; disabled rows do not conflict', () => {
  const model = core.parse('sensitivity "1"\nsensitivity "2"\nbind MOUSE4 "drop"\nbind mouse4 "lastinv"\n');
  assert.deepEqual(core.duplicates(model), ['sensitivity', 'bind mouse4']);
  model.rows[1].enabled = false; model.rows[3].enabled = false;
  assert.deepEqual(core.duplicates(model), []);
});

test('physical keys map to the intended QWERTY/AZERTY positions', () => {
  assert.deepEqual(core.keyLabels('scancode26'), ['W', 'Z']);
  assert.deepEqual(core.keyLabels('scancode4'), ['A', 'Q']);
  assert.deepEqual(core.keyLabels('scancode20'), ['Q', 'A']);
  assert.deepEqual(core.keyLabels('scancode57'), ['Caps Lock', 'Verr. Maj']);
  assert.deepEqual(core.keyLabels('scancode68'), ['F11', 'F11']);
});

test('practice remains separate and enables cheats before protected settings', () => {
  const auto = fs.readFileSync(path.join(root, 'autoexec.cfg'), 'utf8');
  const practice = fs.readFileSync(path.join(root, 'pracc.cfg'), 'utf8');
  assert.doesNotMatch(auto, /^sv_cheats /m);
  assert.doesNotMatch(auto, /^host_writeconfig/m);
  assert.match(practice, /^god "1"/m);
  const commands = practice.split('\n').filter(line => line && !line.startsWith('//'));
  assert.match(commands[0], /^sv_cheats\s+"1"/);
  assert.ok(commands.findIndex(line => line.startsWith('bot_kick')) > commands.findIndex(line => line.startsWith('bot_stop')));
});

test('the offline editor embeds the exact canonical configuration files', () => {
  const sources = vm.runInNewContext(fs.readFileSync(path.join(root, 'editor/configs.js'), 'utf8') + '\nCONFIG_SOURCES');
  for (const filename of Object.keys(sources)) assert.equal(sources[filename], fs.readFileSync(path.join(root, filename), 'utf8'));
});
