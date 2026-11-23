/* Sevilla browser integration suite for the EXISTING Apeverse CDP/PowerShell test runner.
   Must be run on an actual checkout with three.js, models, index.html and browser.
   This file has been syntax-checked offline but has NOT been run in Chrome here. */
window.APE_T = (() => {
  const steps = [], step = (name, fn, options) => steps.push(Object.assign({ name, fn }, options || {}));
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const until = async (fn, max) => { const started = Date.now(); while (Date.now() - started < (max || 15000)) { try { if (fn()) return true } catch (_) { /* awaiting world */ } await sleep(150) } return false };
  const $ = id => document.getElementById(id);
  const label = t => typeof t.label === 'function' ? t.label() : t.label;
  const target = re => AV.W.T.find(t => (!t.show || t.show()) && re.test(label(t)));
  const at = (x, z) => { AV.P.x = x; AV.P.z = z; AV.P.y = AV.W.surface(x, z) || 0; AV.P.vx = 0; AV.P.vz = 0 };
  const walk = pts => {
    const bad=[];
    for (let k=1; k<pts.length; k++) {
      const a=pts[k-1], b=pts[k], n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));
      for(let i=0;i<=n;i++){
        const t=i/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
        if(AV.W.surface(x,z)===null || !AV.isFree(AV.W,x,z,.3)) bad.push(x.toFixed(1)+','+z.toFixed(1));
      }
    }
    return bad;
  };
  step('boot', async c => {
    $('gq').value='Low'; $('bNew').click();
    c('start screen launches', await until(()=>AV.running && AV.W,45000));
    AV.save=()=>{}; AV.S.money=300;
    c('Sevilla registered as the only new playable world', AV.isPlayable('seville') && !AV.isPlayable('koh_tao') && !AV.isPlayable('paris'));
    AV.travel('seville');
    c('arrival via shared travel', await until(()=>AV.W && AV.W.id==='seville' && $('fade').style.opacity==='0',90000));
    c('spawn at Plaza Nueva arrival', Math.hypot(AV.P.x+116, AV.P.z+55)<5);
    c('no JS runtime failure',!$('err').textContent,$('err').textContent);
  });
  step('seven physical cross-district walk routes and bridges',async c=>{
    const plan=AV.agent4Seville;
    c('city layout and atlas',!!AV.W.mapNav && AV.W.mapRoads.length>=20 && AV.W.places.length>=14);
    c('Guadalquivir blocks walking',AV.W.surface(-247,0)===null);
    for(const b of [-110,250]) c('bridge z='+b,AV.W.surface(-247,b)!==null && AV.isFree(AV.W,-247,b,.3));
    for(const [name,pts] of Object.entries(plan.walkRoutes)){
      const bad=walk(pts);
      c(name, bad.length===0,bad.slice(0,5).join(' / '));
    }
  });
  step('five real doors and shop purchases',async c=>{
    for(const v of AV.agent4Seville.venues){
      const [x0]=v.r;
      const route=[[x0-2,v.door],[x0+.25,v.door],[x0+3.65,v.door]];
      const bad=walk(route);
      c(v.name[0]+' doorway and interior',bad.length===0,bad.join(' / '));
      const t=AV.W.T.find(t=>Math.abs(t.x-(x0+3.65))<.01&&Math.abs(t.z-v.door)<.01);
      c(v.id+' has shop target',!!t);
      if(!t)continue;
      at(t.x,t.z);t.fn();await sleep(350);
      const item=v.items[0][0], b=$('cmp').querySelector('[data-buy="'+item+'"]');
      c(v.id+' carries local merchandise',!!b);
      if(b){const money=AV.S.money;const count=AV.bag.count(item);b.click();await sleep(510);
        c(v.id+' debit and inventory',AV.bag.count(item)===count+1&&AV.S.money===money-v.items[0][1]);}
      AV.closeTop();await sleep(150);
    }
    c('no JS runtime failure',!$('err').textContent,$('err').textContent);
  });
  step('Feria toggle does not hide the normal city',async c=>{
    const toggle=target(/Begin Feria de Abril celebration/);
    c('Feria interactive toggle exists',!!toggle);
    if(!toggle)return;
    at(toggle.x,toggle.z);toggle.fn();await sleep(300);
    c('Feria active',AV.W.agent4.festival());
    c('Cathedral and normal shops still exist',!!AV.W.places.find(p=>p.id==='cathedral')&&!!target(/Taberna del Azahar/));
    toggle.fn();await sleep(100);
    c('Feria can be disabled',!AV.W.agent4.festival());
  });
  step('minimap, bicycle/scooter hooks, return portal',async c=>{
    c('minimap active',!!AV.minimap && !!AV.W.mapNav && AV.W.mapNav.links.some(a=>a.length));
    const rentals=(AV.act && AV.act.venues||[]).filter(v=>v.W===AV.W && v.type==='rental');
    c('bike and scooter rental registered through existing activity system',rentals.length>=2);
    const ret=target(/Portal to Ape Town/);
    c('return portal target',!!ret);
    if(ret){at(ret.x,ret.z);ret.fn();c('return to Ape Town',await until(()=>AV.W&&AV.W.id==='ape_town',45000));}
    c('no JS errors',!$('err').textContent,$('err').textContent);
  });
  step('Sevilla Santa Cruz screenshot',async c=>{
    AV.travel('seville');await until(()=>AV.W&&AV.W.id==='seville'&&$('fade').style.opacity==='0',90000);
    at(73,-55); AV.P.yaw=-Math.PI/2;AV.P.pitch=.12;AV.S.time=13*60;await sleep(5000);c('render requested',true);
  },{shot:'agent4_sevilla_santacruz'});
  step('Sevilla Guadalquivir and Triana screenshot',async c=>{
    at(-200,-112); AV.P.yaw=Math.PI/2; AV.P.pitch=.02;AV.S.time=17*60;await sleep(5000);c('render requested',true);
  },{shot:'agent4_sevilla_triana'});
  step('Sevilla Plaza de España screenshot',async c=>{
    at(73,408); AV.P.yaw=Math.PI;AV.P.pitch=.05;AV.S.time=12*60;await sleep(5000);c('render requested',true);
  },{shot:'agent4_sevilla_plaza_espana'});
  let active=[];
  return { names(mobile){active=steps.filter(s=>!!s.mobile===!!mobile||s.name==='boot');return active.map(s=>s.name);},
    async exec(i){const s=active[i],checks=[];const c=(n,pass,d)=>checks.push({n:s.name+': '+n,pass:!!pass,d:d==null?'':String(d)});
      try{await s.fn(c)}catch(e){checks.push({n:s.name+': exception',pass:false,d:String(e?.stack||e).slice(0,500)})}
      return {checks,shot:s.shot||null};}
  };
})();
