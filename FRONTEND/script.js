/**
 * ===================================================================
 * BloodConnect - Full Functional Client-Side Application
 * ===================================================================
 */

(function () {
  'use strict';

  // ==========================================
  // 1. DATA STORAGE & SEED INITIALIZATION
  // ==========================================
  const STORAGE_KEYS = {
    HOSPITALS: 'bc_hospitals_data',
    DONORS: 'bc_donors_data',
    SOS_REQUESTS: 'bc_sos_requests',
    BOOKINGS: 'bc_patient_bookings',
    CURRENT_HOSPITAL: 'bc_active_hospital_id'
  };

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Medical Compatibility Matrix
  const COMPATIBILITY = {
    'O-': {
      give: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      receive: ['O-'],
      note: 'Universal Red Cell Donor: Can give blood to any recipient!'
    },
    'O+': {
      give: ['O+', 'A+', 'B+', 'AB+'],
      receive: ['O+', 'O-'],
      note: 'Most common blood type in high demand worldwide.'
    },
    'A-': {
      give: ['A-', 'A+', 'AB-', 'AB+'],
      receive: ['A-', 'O-'],
      note: 'Can donate to any A or AB patient.'
    },
    'A+': {
      give: ['A+', 'AB+'],
      receive: ['A+', 'A-', 'O+', 'O-'],
      note: 'Second most common blood type.'
    },
    'B-': {
      give: ['B-', 'B+', 'AB-', 'AB+'],
      receive: ['B-', 'O-'],
      note: 'Rare blood type; critical for B and AB patients.'
    },
    'B+': {
      give: ['B+', 'AB+'],
      receive: ['B+', 'B-', 'O+', 'O-'],
      note: 'Can receive from both B and O groups.'
    },
    'AB-': {
      give: ['AB-', 'AB+'],
      receive: ['AB-', 'A-', 'B-', 'O-'],
      note: 'Universal plasma donor.'
    },
    'AB+': {
      give: ['AB+'],
      receive: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
      note: 'Universal Recipient: Can receive red blood cells of any type!'
    }
  };

  // Seed Hospitals
  const DEFAULT_HOSPITALS = [
    {
      id: 'hosp-1',
      name: 'City General Hospital & Trauma Center',
      city: 'AKOLA',
      address: '420 East 70th Street, Manhattan',
      contact: '+1 (212) 555-0199',
      email: 'bloodbank@citygeneral.org',
      operatingHours: '24/7 Emergency Blood Bank',
      inventory: {
        'A+': 14, 'A-': 4, 'B+': 9, 'B-': 2,
        'AB+': 6, 'AB-': 3, 'O+': 22, 'O-': 5
      },
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'hosp-2',
      name: "St. Mary's Regional Blood Center",
      city: 'AKOLA',
      address: '1300 York Avenue, Manhattan',
      contact: '+1 (212) 555-0234',
      email: 'donations@stmarysblood.org',
      operatingHours: '24/7 Emergency Service',
      inventory: {
        'A+': 8, 'A-': 0, 'B+': 12, 'B-': 1,
        'AB+': 4, 'AB-': 0, 'O+': 18, 'O-': 2
      },
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'hosp-3',
      name: 'Brooklyn Central Medical Center',
      city: 'Brooklyn',
      address: '506 6th Street, Brooklyn',
      contact: '+1 (718) 555-0456',
      email: 'bloodservice@brooklynmed.org',
      operatingHours: 'Mon - Sun: 24 Hours',
      inventory: {
        'A+': 11, 'A-': 3, 'B+': 5, 'B-': 0,
        'AB+': 7, 'AB-': 2, 'O+': 15, 'O-': 4
      },
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'hosp-4',
      name: 'Queens Emergency Health Hospital',
      city: 'Queens',
      address: '82-68 164th St, Jamaica, Queens',
      contact: '+1 (718) 555-0789',
      email: 'blood@queenshealth.org',
      operatingHours: '24 Hours Emergency Ward',
      inventory: {
        'A+': 6, 'A-': 2, 'B+': 7, 'B-': 3,
        'AB+': 5, 'AB-': 1, 'O+': 9, 'O-': 1
      },
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'hosp-5',
      name: 'Chicago Metropolitan Hospital',
      city: 'Chicago',
      address: '5841 S Maryland Ave, Chicago',
      contact: '+1 (312) 555-0912',
      email: 'bloodsupply@chicagometro.org',
      operatingHours: '24/7 Rapid Response',
      inventory: {
        'A+': 16, 'A-': 5, 'B+': 10, 'B-': 4,
        'AB+': 8, 'AB-': 3, 'O+': 25, 'O-': 6
      },
      lastUpdated: new Date().toISOString()
    }
  ];

  // Seed Voluntary Donors
  const DEFAULT_DONORS = [
    {
      id: 'BC-84920',
      fullName: 'Sarah Jenkins',
      age: 28,
      gender: 'Female',
      bloodGroup: 'O-',
      mobile: '+1 (555) 234-5678',
      email: 'sarah.j@example.com',
      city: 'AKOLA',
      address: '742 Evergreen Terrace, Manhattan',
      donatedBefore: 'Yes',
      lastDonation: '2026-06-15',
      availability: 'Anytime (24/7 SOS)',
      preferredHospital: 'City General Hospital',
      registeredAt: '2026-08-10'
    },
    {
      id: 'BC-71822',
      fullName: 'Marcus Vance',
      age: 34,
      gender: 'Male',
      bloodGroup: 'A+',
      mobile: '+1 (555) 345-6789',
      email: 'marcus.v@example.com',
      city: 'AKOLA',
      address: '120 West 44th St',
      donatedBefore: 'Yes',
      lastDonation: '2026-05-20',
      availability: 'Evenings & Weekends',
      preferredHospital: "St. Mary's Regional",
      registeredAt: '2026-07-28'
    },
    {
      id: 'BC-93014',
      fullName: 'Elena Rostova',
      age: 26,
      gender: 'Female',
      bloodGroup: 'B+',
      mobile: '+1 (718) 555-7890',
      email: 'elena.rostova@example.com',
      city: 'Brooklyn',
      address: '350 Ocean Parkway',
      donatedBefore: 'No',
      lastDonation: '',
      availability: 'Anytime (24/7 SOS)',
      preferredHospital: 'Brooklyn Central Medical Center',
      registeredAt: '2026-08-20'
    },
    {
      id: 'BC-48201',
      fullName: 'David Chen',
      age: 31,
      gender: 'Male',
      bloodGroup: 'AB+',
      mobile: '+1 (718) 555-9123',
      email: 'david.chen@example.com',
      city: 'Queens',
      address: '41-25 Main St, Flushing',
      donatedBefore: 'Yes',
      lastDonation: '2026-04-10',
      availability: 'Weekends only',
      preferredHospital: 'Queens Emergency Health',
      registeredAt: '2026-08-01'
    },
    {
      id: 'BC-65902',
      fullName: 'Jessica Taylor',
      age: 24,
      gender: 'Female',
      bloodGroup: 'O+',
      mobile: '+1 (312) 555-8844',
      email: 'jess.taylor@example.com',
      city: 'Chicago',
      address: '220 N Michigan Ave',
      donatedBefore: 'Yes',
      lastDonation: '2026-07-02',
      availability: 'Anytime (24/7 SOS)',
      preferredHospital: 'Chicago Metropolitan Hospital',
      registeredAt: '2026-08-18'
    },
    {
      id: 'BC-31940',
      fullName: 'Alexander Wright',
      age: 42,
      gender: 'Male',
      bloodGroup: 'A-',
      mobile: '+1 (555) 678-1234',
      email: 'a.wright@example.com',
      city: 'AKOLA',
      address: '88 Greenwich St',
      donatedBefore: 'Yes',
      lastDonation: '2026-03-12',
      availability: 'Working Hours Only',
      preferredHospital: 'City General Hospital',
      registeredAt: '2026-08-14'
    },
    {
      id: 'BC-54219',
      fullName: 'Amira Patel',
      age: 29,
      gender: 'Female',
      bloodGroup: 'B-',
      mobile: '+1 (718) 555-4433',
      email: 'amira.p@example.com',
      city: 'Brooklyn',
      address: '85 Flatbush Ave',
      donatedBefore: 'Yes',
      lastDonation: '2026-06-25',
      availability: 'Anytime (24/7 SOS)',
      preferredHospital: 'Brooklyn Central Medical Center',
      registeredAt: '2026-08-25'
    },
    {
      id: 'BC-19483',
      fullName: 'Carlos Rodriguez',
      age: 38,
      gender: 'Male',
      bloodGroup: 'AB-',
      mobile: '+1 (312) 555-1122',
      email: 'carlos.r@example.com',
      city: 'Chicago',
      address: '1500 W Jackson Blvd',
      donatedBefore: 'Yes',
      lastDonation: '2026-05-18',
      availability: 'Evenings & Weekends',
      preferredHospital: 'Chicago Metropolitan Hospital',
      registeredAt: '2026-08-29'
    }
  ];

  // Seed Urgent SOS Requests
  const DEFAULT_SOS = [
    {
      id: 'SOS-1049',
      patientName: 'Michael Smith',
      bloodGroup: 'O-',
      units: 3,
      urgency: 'Critical (Immediate)',
      hospital: 'City General Hospital',
      city: 'AKOLA',
      contactName: 'Dr. Katherine Adams (ICU)',
      contactPhone: '+1 (212) 555-0199',
      notes: 'Emergency vascular trauma surgery in Room 304. Immediate donor matching needed.',
      status: 'open',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45m ago
    },
    {
      id: 'SOS-1048',
      patientName: 'Lucas Morales',
      bloodGroup: 'B-',
      units: 2,
      urgency: 'Urgent (Today)',
      hospital: 'Brooklyn Central Medical Center',
      city: 'Brooklyn',
      contactName: 'Maria Morales (Sister)',
      contactPhone: '+1 (718) 555-9876',
      notes: 'Scheduled bypass operation requiring B- buffer stock.',
      status: 'open',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() // 3h ago
    },
    {
      id: 'SOS-1045',
      patientName: 'Sophia Reynolds',
      bloodGroup: 'A-',
      units: 2,
      urgency: 'Standard (Within 24h)',
      hospital: 'Chicago Metropolitan Hospital',
      city: 'Chicago',
      contactName: 'Robert Reynolds (Father)',
      contactPhone: '+1 (312) 555-3321',
      notes: 'Post-chemotherapy transfusion needed before tomorrow noon.',
      status: 'open',
      createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString() // 8h ago
    },
    {
      id: 'SOS-1040',
      patientName: 'Daniel Vance',
      bloodGroup: 'AB+',
      units: 1,
      urgency: 'Critical (Immediate)',
      hospital: 'Queens Emergency Health',
      city: 'Queens',
      contactName: 'Dr. Gregory House',
      contactPhone: '+1 (718) 555-0789',
      notes: 'Trauma ward delivery.',
      status: 'fulfilled',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    }
  ];

  // Storage Helpers
  function getStored(key, fallback) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn('Storage read error:', e);
      return fallback;
    }
  }

  function setStored(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Storage write error:', e);
    }
  }

  // Initialize data if not present
  if (!localStorage.getItem(STORAGE_KEYS.HOSPITALS)) {
    setStored(STORAGE_KEYS.HOSPITALS, DEFAULT_HOSPITALS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DONORS)) {
    setStored(STORAGE_KEYS.DONORS, DEFAULT_DONORS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SOS_REQUESTS)) {
    setStored(STORAGE_KEYS.SOS_REQUESTS, DEFAULT_SOS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    setStored(STORAGE_KEYS.BOOKINGS, [
      {
        id: 'BK-101',
        hospitalId: 'hosp-1',
        hospitalName: 'City General Hospital & Trauma Center',
        patientName: 'Emily Clark',
        bloodGroup: 'O+',
        units: 2,
        doctor: 'Dr. Adams / Surgical',
        contact: '+1 (555) 777-8899',
        notes: 'Room 210 pre-op reservation',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      }
    ]);
  }

  let hospitals = getStored(STORAGE_KEYS.HOSPITALS, DEFAULT_HOSPITALS);
  let donors = getStored(STORAGE_KEYS.DONORS, DEFAULT_DONORS);
  let sosRequests = getStored(STORAGE_KEYS.SOS_REQUESTS, DEFAULT_SOS);
  let patientBookings = getStored(STORAGE_KEYS.BOOKINGS, []);
  let activeHospitalId = getStored(STORAGE_KEYS.CURRENT_HOSPITAL, hospitals[0]?.id || 'hosp-1');

  // ==========================================
  // 2. UI UTILITIES (TOASTS, FORMATTERS, STATUS)
  // ==========================================
  function showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-circle-check';
    if (type === 'error') iconClass = 'fa-circle-exclamation';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';
    if (type === 'info') iconClass = 'fa-circle-info';

    toast.innerHTML = `
      <i class="fas ${iconClass}"></i>
      <div>${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function getStockStatus(units) {
    if (units <= 0) return { label: 'Out of Stock', badge: 'badge-red', color: '#DC2626' };
    if (units <= 4) return { label: 'Low Stock', badge: 'badge-yellow', color: '#F59E0B' };
    return { label: 'Available', badge: 'badge-green', color: '#10B981' };
  }

  function formatTimeAgo(isoString) {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  // ==========================================
  // 3. NAVIGATION & ROUTING
  // ==========================================
  const pages = {
    find: document.getElementById('page-find'),
    emergency: document.getElementById('page-emergency'),
    dashboard: document.getElementById('page-dashboard'),
    donor: document.getElementById('page-donor'),
    about: document.getElementById('page-about')
  };

  function showPage(pageId) {
    if (!pages[pageId]) pageId = 'find';

    Object.keys(pages).forEach(key => {
      if (pages[key]) {
        pages[key].classList.toggle('hidden', key !== pageId);
      }
    });

    // Update nav links active styling
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('tab-active', link.dataset.page === pageId);
    });

    // Specific on-page-enter renders
    if (pageId === 'find') {
      performSearch();
    } else if (pageId === 'emergency') {
      renderEmergencyFeed('all');
    } else if (pageId === 'dashboard') {
      renderHospitalDashboard();
    } else if (pageId === 'about') {
      updateAboutStats();
    }

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Attach navigation triggers
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      const targetPage = this.dataset.page;
      showPage(targetPage);
      // Close mobile menu
      const navLinks = document.getElementById('navLinks');
      if (navLinks) navLinks.classList.remove('open');
    });
  });

  // Hamburger Toggle
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const navLinks = document.getElementById('navLinks');
      if (navLinks) navLinks.classList.toggle('open');
    });
  }

  // ==========================================
  // 4. HERO STATS DYNAMIC CALCULATION
  // ==========================================
  function updateHeroStats() {
    const totalDonorsCount = 12400 + donors.length;
    const totalHospitalsCount = hospitals.length;
    let totalUnits = 0;

    hospitals.forEach(h => {
      if (h.inventory) {
        Object.values(h.inventory).forEach(count => {
          totalUnits += Number(count) || 0;
        });
      }
    });

    const elDonors = document.getElementById('statDonors');
    const elHospitals = document.getElementById('statHospitals');
    const elUnits = document.getElementById('statUnits');
    const elLives = document.getElementById('statLives');

    if (elDonors) elDonors.textContent = `${totalDonorsCount.toLocaleString()}+`;
    if (elHospitals) elHospitals.textContent = `${totalHospitalsCount}`;
    if (elUnits) elUnits.textContent = `${totalUnits.toLocaleString()}+`;
    if (elLives) elLives.textContent = `${(2100 + donors.length * 3).toLocaleString()}+`;

    updateAboutStats();
  }

  function updateAboutStats() {
    const elAboutDonors = document.getElementById('aboutDonorsCount');
    const elAboutHospitals = document.getElementById('aboutHospitalsCount');
    if (elAboutDonors) elAboutDonors.textContent = `${(12400 + donors.length).toLocaleString()}+ Donors`;
    if (elAboutHospitals) elAboutHospitals.textContent = `${hospitals.length} Partner Hospitals`;
  }

  // ==========================================
  // 5. PAGE 1: FIND BLOOD & SEARCH SYSTEM
  // ==========================================
  let currentSearchTab = 'hospitals'; // 'hospitals' or 'donors'

  const tabHospitalsBtn = document.getElementById('tabHospitalsBtn');
  const tabDonorsBtn = document.getElementById('tabDonorsBtn');
  const sortResultsSelect = document.getElementById('sortResults');
  const includeCompatibleCheck = document.getElementById('includeCompatibleCheck');

  if (tabHospitalsBtn && tabDonorsBtn) {
    tabHospitalsBtn.addEventListener('click', () => {
      currentSearchTab = 'hospitals';
      tabHospitalsBtn.classList.add('active');
      tabDonorsBtn.classList.remove('active');
      performSearch();
    });

    tabDonorsBtn.addEventListener('click', () => {
      currentSearchTab = 'donors';
      tabDonorsBtn.classList.add('active');
      tabHospitalsBtn.classList.remove('active');
      performSearch();
    });
  }

  if (sortResultsSelect) {
    sortResultsSelect.addEventListener('change', performSearch);
  }
  if (includeCompatibleCheck) {
    includeCompatibleCheck.addEventListener('change', performSearch);
  }

  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }

  const resetSearchBtn = document.getElementById('resetSearchBtn');
  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      document.getElementById('bloodGroup').value = 'A+';
      document.getElementById('cityInput').value = 'All';
      document.getElementById('includeCompatibleCheck').checked = true;
      document.getElementById('sortResults').value = 'stock-desc';
      performSearch();
      showToast('Search filters reset', 'info');
    });
  }

  function performSearch() {
    const selectedGroup = document.getElementById('bloodGroup')?.value || 'A+';
    const cityQuery = (document.getElementById('cityInput')?.value || '').trim().toLowerCase();
    const includeCompatible = document.getElementById('includeCompatibleCheck')?.checked ?? true;
    const sortBy = document.getElementById('sortResults')?.value || 'stock-desc';
    const container = document.getElementById('resultsContainer');
    const activeFilterDisplay = document.getElementById('activeFilterDisplay');

    if (!container) return;

    // Determine compatible groups for receiving
    const compatibleGroups = COMPATIBILITY[selectedGroup]?.receive || [selectedGroup];
    const targetGroups = includeCompatible ? compatibleGroups : [selectedGroup];

    // Filter Chips Display
    if (activeFilterDisplay) {
      activeFilterDisplay.innerHTML = `
        <span class="filter-badge"><i class="fas fa-droplet"></i> Target: ${selectedGroup}</span>
        <span class="filter-badge"><i class="fas fa-location-dot"></i> City: ${cityQuery === '' || cityQuery === 'all' ? 'All Cities' : cityQuery}</span>
        ${includeCompatible ? `<span class="filter-badge"><i class="fas fa-arrows-split-up-and-left"></i> Compatible: ${compatibleGroups.join(', ')}</span>` : ''}
      `;
    }

    // Refresh Hospitals Count
    let filteredHospitals = hospitals.filter(h => {
      if (cityQuery !== '' && cityQuery !== 'all') {
        const matchesCity = h.city.toLowerCase().includes(cityQuery) || h.address.toLowerCase().includes(cityQuery);
        if (!matchesCity) return false;
      }
      return true;
    });

    // Refresh Donors Count
    let filteredDonors = donors.filter(d => {
      if (cityQuery !== '' && cityQuery !== 'all') {
        const matchesCity = d.city.toLowerCase().includes(cityQuery) || (d.address && d.address.toLowerCase().includes(cityQuery));
        if (!matchesCity) return false;
      }
      const matchesBlood = targetGroups.includes(d.bloodGroup);
      return matchesBlood;
    });

    // Update Count Badges
    const hospBadge = document.getElementById('hospitalCountBadge');
    const donorBadge = document.getElementById('donorCountBadge');
    if (hospBadge) hospBadge.textContent = filteredHospitals.length;
    if (donorBadge) donorBadge.textContent = filteredDonors.length;

    // Render based on active tab
    if (currentSearchTab === 'hospitals') {
      renderHospitalSearchResults(filteredHospitals, selectedGroup, targetGroups, sortBy, container);
    } else {
      renderDonorSearchResults(filteredDonors, selectedGroup, sortBy, container);
    }
  }

  function renderHospitalSearchResults(hospitalList, selectedGroup, targetGroups, sortBy, container) {
    if (hospitalList.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <i class="fas fa-hospital-slash"></i>
          <h3>No Partner Hospitals Found</h3>
          <p>We couldn't find hospitals matching your location filter. Try searching for "All" or a nearby city.</p>
          <button class="btn-emergency" onclick="document.getElementById('openEmergencyModalBtn').click()"><i class="fas fa-bullhorn"></i> Post Urgent SOS Request</button>
        </div>
      `;
      return;
    }

    // Process each hospital to calculate stock for target blood group & total compatible stock
    const hospitalCardsData = hospitalList.map(h => {
      const exactUnits = (h.inventory && h.inventory[selectedGroup]) ? Number(h.inventory[selectedGroup]) : 0;
      let compatibleUnits = 0;
      targetGroups.forEach(g => {
        if (h.inventory && h.inventory[g]) {
          compatibleUnits += Number(h.inventory[g]);
        }
      });
      return { hospital: h, exactUnits, compatibleUnits };
    });

    // Sort
    if (sortBy === 'stock-desc') {
      hospitalCardsData.sort((a, b) => b.exactUnits - a.exactUnits);
    } else if (sortBy === 'name-asc') {
      hospitalCardsData.sort((a, b) => a.hospital.name.localeCompare(b.hospital.name));
    } else if (sortBy === 'city-asc') {
      hospitalCardsData.sort((a, b) => a.hospital.city.localeCompare(b.hospital.city));
    }

    let html = '';
    hospitalCardsData.forEach(item => {
      const h = item.hospital;
      const exactStatus = getStockStatus(item.exactUnits);
      const isLowOrOut = item.exactUnits <= 0;

      html += `
        <div class="result-card">
          <div>
            <div class="result-card-top">
              <div class="result-title-group">
                <h4>${h.name}</h4>
                <div class="result-location"><i class="fas fa-location-dot" style="color:var(--primary-red);"></i> ${h.address}, ${h.city}</div>
              </div>
              <span class="badge ${exactStatus.badge}">${exactStatus.label}</span>
            </div>

            <div class="stock-box">
              <div class="stock-blood-group">
                <span class="blood-type-chip">${selectedGroup}</span>
                <span style="font-size:0.85rem;font-weight:600;color:var(--muted-text);">Requested Type</span>
              </div>
              <div class="stock-units-count">
                ${item.exactUnits} <small>units</small>
              </div>
            </div>

            ${targetGroups.length > 1 ? `
              <div style="font-size:0.82rem;color:var(--muted-text);margin:6px 0 10px;">
                <i class="fas fa-shield-halved" style="color:var(--success-green);"></i> Compatible stock (${targetGroups.filter(g => g !== selectedGroup).join(', ')}): <strong>${item.compatibleUnits - item.exactUnits} units available</strong>
              </div>
            ` : ''}

            <div style="font-size:0.85rem;color:var(--muted-text);display:flex;align-items:center;gap:6px;">
              <i class="fas fa-clock" style="color:#6B7280;"></i> ${h.operatingHours || '24/7 Service'}
            </div>
          </div>

          <div class="result-card-actions">
            <button class="btn-card-primary" onclick="window.BloodConnectApp.openBookingModal('${h.id}', '${selectedGroup}')">
              <i class="fas fa-file-medical"></i> Request Units
            </button>
            <a href="tel:${h.contact}" class="btn-card-secondary" title="Call Blood Bank">
              <i class="fas fa-phone"></i> Call
            </a>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  function renderDonorSearchResults(donorList, selectedGroup, sortBy, container) {
    if (donorList.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <i class="fas fa-user-xmark"></i>
          <h3>No Voluntary Donors Matching</h3>
          <p>No registered voluntary donors found for blood type ${selectedGroup} in this location. Be the first lifesaver to register!</p>
          <button class="btn-primary" data-page="donor"><i class="fas fa-heart"></i> Register as a Donor</button>
        </div>
      `;
      // Re-attach data-page click for newly inserted button
      container.querySelectorAll('[data-page]').forEach(b => {
        b.addEventListener('click', () => showPage('donor'));
      });
      return;
    }

    // Sort
    if (sortBy === 'name-asc') {
      donorList.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortBy === 'city-asc') {
      donorList.sort((a, b) => a.city.localeCompare(b.city));
    }

    let html = '';
    donorList.forEach(d => {
      const isExact = d.bloodGroup === selectedGroup;
      html += `
        <div class="result-card">
          <div>
            <div class="donor-card-top">
              <div class="donor-avatar-circle">
                ${d.fullName.charAt(0)}
              </div>
              <div style="flex:1;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <h4 style="font-size:1.15rem;font-weight:700;">${d.fullName}</h4>
                  <span class="blood-type-chip">${d.bloodGroup}</span>
                </div>
                <div class="result-location"><i class="fas fa-location-dot" style="color:var(--primary-red);"></i> ${d.city} · ${d.age} yrs (${d.gender})</div>
              </div>
            </div>

            <div class="donor-info-grid">
              <div class="donor-info-item">
                <span>Availability:</span>
                <strong><i class="fas fa-clock" style="color:var(--primary-red);"></i> ${d.availability || 'Anytime'}</strong>
              </div>
              <div class="donor-info-item">
                <span>Status:</span>
                <strong class="text-success"><i class="fas fa-check-circle"></i> Ready to Donate</strong>
              </div>
              <div class="donor-info-item">
                <span>Donated Before:</span>
                <strong>${d.donatedBefore || 'Yes'}</strong>
              </div>
              <div class="donor-info-item">
                <span>Donor ID:</span>
                <strong>${d.id}</strong>
              </div>
            </div>

            ${!isExact ? `
              <div style="font-size:0.8rem;background:var(--extra-light-red);padding:6px 10px;border-radius:6px;color:var(--dark-red);margin-bottom:8px;">
                <i class="fas fa-info-circle"></i> Medically compatible donor for ${selectedGroup}
              </div>
            ` : ''}
          </div>

          <div class="result-card-actions">
            <button class="btn-card-primary" onclick="window.BloodConnectApp.openContactDonorModal('${d.id}')">
              <i class="fas fa-comments"></i> Contact Donor
            </button>
            <a href="tel:${d.mobile}" class="btn-card-secondary">
              <i class="fas fa-phone"></i> Direct Call
            </a>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // ==========================================
  // 6. INTERACTIVE BLOOD COMPATIBILITY TOOL
  // ==========================================
  function initCompatibilityWidget() {
    const selector = document.getElementById('compatSelector');
    const detailsCard = document.getElementById('compatDetailsCard');

    if (!selector || !detailsCard) return;

    function renderDetails(group) {
      const data = COMPATIBILITY[group];
      if (!data) return;

      detailsCard.innerHTML = `
        <div class="compat-box">
          <h4><i class="fas fa-hand-holding-droplet" style="color:var(--primary-red);"></i> Can Donate Red Cells To:</h4>
          <div class="compat-badge-group">
            ${data.give.map(g => `<span class="compat-type-badge">${g}</span>`).join('')}
          </div>
          <p style="font-size:0.85rem;color:var(--muted-text);margin-top:10px;">
            ${group === 'O-' ? '🌟 <strong>Universal Donor:</strong> Can give red blood cells to any patient in emergency situations.' : `Recipients with ${data.give.join(', ')} can safely receive ${group} blood.`}
          </p>
        </div>
        <div class="compat-box">
          <h4><i class="fas fa-shield-heart" style="color:var(--success-green);"></i> Can Receive Red Cells From:</h4>
          <div class="compat-badge-group">
            ${data.receive.map(g => `<span class="compat-type-badge" style="border-color:var(--success-green);color:var(--success-text);">${g}</span>`).join('')}
          </div>
          <p style="font-size:0.85rem;color:var(--muted-text);margin-top:10px;">
            ${group === 'AB+' ? '🌟 <strong>Universal Recipient:</strong> Can receive red blood cells from any blood type.' : `A patient with ${group} can safely receive red blood cells from ${data.receive.join(', ')}.`}
          </p>
        </div>
      `;
    }

    selector.querySelectorAll('.compat-pill').forEach(pill => {
      pill.addEventListener('click', function () {
        selector.querySelectorAll('.compat-pill').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        const group = this.dataset.group;
        renderDetails(group);
      });
    });

    renderDetails('O-');
  }

  // ==========================================
  // 7. PAGE 2: EMERGENCY SOS REQUESTS
  // ==========================================
  function renderEmergencyFeed(filterStatus = 'all') {
    const feedContainer = document.getElementById('emergencyFeedContainer');
    if (!feedContainer) return;

    let filtered = sosRequests;
    if (filterStatus === 'open') {
      filtered = sosRequests.filter(s => s.status === 'open');
    } else if (filterStatus === 'fulfilled') {
      filtered = sosRequests.filter(s => s.status === 'fulfilled');
    }

    if (filtered.length === 0) {
      feedContainer.innerHTML = `
        <div class="empty-state-box">
          <i class="fas fa-circle-check" style="color:var(--success-green);"></i>
          <h3>No SOS Requests Found</h3>
          <p>There are no emergency requests in this category right now.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(req => {
      const isFulfilled = req.status === 'fulfilled';
      const urgencyBadgeClass = req.urgency.includes('Critical') ? 'badge-red' : (req.urgency.includes('Urgent') ? 'badge-yellow' : 'badge-blue');

      html += `
        <div class="sos-card ${isFulfilled ? 'fulfilled' : ''}">
          <div>
            <div class="sos-card-header">
              <div>
                <span class="badge ${urgencyBadgeClass}"><i class="fas fa-triangle-exclamation"></i> ${req.urgency}</span>
                <span class="badge ${isFulfilled ? 'badge-green' : 'badge-red'}" style="margin-left:6px;">
                  ${isFulfilled ? 'FULFILLED' : 'ACTIVE SOS'}
                </span>
              </div>
              <div class="sos-blood-needed">
                ${req.bloodGroup} <span style="font-size:0.9rem;font-weight:500;color:var(--muted-text);">(${req.units} units)</span>
              </div>
            </div>

            <h4>${req.patientName}</h4>
            <div style="font-size:0.88rem;color:var(--muted-text);margin-bottom:8px;">
              <i class="fas fa-hospital" style="color:var(--primary-red);"></i> ${req.hospital}, ${req.city}
            </div>

            <ul class="sos-details-list">
              <li><i class="fas fa-user-nurse"></i> Contact: <strong>${req.contactName}</strong></li>
              <li><i class="fas fa-phone"></i> Phone: <strong>${req.contactPhone}</strong></li>
              ${req.notes ? `<li><i class="fas fa-notes-medical"></i> Note: <em>${req.notes}</em></li>` : ''}
              <li><i class="fas fa-clock"></i> Posted: <strong>${formatTimeAgo(req.createdAt)}</strong></li>
            </ul>
          </div>

          <div class="sos-actions">
            ${!isFulfilled ? `
              <button class="btn-card-primary" onclick="window.BloodConnectApp.respondToSos('${req.id}')">
                <i class="fas fa-heart"></i> I Can Donate
              </button>
              <button class="btn-card-secondary" onclick="window.BloodConnectApp.toggleFulfillSos('${req.id}')" title="Mark request as fulfilled">
                <i class="fas fa-check"></i> Fulfill
              </button>
            ` : `
              <button class="btn-card-secondary" style="width:100%;" disabled>
                <i class="fas fa-circle-check" style="color:var(--success-green);"></i> Request Fulfilled & Saved
              </button>
            `}
            <button class="btn-card-secondary" onclick="window.BloodConnectApp.shareSos('${req.id}')" title="Share SOS Alert">
              <i class="fas fa-share-nodes"></i> Share
            </button>
          </div>
        </div>
      `;
    });

    feedContainer.innerHTML = html;
  }

  // Filter chips in Emergency Page
  document.querySelectorAll('.emergency-filter-bar .filter-chip').forEach(chip => {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.emergency-filter-bar .filter-chip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const status = this.dataset.status;
      renderEmergencyFeed(status);
    });
  });

  // ==========================================
  // 8. PAGE 3: HOSPITAL DASHBOARD & INVENTORY
  // ==========================================
  function renderHospitalDashboard() {
    const select = document.getElementById('hospitalSelect');
    const grid = document.getElementById('inventoryGrid');
    const requestsQueue = document.getElementById('hospitalRequestsQueue');
    const requestsCountBadge = document.getElementById('incomingRequestsCount');

    if (!select || !grid) return;

    // Populate hospital selector
    select.innerHTML = hospitals.map(h => `<option value="${h.id}" ${h.id === activeHospitalId ? 'selected' : ''}>${h.name} (${h.city})</option>`).join('');

    const currentHosp = hospitals.find(h => h.id === activeHospitalId) || hospitals[0];
    if (!currentHosp) return;

    // Populate Profile Form
    const nameInput = document.getElementById('hospName');
    const cityInput = document.getElementById('hospCity');
    const addressInput = document.getElementById('hospAddress');
    const contactInput = document.getElementById('hospContact');
    const emailInput = document.getElementById('hospEmail');
    const hoursInput = document.getElementById('hospHours');

    if (nameInput) nameInput.value = currentHosp.name || '';
    if (cityInput) cityInput.value = currentHosp.city || '';
    if (addressInput) addressInput.value = currentHosp.address || '';
    if (contactInput) contactInput.value = currentHosp.contact || '';
    if (emailInput) emailInput.value = currentHosp.email || '';
    if (hoursInput) hoursInput.value = currentHosp.operatingHours || '24/7 Emergency Blood Bank';

    // Render Inventory Cards
    grid.innerHTML = BLOOD_GROUPS.map(group => {
      const units = (currentHosp.inventory && currentHosp.inventory[group] !== undefined) ? currentHosp.inventory[group] : 0;
      const status = getStockStatus(units);

      return `
        <div class="inventory-card">
          <h3>${group}</h3>
          <div class="inv-units-display">
            <span id="units-val-${group}">${units}</span> <span>units</span>
          </div>
          <div><span class="badge ${status.badge}">${status.label}</span></div>
          <div class="inv-actions">
            <button onclick="window.BloodConnectApp.changeStock('${group}', 1)" title="Add 1 unit">+</button>
            <button onclick="window.BloodConnectApp.changeStock('${group}', -1)" title="Remove 1 unit">−</button>
            <button onclick="window.BloodConnectApp.changeStock('${group}', 0, true)" title="Set to 0 (Out of stock)">✕</button>
          </div>
        </div>
      `;
    }).join('');

    // Render Incoming Hospital Bookings Queue
    const hospitalBookings = patientBookings.filter(b => b.hospitalId === currentHosp.id);
    if (requestsCountBadge) requestsCountBadge.textContent = hospitalBookings.length;

    if (requestsQueue) {
      if (hospitalBookings.length === 0) {
        requestsQueue.innerHTML = `
          <div style="background:var(--light-bg);padding:24px;border-radius:var(--radius);text-align:center;color:var(--muted-text);border:1px dashed var(--border-color);">
            <i class="fas fa-inbox" style="font-size:2rem;margin-bottom:8px;color:var(--light-muted);"></i>
            <p>No incoming blood booking requests for ${currentHosp.name}.</p>
          </div>
        `;
      } else {
        requestsQueue.innerHTML = hospitalBookings.map(b => {
          const isFulfilled = b.status === 'fulfilled';
          return `
            <div class="request-queue-item ${isFulfilled ? 'fulfilled' : 'pending'}">
              <div>
                <div style="display:flex;align-items:center;gap:10px;">
                  <strong style="font-size:1.05rem;">Patient: ${b.patientName}</strong>
                  <span class="blood-type-chip">${b.bloodGroup}</span>
                  <span class="badge ${isFulfilled ? 'badge-green' : 'badge-yellow'}">${isFulfilled ? 'Dispatched / Fulfilled' : 'Pending Request'}</span>
                </div>
                <div style="font-size:0.85rem;color:var(--muted-text);margin-top:4px;">
                  Units: <strong>${b.units}</strong> · Doctor/Dept: <strong>${b.doctor || 'ICU'}</strong> · Contact: <strong>${b.contact}</strong>
                  ${b.notes ? ` · Note: <em>${b.notes}</em>` : ''}
                </div>
              </div>
              <div style="display:flex;gap:8px;">
                ${!isFulfilled ? `
                  <button class="btn-primary btn-sm" onclick="window.BloodConnectApp.fulfillHospitalBooking('${b.id}')">
                    <i class="fas fa-check"></i> Fulfill & Deduct Stock
                  </button>
                ` : `
                  <span style="font-size:0.85rem;color:var(--success-green);font-weight:700;"><i class="fas fa-circle-check"></i> Completed</span>
                `}
                <button class="btn-outline btn-sm" onclick="window.BloodConnectApp.removeHospitalBooking('${b.id}')" title="Dismiss">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  // Hospital Selector Change
  const hospitalSelect = document.getElementById('hospitalSelect');
  if (hospitalSelect) {
    hospitalSelect.addEventListener('change', function () {
      activeHospitalId = this.value;
      setStored(STORAGE_KEYS.CURRENT_HOSPITAL, activeHospitalId);
      renderHospitalDashboard();
      showToast('Switched active hospital view', 'info');
    });
  }

  // Hospital Profile Form Update
  const hospitalInfoForm = document.getElementById('hospitalInfoForm');
  if (hospitalInfoForm) {
    hospitalInfoForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const currentHosp = hospitals.find(h => h.id === activeHospitalId);
      if (!currentHosp) return;

      currentHosp.name = document.getElementById('hospName').value.trim();
      currentHosp.city = document.getElementById('hospCity').value.trim();
      currentHosp.address = document.getElementById('hospAddress').value.trim();
      currentHosp.contact = document.getElementById('hospContact').value.trim();
      currentHosp.email = document.getElementById('hospEmail').value.trim();
      currentHosp.operatingHours = document.getElementById('hospHours').value.trim();
      currentHosp.lastUpdated = new Date().toISOString();

      setStored(STORAGE_KEYS.HOSPITALS, hospitals);
      renderHospitalDashboard();
      updateHeroStats();
      showToast('Hospital profile updated successfully!', 'success');
    });
  }

  // Save Stock Updates Button
  const saveInventoryBtn = document.getElementById('saveInventoryBtn');
  if (saveInventoryBtn) {
    saveInventoryBtn.addEventListener('click', () => {
      setStored(STORAGE_KEYS.HOSPITALS, hospitals);
      updateHeroStats();
      showToast('Blood stock inventory saved to database!', 'success');
    });
  }

  // Restock All (+5)
  const restockAllBtn = document.getElementById('restockAllBtn');
  if (restockAllBtn) {
    restockAllBtn.addEventListener('click', () => {
      const currentHosp = hospitals.find(h => h.id === activeHospitalId);
      if (!currentHosp) return;
      if (!currentHosp.inventory) currentHosp.inventory = {};

      BLOOD_GROUPS.forEach(g => {
        currentHosp.inventory[g] = (Number(currentHosp.inventory[g]) || 0) + 5;
      });

      setStored(STORAGE_KEYS.HOSPITALS, hospitals);
      renderHospitalDashboard();
      updateHeroStats();
      showToast('Added +5 units to all blood groups!', 'success');
    });
  }

  // Reset Baseline
  const resetToDefaultBtn = document.getElementById('resetToDefaultBtn');
  if (resetToDefaultBtn) {
    resetToDefaultBtn.addEventListener('click', () => {
      const currentHosp = hospitals.find(h => h.id === activeHospitalId);
      if (!currentHosp) return;

      currentHosp.inventory = {
        'A+': 10, 'A-': 3, 'B+': 8, 'B-': 2,
        'AB+': 5, 'AB-': 2, 'O+': 15, 'O-': 4
      };

      setStored(STORAGE_KEYS.HOSPITALS, hospitals);
      renderHospitalDashboard();
      updateHeroStats();
      showToast('Reset hospital stock to baseline levels', 'info');
    });
  }

  // Clear Completed Requests
  const clearFulfilledRequestsBtn = document.getElementById('clearFulfilledRequestsBtn');
  if (clearFulfilledRequestsBtn) {
    clearFulfilledRequestsBtn.addEventListener('click', () => {
      patientBookings = patientBookings.filter(b => !(b.hospitalId === activeHospitalId && b.status === 'fulfilled'));
      setStored(STORAGE_KEYS.BOOKINGS, patientBookings);
      renderHospitalDashboard();
      showToast('Cleared completed booking requests', 'info');
    });
  }

  // ==========================================
  // 9. PAGE 4: DONOR REGISTRATION & ID CARD
  // ==========================================
  const donorRegistrationForm = document.getElementById('donorRegistrationForm');
  if (donorRegistrationForm) {
    donorRegistrationForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const fullName = document.getElementById('dFullName').value.trim();
      const age = parseInt(document.getElementById('dAge').value, 10);
      const gender = document.getElementById('dGender').value;
      const bloodGroup = document.getElementById('dBloodGroup').value;
      const mobile = document.getElementById('dMobile').value.trim();
      const email = document.getElementById('dEmail').value.trim();
      const city = document.getElementById('dCity').value.trim();
      const address = document.getElementById('dAddress').value.trim();
      const donatedBefore = document.getElementById('dDonatedBefore').value;
      const lastDonation = document.getElementById('dLastDonation').value;
      const availability = document.getElementById('dAvailability').value;
      const preferredHospital = document.getElementById('dPreferredHospital').value.trim();

      if (age < 18 || age > 65) {
        showToast('Blood donors must be between 18 and 65 years old', 'error');
        return;
      }

      // Generate Unique ID
      const newDonorId = 'BC-' + Math.floor(10000 + Math.random() * 90000);

      const newDonor = {
        id: newDonorId,
        fullName,
        age,
        gender,
        bloodGroup,
        mobile,
        email,
        city,
        address,
        donatedBefore,
        lastDonation,
        availability,
        preferredHospital: preferredHospital || 'Any Local Center',
        registeredAt: new Date().toISOString().split('T')[0]
      };

      donors.unshift(newDonor);
      setStored(STORAGE_KEYS.DONORS, donors);

      // Update Digital Donor Card Preview
      updateDonorCardDisplay(newDonor);

      // Update Hero Stats
      updateHeroStats();

      showToast(`Thank you ${fullName}! You are registered as a Lifesaver.`, 'success', 5000);

      // Scroll to card
      document.getElementById('donorCardContainer')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  function updateDonorCardDisplay(donor) {
    const elBlood = document.getElementById('cardBloodGroup');
    const elName = document.getElementById('cardName');
    const elId = document.getElementById('cardId');
    const elCity = document.getElementById('cardCity');
    const elDate = document.getElementById('cardDate');

    if (elBlood) elBlood.textContent = donor.bloodGroup;
    if (elName) elName.textContent = donor.fullName;
    if (elId) elId.textContent = donor.id;
    if (elCity) elCity.textContent = donor.city;
    if (elDate) elDate.textContent = donor.registeredAt || 'Today';
  }

  const printCardBtn = document.getElementById('printCardBtn');
  if (printCardBtn) {
    printCardBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // ==========================================
  // 10. MODALS & FORMS HANDLING
  // ==========================================
  
  // A. Emergency SOS Modal
  const emergencyModal = document.getElementById('emergencyModal');
  const closeEmergencyModalBtn = document.getElementById('closeEmergencyModalBtn');
  const cancelSosBtn = document.getElementById('cancelSosBtn');
  const openEmergencyModalBtn = document.getElementById('openEmergencyModalBtn');
  const heroEmergencyBtn = document.getElementById('heroEmergencyBtn');
  const pageSosBtn = document.getElementById('pageSosBtn');
  const emergencyRequestForm = document.getElementById('emergencyRequestForm');

  function openEmergencyModal() {
    if (emergencyModal) emergencyModal.classList.remove('hidden');
  }
  function closeEmergencyModal() {
    if (emergencyModal) emergencyModal.classList.add('hidden');
  }

  if (openEmergencyModalBtn) openEmergencyModalBtn.addEventListener('click', openEmergencyModal);
  if (heroEmergencyBtn) heroEmergencyBtn.addEventListener('click', openEmergencyModal);
  if (pageSosBtn) pageSosBtn.addEventListener('click', openEmergencyModal);
  if (closeEmergencyModalBtn) closeEmergencyModalBtn.addEventListener('click', closeEmergencyModal);
  if (cancelSosBtn) cancelSosBtn.addEventListener('click', closeEmergencyModal);

  if (emergencyRequestForm) {
    emergencyRequestForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const patientName = document.getElementById('sosPatientName').value.trim();
      const bloodGroup = document.getElementById('sosBloodGroup').value;
      const units = parseInt(document.getElementById('sosUnits').value, 10) || 1;
      const urgency = document.getElementById('sosUrgency').value;
      const hospital = document.getElementById('sosHospital').value.trim();
      const city = document.getElementById('sosCity').value.trim();
      const contactName = document.getElementById('sosContactName').value.trim();
      const contactPhone = document.getElementById('sosContactPhone').value.trim();
      const notes = document.getElementById('sosNotes').value.trim();

      const newSos = {
        id: 'SOS-' + Math.floor(1000 + Math.random() * 9000),
        patientName,
        bloodGroup,
        units,
        urgency,
        hospital,
        city,
        contactName,
        contactPhone,
        notes,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      sosRequests.unshift(newSos);
      setStored(STORAGE_KEYS.SOS_REQUESTS, sosRequests);

      closeEmergencyModal();
      emergencyRequestForm.reset();

      showToast(`🚨 SOS Broadcasted for ${patientName} (${bloodGroup})!`, 'error', 6000);

      // Navigate to Emergency SOS page to see the request
      showPage('emergency');
    });
  }

  // B. Booking Modal
  const bookingModal = document.getElementById('bookingModal');
  const closeBookingModalBtn = document.getElementById('closeBookingModalBtn');
  const cancelBookingBtn = document.getElementById('cancelBookingBtn');
  const bloodBookingForm = document.getElementById('bloodBookingForm');

  function closeBookingModal() {
    if (bookingModal) bookingModal.classList.add('hidden');
  }

  if (closeBookingModalBtn) closeBookingModalBtn.addEventListener('click', closeBookingModal);
  if (cancelBookingBtn) cancelBookingBtn.addEventListener('click', closeBookingModal);

  if (bloodBookingForm) {
    bloodBookingForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const hospitalId = document.getElementById('bookHospitalId').value;
      const bloodGroup = document.getElementById('bookBloodGroup').value;
      const patientName = document.getElementById('bookPatientName').value.trim();
      const units = parseInt(document.getElementById('bookUnits').value, 10) || 1;
      const doctor = document.getElementById('bookDoctorName').value.trim();
      const contact = document.getElementById('bookContact').value.trim();
      const notes = document.getElementById('bookNotes').value.trim();

      const targetHosp = hospitals.find(h => h.id === hospitalId);
      const hospitalName = targetHosp ? targetHosp.name : 'Partner Hospital';

      const newBooking = {
        id: 'BK-' + Math.floor(100 + Math.random() * 900),
        hospitalId,
        hospitalName,
        patientName,
        bloodGroup,
        units,
        doctor: doctor || 'Attending Physician',
        contact,
        notes,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      patientBookings.unshift(newBooking);
      setStored(STORAGE_KEYS.BOOKINGS, patientBookings);

      closeBookingModal();
      bloodBookingForm.reset();

      showToast(`Booking reference #${newBooking.id} submitted to ${hospitalName}!`, 'success', 5000);
    });
  }

  // C. Contact Donor Modal
  const contactDonorModal = document.getElementById('contactDonorModal');
  const closeContactDonorBtn = document.getElementById('closeContactDonorBtn');

  function closeContactDonorModal() {
    if (contactDonorModal) contactDonorModal.classList.add('hidden');
  }

  if (closeContactDonorBtn) closeContactDonorBtn.addEventListener('click', closeContactDonorModal);

  // D. Add Hospital Modal
  const addHospitalModal = document.getElementById('addHospitalModal');
  const addNewHospitalBtn = document.getElementById('addNewHospitalBtn');
  const closeAddHospitalBtn = document.getElementById('closeAddHospitalBtn');
  const cancelAddHospBtn = document.getElementById('cancelAddHospBtn');
  const addHospitalForm = document.getElementById('addHospitalForm');

  function openAddHospitalModal() {
    if (addHospitalModal) addHospitalModal.classList.remove('hidden');
  }
  function closeAddHospitalModal() {
    if (addHospitalModal) addHospitalModal.classList.add('hidden');
  }

  if (addNewHospitalBtn) addNewHospitalBtn.addEventListener('click', openAddHospitalModal);
  if (closeAddHospitalBtn) closeAddHospitalBtn.addEventListener('click', closeAddHospitalModal);
  if (cancelAddHospBtn) cancelAddHospBtn.addEventListener('click', closeAddHospitalModal);

  if (addHospitalForm) {
    addHospitalForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('newHospName').value.trim();
      const city = document.getElementById('newHospCity').value.trim();
      const address = document.getElementById('newHospAddress').value.trim();
      const contact = document.getElementById('newHospContact').value.trim();
      const email = document.getElementById('newHospEmail').value.trim();
      const defaultStock = parseInt(document.getElementById('newHospInitialStock').value, 10) || 5;

      const initialInventory = {};
      BLOOD_GROUPS.forEach(g => {
        initialInventory[g] = defaultStock;
      });

      const newHospital = {
        id: 'hosp-' + (hospitals.length + 1) + '-' + Date.now().toString().slice(-4),
        name,
        city,
        address,
        contact,
        email,
        operatingHours: '24/7 Emergency Blood Bank',
        inventory: initialInventory,
        lastUpdated: new Date().toISOString()
      };

      hospitals.push(newHospital);
      setStored(STORAGE_KEYS.HOSPITALS, hospitals);

      activeHospitalId = newHospital.id;
      setStored(STORAGE_KEYS.CURRENT_HOSPITAL, activeHospitalId);

      closeAddHospitalModal();
      addHospitalForm.reset();

      renderHospitalDashboard();
      updateHeroStats();

      showToast(`Registered "${name}" successfully!`, 'success');
    });
  }

  // Close modals on clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', function (e) {
      if (e.target === this) {
        this.classList.add('hidden');
      }
    });
  });

  // ==========================================
  // 11. GLOBAL INTERACTION HANDLERS (EXPOSED ON window.BloodConnectApp)
  // ==========================================
  window.BloodConnectApp = {
    // Open Booking Modal for Hospital
    openBookingModal(hospitalId, bloodGroup) {
      const targetHosp = hospitals.find(h => h.id === hospitalId);
      if (!targetHosp) return;

      const summaryBox = document.getElementById('bookingSummaryBox');
      const hospIdInput = document.getElementById('bookHospitalId');
      const groupInput = document.getElementById('bookBloodGroup');

      if (hospIdInput) hospIdInput.value = hospitalId;
      if (groupInput) groupInput.value = bloodGroup;

      const availableUnits = targetHosp.inventory ? (targetHosp.inventory[bloodGroup] || 0) : 0;

      if (summaryBox) {
        summaryBox.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong><i class="fas fa-hospital" style="color:var(--primary-red);"></i> ${targetHosp.name}</strong>
            <span class="blood-type-chip">${bloodGroup}</span>
          </div>
          <div style="font-size:0.85rem;color:var(--muted-text);margin-top:4px;">
            Location: ${targetHosp.address}, ${targetHosp.city} · In Stock: <strong>${availableUnits} units</strong>
          </div>
        `;
      }

      if (bookingModal) bookingModal.classList.remove('hidden');
    },

    // Open Contact Donor Modal
    openContactDonorModal(donorId) {
      const donor = donors.find(d => d.id === donorId);
      if (!donor) return;

      const body = document.getElementById('contactDonorModalBody');
      if (!body) return;

      const sampleMsg = encodeURIComponent(`Hello ${donor.fullName}, we found your profile on BloodConnect. We urgently require ${donor.bloodGroup} blood. Are you available to donate?`);

      body.innerHTML = `
        <div style="display:flex;gap:16px;align-items:center;margin-bottom:20px;">
          <div class="donor-avatar-circle" style="width:60px;height:60px;font-size:1.6rem;">${donor.fullName.charAt(0)}</div>
          <div>
            <h4 style="font-size:1.2rem;font-weight:700;">${donor.fullName}</h4>
            <div style="font-size:0.9rem;color:var(--muted-text);">${donor.city} · ${donor.age} yrs (${donor.gender})</div>
            <div style="margin-top:4px;"><span class="blood-type-chip">${donor.bloodGroup}</span> <span class="badge badge-green">Ready to Donate</span></div>
          </div>
        </div>

        <div style="background:var(--light-bg);padding:14px;border-radius:var(--radius);margin-bottom:20px;font-size:0.88rem;">
          <div><i class="fas fa-phone" style="color:var(--primary-red);width:20px;"></i> Phone: <strong>${donor.mobile}</strong></div>
          <div style="margin-top:6px;"><i class="fas fa-envelope" style="color:var(--primary-red);width:20px;"></i> Email: <strong>${donor.email}</strong></div>
          <div style="margin-top:6px;"><i class="fas fa-clock" style="color:var(--primary-red);width:20px;"></i> Availability: <strong>${donor.availability}</strong></div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;">
          <a href="https://wa.me/${donor.mobile.replace(/[^0-9]/g, '')}?text=${sampleMsg}" target="_blank" class="btn-primary" style="justify-content:center;background:#25D366;box-shadow:none;">
            <i class="fab fa-whatsapp"></i> Chat on WhatsApp
          </a>
          <a href="tel:${donor.mobile}" class="btn-outline" style="justify-content:center;">
            <i class="fas fa-phone"></i> Call Donor Directly
          </a>
          <a href="sms:${donor.mobile}?body=${sampleMsg}" class="btn-outline" style="justify-content:center;">
            <i class="fas fa-comment-sms"></i> Send SMS Message
          </a>
        </div>
      `;

      if (contactDonorModal) contactDonorModal.classList.remove('hidden');
    },

    // Stock Control in Hospital Dashboard
    changeStock(group, delta, setToZero = false) {
      const currentHosp = hospitals.find(h => h.id === activeHospitalId);
      if (!currentHosp) return;
      if (!currentHosp.inventory) currentHosp.inventory = {};

      if (setToZero) {
        currentHosp.inventory[group] = 0;
      } else {
        const current = Number(currentHosp.inventory[group]) || 0;
        currentHosp.inventory[group] = Math.max(0, current + delta);
      }

      setStored(STORAGE_KEYS.HOSPITALS, hospitals);
      renderHospitalDashboard();
      updateHeroStats();
    },

    // Fulfill Hospital Booking Request & Deduct Inventory
    fulfillHospitalBooking(bookingId) {
      const booking = patientBookings.find(b => b.id === bookingId);
      if (!booking) return;

      const currentHosp = hospitals.find(h => h.id === booking.hospitalId);
      if (currentHosp && currentHosp.inventory) {
        const group = booking.bloodGroup;
        const currentUnits = Number(currentHosp.inventory[group]) || 0;
        const deduct = Number(booking.units) || 1;

        if (currentUnits < deduct) {
          showToast(`Warning: Only ${currentUnits} units of ${group} in stock, but dispatched ${deduct}.`, 'warning');
        }

        currentHosp.inventory[group] = Math.max(0, currentUnits - deduct);
        setStored(STORAGE_KEYS.HOSPITALS, hospitals);
      }

      booking.status = 'fulfilled';
      setStored(STORAGE_KEYS.BOOKINGS, patientBookings);

      renderHospitalDashboard();
      updateHeroStats();
      showToast(`Booking #${booking.id} dispatched! Stock updated.`, 'success');
    },

    // Remove Hospital Booking Request
    removeHospitalBooking(bookingId) {
      patientBookings = patientBookings.filter(b => b.id !== bookingId);
      setStored(STORAGE_KEYS.BOOKINGS, patientBookings);
      renderHospitalDashboard();
      showToast('Booking dismissed', 'info');
    },

    // Respond to Emergency SOS
    respondToSos(sosId) {
      const req = sosRequests.find(s => s.id === sosId);
      if (!req) return;

      showToast(`Connecting to ${req.contactName} at ${req.hospital}...`, 'info');
      setTimeout(() => {
        window.location.href = `tel:${req.contactPhone}`;
      }, 500);
    },

    // Toggle Fulfilled Status of SOS
    toggleFulfillSos(sosId) {
      const req = sosRequests.find(s => s.id === sosId);
      if (!req) return;

      req.status = req.status === 'open' ? 'fulfilled' : 'open';
      setStored(STORAGE_KEYS.SOS_REQUESTS, sosRequests);
      renderEmergencyFeed('all');
      showToast(`SOS #${req.id} marked as ${req.status === 'fulfilled' ? 'Fulfilled' : 'Open'}`, 'success');
    },

    // Share SOS Alert
    shareSos(sosId) {
      const req = sosRequests.find(s => s.id === sosId);
      if (!req) return;

      const shareText = `🚨 URGENT BLOOD NEED (SOS): ${req.units} units of ${req.bloodGroup} needed for ${req.patientName} at ${req.hospital}, ${req.city}. Contact: ${req.contactName} (${req.contactPhone}). Please share or donate via BloodConnect!`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareText).then(() => {
          showToast('SOS details copied to clipboard! Share on WhatsApp / Socials.', 'success', 4000);
        }).catch(() => {
          prompt('Copy SOS alert text below:', shareText);
        });
      } else {
        prompt('Copy SOS alert text below:', shareText);
      }
    }
  };

  // ==========================================
  // 12. BOOTSTRAP APPLICATION
  // ==========================================
  function initApp() {
    updateHeroStats();
    initCompatibilityWidget();
    performSearch();
    renderHospitalDashboard();

    // Default Seed Donor Card init
    if (donors.length > 0) {
      updateDonorCardDisplay(donors[0]);
    }

    // Default start page
    showPage('find');
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
