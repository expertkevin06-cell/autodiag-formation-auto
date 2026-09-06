/**
 * Système de filtres pour la recherche de pannes
 */

class FilterManager {
  constructor() {
    this.currentFilters = {
      brand: '', model: '', engine: '', type: '',
      component: '', code: '', search: ''
    };
  }

  async init() {
    this.populateBrandSelect();
    this.populateComponentSelect();
    this.attachEventListeners();
  }

  populateBrandSelect() {
    const brandSelect = document.getElementById('filterBrand');
    if (!brandSelect) return;

    const brands = getAllBrands();
    brands.forEach(brand => {
      const option = document.createElement('option');
      option.value = brand;
      option.textContent = brand;
      brandSelect.appendChild(option);
    });
  }

  populateComponentSelect() {
    const componentSelect = document.getElementById('filterComponent');
    if (!componentSelect) return;

    const allComponents = getComponentsByType();
    const uniqueComponents = [...new Set(allComponents)].sort();
    
    uniqueComponents.forEach(component => {
      const option = document.createElement('option');
      option.value = component;
      option.textContent = component;
      componentSelect.appendChild(option);
    });
  }

  attachEventListeners() {
    const brandSelect = document.getElementById('filterBrand');
    const typeSelect = document.getElementById('filterType');
    const applyBtn = document.getElementById('applyFilters');
    const resetBtn = document.getElementById('resetFilters');

    if (brandSelect) {
      brandSelect.addEventListener('change', (e) => {
        this.updateModelSelect(e.target.value);
      });
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        this.updateComponentSelectByType(e.target.value);
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applyFilters());
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }
  }

  updateModelSelect(brand) {
    const modelSelect = document.getElementById('filterModel');
    if (!modelSelect) return;

    modelSelect.innerHTML = '<option value="">Tous les modèles</option>';

    if (brand) {
      const models = getModelsByBrand(brand);
      models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelSelect.appendChild(option);
      });
      modelSelect.disabled = false;
    } else {
      modelSelect.disabled = true;
    }
  }

  updateComponentSelectByType(type) {
    const componentSelect = document.getElementById('filterComponent');
    if (!componentSelect) return;

    componentSelect.innerHTML = '<option value="">Tous composants</option>';

    const components = getComponentsByType(type);
    const uniqueComponents = [...new Set(components)].sort();
    
    uniqueComponents.forEach(component => {
      const option = document.createElement('option');
      option.value = component;
      option.textContent = component;
      componentSelect.appendChild(option);
    });
  }

  applyFilters() {
    this.currentFilters = {
      brand: document.getElementById('filterBrand').value,
      model: document.getElementById('filterModel').value,
      engine: document.getElementById('filterEngine').value,
      type: document.getElementById('filterType').value,
      component: document.getElementById('filterComponent').value,
      code: document.getElementById('filterCode').value.trim().toUpperCase(),
      search: document.getElementById('filterSearch').value.trim().toLowerCase()
    };

    this.renderResults();
  }

  resetFilters() {
    document.getElementById('filterBrand').value = '';
    document.getElementById('filterModel').value = '';
    document.getElementById('filterModel').disabled = true;
    document.getElementById('filterEngine').value = '';
    document.getElementById('filterType').value = '';
    document.getElementById('filterComponent').value = '';
    document.getElementById('filterCode').value = '';
    document.getElementById('filterSearch').value = '';

    this.currentFilters = {
      brand: '', model: '', engine: '', type: '',
      component: '', code: '', search: ''
    };

    this.renderResults();
  }

  async renderResults() {
    const resultsList = document.getElementById('resultsList');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');

    if (!resultsList) return;

    const allFaults = await db.getAll('faults');
    const filteredFaults = this.filterFaults(allFaults);

    resultsList.innerHTML = '';
    resultsCount.textContent = filteredFaults.length;

    if (filteredFaults.length === 0) {
      noResults.style.display = 'block';
      return;
    }

    noResults.style.display = 'none';

    filteredFaults.forEach(fault => {
      const card = this.createFaultCard(fault);
      resultsList.appendChild(card);
    });
  }

  filterFaults(faults) {
    return faults.filter(fault => {
      if (this.currentFilters.brand) {
        const brandMatch = fault.brands.includes('ALL') || 
                          fault.brands.includes(this.currentFilters.brand);
        if (!brandMatch) return false;
      }

      if (this.currentFilters.model) {
        const brandMatch = fault.brands.includes('ALL') || 
                          fault.brands.includes(this.currentFilters.brand);
        if (!brandMatch) return false;
      }

      if (this.currentFilters.engine) {
        if (!fault.engines.includes(this.currentFilters.engine)) {
          return false;
        }
      }

      if (this.currentFilters.type) {
        if (fault.type !== this.currentFilters.type) {
          return false;
        }
      }

      if (this.currentFilters.component) {
        if (fault.component !== this.currentFilters.component) {
          return false;
        }
      }

      if (this.currentFilters.code) {
        if (!fault.code || !fault.code.includes(this.currentFilters.code)) {
          return false;
        }
      }

      if (this.currentFilters.search) {
        const searchLower = this.currentFilters.search;
        const searchableText = [
          fault.title, fault.component, fault.code,
          ...(fault.symptoms || []),
          ...(fault.causes || []),
          ...(fault.consequences || [])
        ].join(' ').toLowerCase();

        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }

  createFaultCard(fault) {
    const card = document.createElement('div');
    card.className = `fault-card ${fault.type}`;
    card.onclick = () => this.showFaultDetails(fault);

    const engineLabels = {
      'essence': 'Essence', 'diesel': 'Diesel', 'hybride': 'Hybride',
      'electrique': 'Électrique', 'flexfuel': 'FlexFuel'
    };

    const typeLabels = {
      'mecanique': 'Mécanique', 'electrique': 'Électrique', 'electronique': 'Électronique'
    };

    const severityLabels = {
      'modéré': '🟢 Modéré', 'important': '🟡 Important', 'critique': '🔴 Critique'
    };

    const brandText = fault.brands.includes('ALL') 
      ? 'Toutes marques' 
      : fault.brands.slice(0, 3).join(', ') + (fault.brands.length > 3 ? '...' : '');

    card.innerHTML = `
      <h3>${fault.title}</h3>
      <p><strong>Composant:</strong> ${fault.component}</p>
      <div class="meta">
        ${fault.code ? `<span class="tag code">${fault.code}</span>` : ''}
        <span class="tag">${typeLabels[fault.type]}</span>
        <span class="tag">${brandText}</span>
        ${fault.engines.map(e => `<span class="tag">${engineLabels[e] || e}</span>`).join('')}
        ${fault.severity ? `<span class="tag">${severityLabels[fault.severity]}</span>` : ''}
      </div>
    `;

    return card;
  }

  showFaultDetails(fault) {
    const modal = document.getElementById('faultModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = fault.title;

    const engineLabels = {
      'essence': 'Essence', 'diesel': 'Diesel', 'hybride': 'Hybride',
      'electrique': 'Électrique', 'flexfuel': 'FlexFuel'
    };

    const brandText = fault.brands.includes('ALL') 
      ? 'Toutes marques' 
      : fault.brands.join(', ');

    modalBody.innerHTML = `
      <div class="fault-detail">
        ${fault.code ? `<p><strong>Code OBD:</strong> <code>${fault.code}</code></p>` : ''}
        <p><strong>Composant:</strong> ${fault.component}</p>
        <p><strong>Marques concernées:</strong> ${brandText}</p>
        <p><strong>Motorisations:</strong> ${fault.engines.map(e => engineLabels[e] || e).join(', ')}</p>
        ${fault.cost ? `<p><strong>Coût estimé:</strong> ${fault.cost}</p>` : ''}
        
        <h3>🔍 Symptômes</h3>
        <ul>${fault.symptoms.map(s => `<li>${s}</li>`).join('')}</ul>

        <h3>⚠️ Causes possibles</h3>
        <ul>${fault.causes.map(c => `<li>${c}</li>`).join('')}</ul>

        <h3>💥 Conséquences</h3>
        <ul>${fault.consequences.map(c => `<li>${c}</li>`).join('')}</ul>

        <h3>🔧 Diagnostics à effectuer</h3>
        <ul>${fault.diagnostics.map(d => `<li>${d}</li>`).join('')}</ul>

        <h3>🛠️ Réparations possibles</h3>
        <ul>${fault.repairs.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>
    `;

    modal.classList.add('active');
  }
}

if (typeof window !== 'undefined') {
  window.FilterManager = FilterManager;
}
