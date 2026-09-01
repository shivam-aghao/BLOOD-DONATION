/**
 * ===================================================================
 * BloodConnect - Full Functional Client-Side Application
 * With Supabase & FastAPI Integration (Database Only Mode)
 * NO LOCAL STORAGE - All data from database
 * ===================================================================
 */

(function () {
  'use strict';

  // ==========================================
  // 0. API & SUPABASE CONFIGURATION
  // ==========================================
  
  const SUPABASE_URL = 'https://uojujyjhoaxermhxkwqu.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvanVqeWpob2F4ZXJtaHhrd3F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjIzNjMsImV4cCI6MjEwMzczODM2M30.sJNjJ38RI3O2eE29LwVkUVnEu7WAd3hAiOWQrwJht7E';
  
  const API_BASE_URL = 'http://127.0.0.1:8000';

  // ==========================================
  // 1. DATA STORAGE - NO LOCAL STORAGE
  // ==========================================
  // ⚠️ REMOVED: All localStorage keys and functions
  // Data is stored ONLY in the database

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

  // ==========================================
  // 2. API INTEGRATION FUNCTIONS
  // ==========================================
  
  let isBackendOnline = false;
  let hospitals = [];
  let donors = [];
  let sosRequests = [];
  let patientBookings = [];
  let activeHospitalId = null;

  // ⚠️ REMOVED: getStored() and setStored() functions
  // Data is ONLY from database

  async function checkBackendHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) {
        isBackendOnline = true;
        return true;
      }
    } catch (e) {
      console.warn('⚠️ Backend not running. Database-only mode requires FastAPI server.');
    }
    isBackendOnline = false;
    return false;
  }

  // ==========================================
  // 3. API DATA FETCHING FUNCTIONS (DATABASE ONLY)
  // ==========================================

  // ---------- HOSPITAL API ----------
  async function fetchHospitalsFromAPI() {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.hospitals || data;
    } catch (error) {
      console.error('Backend hospitals fetch error:', error);
      return null;
    }
  }

  async function createHospitalInAPI(hospitalData) {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospital_name: hospitalData.name || hospitalData.hospital_name,
          city: hospitalData.city,
          address: hospitalData.address,
          contact_number: hospitalData.contact || hospitalData.contact_number,
          email: hospitalData.email,
          operating_hours: hospitalData.operatingHours || '24/7 Emergency Blood Bank'
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Backend hospital create error:', error);
      return null;
    }
  }

  async function updateHospitalInAPI(hospitalId, hospitalData) {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospital_name: hospitalData.name || hospitalData.hospital_name,
          city: hospitalData.city,
          address: hospitalData.address,
          contact_number: hospitalData.contact || hospitalData.contact_number,
          email: hospitalData.email,
          operating_hours: hospitalData.operatingHours || '24/7 Emergency Blood Bank'
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Backend hospital update error:', error);
      return null;
    }
  }

  async function updateHospitalInventoryInAPI(hospitalId, inventory) {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}/inventory`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventory })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Backend inventory update error:', error);
      return null;
    }
  }

  async function deleteHospitalFromAPI(hospitalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/hospitals/${hospitalId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Backend hospital delete error:', error);
      return null;
    }
  }

  // ---------- DONOR API ----------
  async function fetchDonorsFromAPI() {
    try {
      const response = await fetch(`${API_BASE_URL}/donors/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.donors || data;
    } catch (error) {
      console.error('Backend donors fetch error:', error);
      return null;
    }
  }

  async function registerDonorInAPI(donorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/donors/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donorData)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.donor || data;
    } catch (error) {
      console.error('Backend donor register error:', error);
      return null;
    }
  }

  async function updateDonorInAPI(donorId, donorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/donors/${donorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donorData)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Backend donor update error:', error);
      return null;
    }
  }

  async function deleteDonorFromAPI(donorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/donors/${donorId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Backend donor delete error:', error);
      return null;
    }
  }

  async function searchDonorsFromAPI(bloodGroup, city) {
    try {
      let url = `${API_BASE_URL}/search/blood?blood_group=${encodeURIComponent(bloodGroup)}`;
      if (city && city.toLowerCase() !== 'all') {
        url += `&city=${encodeURIComponent(city)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.available_donors || [];
    } catch (error) {
      console.error('Backend donor search error:', error);
      return null;
    }
  }

  // ---------- SOS API ----------
  async function fetchSOSFromAPI() {
    try {
      const response = await fetch(`${API_BASE_URL}/sos/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.sos_requests || data;
    } catch (error) {
      console.error('Backend SOS fetch error:', error);
      return null;
    }
  }

  async function createSOSInAPI(sosData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: sosData.patientName,
          blood_group: sosData.bloodGroup,
          units: sosData.units,
          urgency: sosData.urgency,
          hospital: sosData.hospital,
          city: sosData.city,
          contact_name: sosData.contactName,
          contact_phone: sosData.contactPhone,
          notes: sosData.notes
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Backend SOS create error:', error);
      return null;
    }
  }

  async function updateSOSInAPI(sosId, sosData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sos/${sosId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: sosData.status
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Backend SOS update error:', error);
      return null;
    }
  }

  async function deleteSOSFromAPI(sosId) {
    try {
      const response = await fetch(`${API_BASE_URL}/sos/${sosId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Backend SOS delete error:', error);
      return null;
    }
  }

  // ---------- BOOKING API ----------
  async function fetchBookingsFromAPI() {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.bookings || data;
    } catch (error) {
      console.error('Backend bookings fetch error:', error);
      return null;
    }
  }

  async function createBookingInAPI(bookingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospital_id: bookingData.hospitalId,
          patient_name: bookingData.patientName,
          blood_group: bookingData.bloodGroup,
          units: bookingData.units,
          doctor: bookingData.doctor,
          contact: bookingData.contact,
          notes: bookingData.notes
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Backend booking create error:', error);
      return null;
    }
  }

  async function updateBookingInAPI(bookingId, bookingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: bookingData.status
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Backend booking update error:', error);
      return null;
    }
  }

  async function deleteBookingFromAPI(bookingId) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Backend booking delete error:', error);
      return null;
    }
  }

  // ==========================================
  // 4. DATA LOADING FUNCTIONS (DATABASE ONLY)
  // ⚠️ REMOVED: All localStorage caching
  // ==========================================

  async function loadHospitals() {
    if (!isBackendOnline) {
      console.warn('⚠️ Backend not available. Database-only mode requires FastAPI server.');
      hospitals = [];
      return;
    }

    const apiHospitals = await fetchHospitalsFromAPI();
    if (apiHospitals && Array.isArray(apiHospitals) && apiHospitals.length > 0) {
      hospitals = apiHospitals.map(h => ({
        id: String(h.hospital_id || h.id),
        hospital_id: String(h.hospital_id || h.id),
        name: h.hospital_name || h.name,
        hospital_name: h.hospital_name || h.name,
        city: h.city,
        address: h.address,
        contact: h.contact_number || h.contact || '',
        email: h.email || '',
        operatingHours: h.operating_hours || h.operatingHours || '24/7 Emergency Blood Bank',
        inventory: h.inventory || {
          'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
          'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
        },
        createdAt: h.created_at || new Date().toISOString(),
        updatedAt: h.updated_at || new Date().toISOString()
      }));
    } else {
      hospitals = [];
    }
  }

  async function loadDonors() {
    if (!isBackendOnline) {
      console.warn('⚠️ Backend not available. Database-only mode requires FastAPI server.');
      donors = [];
      return;
    }

    const apiDonors = await fetchDonorsFromAPI();
    if (apiDonors && Array.isArray(apiDonors) && apiDonors.length > 0) {
      donors = apiDonors.map(d => ({
        id: String(d.id || d.donar_id || 'BC-' + Math.floor(10000 + Math.random() * 90000)),
        fullName: d.full_name || d.name || 'Anonymous',
        age: d.age || 25,
        gender: d.gender || 'Other',
        bloodGroup: d.blood_group || 'O+',
        mobile: d.mobile || d.phone || '',
        email: d.email || '',
        city: d.city || '',
        address: d.address || '',
        donatedBefore: d.donated_before || 'No',
        lastDonation: d.last_donation || '',
        availability: d.availability || 'Anytime',
        preferredHospital: d.preferred_hospital || '',
        registeredAt: d.registered_at || new Date().toISOString().split('T')[0],
        updatedAt: d.updated_at || new Date().toISOString()
      }));
    } else {
      donors = [];
    }
  }

  async function loadSOSRequests() {
    if (!isBackendOnline) {
      console.warn('⚠️ Backend not available. Database-only mode requires FastAPI server.');
      sosRequests = [];
      return;
    }

    const apiSOS = await fetchSOSFromAPI();
    if (apiSOS && Array.isArray(apiSOS) && apiSOS.length > 0) {
      sosRequests = apiSOS.map(s => ({
        id: String(s.sos_id || s.id || 'SOS-' + Math.floor(1000 + Math.random() * 9000)),
        patientName: s.patient_name || 'Patient',
        bloodGroup: s.blood_group || 'O+',
        units: s.units || 1,
        urgency: s.urgency || 'Standard',
        hospital: s.hospital || 'Hospital',
        city: s.city || '',
        contactName: s.contact_name || '',
        contactPhone: s.contact_phone || '',
        notes: s.notes || '',
        status: s.status || 'open',
        createdAt: s.created_at || new Date().toISOString(),
        updatedAt: s.updated_at || new Date().toISOString()
      }));
    } else {
      sosRequests = [];
    }
  }

  async function loadBookings() {
    if (!isBackendOnline) {
      console.warn('⚠️ Backend not available. Database-only mode requires FastAPI server.');
      patientBookings = [];
      return;
    }

    const apiBookings = await fetchBookingsFromAPI();
    if (apiBookings && Array.isArray(apiBookings) && apiBookings.length > 0) {
      patientBookings = apiBookings.map(b => ({
        id: String(b.booking_id || b.id || 'BK-' + Math.floor(100 + Math.random() * 900)),
        hospitalId: String(b.hospital_id || ''),
        hospitalName: b.hospital_name || 'Hospital',
        patientName: b.patient_name || 'Patient',
        bloodGroup: b.blood_group || 'O+',
        units: b.units || 1,
        doctor: b.doctor || 'Attending Physician',
        contact: b.contact || '',
        notes: b.notes || '',
        status: b.status || 'pending',
        createdAt: b.created_at || new Date().toISOString(),
        updatedAt: b.updated_at || new Date().toISOString()
      }));
    } else {
      patientBookings = [];
    }
  }

  // ==========================================
  // 5. UI UTILITIES (TOASTS, FORMATTERS, STATUS)
  // ==========================================
  function showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) {
      alert(message);
      return;
    }

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
  // 6. NAVIGATION & ROUTING
  // ==========================================
  const pages = {
    find: document.getElementById('page-find'),
    emergency: document.getElementById('page-emergency'),
    dashboard: document.getElementById('page-dashboard'),
    donor: document.getElementById('page-donor'),
    about: document.getElementById('page-about')
  };

  function detectCurrentPage() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('donor-registration')) return 'donor';
    if (path.includes('find-blood')) return 'find';
    if (path.includes('hospital-dashboard')) return 'dashboard';
    if (path.includes('sos-requests')) return 'emergency';
    if (path.includes('about')) return 'about';

    if (document.getElementById('page-donor') && !document.getElementById('page-find')) return 'donor';
    if (document.getElementById('page-dashboard') && !document.getElementById('page-find')) return 'dashboard';
    if (document.getElementById('page-emergency') && !document.getElementById('page-find')) return 'emergency';
    if (document.getElementById('page-about') && !document.getElementById('page-find')) return 'about';
    return 'find';
  }

  function showPage(pageId) {
    if (!pages[pageId]) pageId = detectCurrentPage();

    const availablePages = Object.keys(pages).filter(key => pages[key] !== null);
    const isStandalone = availablePages.length === 1;

    Object.keys(pages).forEach(key => {
      if (pages[key]) {
        if (!isStandalone) {
          pages[key].classList.toggle('hidden', key !== pageId);
        } else {
          pages[key].classList.remove('hidden');
        }
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.page) {
        link.classList.toggle('tab-active', link.dataset.page === pageId);
      }
    });

    if (pageId === 'find') {
      performSearch();
    } else if (pageId === 'emergency') {
      renderEmergencyFeed('all');
    } else if (pageId === 'dashboard') {
      renderHospitalDashboard();
    } else if (pageId === 'about') {
      updateAboutStats();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================
  // 7. HERO STATS DYNAMIC CALCULATION
  // ==========================================
  function updateHeroStats() {
    const totalDonorsCount = donors.length;
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
    if (elLives) elLives.textContent = `${(totalDonorsCount * 3).toLocaleString()}+`;

    updateAboutStats();
  }

  function updateAboutStats() {
    const elAboutDonors = document.getElementById('aboutDonorsCount');
    const elAboutHospitals = document.getElementById('aboutHospitalsCount');
    if (elAboutDonors) elAboutDonors.textContent = `${donors.length.toLocaleString()}+ Donors`;
    if (elAboutHospitals) elAboutHospitals.textContent = `${hospitals.length} Partner Hospitals`;
  }

  // ==========================================
  // 8. PAGE 1: FIND BLOOD & SEARCH SYSTEM
  // ==========================================
  let currentSearchTab = 'hospitals';

  function setupSearchEventListeners() {
    const tabHospitalsBtn = document.getElementById('tabHospitalsBtn');
    const tabDonorsBtn = document.getElementById('tabDonorsBtn');
    const sortResultsSelect = document.getElementById('sortResults');
    const includeCompatibleCheck = document.getElementById('includeCompatibleCheck');
    const searchBtn = document.getElementById('searchBtn');
    const resetSearchBtn = document.getElementById('resetSearchBtn');
    const cityInput = document.getElementById('cityInput');

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

    if (searchBtn) {
      searchBtn.addEventListener('click', performSearch);
    }

    if (resetSearchBtn) {
      resetSearchBtn.addEventListener('click', () => {
        const bloodGroup = document.getElementById('bloodGroup');
        const cityInput = document.getElementById('cityInput');
        const includeCompatibleCheck = document.getElementById('includeCompatibleCheck');
        const sortResults = document.getElementById('sortResults');
        
        if (bloodGroup) bloodGroup.value = 'A+';
        if (cityInput) cityInput.value = 'All';
        if (includeCompatibleCheck) includeCompatibleCheck.checked = true;
        if (sortResults) sortResults.value = 'stock-desc';
        performSearch();
        showToast('Search filters reset', 'info');
      });
    }

    if (cityInput) {
      cityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          performSearch();
        }
      });
    }
  }

  function performSearch() {
    const bloodGroupEl = document.getElementById('bloodGroup');
    const cityInputEl = document.getElementById('cityInput');
    const includeCompatibleCheck = document.getElementById('includeCompatibleCheck');
    const sortResultsSelect = document.getElementById('sortResults');
    const container = document.getElementById('resultsContainer');

    if (!container) return;

    const selectedGroup = bloodGroupEl ? bloodGroupEl.value : 'A+';
    const cityQuery = cityInputEl ? (cityInputEl.value || '').trim().toLowerCase() : '';
    const includeCompatible = includeCompatibleCheck ? includeCompatibleCheck.checked : true;
    const sortBy = sortResultsSelect ? sortResultsSelect.value : 'stock-desc';

    const compatibleGroups = COMPATIBILITY[selectedGroup]?.receive || [selectedGroup];
    const targetGroups = includeCompatible ? compatibleGroups : [selectedGroup];

    const activeFilterDisplay = document.getElementById('activeFilterDisplay');
    if (activeFilterDisplay) {
      activeFilterDisplay.innerHTML = `
        <span class="filter-badge"><i class="fas fa-droplet"></i> Target: ${selectedGroup}</span>
        <span class="filter-badge"><i class="fas fa-location-dot"></i> City: ${cityQuery === '' || cityQuery === 'all' ? 'All Cities' : cityQuery}</span>
        ${includeCompatible ? `<span class="filter-badge"><i class="fas fa-arrows-split-up-and-left"></i> Compatible: ${compatibleGroups.join(', ')}</span>` : ''}
      `;
    }

    let filteredHospitals = hospitals.filter(h => {
      if (cityQuery !== '' && cityQuery !== 'all') {
        const matchesCity = h.city.toLowerCase().includes(cityQuery) || 
                           (h.address && h.address.toLowerCase().includes(cityQuery));
        if (!matchesCity) return false;
      }
      return true;
    });

    let filteredDonors = donors.filter(d => {
      if (cityQuery !== '' && cityQuery !== 'all') {
        const matchesCity = d.city.toLowerCase().includes(cityQuery) || 
                           (d.address && d.address.toLowerCase().includes(cityQuery));
        if (!matchesCity) return false;
      }
      const matchesBlood = targetGroups.includes(d.bloodGroup);
      return matchesBlood;
    });

    const hospBadge = document.getElementById('hospitalCountBadge');
    const donorBadge = document.getElementById('donorCountBadge');
    if (hospBadge) hospBadge.textContent = filteredHospitals.length;
    if (donorBadge) donorBadge.textContent = filteredDonors.length;

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
          <button class="btn-emergency" id="emptySosBtn">
            <i class="fas fa-bullhorn"></i> Post Urgent SOS Request
          </button>
        </div>
      `;
      const emptySosBtn = document.getElementById('emptySosBtn');
      if (emptySosBtn) {
        emptySosBtn.addEventListener('click', () => {
          const emergencyModal = document.getElementById('emergencyModal');
          if (emergencyModal) emergencyModal.classList.remove('hidden');
        });
      }
      return;
    }

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
            <button class="btn-card-primary booking-btn" data-hospital-id="${h.id}" data-blood-group="${selectedGroup}">
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

    // Add event listeners for booking buttons
    container.querySelectorAll('.booking-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const hospitalId = this.dataset.hospitalId;
        const bloodGroup = this.dataset.bloodGroup;
        openBookingModal(hospitalId, bloodGroup);
      });
    });
  }

  function renderDonorSearchResults(donorList, selectedGroup, sortBy, container) {
    if (donorList.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <i class="fas fa-user-xmark"></i>
          <h3>No Voluntary Donors Matching</h3>
          <p>No registered voluntary donors found for blood type ${selectedGroup} in this location. Be the first lifesaver to register!</p>
          <button class="btn-primary" id="registerDonorBtn"><i class="fas fa-heart"></i> Register as a Donor</button>
        </div>
      `;
      const registerDonorBtn = document.getElementById('registerDonorBtn');
      if (registerDonorBtn) {
        registerDonorBtn.addEventListener('click', () => showPage('donor'));
      }
      return;
    }

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
            <button class="btn-card-primary contact-donor-btn" data-donor-id="${d.id}">
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

    // Add event listeners for contact donor buttons
    container.querySelectorAll('.contact-donor-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const donorId = this.dataset.donorId;
        openContactDonorModal(donorId);
      });
    });
  }

  // ==========================================
  // 9. INTERACTIVE BLOOD COMPATIBILITY TOOL
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
  // 10. PAGE 2: EMERGENCY SOS REQUESTS
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
      const urgencyBadgeClass = req.urgency.includes('Critical') ? 'badge-red' : 
                                (req.urgency.includes('Urgent') ? 'badge-yellow' : 'badge-blue');

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
              <button class="btn-card-primary respond-sos-btn" data-sos-id="${req.id}">
                <i class="fas fa-heart"></i> I Can Donate
              </button>
              <button class="btn-card-secondary fulfill-sos-btn" data-sos-id="${req.id}">
                <i class="fas fa-check"></i> Fulfill
              </button>
            ` : `
              <button class="btn-card-secondary" style="width:100%;" disabled>
                <i class="fas fa-circle-check" style="color:var(--success-green);"></i> Request Fulfilled & Saved
              </button>
            `}
            <button class="btn-card-secondary share-sos-btn" data-sos-id="${req.id}" title="Share SOS Alert">
              <i class="fas fa-share-nodes"></i> Share
            </button>
          </div>
        </div>
      `;
    });

    feedContainer.innerHTML = html;

    // Add event listeners for SOS actions
    feedContainer.querySelectorAll('.respond-sos-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const sosId = this.dataset.sosId;
        respondToSos(sosId);
      });
    });

    feedContainer.querySelectorAll('.fulfill-sos-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const sosId = this.dataset.sosId;
        toggleFulfillSos(sosId);
      });
    });

    feedContainer.querySelectorAll('.share-sos-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const sosId = this.dataset.sosId;
        shareSos(sosId);
      });
    });
  }

  // SOS action functions
  function respondToSos(sosId) {
    const req = sosRequests.find(s => s.id === sosId);
    if (!req) {
      showToast('SOS request not found', 'error');
      return;
    }

    showToast(`Connecting to ${req.contactName} at ${req.hospital}...`, 'info');
    setTimeout(() => {
      window.location.href = `tel:${req.contactPhone}`;
    }, 500);
  }

  async function toggleFulfillSos(sosId) {
    const req = sosRequests.find(s => s.id === sosId);
    if (!req) {
      showToast('SOS request not found', 'error');
      return;
    }

    const newStatus = req.status === 'open' ? 'fulfilled' : 'open';
    req.status = newStatus;
    req.updatedAt = new Date().toISOString();
    
    if (isBackendOnline) {
      await updateSOSInAPI(req.id, { status: newStatus });
    }
    
    renderEmergencyFeed('all');
    showToast(`SOS #${req.id} marked as ${req.status === 'fulfilled' ? 'Fulfilled' : 'Open'}`, 'success');
  }

  function shareSos(sosId) {
    const req = sosRequests.find(s => s.id === sosId);
    if (!req) {
      showToast('SOS request not found', 'error');
      return;
    }

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

  // ==========================================
  // 11. PAGE 3: HOSPITAL DASHBOARD & INVENTORY
  // ==========================================
  function renderHospitalDashboard() {
    const select = document.getElementById('hospitalSelect');
    const grid = document.getElementById('inventoryGrid');
    const requestsQueue = document.getElementById('hospitalRequestsQueue');
    const requestsCountBadge = document.getElementById('incomingRequestsCount');

    if (!select || !grid) return;

    select.innerHTML = hospitals.map(h => 
      `<option value="${h.id}" ${h.id === activeHospitalId ? 'selected' : ''}>${h.name} (${h.city})</option>`
    ).join('');

    const currentHosp = hospitals.find(h => h.id === activeHospitalId) || hospitals[0];
    if (!currentHosp) {
      grid.innerHTML = `<div class="empty-state-box"><p>No hospital data available. Please add a hospital.</p></div>`;
      return;
    }

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
            <button class="stock-btn" data-group="${group}" data-delta="1" title="Add 1 unit">+</button>
            <button class="stock-btn" data-group="${group}" data-delta="-1" title="Remove 1 unit">−</button>
            <button class="stock-btn" data-group="${group}" data-delta="0" data-set-zero="true" title="Set to 0 (Out of stock)">✕</button>
          </div>
        </div>
      `;
    }).join('');

    // Add stock button event listeners
    grid.querySelectorAll('.stock-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const group = this.dataset.group;
        const delta = parseInt(this.dataset.delta, 10);
        const setToZero = this.dataset.setZero === 'true';
        changeStock(group, delta, setToZero);
      });
    });

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
                  <button class="btn-primary btn-sm fulfill-booking-btn" data-booking-id="${b.id}">
                    <i class="fas fa-check"></i> Fulfill & Deduct Stock
                  </button>
                ` : `
                  <span style="font-size:0.85rem;color:var(--success-green);font-weight:700;">
                    <i class="fas fa-circle-check"></i> Completed
                  </span>
                `}
                <button class="btn-outline btn-sm remove-booking-btn" data-booking-id="${b.id}" title="Dismiss">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          `;
        }).join('');

        // Add booking action event listeners
        requestsQueue.querySelectorAll('.fulfill-booking-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const bookingId = this.dataset.bookingId;
            fulfillHospitalBooking(bookingId);
          });
        });

        requestsQueue.querySelectorAll('.remove-booking-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const bookingId = this.dataset.bookingId;
            removeHospitalBooking(bookingId);
          });
        });
      }
    }
  }

  // Stock management functions
  async function changeStock(group, delta, setToZero = false) {
    const currentHosp = hospitals.find(h => h.id === activeHospitalId);
    if (!currentHosp) {
      showToast('No hospital selected', 'warning');
      return;
    }
    if (!currentHosp.inventory) currentHosp.inventory = {};

    if (setToZero) {
      currentHosp.inventory[group] = 0;
    } else {
      const current = Number(currentHosp.inventory[group]) || 0;
      currentHosp.inventory[group] = Math.max(0, current + delta);
    }

    if (isBackendOnline && currentHosp.id && !isNaN(currentHosp.id)) {
      await updateHospitalInventoryInAPI(currentHosp.id, currentHosp.inventory);
    }
    
    renderHospitalDashboard();
    updateHeroStats();
  }

  async function fulfillHospitalBooking(bookingId) {
    const booking = patientBookings.find(b => b.id === bookingId);
    if (!booking) {
      showToast('Booking not found', 'error');
      return;
    }

    const currentHosp = hospitals.find(h => h.id === booking.hospitalId);
    if (currentHosp && currentHosp.inventory) {
      const group = booking.bloodGroup;
      const currentUnits = Number(currentHosp.inventory[group]) || 0;
      const deduct = Number(booking.units) || 1;

      if (currentUnits < deduct) {
        showToast(`Warning: Only ${currentUnits} units of ${group} in stock, but dispatched ${deduct}.`, 'warning');
      }

      currentHosp.inventory[group] = Math.max(0, currentUnits - deduct);
      
      if (isBackendOnline && currentHosp.id && !isNaN(currentHosp.id)) {
        await updateHospitalInventoryInAPI(currentHosp.id, currentHosp.inventory);
      }
    }

    booking.status = 'fulfilled';
    booking.updatedAt = new Date().toISOString();
    
    if (isBackendOnline) {
      await updateBookingInAPI(booking.id, { status: 'fulfilled' });
    }

    renderHospitalDashboard();
    updateHeroStats();
    showToast(`Booking #${booking.id} dispatched! Stock updated.`, 'success');
  }

  function removeHospitalBooking(bookingId) {
    if (!confirm('Remove this booking request?')) return;
    
    patientBookings = patientBookings.filter(b => b.id !== bookingId);
    renderHospitalDashboard();
    showToast('Booking dismissed', 'info');
  }

  // ==========================================
  // 12. PAGE 4: DONOR REGISTRATION & ID CARD
  // ==========================================
  function setupDonorRegistration() {
    const donorRegistrationForm = document.getElementById('donorRegistrationForm');
    const printCardBtn = document.getElementById('printCardBtn');

    if (donorRegistrationForm) {
      donorRegistrationForm.addEventListener('submit', async function (e) {
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

        const donorPayload = {
          name: fullName,
          age: age,
          gender: gender,
          blood_group: bloodGroup,
          phone: mobile,
          email: email,
          city: city,
          address: address,
          donated_before: donatedBefore,
          last_donation: lastDonation || null,
          availability: availability,
          preferred_hospital: preferredHospital || null,
          agreement: true
        };

        if (!isBackendOnline) {
          showToast('⚠️ Backend database is offline. Please start the FastAPI server to register.', 'error', 5000);
          return;
        }

        showToast('Registering donor in database...', 'info');
        const result = await registerDonorInAPI(donorPayload);
        if (result) {
          await loadDonors();
          const registered = donors.find(d => d.email === email || d.fullName === fullName) || {
            id: 'BC-' + (result.id || result.donar_id || Math.floor(10000 + Math.random() * 90000)),
            fullName,
            age,
            gender,
            bloodGroup,
            mobile,
            email,
            city,
            address,
            registeredAt: new Date().toISOString().split('T')[0]
          };
          updateDonorCardDisplay(registered);
          updateHeroStats();
          performSearch();
          showToast(`🎉 Registered in database! Thank you, ${fullName}!`, 'success', 5000);
          donorRegistrationForm.reset();
          const cardContainer = document.getElementById('donorCardContainer');
          if (cardContainer) {
            cardContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          showToast('❌ Failed to register donor in database. Please check your backend connection.', 'error', 5000);
        }
      });
    }

    if (printCardBtn) {
      printCardBtn.addEventListener('click', () => {
        window.print();
      });
    }
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

  // ==========================================
  // 13. MODALS & FORMS HANDLING
  // ==========================================
  
  // A. Emergency SOS Modal
  function setupEmergencyModal() {
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

    if (emergencyModal) {
      emergencyModal.addEventListener('click', function (e) {
        if (e.target === this) {
          this.classList.add('hidden');
        }
      });
    }

    if (emergencyRequestForm) {
      emergencyRequestForm.addEventListener('submit', async function (e) {
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

        const newSosData = {
          patientName,
          bloodGroup,
          units,
          urgency,
          hospital,
          city,
          contactName,
          contactPhone,
          notes
        };

        if (!isBackendOnline) {
          showToast('⚠️ Backend database is offline. Please start the FastAPI server to broadcast SOS.', 'error', 5000);
          return;
        }

        showToast('Broadcasting SOS to database...', 'info');
        const result = await createSOSInAPI(newSosData);
        if (result) {
          await loadSOSRequests();
          closeEmergencyModal();
          emergencyRequestForm.reset();
          showToast(`🚨 SOS Broadcasted for ${patientName} (${bloodGroup})!`, 'error', 6000);
          showPage('emergency');
        } else {
          showToast('❌ Failed to broadcast SOS to database.', 'error', 5000);
        }
      });
    }
  }

  // B. Booking Modal
  function setupBookingModal() {
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingModalBtn = document.getElementById('closeBookingModalBtn');
    const cancelBookingBtn = document.getElementById('cancelBookingBtn');
    const bloodBookingForm = document.getElementById('bloodBookingForm');

    function closeBookingModal() {
      if (bookingModal) bookingModal.classList.add('hidden');
    }

    if (closeBookingModalBtn) closeBookingModalBtn.addEventListener('click', closeBookingModal);
    if (cancelBookingBtn) cancelBookingBtn.addEventListener('click', closeBookingModal);

    if (bookingModal) {
      bookingModal.addEventListener('click', function (e) {
        if (e.target === this) {
          this.classList.add('hidden');
        }
      });
    }

    if (bloodBookingForm) {
      bloodBookingForm.addEventListener('submit', async function (e) {
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

        const bookingData = {
          hospitalId,
          hospitalName,
          patientName,
          bloodGroup,
          units,
          doctor: doctor || 'Attending Physician',
          contact,
          notes
        };

        if (!isBackendOnline) {
          showToast('⚠️ Backend database is offline. Please start the FastAPI server to submit booking.', 'error', 5000);
          return;
        }

        showToast('Submitting booking to database...', 'info');
        const result = await createBookingInAPI(bookingData);
        if (result) {
          await loadBookings();
          closeBookingModal();
          bloodBookingForm.reset();
          const bkId = result.booking?.id || result.booking_id || result.id || 'BK-CONFIRMED';
          showToast(`Booking reference #${bkId} submitted to ${hospitalName}!`, 'success', 5000);
        } else {
          showToast('❌ Failed to submit booking to database.', 'error', 5000);
        }
      });
    }
  }

  function openBookingModal(hospitalId, bloodGroup) {
    const targetHosp = hospitals.find(h => h.id === hospitalId);
    if (!targetHosp) {
      showToast('Hospital not found', 'error');
      return;
    }

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

    const bookingModal = document.getElementById('bookingModal');
    if (bookingModal) bookingModal.classList.remove('hidden');
  }

  // C. Contact Donor Modal
  function setupContactDonorModal() {
    const contactDonorModal = document.getElementById('contactDonorModal');
    const closeContactDonorBtn = document.getElementById('closeContactDonorBtn');

    if (closeContactDonorBtn) {
      closeContactDonorBtn.addEventListener('click', () => {
        if (contactDonorModal) contactDonorModal.classList.add('hidden');
      });
    }

    if (contactDonorModal) {
      contactDonorModal.addEventListener('click', function (e) {
        if (e.target === this) {
          this.classList.add('hidden');
        }
      });
    }
  }

  function openContactDonorModal(donorId) {
    const donor = donors.find(d => d.id === donorId);
    if (!donor) {
      showToast('Donor not found', 'error');
      return;
    }

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

    const contactDonorModal = document.getElementById('contactDonorModal');
    if (contactDonorModal) contactDonorModal.classList.remove('hidden');
  }

  // D. Add Hospital Modal
  function setupAddHospitalModal() {
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

    if (addHospitalModal) {
      addHospitalModal.addEventListener('click', function (e) {
        if (e.target === this) {
          this.classList.add('hidden');
        }
      });
    }

    if (addHospitalForm) {
      addHospitalForm.addEventListener('submit', async function (e) {
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
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };

        if (isBackendOnline) {
          const apiResult = await createHospitalInAPI(newHospital);
          if (apiResult) {
            newHospital.id = String(apiResult.id || newHospital.id);
            showToast(`Hospital "${name}" created in database!`, 'success');
          } else {
            showToast(`Hospital "${name}" created locally (API unavailable).`, 'warning');
          }
        }

        hospitals.push(newHospital);
        activeHospitalId = newHospital.id;
        closeAddHospitalModal();
        addHospitalForm.reset();
        renderHospitalDashboard();
        updateHeroStats();
        showToast(`Registered "${name}" successfully!`, 'success');
      });
    }
  }

  // ==========================================
  // 14. DASHBOARD EVENT LISTENERS
  // ==========================================
  function setupDashboardEventListeners() {
    const hospitalSelect = document.getElementById('hospitalSelect');
    const hospitalInfoForm = document.getElementById('hospitalInfoForm');
    const saveInventoryBtn = document.getElementById('saveInventoryBtn');
    const restockAllBtn = document.getElementById('restockAllBtn');
    const resetToDefaultBtn = document.getElementById('resetToDefaultBtn');
    const clearFulfilledRequestsBtn = document.getElementById('clearFulfilledRequestsBtn');

    if (hospitalSelect) {
      hospitalSelect.addEventListener('change', function () {
        activeHospitalId = this.value;
        renderHospitalDashboard();
        showToast('Switched active hospital view', 'info');
      });
    }

    if (hospitalInfoForm) {
      hospitalInfoForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const currentHosp = hospitals.find(h => h.id === activeHospitalId);
        if (!currentHosp) return;

        const updatedData = {
          name: document.getElementById('hospName').value.trim(),
          city: document.getElementById('hospCity').value.trim(),
          address: document.getElementById('hospAddress').value.trim(),
          contact: document.getElementById('hospContact').value.trim(),
          email: document.getElementById('hospEmail').value.trim(),
          operatingHours: document.getElementById('hospHours').value.trim()
        };

        Object.assign(currentHosp, updatedData);
        currentHosp.updatedAt = new Date().toISOString();

        if (isBackendOnline && currentHosp.id) {
          const apiResult = await updateHospitalInAPI(currentHosp.id, updatedData);
          if (apiResult) {
            showToast('Hospital profile synced with database!', 'success');
          } else {
            showToast('Failed to sync with database.', 'warning');
          }
        }

        renderHospitalDashboard();
        updateHeroStats();
        showToast('Hospital profile updated successfully!', 'success');
      });
    }

    if (saveInventoryBtn) {
      saveInventoryBtn.addEventListener('click', async () => {
        const currentHosp = hospitals.find(h => h.id === activeHospitalId);
        if (!currentHosp) return;

        if (isBackendOnline && currentHosp.id) {
          const apiResult = await updateHospitalInventoryInAPI(currentHosp.id, currentHosp.inventory);
          if (apiResult) {
            showToast('Inventory synced with database!', 'success');
          } else {
            showToast('Failed to sync inventory with database.', 'warning');
          }
        }
        
        updateHeroStats();
        showToast('Blood stock inventory saved to database!', 'success');
      });
    }

    if (restockAllBtn) {
      restockAllBtn.addEventListener('click', async () => {
        const currentHosp = hospitals.find(h => h.id === activeHospitalId);
        if (!currentHosp) return;
        if (!currentHosp.inventory) currentHosp.inventory = {};

        BLOOD_GROUPS.forEach(g => {
          currentHosp.inventory[g] = (Number(currentHosp.inventory[g]) || 0) + 5;
        });

        if (isBackendOnline && currentHosp.id) {
          await updateHospitalInventoryInAPI(currentHosp.id, currentHosp.inventory);
        }
        
        renderHospitalDashboard();
        updateHeroStats();
        showToast('Added +5 units to all blood groups in database!', 'success');
      });
    }

    if (resetToDefaultBtn) {
      resetToDefaultBtn.addEventListener('click', async () => {
        showToast('Refreshing stock directly from database...', 'info');
        await loadHospitals();
        renderHospitalDashboard();
        updateHeroStats();
        showToast('Hospital stock refreshed from database', 'success');
      });
    }

    if (clearFulfilledRequestsBtn) {
      clearFulfilledRequestsBtn.addEventListener('click', () => {
        patientBookings = patientBookings.filter(b => !(b.hospitalId === activeHospitalId && b.status === 'fulfilled'));
        renderHospitalDashboard();
        showToast('Cleared completed booking requests', 'info');
      });
    }
  }

  // ==========================================
  // 15. NAVIGATION EVENT LISTENERS
  // ==========================================
  function setupNavigation() {
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        const targetPage = this.dataset.page;
        showPage(targetPage);
        const navLinks = document.getElementById('navLinks');
        if (navLinks) navLinks.classList.remove('open');
      });
    });

    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        const navLinks = document.getElementById('navLinks');
        if (navLinks) navLinks.classList.toggle('open');
      });
    }
  }

  // ==========================================
  // 16. EMERGENCY FILTER EVENT LISTENERS
  // ==========================================
  function setupEmergencyFilters() {
    document.querySelectorAll('.emergency-filter-bar .filter-chip').forEach(chip => {
      chip.addEventListener('click', function () {
        document.querySelectorAll('.emergency-filter-bar .filter-chip').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        const status = this.dataset.status;
        renderEmergencyFeed(status);
      });
    });
  }

  // ==========================================
  // 17. DELETE FUNCTIONS
  // ==========================================
  async function deleteHospital(hospitalId) {
    if (!confirm('Are you sure you want to delete this hospital? This action cannot be undone.')) {
      return;
    }

    const hospital = hospitals.find(h => h.id === hospitalId);
    if (!hospital) {
      showToast('Hospital not found', 'error');
      return;
    }

    if (isBackendOnline) {
      const result = await deleteHospitalFromAPI(hospitalId);
      if (result) {
        showToast(`Hospital "${hospital.name}" deleted from database`, 'success');
      } else {
        showToast('Failed to delete from database', 'warning');
      }
    }

    hospitals = hospitals.filter(h => h.id !== hospitalId);

    if (activeHospitalId === hospitalId) {
      activeHospitalId = hospitals.length > 0 ? hospitals[0].id : null;
    }

    renderHospitalDashboard();
    updateHeroStats();
    showToast(`Hospital "${hospital.name}" removed`, 'success');
  }

  async function deleteDonor(donorId) {
    if (!confirm('Are you sure you want to delete this donor?')) {
      return;
    }

    const donor = donors.find(d => d.id === donorId);
    if (!donor) {
      showToast('Donor not found', 'error');
      return;
    }

    if (isBackendOnline) {
      const result = await deleteDonorFromAPI(donorId);
      if (result) {
        showToast(`Donor "${donor.fullName}" deleted from database`, 'success');
      }
    }

    donors = donors.filter(d => d.id !== donorId);
    updateHeroStats();
    performSearch();
    showToast(`Donor "${donor.fullName}" removed`, 'success');
  }

  async function deleteSOS(sosId) {
    if (!confirm('Delete this SOS request?')) {
      return;
    }

    const sos = sosRequests.find(s => s.id === sosId);
    if (!sos) {
      showToast('SOS request not found', 'error');
      return;
    }

    if (isBackendOnline) {
      const result = await deleteSOSFromAPI(sosId);
      if (result) {
        showToast('SOS deleted from database', 'success');
      }
    }

    sosRequests = sosRequests.filter(s => s.id !== sosId);
    renderEmergencyFeed('all');
    showToast('SOS request removed', 'success');
  }

  // ==========================================
  // 18. REFRESH DATA
  // ==========================================
  async function refreshData() {
    showToast('Refreshing data from database...', 'info');
    await loadHospitals();
    await loadDonors();
    await loadSOSRequests();
    await loadBookings();
    
    if (activeHospitalId === null && hospitals.length > 0) {
      activeHospitalId = hospitals[0].id;
    }
    
    updateHeroStats();
    performSearch();
    renderHospitalDashboard();
    renderEmergencyFeed('all');
    showToast('Data refreshed from database!', 'success');
  }

  // ==========================================
  // 19. API STATUS BADGE
  // ==========================================
  function updateApiStatusBadge() {
    let badge = document.getElementById('backendStatusBadge');
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'backendStatusBadge';
      badge.className = 'badge';
      badge.style.marginLeft = '12px';
      badge.style.fontSize = '0.78rem';
      badge.style.verticalAlign = 'middle';
      
      const logo = document.querySelector('.navbar .logo');
      if (logo) {
        logo.appendChild(badge);
      }
    }
    
    if (isBackendOnline) {
      badge.className = 'badge badge-green';
      badge.innerHTML = '<i class="fas fa-circle-check"></i> Database Connected';
    } else {
      badge.className = 'badge badge-red';
      badge.innerHTML = '<i class="fas fa-circle-exclamation"></i> Database Offline';
    }
  }

  // ==========================================
  // 20. GET STATE
  // ==========================================
  function getState() {
    return {
      isBackendOnline,
      hospitals: hospitals.length,
      donors: donors.length,
      sosRequests: sosRequests.length,
      patientBookings: patientBookings.length,
      activeHospitalId
    };
  }

  // ==========================================
  // 21. BOOTSTRAP APPLICATION
  // ==========================================
  async function initApp() {
    await checkBackendHealth();

    if (!isBackendOnline) {
      showToast('⚠️ Database server not connected. Please start the FastAPI server.', 'error', 5000);
      const apiStatus = document.getElementById('apiStatus');
      if (apiStatus) {
        apiStatus.textContent = '📡 Database Offline - Please start server';
        apiStatus.style.color = '#DC2626';
      }
    }

    await loadHospitals();
    await loadDonors();
    await loadSOSRequests();
    await loadBookings();
    
    if (activeHospitalId === null && hospitals.length > 0) {
      activeHospitalId = hospitals[0].id;
    }
    
    updateHeroStats();
    initCompatibilityWidget();
    performSearch();
    renderHospitalDashboard();
    renderEmergencyFeed('all');

    if (donors.length > 0) {
      updateDonorCardDisplay(donors[0]);
    }

    const apiStatus = document.getElementById('apiStatus');
    if (apiStatus) {
      apiStatus.textContent = isBackendOnline ? '🔗 Database Connected' : '📡 Database Offline';
      apiStatus.style.color = isBackendOnline ? '#10B981' : '#DC2626';
    }

    updateApiStatusBadge();

    const curPage = detectCurrentPage();
    showPage(curPage);
    
    const navRight = document.querySelector('.navbar .nav-right');
    if (navRight && isBackendOnline) {
      if (!document.getElementById('refreshDataBtn')) {
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'refreshDataBtn';
        refreshBtn.className = 'btn-outline btn-sm';
        refreshBtn.innerHTML = '<i class="fas fa-sync"></i> Refresh';
        refreshBtn.style.marginLeft = '10px';
        refreshBtn.addEventListener('click', refreshData);
        navRight.appendChild(refreshBtn);
      }
    }

    console.log('✅ BloodConnect initialized in Database-Only Mode (NO LOCAL STORAGE)');
    console.log('📊 Current state:', getState());
  }

  // ==========================================
  // 22. EXPOSE GLOBAL FUNCTIONS
  // ==========================================
  window.BloodConnectApp = {
    openBookingModal: openBookingModal,
    openContactDonorModal: openContactDonorModal,
    changeStock: changeStock,
    fulfillHospitalBooking: fulfillHospitalBooking,
    removeHospitalBooking: removeHospitalBooking,
    respondToSos: respondToSos,
    toggleFulfillSos: toggleFulfillSos,
    shareSos: shareSos,
    refreshData: refreshData,
    deleteHospital: deleteHospital,
    deleteDonor: deleteDonor,
    deleteSOS: deleteSOS,
    getState: getState
  };

  // ==========================================
  // 23. SETUP ALL EVENT LISTENERS
  // ==========================================
  function setupAllEventListeners() {
    setupNavigation();
    setupSearchEventListeners();
    setupEmergencyModal();
    setupBookingModal();
    setupContactDonorModal();
    setupAddHospitalModal();
    setupDonorRegistration();
    setupDashboardEventListeners();
    setupEmergencyFilters();
  }

  // ==========================================
  // 24. INITIALIZE
  // ==========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setupAllEventListeners();
      initApp();
    });
  } else {
    setupAllEventListeners();
    initApp();
  }

})(); A bin minus rest five happens for anti grives of localstudy that she loves a two for real server supervisor