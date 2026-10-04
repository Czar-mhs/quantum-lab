// report builder: pre-flight checks, printable condition assessment report, CSV exports
let rp={b:null,photos:true,readings:true,equip:true,name:'',lic:'',declare:false};
const calSnap=r=>{if(!r.eq)return{st:'na'};if(r.calSt)return{st:r.calSt,no:r.calNo};const q=eqById(r.eq);return q?{...eqStatus(q),no:(eqStatus(q).cal||{}).certNo}:{st:'none'}};
function preflight(bid){const L=S.spots.filter(s=>s.b===bid),rd=L.flatMap(s=>s.readings),items=[];
 const unc=L.filter(s=>!s.confirmed).length;items.push([unc?'warn':'ok',unc?`${unc} spot${unc>1?'s have':' has'} a grade not yet confirmed. They will be marked provisional.`:'All spot grades are confirmed.']);
 const bad=rd.filter(r=>['expired','none'].includes(calSnap(r).st)).length;items.push([bad?'warn':'ok',bad?`${bad} reading${bad>1?'s were':' was'} taken with an instrument that had no valid calibration. They will be flagged.`:'All readings used calibrated instruments.']);
 const used=[...new Set(rd.map(r=>r.eq).filter(Boolean))].map(eqById).filter(Boolean),exp=used.filter(e=>['expired','none'].includes(eqStatus(e).st));
 items.push([exp.length?'warn':'ok',exp.length?`Calibration expired or missing now: ${exp.map(e=>e.name).join(', ')}.`:'All instruments used are currently in calibration.']);
 const np=L.filter(s=>!s.photos.length).length;items.push([np?'info':'ok',np?`${np} spot${np>1?'s have':' has'} no photograph.`:'Every spot has a photograph.']);
 items.push([L.length?'ok':'warn',L.length?`${L.length} spot${L.length>1?'s':''} and ${rd.length} reading${rd.length===1?'':'s'} included.`:'This building has no spots to report.']);
 return items}
function reportPage(){if(!rp.b||!S.buildings.some(b=>b.id===rp.b))rp.b=(S.buildings[0]||{}).id;if(!rp.name)rp.name=S.settings.engineer||'';if(!rp.lic)rp.lic=S.settings.licence||'';
 const b=S.buildings.find(x=>x.id===rp.b);
 return head('Reports','Compile the condition assessment report from the record')+
 `<div class="grid g2"><div class="card"><h3>Condition assessment report</h3>
 <label style="margin-top:0">Building</label><select onchange="rp.b=+this.value;render()">${S.buildings.map(x=>`<option value="${x.id}" ${x.id===rp.b?'selected':''}>${esc(x.name)}</option>`).join('')}</select>
 <label>Include</label><div class="chk">${[['photos','Photos with callouts'],['readings','Instrument data tables'],['equip','Equipment, calibration and certificates']].map(([k,l])=>`<label class="cf"><input type="checkbox" ${rp[k]?'checked':''} onchange="rp.${k}=this.checked"><span>${l}</span></label>`).join('')}</div>
 <div class="f2"><div><label>Signing engineer</label><input value="${esc(rp.name)}" oninput="rp.name=this.value"></div><div><label>Licence / registration no.</label><input value="${esc(rp.lic)}" oninput="rp.lic=this.value"></div></div>
 <label class="cf"><input type="checkbox" ${rp.declare?'checked':''} onchange="rp.declare=this.checked"><span>I have reviewed the findings and confirm the report is accurate and complete</span></label>
 <div class="actions"><button class="btn pri" onclick="makeReport()">Generate report</button></div>
 <p class="sub" style="margin-top:10px">The report opens in a new tab. Use Print and choose Save as PDF.</p></div>
 <div class="card"><h3>Pre-flight checks${b?' · '+esc(b.name):''}</h3><div class="list">${b?preflight(b.id).map(([k,t])=>`<div class="li"><div class="pf ${k}"><i></i>${esc(t)}</div></div>`).join(''):'<div class="empty">Add a building first.</div>'}</div>
 <div class="actions"><button class="btn" onclick="exportCsv('spots')">Export spots CSV</button><button class="btn" onclick="exportCsv('readings')">Export readings CSV</button></div></div></div>
 <div class="card" style="margin-top:16px"><h3>Law 3/2026 compliance report</h3><p class="sub" style="margin:0 0 12px">The Dubai Municipality deadline summary and audit trail lives in the compliance tracker.</p><button class="btn" onclick="go('comp')">Open compliance tracker</button></div>`}
const csvq=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
function exportCsv(kind){const L=S.spots.filter(s=>!rp.b||s.b===rp.b);let rows;
 if(kind==='spots'){rows=[['id','building','level','zone','element','category','description','severity','confirmed','confirmed_by','status','captured','repair_method','x','y']].concat(L.map(s=>[did(s),bName(s.b),s.level,s.zone,s.element,CATS[s.cat]?CATS[s.cat].n:s.cat,s.type,s.sev,s.confirmed?'yes':'no',s.grade?s.grade.by:'',s.status,s.det,s.repair,s.x??'',s.y??'']))}
 else{rows=[['spot','building','test','value','unit','interpretation','instrument','serial','calibration_at_test','point','date','by']];L.forEach(s=>s.readings.forEach(r=>{const q=r.eq?eqById(r.eq):null,i=interp(r);rows.push([did(s),bName(s.b),TESTS[r.test]?TESTS[r.test].n:r.test,r.value,r.unit,i.t,q?q.name:'',q?q.serial:'',calSnap(r).st,(r.extra||{}).point||'',new Date(r.at).toISOString().slice(0,10),r.by])}))}
 download(`amphr-${kind}-${iso(today())}.csv`,rows.map(r=>r.map(csvq).join(',')).join('\n'),'text/csv')}
async function makeReport(){const b=S.buildings.find(x=>x.id===rp.b);if(!b)return;
 if(!rp.name.trim()||!rp.lic.trim()){toast('Enter the signing engineer and licence number.',null,false);return}
 if(!rp.declare){toast('Tick the confirmation to generate the report.',null,false);return}
 toast('Building report…',null);const html=await buildReport(b,rp),url=URL.createObjectURL(new Blob([html],{type:'text/html'}));
 audit('Report generated',b.id);const w=window.open(url,'_blank');if(!w){const a=document.createElement('a');a.href=url;a.download=`${b.name} condition report.html`;a.click()}}
async function buildReport(b,o){
 const L=S.spots.filter(s=>s.b===b.id).sort((a,c)=>sevRank(c.sev)-sevRank(a.sev)||a.id-c.id),h=health(b),rd=L.flatMap(s=>s.readings.map(r=>({s,r})));
 const logo=await fetch('logo.png').then(r=>r.blob()).then(blobToDataUrl).catch(()=>'');
 const used=[...new Set(rd.map(x=>x.r.eq).filter(Boolean))].map(eqById).filter(Boolean),who=[...new Set([o.name,...L.flatMap(s=>[s.grade&&s.grade.by,...s.readings.map(r=>r.by)])].filter(Boolean))];
 const cnt=k=>L.filter(s=>s.sev===k).length,tdy=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
 const photoHtml=async s=>{if(!o.photos||!s.photos.length)return '';const ph=await Promise.all(s.photos.slice(0,3).map(async p=>({u:await fileDataUrl(p.fid),p})));
  return `<div class="ph">${ph.filter(x=>x.u).map(({u,p})=>`<div class="pf"><img src="${u}">${p.pt?`<i style="left:${p.pt.x}%;top:${p.pt.y}%"></i>${p.tag?`<span style="left:${p.pt.x}%;top:${p.pt.y}%">${esc(p.tag)}</span>`:''}`:''}</div>`).join('')}</div>`};
 const finds=[];for(const s of L){finds.push(`<section class="sp"><h3>${did(s)} · ${esc(s.element)} · ${esc(s.type)} <span class="sv" style="background:${SEVC[s.sev]}">${SEVN[s.sev]}</span>${s.confirmed?'':'<span class="prov">PROVISIONAL</span>'}</h3>
  <p class="m">Level ${String(s.level).padStart(2,'0')}, Zone ${s.zone} · ${esc(CATS[s.cat]?CATS[s.cat].n:s.cat)} · ${esc(s.material||'')} · Status: ${esc(s.status)} · Captured ${s.det}${s.confirmed&&s.grade?` · Grade confirmed by ${esc(s.grade.by)}, ${new Date(s.grade.at).toLocaleDateString('en-GB')}${s.grade.reason?' ('+esc(s.grade.reason)+')':''}`:''}</p>
  ${await photoHtml(s)}
  ${o.readings&&s.readings.length?`<table><tr><th>Test</th><th>Result</th><th>Assessment</th><th>Instrument</th><th>Point</th></tr>${s.readings.map(r=>{const q=r.eq?eqById(r.eq):null,i=interp(r),c=calSnap(r);return `<tr><td>${esc(TESTS[r.test]?TESTS[r.test].n:r.test)}</td><td>${esc(String(r.value))} ${esc(r.unit||'')}</td><td>${esc(i.t)}</td><td>${q?esc(q.name)+' ('+esc(q.serial)+')'+(['expired','none'].includes(c.st)?' <b class="bad">calibration not valid</b>':''):'–'}</td><td>${esc((r.extra||{}).point||'')}</td></tr>`}).join('')}</table>`:''}
  <p><b>Recommended repair:</b> ${esc(s.repair||'–')}</p></section>`)}
 const eqRows=used.map(e=>{const st=eqStatus(e),c=st.cal;return `<tr><td>${esc(e.name)}<br><small>${esc((EQ_TYPES[e.type]||{}).tech||'')}</small></td><td>${esc(e.serial)}</td><td>${esc((e.probes||[]).map(p=>p.name+(p.serial?' ('+p.serial+')':'')).join('; '))||'–'}</td><td>${c?esc(c.certNo||'')+'<br><small>'+c.date+' to '+c.due+' · '+esc(c.lab||'')+'</small>':'None on file'}</td><td>${esc(st.txt)}</td></tr>`}).join('');
 const people=S.people.filter(p=>who.includes(p.name)),pc=people.flatMap(p=>S.certs.filter(c=>c.kind==='p'&&c.owner===p.id).map(c=>({p,c})));
 const cr=S.criteria;
 return `<!doctype html><meta charset="utf-8"><title>${esc(b.name)} condition assessment report</title><style>
 body{font:13px/1.5 system-ui,Segoe UI,Roboto,sans-serif;margin:0;padding:34px;color:#16202a;max-width:900px;margin:auto}h1{font-size:26px;margin:0}h2{font-size:17px;border-bottom:2px solid #00a89d;padding-bottom:4px;margin:28px 0 10px}h3{font-size:14px;margin:0 0 4px}
 header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #ff6b35;padding-bottom:12px;margin-bottom:18px}header img{height:46px}.m{color:#5b6770;margin:0 0 8px;font-size:12px}
 table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #cfd8dc;padding:6px 8px;text-align:left;vertical-align:top;font-size:12px}th{background:#eef4f4}small{color:#5b6770}
 .kp{display:flex;gap:10px;flex-wrap:wrap;margin:10px 0}.kp div{border:1px solid #cfd8dc;border-radius:8px;padding:8px 14px;min-width:90px}.kp b{font-size:20px;display:block}
 .sp{border:1px solid #cfd8dc;border-radius:10px;padding:12px 14px;margin:12px 0;break-inside:avoid}.sv{color:#111;font-size:11px;padding:2px 8px;border-radius:99px;margin-left:6px}.prov{color:#8a5200;border:1px solid #f0c27b;background:#fff6e5;font-size:10px;padding:1px 6px;border-radius:4px;margin-left:6px}
 .ph{display:flex;gap:8px;margin:8px 0}.pf{position:relative;flex:1;max-width:33%}.pf img{width:100%;border-radius:6px;display:block}.pf i{position:absolute;width:12px;height:12px;border-radius:50%;background:#00c2b4;border:2px solid #fff;margin:-6px 0 0 -6px}.pf span{position:absolute;background:#00a89d;color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;transform:translate(10px,10px);white-space:nowrap}
 .bad{color:#c0392b}.note{color:#8a5200;border:1px solid #f0c27b;background:#fff6e5;padding:8px 12px;border-radius:6px}.sig{display:flex;gap:30px;margin-top:30px}.sig div{flex:1;border-top:1px solid #16202a;padding-top:6px}
 @media print{body{padding:0}.np{display:none}h2{break-after:avoid}}</style>
 <header><div><h1>Condition Assessment Report</h1><div class="m">${esc(b.name)} · ${esc(b.area)} · ${tdy}</div><div class="m">${esc(S.settings.org||'')}</div></div>${logo?`<img src="${logo}">`:''}</header>
 <h2>1. Summary</h2><div class="kp"><div><b>${h.score}%</b>Health score</div><div><b>${L.length}</b>Spots</div><div><b style="color:#c0392b">${cnt('critical')}</b>Critical</div><div><b style="color:#d35400">${cnt('high')}</b>High</div><div><b>${cnt('medium')}</b>Medium</div><div><b>${cnt('low')}</b>Low</div></div>
 <p>${esc(b.name)} (${b.floors} floors, built ${b.year}). Law 3/2026 status: <b>${CS[b.compliance]}</b>, next inspection due ${b.dueDate}. Health score ${h.score}% (${BANDS[bi(h.score)][0]}).</p>
 ${L.some(s=>!s.confirmed)?`<p class="note">${L.filter(s=>!s.confirmed).length} finding(s) are PROVISIONAL because the grade has not been confirmed by an engineer.</p>`:''}
 <h2>2. Scope and method</h2><p>Visual inspection with non-destructive testing (NDT) at the spots listed below. Personnel: ${who.map(esc).join(', ')||'–'}.</p>
 ${o.equip?`<table><tr><th>Instrument</th><th>Serial</th><th>Probes / accessories</th><th>Calibration certificate</th><th>Status at report date</th></tr>${eqRows||'<tr><td colspan="5">No instruments used.</td></tr>'}</table>`:''}
 <h2>3. Findings</h2>${finds.join('')||'<p>No spots recorded.</p>'}
 ${o.readings&&rd.length?`<h2>4. Instrument data summary</h2><table><tr><th>Spot</th><th>Test</th><th>Result</th><th>Assessment</th></tr>${rd.map(({s,r})=>`<tr><td>${did(s)}</td><td>${esc(TESTS[r.test]?TESTS[r.test].n:r.test)}</td><td>${esc(String(r.value))} ${esc(r.unit||'')}</td><td>${esc(interp(r).t)}</td></tr>`).join('')}</table>`:''}
 <h2>5. Acceptance criteria used</h2><table><tr><th>Test</th><th>Criteria</th></tr><tr><td>UPV</td><td>Excellent ≥ ${cr.upv[0]} m/s, good ≥ ${cr.upv[1]}, medium ≥ ${cr.upv[2]}, below = poor</td></tr><tr><td>Half-cell (CSE)</td><td>No corrosion &gt; ${cr.hc[0]} mV, uncertain &gt; ${cr.hc[1]}, corrosion &gt; ${cr.hc[2]}, below = severe</td></tr><tr><td>Resistivity</td><td>Negligible &gt; ${cr.res[0]} kΩ·cm, low &gt; ${cr.res[1]}, moderate &gt; ${cr.res[2]}, below = high</td></tr><tr><td>Cover</td><td>Minimum ${cr.cover} mm unless stated per reading</td></tr><tr><td>Crack width</td><td>&lt; ${cr.crack[0]} mm minor, &lt; ${cr.crack[1]} medium, &lt; ${cr.crack[2]} high, above = critical</td></tr><tr><td>Pull-off</td><td>≥ ${cr.bond[0]} MPa acceptable, ≥ ${cr.bond[1]} marginal</td></tr></table>
 ${o.equip&&pc.length?`<h2>6. Personnel certifications</h2><table><tr><th>Name</th><th>Certificate</th><th>Number</th><th>Issued by</th><th>Expiry</th></tr>${pc.map(({p,c})=>`<tr><td>${esc(p.name)}</td><td>${esc(c.type)}</td><td>${esc(c.number)}</td><td>${esc(c.issuer)}</td><td>${c.expires||'–'}</td></tr>`).join('')}</table>`:''}
 <h2>Limitations</h2><p class="m">NDT results are indicative and depend on surface condition, moisture and the instrument calibration shown above. Severity grades follow the acceptance criteria in section 5 and require engineering judgement. Repair methods are generic guidance, not a repair design.</p>
 <div class="sig"><div>${esc(o.name)}<br><small>${esc(o.lic)}</small></div><div>Signature</div><div>Date: ${tdy}</div></div>
 <p class="note" style="margin-top:20px">Demo output: sample data may be included. This is not an official submission.</p><button class="np" onclick="print()">Print / Save as PDF</button>`}
PAGES.rep=reportPage;
