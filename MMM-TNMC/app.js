const classes={0:'Mild',1:'Moderate',2:'Severe',3:'Very Severe',4:'Unresectable'};
const tnmc=[
{c:4,k:'major360',t:'360° carotid artery encasement 或 innominate artery encasement',link:'majorArtery'},
{c:4,k:'prevertebral',t:'Prevertebral fascia involvement',link:'prevertebral'},
{c:4,k:'brachial',t:'Brachial plexus involvement',link:'brachial'},
{c:3,k:'bilateralTE',t:'Both tracheoesophageal grooves involved',s:'Significant risk of bilateral vocal cord paralysis'},
{c:3,k:'laryngoEso',t:'Laryngopharyngeal / significant esophageal involvement',s:'Would require total laryngectomy or segmental esophageal resection'},
{c:2,k:'unilateralTE',t:'One tracheoesophageal groove involved',s:'Risk of unilateral vocal cord paralysis'},
{c:2,k:'sternotomy',t:'Superior mediastinal extension requiring sternotomy'},
{c:2,k:'laryngealCart',t:'Limited laryngeal cartilage resection'},
{c:2,k:'cn1112',t:'CN XI and/or XII involvement'},
{c:1,k:'strap',t:'Gross ETE / ENE involving strap muscle',link:'strap'},
{c:1,k:'ijv',t:'Gross ETE / ENE involving internal jugular vein',link:'ijv'},
{c:1,k:'esoMuscle',t:'Esophageal muscularis or pharyngeal constrictor involvement'}
];
function renderTNMC(id,label,sub){
 const p=document.getElementById(id); p.innerHTML=`<h3>${label}</h3><div class="psub">${sub}</div>`;
 [4,3,2,1].forEach(c=>{p.insertAdjacentHTML('beforeend',`<div class="gtitle">Class ${c} · ${classes[c]}</div>`);tnmc.filter(x=>x.c===c).forEach(x=>p.insertAdjacentHTML('beforeend',`<label class="check ${x.link?'linked-anatomy':''}"><input type="checkbox" data-cls="${c}" data-key="${x.k}" ${x.link?`data-link="${x.link}"`:''}><span>${x.t}${x.link?`<em class="linked-tag">↔ MMM</em>`:''}${x.s?`<small>${x.s}</small>`:''}</span></label>`))});
 p.insertAdjacentHTML('beforeend',`<div class="trach"><label>${tr('trachea')}</label><input class="tracheaLen" type="number" min="0" step="0.1" placeholder="cm"></div><div class="warn">Exactly 4.0 cm is not defined by the published table. Expert judgment required; this item is not auto-classified.</div><div class="live"><div><small>${label.includes('前')?'TNMC Before':'TNMC After'}</small><div class="n">0</div></div><div class="nm">Mild</div></div>`);
}
const SHARED_LINKS=new Set(['majorArtery','prevertebral','brachial','ijv','strap']);
let syncingShared=false;
function phaseOfTNMC(el){return el.closest('#tnmcBefore')?'before':'after'}
function mmmCheckbox(link,phase){
  const row=document.querySelector(`.mmm[data-link="${link}"]`);
  return row ? row.querySelector(phase==='before'?'.mb':'.ma') : null;
}
function tnmcCheckbox(link,phase){
  const panel=document.getElementById(phase==='before'?'tnmcBefore':'tnmcAfter');
  return panel ? panel.querySelector(`input[data-link="${link}"]`) : null;
}
function syncSharedFromTNMC(input){
  const link=input.dataset.link;if(!SHARED_LINKS.has(link)||syncingShared)return;
  const phase=phaseOfTNMC(input),target=mmmCheckbox(link,phase);if(!target)return;
  syncingShared=true;target.checked=input.checked;syncingShared=false;
}
function syncSharedFromMMM(input){
  const row=input.closest('.mmm'),link=row?.dataset.link;if(!SHARED_LINKS.has(link)||syncingShared)return;
  const phase=input.classList.contains('mb')?'before':'after',target=tnmcCheckbox(link,phase);if(!target)return;
  syncingShared=true;target.checked=input.checked;syncingShared=false;
}
function refreshLinkedVisuals(){
  document.querySelectorAll('.check.linked-on,.mmm.linked-on').forEach(x=>x.classList.remove('linked-on'));
  for(const link of SHARED_LINKS){
    for(const phase of ['before','after']){
      const t=tnmcCheckbox(link,phase),m=mmmCheckbox(link,phase),on=!!(t?.checked||m?.checked);
      if(on){t?.closest('.check')?.classList.add('linked-on');m?.closest('.mmm')?.classList.add('linked-on')}
    }
  }
}
function bindSharedLinks(){
  document.querySelectorAll('#tnmcBefore input[data-link],#tnmcAfter input[data-link]').forEach(i=>{
    if(i.dataset.linkBound)return;i.dataset.linkBound='1';
    i.addEventListener('change',()=>{syncSharedFromTNMC(i);update()});
  });
  document.querySelectorAll('.mmm input.mb,.mmm input.ma').forEach(i=>{
    if(i.dataset.linkBound)return;i.dataset.linkBound='1';
    i.addEventListener('change',()=>{syncSharedFromMMM(i);update()});
  });
}
function snapshotTNMC(){
  const s={before:{},after:{},tracheaBefore:'',tracheaAfter:''};
  for(const phase of ['before','after']){
    const p=document.getElementById(phase==='before'?'tnmcBefore':'tnmcAfter');
    if(!p)continue;
    p.querySelectorAll('input[type=checkbox][data-key]').forEach(x=>s[phase][x.dataset.key]=x.checked);
    s[phase==='before'?'tracheaBefore':'tracheaAfter']=p.querySelector('.tracheaLen')?.value||'';
  }
  return s;
}
function restoreTNMC(s){
  if(!s)return;
  for(const phase of ['before','after']){
    const p=document.getElementById(phase==='before'?'tnmcBefore':'tnmcAfter');if(!p)continue;
    Object.entries(s[phase]||{}).forEach(([k,on])=>{const x=p.querySelector(`input[data-key="${k}"]`);if(x)x.checked=!!on});
    const len=p.querySelector('.tracheaLen');if(len)len.value=s[phase==='before'?'tracheaBefore':'tracheaAfter']||'';
  }
}
function renderPanels(){const snap=snapshotTNMC();document.getElementById('tnmcBefore').innerHTML='';document.getElementById('tnmcAfter').innerHTML='';renderTNMC('tnmcBefore',tr('before'),tr('before2'));renderTNMC('tnmcAfter',tr('after'),tr('after2'));restoreTNMC(snap);bindSharedLinks();document.querySelectorAll('#tnmcBefore input,#tnmcAfter input').forEach(x=>{if(!x.dataset.updateBound){x.dataset.updateBound='1';x.addEventListener('input',update);if(!x.dataset.link)x.addEventListener('change',update)}});update()} renderPanels();

const mmm=[
{k:'majorArtery',w:9,t:'Major artery encasement',s:'Carotid or innominate'},
{k:'prevertebral',w:9,t:'Prevertebral fascia involvement'},
{k:'brachial',w:9,t:'Brachial plexus involvement'},
{k:'rlnVagus',w:2,t:'Unilateral RLN / vagus nerve involvement',s:'Count once as one published category'},
{k:'ijv',w:1,t:'Internal jugular vein involvement'},
{k:'strap',w:1,t:'Strap muscle involvement'}
];
document.getElementById('mmmList').innerHTML=mmm.map(x=>`<div class="mmm" data-key="${x.k}" data-link="${x.k}" data-w="${x.w}"><div class="s">${x.t}${x.s?`<small style="display:block;color:#8b949d">${x.s}</small>`:''}</div><div class="w">${x.w}</div><div class="mini">Before<br><input class="mb" type="checkbox"></div><div class="mini">After<br><input class="ma" type="checkbox"></div></div>`).join('');

const customDefaults=['Trachea / airway (additional MMM component)','Esophagus / pharynx (additional MMM component)','Larynx / laryngopharynx','Bilateral RLN / vagus involvement','Superior mediastinum / sternotomy component','CN XI / XII or other cranial nerve','Other structure'];
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function addRow(name=''){const tr=document.createElement('tr');tr.innerHTML=`<td><input class="cs" type="text" value="${esc(name)}" placeholder="Structure"></td><td><input class="cw" type="number" step="0.1" placeholder="—"></td><td style="text-align:center"><input class="cb" type="checkbox"></td><td style="text-align:center"><input class="ca" type="checkbox"></td><td><button class="del" type="button" style="border:0;background:transparent;color:#a55;font-size:14px">×</button></td>`;tr.querySelector('.del').onclick=()=>{tr.remove();update()};tr.querySelectorAll('input').forEach(x=>{x.oninput=update;x.onchange=update});document.getElementById('customBody').appendChild(tr)}
customDefaults.forEach(addRow);document.getElementById('addRow').onclick=()=>addRow('');bindSharedLinks();

function calcTNMC(p){let c=0;p.querySelectorAll('[data-cls]:checked').forEach(x=>c=Math.max(c,+x.dataset.cls));const L=parseFloat(p.querySelector('.tracheaLen').value),w=p.querySelector('.warn');let exact=false;if(Number.isFinite(L)&&L>0){if(Math.abs(L-4)<1e-9){exact=true;w.classList.add('show')}else{w.classList.remove('show');c=Math.max(c,L<4?2:3)}}else w.classList.remove('show');p.querySelector('.n').textContent=c;p.querySelector('.nm').textContent=classes[c]+(exact?' · 4.0 cm unresolved':'');return{c,exact,L:Number.isFinite(L)?L:null}}
function calcMMM(){let b=0,a=0;document.querySelectorAll('.mmm').forEach(r=>{const w=+r.dataset.w;if(r.querySelector('.mb').checked)b+=w;if(r.querySelector('.ma').checked)a+=w});mmmBefore.textContent=b;mmmAfter.textContent=a;return{b,a}}
function calcCustom(){let b=0,a=0,missing=0;document.querySelectorAll('#customBody tr').forEach(r=>{const w=parseFloat(r.querySelector('.cw').value),bb=r.querySelector('.cb').checked,aa=r.querySelector('.ca').checked;if((bb||aa)&&!Number.isFinite(w))missing++;if(Number.isFinite(w)){if(bb)b+=w;if(aa)a+=w}});customBefore.textContent=fmt(b);customAfter.textContent=fmt(a);return{b,a,missing}}
const fmt=x=>Number.isInteger(x)?String(x):x.toFixed(2);
function update(){
  const b=calcTNMC(tnmcBefore),a=calcTNMC(tnmcAfter),m=calcMMM(),c=calcCustom(),d=a.c-b.c;
  rTB.textContent=b.c+(b.exact?'*':'');rTA.textContent=a.c+(a.exact?'*':'');
  rTC.textContent=(d>0?'+':'')+d+(b.exact||a.exact?'*':'');
  tnmcChip.className='chip '+(d<0?'down':d>0?'up':'');
  tnmcChip.textContent=d<0?tr('lower'):d>0?tr('higher'):tr('noc');
  rMMM.textContent=`${fmt(m.b)} → ${fmt(m.a)}`;
  rCustom.textContent=`${fmt(c.b)} → ${fmt(c.a)}`;
  missingW.textContent=`${c.missing} ${tr('missing')}`;missingW.className='chip '+(c.missing?'up':'');
  refreshLinkedVisuals();

  const tnmcB=Math.max(0,Math.min(4,b.c)),tnmcA=Math.max(0,Math.min(4,a.c));
  tnmcBeforeBar.style.width=`${tnmcB/4*100}%`;tnmcAfterBar.style.width=`${tnmcA/4*100}%`;
  tnmcVisualLabel.textContent=`${b.c} → ${a.c}`;tnmcDeltaVisual.textContent=(d>0?'+':'')+d;
  const maxMMM=31,mb=Math.max(0,Math.min(maxMMM,m.b)),ma=Math.max(0,Math.min(maxMMM,m.a));
  mmmBeforeBar.style.width=`${mb/maxMMM*100}%`;mmmAfterBar.style.width=`${ma/maxMMM*100}%`;
  mmmVisualLabel.textContent=`${fmt(m.b)} → ${fmt(m.a)}`;
  const reduction=m.b>0?((m.b-m.a)/m.b*100):null;
  mmmReductionVisual.textContent=reduction===null?'—':`${reduction>=0?'':'+'}${Math.abs(reduction).toFixed(0)}%${reduction>=0?' ↓':' ↑'}`;

  const td=Math.sign(a.c-b.c),md=Math.sign(m.a-m.b);
  let key='response_same',cls='';
  if(td<=0&&md<=0&&(td<0||md<0)){key='response_improve';cls='good'}
  else if(td>=0&&md>=0&&(td>0||md>0)){key='response_worse';cls='bad'}
  else if(td!==0||md!==0){key='response_mixed';cls='mixed'}
  responseBadge.textContent=tr(key);responseBadge.className='response-badge '+cls;
}
window.renderDynamic=()=>{renderPanels();update()}; document.querySelectorAll('input,select,textarea').forEach(x=>{x.addEventListener('input',update);x.addEventListener('change',update)});update();

function collect(){const b=calcTNMC(tnmcBefore),a=calcTNMC(tnmcAfter),m=calcMMM(),c=calcCustom();const items=p=>Object.fromEntries([...p.querySelectorAll('[data-key]')].map(x=>[x.dataset.key,x.checked]));const verified={};document.querySelectorAll('.mmm').forEach(r=>verified[r.dataset.key]={weight:+r.dataset.w,before:r.querySelector('.mb').checked,after:r.querySelector('.ma').checked});const custom=[...document.querySelectorAll('#customBody tr')].map(r=>({structure:r.querySelector('.cs').value,weight:r.querySelector('.cw').value===''?null:+r.querySelector('.cw').value,before:r.querySelector('.cb').checked,after:r.querySelector('.ca').checked}));return{tool:'MMM + TNMC dual evaluator',case_code:caseCode.value,therapy:therapy.value,assessment_date:assessmentDate.value,TNMC:{before:{class:b.c,label:classes[b.c],tracheal_resection_cm:b.L,exact_4cm_unresolved:b.exact,items:items(tnmcBefore)},after:{class:a.c,label:classes[a.c],tracheal_resection_cm:a.L,exact_4cm_unresolved:a.exact,items:items(tnmcAfter)},change:a.c-b.c},MMM_verified:{items:verified,before_subtotal:m.b,after_subtotal:m.a,change:m.a-m.b,note:'Verified subtotal only; not a formal complete MMM total.'},MMM_research_entered:{items:custom,before_subtotal:c.b,after_subtotal:c.a,missing_weight_count:c.missing,note:'Researcher-entered weights; verify against official source.'},clinical_notes:notes.value,generated_at:new Date().toISOString()}}
function dl(content,name,type){const blob=new Blob([content],{type}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function csv(d){const rows=[['field','value'],['case_code',d.case_code],['therapy',d.therapy],['assessment_date',d.assessment_date],['tnmc_before',d.TNMC.before.class],['tnmc_after',d.TNMC.after.class],['tnmc_change',d.TNMC.change],['mmm_verified_before',d.MMM_verified.before_subtotal],['mmm_verified_after',d.MMM_verified.after_subtotal],['mmm_custom_before',d.MMM_research_entered.before_subtotal],['mmm_custom_after',d.MMM_research_entered.after_subtotal],['mmm_custom_missing_weights',d.MMM_research_entered.missing_weight_count],['clinical_notes',d.clinical_notes]];Object.entries(d.TNMC.before.items).forEach(([k,v])=>rows.push(['tnmc_before_'+k,v]));Object.entries(d.TNMC.after.items).forEach(([k,v])=>rows.push(['tnmc_after_'+k,v]));Object.entries(d.MMM_verified.items).forEach(([k,v])=>{rows.push(['mmm_'+k+'_weight',v.weight],['mmm_'+k+'_before',v.before],['mmm_'+k+'_after',v.after])});d.MMM_research_entered.items.forEach((v,i)=>rows.push([`custom_${i+1}_structure`,v.structure],[`custom_${i+1}_weight`,v.weight??''],[`custom_${i+1}_before`,v.before],[`custom_${i+1}_after`,v.after]));const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';return '\ufeff'+rows.map(r=>r.map(q).join(',')).join('\n')}
csvBtn.onclick=()=>{const d=collect();dl(csv(d),(d.case_code||'MMM_TNMC')+'.csv','text/csv;charset=utf-8')};jsonBtn.onclick=()=>{const d=collect();dl(JSON.stringify(d,null,2),(d.case_code||'MMM_TNMC')+'.json','application/json')};printBtn.onclick=()=>window.print();clearBtn.onclick=()=>{if(!confirm(tr('confirm')))return;document.querySelectorAll('input').forEach(x=>x.type==='checkbox'?x.checked=false:x.value='');document.querySelectorAll('select').forEach(x=>{if(x.id!=='langSelect')x.selectedIndex=0});notes.value='';customBody.innerHTML='';customDefaults.forEach(addRow);update()}
