#!/usr/bin/env node
/* One-purpose, idempotent installer that modifies ONLY index.html script tags.
   Run in the root of a checkout of 0jc1/multi-verse after copying Agent 4 files.
   --check verifies integration without changing files. */
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const html=path.join(root,'index.html');
if(!fs.existsSync(html))throw new Error('Run from the Apeverse repository root (index.html missing).');
const inputs=[
  {after:'data/worlds.js',file:'data/agent4_worlds.js'},
  {after:'js/world_koh_samui_jurassic.js',file:'js/agent4_seville_plan.js'},
  {after:'js/agent4_seville_plan.js',file:'js/world_seville.js'},
];
const check=process.argv.includes('--check');
let source=fs.readFileSync(html,'utf8');
for(const {after,file} of inputs){
  if(!fs.existsSync(path.join(root,file)))throw new Error('Missing required Agent 4 file: '+file);
  const newTag=`<script src="${file}"></script>`;
  if(source.includes(newTag)){
    if(source.split(newTag).length!==2)throw new Error('Duplicate script tag: '+file);
    console.log('Already integrated: '+file);continue;
  }
  if(check)throw new Error('Not integrated yet: '+file+'; run node tools/apply_agent4_seville.mjs');
  const needle=`<script src="${after}"></script>`;
  if(source.split(needle).length!==2)throw new Error('Missing or ambiguous insertion anchor: '+after);
  source=source.replace(needle,needle+'\n'+newTag);
  console.log('Integrated: '+file);
}
const indices=inputs.map(({file})=>source.indexOf(`<script src="${file}"></script>`));
if(indices.some(i=>i<0)||!(indices[0]<indices[1]&&indices[1]<indices[2]))throw new Error('Agent 4 tags out of order');
if(!check)fs.writeFileSync(html,source);
console.log(check?'PASS: Agent 4 script integration valid.':'PASS: index.html updated with three additive Agent 4 script tags.');
