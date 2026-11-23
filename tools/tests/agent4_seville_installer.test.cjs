/* Ensure Agent 4 installer only edits index.html and is idempotent. */
'use strict';
const assert = require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'agent4-installer-'));
const installer=path.resolve(__dirname,'../apply_agent4_seville.mjs');
try {
  for(const p of ['data/agent4_worlds.js','js/agent4_seville_plan.js','js/world_seville.js']) {
    fs.mkdirSync(path.dirname(path.join(folder,p)),{recursive:true});
    fs.writeFileSync(path.join(folder,p),'/* isolated fixture */');
  }
  const original='<html>\n<script src="data/worlds.js"></script>\n<script src="js/core.js"></script>\n<script src="js/world_koh_samui_jurassic.js"></script>\n<script src="js/main.js"></script>\n</html>\n';
  fs.writeFileSync(path.join(folder,'index.html'),original);
  const run=(...args)=>cp.spawnSync(process.execPath,[installer,...args],{cwd:folder,encoding:'utf8'});
  const r=run();assert.equal(r.status,0,r.stderr);
  const first=fs.readFileSync(path.join(folder,'index.html'),'utf8');
  assert.equal(first.split('<script').length-1,7,'3 new script tags');
  assert(first.indexOf('agent4_worlds.js')>first.indexOf('data/worlds.js'));
  assert(first.indexOf('agent4_seville_plan.js')>first.indexOf('world_koh_samui_jurassic.js'));
  assert(first.indexOf('world_seville.js')>first.indexOf('agent4_seville_plan.js'));
  assert.equal(run('--check').status,0);
  assert.equal(run().status,0,'second install should not fail');
  assert.equal(fs.readFileSync(path.join(folder,'index.html'),'utf8'),first,'installer is idempotent');
  const body=first.replace(/<script src="(?:data\/agent4_worlds\.js|js\/agent4_seville_plan\.js|js\/world_seville\.js)"><\/script>\n/g,'');
  assert.equal(body,original,'only added 3 script tags; existing content unchanged');
  console.log('PASS: isolated index.html install + --check + idempotence + preserving original scripts.');
} finally {fs.rmSync(folder,{recursive:true,force:true})}
