const KEY='amphr_mvp_v3',DAY=864e5;
const today=()=>new Date(new Date().toDateString()).getTime();
const iso=t=>new Date(t).toISOString().slice(0,10);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=p=>p+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
const daysTo=s=>s?Math.round((new Date(s).getTime()-today())/DAY):null;
const DEF_CRIT={upv:[4500,3500,3000],hc:[-200,-350,-500],res:[100,50,10],kt:[0.01,0.1,1,10],bond:[1.5,1],crack:[0.3,1,3],cover:40,strength:[1,0.85,0.7]};
const CATS={
spall:{n:'Spalling concrete',base:'high',fix:'Remove loose concrete and clean rust from exposed reinforcement. Apply an anti-corrosive coating to the cleaned bars, then reinstate the section with a suitable repair mortar.'},
crack:{n:'Cracking',base:'medium',fix:'Record crack width and extent. Seal or inject cracks according to width and cause. Monitor active cracks with tell-tales before repairing.'},
water:{n:'Water ingress / dampness',base:'medium',fix:'Trace and stop the source of water. Allow the element to dry, treat affected finishes and re-waterproof the area.'},
corr:{n:'Reinforcement corrosion',base:'high',fix:'Break out contaminated concrete, clean or replace corroded bars, apply a corrosion inhibitor and reinstate. Consider cathodic protection where corrosion is widespread.'},
delam:{n:'Delamination / hollow sound',base:'high',fix:'Sound-map the extent, remove delaminated concrete and reinstate. Check the reinforcement underneath for corrosion.'},
honey:{n:'Honeycomb / voids',base:'medium',fix:'Cut out loose material to sound concrete and fill with non-shrink repair grout. Confirm the extent with pulse-echo or GPR where hidden.'},
settle:{n:'Settlement / deformation',base:'high',fix:'Survey and monitor movement. A structural engineer should assess the cause before any repair is designed.'},
effl:{n:'Efflorescence',base:'low',fix:'Find and cure the moisture source, then clean the deposits and apply a breathable protective coating if needed.'},
seal:{n:'Joint / sealant failure',base:'low',fix:'Remove the failed sealant, clean and prime the joint and re-seal with a compatible sealant.'},
finish:{n:'Finish / paint defect',base:'low',fix:'Prepare the surface and re-apply the finish system. Check for an underlying moisture or corrosion cause first.'},
other:{n:'Other observation',base:'low',fix:'Describe the observation and the action required.'}};
const ELEMENTS=['Slab','Beam','Column','Wall','Ceiling','Floor','Facade','Roof','Foundation','Stair','Door / window','MEP','Finish','Other'];
const SEVH={none:95,low:88,medium:66,high:46,critical:28};
const EQ_TYPES={
proceq_gpr:{n:'Proceq GPR',tech:'Ground penetrating radar',m:['Rebar','Objects','Thickness'],tests:['gpr'],cal:1},
profometer:{n:'Profometer (rebar locator)',tech:'Eddy current',m:['Cover','Diameter'],tests:['cover'],cal:1},
profometer_pm:{n:'Profometer Corrosion (PM8500)',tech:'Half-cell potential and resistivity',m:['Corrosion'],tests:['hc','res'],cal:1},
pundit_pe:{n:'Pundit Array PE',tech:'Ultrasound pulse echo',m:['Defects','Uniformity','Thickness'],tests:['pe'],cal:1},
pundit_upv:{n:'Pundit UPV',tech:'Ultrasound pulse velocity',m:['Strength','Homogeneity','Thickness'],tests:['upv'],cal:1},
schmidt:{n:'Schmidt rebound hammer',tech:'Rebound',m:['Strength','Uniformity'],tests:['rebound'],cal:1},
pundit_impact:{n:'Pundit Impact',tech:'Impact echo',m:['Defects','Objects','Thickness'],tests:['ie'],cal:1},
resipod:{n:'Resipod',tech:'Surface resistivity',m:['Resistivity'],tests:['res'],cal:1},
dy:{n:'DY pull-off tester',tech:'Pull-off',m:['Bond strength'],tests:['bond'],cal:1},
torrent:{n:'Torrent permeability tester',tech:'Air permeability',m:['Permeability'],tests:['kt'],cal:1},
crackcard:{n:'Crack width gauge',tech:'Visual comparator',m:['Crack width'],tests:['crack'],cal:0},
other:{n:'Other instrument / probe',tech:'',m:[],tests:['upv','hc','res','cover','gpr','ie','pe','kt','bond','crack','rebound'],cal:1}};
function seed(){const t=today(),d=n=>iso(t+n*DAY),at=(n,h,m)=>t+n*DAY+(h*60+m)*6e4;
const spot=([id,b,level,zone,type,sev,status,dd,x,y,element,cat,rd])=>({id,b,level,zone,type,sev,status,det:d(dd),x,y,health:SEVH[sev],element,cat,material:'Concrete',repair:CATS[cat].fix,photos:[],
 readings:(rd||[]).map(r=>({id:uid('r'),at:at(dd,9,45),by:'Layla Haddad',note:'',extra:{},...r})),confirmed:true,grade:{sev,by:'Ahmed Hassan',at:at(dd,10,0),reason:''},
 hist:[{t:at(dd,9,30),who:'Layla Haddad',what:'Spot captured'},{t:at(dd,10,0),who:'Ahmed Hassan',what:'Grade confirmed: '+sev}]});
const lab='Accredited calibration lab (sample)';
return{
buildings:[
{id:1,name:'Heritage Tower',area:'Downtown Dubai',floors:40,year:1998,compliance:'non',lastInsp:d(-300),dueDate:d(-12),issues:{critical:3,high:2,safety:2}},
{id:2,name:'Downtown Hub',area:'Downtown Dubai',floors:24,year:2004,compliance:'non',lastInsp:d(-330),dueDate:d(20),issues:{critical:2,high:1,safety:2}},
{id:3,name:'Marina Plaza',area:'Dubai Marina',floors:18,year:2008,compliance:'non',lastInsp:d(-280),dueDate:d(38),issues:{critical:1,high:2,safety:1}},
{id:4,name:'Tower One',area:'Business Bay',floors:30,year:2016,compliance:'compliant',lastInsp:d(-250),dueDate:d(210),issues:{critical:0,high:4,safety:1}},
{id:5,name:'Tower Two',area:'Business Bay',floors:28,year:2017,compliance:'due',lastInsp:d(-120),dueDate:d(120),issues:{critical:1,high:3,safety:1}}],
assets:[
{id:1,b:4,name:'Passenger Lift A',type:'Lift',status:'Good'},{id:2,b:2,name:'Chiller 1',type:'HVAC',status:'Poor'},
{id:3,b:2,name:'Fire Pump',type:'Fire safety',status:'Fair'},{id:4,b:1,name:'Roof Waterproofing',type:'Structure',status:'Critical'},
{id:5,b:5,name:'Generator G1',type:'Electrical',status:'Good'},{id:6,b:1,name:'Column C4',type:'Structure',status:'Critical'}],
inspections:[
{id:1,b:1,date:d(-300),by:'Ahmed Hassan',notes:'Structural inspection. Concrete spalling on Column C4; rebar corrosion at Level 12.'},
{id:2,b:2,date:d(-330),by:'Demo Inspector',notes:'Fire pump pressure low; membrane failure at roof slab.'}],
people:[{id:1,name:'Ahmed Hassan',role:'Lead engineer',licence:'DM-ENG-48213 (sample)',email:''},{id:2,name:'Layla Haddad',role:'NDT technician',licence:'NDT Level II (sample)',email:''}],
equipment:[
{id:1,type:'schmidt',name:'Schmidt rebound hammer',maker:'Screening Eagle / Proceq',serial:'SCH-10234',tag:'MHS-EQ-001',purchased:d(-700),status:'active',assigned:2,probes:[{name:'Test anvil',serial:'ANV-0412',note:'Verification anvil'}],notes:'',photo:null},
{id:2,type:'pundit_upv',name:'Pundit UPV',maker:'Screening Eagle / Proceq',serial:'PU-55871',tag:'MHS-EQ-002',purchased:d(-640),status:'active',assigned:2,probes:[{name:'Transducer 54 kHz (pair)',serial:'TR-1182 / TR-1183',note:'Reference rod included'}],notes:'',photo:null},
{id:3,type:'profometer_pm',name:'Profometer PM8500',maker:'Screening Eagle / Proceq',serial:'PM-30421',tag:'MHS-EQ-003',purchased:d(-800),status:'active',assigned:2,probes:[{name:'Half-cell reference electrode (Cu/CuSO4)',serial:'RE-7731',note:'Refill solution monthly'}],notes:'',photo:null},
{id:4,type:'proceq_gpr',name:'Proceq GPR',maker:'Screening Eagle / Proceq',serial:'GP-7718',tag:'MHS-EQ-004',purchased:d(-400),status:'active',assigned:1,probes:[],notes:'',photo:null},
{id:5,type:'resipod',name:'Resipod',maker:'Screening Eagle / Proceq',serial:'RP-20931',tag:'MHS-EQ-005',purchased:d(-300),status:'active',assigned:2,probes:[{name:'Wenner probe 50 mm',serial:'WP-2201',note:''}],notes:'',photo:null},
{id:6,type:'profometer',name:'Profometer rebar locator',maker:'Screening Eagle / Proceq',serial:'PR-4410',tag:'MHS-EQ-006',purchased:d(-250),status:'active',assigned:2,probes:[],notes:'',photo:null},
{id:7,type:'crackcard',name:'Crack width gauge',maker:'Generic',serial:'CG-001',tag:'MHS-EQ-007',purchased:d(-500),status:'active',assigned:2,probes:[],notes:'',photo:null}],
cals:[
{id:1,eq:1,date:d(-215),due:d(150),lab,certNo:'CAL-2026-0412',result:'Pass',ver:{expected:80,measured:80.4,tol:2},notes:'Sample record',fid:null},
{id:2,eq:2,date:d(-345),due:d(20),lab,certNo:'CAL-2025-0988',result:'Pass',ver:null,notes:'Sample record. Calibration due soon.',fid:null},
{id:3,eq:3,date:d(-375),due:d(-10),lab,certNo:'CAL-2025-0871',result:'Pass',ver:null,notes:'Sample record. Calibration has expired.',fid:null},
{id:4,eq:4,date:d(-100),due:d(265),lab,certNo:'CAL-2026-0733',result:'Pass',ver:null,notes:'Sample record',fid:null},
{id:5,eq:5,date:d(-60),due:d(305),lab,certNo:'CAL-2026-0801',result:'Pass',ver:null,notes:'Sample record',fid:null},
{id:6,eq:6,date:d(-30),due:d(335),lab,certNo:'CAL-2026-0902',result:'Pass',ver:null,notes:'Sample record',fid:null}],
certs:[
{id:1,kind:'eq',owner:1,type:'Calibration certificate',number:'CAL-2026-0412',issuer:lab,issued:d(-215),expires:d(150),fid:null,notes:''},
{id:2,kind:'eq',owner:3,type:'Calibration certificate',number:'CAL-2025-0871',issuer:lab,issued:d(-375),expires:d(-10),fid:null,notes:''},
{id:3,kind:'eq',owner:4,type:'Conformity (CE / UKCA)',number:'CE-GP-7718',issuer:'Manufacturer (sample)',issued:d(-400),expires:'',fid:null,notes:''},
{id:4,kind:'p',owner:2,type:'Operator qualification (NDT)',number:'NDT-II-5520 (sample)',issuer:'Certification body (sample)',issued:d(-500),expires:d(400),fid:null,notes:'Level II'},
{id:5,kind:'p',owner:1,type:'Professional engineer registration',number:'DM-ENG-48213 (sample)',issuer:'Registration authority (sample)',issued:d(-900),expires:d(25),fid:null,notes:''}],
spots:[
spot([241,1,3,'A','Cracking – Slab','high','Open',-6,430,200,'Slab','crack',[{test:'crack',value:0.6,unit:'mm',eq:7,extra:{point:'C1'}}]]),
spot([242,1,3,'C','Paint peeling – Wall','low','Open',-12,800,190,'Finish','finish']),
spot([243,1,3,'B','Water ingress – Ceiling','medium','In progress',-4,600,330,'Ceiling','water']),
spot([244,1,3,'A','Hairline crack – Wall','low','Open',-20,230,350,'Wall','crack',[{test:'crack',value:0.2,unit:'mm',eq:7,extra:{point:'C2'}}]]),
spot([245,1,3,'C','Efflorescence – Wall','medium','Open',-2,810,470,'Wall','effl']),
spot([246,1,3,'A','Joint sealant failure','low','Resolved',-30,210,560,'Facade','seal']),
spot([247,1,3,'C','Corroded rebar – Beam','high','Open',-1,690,590,'Beam','corr',[{test:'hc',value:-380,unit:'mV (CSE)',eq:3,extra:{point:'G4'}},{test:'res',value:14,unit:'kΩ·cm',eq:5,extra:{point:'G4'}}]]),
spot([248,1,3,'B','Spalling – Column','critical','Open',0,520,470,'Column','spall',[{test:'hc',value:-520,unit:'mV (CSE)',eq:3,extra:{point:'C4'}},{test:'cover',value:22,unit:'mm',eq:6,extra:{spec:40,point:'C4'}},{test:'rebound',value:31.4,unit:'R',eq:1,extra:{raw:[30,32,31,33,29,31,32,31,30,35],kept:10,cov:5.2,est:'',fck:''}}]]),
spot([249,2,2,'B','Membrane failure – Roof slab','critical','Open',-15,470,250,'Roof','water']),
spot([250,2,2,'C','Spalling – Column','critical','Open',-9,780,520,'Column','spall']),
spot([251,2,2,'A','Cracking – Beam','high','In progress',-5,240,330,'Beam','crack']),
spot([252,3,4,'B','Water ingress – Wall','medium','Open',-8,560,560,'Wall','water']),
spot([253,3,4,'C','Cracking – Slab','high','Open',-3,780,220,'Slab','crack']),
spot([254,4,12,'A','Sealant failure – Facade','high','In progress',-7,300,210,'Facade','seal'])],
audit:[
{t:at(0,9,42),a:'Deadline updated',b:2},{t:at(0,9,15),a:'Alert threshold set',b:3},{t:at(0,8,51),a:'Document uploaded',b:1},{t:at(-1,17,3),a:'Status changed',b:2},
{t:at(-1,12,28),a:'Reminder sent',b:1},{t:at(-1,9,41),a:'Deadline updated',b:5},{t:at(-1,8,12),a:'Document uploaded',b:4},{t:at(-2,16,33),a:'Status changed',b:3}],
settings:{org:'MHS+ Group',engineer:'Ahmed Hassan',licence:'DM-ENG-48213 (sample)'},
criteria:JSON.parse(JSON.stringify(DEF_CRIT)),
did:255,nid:100}}
let S;try{S=JSON.parse(localStorage.getItem(KEY))||seed()}catch(e){S=seed()}
['buildings','assets','inspections','people','equipment','cals','certs','spots','audit'].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[]});
if(!S.settings)S.settings={org:'',engineer:'',licence:''};
if(!S.criteria)S.criteria=JSON.parse(JSON.stringify(DEF_CRIT));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));return true}catch(e){return false}};
function health(b){
const st=Math.max(0,100-15*b.issues.critical-8*b.issues.high);
const co={compliant:100,due:50,non:0}[b.compliance];
const days=Math.max(0,(today()-new Date(b.lastInsp).getTime())/DAY);
const mt=Math.max(0,100-days/365*20);
const sf=Math.max(0,100-20*b.issues.safety);
const s=(st*.4+co*.3+mt*.2+sf*.1);
return{score:Math.round(Math.min(100,Math.max(0,s))),st,co,mt:Math.round(mt),sf}}
const BANDS=[['Good','G','var(--g)'],['Fair','Y','var(--y)'],['Poor','O','var(--o)'],['Critical','R','var(--r)']];
const bi=s=>s>=80?0:s>=60?1:s>=40?2:3;
const col=s=>BANDS[bi(s)][2];
const pill=s=>`<span class="pill p${BANDS[bi(s)][1]}">${BANDS[bi(s)][0]}</span>`;
const dleft=b=>Math.round((new Date(b.dueDate).getTime()-today())/DAY);
const ucls=n=>n<90?'cR':n<=180?'cY':'cG';
const CS={compliant:'Compliant',due:'Due soon',non:'Non-compliant'};
function ring(score,size,sw,label){const r=(size-sw)/2,c=2*Math.PI*r,k=col(score);
return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="${sw}"/>
<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${k}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${c*score/100} ${c}" style="filter:drop-shadow(0 0 8px ${k})"/></svg>
<div class="n"><b style="font-size:${size*.32}px;color:${k}">${score}</b>${label?`<span>${label}</span>`:''}</div></div>`}
const IC={
dash:'<path d="M3 13h8V3H3zM13 21h8V11h-8zM13 3v6h8V3zM3 21h8v-6H3z"/>',
comp:'<path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
assets:'<path d="M21 8 12 3 3 8l9 5zM3 8v8l9 5 9-5V8M12 13v8"/>',
insp:'<path d="M9 4h6l1 2h3a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3z"/><path d="m9 14 2 2 4-4"/>',
add:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
plan:'<path d="M3 3h18v18H3zM3 10h8M11 3v18M11 15h10"/><circle cx="16" cy="6.5" r="1.4"/>',
spots:'<path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z"/><circle cx="12" cy="11" r="2.3"/>',
equip:'<path d="M4 14a8 8 0 0 1 16 0M12 14l4-5M3 18h18"/><circle cx="12" cy="14" r="1.2"/>',
dm:'<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6M12 9v.01"/>',
rep:'<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
set:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>'};
const TABS=[['dash','Portfolio'],['spots','Spots'],['plan','Floor plan'],['equip','Equipment'],['insp','Inspect'],['comp','Compliance'],['dm','DM Permit'],['rep','Reports'],['assets','Assets'],['set','Settings']];
const PHONE=[['dash','Portfolio'],['spots','Spots'],['equip','Equipment'],['rep','Reports'],['more','More']];
const PARENT={detail:'dash',add:'dash',spot:'spots',eq:'equip',eqform:'equip'},MORE=['plan','insp','comp','dm','assets','set','more'];
const PAGES={},AFTER={};
let tab='dash',sel=null,flt='all',q='';
const onTab=(k,t)=>k===t||PARENT[t]===k||(k==='more'&&MORE.includes(t));
function nav(){
document.getElementById('nav').innerHTML=TABS.map(([k,l])=>`<button class="nv ${onTab(k,tab)?'on':''}" onclick="go('${k}')" aria-label="${l}"><svg viewBox="0 0 24 24">${IC[k]}</svg><span>${l}</span></button>`).join('');
document.getElementById('tabbar').innerHTML=PHONE.map(([k,l])=>`<button class="tb ${onTab(k,tab)?'on':''}" onclick="go('${k}')"><svg viewBox="0 0 24 24">${IC[k]}</svg>${l}</button>`).join('')}
function go(k,id){tab=k;sel=id??null;render()}
function render(){nav();const f=PAGES[tab]||PAGES.dash;document.getElementById('v').innerHTML=f();if(AFTER[tab])AFTER[tab]();if(window.hydrate)hydrate();window.scrollTo(0,0)}
const soft=()=>{const y=scrollY;render();scrollTo(0,y)};
const head=(t,s,r='')=>`<div class="top"><div><h1>${t}</h1><div class="sub">${s}</div></div>${r}</div>`;
const fd=e=>{e.preventDefault();return Object.fromEntries(new FormData(e.target))};
const personName=id=>(S.people.find(p=>p.id===+id)||{}).name||'';
const bName=id=>(S.buildings.find(b=>b.id===+id)||{}).name||'';
