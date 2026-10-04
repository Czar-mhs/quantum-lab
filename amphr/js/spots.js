// spots: severity helpers, instrument tests and interpretation, spots dashboard and list
const SEVO=['none','low','medium','high','critical'];
const SEVN={none:'None',low:'Low',medium:'Medium',high:'High',critical:'Critical'};
const SEVC={none:'#8b979e',low:'#34d399',medium:'#fbbf24',high:'#fb923c',critical:'#f87171'};
const sevRank=s=>SEVO.indexOf(s);
const maxSev=a=>a.reduce((m,s)=>sevRank(s)>sevRank(m)?s:m,'none');
const sevP=s=>`<span class="sevp" style="--c:${SEVC[s]}">${SEVN[s]}</span>`;
const did=d=>'D-'+String(d.id).padStart(4,'0');
const TESTS={
rebound:{n:'Rebound hammer',u:['R']},
upv:{n:'Ultrasonic pulse velocity',u:['m/s','km/s']},
hc:{n:'Half-cell potential',u:['mV (CSE)']},
res:{n:'Concrete resistivity',u:['kΩ·cm']},
cover:{n:'Rebar cover',u:['mm']},
gpr:{n:'GPR measurement',u:['mm'],sub:['Rebar spacing','Rebar depth','Slab thickness','Object depth']},
ie:{n:'Impact-echo thickness / defect depth',u:['mm']},
pe:{n:'Pulse-echo thickness / defect depth',u:['mm']},
kt:{n:'Air permeability (kT)',u:['×10⁻¹⁶ m²']},
bond:{n:'Pull-off bond strength',u:['MPa']},
crack:{n:'Crack width',u:['mm']}};
function interp(r){const c=S.criteria,v=+r.value,x=r.extra||{};let sev='none',t='';
 switch(r.test){
 case 'upv':{const m=r.unit==='km/s'?v*1000:v,[a,b,d]=c.upv;sev=m>=a?'none':m>=b?'low':m>=d?'medium':'high';t=m>=a?'Excellent quality':m>=b?'Good quality':m>=d?'Medium / doubtful':'Poor quality';break}
 case 'hc':{const [a,b,d]=c.hc;sev=v>a?'none':v>b?'medium':v>d?'high':'critical';t=v>a?'About 90% probability of no corrosion':v>b?'Corrosion activity uncertain':v>d?'About 90% probability of corrosion':'Severe corrosion';break}
 case 'res':{const [a,b,d]=c.res;sev=v>a?'none':v>b?'low':v>d?'medium':'high';t=v>a?'Negligible corrosion risk':v>b?'Low corrosion risk':v>d?'Moderate corrosion risk':'High corrosion risk';break}
 case 'kt':{const [a,b,d,e]=c.kt;sev=v<a?'none':v<b?'low':v<d?'medium':v<e?'high':'critical';t='Permeability class PK'+(v<a?1:v<b?2:v<d?3:v<e?4:5);break}
 case 'bond':{const [a,b]=c.bond;sev=v>=a?'none':v>=b?'medium':'high';t=v>=a?'Meets bond criterion':v>=b?'Marginal bond':'Below bond criterion';break}
 case 'crack':{const [a,b,d]=c.crack;sev=v<a?'low':v<b?'medium':v<d?'high':'critical';t=v<a?'Within the typical 0.3 mm limit':v<b?'Exceeds the 0.3 mm limit':v<d?'Wide crack':'Very wide crack';break}
 case 'cover':{const spec=+x.spec||c.cover;sev=v>=spec?'none':v>=spec-10?'medium':'high';t=v>=spec?`Meets ${spec} mm minimum`:`Below ${spec} mm minimum`;break}
 case 'rebound':{const est=parseFloat(x.est),fck=parseFloat(x.fck);
  if(est&&fck){const k=est/fck,[a,b,d]=c.strength;sev=k>=a?'none':k>=b?'low':k>=d?'medium':'high';t=`Estimated ${est} MPa vs ${fck} MPa required (${Math.round(k*100)}%)`}
  else{sev=(x.cov||0)>15?'medium':'none';t=`Mean R ${v}, CoV ${x.cov||0}%. Convert with a calibrated curve for strength`}break}
 case 'gpr':case 'ie':case 'pe':sev=x.flag?'high':'none';t=x.flag?'Anomaly indicated (void, delamination or missing cover)':'No anomaly noted';break;
 default:t='Recorded'}
 return{sev,t}}
const spotSuggest=s=>maxSev([(CATS[s.cat]||CATS.other).base,...s.readings.map(r=>interp(r).sev)]);
function suggestWhy(s){const w=[`${(CATS[s.cat]||CATS.other).n} base grade ${SEVN[(CATS[s.cat]||CATS.other).base]}`];s.readings.forEach(r=>{const i=interp(r);if(i.sev!=='none')w.push(`${TESTS[r.test]?TESTS[r.test].n:r.test} ${r.value} → ${SEVN[i.sev]}`)});return w.join('; ')}
const spotTests=s=>[...new Set(s.readings.map(r=>r.test))];
let spf={b:'all',sev:'all',el:'all',st:'all',q:''};
const spotThumb=s=>s.photos&&s.photos[0]?`<img data-fid="${s.photos[0].fid}" alt="">`:`<div class="noph"><svg viewBox="0 0 24 24">${IC.spots}</svg></div>`;
function filtSpots(){const q=spf.q.toLowerCase();return S.spots.filter(s=>(spf.b==='all'||s.b===+spf.b)&&(spf.sev==='all'||s.sev===spf.sev)&&(spf.el==='all'||s.element===spf.el)&&(spf.st==='all'||s.status===spf.st)&&(!q||(s.type+' '+s.element+' '+did(s)).toLowerCase().includes(q)))}
function spotCards(L){return L.length?`<div class="grid g3">${L.map(s=>`<div class="card spc" onclick="go('spot',${s.id})"><div class="spt">${spotThumb(s)}<i class="sdot" style="background:${SEVC[s.sev]}"></i>${s.confirmed?'':'<em class="unc">Unconfirmed</em>'}</div>
 <div class="spb"><div class="spl"><b>${did(s)}</b><span>${new Date(s.det).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span></div><h4>${esc(s.element)} · ${esc(s.type)}</h4><p>${esc(bName(s.b))} · Level ${String(s.level).padStart(2,'0')}</p>
 <div class="chs">${sevP(s.sev)}${spotTests(s).map(t=>`<span class="tg">${esc(TESTS[t]?TESTS[t].n.split(' ')[0]:t)}</span>`).join('')}</div></div></div>`).join('')}</div>`:'<div class="card empty">No spots match. Add one with + New spot.</div>'}
function spotsList(){document.getElementById('spl').innerHTML=spotCards(filtSpots())}
function spotsPage(){
 const L=filtSpots(),major=L.filter(s=>['critical','high'].includes(s.sev)).length,minor=L.filter(s=>['medium','low'].includes(s.sev)).length,unc=L.filter(s=>!s.confirmed).length;
 const els=[...new Set(S.spots.map(s=>s.element))].sort(),byEl=els.map(e=>({e,c:Object.fromEntries(['critical','high','medium','low'].map(k=>[k,L.filter(s=>s.element===e&&s.sev===k).length]))})).filter(x=>Object.values(x.c).some(Boolean));
 const mx=Math.max(1,...byEl.map(x=>Object.values(x.c).reduce((a,b)=>a+b,0)));
 const latest=[...S.spots].sort((a,b)=>b.id-a.id).slice(0,6);
 return head('Spots','One record per finding: photos, instrument data, grade and repair',`<button class="btn pri" onclick="spotNew()">+ New spot</button>`)+
 `<div class="kts"><div class="kt"><div class="kh"><b>${L.length}</b></div><div class="kl">Total spots</div><div class="ks">In current filter</div></div>
 <div class="kt"><div class="kh" style="color:var(--r)"><b>${major}</b></div><div class="kl">Major</div><div class="ks">Critical and high</div></div>
 <div class="kt"><div class="kh" style="color:var(--y)"><b>${minor}</b></div><div class="kl">Minor</div><div class="ks">Medium and low</div></div>
 <div class="kt"><div class="kh" style="color:var(--teal)"><b>${unc}</b></div><div class="kl">To confirm</div><div class="ks">Grade awaiting engineer</div></div></div>
 <div class="grid g2" style="margin-bottom:16px"><div class="card"><h3>Components</h3>${byEl.length?`<div class="bchart">${byEl.map(({e,c})=>{const t=Object.values(c).reduce((a,b)=>a+b,0);return `<div class="bcol"><b>${t}</b><div class="bst" style="height:${t/mx*120}px">${['critical','high','medium','low'].map(k=>c[k]?`<i style="flex:${c[k]};background:${SEVC[k]}"></i>`:'').join('')}</div><span>${esc(e)}</span></div>`}).join('')}</div><div class="legend" style="margin-top:12px">${['critical','high','medium','low'].map(k=>`<span><s style="background:${SEVC[k]}"></s>${SEVN[k]}</span>`).join('')}</div>`:'<div class="empty">No data.</div>'}</div>
 <div class="card"><h3>Last submitted spots</h3><div class="list">${latest.map(s=>`<div class="li" style="cursor:pointer" onclick="go('spot',${s.id})"><div class="lsp"><div class="lth">${spotThumb(s)}</div><div><b>${did(s)} · ${esc(s.element)}</b><small>${esc(s.type)} · ${esc(bName(s.b))}</small></div></div>${sevP(s.sev)}</div>`).join('')||'<div class="empty">None yet.</div>'}</div></div></div>
 <div class="tools"><select style="max-width:230px" onchange="spf.b=this.value;render()"><option value="all">All buildings</option>${S.buildings.map(b=>`<option value="${b.id}" ${String(spf.b)===String(b.id)?'selected':''}>${esc(b.name)}</option>`).join('')}</select>
 <select style="max-width:170px" onchange="spf.el=this.value;render()"><option value="all">All elements</option>${ELEMENTS.map(x=>`<option ${spf.el===x?'selected':''}>${x}</option>`).join('')}</select>
 <select style="max-width:170px" onchange="spf.st=this.value;render()"><option value="all">Any status</option>${['Open','In progress','Resolved'].map(x=>`<option ${spf.st===x?'selected':''}>${x}</option>`).join('')}</select>
 <input class="search" placeholder="Search spots" value="${esc(spf.q)}" oninput="spf.q=this.value;spotsList()"></div>
 <div class="chips" style="margin-bottom:14px">${['all','critical','high','medium','low'].map(k=>`<button class="chip ${spf.sev===k?'on':''}" onclick="spf.sev='${k}';render()">${k==='all'?'All severities':SEVN[k]}</button>`).join('')}</div>
 <div id="spl">${spotCards(L)}</div>`}
PAGES.spots=spotsPage;
