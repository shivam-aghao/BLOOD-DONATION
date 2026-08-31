
  (function() {
    // ----- NAVIGATION -----
    const pages = {
      find: document.getElementById('page-find'),
      dashboard: document.getElementById('page-dashboard'),
      donor: document.getElementById('page-donor')
    };
    const navLinks = document.querySelectorAll('.nav-link, [data-page]');
    function showPage(pageId) {
      Object.keys(pages).forEach(key => {
        pages[key].classList.toggle('hidden', key !== pageId);
      });
      // update active class on nav links
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('tab-active', link.dataset.page === pageId);
      });
    }

    // attach click to all data-page elements
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.dataset.page;
        if (page && pages[page]) showPage(page);
        // close mobile menu
        document.getElementById('navLinks').classList.remove('open');
      });
    });
    // hamburger
    document.getElementById('hamburger').addEventListener('click', function() {
      document.getElementById('navLinks').classList.toggle('open');
    });

    // default: find page
    showPage('find');

    // ----- MOCK DATA for find & dashboard -----
    const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
    const hospitals = [
      { name: 'City General Hospital', city: 'New York', contact: '+1 212 555 0199' },
      { name: 'St. Mary\'s Blood Bank', city: 'New York', contact: '+1 212 555 0234' },
      { name: 'Brooklyn Medical Center', city: 'Brooklyn', contact: '+1 718 555 0456' },
    ];

    function randomUnits() { return Math.floor(Math.random() * 15) + 1; }
    function randomStatus(units) {
      if (units === 0) return { label: 'Not Available', badge: 'badge-red' };
      if (units < 4) return { label: 'Low Stock', badge: 'badge-yellow' };
      return { label: 'Available', badge: 'badge-green' };
    }

    // generate inventory for dashboard
    function generateInventory() {
      return bloodGroups.map(g => {
        const units = randomUnits();
        const status = randomStatus(units);
        return { group: g, units, status };
      });
    }

    let inventory = generateInventory();

    function renderInventory() {
      const grid = document.getElementById('inventoryGrid');
      grid.innerHTML = inventory.map(item => {
        const statusClass = item.status.badge;
        return `<div class="card inventory-card">
          <h3 style="font-size:1.6rem;">${item.group}</h3>
          <div style="font-size:1.8rem;font-weight:700;">${item.units} <span style="font-size:0.9rem;font-weight:400;color:#6B7280;">units</span></div>
          <div class="stock-indicator"><span class="badge ${statusClass}">${item.status.label}</span></div>
          <div class="inv-actions">
            <button data-group="${item.group}" data-action="inc">+</button>
            <button data-group="${item.group}" data-action="dec">−</button>
            <button data-group="${item.group}" data-action="unavailable">✕</button>
          </div>
        </div>`;
      }).join('');

      // attach inventory actions
      document.querySelectorAll('.inv-actions button').forEach(btn => {
        btn.addEventListener('click', function() {
          const group = this.dataset.group;
          const action = this.dataset.action;
          const item = inventory.find(i => i.group === group);
          if (!item) return;
          if (action === 'inc') { item.units += 1; }
          else if (action === 'dec') { item.units = Math.max(0, item.units - 1); }
          else if (action === 'unavailable') { item.units = 0; }
          // update status
          item.status = randomStatus(item.units);
          renderInventory();
        });
      });
    }
    renderInventory();

    // update inventory button (refresh)
    document.getElementById('updateInventoryBtn').addEventListener('click', function() {
      inventory = generateInventory();
      renderInventory();
    });

    // ----- SEARCH (find blood) -----
    function performSearch() {
      const group = document.getElementById('bloodGroup').value;
      const city = document.getElementById('cityInput').value.trim() || 'New York';
      const container = document.getElementById('resultsContainer');

      // filter hospitals by city (mock)
      const filtered = hospitals.filter(h => h.city.toLowerCase().includes(city.toLowerCase()));

      if (filtered.length === 0) {
        container.innerHTML = `<div style="background:#FEE2E2;padding:24px;border-radius:var(--radius);">
          <i class="fas fa-exclamation-triangle" style="color:var(--primary-red);"></i> 
          <strong>Sorry, this blood group is currently not available in your selected location. Please try nearby hospitals or blood banks.</strong>
        </div>`;
        return;
      }

      let html = `<h3 style="margin-bottom:16px;">Available blood in ${city}</h3>`;
      filtered.forEach(h => {
        const units = Math.floor(Math.random() * 12) + 1;
        const status = randomStatus(units);
        html += `<div class="card result-item">
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;">
            <div><strong>${h.name}</strong></div>
            <div><span class="badge ${status.badge}">${status.label}</span></div>
          </div>
          <div>🩸 ${group} — ${units} units</div>
          <div>📍 ${h.city} · ${h.contact}</div>
        </div>`;
      });
      container.innerHTML = html;
    }

    document.getElementById('searchBtn').addEventListener('click', performSearch);
    performSearch(); // initial

    // ----- DONOR REGISTRATION -----
    document.getElementById('registerDonorBtn').addEventListener('click', function() {
      const successDiv = document.getElementById('donorSuccessMsg');
      successDiv.style.display = 'block';
      // optionally clear fields (but keep for demo)
      // scroll to success
      successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // emergency banner / compatibility already in place

  })();
