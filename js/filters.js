class FilterManager {
  constructor(){ this.currentFilters={brand:'',model:'',engineSpec:'',engine:'',type:'',component:'',code:'',search:''}; }
  async init(){ this.populateBrandSelect(); this.populateComponentSelect(); this.attachEventListeners(); }
  populateBrandSelect(){ const s=document.getElementById('filterBrand'); if(!s)return; getAllBrands().forEach(b=>{const o=document.createElement('option');o.value=b;o.textContent=b;s.appendChild(o);}); }
  populateComponentSelect(){ const s=document.getElementById('filterComponent'); if(!s)return; [...new Set(getComponentsByType())].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;s.appendChild(o);}); }
  attachEventListeners(){
    const b=document.getElementById('filterBrand'), m=document.getElementById('filterModel'), sp=document.getElementById('filterEngineSpec'), t=document.getElementById('filterType');
    if(b)b.addEventListener('change',e=>this.updateModelSelect(e.target.value));
    if(m)m.addEventListener('change',e=>{this.updateEngineSpecSelect(e.target.value);this.syncEngineType();});
    if(sp)sp.addEventListener('change',()=>this.syncEngineType());
    if(t)t.addEventListener('change',e=>this.updateComponentSelectByType(e.target.value));
    document.getElementById('applyFilters').addEventListener('click',()=>this.applyFilters());
    document.getElementById('resetFilters').addEventListener('click',()=>this.resetFilters());
  }
  updateModelSelect(brand){
    const ms=document.getElementById('filterModel'), ss=document.getElementById('filterEngineSpec');
    ms.innerHTML='<option value="">Tous les modèles</option>'; ss.innerHTML='<option value="">Toutes motorisations</option>'; ss.disabled=true;
    if(brand){ getModelsByBrand(brand).forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=m;ms.appendChild(o);}); ms.disabled=false; } else ms.disabled=true;
    document.getElementById('engineInfoSection').style.display='none';
  }
  updateEngineSpecSelect(model){
    const ss=document.getElementById('filterEngineSpec'); ss.innerHTML='<option value="">Toutes motorisations</option>';
    const brand=document.getElementById('filterBrand').value;
    if(brand&&model){ const list=getEnginesByModel(brand,model); list.forEach(e=>{const o=document.createElement('option');o.value=e.name;o.textContent=`${e.name} (${e.ch} ch / ${e.kw} kW) - ${e.years}`;ss.appendChild(o);}); ss.disabled=list.length===0; } else ss.disabled=true;
  }
  syncEngineType(){ const e=this.getSelectedEngine(); if(e) document.getElementById('filterEngine').value=e.type; }
  getSelectedEngine(){
    const b=document.getElementById('filterBrand').value, m=document.getElementById('filterModel').value, s=document.getElementById('filterEngineSpec').value;
    if(!s) return null;
    return getEnginesByModel(b,m).find(e=>e.name===s)||null;
  }
  updateComponentSelectByType(t){ const s=document.getElementById('filterComponent'); s.innerHTML='<option value="">Tous composants</option>'; [...new Set(getComponentsByType(t))].sort().forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;s.appendChild(o);}); }
  applyFilters(){
    const eng=this.getSelectedEngine();
    this.currentFilters={ brand:document.getElementById('filterBrand').value, model:document.getElementById('filterModel').value, engineSpec:document.getElementById('filterEngineSpec').value, engine:eng?eng.type:document.getElementById('filterEngine').value, type:document.getElementById('filterType').value, component:document.getElementById('filterComponent').value, code:document.getElementById('filterCode').value.trim().toUpperCase(), search:document.getElementById('filterSearch').value.trim().toLowerCase() };
    this.renderEngineInfo(); this.renderResults();
  }
  resetFilters(){
    ['filterBrand','filterModel','filterEngineSpec','filterEngine','filterType','filterComponent','filterCode','filterSearch'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('filterModel').disabled=true; document.getElementById('filterEngineSpec').disabled=true;
    this.currentFilters={brand:'',model:'',engineSpec:'',engine:'',type:'',component:'',code:'',search:''};
    document.getElementById('engineInfoSection').style.display='none'; document.getElementById('campaignsList').innerHTML='';
    this.renderResults();
  }
  renderEngineInfo(){
    const sec=document.getElementById('engineInfoSection'), body=document.getElementById('engineInfoBody'), title=document.getElementById('engineInfoTitle');
    const eng=this.getSelectedEngine();
    if(!eng){ sec.style.display='none'; return; }
    const tl={essence:'Essence',diesel:'Diesel (gazole)',hybride:'Hybride',electrique:'Électrique',flexfuel:'FlexFuel/GPL'};
    const v=verifyEngine(eng);
    let html=`<p><strong>Moteur :</strong> ${eng.name} | <strong>Type :</strong> ${tl[eng.type]} | <strong>Puissance :</strong> ${eng.ch} ch (${eng.kw} kW) | <strong>Cylindrée :</strong> ${v.cc?v.cc+' cm³':'0 cm³ (batterie '+eng.code+')'} | <strong>Années :</strong> ${eng.years}</p>`;
    html+=`<h3>🧪 Auto-vérification</h3><ul>${v.checks.map(c=>`<li class="${c.ok?'verif-ok':'verif-ko'}">${c.ok?'✅':'⚠️'} ${c.label} : ${c.detail}</li>`).join('')}</ul>`;
    if(eng.issues.length) html+=`<h3>⚠️ Problèmes connus</h3><ul>${eng.issues.map(i=>`<li>${i}</li>`).join('')}</ul>`;
    if(eng.recalls.length) html+=`<h3>📢 Campagnes / actions</h3><ul>${eng.recalls.map(r=>`<li>${r}</li>`).join('')}</ul>`;
    title.textContent=`🚗 ${this.currentFilters.brand} ${this.currentFilters.model} - ${eng.name}`;
    body.innerHTML=html; sec.style.display='block';
  }
  renderCampaigns(){
    const list=document.getElementById('campaignsList'); const {brand,model,engineSpec}=this.currentFilters;
    if(!brand&&!model){ list.innerHTML=''; return; }
    const camps=getCampaigns(brand,model,engineSpec);
    if(!camps.length){ list.innerHTML=''; return; }
    const sev={critique:'🔴',important:'🟡',modéré:'🟢'};
    list.innerHTML=`<h3 style="margin:.5rem 0">📢 Campagnes & bulletins (${camps.length})</h3>`+camps.map(c=>`<div class="campaign-card"><strong>${sev[c.severity]||''} ${c.title}</strong><p style="margin:.25rem 0"><small>${c.brands.join(', ')} | ${c.engines.join(', ')} | ${c.years}</small></p><p style="margin:0"><strong>Action :</strong> ${c.action}</p></div>`).join('');
  }
  buildInfoCards(){
    const cards=[]; const {brand,model}=this.currentFilters; const eng=this.getSelectedEngine();
    if(eng){ eng.issues.forEach(i=>cards.push(this.createInfoCard(`${eng.name} : ${i}`,'Défaut connu répertorié','issue'))); eng.recalls.forEach(r=>cards.push(this.createInfoCard(`${eng.name} : ${r}`,'Action constructeur','recall'))); }
    else if(brand&&model){ getEnginesByModel(brand,model).forEach(e=>e.issues.forEach(i=>cards.push(this.createInfoCard(`${e.name} : ${i}`,'Défaut connu répertorié','issue')))); }
    return cards;
  }
  createInfoCard(t,s,k){ const c=document.createElement('div'); c.className='fault-card '+(k==='recall'?'electrique':'mecanique'); c.innerHTML=`<h3>${k==='recall'?'📢':'️'} ${t}</h3><p>${s}</p><div class="meta"><span class="tag">${k==='recall'?'Campagne constructeur':'Défaut connu'}</span></div>`; return c; }
  async renderResults(){
    const rl=document.getElementById('resultsList'), nr=document.getElementById('noResults'), rc=document.getElementById('resultsCount');
    if(!rl) return;
    this.renderCampaigns();
    const faults=this.filterFaults(await db.getAll('faults'));
    const infos=this.buildInfoCards();
    rl.innerHTML=''; const total=faults.length+infos.length; rc.textContent=total;
    if(!total){ nr.style.display='block'; return; }
    nr.style.display='none';
    infos.forEach(c=>rl.appendChild(c)); faults.forEach(f=>rl.appendChild(this.createFaultCard(f)));
  }
  filterFaults(faults){
    const eng=this.getSelectedEngine();
    return faults.filter(f=>{
      if(this.currentFilters.brand && !(f.brands.includes('ALL')||f.brands.includes(this.currentFilters.brand))) return false;
      if(this.currentFilters.model){ if(f.modelRefs&&f.modelRefs.length){ if(!f.modelRefs.includes(this.currentFilters.model)&&!f.brands.includes('ALL')) return false; } else if(!f.brands.includes('ALL')&&!f.brands.includes(this.currentFilters.brand)) return false; }
      if(eng){ const strong=f.engineRefs&&f.engineRefs.includes(eng.name); if(!strong&&!f.engines.includes(eng.type)) return false; }
      else if(this.currentFilters.engine && !f.engines.includes(this.currentFilters.engine)) return false;
      if(this.currentFilters.type&&f.type!==this.currentFilters.type) return false;
      if(this.currentFilters.component&&f.component!==this.currentFilters.component) return false;
      if(this.currentFilters.code&&(!f.code||!f.code.toUpperCase().includes(this.currentFilters.code))) return false;
      if(this.currentFilters.search){ const txt=[f.title,f.component,f.code,...(f.symptoms||[]),...(f.causes||[]),...(f.consequences||[]),...(f.tsb||[]),...(f.recalls||[])].join(' ').toLowerCase(); if(!txt.includes(this.currentFilters.search)) return false; }
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
    c.innerHTML=`<h3>${f.title}</h3><p><strong>Composant:</strong> ${f.component}</p><div class="meta">${f.code?`<span class="tag code">${f.code}</span>`:''}<span class="tag">${tl[f.type]}</span><span class="tag">${bt}</span>${f.engines.map(e=>`<span class="tag">${el[e]||e}</span>`).join('')}${f.severity?`<span class="tag">${sl[f.severity]}</span>`:''}${tsb?'<span class="tag" style="background:#fff7ed;border-color:#fed7aa">📢 TSB/Rappel</span>':''}</div>`;
    return c;
  }
  showFaultDetails(f){
    document.getElementById('modalTitle').textContent=f.title;
    const el={essence:'Essence',diesel:'Diesel',hybride:'Hybride',electrique:'Électrique',flexfuel:'FlexFuel'};
    document.getElementById('modalBody').innerHTML=`<div class="fault-detail">
      ${f.code?`<p><strong>Code OBD:</strong> <code>${f.code}</code></p>`:''}
      <p><strong>Composant:</strong> ${f.component}</p>
      <p><strong>Marques:</strong> ${f.brands.includes('ALL')?'Toutes marques':f.brands.join(', ')}</p>
      ${f.modelRefs?`<p><strong>Modèles:</strong> ${f.modelRefs.join(', ')}</p>`:''}
      ${f.engineRefs?`<p><strong>Motorisations:</strong> ${f.engineRefs.join(', ')}</p>`:`<p><strong>Motorisations:</strong> ${f.engines.map(e=>el[e]||e).join(', ')}</p>`}
      ${f.cost?`<p><strong>Coût estimé:</strong> ${f.cost}</p>`:''}
      <h3>🔍 Symptômes</h3><ul>${f.symptoms.map(s=>`<li>${s}</li>`).join('')}</ul>
      <h3>⚠️ Causes</h3><ul>${f.causes.map(s=>`<li>${s}</li>`).join('')}</ul>
      <h3>💥 Conséquences</h3><ul>${f.consequences.map(s=>`<li>${s}</li>`).join('')}</ul>
      <h3>🔧 Diagnostics</h3><ul>${f.diagnostics.map(s=>`<li>${s}</li>`).join('')}</ul>
      <h3>🛠️ Réparations</h3><ul>${f.repairs.map(s=>`<li>${s}</li>`).join('')}</ul>
      ${f.tsb&&f.tsb.length?`<h3>📋 TSB</h3><ul>${f.tsb.map(s=>`<li>${s}</li>`).join('')}</ul>`:''}
      ${f.recalls&&f.recalls.length?`<h3>📢 Rappels</h3><ul>${f.recalls.map(s=>`<li>${s}</li>`).join('')}</ul>`:''}</div>`;
    document.getElementById('faultModal').classList.add('active');
  }
}
if (typeof window !== 'undefined') window.FilterManager = FilterManager;
