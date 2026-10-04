function assets(){
 return head('Assets',`${S.assets.length} registered`,`<div class="actions" style="margin:0"><button class="btn pri" onclick="exp()">Export CSV</button><label class="btn" style="margin:0;text-transform:none;letter-spacing:0;font-size:15px;color:var(--tx)">Import CSV<input type="file" accept=".csv" style="display:none" onchange="imp(this.files[0])"></label></div>`)+
 `<div class="grid g2"><div class="card"><div class="list">${S.assets.map(a=>`<div class="li"><div><b>${esc(a.name)}</b><small>${esc((S.buildings.find(b=>b.id===a.b)||{}).name||'#'+a.b)} · ${esc(a.type)}</small></div>${sp(a.status)}</div>`).join('')||'<div class="empty">No assets.</div>'}</div>
 <p class="sub" style="margin:10px 4px 0">CSV columns: building_id, name, type, status</p></div>
 <div class="card"><h3>Add asset</h3><form onsubmit="addA(event)"><label style="margin-top:0">Building</label><select name="b">${S.buildings.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join('')}</select>
 <label>Name</label><input name="name" required><div class="f2"><div><label>Type</label><input name="type" required></div><div><label>Status</label><select name="status"><option>Good</option><option>Fair</option><option>Poor</option><option>Critical</option></select></div></div>
 <div class="actions"><button class="btn pri">Add asset</button></div></form></div></div>`}
function man(){
 return ''+
 `<div class="grid g2"><div class="card"><form onsubmit="addI(event)">
 <label style="margin-top:0">Building</label><select name="b">${S.buildings.map(b=>`<option value="${b.id}" ${String(b.id)===String(sel)?'selected':''}>${esc(b.name)}</option>`).join('')}</select>
 <div class="f2"><div><label>Inspector</label><input name="by" required></div><div><label>Date</label><input type="date" name="date" value="${iso(today())}" required></div></div>
 <div class="f3"><div><label>Critical</label><input type="number" min="0" name="critical" value="0" inputmode="numeric"></div><div><label>High</label><input type="number" min="0" name="high" value="0" inputmode="numeric"></div><div><label>Safety</label><input type="number" min="0" name="safety" value="0" inputmode="numeric"></div></div>
 <div class="f2"><div><label>Compliance</label><select name="compliance"><option value="compliant">Compliant</option><option value="due">Due soon</option><option value="non">Non-compliant</option></select></div><div><label>Next due</label><input type="date" name="due" required></div></div>
 <label>Notes</label><textarea name="notes" rows="3"></textarea>
 <p class="sub" style="margin:10px 0 0">For photos and instrument readings, add a spot.</p>
 <div class="actions"><button class="btn pri">Save inspection</button></div></form></div>
 <div class="card"><h3>History</h3><div class="list">${[...S.inspections].reverse().map(i=>`<div class="li"><div><b>${esc((S.buildings.find(b=>b.id===i.b)||{}).name||'')}</b><small>${i.date} · ${esc(i.by)} — ${esc(i.notes)}</small></div></div>`).join('')||'<div class="empty">None yet.</div>'}</div></div></div>`}
function add(){
 return head('Add building','Register a new building in the portfolio')+
 `<div class="card" style="max-width:640px"><form onsubmit="addB(event)"><label style="margin-top:0">Name</label><input name="name" required><label>Area</label><input name="area" required>
 <div class="f2"><div><label>Floors</label><input type="number" min="1" name="floors" value="10" inputmode="numeric"></div><div><label>Year built</label><input type="number" name="year" value="2020" inputmode="numeric"></div></div>
 <div class="f2"><div><label>Last inspection</label><input type="date" name="last" value="${iso(today())}" required></div><div><label>Next due</label><input type="date" name="due" required></div></div>
 <label>Compliance</label><select name="compliance"><option value="compliant">Compliant</option><option value="due">Due soon</option><option value="non">Non-compliant</option></select>
 <div class="actions"><button class="btn pri">Add building</button><button type="button" class="btn" onclick="if(confirm('Reset to demo data?')){S=seed();save();go('dash')}">Reset demo data</button></div></form></div>`}
function addB(e){const f=fd(e);S.buildings.push({id:S.nid++,name:f.name,area:f.area,floors:+f.floors,year:+f.year,compliance:f.compliance,lastInsp:f.last,dueDate:f.due,issues:{critical:0,high:0,safety:0}});save();go('dash')}
function delB(id){if(!confirm('Delete this building and its records?'))return;S.buildings=S.buildings.filter(b=>b.id!==id);S.assets=S.assets.filter(a=>a.b!==id);S.inspections=S.inspections.filter(i=>i.b!==id);save();go('dash')}
function addI(e){const f=fd(e),b=S.buildings.find(x=>x.id===+f.b);if(!b)return;
 S.inspections.push({id:S.nid++,b:b.id,date:f.date,by:f.by,notes:f.notes});
 b.lastInsp=f.date;b.dueDate=f.due;b.compliance=f.compliance;b.issues={critical:+f.critical,high:+f.high,safety:+f.safety};audit('Document uploaded',b.id);save();go('detail',b.id)}
function addA(e){const f=fd(e);S.assets.push({id:S.nid++,b:+f.b,name:f.name,type:f.type,status:f.status});save();render()}
function exp(){const q=v=>'"'+String(v).replace(/"/g,'""')+'"';
 const csv='building_id,name,type,status\n'+S.assets.map(a=>[a.b,q(a.name),q(a.type),a.status].join(',')).join('\n');
 const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));l.download='amphr_assets.csv';l.click()}
function parseCSV(t){const rows=[];let r=[],c='',q=false;for(let i=0;i<t.length;i++){const ch=t[i];
 if(q){if(ch=='"'&&t[i+1]=='"'){c+='"';i++}else if(ch=='"')q=false;else c+=ch}
 else if(ch=='"')q=true;else if(ch==','){r.push(c);c=''}else if(ch=='\n'||ch=='\r'){if(ch=='\r'&&t[i+1]=='\n')i++;r.push(c);c='';rows.push(r);r=[]}else c+=ch}
 if(c||r.length){r.push(c);rows.push(r)}return rows.filter(x=>x.some(v=>v.trim()))}
async function imp(f){if(!f)return;const rows=parseCSV(await f.text()).slice(1);let n=0,bad=0;
 rows.forEach(r=>{const[b,name,type,status]=r.map(x=>x.trim());
  if(S.buildings.some(x=>x.id===+b)&&name&&type&&['Good','Fair','Poor','Critical'].includes(status)){S.assets.push({id:S.nid++,b:+b,name,type,status});n++}else bad++});
 save();alert(`Imported ${n} assets. Skipped ${bad} invalid rows.`);render()}
PAGES.assets=assets;PAGES.add=add;
