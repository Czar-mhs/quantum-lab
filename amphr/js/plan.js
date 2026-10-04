// ---- Floor plan with defects
const SEV={critical:['Critical','var(--r)',28],high:['High','var(--o)',46],medium:['Medium','var(--y)',66],low:['Low','var(--g)',88]};
const sevHex={critical:'#f87171',high:'#fb923c',medium:'#fbbf24',low:'#34d399'};
let pb=null,plv=null,gpr=true,selD=null,placing=false,draft=null,vz=1,vcx=500,vcy=350,moved=false,drag=null;
const lvl=n=>'Level '+String(n).padStart(2,'0');
const detLabel=t=>{const n=Math.round((today()-new Date(t).getTime())/DAY);return n<=0?'Today':n===1?'Yesterday':t};
const zoneOf=x=>x<350?'A':x<650?'B':'C';
function planInit(){
 if(!S.buildings.find(b=>b.id===pb)){const c={};S.spots.forEach(d=>c[d.b]=(c[d.b]||0)+1);
  const best=S.buildings.map(b=>[b,c[b.id]||0]).sort((a,z)=>z[1]-a[1])[0];pb=best?best[0].id:null;plv=null}
 const ds=S.spots.filter(d=>d.b===pb);
 if(plv==null)plv=ds.length?ds[0].level:1;
}
function planPage(){
 planInit();
 if(pb==null)return head('Floor plan','Add a building first');
 const b=S.buildings.find(x=>x.id===pb),n=Math.min(b.floors,80);
 const lv=new Set(Array.from({length:n},(_,i)=>i+1));S.spots.filter(d=>d.b===pb).forEach(d=>lv.add(d.level));
 return head('Floor plan','Defect locations and severity · tap a pin for details',
  `<div class="actions" style="margin:0"><button class="btn ${placing?'or':'pri'}" onclick="togglePlace()">${placing?'Tap the plan to place pin…':'+ New spot'}</button></div>`)+
 `<div class="tools"><select style="flex:1;min-width:200px;max-width:320px" onchange="pb=+this.value;plv=null;selD=null;placing=false;draft=null;resetView();render()">${S.buildings.map(x=>`<option value="${x.id}" ${x.id===pb?'selected':''}>${esc(x.name)}</option>`).join('')}</select>
  <select style="width:150px" onchange="plv=+this.value;selD=null;placing=false;draft=null;resetView();planDraw()">${[...lv].sort((a,z)=>a-z).map(l=>`<option value="${l}" ${l===plv?'selected':''}>${lvl(l)}</option>`).join('')}</select>
  <div class="legend" style="margin-left:auto">${Object.entries(SEV).map(([k,v])=>`<span><s style="background:${v[1]}"></s>${v[0]}</span>`).join('')}</div></div>
  <div id="pl"></div>`;
}
function planDraw(){
 const el=document.getElementById('pl');if(!el)return;
 const ds=S.spots.filter(d=>d.b===pb&&d.level===plv&&d.x!=null);
 const sd=ds.find(d=>d.id===selD)||null;
 const walls=[[330,140,330,300],[560,60,560,300],[740,60,740,300],[330,300,620,300],[690,300,900,300],[130,400,430,400],[430,400,430,640],[130,520,300,520],[620,400,900,400],[620,400,620,640],[780,520,900,520]];
 const blobs=[[430,200,120,.55],[560,330,140,.6],[520,470,170,.7],[300,520,150,.45],[790,200,110,.4],[700,560,130,.5],[240,330,110,.4],[820,470,100,.35]];
 const PIN='M0 0C-10-14-17-22-17-31a17 17 0 1 1 34 0C17-22 10-14 0 0Z';
 const pinSvg=d=>`<g class="pin ${d.id===selD?'sel':''}" transform="translate(${d.x} ${d.y})" onclick="pickD(${d.id})" style="${d.status==='Resolved'?'opacity:.45':''}">
  <circle class="ring2" cx="0" cy="-30" r="14" stroke="${sevHex[d.sev]}"/>
  <path d="${PIN}" fill="${sevHex[d.sev]}" ${d.confirmed===false?'stroke="#fff" stroke-dasharray="3 2" stroke-width="2"':'stroke="rgba(0,0,0,.35)" stroke-width="1.5"'}/><circle cx="0" cy="-31" r="6.5" fill="#0b0f10"/></g>`;
 const vw=1000/vz,vh=700/vz;
 const svg=`<svg id="psvg" viewBox="${vcx-vw/2} ${vcy-vh/2} ${vw} ${vh}" onpointerdown="pdn(event)" onpointermove="pmv(event)" onpointerup="pup(event)" onpointerleave="pup(event)" onclick="mapClick(event)" role="img" aria-label="Floor plan with defect pins">
  <defs><pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="rgba(0,194,180,.10)" stroke-width="1"/></pattern>
  <radialGradient id="bl"><stop offset="0" stop-color="#00c2b4" stop-opacity=".9"/><stop offset="1" stop-color="#00c2b4" stop-opacity="0"/></radialGradient>
  <filter id="bf" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter></defs>
  <rect x="-400" y="-300" width="1800" height="1300" fill="#06090b"/><rect x="-400" y="-300" width="1800" height="1300" fill="url(#grid)"/>
  <path d="M130 140H330V60H900V640H130Z" fill="rgba(255,255,255,.025)"/>
  <g class="gpr" style="opacity:${gpr?1:0}" filter="url(#bf)">${blobs.map(([x,y,r,o])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#bl)" opacity="${o}"/>`).join('')}</g>
  <g stroke="#56636a" stroke-width="6" stroke-linecap="square" fill="none"><path d="M130 140H330V60H900V640H130Z" stroke-linejoin="miter"/>${walls.map(w=>`<path d="M${w[0]} ${w[1]}L${w[2]} ${w[3]}"/>`).join('')}</g>
  <g stroke="#56636a" stroke-width="3" fill="none"><path d="M620 300a35 35 0 0 1 35 35"/><path d="M430 520a40 40 0 0 1 40 40"/><path d="M620 500a38 38 0 0 0 38-38"/></g>
  <g fill="rgba(255,255,255,.07)" font-size="26" font-weight="700" letter-spacing="4" text-anchor="middle"><text x="230" y="470">ZONE A</text><text x="450" y="260">ZONE B</text><text x="820" y="360">ZONE C</text></g>
  ${ds.map(pinSvg).join('')}${draft&&draft.b===pb&&draft.level===plv?`<g transform="translate(${draft.x} ${draft.y})"><path d="${PIN}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="5 4"/></g>`:''}
  </svg>`;
 let panel;
 if(draft&&draft.b===pb&&draft.level===plv){
  panel=`<h3>New spot</h3><div class="sub">${lvl(plv)}, Zone ${zoneOf(draft.x)}</div><p class="sub">Pin placed. Continue to add the element, photos, instrument readings and grade.</p><div class="actions"><button class="btn pri" onclick="spotNew({b:pb,level:plv,x:draft.x,y:draft.y})">Continue to spot form</button><button class="btn" onclick="draft=null;planDraw()">Cancel</button></div>`;
}else if(sd){
  panel=`<h3>Defect Details</h3><div class="dk"><div class="dhead"><div><small>Defect ID</small><b>${did(sd)}</b></div><svg width="30" height="38" viewBox="-20 -38 40 44"><path d="${PIN}" fill="${sevHex[sd.sev]}"/><circle cx="0" cy="-31" r="6.5" fill="#0b0f10"/></svg></div>
  <div><small>Location</small><b>${lvl(sd.level)}, Zone ${sd.zone}</b></div><div><small>Type</small><b>${esc(sd.type)}</b></div><div><small>Element</small><b>${esc(sd.element||'')}${sd.confirmed===false?' \u00b7 grade not confirmed':''}</b></div><div><small>Health Score</small><b style="color:${SEV[sd.sev][1]}">${sd.health}%</b></div>
  <div><small>Severity</small><span class="sev s-${sd.sev}">${SEV[sd.sev][0].toUpperCase()}</span></div>
  <div><small>Status</small><select onchange="setStatus(${sd.id},this.value)">${['Open','In progress','Resolved'].map(x=>`<option ${x===sd.status?'selected':''}>${x}</option>`).join('')}</select></div>
  <div><small>Detected</small><b>${detLabel(sd.det)}</b></div></div><div class="actions"><button class="btn pri" onclick="go('spot',${sd.id})">Open spot record</button><button class="btn danger" onclick="delD(${sd.id})">Delete</button></div>`;
 }else{
  const c={critical:0,high:0,medium:0,low:0};ds.forEach(d=>c[d.sev]++);
  panel=`<h3>${lvl(plv)} summary</h3><div class="sub">${ds.length?ds.length+' defect'+(ds.length>1?'s':'')+' on this level. Select a pin for details.':'No defects recorded on this level.'}</div>
  <div class="dk">${Object.entries(SEV).map(([k,v])=>`<div class="dhead"><b>${v[0]}</b><b style="color:${v[1]}">${c[k]}</b></div>`).join('')}</div>`;
 }
 el.innerHTML=`<div class="pgrid"><div class="card map ${placing?'place':''}" style="position:relative"><div class="mtag">Proposed V1.0</div>${svg}
  <div class="mhint"><i></i>10 m</div>
  <div class="mtools"><button class="${gpr?'on':''}" title="GPR overlay" onclick="gpr=!gpr;planDraw()" style="font-size:12px;font-weight:700">GPR</button><button onclick="zoom(1.3)" aria-label="Zoom in">+</button><button onclick="zoom(1/1.3)" aria-label="Zoom out">−</button><button onclick="resetView();planDraw()" aria-label="Reset view" style="font-size:16px">⤢</button></div></div>
  <div class="card dpanel">${panel}</div></div>
  <div class="dl">${ds.map(d=>`<button class="${d.id===selD?'on':''}" onclick="pickD(${d.id})"><s style="background:${sevHex[d.sev]}"></s>${did(d)} · ${esc(d.type)}</button>`).join('')}</div>`;
}
function resetView(){vz=1;vcx=500;vcy=350}
function zoom(f){vz=Math.min(4,Math.max(1,vz*f));if(vz===1){vcx=500;vcy=350}clampView();planDraw()}
function clampView(){const hw=500/vz,hh=350/vz;vcx=Math.min(1000-hw+150,Math.max(hw-150,vcx));vcy=Math.min(700-hh+100,Math.max(hh-100,vcy))}
function pickD(id){if(moved)return;selD=id;draft=null;placing=false;const d=S.spots.find(x=>x.id===id);if(d&&vz>1){vcx=d.x;vcy=d.y-30;clampView()}planDraw();if(innerWidth<=980){const p=document.querySelector('.dpanel');p&&p.scrollIntoView({behavior:'smooth',block:'start'})}}
function togglePlace(){placing=!placing;draft=null;selD=null;render()}
function pdn(e){moved=false;drag={x:e.clientX,y:e.clientY,cx:vcx,cy:vcy}}
function pmv(e){if(!drag)return;const svg=document.getElementById('psvg'),r=svg.getBoundingClientRect(),dx=e.clientX-drag.x,dy=e.clientY-drag.y;
 if(Math.abs(dx)+Math.abs(dy)>6)moved=true;if(!moved||vz===1)return;
 vcx=drag.cx-dx*(1000/vz)/r.width;vcy=drag.cy-dy*(700/vz)/r.height;clampView();const vw=1000/vz,vh=700/vz;svg.setAttribute('viewBox',`${vcx-vw/2} ${vcy-vh/2} ${vw} ${vh}`)}
function pup(){drag=null;setTimeout(()=>moved=false,0)}
function mapClick(e){if(!placing||moved)return;if(e.target.closest&&e.target.closest('.pin'))return;
 const svg=document.getElementById('psvg'),p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(svg.getScreenCTM().inverse());
 if(q.x<130||q.x>900||q.y<70||q.y>640)return;draft={b:pb,level:plv,x:Math.round(q.x),y:Math.round(q.y)};placing=false;selD=null;render()}
function setStatus(id,v){const d=S.spots.find(x=>x.id===id);if(d){d.status=v;save();planDraw()}}
function delD(id){if(!confirm('Delete this spot?'))return;S.spots=S.spots.filter(d=>d.id!==id);selD=null;save();planDraw()}
// ---- audit, toast, inspections
PAGES.plan=planPage;AFTER.plan=planDraw;
