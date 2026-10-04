// settings: organisation, engineer profile, acceptance criteria, backup and restore
const CRIT_ROWS=[
['upv','Ultrasonic pulse velocity (m/s)',['Excellent ≥','Good ≥','Medium ≥']],
['hc','Half-cell potential (mV CSE)',['No corrosion >','Uncertain >','Corrosion >']],
['res','Resistivity (kΩ·cm)',['Negligible >','Low >','Moderate >']],
['kt','Air permeability kT (×10⁻¹⁶ m²)',['PK1 <','PK2 <','PK3 <','PK4 <']],
['bond','Pull-off strength (MPa)',['Acceptable ≥','Marginal ≥']],
['crack','Crack width (mm)',['Minor <','Medium <','High <']],
['strength','Estimated / required strength',['OK ≥','Low ≥','Medium ≥']]];
function critSet(k,i,v){const n=parseFloat(v);if(isNaN(n))return;if(i<0)S.criteria[k]=n;else S.criteria[k][i]=n;save()}
function setPage(){const st=S.settings,cr=S.criteria;
 return head('Settings','Organisation, acceptance criteria and your data')+
 `<div class="grid g2"><div class="card"><h3>Organisation and engineer</h3>
 <label style="margin-top:0">Organisation (shown on reports)</label><input value="${esc(st.org)}" oninput="S.settings.org=this.value;save()">
 <div class="f2"><div><label>Signing engineer</label><input value="${esc(st.engineer)}" oninput="S.settings.engineer=this.value;save()"></div><div><label>Licence / registration no.</label><input value="${esc(st.licence)}" oninput="S.settings.licence=this.value;save()"></div></div>
 <p class="sub" style="margin-top:10px">The engineer name is recorded when a grade is confirmed or a reading is added.</p></div>
 <div class="card"><h3>Your data</h3><p class="sub" style="margin:0 0 12px">Everything is stored in this browser. Download a backup before clearing browser data or changing device. Photos and certificate files are included in the backup.</p>
 <div class="actions" style="margin:0"><button class="btn pri" onclick="backup()">Download backup</button><label class="btn" style="margin:0;text-transform:none;letter-spacing:0;font-size:15px;color:var(--tx)">Restore backup<input type="file" accept="application/json,.json" hidden onchange="restore(this.files[0])"></label></div>
 <div class="actions"><button class="btn" onclick="if(confirm('Reset to the sample data? Your changes will be lost.')){IDB.keys().then(k=>k.forEach(i=>IDB.del(i)));S=seed();save();go('dash')}">Reset to sample data</button><button class="btn danger" onclick="startFresh()">Remove sample data</button></div></div></div>
 <div class="card" style="margin-top:16px"><h3>Acceptance criteria</h3><p class="sub" style="margin:0 0 12px">These thresholds drive the suggested severity of each reading. Defaults follow common guidance (for example ASTM C876 for half-cell, EN 12504-4 for pulse velocity). Confirm them against your project specification.</p>
 <div class="crg">${CRIT_ROWS.map(([k,l,labs])=>`<div class="crr"><b>${l}</b><div class="crs">${labs.map((t,i)=>`<label>${t}<input type="number" step="any" value="${cr[k][i]}" onchange="critSet('${k}',${i},this.value)"></label>`).join('')}</div></div>`).join('')}
 <div class="crr"><b>Rebar cover, minimum (mm)</b><div class="crs"><label>Minimum<input type="number" step="any" value="${cr.cover}" onchange="critSet('cover',-1,this.value)"></label></div></div></div>
 <div class="actions"><button class="btn" onclick="S.criteria=JSON.parse(JSON.stringify(DEF_CRIT));save();soft()">Restore default criteria</button></div></div>
 <div class="card" style="margin-top:16px"><h3>About this build</h3><p class="sub" style="margin:0">AMPHR demo build. Data stays on this device, there is no login or server, and severity suggestions are rule-based (not AI). Reports must be reviewed and signed by a qualified engineer.</p></div>`}
async function backup(){const ids=new Set(),scan=o=>{if(!o||typeof o!=='object')return;if(Array.isArray(o))return o.forEach(scan);for(const[k,v]of Object.entries(o)){if(k==='fid'&&typeof v==='string')ids.add(v);else scan(v)}};scan(S);
 const files={};for(const id of ids){const b=await IDB.get(id);if(b)files[id]=await blobToDataUrl(b)}
 download(`amphr-backup-${iso(today())}.json`,JSON.stringify({app:'amphr',v:3,S,files}),'application/json');toast('Backup downloaded',null)}
async function restore(f){if(!f)return;let o;try{o=JSON.parse(await f.text())}catch(e){toast('That file is not a valid backup.',null,false);return}
 if(!o||o.app!=='amphr'||!o.S||!Array.isArray(o.S.buildings)){toast('That file is not an AMPHR backup.',null,false);return}
 if(!confirm('Restore this backup? It replaces all current data on this device.'))return;
 for(const[id,u]of Object.entries(o.files||{})){try{await IDB.put(id,await (await fetch(u)).blob())}catch(e){}}
 S=o.S;['buildings','assets','inspections','people','equipment','cals','certs','spots','audit'].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[]});if(!S.settings)S.settings={org:'',engineer:'',licence:''};if(!S.criteria)S.criteria=JSON.parse(JSON.stringify(DEF_CRIT));
 save();toast('Backup restored',null);go('dash')}
function startFresh(){if(!confirm('Remove all sample buildings, spots, equipment and certificates? Your organisation settings and criteria stay.'))return;
 IDB.keys().then(k=>k.forEach(i=>IDB.del(i)));['buildings','assets','inspections','people','equipment','cals','certs','spots','audit'].forEach(k=>S[k]=[]);S.nid=100;S.did=1;save();toast('Sample data removed. Add your first building.',null);go('dash')}
PAGES.set=setPage;
