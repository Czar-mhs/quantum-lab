const fmtT=ms=>{const d=new Date(ms),n=Math.round((today()-new Date(d.toDateString()).getTime())/DAY);return(n<=0?'Today':n===1?'Yesterday':n+' days ago')+', '+d.toTimeString().slice(0,5)};
function audit(a,b){S.audit.unshift({t:Date.now(),a,b});S.audit=S.audit.slice(0,60);save()}
let toastT;
function toast(msg,big,ok=true){let el=document.getElementById('toast');if(!el){el=document.createElement('div');el.id='toast';el.setAttribute('role','status');document.body.appendChild(el)}
 el.innerHTML=`<div class="tk">${ok?'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>':''}<div><div>${msg}</div>${big?`<b>${big}</b>`:''}</div><button aria-label="Close" onclick="document.getElementById('toast').classList.remove('on')">×</button></div>`;
 el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('on'),6000)}
function applyInspection(b,o){const before=health(b).score,oldCo=b.compliance;
 S.inspections.push({id:S.nid++,b:b.id,date:o.date,by:o.by,notes:o.notes});
 b.lastInsp=o.date;b.dueDate=o.due;b.issues={critical:o.crit,high:o.high,safety:o.safety===undefined?b.issues.safety:o.safety};
 if(o.crit===0)b.compliance='compliant';
 audit('Document uploaded',b.id);if(oldCo!==b.compliance)audit('Status changed',b.id);
 save();return [before,health(b).score]}
