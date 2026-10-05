// Dubai Municipality (DM) structural modification permit pack: NDT scope, report contents, consultant deliverables
const DM_TYPES={
 slab:{n:'Slab penetrations / trenching',eg:'MEP risers, staircases, escalators',scope:['GPR scanning (high frequency)','Cover meter / Ferroscan'],aim:'Map top and bottom rebar, verify bar spacing, and avoid severing post-tensioning (PT) tendons or critical shear links.',tests:['gpr','cover'],man:[]},
 vert:{n:'Vertical extension / mezzanine',eg:'Adds column and dead loads',scope:['Core extraction and compressive testing','Ultrasonic pulse velocity (UPV)','Geotechnical re-evaluation (if foundation load increases)'],aim:'Determine existing fcu / characteristic strength (fck), verify no internal honeycombing or delamination, and confirm foundation bearing adequacy.',tests:['upv'],man:['core','geo']},
 retro:{n:'Member retrofitting / strengthening',eg:'CFRP wrap, steel jacketing',scope:['Carbonation depth testing','Half-cell potential (corrosion mapping)','Rebar exposure and caliper measurement'],aim:'Verify substrate passivity and confirm no active corrosion before encasing or bonding composite materials.',tests:['hc'],man:['carb','caliper']},
 pt:{n:'Post-tensioned (PT) slabs',eg:'Tendon zones and anchorages',scope:['GPR scanning (2.0 to 4.0 GHz)','As-built tendon profiling'],aim:'Pinpoint live and dead anchorage zones and tendon profiles. Cutting active strands without a DM-approved de-tensioning protocol is prohibited.',tests:['gpr'],man:['tendon']}};
const DM_MAN={
 core:'Core extraction and compressive tests (BS EN 12504-1 / ASTM C42)',geo:'Geotechnical re-evaluation (if foundation load increases)',carb:'Phenolphthalein carbonation depth results vs. concrete cover',
 caliper:'Rebar exposure and caliper measurements',tendon:'As-built PT tendon profile and anchorage zones',
 corescan:'Core locations scanned first by GPR / cover meter',ldcorr:'Core to in-situ cube strength (fcu) conversion with L/D and reinforcement correction factors',
 overlay:'2D/3D scan maps and cover-depth heatmaps overlaid on proposed layouts, with cut lines, cages, conduits and PT ducts marked',
 narr:'Condition Assessment and Integrity Report (results vs. design or Dubai Building Code baseline)',fea:'Updated structural model and calculations (ETABS, SAFE, SAP2000 or Prokon) using lab-verified concrete strength',
 prop:'Propping and shoring method statement with temporary works drawings',rep:'Structural repair / strengthening details (chemical anchor pull-out criteria, CFRP to ACI 440.2R / DBC)',
 bps:'Submitted through the Dubai Building Permits System (BPS) by an accredited structural consultant'};
const DM_CATS=['G+1','G+4','G+12','Unlimited'];
let dmB=null;
const dmS=()=>{S.dm=S.dm||{};if(!dmB||!S.buildings.some(b=>b.id===dmB))dmB=(S.buildings[0]||{}).id;return S.dm[dmB]=S.dm[dmB]||{type:'slab',ck:{},cat:'',lab:''}};
const dmOk=(date)=>!date||daysTo(date)>=0;
function dmItems(b,d){const T=DM_TYPES[d.type],rd=S.spots.filter(s=>s.b===b.id).flatMap(s=>s.readings),has=t=>rd.filter(r=>r.test===t).length;
 const needEq=S.equipment.filter(e=>e.status==='active'&&(EQ_TYPES[e.type]||{}).cal),okEq=needEq.filter(e=>{const c=calOf(e);return c&&dmOk(c.due)});
 const eiac=S.certs.filter(c=>c.type==='Laboratory accreditation (ISO/IEC 17025)'&&dmOk(c.expires)),reg=S.certs.filter(c=>c.type==='Professional engineer registration'&&dmOk(c.expires));
 const man=k=>({ok:!!d.ck[k],man:k,d:d.ck[k]?'Marked complete':'Tap to mark complete'});
 const a=(ok,det)=>({ok,d:det});
 return [
 {h:'1 · Mandatory NDT scope for this modification',it:[...T.tests.map(t=>({l:TESTS[t].n+' readings recorded',...a(has(t)>0,has(t)?has(t)+' reading'+(has(t)>1?'s':'')+' in Spots':'No readings yet. Add them in Spots.')})),...T.man.map(k=>({l:DM_MAN[k],...man(k)}))]},
 {h:'2 · Laboratory and equipment accreditation',it:[
  {l:'Valid EIAC / ISO 17025 laboratory certificate',...a(eiac.length>0,eiac.length?eiac[0].number||'On file':'Add under Equipment > Certificates')},
  {l:'Calibration certificates valid for all active instruments',...a(needEq.length>0&&okEq.length===needEq.length,`${okEq.length} of ${needEq.length} instruments in calibration`)}]},
 {h:'3 · Scan maps and as-built overlays',it:[{l:'GPR / cover-depth scan data captured',...a(has('gpr')+has('cover')>0,has('gpr')+has('cover')?'Scan readings on file':'No GPR or cover readings')},{l:DM_MAN.overlay,...man('overlay')}]},
 {h:'4 · Core test data (destructive calibration)',it:[{l:DM_MAN.corescan,...man('corescan')},{l:DM_MAN.ldcorr,...man('ldcorr')}]},
 {h:'5 · Visual distress and durability log',it:[{l:'Crack width mapping (demec gauge or microscope)',...a(has('crack')>0,has('crack')?has('crack')+' crack reading'+(has('crack')>1?'s':''):'No crack readings')},{l:DM_MAN.carb,...man('carb')}]},
 {h:'6 · Consultant engineering deliverables',it:['narr','fea','prop','rep'].map(k=>({l:DM_MAN[k],...man(k)}))},
 {h:'7 · Engineer and submission',it:[
  {l:'DM structural engineer registration on file',...a(reg.length>0||!!(S.settings.licence||'').trim(),reg.length?reg[0].number||'Certificate on file':(S.settings.licence||'Add in Settings or Team')) },
  {l:'Registration category covers building height ('+b.floors+' floors)',...a(!!d.cat,d.cat?'Category '+d.cat:'Select category below')},
  {l:DM_MAN.bps,...man('bps')}]}]}
function dmPct(secs){const all=secs.flatMap(s=>s.it);return{n:all.filter(i=>i.ok).length,t:all.length,p:Math.round(100*all.filter(i=>i.ok).length/Math.max(1,all.length))}}
function dmPage(){const d=dmS(),b=S.buildings.find(x=>x.id===dmB);if(!b)return head('DM Permit','Add a building first')+'<div class="empty">No buildings.</div>';
 const T=DM_TYPES[d.type],secs=dmItems(b,d),pc=dmPct(secs),col=pc.p>=80?'var(--g)':pc.p>=50?'var(--y)':'var(--r)';
 return head('DM Permit Pack','Dubai Municipality structural modification: NDT scope, report contents and deliverables',`<button class="btn pri" onclick="dmReport()">Generate DM permit pack</button>`)+
 `<div class="card" style="margin-bottom:16px"><div class="f2"><div><label style="margin-top:0">Building</label><select onchange="dmB=+this.value;soft()">${S.buildings.map(x=>`<option value="${x.id}" ${x.id===dmB?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div>
  <div><label style="margin-top:0">Registration category (height)</label><select onchange="dmS().cat=this.value;save();soft()"><option value="">Select</option>${DM_CATS.map(c=>`<option ${d.cat===c?'selected':''}>${c}</option>`).join('')}</select></div></div>
  <label>Modification type</label><div class="seg big">${Object.entries(DM_TYPES).map(([k,v])=>`<button class="${d.type===k?'on':''}" onclick="dmS().type='${k}';save();soft()">${v.n}</button>`).join('')}</div>
  <div class="dmscope"><b>${esc(T.n)}</b> <small>${esc(T.eg)}</small><ul>${T.scope.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p class="sub" style="margin:0"><b>Objective:</b> ${esc(T.aim)}</p></div></div>
 <div class="grid g2"><div>${secs.map(s=>`<div class="card" style="margin-bottom:16px"><h3 class="up">${esc(s.h)}</h3>${s.it.map(i=>`<div class="ck ${i.man?'tg':''}" ${i.man?`onclick="dmTog('${i.man}')" role="button"`:''}><i class="${i.ok?'ok':''}">${i.ok?'✓':''}</i><div><b>${esc(i.l)}</b><small>${esc(i.d)}</small></div><span class="pill p${i.ok?'G':'N'}">${i.ok?(i.man?'Done':'Auto'):(i.man?'Open':'Missing')}</span></div>`).join('')}</div>`).join('')}</div>
 <div><div class="card" style="position:sticky;top:16px"><h3 class="up">Submission readiness</h3><div class="dmbig" style="color:${col}">${pc.p}%</div><div class="trk"><div class="bars" style="background:var(--s2)"><i style="width:${pc.p}%;background:${col}"></i></div></div><p class="sub">${pc.n} of ${pc.t} requirements met for <b>${esc(b.name)}</b>. Auto items read your Spots, Equipment and Certificates. Tap manual items to mark them complete.</p>
  <p class="sub" style="margin:10px 0 0">Rules applied: testing by an EIAC-accredited / DM-registered lab, submitted via BPS by a DM-licensed consultant. Core sampling to BS EN 12504-1 / ASTM C42. Technical approval for non-standard systems sits with DCLD-CQPS.</p></div></div></div>`}
function dmTog(k){const d=dmS();d.ck[k]=!d.ck[k];audit((d.ck[k]?'DM item done: ':'DM item reopened: ')+(DM_MAN[k]||k).slice(0,40),dmB);save();soft()}
function dmReport(){const d=dmS(),b=S.buildings.find(x=>x.id===dmB),secs=dmItems(b,d),pc=dmPct(secs),T=DM_TYPES[d.type];
 const html=`<!doctype html><meta charset="utf-8"><title>DM Permit Pack</title><style>body{font:14px/1.5 system-ui,sans-serif;margin:40px;color:#111}h1{margin:0 0 4px}h2{margin:22px 0 6px;font-size:16px}table{width:100%;border-collapse:collapse}td{border:1px solid #ccc;padding:7px;vertical-align:top}small{color:#666}.y{color:#0a7d3c;font-weight:700}.n{color:#b3261e;font-weight:700}.note{color:#8a5200;border:1px solid #f0c27b;background:#fff6e5;padding:10px;border-radius:6px}@media print{.np{display:none}}</style>
 <h1>Dubai Municipality Structural Modification: NDT Permit Pack</h1><p>${esc(b.name)}, ${esc(b.area)} · ${esc(T.n)} · Readiness ${pc.p}% (${pc.n}/${pc.t}) · ${esc(S.settings.org||'')} · ${new Date().toLocaleString('en-GB')}</p>
 <p><b>Required NDT scope:</b> ${T.scope.map(esc).join('; ')}.<br><b>Objective:</b> ${esc(T.aim)}</p><p><b>Signing engineer:</b> ${esc(S.settings.engineer||'-')} · ${esc(S.settings.licence||'-')} · Category: ${esc(d.cat||'-')}</p>
 ${secs.map(s=>`<h2>${esc(s.h)}</h2><table>${s.it.map(i=>`<tr><td>${esc(i.l)}<br><small>${esc(i.d)}</small></td><td width="70" class="${i.ok?'y':'n'}">${i.ok?'Met':'Open'}</td></tr>`).join('')}</table>`).join('')}
 <p class="note">Demo output from sample data held in this browser. It is a readiness checklist, not an official DM submission. Testing must be by an EIAC-accredited / DM-registered lab and submitted via BPS by a DM-licensed consultant, and reports must be reviewed and signed by a qualified engineer.</p><button class="np" onclick="print()">Print / Save as PDF</button>`;
 const url=URL.createObjectURL(new Blob([html],{type:'text/html'}));audit('DM permit pack generated',b.id);const w=window.open(url,'_blank');if(!w){const l=document.createElement('a');l.href=url;l.download='DM_Permit_Pack_'+iso(today())+'.html';l.click()}toast('DM permit pack generated',null);soft()}
PAGES.dm=dmPage;
