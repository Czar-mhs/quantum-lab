// Authority switch (Dubai / Abu Dhabi), one-page building health summary, per-building data export.
// Self-contained: wraps existing pages, core files untouched. Ported from the standalone prototype, but
// without its invented rules: no score-based certificate validity, no "certificate issued" wording,
// and no Abu Dhabi rules until they are confirmed from primary sources (see docs/DUBAI_REGULATORY_KNOWLEDGE.md).
const AUTH={dm:{n:'Dubai Municipality',s:'DM',law:'Law No. 3 of 2026'},adm:{n:'Abu Dhabi (ADM / DMT)',s:'ADM',law:''}};
const authK=()=>AUTH[(S.settings||{}).authority]?S.settings.authority:'dm';
const auth=()=>AUTH[authK()];
function setAuth(k){if(!AUTH[k]||k===authK())return;S.settings.authority=k;audit('Authority set to '+AUTH[k].s);save();toast('Authority: '+AUTH[k].n,null);soft()}
// Law 3/2026 validity depends on building age (Completion Certificate), not on the health score
const qsValidity=b=>{if(authK()!=='dm'||!b.year)return null;const age=new Date().getFullYear()-b.year;return{age,years:age>=40?5:10}};
const ADM_NOTE='Abu Dhabi rules are not loaded yet. AMPHR does not apply Abu Dhabi certificate periods or deadlines until they are confirmed with ADM / DMT. Health scores and defect records still work as normal.';
function authCard(){const a=auth();
 return `<div class="card authc"><div class="authh"><div><h3 class="up" style="margin:0">Authority</h3><div class="sub">${esc(a.n)}${a.law?' · '+a.law:''}</div></div><div class="seg">${Object.entries(AUTH).map(([k,x])=>`<button class="${authK()===k?'on':''}" onclick="setAuth('${k}')">${x.s}</button>`).join('')}</div></div>
 ${authK()==='adm'?`<div class="demo" style="margin:12px 0 0"><i></i><span>${ADM_NOTE}</span></div>`:''}</div>`}
// compliance tracker: authority bar on top
{const base=PAGES.comp;PAGES.comp=()=>authCard()+base()}
// settings: authority card at the top
{const base=PAGES.set;PAGES.set=()=>{const h=base(),i=h.indexOf('<div class="grid g2">');return i<0?authCard()+h:h.slice(0,i)+authCard()+h.slice(i)}}
// building detail: summary + export buttons
{const base=PAGES.detail;PAGES.detail=()=>{const h=base(),b=S.buildings.find(x=>x.id===sel);if(!b)return h;const v=qsValidity(b);
 return h+`<div class="card" style="margin-top:16px"><h3>Health summary · ${esc(auth().s)}</h3>
 <p class="sub" style="margin:0 0 6px">${v?`About ${v.age} years old (built ${b.year}), so a <b>${v.years}-year</b> Quality and Safety Certificate period under ${AUTH.dm.law}, once issued by the authority. Estimated from year built; confirm with the Completion Certificate.`:esc(authK()==='adm'?ADM_NOTE:'Add the year built to estimate the certificate period.')}</p>
 <div class="actions"><button class="btn pri" onclick="healthSummary(${b.id})">Health summary (PDF)</button><button class="btn" onclick="exportBuilding(${b.id})">Export building data</button></div></div>`}}
function healthSummary(id){const b=S.buildings.find(x=>x.id===id);if(!b)return;const h=health(b),v=qsValidity(b),a=auth(),st=S.settings||{};
 const L=S.spots.filter(s=>s.b===b.id&&s.status!=='Resolved'),by=k=>L.filter(s=>s.sev===k).length;
 const parts=[['Structural',40,h.st],['Compliance',30,h.co],['Maintenance',20,h.mt],['Safety',10,h.sf]];
 const html=`<!doctype html><meta charset="utf-8"><title>Building Health Summary · ${esc(b.name)}</title><style>body{font:14px/1.5 system-ui,sans-serif;margin:40px;color:#111}h1{margin:0 0 4px}h2{margin:26px 0 8px;font-size:17px}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#eef4f4}.big{font-size:52px;font-weight:800;line-height:1}.note{color:#8a5200;border:1px solid #f0c27b;background:#fff6e5;padding:10px;border-radius:6px;margin-top:22px}small{color:#666}@media print{.np{display:none}}</style>
 <h1>Building Health Summary</h1><p>${esc(b.name)} · ${esc(b.area)} · ${b.floors} floors · built ${b.year}<br><small>${esc(st.org||'')}${st.org?' · ':''}Authority: ${esc(a.n)} · Generated ${new Date().toLocaleString('en-GB')} · AMPHR, powered by MHS+</small></p>
 <h2>Health score</h2><div class="big" style="color:${['#1f9d55','#c99700','#e67e22','#c0392b'][bi(h.score)]}">${h.score}<span style="font-size:20px;color:#666">/100</span></div><p>${BANDS[bi(h.score)][0]}</p>
 <table><tr><th>Part</th><th>Weight</th><th>Score</th></tr>${parts.map(([n,w,s])=>`<tr><td>${n}</td><td>${w}%</td><td>${Math.round(s)}</td></tr>`).join('')}</table>
 <h2>Compliance</h2><table><tr><th>Status</th><td>${CS[b.compliance]}</td></tr><tr><th>Last inspection</th><td>${esc(b.lastInsp)}</td></tr><tr><th>Next due</th><td>${esc(b.dueDate)}</td></tr>
 <tr><th>Certificate period</th><td>${v?`${v.years} years under ${AUTH.dm.law} (estimated from year built)`:esc(authK()==='adm'?'Not applied: Abu Dhabi rules not confirmed yet':'Unknown')}</td></tr></table>
 <h2>Open defects</h2><table><tr><th>Critical</th><th>High</th><th>Medium</th><th>Low</th></tr><tr><td>${by('critical')}</td><td>${by('high')}</td><td>${by('medium')}</td><td>${by('low')}</td></tr></table>
 <p>Prepared by: ${esc(st.engineer||'—')}${st.licence?' · '+esc(st.licence):''}</p>
 <p class="note">This is an AMPHR building health summary for planning. It is <b>not a certificate</b> and is not issued or approved by Dubai Municipality, Abu Dhabi authorities or any other body. Certificates are issued only by the authority, after submission by a registered engineering consultant.</p>
 <button class="np" onclick="print()">Print / Save as PDF</button>`;
 const url=URL.createObjectURL(new Blob([html],{type:'text/html'}));audit('Health summary generated',b.id);save();
 const w=window.open(url,'_blank');if(!w){const l=document.createElement('a');l.href=url;l.download='Health_Summary_'+b.name.replace(/\W+/g,'_')+'.html';l.click()}
 toast('Health summary opened. Use Print, then Save as PDF.',null)}
function exportBuilding(id){const b=S.buildings.find(x=>x.id===id);if(!b)return;
 const data={app:'amphr',kind:'building',exported:new Date().toISOString(),authority:auth().s,building:b,health:health(b),certificatePeriod:qsValidity(b),
  spots:S.spots.filter(s=>s.b===id),inspections:S.inspections.filter(i=>i.b===id),assets:S.assets.filter(a=>a.b===id)};
 download(`amphr-${b.name.replace(/\W+/g,'-').toLowerCase()}-${iso(today())}.json`,JSON.stringify(data,null,2),'application/json');audit('Building data exported',id);save();toast('Building data downloaded',null)}
