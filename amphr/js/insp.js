let it='upload';
function insp(){
 return head('Inspect','PDFs in. Insights out.')+`<div class="seg big">${[['upload','Upload PDF'],['check','Field checklist'],['manual','Manual entry']].map(([k,l])=>`<button class="${it===k?'on':''}" onclick="it='${k}';render()">${l}</button>`).join('')}</div>`+({upload:upl,check:chk,manual:man})[it]()}
// ---- upload inspection (PDF)
let up=null,upBusy=false;
const blankUp=n=>({name:n||'',date:iso(today()),by:'',title:'',issues:[],b:(S.buildings[0]||{}).id,due:iso(today()+365*DAY),warn:''});
const sevOpts=v=>['critical','high','medium','low'].map(s=>`<option value="${s}" ${v===s?'selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('');
function upl(){const u=up;
 return `<div class="ugrid"><div>
  <div class="drop" tabindex="0" role="button" aria-label="Upload inspection PDF" ondragover="event.preventDefault();this.classList.add('hv')" ondragleave="this.classList.remove('hv')" ondrop="event.preventDefault();readPdf(event.dataTransfer.files[0])" onclick="document.getElementById('pdfin').click()" onkeydown="if(event.key==='Enter')document.getElementById('pdfin').click()">
   <svg class="pdfic" viewBox="0 0 64 64"><path d="M16 6h22l14 14v38H16z"/><path d="M38 6v14h14"/><text x="21" y="46" font-size="14" font-weight="700" stroke="none" style="fill:var(--teal)">PDF</text></svg>
   <b>${upBusy?'Reading PDF…':u?esc(u.name):'Drag and drop PDF here'}</b><span>${u?'Drop another file to replace it':'or click to browse'}</span>
   <input id="pdfin" type="file" accept="application/pdf" hidden onchange="readPdf(this.files[0])" onclick="event.stopPropagation()"></div>
  <button class="btn wide" onclick="sampleReport()">Use sample report</button>
  <p class="sub" style="margin-top:12px">The PDF is read in your browser. Nothing is uploaded to a server.</p></div>
  <div><div class="card"><h3>Parsed Information</h3>${u?`${u.warn?`<div class="warn">${esc(u.warn)}</div>`:''}
   <div class="pr"><label>Inspection Date</label><input type="date" value="${u.date}" onchange="up.date=this.value"></div>
   <div class="pr"><label>Inspector Name</label><input value="${esc(u.by)}" oninput="up.by=this.value" placeholder="Inspector name"></div>
   <div class="pr"><label>Report Title</label><input value="${esc(u.title)}" oninput="up.title=this.value"></div>
   <div class="pr"><label>Building</label><select onchange="up.b=+this.value">${S.buildings.map(b=>`<option value="${b.id}" ${b.id===u.b?'selected':''}>${esc(b.name)}</option>`).join('')}</select></div>
   <div class="pr"><label>Next Due</label><input type="date" value="${u.due}" onchange="up.due=this.value"></div>`:'<div class="empty">Upload a PDF or use the sample report to see parsed details.</div>'}</div>
  <div class="card" style="margin-top:16px"><h3>Detected Issues</h3>${u?`${u.issues.map((x,i)=>`<div class="iss"><input value="${esc(x.t)}" oninput="up.issues[${i}].t=this.value" aria-label="Issue"><select class="sevsel s-${x.sev}" onchange="up.issues[${i}].sev=this.value;soft()" aria-label="Severity">${sevOpts(x.sev)}</select><button class="xb" onclick="up.issues.splice(${i},1);soft()" aria-label="Remove issue">×</button></div>`).join('')||'<div class="empty">No issues yet.</div>'}<button class="btn" style="margin-top:12px" onclick="up.issues.push({t:'',sev:'medium'});soft()">+ Add issue</button>`:'<div class="empty">Issues found in the report appear here.</div>'}</div>
  <button class="btn pri wide" ${u?'':'disabled'} onclick="confirmUpload()">Confirm &amp; Update</button></div></div>`}
function sampleReport(){up={name:'Heritage_Tower_Structural_Inspection.pdf (sample)',date:iso(today()),by:'Ahmed Hassan',title:'Heritage Tower – Structural Inspection',issues:[{t:'Concrete spalling on Column C4',sev:'critical'},{t:'Corrosion on rebar – Level 12',sev:'high'}],b:(S.buildings.find(b=>b.name==='Heritage Tower')||S.buildings[0]||{}).id,due:iso(today()+365*DAY),warn:''};soft()}
async function loadPdfJs(){if(window.pdfjsLib)return window.pdfjsLib;
 await new Promise((res,rej)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=res;s.onerror=()=>rej(new Error('PDF reader could not load. Check your connection'));document.head.appendChild(s)});
 pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';return pdfjsLib}
async function readPdf(f){if(!f)return;
 if(!/pdf$/i.test(f.name)&&f.type!=='application/pdf'){toast('Please choose a PDF file.',null,false);return}
 upBusy=true;soft();
 try{const lib=await loadPdfJs(),doc=await lib.getDocument({data:await f.arrayBuffer()}).promise,lines=[];
  for(let p=1;p<=Math.min(doc.numPages,30);p++){const pg=await doc.getPage(p),tc=await pg.getTextContent(),rows={};
   tc.items.forEach(i=>{const y=Math.round(i.transform[5]/3);(rows[y]=rows[y]||[]).push([i.transform[4],i.str])});
   Object.keys(rows).map(Number).sort((a,b)=>b-a).forEach(y=>lines.push(rows[y].sort((a,b)=>a[0]-b[0]).map(r=>r[1]).join(' ').replace(/\s+/g,' ').trim()))}
  const ls=lines.filter(Boolean);up=ls.length?parseReport(ls,f.name):Object.assign(blankUp(f.name),{warn:'No readable text found (scanned PDF?). Enter the details manually.'})}
 catch(e){up=Object.assign(blankUp(f.name),{warn:'Could not read this PDF ('+e.message+'). Enter the details manually.'})}
 upBusy=false;soft()}
const MON='jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');
function pdate(s){let m,y,mo,d;
 if(m=s.match(/\b(\d{4})-(\d{2})-(\d{2})\b/)){y=+m[1];mo=+m[2];d=+m[3]}
 else if(m=s.match(/\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})\b/)){d=+m[1];mo=+m[2];y=+m[3]}
 else if(m=s.match(/\b(\d{1,2})(?:st|nd|rd|th)?[\s\-]+([A-Za-z]{3,9})\.?,?[\s\-]+(\d{4})\b/)){d=+m[1];mo=MON.indexOf(m[2].slice(0,3).toLowerCase())+1;y=+m[3]}
 else if(m=s.match(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/)){mo=MON.indexOf(m[1].slice(0,3).toLowerCase())+1;d=+m[2];y=+m[3]}
 else return '';
 if(!(mo>=1&&mo<=12&&d>=1&&d<=31&&y>=1990&&y<=2100))return '';
 return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`}
function parseReport(lines,name){
 const low=lines.join('\n').toLowerCase(),u=blankUp(name);
 const dl=lines.find(l=>/date/i.test(l)&&pdate(l));u.date=pdate(dl||'')||pdate(lines.join('\n'))||u.date;
 const il=lines.map(l=>l.match(/(?:inspector|inspected by|prepared by|engineer)(?:\s*name)?\s*[:\-–]\s*(.+)/i)).find(Boolean);u.by=il?il[1].trim().slice(0,60):'';
 u.title=(lines.find(l=>/inspection|report|survey|assessment/i.test(l)&&l.length<100&&!/^\s*(date|inspector|prepared)/i.test(l))||lines[0]||name).slice(0,100);
 const bm=S.buildings.find(b=>low.includes(b.name.toLowerCase()));if(bm)u.b=bm.id;
 const KEY=/crack|spall|corros|rebar|leak|seep|ingress|damp|moisture|settle|deform|honeycomb|delaminat|efflorescence|exposed|rust|sprinkler|short circuit|guardrail|egress|deteriorat|defect|damage/i,seen=new Set();
 lines.forEach(l=>{const t=l.replace(/^[\s•\-\*\d\.\)]+/,'').trim();
  if(t.length<8||t.length>140||t===u.title||/^(date|inspector|prepared|report)/i.test(t)||!KEY.test(t))return;
  const k=t.toLowerCase();if(seen.has(k)||u.issues.length>=12)return;seen.add(k);
  const sev=/critical|severe|urgent|immediate|collapse|unsafe|dangerous/i.test(t)?'critical':/minor|hairline|cosmetic|paint|peeling|stain/i.test(t)?'low':/spall|corros|rebar|settle|deform|major|significant|leak|delaminat|exposed/i.test(t)?'high':'medium';
  u.issues.push({t,sev})});
 if(!u.issues.length)u.warn='No issues were detected automatically. Add them below.';
 if(!u.by)u.warn=(u.warn?u.warn+' ':'')+'Inspector name not found. Please enter it.';
 return u}
async function confirmUpload(){const u=up;if(!u)return;const b=S.buildings.find(x=>x.id===u.b);
 if(!b||!u.date||!u.by.trim()){toast('Add the inspection date, inspector name and building first.',null,false);return}
 const is=u.issues.filter(i=>i.t.trim()),c=s=>is.filter(i=>i.sev===s).length;
 const [a,z]=applyInspection(b,{date:u.date,by:u.by.trim(),notes:(u.title||'Uploaded report')+': '+(is.map(i=>i.t+' ('+i.sev+')').join('; ')||'no issues listed')+'.',crit:c('critical'),high:c('high'),due:u.due});
 await spotsFromFindings(b.id,is.map(i=>({t:i.t,sev:i.sev,src:'uploaded report'})),u.by.trim());up=null;toast('Building health updated',`${a}% to ${z}%`);soft()}
PAGES.insp=insp;
