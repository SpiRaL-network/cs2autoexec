'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

test('Windows installer preserves old files and rejects the wrong destination', {skip:process.platform !== 'win32'}, () => {
  const base = path.join(root, 'work'); fs.mkdirSync(base, {recursive:true});
  const fixture = fs.mkdtempSync(path.join(base, 'installer-test-'));
  const cfg = path.join(fixture, 'game/csgo/cfg'); fs.mkdirSync(cfg, {recursive:true});
  fs.writeFileSync(path.join(cfg, 'autoexec.cfg'), 'previous autoexec');
  fs.writeFileSync(path.join(cfg, 'pracc.cfg'), 'previous practice');
  const run = destination => spawnSync('powershell.exe', ['-NoProfile', '-File', path.join(root, 'install.ps1'), '-CfgPath', destination, '-NoPause'], {encoding:'utf8'});
  try {
    const result = run(cfg); assert.equal(result.status, 0, result.stderr);
    for (const file of ['autoexec.cfg', 'pracc.cfg']) assert.deepEqual(fs.readFileSync(path.join(cfg, file)), fs.readFileSync(path.join(root, file)));
    const backups = fs.readdirSync(cfg).filter(name => name.startsWith('cs2autoexec-backup-'));
    assert.equal(backups.length, 1);
    assert.equal(fs.readFileSync(path.join(cfg, backups[0], 'autoexec.cfg'), 'utf8'), 'previous autoexec');
    assert.equal(fs.readFileSync(path.join(cfg, backups[0], 'pracc.cfg'), 'utf8'), 'previous practice');
    const rejected = run(fixture); assert.notEqual(rejected.status, 0);
    assert.equal(fs.existsSync(path.join(fixture, 'autoexec.cfg')), false);
    const missing = run(path.join(fixture, 'missing')); assert.notEqual(missing.status, 0);
    assert.equal(fs.existsSync(path.join(fixture, 'missing')), false);
  } finally {
    const resolved = fs.realpathSync(fixture), allowed = fs.realpathSync(base) + path.sep;
    assert.ok(resolved.startsWith(allowed), 'Fixture cleanup must stay inside the test workspace');
    fs.rmSync(resolved, {recursive:true, force:true});
  }
});
