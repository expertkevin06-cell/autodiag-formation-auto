/**
 * Filtres v4 : résultats garantis pour tous modèles/motorisations
 * - Auto-cohérence type/motorisation précise
 * - Défauts connus + campagnes affichés dans les résultats
 * - Pannes génériques par type
 */
class FilterManager {
  constructor(){
    this.currentFilters = { brand:'', model:'', engineSpec:'', engine:'', type:'', component:'', code:'', search:'' };
  }

  async init(){
    this.populateBrandSelect();
    this.populateComponentSelect();
    this.attachEventListeners();
  }

  populateBrandSelect(){
    const s = document.getElementById('filterBrand'); if(!s) return;
    getAllBrands().forEach(b => { const o=document.createElement('option'); o.value=b; o.textContent=b; s.appendChild(o); });
  }

  populateComponentSelect(){
    const s = document.getElementById('filterComponent'); if(!s) return;
    [...new Set(getComponentsByType())].sort().forEach(c => { const o=document.createElement('option'); o.value=c; o.textContent=c; s.appendChild(o); });
  }

  attachEventListeners(){
    const brand=document.getElementById('filterBrand');
    const model=document.getElementById('filterModel');
    const spec=document.getElementById('filterEngineSpec');
    const type=document.getElementById('filterType');
    if(brand) brand.addEventListener('change', e=>this.updateModelSelect(e.target.value));
    if(model) model.addEventListener('change', e=>{ this.updateEngineSpecSelect(e.target.value); this.syncEngineType(); });
    if(spec) spec.addEventListener('change', ()=>this.syncEngineType());
    if(type) type.addEventListener('change', e=>this.updateComponentSelectByType(e.target.value));
    const apply=document.getElementById('applyFilters'); if(apply) apply.addEventListener('click', ()=>this.applyFilters());
    const reset=document.getElementById('resetFilters'); if(reset) reset.addEventListener('click', ()=>this.resetFilters());
  }

  updateModelSelect(brand){
    const modelSelect=document.getElementById('filterModel');
    const specSelect=document.getElementById('filterEngineSpec');
    modelSelect.innerHTML='<option value="">Tous les modèles</option>';
    specSelect.innerHTML='<option value="">Toutes motorisations</option>';
    specSelect.disabled=true;
    if(brand){
      getModelsByBrand(brand).forEach(m=>{ const o=document.createElement('option'); o.value=m; o.textContent=m; modelSelect.appendChild(o); });
      modelSelect.disabled=false;
    } else modelSelect.disabled=true;
    document.getElementById('engineInfoSection').style.display='none';
  }

  updateEngineSpecSelect(model){
    const specSelect=document.getElementById('filterEngineSpec');
    specSelect.innerHTML='<option value="">Toutes motorisations</option>';
    const brand=document.getElementById('filterBrand').value;
    if(brand && model){
      const list=getEnginesByModel(brand,model);
      list.forEach(e=>{ const o=document.createElement('option'); o.value=e.name; o.textContent=`${e.name} (${e.ch} ch / ${e.kw} kW) - ${e.years}`; specSelect.appendChild(o); });
      specSelect.disabled = list.length===0;
    } else specSelect.disabled=true;
  }

  // Force le type de motorisation cohérent avec la motorisation précise
  syncEngineType(){
    const eng=this.getSelectedEngine();
    if(eng){ document.getElementById('filterEngine').value = eng.type; }
  }

  getSelectedEngine(){
    const brand=document.getElementById('filterBrand').value;
    const model=document.getElementById('filterModel').value;
    const spec=document.getElementById('filterEngineSpec').value;
    if(!spec) return null;
    return getEnginesByModel(brand,model).find(e=>e.name===spec) || null;
  }

  updateComponentSelectByType(type){
    const s=document.getElementById('filterComponent');
    s.innerHTML='<option value="">Tous composants</option>';
    [...new Set(getComponentsByType(type))].sort().forEach(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=c; s.appendChild(o); });
  }

  applyFilters(){
    const eng=this.getSelectedEngine();
    this.currentFilters = {
      brand: document.getElementById('filterBrand').value,
      model: document.getElementById('filterModel').value,
      engineSpec: document.getElementById('filterEngineSpec').value,
      engine: eng ? eng.type : document.getElementById('filterEngine').value,
      type: document.getElementById('filterType').value,
      component: document.getElementById('filterComponent').value,
      code: document.getElementById('filterCode').value.trim().toUpperCase(),
      search: document.getElementById('filterSearch').value.trim().toLowerCase()
    };
    this.renderEngineInfo();
    this.renderResults();
  }

  resetFilters(){
    ['filterBrand','filterModel','filterEngineSpec','filterEngine','filterType','filterComponent','filterCode','filterSearch'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('filterModel').disabled=true;
    document.getElementById('filterEngineSpec').disabled=true;
    this.currentFilters={ brand:'',model:'',engineSpec:'',engine:'',type:'',component:'',code:'',search:'' };
    document.getElementById('engineInfoSection').style.display='none';
    document.getElementById('campaignsList').innerHTML='';
    this.renderResults();
  }

  renderEngineInfo(){
    const section=document.getElementById('engineInfoSection');
    const body=document.getElementById('engineInfoBody');
    const title=document.getElementById('engineInfoTitle');
    const eng=this.getSelectedEngine();
    if(!eng){ section.style.display='none'; return; }
    const typeLabels={ essence:'Essence', diesel:'Diesel', hybride:'Hybride', electrique:'Électrique', flexfuel:'FlexFuel/GPL' };
    let html=`<p><strong>Moteur :</strong> ${eng.name} | <strong>Type :</strong> ${typeLabels[eng.type]} | <strong>Puissance :</strong> ${eng.ch} ch (${eng.kw} kW) | <strong>Code :</strong> ${eng.code} | <strong>Années :</strong> ${eng.years}</p>`;
    if(eng.issues.length) html+=`<h3>⚠️ Problèmes connus / répertoriés</h3><ul>${eng.issues.map(i=>`<li>${i}</li>`).join('')}</ul>`;
    if(eng.recalls.length) html+=`<h3>📢 Campagnes / actions constructeur</h3><ul>${eng.recalls.map(r=>`<li>${r}</li>`).join('')}</ul>`;
    title.textContent=`🚗 ${this.currentFilters.brand} ${this.currentFilters.model} - ${eng.name}`;
    body.innerHTML=html;
    section.style.display='block';
  }

  renderCampaigns(){
    const list=document.getElementById('campaignsList');
    const {brand,model,engineSpec}=this.currentFilters;
    if(!brand && !model){ list.innerHTML=''; return; }
    const camps=getCampaigns(brand,model,engineSpec);
    if(!camps.length){ list.innerHTML=''; return; }
    const sev={ critique:'🔴', important:'🟡', modéré:'🟢' };
    list.innerHTML=`<h3 style="margin:0.5rem 0;">📢 Campagnes de rappel & bulletins techniques (${camps.length})</h3>` +
      camps.map(c=>`<div class="campaign-card"><strong>${sev[c.severity]||''} ${c.title}</strong><p style="margin:0.25rem 0;"><small>${c.brands.join(', ')} - ${c.models.slice(0,6).join(', ')}${c.models.length>6?'...':''} | ${c.engines.join(', ')} | ${c.years}</small></p><p style="margin:0;"><strong>Action :</strong> ${c.action}</p></div>`).join('');
  }

  // Cartes "défauts connus" issues des motorisations
  buildInfoCards(){
    const cards=[];
    const {brand,model}=this.currentFilters;
    const eng=this.getSelectedEngine();
    if(eng){
      eng.issues.forEach(i=>cards.push(this.createInfoCard(`${eng.name} : ${i}`,'Défaut connu répertorié pour cette motorisation','issue')));
      eng.recalls.forEach(r=>cards.push(this.createInfoCard(`${eng.name} : ${r}`,'Action / campagne constructeur','recall')));
    } else if(brand && model){
      getEnginesByModel(brand,model).forEach(e=>{
        e.issues.forEach(i=>cards.push(this.createInfoCard(`${e.name} : ${i}`,'Défaut connu répertorié pour cette motorisation','issue')));
      });
    }
    return cards;
  }

  createInfoCard(title, sub, kind){
    const card=document.createElement('div');
    card.className='fault-card '+(kind==='recall'?'electrique':'mecanique');
    card.innerHTML=`<h3>${kind==='recall'?'📢':'⚠️'} ${title}</h3><p>${sub}</p><div class="meta"><span class="tag">${kind==='recall'?'Campagne / action constructeur':'Défaut connu répertorié'}</span></div>`;
    return card;
  }

  async renderResults(){
    const resultsList=document.getElementById('resultsList');
    const noResults=document.getElementById('noResults');
    const resultsCount=document.getElementById('resultsCount');
    if(!resultsList) return;

    this.renderCampaigns();

    const allFaults=await db.getAll('faults');
    const faults=this.filterFaults(allFaults);
    const infoCards=this.buildInfoCards();

    resultsList.innerHTML='';
    const total=faults.length+infoCards.length;
    resultsCount.textContent=total;
    if(total===0){ noResults.style.display='block'; return; }
    noResults.style.display='none';
    infoCards.forEach(c=>resultsList.appendChild(c));
    faults.forEach(f=>resultsList.appendChild(this.createFaultCard(f)));
  }

  filterFaults(faults){
    const eng=this.getSelectedEngine();
    return faults.filter(f=>{
      // Marque
      if(this.currentFilters.brand){
        if(!(f.brands.includes('ALL') || f.brands.includes(this.currentFilters.brand))) return false;
      }
      // Modèle
      if(this.currentFilters.model){
        if(f.modelRefs && f.modelRefs.length){
          if(!f.modelRefs.includes(this.currentFilters.model) && !f.brands.includes('ALL')) return false;
        } else if(!f.brands.includes('ALL') && !f.brands.includes(this.currentFilters.brand)) return false;
      }
      // Motorisation
      if(eng){
        const strong=f.engineRefs && f.engineRefs.includes(eng.name);
        const typeMatch=f.engines.includes(eng.type);
        if(!strong && !typeMatch) return false;
      } else if(this.currentFilters.engine){
        if(!f.engines.includes(this.currentFilters.engine)) return false;
      }
      if(this.currentFilters.type && f.type!==this.currentFilters.type) return false;
      if(this.currentFilters.component && f.component!==this.currentFilters.component) return false;
      if(this.currentFilters.code && (!f.code || !f.code.toUpperCase().includes(this.currentFilters.code))) return false;
      if(this.currentFilters.search){
        const txt=[f.title,f.component,f.code,...(f.symptoms||[]),...(f.causes||[]),...(f.consequences||[]),...(f.tsb||[]),...(f.recalls||[])].join(' ').toLowerCase();
        if(!txt.includes(this.currentFilters.search)) return false;
      }
      return true;
    }).sort((a,b)=>{
      if(!eng) return 0;
      const sa=(a.engineRefs||[]).includes(eng.name)?0:1;
      const sb=(b.engineRefs||[]).includes(eng.name)?0:1;
      return sa-sb;
    });
  }

  createFaultCard(fault){
    const card=document.createElement('div');
    card.className=`fault-card ${fault.type}`;
    card.onclick=()=>this.showFaultDetails(fault);
    const engineLabels={ essence:'Essence', diesel:'Diesel', hybride:'Hybride', electrique:'Électrique', flexfuel:'FlexFuel' };
    const typeLabels={ mecanique:'Mécanique', electrique:'Électrique', electronique:'Électronique' };
    const severityLabels={ modéré:'🟢 Modéré', important:'🟡 Important', critique:'🔴 Critique' };
    const brandText=fault.brands.includes('ALL')?'Toutes marques':fault.brands.slice(0,3).join(', ')+(fault.brands.length>3?'...':'');
    const hasTsb=(fault.tsb&&fault.tsb.length)||(fault.recalls&&fault.recalls.length);
    card.innerHTML=`<h3>${fault.title}</h3><p><strong>Composant:</strong> ${fault.component}</p><div class="meta">${fault.code?`<span class="tag code">${fault.code}</span>`:''}<span class="tag">${typeLabels[fault.type]}</span><span class="tag">${brandText}</span>${fault.engines.map(e=>`<span class="tag">${engineLabels[e]||e}</span>`).join('')}${fault.severity?`<span class="tag">${severityLabels[fault.severity]}</span>`:''}${hasTsb?'<span class="tag" style="background:#fff7ed;border-color:#fed7aa;">📢 TSB/Rappel</span>':''}</div>`;
    return card;
  }

  showFaultDetails(fault){
    const modal=document.getElementById('faultModal');
    document.getElementById('modalTitle').textContent=fault.title;
    const engineLabels={ essence:'Essence', diesel:'Diesel', hybride:'Hybride', electrique:'Électrique', flexfuel:'FlexFuel' };
    const brandText=fault.brands.includes('ALL')?'Toutes marques':fault.brands.join(', ');
    document.getElementById('modalBody').innerHTML=`<div class="fault-detail">
      ${fault.code?`<p><strong>Code OBD:</strong> <code>${fault.code}</code></p>`:''}
      <p><strong>Composant:</strong> ${fault.component}</p>
      <p><strong>Marques:</strong> ${brandText}</p>
      ${fault.modelRefs?`<p><strong>Modèles:</strong> ${fault.modelRefs.join(', ')}</p>`:''}
      ${fault.engineRefs?`<p><strong>Motorisations:</strong> ${fault.engineRefs.join(', ')}</p>`:`<p><strong>Motorisations:</strong> ${fault.engines.map(e=>engineLabels[e]||e).join(', ')}</p>`}
      ${fault.cost?`<p><strong>Coût estimé:</strong> ${fault.cost}</p>`:''}
      <h3>🔍 Symptômes</h3><ul>${fault.symptoms.map(s=>`<li>${s}</li>`).join('')}</ul>
      <h3>⚠️ Causes possibles</h3><ul>${fault.causes.map(c=>`<li>${c}</li>`).join('')}</ul>
      <h3>💥 Conséquences</h3><ul>${fault.consequences.map(c=>`<li>${c}</li>`).join('')}</ul>
      <h3>🔧 Diagnostics à effectuer</h3><ul>${fault.diagnostics.map(d=>`<li>${d}</li>`).join('')}</ul>
      <h3>🛠️ Réparations / actions</h3><ul>${fault.repairs.map(r=>`<li>${r}</li>`).join('')}</ul>
      ${fault.tsb&&fault.tsb.length?`<h3>📋 Bulletins techniques (TSB)</h3><ul>${fault.tsb.map(t=>`<li>${t}</li>`).join('')}</ul>`:''}
      ${fault.recalls&&fault.recalls.length?`<h3>📢 Campagnes de rappel</h3><ul>${fault.recalls.map(r=>`<li>${r}</li>`).join('')}</ul>`:''}
    </div>`;
    modal.classList.add('active');
  }
}
if (typeof window !== 'undefined') window.FilterManager = FilterManager;
