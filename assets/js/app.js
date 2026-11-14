/**
 * Bangladesh-Rivers-Geo-Vault Client Application
 * Author: Mohammad Golamrabbii (মোহাম্মদ গোলাম রাব্বী)
 * Geospatial Archivist & Civic Tech Innovator
 */

(function () {
  'use strict';

  // Global State
  let allRivers = [];
  let filteredRivers = [];
  let bcsQuestions = [];
  let summaryData = {};

  // Leaflet Map State
  let map = null;
  let riverLayerGroup = null;
  let activeSatellite = false;
  let streetLayer = null;
  let satelliteLayer = null;
  let highlightedPolyline = null;

  // Filter States
  let searchQuery = '';
  let selectedBasin = 'all';
  let selectedDivision = 'all';
  let selectedTransboundary = 'all';
  let selectedStatus = 'all';

  // DOM Elements
  const riverMapElement = document.getElementById('riverMap');
  const toggleLayerBtn = document.getElementById('toggleLayerBtn');
  const resetMapBtn = document.getElementById('resetMapBtn');
  const selectedRiverText = document.getElementById('selectedRiverText');
  const riverSearchInput = document.getElementById('riverSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const filterBasin = document.getElementById('filterBasin');
  const filterDivision = document.getElementById('filterDivision');
  const filterTransboundary = document.getElementById('filterTransboundary');
  const filterStatus = document.getElementById('filterStatus');
  const riverCountText = document.getElementById('riverCountText');
  const riversGrid = document.getElementById('riversGrid');
  const noResultsState = document.getElementById('noResultsState');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const bcsAccordion = document.getElementById('bcsAccordion');
  const bcsSearchInput = document.getElementById('bcsSearchInput');
  const riverModal = document.getElementById('riverModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBody = document.getElementById('modalBody');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const themeToggle = document.getElementById('themeToggle');

  // Initialize
  async function init() {
    loadTheme();
    setupData();
    setupEventListeners();
    initMap();
    renderRivers();
    renderBCSQuestions();
  }

  // Load Theme
  function loadTheme() {
    const savedTheme = localStorage.getItem('bd_rivers_theme') || 'dark';
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  }

  function toggleTheme() {
    if (document.documentElement.classList.contains('light')) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('bd_rivers_theme', 'dark');
      themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('bd_rivers_theme', 'light');
      themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
  }

  // Setup Data
  function setupData() {
    if (window.BD_RIVERS_DATA && window.BD_RIVERS_DATA.length > 0) {
      allRivers = window.BD_RIVERS_DATA;
      bcsQuestions = window.BD_RIVERS_BCS_QA || [];
      summaryData = window.BD_RIVERS_SUMMARY || {};
    }
    filteredRivers = [...allRivers];
  }

  // Initialize Leaflet Map
  function initMap() {
    if (!riverMapElement || typeof L === 'undefined') return;

    // Center on Bangladesh
    map = L.map('riverMap', {
      center: [23.6850, 90.3563],
      zoom: 7,
      minZoom: 6,
      maxZoom: 16
    });

    // Street / Carto Dark tile layer
    streetLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    });

    // Satellite Imagery Layer (Esri)
    satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18
    });

    // Default layer
    streetLayer.addTo(map);

    // Layer group for rivers
    riverLayerGroup = L.layerGroup().addTo(map);

    // Render river lines on map
    renderMapRivers();
  }

  // Render River Polylines on Map
  function renderMapRivers() {
    if (!map || !riverLayerGroup) return;
    riverLayerGroup.clearLayers();

    // Limit initial map paths to top 150 rivers for crisp 60fps performance
    const mapSelection = filteredRivers.slice(0, 150);

    mapSelection.forEach(river => {
      if (!river.coords || river.coords.length < 2) return;

      let lineColor = '#06b6d4';
      if (river.status === 'দখল ও দূষণে বিপন্ন') lineColor = '#f43f5e';
      else if (river.status === 'নাব্যতাহীন ও ভরাট') lineColor = '#f59e0b';
      else if (river.status === 'মৌসুমি') lineColor = '#8b5cf6';

      const polyline = L.polyline(river.coords, {
        color: lineColor,
        weight: river.length_km > 100 ? 4 : 2.5,
        opacity: 0.85,
        lineCap: 'round'
      });

      polyline.bindTooltip(`<strong>${river.name_bn}</strong> (${river.length_km} কিমি)`, {
        sticky: true,
        className: 'custom-map-tooltip'
      });

      polyline.on('click', () => {
        highlightRiver(river, polyline);
        openRiverModal(river);
      });

      polyline.on('mouseover', () => {
        polyline.setStyle({ weight: 6, opacity: 1 });
      });

      polyline.on('mouseout', () => {
        if (highlightedPolyline !== polyline) {
          polyline.setStyle({ weight: river.length_km > 100 ? 4 : 2.5, opacity: 0.85 });
        }
      });

      polyline.addTo(riverLayerGroup);
    });
  }

  // Highlight river on map
  function highlightRiver(river, polyline) {
    if (highlightedPolyline) {
      highlightedPolyline.setStyle({ weight: 3, opacity: 0.85 });
    }
    highlightedPolyline = polyline;
    if (polyline) {
      polyline.setStyle({ weight: 7, color: '#38bdf8', opacity: 1 });
      map.fitBounds(polyline.getBounds(), { padding: [50, 50], maxZoom: 11 });
    } else if (river.coords && river.coords.length > 0) {
      map.setView(river.coords[0], 10);
    }
    selectedRiverText.textContent = `${river.name_bn} (${river.length_km} কিমি &bull; ${river.basin})`;
  }

  // Event Listeners
  function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);

    // Map satellite toggle
    toggleLayerBtn.addEventListener('click', () => {
      activeSatellite = !activeSatellite;
      if (activeSatellite) {
        map.removeLayer(streetLayer);
        satelliteLayer.addTo(map);
        toggleLayerBtn.innerHTML = '<i class="fa-solid fa-map"></i> সাধারণ মানচিত্র';
      } else {
        map.removeLayer(satelliteLayer);
        streetLayer.addTo(map);
        toggleLayerBtn.innerHTML = '<i class="fa-solid fa-layer-group"></i> স্যাটেলাইট মোড';
      }
    });

    // Reset map view
    resetMapBtn.addEventListener('click', () => {
      map.setView([23.6850, 90.3563], 7);
      selectedRiverText.textContent = 'বাংলাদেশ সামগ্রিক ভিউ';
    });

    // Search input
    riverSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      clearSearchBtn.classList.toggle('hidden', searchQuery.length === 0);
      applyFilters();
    });

    clearSearchBtn.addEventListener('click', () => {
      riverSearchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      applyFilters();
    });

    // Dropdown filters
    filterBasin.addEventListener('change', (e) => {
      selectedBasin = e.target.value;
      applyFilters();
    });

    filterDivision.addEventListener('change', (e) => {
      selectedDivision = e.target.value;
      applyFilters();
    });

    filterTransboundary.addEventListener('change', (e) => {
      selectedTransboundary = e.target.value;
      applyFilters();
    });

    filterStatus.addEventListener('change', (e) => {
      selectedStatus = e.target.value;
      applyFilters();
    });

    resetFiltersBtn.addEventListener('click', resetAllFilters);

    // Quick filter chips
    document.querySelectorAll('.quick-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const type = chip.getAttribute('data-filter');
        document.querySelectorAll('.quick-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        if (type === 'transboundary') {
          filterTransboundary.value = 'yes';
          selectedTransboundary = 'yes';
        } else if (type === 'endangered') {
          filterStatus.value = 'দখল ও দূষণে বিপন্ন';
          selectedStatus = 'দখল ও দূষণে বিপন্ন';
        } else if (type === 'top10') {
          filteredRivers = [...allRivers].sort((a, b) => b.length_km - a.length_km).slice(0, 15);
          renderRivers();
          renderMapRivers();
          updateCount();
          return;
        }
        applyFilters();
      });
    });

    // BCS Search
    bcsSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      document.querySelectorAll('.bcs-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? 'block' : 'none';
      });
    });

    // Modal close
    modalCloseBtn.addEventListener('click', closeRiverModal);
    riverModal.addEventListener('click', (e) => {
      if (e.target === riverModal) closeRiverModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !riverModal.classList.contains('hidden')) {
        closeRiverModal();
      }
    });

    // Copy links
    document.querySelectorAll('.copy-link-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const fullUrl = window.location.origin + window.location.pathname.replace(/\/$/, '') + '/' + btn.getAttribute('data-url');
        navigator.clipboard.writeText(fullUrl);
        showToast('ডাউনলোড লিংক কপি হয়েছে!');
      });
    });
  }

  // Apply filters
  function applyFilters() {
    filteredRivers = allRivers.filter(r => {
      if (selectedBasin !== 'all' && r.basin !== selectedBasin) return false;
      if (selectedDivision !== 'all' && !r.divisions.includes(selectedDivision)) return false;
      if (selectedTransboundary === 'yes' && !r.transboundary) return false;
      if (selectedTransboundary === 'no' && r.transboundary) return false;
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;

      if (searchQuery) {
        const q = searchQuery;
        const matchNameBn = r.name_bn.toLowerCase().includes(q);
        const matchNameEn = r.name_en.toLowerCase().includes(q);
        const matchOrigin = r.origin_bn.toLowerCase().includes(q);
        const matchFlow = r.flow_path.toLowerCase().includes(q);
        const matchDist = r.districts.some(d => d.toLowerCase().includes(q));
        const matchBasin = r.basin.toLowerCase().includes(q);

        if (!matchNameBn && !matchNameEn && !matchOrigin && !matchFlow && !matchDist && !matchBasin) {
          return false;
        }
      }

      return true;
    });

    renderRivers();
    renderMapRivers();
    updateCount();
  }

  function resetAllFilters() {
    searchQuery = '';
    selectedBasin = 'all';
    selectedDivision = 'all';
    selectedTransboundary = 'all';
    selectedStatus = 'all';

    riverSearchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    filterBasin.value = 'all';
    filterDivision.value = 'all';
    filterTransboundary.value = 'all';
    filterStatus.value = 'all';
    document.querySelectorAll('.quick-filter-chip').forEach(c => c.classList.remove('active'));

    applyFilters();
  }

  function updateCount() {
    riverCountText.innerHTML = `প্রদর্শিত হচ্ছে: <strong>${filteredRivers.length}</strong> টি নদ-নদী (সর্বমোট: ${allRivers.length})`;
    noResultsState.classList.toggle('hidden', filteredRivers.length > 0);
    riversGrid.classList.toggle('hidden', filteredRivers.length === 0);
  }

  // Render Rivers Grid
  function renderRivers() {
    riversGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    filteredRivers.slice(0, 120).forEach(r => {
      const card = document.createElement('div');
      card.className = 'river-card';
      const statusClass = `status-${r.status.replace(/\s+/g, '-')}`;

      card.innerHTML = `
        <div class="river-card-header">
          <h4 class="river-name">${r.name_bn} <small style="font-size:0.75rem; color:var(--text-muted);">(${r.name_en})</small></h4>
          <span class="river-id">${r.id}</span>
        </div>

        <span class="status-badge ${statusClass}">${r.status}</span>

        <div class="river-info-row">
          <strong>দৈর্ঘ্য:</strong> ${r.length_km} কিলোমিটার
        </div>
        <div class="river-info-row">
          <strong>অববাহিকা:</strong> ${r.basin}
        </div>
        <div class="river-info-row">
          <strong>উৎপত্তি:</strong> ${r.origin_bn}
        </div>
        <div class="river-info-row">
          <strong>পতন/মোহনা:</strong> ${r.outfall_bn}
        </div>

        ${r.transboundary ? `<div class="transboundary-tag"><i class="fa-solid fa-earth-americas"></i> অভিন্ন নদী (${r.transboundary_country})</div>` : ''}
      `;

      card.addEventListener('click', () => {
        highlightRiver(r, null);
        openRiverModal(r);
      });

      fragment.appendChild(card);
    });

    riversGrid.appendChild(fragment);
  }

  // Open River Detail Modal
  function openRiverModal(r) {
    const statusClass = `status-${r.status.replace(/\s+/g, '-')}`;

    modalBody.innerHTML = `
      <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px;">
        <span class="status-badge ${statusClass}" style="float: right;">${r.status}</span>
        <h3 style="font-size: 1.5rem; font-weight: 800;">${r.name_bn} <small style="font-size: 0.9rem; color: var(--text-muted);">(${r.name_en})</small></h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">${r.basin} &bull; ${r.length_km} কিমি &bull; ${r.id}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin-bottom: 20px;">
        <div style="background: var(--bg-input); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">উৎপত্তি স্থল</div>
          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.92rem;">${r.origin_bn}</div>
        </div>

        <div style="background: var(--bg-input); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">পতন / মোহনা</div>
          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.92rem;">${r.outfall_bn}</div>
        </div>

        <div style="background: var(--bg-input); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">প্রবাহ সংশ্লিষ্ট জেলাসমূহ</div>
          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.92rem;">${r.districts.join(', ')}</div>
        </div>

        <div style="background: var(--bg-input); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.75rem; color: var(--text-muted);">আন্তর্জাতিক সীমানা স্থিতি</div>
          <div style="font-weight: 600; color: #06b6d4; font-size: 0.92rem;">${r.transboundary ? `অভিন্ন নদী (${r.transboundary_country})` : 'অভ্যন্তরীণ নদী (Indigenous)'}</div>
        </div>
      </div>

      <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; margin-bottom: 20px;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #fbbf24; margin-bottom: 6px;"><i class="fa-solid fa-graduation-cap"></i> বিসিএস ও ঐতিহাসিক তথ্য কণিকা:</h4>
        <p style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.6;">${r.historical_bcs_significance || r.description}</p>
      </div>

      <div style="background: var(--bg-input); padding: 14px 18px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 22px;">
        <h5 style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">প্রবাহ পথ বিস্তারিত:</h5>
        <p style="font-size: 0.9rem; color: var(--text-secondary);">${r.flow_path}</p>
      </div>

      <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        <button class="btn btn-primary btn-sm modal-zoom-map-btn">
          <i class="fa-solid fa-crosshairs"></i> মানচিত্রে জুম করুন
        </button>
        <button class="btn btn-secondary btn-sm modal-copy-data-btn">
          <i class="fa-solid fa-copy"></i> তথ্য কপি করুন
        </button>
      </div>
    `;

    modalBody.querySelector('.modal-zoom-map-btn').addEventListener('click', () => {
      closeRiverModal();
      highlightRiver(r, null);
      document.getElementById('mapSection').scrollIntoView({ behavior: 'smooth' });
    });

    modalBody.querySelector('.modal-copy-data-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(JSON.stringify(r, null, 2));
      showToast('নদীর বিস্তারিত JSON কপি হয়েছে!');
    });

    riverModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeRiverModal() {
    riverModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Render BCS Q&A Accordion
  function renderBCSQuestions() {
    bcsAccordion.innerHTML = '';
    const fragment = document.createDocumentFragment();

    bcsQuestions.forEach((item, idx) => {
      const bcsItem = document.createElement('div');
      bcsItem.className = 'bcs-item';

      bcsItem.innerHTML = `
        <div class="bcs-header">
          <div style="display: flex; align-items: center;">
            <span class="bcs-cat-badge">${item.category}</span>
            <span class="bcs-q-text">${idx + 1}. ${item.question}</span>
          </div>
          <i class="fa-solid fa-chevron-down" style="color: var(--text-muted); transition: transform 0.2s;"></i>
        </div>
        <div class="bcs-body">
          <div class="bcs-answer-box">
            উত্তর: ${item.answer}
          </div>
          <div class="bcs-explanation">
            <strong>ব্যাখ্যা:</strong> ${item.explanation}
          </div>
        </div>
      `;

      const header = bcsItem.querySelector('.bcs-header');
      const body = bcsItem.querySelector('.bcs-body');
      const chevron = bcsItem.querySelector('.fa-chevron-down');

      header.addEventListener('click', () => {
        const isOpen = body.classList.contains('open');
        body.classList.toggle('open', !isOpen);
        chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
      });

      fragment.appendChild(bcsItem);
    });

    bcsAccordion.appendChild(fragment);
  }

  // Toast Notification
  let toastTimeout;
  function showToast(msg) {
    clearTimeout(toastTimeout);
    toastMessage.textContent = msg;
    toast.classList.remove('hidden');
    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
