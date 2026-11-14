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

  // Initialize
  function init() {
    loadTheme();
    setupData();
    setupEventListeners();
    initMap();
    renderRivers();
    renderBCSQuestions();
    updateCount();
  }

  // Load & Apply Theme
  function loadTheme() {
    const savedTheme = localStorage.getItem('bd_rivers_theme') || 'dark';
    applyTheme(savedTheme);
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
      updateThemeButtons('<i class="fa-solid fa-sun"></i>');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      updateThemeButtons('<i class="fa-solid fa-moon"></i>');
    }
  }

  function updateThemeButtons(html) {
    const btn1 = document.getElementById('themeToggle');
    const btn2 = document.getElementById('themeToggleBtn');
    if (btn1) btn1.innerHTML = html;
    if (btn2) btn2.innerHTML = html;
  }

  function toggleTheme() {
    const isLight = document.documentElement.classList.contains('light');
    const newTheme = isLight ? 'dark' : 'light';
    localStorage.setItem('bd_rivers_theme', newTheme);
    applyTheme(newTheme);
  }

  // Setup Data
  function setupData() {
    allRivers = window.BD_RIVERS_DATA || window.RIVERS_DATA || [];
    bcsQuestions = window.BD_RIVERS_BCS_QA || window.BCS_QA || [];
    summaryData = window.BD_RIVERS_SUMMARY || window.RIVERS_SUMMARY || {};
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

    // Clean OpenStreetMap standard tile layer (100% free, no API key watermark)
    streetLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    });

    // Satellite Imagery Layer (Esri World Imagery)
    satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS',
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

    // Show top 200 rivers on the map for high performance
    const mapSelection = filteredRivers.slice(0, 200);

    mapSelection.forEach(river => {
      if (!river.coords || river.coords.length < 2) return;

      let lineColor = '#06b6d4';
      if (river.status && river.status.includes('বিপন্ন')) lineColor = '#f43f5e';
      else if (river.status && river.status.includes('ভরাট')) lineColor = '#f59e0b';
      else if (river.status && river.status.includes('মৌসুমি')) lineColor = '#8b5cf6';

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
      polyline.setStyle({ weight: 6, color: '#f59e0b', opacity: 1 });
      polyline.bringToFront();
    }
    if (selectedRiverText) {
      selectedRiverText.innerHTML = `নির্বাচিত নদী: <strong>${river.name_bn}</strong> (${river.name_en}) - দৈর্ঘ্য: ${river.length_km} কিমি`;
    }
  }

  // Event Listeners
  function setupEventListeners() {
    // Theme toggle (both IDs supported)
    const btn1 = document.getElementById('themeToggle');
    const btn2 = document.getElementById('themeToggleBtn');
    if (btn1) btn1.addEventListener('click', toggleTheme);
    if (btn2) btn2.addEventListener('click', toggleTheme);

    // Map Basemap Toggle
    if (toggleLayerBtn) {
      toggleLayerBtn.addEventListener('click', () => {
        if (!map) return;
        activeSatellite = !activeSatellite;
        if (activeSatellite) {
          map.removeLayer(streetLayer);
          satelliteLayer.addTo(map);
          toggleLayerBtn.innerHTML = '<i class="fa-solid fa-map"></i> স্ট্যান্ডার্ড ম্যাপ';
        } else {
          map.removeLayer(satelliteLayer);
          streetLayer.addTo(map);
          toggleLayerBtn.innerHTML = '<i class="fa-solid fa-satellite"></i> স্যাটেলাইট ভিউ';
        }
      });
    }

    // Reset Map View
    if (resetMapBtn) {
      resetMapBtn.addEventListener('click', () => {
        if (!map) return;
        map.flyTo([23.6850, 90.3563], 7, { duration: 1.2 });
        if (highlightedPolyline) {
          highlightedPolyline.setStyle({ weight: 3, opacity: 0.85 });
          highlightedPolyline = null;
        }
        if (selectedRiverText) {
          selectedRiverText.innerHTML = 'মানচিত্রে নদীর ওপর ক্লিক করে বিস্তারিত দেখুন';
        }
      });
    }

    // Search Input with Debounce
    let searchTimeout;
    if (riverSearchInput) {
      riverSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const val = e.target.value.trim();
        if (clearSearchBtn) clearSearchBtn.classList.toggle('hidden', val.length === 0);

        searchTimeout = setTimeout(() => {
          searchQuery = val.toLowerCase();
          applyFilters();
        }, 150);
      });
    }

    // Clear Search Button
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (riverSearchInput) riverSearchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        searchQuery = '';
        applyFilters();
        if (riverSearchInput) riverSearchInput.focus();
      });
    }

    // Dropdown Filters
    if (filterBasin) filterBasin.addEventListener('change', (e) => { selectedBasin = e.target.value; applyFilters(); });
    if (filterDivision) filterDivision.addEventListener('change', (e) => { selectedDivision = e.target.value; applyFilters(); });
    if (filterTransboundary) filterTransboundary.addEventListener('change', (e) => { selectedTransboundary = e.target.value; applyFilters(); });
    if (filterStatus) filterStatus.addEventListener('change', (e) => { selectedStatus = e.target.value; applyFilters(); });

    // Reset Filters Button
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetAllFilters);

    // Quick Filter Chips
    document.querySelectorAll('.quick-filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.quick-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const type = chip.getAttribute('data-filter');
        if (type === 'all') {
          resetAllFilters();
          return;
        } else if (type === 'transboundary') {
          resetAllFilters();
          selectedTransboundary = 'yes';
          if (filterTransboundary) filterTransboundary.value = 'yes';
        } else if (type === 'endangered') {
          resetAllFilters();
          selectedStatus = 'দখল ও দূষণে বিপন্ন';
          if (filterStatus) filterStatus.value = 'দখল ও দূষণে বিপন্ন';
        } else if (type === 'top10') {
          resetAllFilters();
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
    if (bcsSearchInput) {
      bcsSearchInput.addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        document.querySelectorAll('.bcs-item').forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(q) ? 'block' : 'none';
        });
      });
    }

    // Modal close
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeRiverModal);
    if (riverModal) {
      riverModal.addEventListener('click', (e) => {
        if (e.target === riverModal) closeRiverModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && riverModal && !riverModal.classList.contains('hidden')) {
        closeRiverModal();
      }
    });

    // Copy links
    document.querySelectorAll('.copy-link-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const fullUrl = window.location.origin + window.location.pathname.replace(/\/$/, '') + '/' + btn.getAttribute('data-url');
        copyTextFallback(fullUrl);
        showToast('ডাউনলোড লিংক কপি হয়েছে!');
      });
    });
  }

  // Apply filters
  function applyFilters() {
    filteredRivers = allRivers.filter(r => {
      if (selectedBasin !== 'all' && r.basin !== selectedBasin) return false;
      if (selectedDivision !== 'all' && (!r.divisions || !r.divisions.includes(selectedDivision))) return false;
      if (selectedTransboundary === 'yes' && !r.transboundary) return false;
      if (selectedTransboundary === 'no' && r.transboundary) return false;
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchNameBn = r.name_bn && r.name_bn.toLowerCase().includes(q);
        const matchNameEn = r.name_en && r.name_en.toLowerCase().includes(q);
        const matchOriginBn = r.origin_bn && r.origin_bn.toLowerCase().includes(q);
        const matchOriginEn = r.origin_en && r.origin_en.toLowerCase().includes(q);
        const matchOutfall = (r.outfall_bn && r.outfall_bn.toLowerCase().includes(q)) || (r.outfall_en && r.outfall_en.toLowerCase().includes(q));
        const matchFlow = r.flow_path && r.flow_path.toLowerCase().includes(q);
        const matchDist = r.districts && r.districts.some(d => d.toLowerCase().includes(q));
        const matchBasin = r.basin && r.basin.toLowerCase().includes(q);
        const matchHistory = r.historical_bcs_significance && r.historical_bcs_significance.toLowerCase().includes(q);

        if (!matchNameBn && !matchNameEn && !matchOriginBn && !matchOriginEn && !matchOutfall && !matchFlow && !matchDist && !matchBasin && !matchHistory) {
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

    if (riverSearchInput) riverSearchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
    if (filterBasin) filterBasin.value = 'all';
    if (filterDivision) filterDivision.value = 'all';
    if (filterTransboundary) filterTransboundary.value = 'all';
    if (filterStatus) filterStatus.value = 'all';
    document.querySelectorAll('.quick-filter-chip').forEach(c => c.classList.remove('active'));

    applyFilters();
  }

  function updateCount() {
    if (riverCountText) {
      riverCountText.innerHTML = `প্রদর্শিত হচ্ছে: <strong>${filteredRivers.length}</strong> টি নদ-নদী (সর্বমোট: ${allRivers.length})`;
    }
    if (noResultsState) noResultsState.classList.toggle('hidden', filteredRivers.length > 0);
    if (riversGrid) riversGrid.classList.toggle('hidden', filteredRivers.length === 0);
  }

  // Render Rivers Grid
  function renderRivers() {
    if (!riversGrid) return;
    riversGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    filteredRivers.slice(0, 120).forEach(r => {
      const card = document.createElement('div');
      card.className = 'river-card';
      const statusClass = `status-${(r.status || '').replace(/\s+/g, '-')}`;

      card.innerHTML = `
        <div class="river-card-header">
          <h4 class="river-name">${r.name_bn} <small style="font-size:0.75rem; color:var(--text-muted);">(${r.name_en || ''})</small></h4>
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
          <strong>উৎপত্তি:</strong> ${r.origin_bn || r.origin_en}
        </div>
        <div class="river-info-row">
          <strong>পতন/মোহনা:</strong> ${r.outfall_bn || r.outfall_en}
        </div>

        ${r.transboundary ? `<div class="transboundary-tag"><i class="fa-solid fa-earth-americas"></i> অভিন্ন নদী (${r.transboundary_country})</div>` : ''}

        <div class="river-card-actions">
          <button class="btn btn-sm btn-outline focus-river-btn" data-id="${r.id}"><i class="fa-solid fa-crosshairs"></i> ম্যাপে দেখুন</button>
          <button class="btn btn-sm btn-primary view-details-btn" data-id="${r.id}"><i class="fa-solid fa-circle-info"></i> বিস্তারিত</button>
        </div>
      `;

      // Focus river on map button
      card.querySelector('.focus-river-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        focusRiverOnMap(r);
      });

      // View details button & card click
      card.querySelector('.view-details-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openRiverModal(r);
      });

      card.addEventListener('click', () => {
        openRiverModal(r);
      });

      fragment.appendChild(card);
    });

    riversGrid.appendChild(fragment);
  }

  // Focus river on map
  function focusRiverOnMap(river) {
    if (!map || !river.coords || river.coords.length === 0) return;
    document.getElementById('mapSection').scrollIntoView({ behavior: 'smooth' });
    map.flyTo(river.coords[0], 9, { duration: 1.5 });
    if (selectedRiverText) {
      selectedRiverText.innerHTML = `ম্যাপে ফোকাস করা হয়েছে: <strong>${river.name_bn}</strong> (${river.length_km} কিমি)`;
    }
  }

  // Open River Details Modal
  function openRiverModal(r) {
    if (!riverModal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="modal-header-section">
        <h3 style="font-size: 1.5rem; font-weight: 700; color: var(--accent-cyan);">${r.name_bn} (${r.name_en})</h3>
        <span class="status-badge status-${(r.status || '').replace(/\s+/g, '-')}">${r.status}</span>
      </div>

      <div class="modal-details-grid">
        <div class="detail-box">
          <label>নদীর পরিচিতি আইডি</label>
          <div><code>${r.id}</code></div>
        </div>
        <div class="detail-box">
          <label>মোট দৈর্ঘ্য</label>
          <div>${r.length_km} কিমি</div>
        </div>
        <div class="detail-box">
          <label>প্রধান অববাহিকা</label>
          <div>${r.basin}</div>
        </div>
        <div class="detail-box">
          <label>অভিন্ন নদী স্ট্যাটাস</label>
          <div>${r.transboundary ? `হ্যাঁ (${r.transboundary_country} সীমান্ত)` : 'না (অভ্যন্তরীণ নদী)'}</div>
        </div>
        <div class="detail-box full-width">
          <label>উৎপত্তি স্থল</label>
          <div>${r.origin_bn || r.origin_en}</div>
        </div>
        <div class="detail-box full-width">
          <label>প্রবাহ পথ ও জেলাসমূহ</label>
          <div>${r.flow_path} (${(r.districts || []).join(', ')})</div>
        </div>
        <div class="detail-box full-width">
          <label>পতন / মোহনা</label>
          <div>${r.outfall_bn || r.outfall_en}</div>
        </div>
        <div class="detail-box full-width bcs-highlight-box">
          <label><i class="fa-solid fa-graduation-cap"></i> বিসিএস ও সাধারণ জ্ঞান তথ্য</label>
          <div>${r.historical_bcs_significance}</div>
        </div>
      </div>
    `;

    riverModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeRiverModal() {
    if (!riverModal) return;
    riverModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Render BCS Q&A Accordion
  function renderBCSQuestions() {
    if (!bcsAccordion) return;
    bcsAccordion.innerHTML = '';
    const fragment = document.createDocumentFragment();

    bcsQuestions.forEach((q, idx) => {
      const bcsItem = document.createElement('div');
      bcsItem.className = 'bcs-item';

      bcsItem.innerHTML = `
        <div class="bcs-header">
          <div class="bcs-title">
            <span class="bcs-q-num">Q${idx + 1}</span>
            <span>${q.question || q.question_bn}</span>
          </div>
          <i class="fa-solid fa-chevron-down bcs-chevron"></i>
        </div>
        <div class="bcs-body">
          <div class="bcs-ans">
            <strong>উত্তর:</strong> ${q.answer || q.answer_bn}
          </div>
          <div class="bcs-exp">
            <strong>ব্যাখ্যা:</strong> ${q.explanation || q.explanation_bn}
          </div>
        </div>
      `;

      const header = bcsItem.querySelector('.bcs-header');
      const body = bcsItem.querySelector('.bcs-body');
      const chevron = bcsItem.querySelector('.bcs-chevron');

      header.addEventListener('click', () => {
        const isOpen = body.classList.contains('open');
        body.classList.toggle('open', !isOpen);
        chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
      });

      fragment.appendChild(bcsItem);
    });

    bcsAccordion.appendChild(fragment);
  }

  // Fallback Copy Function
  function copyTextFallback(text) {
    let copied = false;
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      copied = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {}

    if (!copied && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  // Toast Notification
  let toastTimeout;
  function showToast(msg) {
    if (!toast || !toastMessage) return;
    clearTimeout(toastTimeout);
    toastMessage.textContent = msg;
    toast.classList.remove('hidden');
    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // Expose global helpers
  window.BD_RIVERS_APP = {
    allRivers: () => allRivers,
    search: (q) => {
      searchQuery = q.toLowerCase();
      applyFilters();
    }
  };

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
