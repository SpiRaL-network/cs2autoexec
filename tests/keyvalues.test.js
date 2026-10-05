'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {readKeyValues}=require('../studio/keyvalues');
test('KeyValues preserves duplicate entries, escapes, BOM, comments and quoted braces',()=>{
  assert.deepEqual(readKeyValues('\uFEFF// header\n"config" { /* note */ "convars" { "x" "a { b } // c" "x" "line\\nquote\\\"" "path" "C:\\unknown" } }'),[['config',[['convars',[['x','a { b } // c'],['x','line\nquote"'],['path','C:\\unknown']]]]]]);
});
test('KeyValues rejects incomplete, mismatched and excessively nested source files',()=>{
  for(const malformed of ['"config" {','"config" { "convars" }','"config" { "x" "unclosed','/* unclosed','}',Array(20).fill('"x" {').join('')+'"v" "1"'+'}'.repeat(20)])assert.throws(()=>readKeyValues(malformed));
});
