// spot record: details, photos with callouts, instrument readings, grade confirmation, history
let spd=null,spv=0,gd=null,rdt='hc',rdOpen=false;
const WALLS=[[330,140,330,300],[560,60,560,300],[740,60,740,300],[330,300,620,300],[690,300,900,300],[130,400,430,400],[430,400,430,640],[130,520,300,520],[620,400,900,400],[620,400,620,640],[780,520,900,520]];
const curSpot=()=>sel==='new'?spd:S.spots.find(x=>x.id===sel);
function spotNew(pre={}){const b=pre.b||(S.buildings[0]||{}).id;
 spd={id:0,isNew:true,b,level:pre.level||1,zone:pre.x!=null?zoneOf(pre.x):'A',type:'',sev:'low',status:'Open',det:iso(today()),x:pre.x??null,y:pre.y??null,health:SEVH.low,element:'Slab',cat:'crack',material:'Concrete',repair:CATS.crack.fix,repairEdited:false,photos:[],readings:[],confirmed:false,grade:null,hist:[]};
 spv=0;gd=null;go('spot','new')}
function sHist(s,what){if(!s.isNew)s.hist.push({t:Date.now(),who:S.settings.engineer||'User',what})}
function sRecalc(s){if(!s.confirmed){s.sev=spotSuggest(s)}s.health=SEVH[s.sev]}
function sSet(k,v){const s=curSpot();if(!s)return;s[k]=v;
 if(k==='cat'){if(!s.repairEdited)s.repair=CATS[v].fix;sRecalc(s)}
 if(k==='repair')s.repairEdited=true;
 if(k==='b'){s.level=1}
 if(!s.isNew){save();if(['cat','b','element','status'].includes(k))sHist(s,{cat:'Category changed',b:'Building changed',element:'Element changed',status:'Status set to '+v}[k]);save()}
 if(['cat','b','element','status'].includes(k))soft()}
function mpTap(e){const s=curSpot(),svg=e.currentTarget,p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(svg.getScreenCTM().inverse());
 if(q.x<130||q.x>900||q.y<70||q.y>640)return;s.x=Math.round(q.x);s.y=Math.round(q.y);s.zone=zoneOf(s.x);if(!s.isNew){save();sHist(s,'Location moved');save()}soft()}
function miniPlan(s){return `<svg viewBox="0 0 1000 700" class="mpl" onclick="mpTap(event)" role="img" aria-label="Tap to place the spot"><rect width="1000" height="700" fill="#06090b"/><path d="M130 140H330V60H900V640H130Z" fill="rgba(255,255,255,.03)"/>
 <g stroke="#56636a" stroke-width="7" fill="none"><path d="M130 140H330V60H900V640H130Z"/>${WALLS.map(w=>`<path d="M${w[0]} ${w[1]}L${w[2]} ${w[3]}"/>`).join('')}</g>
 ${s.x!=null?`<g transform="translate(${s.x} ${s.y}) scale(1.4)"><path d="M0 0C-10-14-17-22-17-31a17 17 0 1 1 34 0C17-22 10-14 0 0Z" fill="${SEVC[s.sev]}"/><circle cx="0" cy="-31" r="6.5" fill="#0b0f10"/></g>`:''}</svg>`}
// photos
async function spPhotos(files){const s=curSpot();for(const f of files){const r=await saveFile(f);if(r)s.photos.push({fid:r.fid,pt:null,tag:''})}
 if(!s.isNew){sHist(s,'Photo added');save()}spv=s.photos.length-1;soft()}
function spPhotoTap(e){const s=curSpot(),p=s.photos[spv];if(!p)return;const r=e.currentTarget.getBoundingClientRect();p.pt={x:Math.round((e.clientX-r.left)/r.width*100),y:Math.round((e.clientY-r.top)/r.height*100)};if(!s.isNew)save();soft()}
function spTag(v){const s=curSpot(),p=s.photos[spv];if(!p)return;p.tag=v;const t=document.getElementById('ptag');if(t){t.textContent=v;t.style.display=v&&p.pt?'':'none'}if(!s.isNew)save()}
function spPhotoDel(){const s=curSpot(),p=s.photos[spv];if(!p||!confirm('Remove this photo?'))return;IDB.del(p.fid);s.photos.splice(spv,1);spv=Math.max(0,spv-1);if(!s.isNew){sHist(s,'Photo removed');save()}soft()}
function photoBlock(s){const p=s.photos[spv];
 return `<div class="card"><h3>Photos · ${s.photos.length}</h3>
 <div class="photo big" ${p?'onclick="spPhotoTap(event)"':''}>${p?`<img data-fid="${p.fid}" alt="Spot photo" draggable="false">${p.pt?`<svg class="pt" style="left:${p.pt.x}%;top:${p.pt.y}%" viewBox="0 0 24 24"><path d="M4 4 20 10l-7 3-3 7z" fill="currentColor"/></svg><span class="tag" id="ptag" style="left:${p.pt.x}%;top:${p.pt.y}%;${p.tag?'':'display:none'}">${esc(p.tag)}</span>`:''}`:`<div class="ph"><svg viewBox="0 0 24 24" width="44" height="44" style="stroke:currentColor;fill:none;stroke-width:1.5">${CAMIC}</svg><div>No photo yet</div></div>`}</div>
 ${s.photos.length>1?`<div class="thumbs">${s.photos.map((q,i)=>`<button class="${i===spv?'on':''}" onclick="spv=${i};soft()"><img data-fid="${q.fid}" alt=""></button>`).join('')}</div>`:''}
 <div class="actions" style="margin-top:12px"><button class="btn" onclick="document.getElementById('pcam').click()">Take photo</button><button class="btn" onclick="document.getElementById('pgal').click()">From gallery</button>${p?`<button class="btn danger" onclick="spPhotoDel()">Remove</button>`:''}</div>
 <input id="pcam" type="file" accept="image/*" capture="environment" hidden onchange="spPhotos(this.files)"><input id="pgal" type="file" accept="image/*" multiple hidden onchange="spPhotos(this.files)">
 ${p?`<label>Callout label · tap the photo to place the arrow</label><input value="${esc(p.tag)}" placeholder="e.g. crack 2 mm wide" oninput="spTag(this.value)">`:''}</div>`}
// readings
function eqOptions(test){const L=S.equipment.filter(e=>e.status==='active'&&(EQ_TYPES[e.type]||EQ_TYPES.other).tests.includes(test));
 return L.map(e=>{const st=eqStatus(e);return `<option value="${e.id}">${esc(e.name)} · ${esc(e.serial||e.tag||'')} — ${esc(st.txt)}</option>`}).join('')}
function rdForm(s){const T=TESTS[rdt],eo=eqOptions(rdt);
 return `<form onsubmit="addReading(event)" class="sub-f"><div class="f2"><div><label style="margin-top:0">Test</label><select name="test" onchange="rdt=this.value;rdOpen=true;soft()">${Object.entries(TESTS).map(([k,v])=>`<option value="${k}" ${rdt===k?'selected':''}>${esc(v.n)}</option>`).join('')}</select></div>
 <div><label style="margin-top:0">Instrument</label><select name="eq" ${eo?'':'disabled'}>${eo||'<option value="">No suitable instrument registered</option>'}</select></div></div>
 ${rdt==='rebound'?`<label>Rebound readings (10 or more, separated by commas or spaces)</label><textarea name="value" rows="2" placeholder="e.g. 38 41 40 39 37 42 40 39 41 38"></textarea>
 <div class="f2"><div><label>Estimated strength, MPa (from calibrated curve)</label><input name="est" type="number" step="any"></div><div><label>Required strength, MPa</label><input name="fck" type="number" step="any"></div></div>`
 :`<div class="f2"><div><label>Value</label><input name="value" type="number" step="any"></div><div><label>Unit</label><select name="unit">${T.u.map(u=>`<option>${esc(u)}</option>`).join('')}</select></div></div>
 ${rdt==='cover'?`<label>Specified minimum cover (mm)</label><input name="spec" type="number" step="any" value="${S.criteria.cover}">`:''}
 ${T.sub?`<label>Measurement</label><select name="sub">${T.sub.map(u=>`<option>${u}</option>`).join('')}</select>`:''}
 ${['gpr','ie','pe'].includes(rdt)?`<label class="cf"><input type="checkbox" name="flag"><span>Anomaly indicated (void, delamination, missing cover)</span></label>`:''}
 <details class="frm"><summary class="btn">Add many values</summary><label style="margin-top:8px">One per line: value, point label</label><textarea name="bulk" rows="4" placeholder="-210, A1&#10;-245, A2&#10;-380, A3"></textarea></details>`}
 <input type="hidden" name="unit0" value="${esc(T.u[0])}">
 <div class="f2"><div><label>Point / grid reference</label><input name="point" placeholder="e.g. C4"></div><div><label>Note</label><input name="note"></div></div>
 <div class="actions"><button class="btn pri">Add reading</button></div></form>`}
function addReading(e){const f=fd(e),s=curSpot();if(!s)return;const eq=f.eq?+f.eq:null;const unit=f.unit||f.unit0;
 if(!eq&&rdt!=='crack'&&!confirm('No instrument selected. Add the reading anyway?'))return;
 if(eq){const q=eqById(eq),st=eqStatus(q);if(['expired','none'].includes(st.st)&&!confirm(`${q.name}: ${st.txt}.\nReadings from an instrument without a valid calibration may not be accepted in a report.\nAdd the reading anyway?`))return}
 const mk=(value,extra)=>({id:uid('r'),test:rdt,value,unit,eq,at:Date.now(),by:S.settings.engineer||'',note:f.note||'',extra,calSt:eq?eqStatus(eqById(eq)).st:'na',calNo:eq&&eqStatus(eqById(eq)).cal?eqStatus(eqById(eq)).cal.certNo:''});
 const out=[];
 if(rdt==='rebound'){const raw=(f.value||'').split(/[\s,;]+/).map(Number).filter(x=>x>0&&!isNaN(x));
  if(raw.length<3){toast('Enter at least 3 rebound readings.',null,false);return}
  const so=[...raw].sort((a,b)=>a-b),med=(so[Math.floor((so.length-1)/2)]+so[Math.ceil((so.length-1)/2)])/2,kept=raw.filter(x=>Math.abs(x-med)<=6),mean=kept.reduce((a,b)=>a+b,0)/kept.length,sd=Math.sqrt(kept.reduce((a,b)=>a+(b-mean)**2,0)/kept.length);
  out.push(mk(+mean.toFixed(1),{point:f.point,raw,kept:kept.length,cov:+(sd/mean*100).toFixed(1),est:f.est||'',fck:f.fck||''}))}
 else{const base={point:f.point||'',spec:f.spec,sub:f.sub,flag:!!f.flag};
  if((f.bulk||'').trim()){(f.bulk).split('\n').forEach(l=>{const [v,p]=l.split(',');const n=parseFloat(v);if(!isNaN(n))out.push(mk(n,{...base,point:(p||'').trim()||base.point}))})}
  else{const n=parseFloat(f.value);if(isNaN(n)){toast('Enter a numeric value.',null,false);return}out.push(mk(n,base))}}
 if(!out.length){toast('No valid values found.',null,false);return}
 s.readings.push(...out);sRecalc(s);sHist(s,`${out.length} ${TESTS[rdt].n} reading${out.length>1?'s':''} added`);rdOpen=false;if(!s.isNew)save();toast(`${out.length} reading${out.length>1?'s':''} added`,null);soft()}
function rdDel(id){const s=curSpot();if(!confirm('Delete this reading?'))return;s.readings=s.readings.filter(r=>r.id!==id);sRecalc(s);sHist(s,'Reading deleted');if(!s.isNew)save();soft()}
function rdRows(s){if(!s.readings.length)return '<div class="empty">No instrument readings yet.</div>';
 return `<div class="list">${s.readings.map(r=>{const i=interp(r),q=r.eq?eqById(r.eq):null,x=r.extra||{};
 const detail=r.test==='rebound'?`${x.kept}/${(x.raw||[]).length} readings used, CoV ${x.cov}%`:x.sub||'';
 return `<div class="li"><div><b>${esc(TESTS[r.test]?TESTS[r.test].n:r.test)} · ${esc(String(r.value))} ${esc(r.unit||'')}</b><small>${esc(i.t)}${detail?' · '+esc(detail):''}${x.point?' · pt '+esc(x.point):''}</small>
 <small>${q?esc(q.name)+' S/N '+esc(q.serial)+' · '+(r.calSt==='expired'||r.calSt==='none'?'<span style="color:var(--r)">calibration not valid at test</span>':'calibrated'+(r.calNo?' ('+esc(r.calNo)+')':'')):'No instrument'} · ${new Date(r.at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})} · ${esc(r.by||'')}</small></div>
 <div class="rt">${sevP(i.sev)}<button class="xb" onclick="rdDel('${r.id}')" aria-label="Delete reading">×</button></div></div>`}).join('')}</div>`}
// grade
function gradeBlock(s){const sg=spotSuggest(s);if(!gd||gd.id!==s.id)gd={id:s.id,sev:s.sev==='none'?sg:s.sev,reason:''};
 const warn=s.confirmed&&sevRank(sg)>sevRank(s.sev);
 return `<div class="card"><h3>Grade</h3><div class="sub" style="margin:0 0 10px">Suggested by rules: ${sevP(sg)} <span style="color:var(--mut)">${esc(suggestWhy(s))}</span></div>
 ${warn?`<div class="warn">Readings now suggest a higher grade than the confirmed one. Review and re-confirm.</div>`:''}
 <div class="sevc four">${['low','medium','high','critical'].map(k=>`<button class="s-${k} ${gd.sev===k?'on':''}" onclick="gd.sev='${k}';soft()">${SEVN[k]}</button>`).join('')}</div>
 <label>Reason ${gd.sev!==sg||s.confirmed?'(required if different from the suggestion or the confirmed grade)':'(optional)'}</label><input value="${esc(gd.reason)}" oninput="gd.reason=this.value" placeholder="Why this grade?">
 <div class="actions"><button class="btn pri" onclick="confirmGrade()">${s.confirmed?'Update grade':'Confirm grade'}</button></div>
 <div class="sub" style="margin-top:10px">${s.confirmed&&s.grade?`Confirmed ${SEVN[s.grade.sev]} by ${esc(s.grade.by)} on ${new Date(s.grade.at).toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}${s.grade.reason?' · '+esc(s.grade.reason):''}`:'Not confirmed. The grade stays provisional in reports until an engineer confirms it.'}</div></div>`}
function confirmGrade(){const s=curSpot(),sg=spotSuggest(s);
 if(!(S.settings.engineer||'').trim()){toast('Set the engineer name in Settings first.',null,false);return}
 if((gd.sev!==sg||(s.confirmed&&gd.sev!==s.sev))&&!gd.reason.trim()){toast('Add a reason for this grade.',null,false);return}
 s.sev=gd.sev;s.health=SEVH[s.sev];s.confirmed=true;s.grade={sev:gd.sev,by:S.settings.engineer,at:Date.now(),reason:gd.reason.trim()};
 sHist(s,'Grade confirmed: '+SEVN[s.sev]+(gd.reason?' ('+gd.reason.trim()+')':''));if(!s.isNew)save();gd=null;toast('Grade confirmed',null);soft()}
function spSave(){const s=spd;if(!s.b){toast('Add a building first.',null,false);return}
 if(!s.type.trim())s.type=CATS[s.cat].n;
 s.id=S.did++;delete s.isNew;s.hist.unshift({t:Date.now(),who:S.settings.engineer||'User',what:'Spot captured'});sRecalc(s);S.spots.push(s);save();spd=null;gd=null;toast('Spot saved. Confirm the grade when ready.',null);go('spot',s.id)}
function spDel(){const s=curSpot();if(!confirm('Delete this spot and its photos?'))return;s.photos.forEach(p=>IDB.del(p.fid));S.spots=S.spots.filter(x=>x.id!==s.id);save();go('spots')}
function spotPage(){const s=curSpot();if(!s){return spotsPage()}
 const b=S.buildings.find(x=>x.id===s.b),nL=b?Math.min(b.floors,80):1,lv=new Set(Array.from({length:nL},(_,i)=>i+1));lv.add(s.level);
 return `<button class="back" onclick="${s.isNew?'spd=null;':''}go('spots')">‹ Spots</button>
 <div class="top"><div><h1>${s.isNew?'New spot':'Spot '+did(s)}</h1><div class="sub">${esc(bName(s.b))} · Level ${String(s.level).padStart(2,'0')} · Zone ${s.zone} ${s.isNew?'':sevP(s.sev)}</div></div>${s.isNew?`<button class="btn pri" onclick="spSave()">Save spot</button>`:`<button class="btn" onclick="go('plan');pb=${s.b};plv=${s.level};selD=${s.id};render()">View on floor plan</button>`}</div>
 <div class="grid g2 spg"><div>${photoBlock(s)}
 <div class="card" style="margin-top:16px"><h3>Location</h3><div class="sub" style="margin:0 0 8px">${s.x!=null?'Tap the plan to move the pin.':'Tap the plan to place the pin (optional).'}</div>${miniPlan(s)}</div></div>
 <div><div class="card"><h3>Details</h3><div class="f2"><div><label style="margin-top:0">Building</label><select onchange="sSet('b',+this.value)">${S.buildings.map(x=>`<option value="${x.id}" ${x.id===s.b?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div>
 <div><label style="margin-top:0">Level</label><select onchange="sSet('level',+this.value)">${[...lv].sort((a,c)=>a-c).map(l=>`<option value="${l}" ${l===s.level?'selected':''}>Level ${String(l).padStart(2,'0')}</option>`).join('')}</select></div></div>
 <div class="f2"><div><label>Element</label><select onchange="sSet('element',this.value)">${ELEMENTS.map(x=>`<option ${s.element===x?'selected':''}>${x}</option>`).join('')}</select></div><div><label>Material</label><input value="${esc(s.material)}" oninput="sSet('material',this.value)"></div></div>
 <div class="f2"><div><label>Category</label><select onchange="sSet('cat',this.value)">${Object.entries(CATS).map(([k,v])=>`<option value="${k}" ${s.cat===k?'selected':''}>${esc(v.n)}</option>`).join('')}</select></div><div><label>Status</label><select onchange="sSet('status',this.value)">${['Open','In progress','Resolved'].map(x=>`<option ${s.status===x?'selected':''}>${x}</option>`).join('')}</select></div></div>
 <label>Description</label><input value="${esc(s.type)}" oninput="sSet('type',this.value)" placeholder="${esc(CATS[s.cat].n)}">
 <label>Repair method <a class="lnk" style="text-transform:none;letter-spacing:0;font-weight:500" onclick="const s=curSpot();s.repair=CATS[s.cat].fix;s.repairEdited=false;if(!s.isNew)save();soft()">reset to suggestion</a></label><textarea rows="4" oninput="sSet('repair',this.value)">${esc(s.repair)}</textarea>
 <div class="sub" style="margin-top:6px">Suggested text is generic guidance. The engineer confirms the repair method.</div></div>
 <div class="card" style="margin-top:16px"><h3>Instrument readings · ${s.readings.length}</h3>${rdRows(s)}<details class="frm" ${s.readings.length&&!rdOpen?'':'open'} ontoggle="rdOpen=this.open"><summary class="btn pri">Add reading</summary>${rdForm(s)}</details></div></div></div>
 <div style="margin-top:16px">${gradeBlock(s)}</div>
 ${s.isNew?`<div class="actions"><button class="btn pri" onclick="spSave()">Save spot</button></div>`:`<div class="card" style="margin-top:16px"><h3>History</h3><div class="list">${[...s.hist].reverse().map(h=>`<div class="li"><div><b>${esc(h.what)}</b><small>${esc(h.who)} · ${new Date(h.t).toLocaleString('en-GB',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</small></div></div>`).join('')||'<div class="empty">No history.</div>'}</div></div><div class="actions"><button class="btn danger" onclick="spDel()">Delete spot</button></div>`}`}
PAGES.spot=spotPage;
// create spots from checklist / uploaded-report findings
const catFromText=t=>/spall/i.test(t)?'spall':/corro|rebar|rust/i.test(t)?'corr':/crack/i.test(t)?'crack':/water|leak|damp|ingress|moist/i.test(t)?'water':/delam|hollow/i.test(t)?'delam':/honey|void/i.test(t)?'honey':/settle|deform/i.test(t)?'settle':/efflor/i.test(t)?'effl':/seal|joint/i.test(t)?'seal':/paint|finish|peel/i.test(t)?'finish':'other';
const elFromText=t=>{const m={column:'Column',beam:'Beam',slab:'Slab',wall:'Wall',ceiling:'Ceiling',floor:'Floor',facade:'Facade',roof:'Roof',foundation:'Foundation',stair:'Stair',door:'Door / window',window:'Door / window',electrical:'MEP',plumbing:'MEP',hvac:'MEP',fire:'MEP'};const k=Object.keys(m).find(x=>t.toLowerCase().includes(x));return k?m[k]:'Other'};
async function spotsFromFindings(bId,items,who){let n=0;for(const it of items){const cat=it.cat||catFromText(it.t),s={id:S.did++,b:bId,level:it.level||1,zone:'A',type:it.t,sev:it.sev,status:'Open',det:iso(today()),x:null,y:null,health:SEVH[it.sev]||66,element:it.element||elFromText(it.t),cat,material:'Concrete',repair:CATS[cat].fix,photos:[],readings:[],confirmed:false,grade:null,hist:[{t:Date.now(),who:who||'User',what:'Captured from '+(it.src||'inspection')}]};
 if(it.photo){try{const b=await (await fetch(it.photo)).blob(),fid=uid('f');await IDB.put(fid,b);s.photos.push({fid,pt:it.pt||null,tag:it.tag||''})}catch(e){}}
 s.sev=it.sev;S.spots.push(s);n++}save();return n}
