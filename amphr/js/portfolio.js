const IC2={bld:'<path d="M4 21V4h10v17M14 9h6v12M8 8h2M8 12h2M8 16h2M2 21h20"/>',heart:'<path d="M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z"/>',warn:'<path d="M12 3 2 20h20zM12 10v5M12 18v.01"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'};
const FL=[['all','All'],['critical','Critical'],['due','Due soon'],['compliant','Compliant']];
const fpred=(k,b,h)=>k==='all'||(k==='critical'&&h.score<40)||(k==='due'&&dleft(b)<=90)||(k==='compliant'&&b.compliance==='compliant');
const stp=s=>`<span class="stp b${BANDS[bi(s)][1]}">${BANDS[bi(s)][0].toUpperCase()}</span>`;
const kpi=(ic,n,l,s,c)=>`<div class="kt"><div class="kh" style="color:${c}"><svg viewBox="0 0 24 24">${IC2[ic]}</svg><b>${n}</b></div><div class="kl">${l}</div><div class="ks">${s}</div></div>`;
let vm=innerWidth<=760?'list':'cards';
function plist(){
 const all=S.buildings.map(b=>({b,h:health(b)})).filter(x=>fpred(flt,x.b,x.h)&&x.b.name.toLowerCase().includes(q.toLowerCase())).sort((a,c)=>a.h.score-c.h.score);
 if(vm==='list')return `<div class="card"><div class="lh"><span>Building</span><span>Health</span><span>Status</span></div>${all.map(({b,h})=>`<div class="lr" onclick="go('detail',${b.id})"><b>${esc(b.name)}</b><span class="hs" style="color:${col(h.score)}">${h.score}%</span>${stp(h.score)}</div>`).join('')||'<div class="empty">No buildings match.</div>'}</div>`;
 return `<div class="grid g3">${cards(all)}</div>`}
function dash(){
 const all=S.buildings.map(b=>({b,h:health(b)}));
 const avg=all.length?Math.round(all.reduce((a,x)=>a+x.h.score,0)/all.length):0;
 const cnt=[0,0,0,0];all.forEach(x=>cnt[bi(x.h.score)]++);
 const crit=S.spots.filter(d=>d.sev==='critical'&&d.status!=='Resolved').length,soon=S.buildings.filter(b=>dleft(b)<=90).length;
 return head('Portfolio Overview',new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}),`<button class="btn pri" onclick="go('add')">+ Add building</button>`)+
 `<div class="kts">${kpi('bld',all.length,'Buildings','Total in portfolio','var(--teal)')}${kpi('heart',avg+'%','Average health','Portfolio average','var(--teal)')}${kpi('warn',crit,'Critical issues','Require attention','var(--or)')}${kpi('clock',soon,'Due soon','Actions due soon','var(--or)')}</div>
 <div class="card glow hero">${ring(avg,150,13,'Portfolio')}<div><h3 style="margin-bottom:2px">Portfolio health ${pill(avg)}</h3><div class="sub">Across ${all.length} building${all.length==1?'':'s'}</div>
  <div class="dist">${cnt.map((n,i)=>n?`<i style="flex:${n};background:${BANDS[i][2]}"></i>`:'').join('')}</div>
  <div class="legend">${BANDS.map((b,i)=>`<span><s style="background:${b[2]}"></s>${b[0]} ${cnt[i]}</span>`).join('')}</div></div></div>
 <div class="tools"><input class="search" placeholder="Search buildings" value="${esc(q)}" oninput="q=this.value;fl()" id="sq">
  <div class="chips">${FL.map(([k,l])=>`<button class="chip ${flt===k?'on':''}" onclick="flt='${k}';render()">${l}</button>`).join('')}</div>
  <div class="seg"><button class="${vm==='cards'?'on':''}" onclick="vm='cards';render()">Cards</button><button class="${vm==='list'?'on':''}" onclick="vm='list';render()">List</button></div></div>
 <div id="bl">${plist()}</div>`}
function cards(list){return list.map(({b,h})=>`<div class="card bc" onclick="go('detail',${b.id})"><div class="h">${ring(h.score,72,7)}<div><h4>${esc(b.name)}</h4><p>${esc(b.area)} · ${b.floors} floors</p></div></div>
 <div class="meta"><span>${pill(h.score)}</span><span>${dleft(b)<0?Math.abs(dleft(b))+' days overdue':dleft(b)+' days to inspection'}</span></div></div>`).join('')||'<div class="empty card" style="grid-column:1/-1">No buildings match.</div>'}
function fl(){document.getElementById('bl').innerHTML=plist()}
function detail(){
 const b=S.buildings.find(x=>x.id===sel);if(!b)return dash();const h=health(b),n=dleft(b);
 const parts=[['Structural · 40%',h.st],['Compliance · 30%',h.co],['Maintenance · 20%',h.mt],['Safety · 10%',h.sf]];
 const as=S.assets.filter(a=>a.b===b.id),ins=S.inspections.filter(i=>i.b===b.id);
 return `<button class="back" onclick="go('dash')">‹ Portfolio</button>`+
 `<div class="card glow dtop" style="margin-bottom:16px">${ring(h.score,150,13,'Health')}<div><h1 style="font-size:30px">${esc(b.name)}</h1><div class="sub">${esc(b.area)} · ${b.floors} floors · built ${b.year}</div><div style="margin-top:12px">${pill(h.score)}</div></div></div>
 <div class="grid g2" style="margin-bottom:16px">
 <div class="card"><h3>Score breakdown</h3>${parts.map(([l,v])=>`<div class="brow"><span>${l}</span><div class="bar"><i style="width:${v}%"></i></div><b>${v}</b></div>`).join('')}</div>
 <div class="card"><h3>Compliance · Law 3/2026</h3><div class="li" style="padding-top:0"><div><b>${CS[b.compliance]}</b><small>Next inspection ${b.dueDate}</small></div><div class="cd ${ucls(n)}"><b>${Math.abs(n)}</b><small>${n<0?'days overdue':'days left'}</small></div></div>
 <div class="f3" style="margin-top:14px"><div class="kpi"><b style="color:var(--r)">${b.issues.critical}</b><span>Critical</span></div><div class="kpi"><b style="color:var(--o)">${b.issues.high}</b><span>High</span></div><div class="kpi"><b style="color:var(--y)">${b.issues.safety}</b><span>Safety</span></div></div></div></div>
 <div class="grid g2"><div class="card"><h3>Assets · ${as.length}</h3><div class="list">${as.map(a=>`<div class="li"><div><b>${esc(a.name)}</b><small>${esc(a.type)}</small></div>${sp(a.status)}</div>`).join('')||'<div class="empty">No assets yet.</div>'}</div></div>
 <div class="card"><h3>Inspections · ${ins.length}</h3><div class="list">${ins.map(i=>`<div class="li"><div><b>${i.date}</b><small>${esc(i.by)} — ${esc(i.notes)}</small></div></div>`).join('')||'<div class="empty">None recorded.</div>'}</div></div></div>
 <div class="card" style="margin-top:16px"><h3>Spots \u00b7 ${S.spots.filter(x=>x.b===b.id).length}</h3><div class="list">${S.spots.filter(x=>x.b===b.id).slice(0,6).map(x=>`<div class="li" style="cursor:pointer" onclick="go('spot',${x.id})"><div><b>${did(x)} \u00b7 ${esc(x.element)}</b><small>${esc(x.type)}</small></div>${sevP(x.sev)}</div>`).join('')||'<div class="empty">No spots yet.</div>'}</div></div>
<div class="actions"><button class="btn pri" onclick="spotNew({b:${b.id}})">+ New spot</button><button class="btn" onclick="it='manual';go('insp','${b.id}')">Record inspection</button><button class="btn" onclick="rp.b=${b.id};go('rep')">Report</button><button class="btn danger" onclick="delB(${b.id})">Delete building</button></div>`}
const sp=s=>{const m={Good:'G',Fair:'Y',Poor:'O',Critical:'R'}[s]||'G';return `<span class="pill p${m}">${esc(s)}</span>`};
PAGES.dash=dash;PAGES.detail=detail;
