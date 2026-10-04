// more page, connectivity, offline cache, boot
function morePage(){const L=[['plan','Floor plan','Defect pins, GPR overlay and levels'],['insp','Inspect','Upload a PDF, field checklist or manual entry'],['comp','Compliance','Law 3/2026 deadlines and audit trail'],['assets','Assets','Asset registry with CSV import and export'],['set','Settings','Engineer, criteria, backup and restore']];
 return head('More','Everything else in AMPHR')+`<div class="grid g2">${L.map(([k,t,d])=>`<div class="card bc" onclick="go('${k}')"><div class="h"><div class="eqi"><svg viewBox="0 0 24 24">${IC[k]||IC.set}</svg></div><div><h4>${t}</h4><p>${d}</p></div></div></div>`).join('')}</div>`}
PAGES.more=morePage;
window.addEventListener('online',()=>{const q=S.inspections.filter(i=>i.synced===false);if(q.length){q.forEach(i=>i.synced=true);save();toast(`Synced ${q.length} offline report${q.length>1?'s':''}`,null);if(tab==='insp')soft()}});
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
render();
