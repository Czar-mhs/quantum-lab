// ---- inspector checklist & annotation
const CK=[['Foundation & Structural',['Cracks in walls','Spalling concrete','Settlement','Structural deformation']],['MEP Systems',['Electrical systems','Plumbing systems','HVAC systems','Fire protection']],['Safety & Access',['Access & egress','Guardrails & barriers','Signage & lighting']]];
const CAMIC='<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>';
let ck=null;
function ckInit(){let by='';try{by=localStorage.getItem('amphr_insp')||''}catch(e){}
 ck={b:(S.buildings[0]||{}).id,done:{},finds:[],step:1,cur:null,confirm:false,by,due:iso(today()+365*DAY)}}
const pendingSync=()=>S.inspections.filter(i=>i.synced===false).length;
function chk(){if(!ck)ckInit();
 if(!S.buildings.length)return '<div class="card empty">Add a building first.</div>';
 const steps=[['01','Inspection Checklist'],['02','Annotate & Assess'],['03','Review & Submit']];
 return `<div class="steps">${steps.map(([n,l],i)=>`<button class="stepb ${ck.step===i+1?'on':''}" onclick="ckGo(${i+1})"><b>${n}</b><span>${l}</span></button>`).join('')}</div><div class="phone">${[0,ck1,ck2,ck3][ck.step]()}</div>`}
function ckGo(s){if(s===2&&!ck.cur){toast('Tap the camera button next to a checklist item to log a finding.',null,false);return}ck.step=s;soft()}
function ck1(){const total=CK.reduce((a,c)=>a+c[1].length,0),dn=Object.values(ck.done).filter(Boolean).length;
 return `<div class="ph-h"><b>Inspection Checklist</b><span class="sub" style="margin:0">${dn}/${total} checked</span></div>
 <label style="margin-top:0">Building</label><select onchange="ck.b=+this.value">${S.buildings.map(b=>`<option value="${b.id}" ${b.id===ck.b?'selected':''}>${esc(b.name)}</option>`).join('')}</select><div style="height:14px"></div>
 ${CK.map(([cat,items],ci)=>{const n=items.filter((_,ii)=>ck.done[ci+'-'+ii]).length;
  return `<div class="ckc"><div class="ckt"><span>${cat}</span><i>${n}/${items.length}</i></div>${items.map((l,ii)=>{const k=ci+'-'+ii,fc=ck.finds.filter(f=>f.key===k).length;
   return `<div class="cki"><label class="cf" style="margin:0;flex:1;align-items:center;gap:12px"><input type="checkbox" style="display:none" ${ck.done[k]?'checked':''} onchange="ck.done['${k}']=this.checked;soft()"><span class="bx" style="display:grid"></span><span class="t">${l}</span></label><button class="cam" aria-label="Log finding for ${l}" onclick="openFind('${k}')"><svg viewBox="0 0 24 24">${CAMIC}</svg>${fc?`<em>${fc}</em>`:''}</button></div>`}).join('')}</div>`}).join('')}
 <button class="btn pri wide" onclick="ckGo(3)">Review &amp; Submit</button>`}
function openFind(k){const [ci,ii]=k.split('-').map(Number);ck.cur={id:Date.now(),key:k,cat:CK[ci][0],label:CK[ci][1][ii],photo:'',pt:null,tag:'',sev:'medium',notes:'',isNew:true};ck.step=2;soft()}
function editFind(id){ck.cur=ck.finds.find(f=>f.id===id);ck.step=2;soft()}
function ck2(){const f=ck.cur;if(!f){ck.step=1;return ck1()}
 return `<div class="ph-h"><button class="xb" onclick="ck.cur=null;ck.step=1;soft()" aria-label="Back">‹</button><b>Annotate Finding</b><button class="xb" onclick="delFind()" aria-label="Delete finding" style="width:auto;padding:0 10px;font-size:13px">Delete</button></div>
 <div class="sub" style="margin:0 0 10px">${esc(f.cat)} · ${esc(f.label)}</div>
 <div class="photo" onclick="annTap(event)">${f.photo?`<img src="${f.photo}" alt="Finding photo" draggable="false">`:`<div class="ph"><svg viewBox="0 0 24 24" width="44" height="44" style="stroke:currentColor;fill:none;stroke-width:1.5">${CAMIC}</svg><div>Tap to add a photo</div></div>`}${f.photo&&f.pt?`<svg class="pt" style="left:${f.pt.x}%;top:${f.pt.y}%" viewBox="0 0 24 24"><path d="M4 4 20 10l-7 3-3 7z" fill="currentColor"/></svg><span class="tag" id="tagel" style="left:${f.pt.x}%;top:${f.pt.y}%;${f.tag?'':'display:none'}">${esc(f.tag)}</span>`:''}</div>
 <div class="actions" style="margin-top:12px"><button class="btn" style="flex:1" onclick="document.getElementById('cam').click()">${f.photo?'Retake Photo':'Take Photo'}</button><button class="btn" style="flex:1" onclick="document.getElementById('gal').click()">Gallery</button></div>
 <input id="cam" type="file" accept="image/*" capture="environment" hidden onchange="addPhoto(this.files[0])"><input id="gal" type="file" accept="image/*" hidden onchange="addPhoto(this.files[0])">
 <label>Callout label · tap the photo to place it</label><input value="${esc(f.tag)}" placeholder="e.g. 2cm wide" oninput="ck.cur.tag=this.value;tagLive()">
 <label>Severity</label><div class="sevc">${['critical','high','medium','low'].map(s=>`<button class="s-${s} ${f.sev===s?'on':''}" onclick="ck.cur.sev='${s}';soft()">${s[0].toUpperCase()+s.slice(1)}</button>`).join('')}</div>
 <label>Notes (optional)</label><textarea rows="3" oninput="ck.cur.notes=this.value">${esc(f.notes)}</textarea>
 <button class="btn pri wide" onclick="saveFind()">Save finding</button>`}
function tagLive(){const e=document.getElementById('tagel');if(e){e.textContent=ck.cur.tag;e.style.display=ck.cur.tag?'':'none'}}
function annTap(e){const f=ck.cur;if(!f.photo){document.getElementById('cam').click();return}
 const r=e.currentTarget.getBoundingClientRect();f.pt={x:Math.round((e.clientX-r.left)/r.width*100),y:Math.round((e.clientY-r.top)/r.height*100)};soft()}
function shrink(file,max=720,q=.6){return new Promise((res,rej)=>{const url=URL.createObjectURL(file),im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);res(c.toDataURL('image/jpeg',q))};im.onerror=()=>rej(new Error('bad image'));im.src=url})}
async function addPhoto(file){if(!file||!ck||!ck.cur)return;try{ck.cur.photo=await shrink(file);ck.cur.pt=null}catch(e){toast('Could not read that image.',null,false)}soft()}
function saveFind(){const f=ck.cur;if(f.isNew){delete f.isNew;ck.finds.push(f)}ck.done[f.key]=true;ck.cur=null;ck.step=1;toast('Finding saved',null);soft()}
function delFind(){const f=ck.cur;ck.finds=ck.finds.filter(x=>x.id!==f.id);ck.cur=null;ck.step=1;soft()}
function ck3(){const b=S.buildings.find(x=>x.id===ck.b),items=Object.values(ck.done).filter(Boolean).length,ph=ck.finds.filter(f=>f.photo).length,ps=pendingSync();
 return `<div class="ph-h"><button class="xb" onclick="ck.step=1;soft()" aria-label="Back">‹</button><b>Review &amp; Submit</b><span style="width:34px"></span></div>
 <div class="ckc"><div class="ckt"><span>Inspection Summary</span></div>
  <div class="li"><span>Building</span><span class="sumv">${esc(b?b.name:'')}</span></div><div class="li"><span>Checklist items</span><span class="sumv">${items}</span></div>
  <div class="li"><span>Issues found</span><span class="sumv">${ck.finds.length}</span></div><div class="li"><span>Photos attached</span><span class="sumv">${ph}</span></div></div>
 ${ck.finds.length?`<div class="ckc"><div class="ckt"><span>Findings</span></div>${ck.finds.map(f=>`<div class="li"><div><b>${esc(f.label)}</b><small>${esc(f.cat)}${f.tag?' · '+esc(f.tag):''}</small></div><div style="display:flex;gap:8px;align-items:center"><span class="pill p${{critical:'R',high:'O',medium:'Y',low:'G'}[f.sev]}">${f.sev}</span><button class="xb" onclick="editFind(${f.id})" aria-label="Edit finding">✎</button></div></div>`).join('')}</div>`:''}
 <div class="ckc"><div class="ckt"><span>Confirmation</span></div><div class="f2"><div><label style="margin-top:0">Inspector name</label><input value="${esc(ck.by)}" oninput="ck.by=this.value" placeholder="Your name"></div><div><label style="margin-top:0">Next due</label><input type="date" value="${ck.due}" onchange="ck.due=this.value"></div></div>
 <label class="cf"><input type="checkbox" ${ck.confirm?'checked':''} onchange="ck.confirm=this.checked"><span>I confirm that this inspection is accurate and complete</span></label>
 <button class="btn pri wide" style="margin-top:0" onclick="submitCk()">SUBMIT REPORT</button></div>
 <div class="offl"><svg viewBox="0 0 24 24"><path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9.5 3.5 3.5 0 0 1 17.5 18z"/></svg><div>Works offline, syncs on WiFi<small><span class="ob" style="background:${navigator.onLine?'var(--g)':'var(--o)'}"></span>${navigator.onLine?'Online':'Offline: reports queue on this device'} · demo sync is simulated${ps?` · ${ps} waiting`:''}</small></div></div>`}
async function submitCk(){const b=S.buildings.find(x=>x.id===ck.b);if(!b)return;
 if(!ck.by.trim()){toast('Enter the inspector name first.',null,false);return}
 if(!ck.confirm){toast('Tick the confirmation box to submit.',null,false);return}
 const dn=Object.values(ck.done).filter(Boolean).length;
 if(!dn&&!ck.finds.length){toast('Complete at least one checklist item first.',null,false);return}
 try{localStorage.setItem('amphr_insp',ck.by)}catch(e){}
 const cnt=s=>ck.finds.filter(f=>f.sev===s).length,safety=ck.finds.filter(f=>f.cat==='Safety & Access').length;
 const [a,z]=applyInspection(b,{date:iso(today()),by:ck.by.trim(),notes:`Field checklist: ${dn} items checked, ${ck.finds.length} issue(s).`+(ck.finds.length?' '+ck.finds.map(f=>f.label+(f.tag?' ('+f.tag+')':'')).join('; ')+'.':''),crit:cnt('critical'),high:cnt('high'),safety,due:ck.due});
 const rec=S.inspections[S.inspections.length-1];rec.findings=ck.finds.map(f=>({item:f.label,cat:f.cat,sev:f.sev,tag:f.tag,notes:f.notes,photo:f.photo}));
 const off=!navigator.onLine;if(off)rec.synced=false;
 await spotsFromFindings(b.id,ck.finds.map(f=>({t:f.label+(f.tag?' ('+f.tag+')':''),sev:f.sev,photo:f.photo,pt:f.pt,tag:f.tag,src:'field checklist'})),ck.by.trim());save();ck=null;toast(off?'Saved offline. Will sync on WiFi':'Report submitted · building health updated',`${a}% to ${z}%`);go('detail',b.id)}
