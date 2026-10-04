// attachments (photos, certificates) live in IndexedDB; records keep only an id
const MEM=new Map();let idbWarned=false;
const IDB={db:null,
open(){if(!this.db)this.db=new Promise((res,rej)=>{try{const r=indexedDB.open('amphr',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});return this.db},
async tx(mode,fn){const d=await this.open();return new Promise((res,rej)=>{const t=d.transaction('files',mode),o=fn(t.objectStore('files'));t.oncomplete=()=>res(o&&o.result);t.onerror=()=>rej(t.error)})},
async put(id,blob){try{await this.tx('readwrite',s=>s.put(blob,id))}catch(e){MEM.set(id,blob);if(!idbWarned){idbWarned=true;toast('Storage unavailable: files will not persist after you close this tab.',null,false)}}return id},
async get(id){if(MEM.has(id))return MEM.get(id);try{return await this.tx('readonly',s=>s.get(id))||null}catch(e){return null}},
async del(id){MEM.delete(id);try{await this.tx('readwrite',s=>s.delete(id))}catch(e){}},
async keys(){try{return await this.tx('readonly',s=>s.getAllKeys())||[]}catch(e){return[...MEM.keys()]}}};
const URLS={};
async function fileUrl(id){if(!id)return '';if(URLS[id])return URLS[id];const b=await IDB.get(id);if(!b)return '';return URLS[id]=URL.createObjectURL(b)}
function hydrate(root){(root||document).querySelectorAll('img[data-fid]:not([data-done])').forEach(async el=>{el.dataset.done=1;const u=await fileUrl(el.dataset.fid);if(u)el.src=u})}
function shrinkBlob(file,max=1600,q=.82){return new Promise((res,rej)=>{const url=URL.createObjectURL(file),im=new Image();im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);c.toBlob(b=>b?res(b):rej(new Error('encode')),'image/jpeg',q)};im.onerror=()=>rej(new Error('bad image'));im.src=url})}
// save a File: images are resized, other files kept as-is (8 MB limit). Returns {fid,name,type} or null
async function saveFile(file){if(!file)return null;
 if(file.size>8*1024*1024){toast('That file is larger than 8 MB.',null,false);return null}
 let blob=file,name=file.name,type=file.type;
 if(/^image\//.test(file.type)){try{blob=await shrinkBlob(file);type='image/jpeg'}catch(e){toast('Could not read that image.',null,false);return null}}
 const fid=uid('f');await IDB.put(fid,blob);return {fid,name,type}}
function blobToDataUrl(b){return new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.onerror=()=>r('');f.readAsDataURL(b)})}
async function fileDataUrl(id){const b=await IDB.get(id);return b?blobToDataUrl(b):''}
async function openFile(id,name){const b=await IDB.get(id);if(!b){toast('File not found on this device.',null,false);return}
 const u=URL.createObjectURL(b);const w=window.open(u,'_blank');if(!w){const a=document.createElement('a');a.href=u;a.download=name||'file';a.click()}}
const fileChip=(fid,name)=>fid?`<a class="fchip" onclick="openFile('${fid}','${esc(name||'')}')">📎 ${esc(name||'attachment')}</a>`:'';
// modal
function modal(html){closeModal();const m=document.createElement('div');m.id='modal';m.innerHTML=`<div class="mbk" onclick="closeModal()"></div><div class="mbx" role="dialog">${html}</div>`;document.body.appendChild(m);document.body.classList.add('mo');hydrate(m)}
function closeModal(){const m=document.getElementById('modal');if(m)m.remove();document.body.classList.remove('mo')}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
function download(name,text,type='text/plain'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
