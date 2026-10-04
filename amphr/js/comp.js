let cSel=null;
const AL=[[30,'30D','#fbbf24'],[14,'14D','#fb923c'],[1,'1D','#f87171']];
const dots=n=>AL.map(([t,l,c])=>`<i class="dot" style="background:${n<=t?c:'var(--g)'}" title="${l}: ${n<=t?'alert active':'clear'}"></i>`).join('');
const track=n=>{const pos=Math.min(100,Math.max(0,(1-n/365)*100));return `<div class="trk"><div class="bars"><i style="flex:50.7;background:#1f9d55"></i><i style="flex:24.6;background:#e0a800"></i><i style="flex:24.7;background:#c0392b"></i></div><u class="${n<0?'od':''}" style="left:${pos}%"></u></div>`};
function comp(){
 const bs=[...S.buildings].sort((a,c)=>dleft(a)-dleft(c)),sb=S.buildings.find(b=>b.id===cSel);
 return head('Law 3/2026 Compliance Tracker','Deadlines colour-coded by urgency · alerts at 30, 14 and 1 day')+
 `<div class="cgrid"><div><div class="card"><h3 class="up">Compliance timeline</h3>
  <div class="ch"><span>Building</span><span>Time to deadline<span class="lg"><s style="color:var(--g)">&gt;180 days</s><s style="color:var(--y)">90–180 days</s><s style="color:var(--r)">&lt;90 days</s></span></span><span class="al">Alerts<br><small>30D 14D 1D</small></span></div>
  ${bs.map(b=>{const n=dleft(b);return `<div class="cr ${b.id===cSel?'on':''}" onclick="cSel=${b.id};soft()"><b>${esc(b.name)}</b><div class="tc">${track(n)}<small>${n<0?Math.abs(n)+' days overdue':n+' days left'} · ${b.dueDate} · ${CS[b.compliance]}</small></div><div class="dots">${dots(n)}</div></div>`}).join('')||'<div class="empty">No buildings.</div>'}
  <button class="btn pri wide" onclick="genReport()">Generate DM compliance report</button></div>
  ${sb?`<div class="card" style="margin-top:16px"><h3>Update ${esc(sb.name)}</h3><form onsubmit="saveDeadline(event)"><div class="f2"><div><label style="margin-top:0">Deadline</label><input type="date" name="due" value="${sb.dueDate}" required></div>
  <div><label style="margin-top:0">Status</label><select name="co">${Object.entries(CS).map(([k,v])=>`<option value="${k}" ${sb.compliance===k?'selected':''}>${v}</option>`).join('')}</select></div></div>
  <div class="actions"><button class="btn pri">Save changes</button><button type="button" class="btn" onclick="remind(${sb.id})">Send reminder</button></div></form></div>`:'<p class="sub" style="margin-top:12px">Tap a building to update its deadline or status.</p>'}</div>
  <div class="card"><h3 class="up">Audit trail</h3><div class="ah"><span>Action</span><span>Time</span></div>${S.audit.slice(0,10).map(a=>`<div class="ar"><span>${esc(a.a)}${a.b?`<small>${esc((S.buildings.find(x=>x.id===a.b)||{}).name||'')}</small>`:''}</span><span class="at">${fmtT(a.t)}</span></div>`).join('')||'<div class="empty">No activity yet.</div>'}</div></div>`}
function saveDeadline(e){const f=fd(e),b=S.buildings.find(x=>x.id===cSel);if(!b)return;
 if(f.due!==b.dueDate){b.dueDate=f.due;audit('Deadline updated',b.id)}
 if(f.co!==b.compliance){b.compliance=f.co;audit('Status changed',b.id)}
 save();toast('Saved',null);soft()}
function remind(id){audit('Reminder sent',id);toast('Reminder logged (demo: no message is sent)',null);soft()}
function genReport(){
 const rows=[...S.buildings].sort((a,c)=>dleft(a)-dleft(c)).map(b=>{const h=health(b),n=dleft(b),cr=S.spots.filter(d=>d.b===b.id&&d.sev==='critical'&&d.status!=='Resolved').length;
  return `<tr><td>${esc(b.name)}<br><small>${esc(b.area)}</small></td><td>${h.score}% ${BANDS[bi(h.score)][0]}</td><td>${CS[b.compliance]}</td><td>${b.lastInsp}</td><td>${b.dueDate}</td><td>${n<0?Math.abs(n)+' overdue':n}</td><td>${cr}</td></tr>`}).join('');
 const au=S.audit.slice(0,12).map(a=>`<tr><td>${esc(a.a)}</td><td>${esc((S.buildings.find(x=>x.id===a.b)||{}).name||'')}</td><td>${fmtT(a.t)}</td></tr>`).join('');
 const html=`<!doctype html><meta charset="utf-8"><title>Law 3/2026 Compliance Report</title><style>body{font:14px/1.5 system-ui,sans-serif;margin:40px;color:#111}h1{margin:0 0 4px}table{width:100%;border-collapse:collapse;margin:14px 0 26px}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#eef4f4}small{color:#666}.note{color:#8a5200;border:1px solid #f0c27b;background:#fff6e5;padding:10px;border-radius:6px}@media print{.np{display:none}}</style><h1>Law 3/2026 Compliance Report</h1><p>Prepared for Dubai Municipality · Generated ${new Date().toLocaleString('en-GB')} · AMPHR</p><p class="note">Demo output generated from sample data held in this browser. It is not an official Dubai Municipality submission.</p><h2>Buildings</h2><table><tr><th>Building</th><th>Health</th><th>Compliance</th><th>Last inspection</th><th>Deadline</th><th>Days</th><th>Open critical defects</th></tr>${rows}</table><h2>Audit trail</h2><table><tr><th>Action</th><th>Building</th><th>Time</th></tr>${au}</table><button class="np" onclick="print()">Print / Save as PDF</button>`;
 const url=URL.createObjectURL(new Blob([html],{type:'text/html'}));audit('Report generated');
 const w=window.open(url,'_blank');if(!w){const l=document.createElement('a');l.href=url;l.download='Compliance_Report_'+iso(today())+'.html';l.click()}
 toast('DM compliance report generated',null);soft()}
PAGES.comp=comp;
