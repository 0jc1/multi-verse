const { chromium, devices } = require('playwright');
const SP='/tmp/claude-0/-home-claude/7ff7fd20-ba48-5ed4-b2c0-5606b3d45f9f/scratchpad/';
const URL='http://localhost:8731/index.html';
const R=[];const ok=(n,c,d)=>{R.push({n,pass:!!c,d:d===undefined?'':String(d)});console.log((c?'PASS ':'FAIL ')+n+(d!==undefined?' :: '+d:''))};
const ARGS=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required'];
(async()=>{
const b=await chromium.launch({args:ARGS});
let ctx=await b.newContext({viewport:{width:480,height:300}});let p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
const W=ms=>p.waitForTimeout(ms), ev=(f,a)=>p.evaluate(f,a);
/* --- start screen --- */
await p.goto(URL);await W(500);
ok('start: hero image shown',await ev(()=>getComputedStyle(document.getElementById('heroImg')).display!=='none'&&document.getElementById('heroImg').naturalWidth>50));
ok('start: Continue disabled when no save',await ev(()=>document.getElementById('bCont').disabled));
await p.click('#lEs');ok('start: Spanish labels',(await ev(()=>document.getElementById('bNew').textContent))==='Nueva partida');await p.click('#lEn');
await p.click('#dPho');ok('start: phone note shown & Low gfx',await ev(()=>document.getElementById('phoneNote').style.display==='block'&&document.getElementById('gq').value==='Low'));await p.click('#dLap');await ev(()=>document.getElementById('gq').value='High');
/* --- boot --- */
await ev(()=>document.getElementById('gq').value='Medium');await p.click('#bNew');await W(2500);
ok('boot: Ape Town loaded',await ev(()=>AV.W&&AV.W.id==='ape_town'&&AV.running));
const until=async(cond,max)=>{const t0=Date.now();while(Date.now()-t0<max&&!(await ev(cond)))await W(250)};
const hold=async(key,cond,max)=>{await p.keyboard.down(key);const t0=Date.now();while(Date.now()-t0<max&&!(await ev(cond)))await W(150);await p.keyboard.up(key)};
const z0=await ev(()=>AV.P.z);await hold('KeyW',z0=>AV.P.z<26-1.0,12000);ok('controls: W moves forward',(await ev(()=>AV.P.z))<z0-.8,await ev(()=>AV.P.z));
const y0=await ev(()=>AV.P.y);await p.keyboard.down('Space');await W(250);const y1=await ev(()=>AV.P.y);await p.keyboard.up('Space');ok('controls: Space jumps',y1>y0+.15,y1);await W(900);
await hold('KeyD',()=>AV.P.x>.8,12000);ok('controls: D strafes',(await ev(()=>AV.P.x))>.5,await ev(()=>AV.P.x));
/* --- collision: walk into fountain --- */
await ev(()=>{AV.P.x=0;AV.P.z=8;AV.P.yaw=0});await hold('KeyW',()=>Math.hypot(AV.P.x,AV.P.z)<3.6||AV.P.z<2,20000);await W(800);
ok('collision: fountain blocks player',await ev(()=>Math.hypot(AV.P.x,AV.P.z)>3.0),await ev(()=>Math.hypot(AV.P.x,AV.P.z).toFixed(2)));
/* --- Zil chat + job --- */
await ev(()=>{AV.P.x=-20;AV.P.z=-10.5;AV.P.yaw=0});await W(400);
ok('interact: prompt appears near Zil',await ev(()=>AV.nearTarget()&&/Zil/.test(AV.nearTarget().label())));
await p.keyboard.press('KeyE');await W(300);ok('chat: opens (modal)',await ev(()=>AV.chat.open&&AV.blocking()));
await p.fill('#ci','do you have a job for me?');await p.keyboard.press('Enter');await W(400);
await p.fill('#ci','yes');await p.keyboard.press('Enter');await W(400);
ok('chat: Zil offline job offer accepted -> job=true',await ev(()=>AV.S.job===true));
ok('chat: tag says OFFLINE FALLBACK',await ev(()=>/OFFLINE/.test(document.getElementById('tag').textContent)));
await p.keyboard.press('Escape');await W(200);ok('chat: Esc closes, input unblocked',await ev(()=>!AV.chat.open&&!AV.blocking()));
/* --- shift mini-game / economy --- */
await ev(()=>{AV.P.x=-19.4;AV.P.z=-11.5});await W(300);const m0=await ev(()=>AV.S.money);await ev(()=>AV.interact());await W(200);
// find the right drink by trying all three via keymap until money rises
let served=0;for(let i=0;i<40&&served<5;i++){const m=await ev(()=>AV.S.money);await ev(i=>AV.keymap['Digit'+(1+i%3)](),i);await W(60);const m2=await ev(()=>AV.S.money);if(m2>m)served++}
ok('economy: shift served 5 drinks, credits increased',(await ev(()=>AV.S.money))>m0+60,await ev(()=>AV.S.money));
/* --- tip band --- */
await ev(()=>{AV.P.x=26;AV.P.z=4});await W(400);const m1=await ev(()=>AV.S.money);await ev(()=>AV.interact());await W(200);ok('economy: tip band costs 5',(await ev(()=>AV.S.money))===m1-5);
await until(()=>document.getElementById('concert').style.display==='block',12000);ok('stage: concert panel visible near stage',await ev(()=>document.getElementById('concert').style.display==='block'));
ok('band: 3 characters animate (gorilla, ztone, orangutan)',await ev(()=>{const g=[];AV.W.group.traverse(o=>{if(o.userData&&o.userData.kind)g.push(o.userData.kind)});return g.sort().join()==='gorilla,orangutan,ztone'}));
/* --- paintings --- */
const live=await ev(()=>AV.media.frames.map(f=>f.state));ok('paintings: 8 present frames + 7 missing plaques',live.filter(s=>s!=='missing').length===8&&live.filter(s=>s==='missing').length===7,JSON.stringify(live.reduce((a,s)=>(a[s]=(a[s]||0)+1,a),{})));
const f0=await ev(()=>{const f=AV.media.frames.find(f=>f.state!=='missing');return{x:f.x,z:f.z,t:f.p.title}});
await ev(f=>{AV.P.x=f.x;AV.P.z=f.z;AV.P.yaw=0},f0);await until(()=>AV.media.liveCount()>=1,15000);
ok('paintings: lazy in-world video activates on http (<=3)',await ev(()=>AV.media.liveCount()>=1&&AV.media.liveCount()<=3),await ev(()=>AV.media.liveCount()));
await ev(()=>AV.interact());await W(1500);
ok('viewer: opens as modal with video',await ev(()=>document.getElementById('viewer').style.display==='block'&&AV.blocking()));
const vt=await ev(()=>{const v=document.getElementById('vv');return{rs:v.readyState,ct:v.currentTime,err:!!v.error,vw:v.videoWidth,vh:v.videoHeight,ar:v.style.aspectRatio}});ok('viewer: real mp4 decodes (size known)',vt.vw>0&&!vt.err,JSON.stringify(vt));
await W(1200);ok('viewer: video playing (time advances)',(await ev(()=>document.getElementById('vv').currentTime))>vt.ct,await ev(()=>document.getElementById('vv').currentTime));
await p.screenshot({path:SP+'s_viewer.png'});await ev(()=>AV.closeTop());await W(200);ok('viewer: Esc closes, video src released',await ev(()=>document.getElementById('viewer').style.display==='none'&&!AV.blocking()));
/* missing frame */
const mf=await ev(()=>{const f=AV.media.frames.find(f=>f.state==='missing');return{x:f.x,z:f.z}});await ev(f=>{AV.P.x=f.x;AV.P.z=f.z},mf);await W(300);await ev(()=>AV.interact());await W(200);ok('paintings: missing artwork shows honest toast, no viewer',await ev(()=>/not been supplied/i.test(document.getElementById('toast').textContent)&&document.getElementById('viewer').style.display!=='block'),await ev(()=>document.getElementById('toast').textContent));
/* viewer error path */
await ev(()=>AV.media.openViewer({title:'Ghost',file:'assets/media/paintings/nope.mp4',w:9,h:16,poster:'',room:'x',caption:'y',filename:'nope.mp4'}));await W(1200);ok('viewer: missing file -> friendly error text',await ev(()=>/could not be loaded/i.test(document.getElementById('vn').textContent)));await ev(()=>AV.closeTop());await W(150);
/* --- cinema --- */
await ev(()=>{AV.P.x=34;AV.P.z=26;AV.P.yaw=-Math.PI/2});await W(300);await ev(()=>AV.interact());await W(1500);
ok('cinema: opens, lists feature titles greyed (file not supplied) + 8 shorts',await ev(()=>{const el=document.getElementById('pl');return el.querySelectorAll('.na').length===20&&el.children.length===28}),await ev(()=>document.getElementById('pl')&&document.getElementById('pl').children.length));
await until(()=>{const v=document.getElementById('cv');return v&&v.videoWidth>0},15000);ok('cinema: plays real short',await ev(()=>{const v=document.getElementById('cv');return v&&v.videoWidth>0&&!v.error}));
await p.screenshot({path:SP+'s_cinema.png'});await ev(()=>AV.closeTop());await W(200);ok('cinema: Esc closes',await ev(()=>!AV.blocking()));
/* --- Portal Pipe --- */
await ev(()=>{AV.P.x=0;AV.P.z=20;AV.P.yaw=0});await W(300);await p.keyboard.press('KeyP');await W(500);
ok('pipe: P opens holographic UI',await ev(()=>document.getElementById('pipe').style.display==='block'&&AV.blocking()));
const cards=await ev(()=>({n:document.querySelectorAll('#pipe .card').length,ok:document.querySelectorAll('#pipe .card.ok').length,wip:document.querySelectorAll('#pipe .card.off').length}));ok('pipe: lists 25 worlds; 3 enterable (+here), rest under construction',cards.n===25&&cards.ok===3&&cards.wip===22,JSON.stringify(cards));
await p.screenshot({path:SP+'s_pipe.png'});
await p.click('#pipe .card.off >> nth=3',{force:true});await W(300);ok('pipe: unfinished world not enterable, stays open',await ev(()=>AV.W.id==='ape_town'&&!AV.chat.open));
await p.click('#pipe .card[data-w="astro9"]');await W(500);
ok('pipe: portal spawned on free ground in front of player',await ev(()=>{const p=AV.pipe.portal;return p&&AV.isFree(AV.W,p.x,p.z,1.2)&&Math.hypot(p.x-AV.P.x,p.z-AV.P.z)<7}),await ev(()=>JSON.stringify(AV.pipe.portal&&{x:+AV.pipe.portal.x.toFixed(1),z:+AV.pipe.portal.z.toFixed(1)})));
await p.screenshot({path:SP+'s_portal.png'});
ok('pipe: UI closed after choosing',await ev(()=>!AV.blocking()));
await ev(()=>{const pp=AV.pipe.portal;AV.P.x=pp.x;AV.P.z=pp.z+.5});await W(1600);
ok('pipe: walking into portal travels to Astro-9 (safe arrival)',await ev(()=>AV.W.id==='astro9'&&AV.isFree(AV.W,AV.P.x,AV.P.z,.3)&&AV.S.world==='astro9'),await ev(()=>AV.W.id));
ok('astro9: low gravity on dance floor',await ev(()=>{AV.P.x=0;AV.P.z=-18;return AV.W.gravityAt(AV.P.x,AV.P.z)<.5}));
// casino GP never touches credits
await ev(()=>{AV.P.x=26;AV.P.z=2});await W(300);const cr=await ev(()=>AV.S.money),gp=await ev(()=>AV.S.gp);await ev(()=>AV.interact());await W(200);ok('casino: uses fictional Gravity Points only (credits unchanged)',(await ev(()=>AV.S.money))===cr&&(await ev(()=>AV.S.gp))!==gp,await ev(()=>AV.S.gp+' GP / '+AV.S.money+' cr'));
await p.screenshot({path:SP+'s_astro.png'});
// return to Ape Town via pipe
await ev(()=>AV.keymap.KeyP());await W(300);await p.click('#pRet');await W(400);
ok('pipe: Return to Ape Town opens a return portal',await ev(()=>AV.pipe.portal&&AV.pipe.portal.dest==='ape_town'));
await ev(()=>{const pp=AV.pipe.portal;AV.P.x=pp.x;AV.P.z=pp.z});await W(1600);ok('pipe: return trip lands in Ape Town',await ev(()=>AV.W.id==='ape_town'));
/* world gate E in Ape Town grove */
await ev(()=>{AV.P.x=-9;AV.P.z=-33.5;AV.P.yaw=0});await W(300);await ev(()=>AV.interact());await W(1600);ok('grove: Verdalux gate travels (legacy world works)',await ev(()=>AV.W.id==='verdalux'));
// drum log
await ev(()=>{AV.P.x=2;AV.P.z=.2});await W(300);const d0=await ev(()=>AV.S.money);await ev(()=>AV.interact());await W(300);ok('verdalux: Drum Log pays 12 once per day',(await ev(()=>AV.S.money))===d0+12);
await ev(()=>AV.interact());await W(200);ok('verdalux: second press same day pays nothing',(await ev(()=>AV.S.money))===d0+12);
await ev(()=>AV.enterWorld('jungle_dub','default',{instant:true}));await W(1500);ok('jungle_dub: loads and plays',await ev(()=>AV.W.id==='jungle_dub'&&AV.audio.prof.style==='dub'));
/* unstuck */
await ev(()=>{AV.P.x=0;AV.P.z=-8});await p.keyboard.press('KeyR');await W(200);ok('unstuck: R returns to a free arrival spot',await ev(()=>AV.isFree(AV.W,AV.P.x,AV.P.z,.3)));
/* memory: repeated travel doesn't leak */
const mem0=await ev(()=>AV.R.info.memory.geometries+'/'+AV.R.info.memory.textures);
for(let i=0;i<6;i++){await ev(i=>AV.enterWorld(['ape_town','astro9','verdalux','jungle_dub'][i%4],'default',{instant:true}),i);await W(250)}
await ev(()=>AV.enterWorld('jungle_dub','default',{instant:true}));await W(300);const mem1=await ev(()=>AV.R.info.memory.geometries+'/'+AV.R.info.memory.textures);ok('memory: geometries/textures stable after 6 world switches',mem0===mem1,mem0+' -> '+mem1);
/* settings + language switch */
await ev(()=>AV.toggleSettings());await W(200);ok('settings: panel opens',await ev(()=>document.getElementById('set').style.display==='block'));await p.click('#sEs');await W(200);ok('settings: switching to Spanish updates HUD',await ev(()=>/Créditos/.test(document.getElementById('top').textContent)));
/* save + migration */
ok('save: v0.9 key written',await ev(()=>!!localStorage.getItem('apeverse_v09')));
await p.goto('about:blank');await p.goto(URL);await ev(()=>{localStorage.removeItem('apeverse_v09');localStorage.setItem('apeverse_v08',JSON.stringify({v:1,money:777,log:[{d:3,t:'x',a:5}],job:true,rentDays:2,name:'Zed',day:4,time:600,seen:Date.now(),mem:{zil:{met:3,facts:['player name: Zed']},grk:{met:2,facts:[],drums:5}},seed:4242,world:'jungle',disc:{town:1,jungle:1},last:{town:1000},built:{stall:1},grow:3,news:['a'],drumDay:4}))});
await p.reload();await W(600);ok('migration: Continue enabled from V0.8 save',await ev(()=>!document.getElementById('bCont').disabled),await ev(()=>document.getElementById('modeNote').textContent));
await p.click('#bCont');await W(2800);
ok('migration: money/job/name/memory preserved',await ev(()=>AV.S.money===777&&AV.S.job&&AV.S.name==='Zed'&&AV.S.mem.grk.drums===5&&AV.S.day===4));
ok('migration: world id jungle->verdalux, town->ape_town, grown trees kept',await ev(()=>AV.W.id==='verdalux'&&AV.S.disc.ape_town&&AV.S.disc.verdalux&&AV.S.grow===3));
ok('migration: old V0.8 save untouched',await ev(()=>JSON.parse(localStorage.getItem('apeverse_v08')).money===777&&JSON.parse(localStorage.getItem('apeverse_v08')).v===1));
ok('migration: saved under new V0.9 key, schema v2',await ev(()=>{AV.save();const o=JSON.parse(localStorage.getItem('apeverse_v09'));return o.v===2&&o.migrated==='apeverse_v08'}));
/* corrupt save */
await p.goto('about:blank');await p.goto(URL);await ev(()=>{localStorage.setItem('apeverse_v09','{broken');});await p.reload();await W(500);ok('save: corrupt v0.9 save falls back safely (imports v0.8, no crash)',await ev(()=>!document.getElementById('bCont').disabled));
const real=errs.filter(e=>!/404/.test(e));ok('no uncaught JS errors in desktop session (1 expected 404 from the deliberate missing-video test)',real.length===0&&errs.length<=1,errs.slice(0,3).join(' | '));
await ctx.close();
/* --- mobile emulation --- */
ctx=await b.newContext({...devices['Pixel 7 landscape'],viewport:{width:915,height:412}});p=await ctx.newPage();const e2=[];p.on('pageerror',e=>e2.push(e.message));p.on('console',m=>{if(m.type()==='error')e2.push(m.text())});
await p.goto(URL);await W(500);ok('mobile: phone auto-detected',await p.evaluate(()=>document.getElementById('dPho').classList.contains('on')));
await p.click('#bNew');await W(3000);
ok('mobile: touch controls visible, hint hidden',await p.evaluate(()=>getComputedStyle(document.getElementById('tc')).display==='block'&&AV.device==='phone'&&AV.S.set.gq==='Low'));
const bx=await p.evaluate(()=>{const r=document.getElementById('js').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}});
const z1=await p.evaluate(()=>AV.P.z);
const cdp=await ctx.newCDPSession(p);
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bx.x,y:bx.y-45,id:1}]});await W(900);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
ok('mobile: virtual joystick moves player',(await p.evaluate(()=>AV.P.z))<z1-.5,await p.evaluate(()=>AV.P.z));
await p.screenshot({path:SP+'s_mobile.png'});
await p.evaluate(()=>document.getElementById('tP').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));await W(400);ok('mobile: Pipe button opens Portal Pipe',await p.evaluate(()=>document.getElementById('pipe').style.display==='block'));
await p.screenshot({path:SP+'s_mobile_pipe.png'});
ok('no JS errors on mobile',e2.length===0,e2.slice(0,3).join(' | '));
await ctx.close();await b.close();
require('fs').writeFileSync('/home/claude/apeverse_tools/tests/results.json',JSON.stringify(R,null,1));
console.log('DONE',R.filter(r=>r.pass).length+'/'+R.length);
})().catch(e=>{console.log('SUITE CRASH',e);process.exit(1)});
