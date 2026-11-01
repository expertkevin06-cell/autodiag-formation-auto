class FilterManager {
  constructor(){ this.currentFilters={brand:'',model:'',engineSpec:'',engine:'',system:'',type:'',component:'',code:'',search:''}; }
  async init(){ this.populateBrandSelect(); this.populateComponentSelect(); this.populateSystemSelect(); this.attachEventListeners(); }
  populateBrandSelect(){ const s=document.getElementById('filterBrand'); if(!s)return; getAllBrands().forEach(b=>{const o=document.createElement('option');o.value=b;o.textContent=b;s.appendChild(o);}); }
  populateComponentSelect(){ const s=document.getElementById('filterComponent'); if(!s)return; [...new Set(getComponentsByType())].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;s.appendChild(o);}); }
  populateSystemSelect(){ const s=document.getElementById('filterSystem'); if(!s)return; const S=window.SYSTEM_LABELS||{}; Object.entries(S).forEach(([k,v])=>{const o=document.createElement('option');o.value=k;o.textContent=v;s.appendChild(o);}); }
  attachEventListeners(){
    const on=(id,ev,fn)=>{ const el=document.getElementById(id); if(el) el.addEventListener(ev,fn); };
    on('filterBrand','change',e=>this.updateModelSelect(e.target.value));
    on('filterModel','change',e=>{this.updateEngineSpecSelect(e.target.value);this.syncEngineType();});
    on('filterEngineSpec','change',()=>this.syncEngineType());
    on('filterType','change',e=>this.updateComponentSelectByType(e.target.value));
    on('applyFilters','click',()=>this.applyFilters());
    on('resetFilters','click',()=>this.resetFilters());
  }
  sysOf(f){ return window.getSystem ? getSystem(f) : (f.system||'moteur'); }
  updateModelSelect(brand){
    const ms=document.getElementById('filterModel'), ss=document.getElementById('filterEngineSpec');
    if(!ms||!ss) return;
    ms.innerHTML='<option value="">Tous les modèles</option>'; ss.innerHTML='<option value="">Toutes motorisations</option>'; ss.disabled=true;
    if(brand){ getModelsByBrand(brand).forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=m;ms.appendChild(o);}); ms.disabled=false; } else ms.disabled=true;
    const ei=document.getElementById('engineInfoSection'); if(ei) ei.style.display='none';
  }
  updateEngineSpecSelect(model){
    const ss=document.getElementById('filterEngineSpec'); if(!ss)return;
    ss.innerHTML='<option value="">Toutes motorisations</option>';
    const brand=document.getElementById('filterBrand').value;
    if(brand&&model){ const list=getEnginesByModel(brand,model); list.forEach(e=>{const o=document.createElement('option');o.value=e.name;o.textContent=`${e.name} (${e.ch} ch / ${e.kw} kW) - ${e.years}`;ss.appendChild(o);}); ss.disabled=list.length===0; } else ss.disabled=true;
  }
  syncEngineType(){ const e=this.getSelectedEngine(); if(e){ const t=document.getElementById('filterEngine'); if(t) t.value=e.type; } }
  getSelectedEngine(){
    const b=(document.getElementById('filterBrand')||{}).value||'', m=(document.getElementById('filterModel')||{}).value||'', s=(document.getElementById('filterEngineSpec')||{}).value||'';
    if(!s) return null; return getEnginesByModel(b,m).find(e=>e.name===s)||null;
  }
  updateComponentSelectByType(t){ const s=document.getElementById('filterComponent'); if(!s)return; s.innerHTML='<option value="">Tous composants</option>'; [...new Set(getComponentsByType(t))].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;s.appendChild(o);}); }
  applyFilters(){
    const eng=this.getSelectedEngine();
    const g=id=>(document.getElementById(id)||{}).value||'';
    this.currentFilters={ brand:g('filterBrand'), model:g('filterModel'), engineSpec:g('filterEngineSpec'), engine:eng?eng.type:g('filterEngine'), system:g('filterSystem'), type:g('filterType'), component:g('filterComponent'), code:g('filterCode').trim().toUpperCase(), search:g('filterSearch').trim().toLowerCase() };
    this.renderEngineInfo(); this.renderResults();
  }
  resetFilters(){
    ['filterBrand','filterModel','filterEngineSpec','filterEngine','filterSystem','filterType','filterComponent','filterCode','filterSearch'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';});
    const ms=document.getElementById('filterModel'); if(ms) ms.disabled=true;
    const ss=document.getElementById('filterEngineSpec'); if(ss){ ss.disabled=true; }
    this.currentFilters={brand:'',model:'',engineSpec:'',engine:'',system:'',type:'',component:'',code:'',search:''};
    const ei=document.getElementById('engineInfoSection'); if(ei) ei.style.display='none';
    const cl=document.getElementById('campaignsList'); if(cl) cl.innerHTML='';
    this.renderResults();
  }
  renderEngineInfo(){
    const sec=document.getElementById('engineInfoSection'), body=document.getElementById('engineInfoBody'), title=document.getElementById('engineInfoTitle');
    if(!sec||!body) return;
    const eng=this.getSelectedEngine();
    if(!eng){ sec.style.display='none'; return; }
    const tl={essence:'Essence',diesel:'Diesel (gazole)',hybride:'Hybride',electrique:'Électrique',flexfuel:'FlexFuel/GPL'};
    let html=`<p><strong>Moteur :</strong> ${eng.name} | <strong>Type :</strong> ${tl[eng.type]} | <strong>Puissance :</strong> ${eng.ch} ch (${eng.kw} kW) | <strong>Années :</strong> ${eng.years}</p>`;
    if(window.verifyEngine){ const v=verifyEngine(eng); html+=`<h3>🧪 Auto-vérification</h3><ul>${v.checks.map(c=>`<li class="${c.ok?'verif-ok':'verif-ko'}">${c.ok?'✅':'⚠️'} ${c.label} : ${c.detail}</li>`).join('')}</ul>`; }
    if(eng.issues&&eng.issues.length) html+=`<h3>⚠️ Problèmes connus</h3><ul>${eng.issues.map(i=>`<li>${i}</li>`).join('')}</ul>`;
    if(eng.recalls&&eng.recalls.length) html+=`<h3>📢 Campagnes</h3><ul>${eng.recalls.map(r=>`<li>${r}</li>`).join('')}</ul>`;
    title.textContent=`🚗 ${this.currentFilters.brand} ${this.currentFilters.model} - ${eng.name}`;
    body.innerHTML=html; sec.style.display='block';
  }
  renderCampaigns(){
    const list=document.getElementById('campaignsList'); if(!list)return;
    const {brand,model,engineSpec}=this.currentFilters;
    if(!brand&&!model){ list.innerHTML=''; return; }
    const camps=getCampaigns(brand,model,engineSpec);
    if(!camps.length){ list.innerHTML=''; return; }
    const sev={critique:'🔴',important:'🟡',modéré:'🟢'};
    list.innerHTML=`<h3 style="margin:.5rem 0">📢 Campagnes & bulletins (${camps.length})</h3>`+camps.map(c=>`<div class="campaign-card"><strong>${sev[c.severity]||''} ${c.title}</strong><p style="margin:.25rem 0"><small>${c.brands.join(', ')} | ${c.engines.join(', ')} | ${c.years}</small></p><p style="margin:0"><strong>Action :</strong> ${c.action}</p></div>`).join('');
  }
  buildInfoCards(){
    const cards=[]; const {brand,model}=this.currentFilters; const eng=this.getSelectedEngine();
    if(eng){ (eng.issues||[]).forEach(i=>cards.push(this.createInfoCard(`${eng.name} : ${i}`,'Défaut connu répertorié','issue'))); (eng.recalls||[]).forEach(r=>cards.push(this.createInfoCard(`${eng.name} : ${r}`,'Action constructeur','recall'))); }
    else if(brand&&model){ getEnginesByModel(brand,model).forEach(e=>(e.issues||[]).forEach(i=>cards.push(this.createInfoCard(`${e.name} : ${i}`,'Défaut connu répertorié','issue')))); }
    return cards;
  }
  createInfoCard(t,s,k){ const c=document.createElement('div'); c.className='fault-card '+(k==='recall'?'electrique':'mecanique'); c.innerHTML=`<h3>${k==='recall'?'📢':'️'} ${t}</h3><p>${s}</p><div class="meta"><span class="tag">${k==='recall'?'Campagne constructeur':'Défaut connu'}</span></div>`; return c; }
  async renderResults(){
    const rl=document.getElementById('resultsList'), nr=document.getElementById('noResults'), rc=document.getElementById('resultsCount');
    if(!rl) return;
    this.renderCampaigns();
    const faults=this.filterFaults(await db.getAll('faults'));
    const infos=this.buildInfoCards();
    rl.innerHTML=''; const total=faults.length+infos.length; if(rc) rc.textContent=total;
    if(!total){ if(nr) nr.style.display='block'; return; }
    if(nr) nr.style.display='none';
    infos.forEach(c=>rl.appendChild(c)); faults.forEach(f=>rl.appendChild(this.createFaultCard(f)));
  }
  filterFaults(faults){
    const eng=this.getSelectedEngine();
    return faults.filter(f=>{
      if(this.currentFilters.brand && !(f.brands.includes('ALL')||f.brands.includes(this.currentFilters.brand))) return false;
      if(this.currentFilters.model){ if(f.modelRefs&&f.modelRefs.length){ if(!f.modelRefs.includes(this.currentFilters.model)&&!f.brands.includes('ALL')) return false; } else if(!f.brands.includes('ALL')&&!f.brands.includes(this.currentFilters.brand)) return false; }
      if(eng){ const strong=f.engineRefs&&f.engineRefs.includes(eng.name); if(!strong&&!(f.engines||[]).includes(eng.type)) return false; }
      else if(this.currentFilters.engine && !(f.engines||[]).includes(this.currentFilters.engine)) return false;
      if(this.currentFilters.system && this.sysOf(f)!==this.currentFilters.system) return false;
      if(this.currentFilters.type&&f.type!==this.currentFilters.type) return false;
      if(this.currentFilters.component&&f.component!==this.currentFilters.component) return false;
      if(this.currentFilters.code&&(!f.code||!String(f.code).toUpperCase().includes(this.currentFilters.code))) return false;
      if(this.currentFilters.search){ const lbl=(window.SYSTEM_LABELS&&SYSTEM_LABELS[this.sysOf(f)])||''; const txt=[f.title,f.component,f.code,lbl,...(f.symptoms||[]),...(f.causes||[]),...(f.consequences||[]),...(f.tsb||[]),...(f.recalls||[])].join(' ').toLowerCase(); if(!txt.includes(this.currentFilters.search)) return false; }
      return true;
    }).sort((a,b)=>{ if(!eng)return 0; return ((a.engineRefs||[]).includes(eng.name)?0:1)-((b.engineRefs||[]).includes(eng.name)?0:1); });
  }
  createFaultCard(f){
    const c=document.createElement('div'); c.className=`fault-card ${f.type}`; c.onclick=()=>this.showFaultDetails(f);
    const el={essence:'Essence',diesel:'Diesel',hybride:'Hybride',electrique:'Électrique',flexfuel:'FlexFuel'};
    const tl={mecanique:'Mécanique',electrique:'Électrique',electronique:'Électronique'};
    const sl={modéré:'🟢 Modéré',important:'🟡 Important',critique:'🔴 Critique'};
    const bt=f.brands.includes('ALL')?'Toutes marques':f.brands.slice(0,3).join(', ')+(f.brands.length>3?'...':'');
    const tsb=(f.tsb&&f.tsb.length)||(f.recalls&&f.recalls.length);
    const sysLbl=(window.SYSTEM_LABELS&&SYSTEM_LABELS[this.sysOf(f)])||this.sysOf(f);
    c.innerHTML=`<h3>${f.title}</h3><p><strong>Composant:</strong> ${f.component}</p><div class="meta"><span class="tag" style="background:#eef2ff;border-color:#c7d2fe">${sysLbl}</span>${f.code?`<span class="tag code">${f.code}</span>`:''}<span class="tag">${tl[f.type]||f.type}</span><span class="tag">${bt}</span>${(f.engines||[]).map(e=>`<span class="tag">${el[e]||e}</span>`).join('')}${f.severity?`<span class="tag">${sl[f.severity]}</span>`:''}${tsb?'<span class="tag" style="background:#fff7ed;border-color:#fed7aa">📢 TSB/Rappel</span>':''}</div>`;
    return c;
  }
  showFaultDetails(f){
    const mt=document.getElementById('modalTitle'), mb=document.getElementById('modalBody'), mo=document.getElementById('faultModal');
    if(!mt||!mb||!mo) return;
    mt.textContent=f.title;
    const el={essence:'Essence',diesel:'Diesel',hybride:'Hybride',electrique:'Électrique',flexfuel:'FlexFuel'};
    const sysLbl=(window.SYSTEM_LABELS&&SYSTEM_LABELS[this.sysOf(f)])||this.sysOf(f);
    mb.innerHTML=`<div class="fault-detail">
      <p><strong>Système :</strong> ${sysLbl}</p>
      ${f.code?`<p><strong>Code OBD:</strong> <code>${f.code}</code></p>`:''}
      <p><strong>Composant:</strong> ${f.component}</p>
      <p><strong>Marques:</strong> ${f.brands.includes('ALL')?'Toutes marques':f.brands.join(', ')}</p>
      ${f.modelRefs?`<p><strong>Modèles:</strong> ${f.modelRefs.join(', ')}</p>`:''}
      ${f.engineRefs?`<p><strong>Motorisations:</strong> ${f.engineRefs.join(', ')}</p>`:`<p><strong>Motorisations:</strong> ${(f.engines||[]).map(e=>el[e]||e).join(', ')}</p>`}
      ${f.cost?`<p><strong>Coût estimé:</strong> ${f.cost}</p>`:''}
      <h3>🔍 Symptômes</h3><ul>${(f.symptoms||[]).map(s=>`<li>${s}</li>`).join('')}</ul>
      <h3>⚠️ Causes</h3><ul>${(f.causes||[]).map(s=>`<li>${s}</li>`).join('')}</ul>
      <h3>💥 Conséquences</h3><ul>${(f.consequences||[]).map(s=>`<li>${s}</li>`).join('')}</ul>
      <h3>🔧 Diagnostics</h3><ul>${(f.diagnostics||[]).map(s=>`<li>${s}</li>`).join('')}</ul>
      <h3>🛠️ Réparations</h3><ul>${(f.repairs||[]).map(s=>`<li>${s}</li>`).join('')}</ul>
      ${f.tsb&&f.tsb.length?`<h3>📋 TSB</h3><ul>${f.tsb.map(s=>`<li>${s}</li>`).join('')}</ul>`:''}
      ${f.recalls&&f.recalls.length?`<h3>📢 Rappels</h3><ul>${f.recalls.map(s=>`<li>${s}</li>`).join('')}</ul>`:''}</div>`;
    mo.classList.add('active');
  }
}
if (typeof window !== 'undefined') window.FilterManager = FilterManager;
