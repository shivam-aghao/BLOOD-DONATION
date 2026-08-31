/**
 * ===================================================================
 * BloodConnect - Full Functional Client-Side Application with API Backend
 * ===================================================================
 */

(function () {
  'use strict';

  // ==========================================
  // 0. API CONFIGURATION
  // ==========================================
  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  
  // API Endpoints
  const API_ENDPOINTS = {
    HOSPITALS: `${API_BASE_URL}/hospitals`,
    DONORS: `${API_BASE_URL}/donors`,
    SOS_REQUESTS: `${API_BASE_URL}/sos-requests`,
    BOOKINGS: `${API_BASE_URL}/bookings`,
    AUTH: `${API_BASE_URL}/auth`,
    STATS: `${API_BASE_URL}/stats`
  };

  // ==========================================
  // 1. DATA STORAGE & SEED INITIALIZATION
  // ==========================================
  const STORAGE_KEYS = {
    HOSPITALS: 'bc_hospitals_data',
    DONORS: 'bc_donors_data',
    SOS_REQUESTS: 'bc_sos_requests',
    BOOKINGS: 'bc_patient_bookings',
    CURRENT_HOSPITAL: 'bc_active_hospital_id',
    AUTH_TOKEN: 'bc_auth_token',
    USER: 'bc_user'
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

  // ==========================================
  // 2. API SERVICE LAYER
  // ==========================================
  const ApiService = {
    // Auth token management
    getAuthToken() {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    },

    setAuthToken(token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    },

    clearAuthToken() {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    },

    getHeaders() {
      const token = this.getAuthToken();
      return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
    },

    // Generic request handler
    async request(endpoint, options = {}) {
      try {
        const response = await fetch(endpoint, {
          ...options,
          headers: {
            ...this.getHeaders(),
            ...options.headers
          }
        });

        // Handle token expiration
        if (response.status === 401) {
          this.clearAuthToken();
          showToast('Session expired. Please log in again.', 'error');
          // Redirect to login if we have a login page
          // window.location.href = '/login.html';
          return null;
        }

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
      } catch (error) {
        console.error('API request failed:', error);
        showToast(error.message || 'Network error. Please check your connection.', 'error');
        throw error;
      }
    },

    // GET request
    async get(endpoint, params = {}) {
      const url = new URL(endpoint);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          url.searchParams.append(key, params[key]);
        }
      });
      return this.request(url.toString(), { method: 'GET' });
    },

    // POST request
    async post(endpoint, data) {
      return this.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },

    // PUT request
    async put(endpoint, data) {
      return this.request(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },

    // PATCH request
    async patch(endpoint, data) {
      return this.request(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    },

    // DELETE request
    async delete(endpoint) {
      return this.request(endpoint, { method: 'DELETE' });
    },

    // ==========================================
    // 3. SPECIFIC API METHODS
    // ==========================================

    // Auth
    async login(email, password) {
      const response = await this.post(`${API_ENDPOINTS.AUTH}/login`, { email, password });
      if (response && response.token) {
        this.setAuthToken(response.token);
        if (response.user) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        }
      }
      return response;
    },

    async logout() {
      try {
        await this.post(`${API_ENDPOINTS.AUTH}/logout`, {});
      } catch (e) {
        // Ignore logout errors
      }
      this.clearAuthToken();
      localStorage.removeItem(STORAGE_KEYS.USER);
    },

    async register(userData) {
      return this.post(`${API_ENDPOINTS.AUTH}/register`, userData);
    },

    async getCurrentUser() {
      return this.get(`${API_ENDPOINTS.AUTH}/me`);
    },

    // Hospitals
    async getHospitals(params = {}) {
      return this.get(API_ENDPOINTS.HOSPITALS, params);
    },

    async getHospital(id) {
      return this.get(`${API_ENDPOINTS.HOSPITALS}/${id}`);
    },

    async createHospital(data) {
      return this.post(API_ENDPOINTS.HOSPITALS, data);
    },

    async updateHospital(id, data) {
      return this.put(`${API_ENDPOINTS.HOSPITALS}/${id}`, data);
    },

    async deleteHospital(id) {
      return this.delete(`${API_ENDPOINTS.HOSPITALS}/${id}`);
    },

    async updateHospitalInventory(id, inventory) {
      return this.patch(`${API_ENDPOINTS.HOSPITALS}/${id}/inventory`, { inventory });
    },

    // Donors
    async getDonors(params = {}) {
      return this.get(API_ENDPOINTS.DONORS, params);
    },

    async getDonor(id) {
      return this.get(`${API_ENDPOINTS.DONORS}/${id}`);
    },

    async createDonor(data) {
      return this.post(API_ENDPOINTS.DONORS, data);
    },

    async updateDonor(id, data) {
      return this.put(`${API_ENDPOINTS.DONORS}/${id}`, data);
    },

    async deleteDonor(id) {
      return this.delete(`${API_ENDPOINTS.DONORS}/${id}`);
    },

    // SOS Requests
    async getSosRequests(params = {}) {
      return this.get(API_ENDPOINTS.SOS_REQUESTS, params);
    },

    async createSosRequest(data) {
      return this.post(API_ENDPOINTS.SOS_REQUESTS, data);
    },

    async updateSosRequest(id, data) {
      return this.patch(`${API_ENDPOINTS.SOS_REQUESTS}/${id}`, data);
    },

    async deleteSosRequest(id) {
      return this.delete(`${API_ENDPOINTS.SOS_REQUESTS}/${id}`);
    },

    // Bookings
    async getBookings(params = {}) {
      return this.get(API_ENDPOINTS.BOOKINGS, params);
    },

    async createBooking(data) {
      return this.post(API_ENDPOINTS.BOOKINGS, data);
    },

    async updateBooking(id, data) {
      return this.patch(`${API_ENDPOINTS.BOOKINGS}/${id}`, data);
    },

    async deleteBooking(id) {
      return this.delete(`${API_ENDPOINTS.BOOKINGS}/${id}`);
    },

    // Stats
    async getStats() {
      return this.get(API_ENDPOINTS.STATS);
    }
  };

  // ==========================================
  // 4. STORAGE HELPERS (Fallback)
  // ==========================================
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

  // ==========================================
  // 5. DATA LOADING WITH API FALLBACK
  // ==========================================
  let hospitals = [];
  let donors = [];
  let sosRequests = [];
  let patientBookings = [];
  let activeHospitalId = getStored(STORAGE_KEYS.CURRENT_HOSPITAL, 'hosp-1');

  // Seed data (fallback)
  const SEED_HOSPITALS = [
    {
      id: 'hosp-1',
      name: 'City General Hospital & Trauma Center',
      city: 'New York',
      address: '420 East 70th Street, Manhattan',
      contact: '+1 (212) 555-0199',
      email: 'bloodbank@citygeneral.org',
      operatingHours: '24/7 Emergency Blood Bank',
      inventory: { 'A+': 14, 'A-': 4, 'B+': 9, 'B-': 2, 'AB+': 6, 'AB-': 3, 'O+': 22, 'O-': 5 },
      lastUpdated: new Date().toISOString()
    },
    // ... (rest of seed hospitals)
  ];

  const SEED_DONORS = [
    // ... (seed donors from original)
  ];

  const SEED_SOS = [
    // ... (seed SOS from original)
  ];

  // Load data from API
  async function loadData() {
    try {
      showToast('Loading data from server...', 'info', 2000);
      
      // Load hospitals
      try {
        const hospData = await ApiService.getHospitals();
        if (hospData && hospData.data) {
          hospitals = hospData.data;
          setStored(STORAGE_KEYS.HOSPITALS, hospitals);
        }
      } catch (e) {
        console.warn('Failed to load hospitals from API, using fallback');
        hospitals = getStored(STORAGE_KEYS.HOSPITALS, SEED_HOSPITALS);
      }

      // Load donors
      try {
        const donorData = await ApiService.getDonors();
        if (donorData && donorData.data) {
          donors = donorData.data;
          setStored(STORAGE_KEYS.DONORS, donors);
        }
      } catch (e) {
        console.warn('Failed to load donors from API, using fallback');
        donors = getStored(STORAGE_KEYS.DONORS, SEED_DONORS);
      }

      // Load SOS requests
      try {
        const sosData = await ApiService.getSosRequests();
        if (sosData && sosData.data) {
          sosRequests = sosData.data;
          setStored(STORAGE_KEYS.SOS_REQUESTS, sosRequests);
        }
      } catch (e) {
        console.warn('Failed to load SOS from API, using fallback');
        sosRequests = getStored(STORAGE_KEYS.SOS_REQUESTS, SEED_SOS);
      }

      // Load bookings
      try {
        const bookingData = await ApiService.getBookings();
        if (bookingData && bookingData.data) {
          patientBookings = bookingData.data;
          setStored(STORAGE_KEYS.BOOKINGS, patientBookings);
        }
      } catch (e) {
        console.warn('Failed to load bookings from API, using fallback');
        patientBookings = getStored(STORAGE_KEYS.BOOKINGS, []);
      }

      // If no data in localStorage, save the loaded data
      if (!localStorage.getItem(STORAGE_KEYS.HOSPITALS)) {
        setStored(STORAGE_KEYS.HOSPITALS, hospitals);
      }
      if (!localStorage.getItem(STORAGE_KEYS.DONORS)) {
        setStored(STORAGE_KEYS.DONORS, donors);
      }
      if (!localStorage.getItem(STORAGE_KEYS.SOS_REQUESTS)) {
        setStored(STORAGE_KEYS.SOS_REQUESTS, sosRequests);
      }
      if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
        setStored(STORAGE_KEYS.BOOKINGS, patientBookings);
      }

      activeHospitalId = getStored(STORAGE_KEYS.CURRENT_HOSPITAL, hospitals[0]?.id || 'hosp-1');
      
      showToast('Data loaded successfully!', 'success', 2000);
    } catch (error) {
      console.error('Error loading data:', error);
      // Load from localStorage as fallback
      hospitals = getStored(STORAGE_KEYS.HOSPITALS, SEED_HOSPITALS);
      donors = getStored(STORAGE_KEYS.DONORS, SEED_DONORS);
      sosRequests = getStored(STORAGE_KEYS.SOS_REQUESTS, SEED_SOS);
      patientBookings = getStored(STORAGE_KEYS.BOOKINGS, []);
      activeHospitalId = getStored(STORAGE_KEYS.CURRENT_HOSPITAL, hospitals[0]?.id || 'hosp-1');
      showToast('Using offline data. Server may be unavailable.', 'warning', 3000);
    }
  }

  // ==========================================
  // 6. SYNC DATA TO API
  // ==========================================
  async function syncHospitalToAPI(hospital) {
    try {
      if (hospital.id && !hospital.id.startsWith('hosp-')) {
        // This is a server ID, update it
        await ApiService.updateHospital(hospital.id, hospital);
      } else {
        // This is a local ID, create new on server
        const response = await ApiService.createHospital(hospital);
        if (response && response.data && response.data.id) {
          // Update local with server ID
          const index = hospitals.findIndex(h => h.id === hospital.id);
          if (index !== -1) {
            hospitals[index].id = response.data.id;
            hospitals[index]._synced = true;
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to sync hospital:', error);
      return false;
    }
  }

  async function syncDonorToAPI(donor) {
    try {
      if (donor.id && !donor.id.startsWith('BC-')) {
        await ApiService.updateDonor(donor.id, donor);
      } else {
        const response = await ApiService.createDonor(donor);
        if (response && response.data && response.data.id) {
          const index = donors.findIndex(d => d.id === donor.id);
          if (index !== -1) {
            donors[index].id = response.data.id;
            donors[index]._synced = true;
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to sync donor:', error);
      return false;
    }
  }

  async function syncSosToAPI(sos) {
    try {
      if (sos.id && !sos.id.startsWith('SOS-')) {
        await ApiService.updateSosRequest(sos.id, sos);
      } else {
        const response = await ApiService.createSosRequest(sos);
        if (response && response.data && response.data.id) {
          const index = sosRequests.findIndex(s => s.id === sos.id);
          if (index !== -1) {
            sosRequests[index].id = response.data.id;
            sosRequests[index]._synced = true;
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to sync SOS:', error);
      return false;
    }
  }

  async function syncBookingToAPI(booking) {
    try {
      if (booking.id && !booking.id.startsWith('BK-')) {
        await ApiService.updateBooking(booking.id, booking);
      } else {
        const response = await ApiService.createBooking(booking);
        if (response && response.data && response.data.id) {
          const index = patientBookings.findIndex(b => b.id === booking.id);
          if (index !== -1) {
            patientBookings[index].id = response.data.id;
            patientBookings[index]._synced = true;
          }
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to sync booking:', error);
      return false;
    }
  }

  // ==========================================
  // 7. UI UTILITIES (TOASTS, FORMATTERS, STATUS)
  // ==========================================
  function showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) {
      // Fallback alert if toast container doesn't exist
      console.log(`[${type}] ${message}`);
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
  // 8. NAVIGATION & ROUTING
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

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('tab-active', link.dataset.page === pageId);
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

  // ==========================================
  // 9. HERO STATS
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
  // 10. PAGE 1: FIND BLOOD
  // ==========================================
  let currentSearchTab = 'hospitals';

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

    const compatibleGroups = COMPATIBILITY[selectedGroup]?.receive || [selectedGroup];
    const targetGroups = includeCompatible ? compatibleGroups : [selectedGroup];

    if (activeFilterDisplay) {
      activeFilterDisplay.innerHTML = `
        <span class="filter-badge"><i class="fas fa-droplet"></i> Target: ${selectedGroup}</span>
        <span class="filter-badge"><i class="fas fa-location-dot"></i> City: ${cityQuery === '' || cityQuery === 'all' ? 'All Cities' : cityQuery}</span>
        ${includeCompatible ? `<span class="filter-badge"><i class="fas fa-arrows-split-up-and-left"></i> Compatible: ${compatibleGroups.join(', ')}</span>` : ''}
      `;
    }

    let filteredHospitals = hospitals.filter(h => {
      if (cityQuery !== '' && cityQuery !== 'all') {
        const matchesCity = h.city.toLowerCase().includes(cityQuery) || h.address.toLowerCase().includes(cityQuery);
        if (!matchesCity) return false;
      }
      return true;
    });

    let filteredDonors = donors.filter(d => {
      if (cityQuery !== '' && cityQuery !== 'all') {
        const matchesCity = d.city.toLowerCase().includes(cityQuery) || (d.address && d.address.toLowerCase().includes(cityQuery));
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
          <button class="btn-emergency" onclick="document.getElementById('openEmergencyModalBtn').click()"><i class="fas fa-bullhorn"></i> Post Urgent SOS Request</button>
        </div>
      `;
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
      container.querySelectorAll('[data-page]').forEach(b => {
        b.addEventListener('click', () => showPage('donor'));
      });
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
  // 11. COMPATIBILITY WIDGET
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
  // 12. PAGE 2: EMERGENCY SOS
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

  document.querySelectorAll('.emergency-filter-bar .filter-chip').forEach(chip => {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.emergency-filter-bar .filter-chip').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const status = this.dataset.status;
      renderEmergencyFeed(status);
    });
  });

  // ==========================================
  // 13. PAGE 3: DASHBOARD
  // ==========================================
  function renderHospitalDashboard() {
    const select = document.getElementById('hospitalSelect');
    const grid = document.getElementById('inventoryGrid');
    const requestsQueue = document.getElementById('hospitalRequestsQueue');
    const requestsCountBadge = document.getElementById('incomingRequestsCount');

    if (!select || !grid) return;

    select.innerHTML = hospitals.map(h => `<option value="${h.id}" ${h.id === activeHospitalId ? 'selected' : ''}>${h.name} (${h.city})</option>`).join('');

    const currentHosp = hospitals.find(h => h.id === activeHospitalId) || hospitals[0];
    if (!currentHosp) return;

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
            <button onclick="window.BloodConnectApp.changeStock('${group}', 1)" title="Add 1 unit">+</button>
            <button onclick="window.BloodConnectApp.changeStock('${group}', -1)" title="Remove 1 unit">−</button>
            <button onclick="window.BloodConnectApp.changeStock('${group}', 0, true)" title="Set to 0 (Out of stock)">✕</button>
          </div>
        </div>
      `;
    }).join('');

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

  const hospitalSelect = document.getElementById('hospitalSelect');
  if (hospitalSelect) {
    hospitalSelect.addEventListener('change', function () {
      activeHospitalId = this.value;
      setStored(STORAGE_KEYS.CURRENT_HOSPITAL, activeHospitalId);
      renderHospitalDashboard();
      showToast('Switched active hospital view', 'info');
    });
  }

  const hospitalInfoForm = document.getElementById('hospitalInfoForm');
  if (hospitalInfoForm) {
    hospitalInfoForm.addEventListener('submit', async function (e) {
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
      
      // Sync to API
      await syncHospitalToAPI(currentHosp);
      
      renderHospitalDashboard();
      updateHeroStats();
      showToast('Hospital profile updated successfully!', 'success');
    });
  }

  const saveInventoryBtn = document.getElementById('saveInventoryBtn');
  if (saveInventoryBtn) {
    saveInventoryBtn.addEventListener('click', async () => {
      const currentHosp = hospitals.find(h => h.id === activeHospitalId);
      if (currentHosp) {
        await syncHospitalToAPI(currentHosp);
      }
      setStored(STORAGE_KEYS.HOSPITALS, hospitals);
      updateHeroStats();
      showToast('Blood stock inventory saved to database!', 'success');
    });
  }

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
  // 14. PAGE 4: DONOR REGISTRATION
  // ==========================================
  const donorRegistrationForm = document.getElementById('donorRegistrationForm');
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

      const newDonor = {
        id: 'BC-' + Math.floor(10000 + Math.random() * 90000),
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

      // Sync to API
      await syncDonorToAPI(newDonor);

      updateDonorCardDisplay(newDonor);
      updateHeroStats();

      showToast(`Thank you ${fullName}! You are registered as a Lifesaver.`, 'success', 5000);
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
  // 15. MODALS
  // ==========================================
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

      // Sync to API
      await syncSosToAPI(newSos);

      closeEmergencyModal();
      emergencyRequestForm.reset();

      showToast(`🚨 SOS Broadcasted for ${patientName} (${bloodGroup})!`, 'error', 6000);
      showPage('emergency');
    });
  }

  // Booking Modal
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

      // Sync to API
      await syncBookingToAPI(newBooking);

      closeBookingModal();
      bloodBookingForm.reset();

      showToast(`Booking reference #${newBooking.id} submitted to ${hospitalName}!`, 'success', 5000);
    });
  }

  // Contact Donor Modal
  const contactDonorModal = document.getElementById('contactDonorModal');
  const closeContactDonorBtn = document.getElementById('closeContactDonorBtn');

  function closeContactDonorModal() {
    if (contactDonorModal) contactDonorModal.classList.add('hidden');
  }

  if (closeContactDonorBtn) closeContactDonorBtn.addEventListener('click', closeContactDonorModal);

  // Add Hospital Modal
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
        lastUpdated: new Date().toISOString()
      };

      hospitals.push(newHospital);
      setStored(STORAGE_KEYS.HOSPITALS, hospitals);

      // Sync to API
      await syncHospitalToAPI(newHospital);

      activeHospitalId = newHospital.id;
      setStored(STORAGE_KEYS.CURRENT_HOSPITAL, activeHospitalId);

      closeAddHospitalModal();
      addHospitalForm.reset();

      renderHospitalDashboard();
      updateHeroStats();

      showToast(`Registered "${name}" successfully!`, 'success');
    });
  }

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', function (e) {
      if (e.target === this) {
        this.classList.add('hidden');
      }
    });
  });

  // ==========================================
  // 16. GLOBAL INTERACTION HANDLERS
  // ==========================================
  window.BloodConnectApp = {
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

    async fulfillHospitalBooking(bookingId) {
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
        
        // Sync inventory to API
        await syncHospitalToAPI(currentHosp);
      }

      booking.status = 'fulfilled';
      setStored(STORAGE_KEYS.BOOKINGS, patientBookings);
      
      // Sync booking to API
      await syncBookingToAPI(booking);

      renderHospitalDashboard();
      updateHeroStats();
      showToast(`Booking #${booking.id} dispatched! Stock updated.`, 'success');
    },

    removeHospitalBooking(bookingId) {
      patientBookings = patientBookings.filter(b => b.id !== bookingId);
      setStored(STORAGE_KEYS.BOOKINGS, patientBookings);
      renderHospitalDashboard();
      showToast('Booking dismissed', 'info');
    },

    respondToSos(sosId) {
      const req = sosRequests.find(s => s.id === sosId);
      if (!req) return;

      showToast(`Connecting to ${req.contactName} at ${req.hospital}...`, 'info');
      setTimeout(() => {
        window.location.href = `tel:${req.contactPhone}`;
      }, 500);
    },

    async toggleFulfillSos(sosId) {
      const req = sosRequests.find(s => s.id === sosId);
      if (!req) return;

      req.status = req.status === 'open' ? 'fulfilled' : 'open';
      setStored(STORAGE_KEYS.SOS_REQUESTS, sosRequests);
      
      // Sync to API
      await syncSosToAPI(req);
      
      renderEmergencyFeed('all');
      showToast(`SOS #${req.id} marked as ${req.status === 'fulfilled' ? 'Fulfilled' : 'Open'}`, 'success');
    },

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
    },

    // API Service exposed for debugging
    api: ApiService,

    // Refresh data from API
    async refreshData() {
      await loadData();
      performSearch();
      renderEmergencyFeed('all');
      renderHospitalDashboard();
      updateHeroStats();
      showToast('Data refreshed from server!', 'success');
    }
  };

  // ==========================================
  // 17. BOOTSTRAP APPLICATION
  // ==========================================
  async function initApp() {
    // Load data from API
    await loadData();
    
    updateHeroStats();
    initCompatibilityWidget();
    performSearch();
    renderHospitalDashboard();

    if (donors.length > 0) {
      updateDonorCardDisplay(donors[0]);
    }

    showPage('find');

    // Add refresh button to nav if needed
    // You can add a refresh button in your HTML
  }

  // Add refresh button event listener if it exists
  document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        window.BloodConnectApp.refreshData();
      });
    }
  });

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();