// equipment register, calibrations, certifications, team
const CERT_TYPES=['Calibration certificate','Conformity (CE / UKCA)','Manufacturer certificate','Operator qualification (NDT)','Professional engineer registration','Laboratory accreditation (ISO/IEC 17025)','Other'];
const EQ_STATUS={active:'Active',service:'In calibration / service',out:'Out of service',retired:'Retired'};
const stCls={valid:'G',due:'Y',expired:'R',none:'N',na:'N'};
const chip=(st,txt)=>`<span class="pill p${stCls[st]||'N'}">${esc(txt)}</span>`;
const dstat=(date,warn=30)=>{if(!date)return{st:'valid',n:null};const n=daysTo(date);return{st:n<0?'expired':n<=warn?'due':'valid',n}};
const calOf=eq=>S.cals.filter(c=>c.eq===eq.id).sort((a,b)=>b.date.localeCompare(a.date))[0]||null;
function eqStatus(eq){const T=EQ_TYPES[eq.type]||EQ_TYPES.other;
 if(!T.cal)return{st:'na',txt:'Verification only'};
 const c=calOf(eq);if(!c)return{st:'none',txt:'No calibration on file'};
 const s=dstat(c.due);return{...s,cal:c,txt:s.st==='expired'?`Calibration expired ${-s.n} d ago`:s.st==='due'?`Calibration due in ${s.n} d`:`Calibrated until ${c.due}`}}
const eqUse=eq=>S.spots.reduce((n,s)=>n+s.readings.filter(r=>r.eq===eq.id).length,0);
const eqById=id=>S.equipment.find(e=>e.id===+id);
let eqt='reg',eqd=null;
const eqIcon=eq=>eq.photo?`<img data-fid="${eq.photo.fid}" alt="${esc(eq.name)}">`:`<svg viewBox="0 0 24 24">${IC.equip}</svg>`;
function equip(){
 const all=S.equipment.map(e=>eqStatus(e)),c=s=>all.filter(x=>x.st===s).length;
 return head('Equipment','Instruments, probes, certificates and calibrations',`<button class="btn pri" onclick="eqNew()">+ Add equipment</button>`)+
 `<div class="kts"><div class="kt"><div class="kh" style="color:var(--teal)"><svg viewBox="0 0 24 24">${IC.equip}</svg><b>${S.equipment.length}</b></div><div class="kl">Instruments</div><div class="ks">In the register</div></div>
 <div class="kt"><div class="kh" style="color:var(--g)"><svg viewBox="0 0 24 24">${IC2.heart}</svg><b>${c('valid')}</b></div><div class="kl">Calibration valid</div><div class="ks">Ready for use</div></div>
 <div class="kt"><div class="kh" style="color:var(--y)"><svg viewBox="0 0 24 24">${IC2.clock}</svg><b>${c('due')}</b></div><div class="kl">Due within 30 days</div><div class="ks">Book calibration</div></div>
 <div class="kt"><div class="kh" style="color:var(--r)"><svg viewBox="0 0 24 24">${IC2.warn}</svg><b>${c('expired')+c('none')}</b></div><div class="kl">Expired or missing</div><div class="ks">Do not use for reports</div></div></div>
 <div class="seg big">${[['reg','Register'],['cal','Calibrations'],['cert','Certifications'],['team','Team']].map(([k,l])=>`<button class="${eqt===k?'on':''}" onclick="eqt='${k}';render()">${l}</button>`).join('')}</div>`+({reg:eqReg,cal:eqCals,cert:eqCerts,team:eqTeam})[eqt]()}
function eqReg(){
 if(!S.equipment.length)return '<div class="card empty">No equipment yet. Add your first instrument.</div>';
 return `<div class="grid g3">${S.equipment.map(e=>{const st=eqStatus(e),T=EQ_TYPES[e.type]||EQ_TYPES.other;
 return `<div class="card eqc" onclick="go('eq',${e.id})"><div class="eqh"><div class="eqi">${eqIcon(e)}</div><div><h4>${esc(e.name)}</h4><p>${esc(T.tech||T.n)}${e.serial?' · S/N '+esc(e.serial):''}</p></div></div>
 <div class="chs">${chip(st.st,st.txt)}${e.status!=='active'?chip('due',EQ_STATUS[e.status]||e.status):''}</div>
 <div class="chs">${T.m.map(m=>`<span class="tg">${esc(m)}</span>`).join('')}</div>
 <div class="meta"><span>${(e.probes||[]).length} probe${(e.probes||[]).length===1?'':'s'} / accessories</span><span>${eqUse(e)} reading${eqUse(e)===1?'':'s'}</span></div></div>`}).join('')}</div>`}
function eqNew(){eqd={id:0,type:'schmidt',name:'',maker:'Screening Eagle / Proceq',serial:'',tag:'',purchased:'',status:'active',assigned:'',probes:[],notes:'',photo:null};go('eqform')}
function eqEdit(id){eqd=JSON.parse(JSON.stringify(eqById(id)));go('eqform')}
function eqform(){const e=eqd;if(!e){go('equip');return ''}
 return `<button class="back" onclick="go(${e.id?"'eq',"+e.id:"'equip'"})">‹ ${e.id?'Equipment record':'Equipment'}</button>`+head(e.id?'Edit equipment':'Add equipment','Register the instrument, its probes and accessories')+
 `<div class="card" style="max-width:760px"><div class="f2"><div><label style="margin-top:0">Instrument type</label><select onchange="eqd.type=this.value;if(!eqd.name)eqd.name=EQ_TYPES[this.value].n;soft()">${Object.entries(EQ_TYPES).map(([k,v])=>`<option value="${k}" ${e.type===k?'selected':''}>${esc(v.n)}</option>`).join('')}</select></div>
 <div><label style="margin-top:0">Name / model</label><input value="${esc(e.name)}" oninput="eqd.name=this.value" placeholder="${esc(EQ_TYPES[e.type].n)}"></div></div>
 <div class="f2"><div><label>Manufacturer</label><input value="${esc(e.maker)}" oninput="eqd.maker=this.value"></div><div><label>Serial number</label><input value="${esc(e.serial)}" oninput="eqd.serial=this.value"></div></div>
 <div class="f2"><div><label>Asset tag</label><input value="${esc(e.tag)}" oninput="eqd.tag=this.value"></div><div><label>Purchase date</label><input type="date" value="${e.purchased||''}" onchange="eqd.purchased=this.value"></div></div>
 <div class="f2"><div><label>Status</label><select onchange="eqd.status=this.value">${Object.entries(EQ_STATUS).map(([k,v])=>`<option value="${k}" ${e.status===k?'selected':''}>${v}</option>`).join('')}</select></div>
 <div><label>Assigned to</label><select onchange="eqd.assigned=this.value"><option value="">Unassigned</option>${S.people.map(p=>`<option value="${p.id}" ${String(e.assigned)===String(p.id)?'selected':''}>${esc(p.name)}</option>`).join('')}</select></div></div>
 <label>Probes, transducers and accessories</label>
 ${(e.probes||[]).map((p,i)=>`<div class="prb"><input value="${esc(p.name)}" placeholder="Probe / accessory" oninput="eqd.probes[${i}].name=this.value"><input value="${esc(p.serial)}" placeholder="Serial / ID" oninput="eqd.probes[${i}].serial=this.value"><input value="${esc(p.note)}" placeholder="Note (frequency, size…)" oninput="eqd.probes[${i}].note=this.value"><button class="xb" onclick="eqd.probes.splice(${i},1);soft()" aria-label="Remove">×</button></div>`).join('')}
 <button class="btn" style="margin-top:8px" onclick="eqd.probes.push({name:'',serial:'',note:''});soft()">+ Add probe / accessory</button>
 <label>Photo</label><div class="phr">${e.photo?`<div class="eqi big"><img data-fid="${e.photo.fid}" alt=""></div>`:''}<label class="btn" style="margin:0;text-transform:none;letter-spacing:0;font-size:15px;color:var(--tx)">${e.photo?'Replace photo':'Add photo'}<input type="file" accept="image/*" hidden onchange="eqPhoto(this.files[0])"></label></div>
 <label>Notes</label><textarea rows="3" oninput="eqd.notes=this.value">${esc(e.notes)}</textarea>
 <div class="actions"><button class="btn pri" onclick="eqSave()">Save equipment</button><button class="btn" onclick="eqd=null;go(${e.id?"'eq',"+e.id:"'equip'"})">Cancel</button></div></div>`}
async function eqPhoto(f){const r=await saveFile(f);if(r){eqd.photo=r;soft()}}
function eqSave(){const e=eqd;if(!e.name.trim()){toast('Enter a name or model.',null,false);return}
 e.name=e.name.trim();e.probes=(e.probes||[]).filter(p=>p.name.trim());
 if(e.id){const i=S.equipment.findIndex(x=>x.id===e.id);S.equipment[i]=e}else{e.id=S.nid++;S.equipment.push(e)}
 save();const id=e.id;eqd=null;toast('Equipment saved',null);go('eq',id)}
function eqDel(id){if(!confirm('Delete this equipment and its calibration and certificate records?'))return;
 S.cals.filter(c=>c.eq===id).forEach(c=>c.fid&&IDB.del(c.fid));S.certs.filter(c=>c.kind==='eq'&&c.owner===id).forEach(c=>c.fid&&IDB.del(c.fid));
 S.cals=S.cals.filter(c=>c.eq!==id);S.certs=S.certs.filter(c=>!(c.kind==='eq'&&c.owner===id));S.equipment=S.equipment.filter(e=>e.id!==id);save();go('equip')}
function eqdetail(){const e=eqById(sel);if(!e)return equip();const st=eqStatus(e),T=EQ_TYPES[e.type]||EQ_TYPES.other;
 const cals=S.cals.filter(c=>c.eq===e.id).sort((a,b)=>b.date.localeCompare(a.date)),certs=S.certs.filter(c=>c.kind==='eq'&&c.owner===e.id);
 const use=[];S.spots.forEach(s=>s.readings.filter(r=>r.eq===e.id).forEach(r=>use.push({s,r})));
 return `<button class="back" onclick="go('equip')">‹ Equipment</button>
 <div class="card glow eqd"><div class="eqi big">${eqIcon(e)}</div><div><h1 style="font-size:28px">${esc(e.name)}</h1><div class="sub">${esc(T.n)}${T.tech?' · '+esc(T.tech):''}</div>
 <div class="chs" style="margin-top:10px">${chip(st.st,st.txt)}${chip(e.status==='active'?'valid':'due',EQ_STATUS[e.status]||e.status)}${T.m.map(m=>`<span class="tg">${esc(m)}</span>`).join('')}</div></div></div>
 <div class="grid g2" style="margin:16px 0"><div class="card"><h3>Details</h3><div class="dk">
 <div><small>Manufacturer</small><b>${esc(e.maker||'–')}</b></div><div><small>Serial number</small><b>${esc(e.serial||'–')}</b></div><div><small>Asset tag</small><b>${esc(e.tag||'–')}</b></div>
 <div><small>Purchased</small><b>${e.purchased||'–'}</b></div><div><small>Assigned to</small><b>${esc(personName(e.assigned)||'Unassigned')}</b></div>
 ${e.notes?`<div><small>Notes</small><b>${esc(e.notes)}</b></div>`:''}</div>
 <div class="actions"><button class="btn" onclick="eqEdit(${e.id})">Edit</button><button class="btn danger" onclick="eqDel(${e.id})">Delete</button></div></div>
 <div class="card"><h3>Probes and accessories · ${(e.probes||[]).length}</h3><div class="list">${(e.probes||[]).map(p=>`<div class="li"><div><b>${esc(p.name)}</b><small>${esc(p.serial)}${p.note?' · '+esc(p.note):''}</small></div></div>`).join('')||'<div class="empty">None recorded.</div>'}</div></div></div>
 <div class="grid g2"><div class="card"><h3>Calibrations · ${cals.length}</h3>${calRows(cals)}<details class="frm"><summary class="btn pri">Log calibration</summary>${calForm(e.id)}</details></div>
 <div class="card"><h3>Certificates · ${certs.length}</h3>${certRows(certs)}<details class="frm"><summary class="btn pri">Add certificate</summary>${certForm('eq',e.id)}</details></div></div>
 <div class="card" style="margin-top:16px"><h3>Usage · ${use.length} reading${use.length===1?'':'s'}</h3><div class="list">${use.slice(0,8).map(({s,r})=>`<div class="li" style="cursor:pointer" onclick="go('spot',${s.id})"><div><b>${esc(TESTS[r.test]?TESTS[r.test].n:r.test)} · ${esc(String(r.value))} ${esc(r.unit||'')}</b><small>${did(s)} · ${esc(bName(s.b))} · ${new Date(r.at).toLocaleDateString('en-GB')}</small></div></div>`).join('')||'<div class="empty">Not used in any readings yet.</div>'}</div></div>`}
// calibrations
function calRows(cals){if(!cals.length)return '<div class="empty">No calibration records.</div>';
 return `<div class="list">${cals.map(c=>{const s=dstat(c.due),e=eqById(c.eq),v=c.ver&&c.ver.expected!==''?(Math.abs(c.ver.measured-c.ver.expected)<=c.ver.tol):null;
 return `<div class="li"><div><b>${c.date} · ${esc(c.certNo||'no certificate no.')}</b><small>${e?esc(e.name)+' · ':''}${esc(c.lab||'')} · ${esc(c.result)}${v===null?'':' · check '+c.ver.measured+' vs '+c.ver.expected+' ±'+c.ver.tol+(v?' OK':' FAIL')}</small>${fileChip(c.fid,c.fname)}</div>
 <div class="rt">${chip(s.st,s.st==='expired'?'Expired '+(-s.n)+' d':s.st==='due'?'Due '+s.n+' d':'Until '+c.due)}<button class="xb" onclick="calDel(${c.id})" aria-label="Delete">×</button></div></div>`}).join('')}</div>`}
function calForm(eqId){return `<form onsubmit="saveCal(event)" class="sub-f"><input type="hidden" name="locked" value="${eqId||''}">
 ${eqId?'':`<label style="margin-top:0">Equipment</label><select name="eq">${S.equipment.map(e=>`<option value="${e.id}">${esc(e.name)} · ${esc(e.serial)}</option>`).join('')}</select>`}
 <div class="f2"><div><label${eqId?' style="margin-top:0"':''}>Calibration date</label><input type="date" name="date" value="${iso(today())}" required onchange="this.form.due.value=iso(new Date(this.value).getTime()+365*864e5)"></div><div><label${eqId?' style="margin-top:0"':''}>Next due</label><input type="date" name="due" value="${iso(today()+365*DAY)}" required></div></div>
 <div class="f2"><div><label>Calibration lab / accreditation</label><input name="lab" placeholder="e.g. ISO/IEC 17025 accredited lab"></div><div><label>Certificate no.</label><input name="certNo"></div></div>
 <div class="f2"><div><label>Result</label><select name="result"><option>Pass</option><option>Pass after adjustment</option><option>Fail</option></select></div><div><label>Certificate file (PDF or photo)</label><input type="file" name="file" accept="application/pdf,image/*"></div></div>
 <label>Verification check (optional) · e.g. Schmidt test anvil</label><div class="f3"><input name="vexp" type="number" step="any" placeholder="Expected"><input name="vmeas" type="number" step="any" placeholder="Measured"><input name="vtol" type="number" step="any" placeholder="Tolerance ±"></div>
 <label>Notes</label><textarea name="notes" rows="2"></textarea>
 <label class="cf" style="margin:10px 0 0"><input type="checkbox" name="addcert" checked><span>Also add to the certificate register</span></label>
 <div class="actions"><button class="btn pri">Save calibration</button></div></form>`}
async function saveCal(e){e.preventDefault();const f=e.target,fm=new FormData(f),v=k=>fm.get(k);const eq=+(v('locked')||v('eq'));
 const sub=f.querySelector('button.pri');sub.disabled=true;const file=await saveFile(f.file.files[0]);
 const ver=v('vexp')!==''&&v('vmeas')!==''?{expected:+v('vexp'),measured:+v('vmeas'),tol:+(v('vtol')||0)}:null;
 const c={id:S.nid++,eq,date:v('date'),due:v('due'),lab:v('lab'),certNo:v('certNo'),result:v('result'),ver,notes:v('notes'),fid:file?file.fid:null,fname:file?file.name:''};S.cals.push(c);
 if(v('addcert'))S.certs.push({id:S.nid++,kind:'eq',owner:eq,type:'Calibration certificate',number:c.certNo,issuer:c.lab,issued:c.date,expires:c.due,fid:c.fid,fname:c.fname,notes:''});
 if(c.result==='Fail'){const q=eqById(eq);if(q){q.status='out'}}
 audit('Calibration logged',null);save();toast(c.result==='Fail'?'Calibration failed: instrument marked out of service.':'Calibration saved',null,c.result!=='Fail');soft()}
function calDel(id){if(!confirm('Delete this calibration record?'))return;const c=S.cals.find(x=>x.id===id);if(c&&c.fid&&!S.certs.some(x=>x.fid===c.fid))IDB.del(c.fid);S.cals=S.cals.filter(x=>x.id!==id);save();soft()}
function eqCals(){return `<div class="grid g2"><div class="card"><h3>All calibrations</h3>${calRows([...S.cals].sort((a,b)=>a.due.localeCompare(b.due)))}</div><div class="card"><h3>Log calibration</h3>${S.equipment.length?calForm(null):'<div class="empty">Add equipment first.</div>'}</div></div>`}
// certificates
function certRows(certs){if(!certs.length)return '<div class="empty">No certificates.</div>';
 return `<div class="list">${certs.map(c=>{const s=dstat(c.expires),own=c.kind==='eq'?(eqById(c.owner)||{}).name:personName(c.owner);
 return `<div class="li"><div><b>${esc(c.type)}${c.number?' · '+esc(c.number):''}</b><small>${esc(own||'')} · ${esc(c.issuer||'')} · issued ${c.issued||'–'}</small>${fileChip(c.fid,c.fname)}</div>
 <div class="rt">${c.expires?chip(s.st,s.st==='expired'?'Expired '+(-s.n)+' d':s.st==='due'?'Expires '+s.n+' d':'Until '+c.expires):chip('valid','No expiry')}<button class="xb" onclick="certDel(${c.id})" aria-label="Delete">×</button></div></div>`}).join('')}</div>`}
function certForm(kind,owner){const pick=owner==null;
 return `<form onsubmit="saveCert(event)" class="sub-f"><input type="hidden" name="kind" value="${kind||''}"><input type="hidden" name="owner" value="${owner??''}">
 ${pick?`<label style="margin-top:0">Belongs to</label><select name="who">${S.equipment.map(e=>`<option value="eq:${e.id}">${esc(e.name)} (equipment)</option>`).join('')}${S.people.map(p=>`<option value="p:${p.id}">${esc(p.name)} (person)</option>`).join('')}</select>`:''}
 <div class="f2"><div><label${pick?'':' style="margin-top:0"'}>Type</label><select name="type">${CERT_TYPES.map(t=>`<option>${t}</option>`).join('')}</select></div><div><label${pick?'':' style="margin-top:0"'}>Certificate no.</label><input name="number"></div></div>
 <div class="f2"><div><label>Issued by</label><input name="issuer"></div><div><label>File (PDF or photo)</label><input type="file" name="file" accept="application/pdf,image/*"></div></div>
 <div class="f2"><div><label>Issue date</label><input type="date" name="issued" value="${iso(today())}"></div><div><label>Expiry date (blank = none)</label><input type="date" name="expires"></div></div>
 <label>Notes</label><input name="notes"><div class="actions"><button class="btn pri">Save certificate</button></div></form>`}
async function saveCert(e){e.preventDefault();const f=e.target,fm=new FormData(f),v=k=>fm.get(k);let kind=v('kind'),owner=+v('owner');
 if(v('who')){const [k,i]=v('who').split(':');kind=k;owner=+i}
 f.querySelector('button.pri').disabled=true;const file=await saveFile(f.file.files[0]);
 S.certs.push({id:S.nid++,kind,owner,type:v('type'),number:v('number'),issuer:v('issuer'),issued:v('issued'),expires:v('expires'),notes:v('notes'),fid:file?file.fid:null,fname:file?file.name:''});
 save();toast('Certificate saved',null);soft()}
function certDel(id){if(!confirm('Delete this certificate?'))return;const c=S.certs.find(x=>x.id===id);if(c&&c.fid&&!S.cals.some(x=>x.fid===c.fid))IDB.del(c.fid);S.certs=S.certs.filter(x=>x.id!==id);save();soft()}
function eqCerts(){return `<div class="grid g2"><div class="card"><h3>All certificates</h3>${certRows([...S.certs].sort((a,b)=>(a.expires||'9999').localeCompare(b.expires||'9999')))}</div><div class="card"><h3>Add certificate</h3>${S.equipment.length||S.people.length?certForm(null,null):'<div class="empty">Add equipment or people first.</div>'}</div></div>`}
// team
function eqTeam(){return `<div class="grid g2"><div class="card"><h3>Team · ${S.people.length}</h3>${S.people.map(p=>{const cs=S.certs.filter(c=>c.kind==='p'&&c.owner===p.id);
 return `<div class="tm"><div class="li" style="padding-top:0"><div><b>${esc(p.name)}</b><small>${esc(p.role||'')}${p.licence?' · '+esc(p.licence):''}${p.email?' · '+esc(p.email):''}</small></div><button class="xb" onclick="perDel(${p.id})" aria-label="Remove">×</button></div>${cs.length?certRows(cs):'<div class="sub">No certificates.</div>'}</div>`}).join('')||'<div class="empty">No team members.</div>'}</div>
 <div class="card"><h3>Add team member</h3><form onsubmit="savePer(event)"><label style="margin-top:0">Name</label><input name="name" required><div class="f2"><div><label>Role</label><input name="role" placeholder="Engineer, NDT technician…"></div><div><label>Licence / ID</label><input name="licence"></div></div><label>Email</label><input name="email" type="email"><div class="actions"><button class="btn pri">Add</button></div></form></div></div>`}
function savePer(e){const f=fd(e);S.people.push({id:S.nid++,name:f.name.trim(),role:f.role,licence:f.licence,email:f.email});save();soft()}
function perDel(id){if(!confirm('Remove this team member and their certificates?'))return;S.people=S.people.filter(p=>p.id!==id);S.certs=S.certs.filter(c=>!(c.kind==='p'&&c.owner===id));S.equipment.forEach(e=>{if(+e.assigned===id)e.assigned=''});save();soft()}
PAGES.equip=equip;PAGES.eq=eqdetail;PAGES.eqform=eqform;
