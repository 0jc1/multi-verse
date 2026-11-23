/* Agent 4 independent offline geometry/logic regression suite.
   Mock scene graph does NOT replace browser-based visual QA. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const quality = Number(process.env.APEVERSE_AGENT4_Q || 0);
assert(Number.isInteger(quality) && quality>=0 && quality<=2, 'quality must be 0..2');
class Obj {
  constructor() { this.children = []; this.position = {x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z}}; this.rotation = {x:0,y:0,z:0}; this.scale = {x:1,y:1,z:1,set(x,y,z){this.x=x;this.y=y;this.z=z}}; this.material = {userData:{}}; this.userData = {}; this.visible = true; }
  add(obj) { this.children.push(obj); obj.parent = this; }
}
const THREE = { Group: Obj, Mesh: Obj, PointLight: Obj, PlaneGeometry: class {}, SphereGeometry: class {}, ConeGeometry: class {}, RingGeometry: class {}, CanvasTexture: class {}, MeshStandardMaterial: class { constructor(){this.userData={}} }, MeshBasicMaterial: class {constructor(){this.userData={}}}, sRGBEncoding: 3001, DoubleSide: 2 };
const report = [];
let batchParts = 0, drawn=0, npcCount=0, trafficCount=0, crowdCount=0;
const worldDefinitions = {};
const listeners = {};
const AV = {
  ITEMS: {water:{n:['Water','Agua'],cat:'drink',ic:'💧',use:'drink',price:3}},
  WORLDS_DATA: [{id:'ape_town',name:'Ape Town'}],
  S: {agent4:{},set:{gq:['Low','Medium','High'][quality]},money:150},
  tr: (a)=>a,
  kit: {
    BG: {box:{},cyl:{},sph:{},ico:{}}, M: (...a)=>a, floraMat: ()=>({}),
    batch: ()=>({ add(){batchParts++;},flush(){drawn++;} }),
    merge: ()=>({}), waterPlane: (ctx)=>{const obj=new Obj();ctx.group.add(obj);return obj;}
  },
  std:()=>({}),
  rng:(seed)=>{ let x=seed >>> 0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/2**32;}},
  city: {
    nav:(nodes, edges)=>({nodes,links:nodes.map((_,i)=>edges.filter(e=>e.includes(i)).map(e=>e[0]===i?e[1]:e[0])),edges}),
    crowd:()=>({add(){crowdCount++}}),
    traffic:(ctx,loops,spec)=>{trafficCount+=spec.reduce((s,i)=>s+i.n,0)}
  },
  beings: {spawn:(ctx,specs)=>{npcCount=specs.length;return []}},
  act: {PLACES:{}},
  amb:null, audio:null,
  registerWorld:def=>{if(worldDefinitions[def.id]) throw new Error('duplicate world');worldDefinitions[def.id]=def;},
  save:()=>{}, toast:msg=>report.push(msg),
  travel:()=>true,
  shop:{open:()=>{AV.lastShopOpened=true;}},
  talk:{open:()=>{AV.lastTalkOpened=true;}},
};
const sandbox = {AV, THREE, console, Math, Object, Array, Map, Set, Infinity,
  window:null,
  document:{createElement:()=>({width:0,height:0,getContext:()=>({fillStyle:'',strokeStyle:'',font:'',lineWidth:1,fillRect(){},strokeRect(){},fillText(){},measureText(s){return {width:s.length*18}}})})},
  addEventListener:(name,fn)=>{listeners[name]=listeners[name]||[];listeners[name].push(fn)},
};
sandbox.window=sandbox;
vm.createContext(sandbox);
const load=fn=>vm.runInContext(fs.readFileSync(path.join(root,fn),'utf8'),sandbox,{filename:fn});
load('data/agent4_worlds.js');
load('js/agent4_seville_plan.js');
load('js/world_seville.js');
const P=AV.agent4Seville;
assert.equal(AV.WORLDS_DATA.length,10);
assert.deepEqual(AV.WORLDS_DATA.filter(x=>x.status==='planned').map(x=>x.id).length,8);
assert.deepEqual(Object.keys(worldDefinitions), ['seville']);
assert.equal(P.surface(-247,0),null,'river is not walkable outside bridges');
assert.equal(P.surface(-247,-110),0,'first bridge has traversable ground');
assert.equal(P.surface(-247,250),0,'second bridge has traversable ground');
assert.equal(P.surface(-800,-200),null);
const ctx={id:'seville',q:quality,seed:43,group:new Obj(),cols:[],circles:[],T:[],upd:[],leave:[],rng:AV.rng(43),
  mk:()=>new Obj(),
  wall(x0,x1,z0,z1,y0,y1,material,collider=true){if(y0<1.2&&collider!==false)this.cols.push([x0,x1,z0,z1]);return new Obj();}
};
const W=worldDefinitions.seville.build(ctx);
assert.equal(W.name, 'Sevilla · development preview');
assert(W.mapRoads.length>18);
assert(W.mapDistricts.every(d=>typeof d.name==='string' && Number.isFinite(d.x) && Number.isFinite(d.z)), 'Atlas district labels require finite centre coordinates and plain text');
assert(W.places.length>12);
assert.equal(W.agent4.venues,5);
assert(batchParts>600,'3D world should include hundreds of architectural/vegetation parts');
assert(drawn>0);
assert(npcCount>=5);
assert(trafficCount>=3);
assert(crowdCount>=8);
assert(W.arrivals.pipe);
const free=(x,z,m=.35)=>{
  if(W.surface(x,z)===null)return false;
  if(ctx.cols.some(c=>x>c[0]-m&&x<c[1]+m&&z>c[2]-m&&z<c[3]+m))return false;
  if(ctx.circles.some(c=>Math.hypot(x-c[0],z-c[1])<c[2]+m))return false;
  return [[1,0],[-1,0],[0,1],[0,-1]].every(([dx,dz])=>W.surface(x+dx*m,z+dz*m)!==null);
};
const blocked=[];
for(const [label, route] of Object.entries(P.walkRoutes)){
  for(let k=1;k<route.length;k++){
    const a=route[k-1],b=route[k],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));
    for(let j=0;j<=n;j++){
      const t=j/n, x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
      if(!free(x,z)) { blocked.push({route:label,x:+x.toFixed(1),z:+z.toFixed(1)});break; }
    }
  }
}
assert.equal(blocked.length,0,'all documented walking routes must be collision-free: '+JSON.stringify(blocked.slice(0,20)));
// Real wall gaps, counter positions and purchase target within a traversable room.
for(const v of P.venues){
  const x=v.r[0],z=v.door;
  for(const px of [x-2,x-.5,x+.25,x+2,x+3.65]) {
    assert(free(px,z,.3),`blocked shop doorway/interior: ${v.id} at ${px},${z}`);
  }
  const t=ctx.T.find(t=>Math.abs(t.x-(x+3.65))<.01&&Math.abs(t.z-z)<.01);
  assert(t, 'shop purchase interaction missing: '+v.id);
  t.fn();assert.equal(AV.lastShopOpened,true);AV.lastShopOpened=false;
  const staff=ctx.T.find(t=>typeof t.label==='function'&&t.label().includes(v.staff));
  assert(staff,'staff NPC dialog missing for '+v.id);
}
assert(W.mapNav && W.mapNav.nodes.length>8 && W.mapNav.edges.length>7, 'atlas needs connected navigation edges');
const visit = new Set([0]), todo=[0];
while(todo.length){const n=todo.shift();for(const link of W.mapNav.links[n]) if(!visit.has(link)){visit.add(link);todo.push(link);}}
assert.equal(visit.size,W.mapNav.nodes.length,'all navigation points must be connected to a single walkable city graph');
const fest=ctx.T.find(t=>String(t.label()).includes('Begin Feria de Abril'));
assert(fest,'Feria mode toggle missing');
assert.equal(W.agent4.festival(), false);
const countBeforeFeria=ctx.cols.length;
fest.fn();assert.equal(W.agent4.festival(),true);
assert(ctx.cols.length>countBeforeFeria+50,'Feria walls must gain REAL colliders, not remain walk-through props');
assert(free(-402.5,430,.3),'walkable aisle between open casetas during Feria');
for (const z of [390,394,399]) assert(free(-394,z,.3),'player must be able to enter a caseta through its open front');
const feriaShop=ctx.T.find(t=>String(t.label()).includes('Buy Feria refreshments'));
assert(feriaShop && feriaShop.show(),'Feria has an actual accessible vendor only in festival mode');
feriaShop.fn();assert(AV.lastShopOpened,'festival vendor uses working shop system');
AV.lastShopOpened=false;
assert(ctx.T.find(t=>String(t.label()).includes('Join a sevillanas dance')).show(),'Feria dance activity is available');
fest.fn();assert.equal(W.agent4.festival(),false);
assert.equal(ctx.cols.length,countBeforeFeria,'festival colliders removed when normal city returns');
assert(!feriaShop.show(),'festival stall not active outside celebration');
assert(ctx.T.some(t=>String(t.label()).includes('Portal to Ape Town')));
listeners.load?.forEach(fn=>fn());
assert(AV.act.PLACES.seville.some(v=>v.kind==='bicycle'));
assert(AV.act.PLACES.seville.some(v=>v.kind==='scooter'));
console.log(`PASS: metadata for 9 destinations; Sevilla graphics preset ${['Low','Medium','High'][quality]}, ${batchParts} batched geometry parts, ${ctx.cols.length} rect colliders, ${ctx.circles.length} trees/posts, ${npcCount} NPCs, ${trafficCount} simulated vehicles, ${crowdCount} background crowd; 5 enterable businesses; 7 long walking routes; map/portal/festival/transport hooks.`);
console.log('NOTE: static mocked scene tests only. Chrome rendering, actual input, mobile FPS and visuals NOT tested.');
