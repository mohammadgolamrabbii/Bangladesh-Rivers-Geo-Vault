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
  let flowMarkerGroup = null;
  let activeSatellite = true;
  let streetLayer = null;
  let satelliteLayer = null;
  let highlightedPolyline = null;
  let highlightGlowPolyline = null;

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
  const activeFlowBanner = document.getElementById('activeFlowBanner');
  const riverSearchInput = document.getElementById('riverSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const strictNameToggle = document.getElementById('strictNameToggle');
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
      maxZoom: 18
    });

    // Satellite Imagery Layer (Esri World Imagery) - DEFAULT LAYER
    satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS',
      maxZoom: 18
    });

    // Clean OpenStreetMap standard tile layer
    streetLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    });

    // Default layer is SATELLITE
    activeSatellite = true;
    satelliteLayer.addTo(map);
    if (toggleLayerBtn) {
      toggleLayerBtn.innerHTML = '<i class="fa-solid fa-map"></i> সাধারণ মানচিত্র';
    }

    // Layer groups for rivers and course markers
    riverLayerGroup = L.layerGroup().addTo(map);
    flowMarkerGroup = L.layerGroup().addTo(map);

    // Render river lines on map
    renderMapRivers();
  }

  // Catmull-Rom Spline Curve Interpolation (Guarantees smooth, non-angular natural curves)
  function catmullRomSpline(points, numSegments = 8) {
    if (!points || points.length < 2) return points || [];
    if (points.length === 2) {
      const p0 = points[0], p1 = points[1];
      const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
      points = [p0, mid, p1];
    }
    const pts = [points[0], ...points, points[points.length - 1]];
    const result = [];
    for (let i = 1; i < pts.length - 2; i++) {
      const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2];
      for (let j = 0; j < numSegments; j++) {
        const t = j / numSegments;
        const t2 = t * t;
        const t3 = t2 * t;
        const lat = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
        const lng = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
        result.push([lat, lng]);
      }
    }
    result.push(points[points.length - 1]);
    return result;
  }

  // Generate natural river flow curves with sinuous deltaic bends (Eliminates straight lines)
  function getSmoothRiverCoords(rawCoords, seed = 42) {
    if (!rawCoords || rawCoords.length < 2) return rawCoords || [];
    let dense = [];
    if (rawCoords.length < 6) {
      for (let i = 0; i < rawCoords.length - 1; i++) {
        const p1 = rawCoords[i];
        const p2 = rawCoords[i + 1];
        dense.push(p1);
        const dLat = p2[0] - p1[0];
        const dLng = p2[1] - p1[1];
        const dist = Math.hypot(dLat, dLng);
        const nLat = -dLng / (dist || 1);
        const nLng = dLat / (dist || 1);
        const steps = 4;
        for (let s = 1; s < steps; s++) {
          const t = s / steps;
          const wave = Math.sin(t * Math.PI * 2 + (seed % 5)) * (0.07 * dist);
          dense.push([p1[0] + dLat * t + nLat * wave, p1[1] + dLng * t + nLng * wave]);
        }
      }
      dense.push(rawCoords[rawCoords.length - 1]);
    } else {
      dense = rawCoords;
    }
    return catmullRomSpline(dense, 8);
  }

  // Render River Polylines on Map
  function renderMapRivers() {
    if (!map || !riverLayerGroup) return;
    riverLayerGroup.clearLayers();

    // Show up to 250 rivers for high responsiveness
    const mapSelection = filteredRivers.slice(0, 250);

    mapSelection.forEach((river, idx) => {
      if (!river.coords || river.coords.length < 2) return;

      const smoothCoords = getSmoothRiverCoords(river.coords, idx + 1);

      let lineColor = '#06b6d4';
      if (river.status && river.status.includes('বিপন্ন')) lineColor = '#f43f5e';
      else if (river.status && river.status.includes('ভরাট')) lineColor = '#f59e0b';
      else if (river.status && river.status.includes('মৌসুমি')) lineColor = '#8b5cf6';

      const polyline = L.polyline(smoothCoords, {
        color: lineColor,
        weight: river.length_km > 100 ? 3.5 : 2.2,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.bindTooltip(`<strong>${river.name_bn}</strong> (${river.length_km} কিমি)<br><small>${river.flow_path || ''}</small>`, {
        sticky: true,
        className: 'custom-map-tooltip'
      });

      polyline.on('click', () => {
        highlightRiver(river, polyline);
        openRiverModal(river);
      });

      polyline.on('mouseover', () => {
        polyline.setStyle({ weight: 5, opacity: 1 });
      });

      polyline.on('mouseout', () => {
        if (highlightedPolyline !== polyline) {
          polyline.setStyle({ weight: river.length_km > 100 ? 3.5 : 2.2, opacity: 0.85 });
        }
      });

      polyline.addTo(riverLayerGroup);
    });
  }

  // Highlight and trace complete river flow path on map
  function traceRiverFlowOnMap(river) {
    if (!map || !river.coords || river.coords.length === 0) return;

    if (!flowMarkerGroup) {
      flowMarkerGroup = L.layerGroup().addTo(map);
    }
    flowMarkerGroup.clearLayers();

    // Clean up previous highlights
    if (highlightGlowPolyline) {
      map.removeLayer(highlightGlowPolyline);
      highlightGlowPolyline = null;
    }
    if (highlightedPolyline) {
      map.removeLayer(highlightedPolyline);
      highlightedPolyline = null;
    }

    const smoothCoords = getSmoothRiverCoords(river.coords, 999);

    // Glowing cyan halo beneath the river ribbon
    highlightGlowPolyline = L.polyline(smoothCoords, {
      color: '#06b6d4',
      weight: 10,
      opacity: 0.45,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Bright golden active flow line
    highlightedPolyline = L.polyline(smoothCoords, {
      color: '#fbbf24',
      weight: 4.8,
      opacity: 1,
      dashArray: null,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Origin Marker (Green Pin)
    const originPt = smoothCoords[0];
    const originMarker = L.circleMarker(originPt, {
      radius: 9,
      fillColor: '#10b981',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 1
    }).bindPopup(`<strong>উৎস (Origin):</strong> ${river.origin_bn || river.origin_en}<br>নদী: ${river.name_bn} (${river.name_en})`).addTo(flowMarkerGroup);

    // Outfall Marker (Red Pin)
    const outfallPt = smoothCoords[smoothCoords.length - 1];
    const outfallMarker = L.circleMarker(outfallPt, {
      radius: 9,
      fillColor: '#f43f5e',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 1
    }).bindPopup(`<strong>পতন / মোহনা (Outfall):</strong> ${river.outfall_bn || river.outfall_en}<br>দৈর্ঘ্য: ${river.length_km} কিমি`).addTo(flowMarkerGroup);

    // Fit map bounds to show complete flow path
    map.fitBounds(highlightedPolyline.getBounds(), { padding: [55, 55], maxZoom: 12 });

    // Update active banner and selected river text
    if (selectedRiverText) {
      selectedRiverText.innerHTML = `গতিপথ ফোকাস: <strong>${river.name_bn} (${river.name_en})</strong> | দৈর্ঘ্য: ${river.length_km} কিমি | অববাহিকা: ${river.basin}`;
    }

    if (activeFlowBanner) {
      activeFlowBanner.innerHTML = `
        <div>
          <i class="fa-solid fa-water"></i> <strong>${river.name_bn} (${river.name_en})</strong> নদীর সম্পূর্ণ <strong>${river.length_km} কিমি</strong> প্রাকৃতিক গতিপথ স্যাটেলাইট ম্যাপে প্রদর্শিত হচ্ছে।
          <span style="font-size:0.82rem; opacity:0.9; margin-left:8px;">[উৎস: ${river.origin_bn} ➔ পতন: ${river.outfall_bn}]</span>
        </div>
        <button class="btn btn-sm btn-outline" onclick="window.BD_RIVERS_APP.resetMapView()" style="padding:2px 8px; font-size:0.75rem;"><i class="fa-solid fa-xmark"></i> বন্ধ করুন</button>
      `;
      activeFlowBanner.classList.remove('hidden');
    }
  }

  function highlightRiver(river, polyline) {
    traceRiverFlowOnMap(river);
  }

  // Event Listeners
  function setupEventListeners() {
    // Theme toggle
    const btn1 = document.getElementById('themeToggle');
    const btn2 = document.getElementById('themeToggleBtn');
    if (btn1) btn1.addEventListener('click', toggleTheme);
    if (btn2) btn2.addEventListener('click', toggleTheme);

    // Strict name match toggle
    if (strictNameToggle) {
      strictNameToggle.addEventListener('change', applyFilters);
    }

    // Map Basemap Toggle
    if (toggleLayerBtn) {
      toggleLayerBtn.addEventListener('click', () => {
        if (!map) return;
        activeSatellite = !activeSatellite;
        if (activeSatellite) {
          map.removeLayer(streetLayer);
          satelliteLayer.addTo(map);
          toggleLayerBtn.innerHTML = '<i class="fa-solid fa-map"></i> সাধারণ মানচিত্র';
        } else {
          map.removeLayer(satelliteLayer);
          streetLayer.addTo(map);
          toggleLayerBtn.innerHTML = '<i class="fa-solid fa-satellite-dish"></i> স্যাটেলাইট ভিউ';
        }
      });
    }

    // Reset Map View
    if (resetMapBtn) {
      resetMapBtn.addEventListener('click', resetMapView);
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
        }, 120);
      });
    }

    // Clear Search Button
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (riverSearchInput) riverSearchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        searchQuery = '';
        resetMapView();
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

  function resetMapView() {
    if (!map) return;
    map.flyTo([23.6850, 90.3563], 7, { duration: 1.2 });
    if (highlightGlowPolyline) {
      map.removeLayer(highlightGlowPolyline);
      highlightGlowPolyline = null;
    }
    if (highlightedPolyline) {
      map.removeLayer(highlightedPolyline);
      highlightedPolyline = null;
    }
    if (flowMarkerGroup) {
      flowMarkerGroup.clearLayers();
    }
    if (selectedRiverText) {
      selectedRiverText.innerHTML = 'মানচিত্রে নদীর ওপর ক্লিক করে বিস্তারিত দেখুন';
    }
    if (activeFlowBanner) {
      activeFlowBanner.classList.add('hidden');
    }
  }

  // Apply filters with Smart Scoring and Strict Name Toggle
  function applyFilters() {
    const isStrict = strictNameToggle ? strictNameToggle.checked : true;
    const q = searchQuery.toLowerCase().trim();

    const scoredResults = [];

    allRivers.forEach(r => {
      // Basin, Division, Transboundary, Status checks
      if (selectedBasin !== 'all' && r.basin !== selectedBasin) return;
      if (selectedDivision !== 'all' && (!r.divisions || !r.divisions.includes(selectedDivision))) return;
      if (selectedTransboundary === 'yes' && !r.transboundary) return;
      if (selectedTransboundary === 'no' && r.transboundary) return;
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return;

      if (q) {
        const nameEn = (r.name_en || '').toLowerCase();
        const nameBn = (r.name_bn || '').toLowerCase();

        let score = 0;

        // Exact Name Match (Highest priority)
        if (nameEn === q || nameBn === q || nameEn === q + ' river' || nameBn === q + ' নদী') {
          score = 10000;
        } else if (nameEn.startsWith(q) || nameBn.startsWith(q)) {
          score = 5000;
        } else if (nameEn.includes(q) || nameBn.includes(q)) {
          score = 1000;
        } else if (!isStrict) {
          // Broad matching in other attributes
          const origin = (r.origin_bn || '').toLowerCase();
          const outfall = (r.outfall_bn || '').toLowerCase();
          const flow = (r.flow_path || '').toLowerCase();
          const districts = (r.districts || []).join(' ').toLowerCase();

          if (origin.includes(q) || outfall.includes(q) || flow.includes(q) || districts.includes(q)) {
            score = 50;
          }
        }

        if (score > 0) {
          scoredResults.push({ river: r, score });
        }
      } else {
        scoredResults.push({ river: r, score: 0 });
      }
    });

    // Sort by score descending so exact river matches appear immediately
    scoredResults.sort((a, b) => b.score - a.score);
    filteredRivers = scoredResults.map(item => item.river);

    // Auto-focus and highlight flow path on map when a specific river is queried
    if (q && filteredRivers.length > 0 && scoredResults[0].score >= 1000) {
      traceRiverFlowOnMap(filteredRivers[0]);
    } else if (!q) {
      if (activeFlowBanner) activeFlowBanner.classList.add('hidden');
    }

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

    resetMapView();
    applyFilters();
  }

  function updateCount() {
    if (riverCountText) {
      riverCountText.innerHTML = `প্রদর্শিত হচ্ছে: <strong>${filteredRivers.length}</strong> টি নদ-নদী (সর্বমোট: ${allRivers.length})`;
    }
    if (noResultsState) noResultsState.classList.toggle('hidden', filteredRivers.length > 0);
    if (riversGrid) riversGrid.classList.toggle('hidden', filteredRivers.length === 0);
  }

  // Render Rivers Grid with Complete Flow Stepper
  function renderRivers() {
    if (!riversGrid) return;
    riversGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    filteredRivers.slice(0, 120).forEach(r => {
      const card = document.createElement('div');
      card.className = 'river-card';
      const statusClass = `status-${(r.status || '').replace(/\s+/g, '-')}`;

      // Build flow steps
      const flowSteps = (r.flow_path || '').split('➔').map(s => s.trim()).filter(Boolean);

      card.innerHTML = `
        <div class="river-card-header">
          <h4 class="river-name">${r.name_bn} <small style="font-size:0.75rem; color:var(--text-muted);">(${r.name_en || ''})</small></h4>
          <span class="river-id">${r.id}</span>
        </div>

        <span class="status-badge ${statusClass}">${r.status}</span>

        <div class="river-info-row">
          <strong>দৈর্ঘ্য:</strong> ${r.length_km} কিলোমিটার | <strong>অববাহিকা:</strong> ${r.basin}
        </div>

        <!-- Complete Flow Path Stepper -->
        <div class="flow-path-container">
          <div class="flow-path-title"><i class="fa-solid fa-route"></i> নদীর সম্পূর্ণ গতিপথ (Complete Flow Course):</div>
          <div class="flow-stepper">
            <span class="flow-step-point origin"><i class="fa-solid fa-circle-dot"></i> [উৎস] ${r.origin_bn || r.origin_en}</span>
            ${flowSteps.length > 0 ? flowSteps.map(step => `<span class="flow-step-arrow">➔</span><span class="flow-step-point">${step}</span>`).join('') : ''}
            <span class="flow-step-arrow">➔</span>
            <span class="flow-step-point outfall"><i class="fa-solid fa-flag-checkered"></i> [পতন] ${r.outfall_bn || r.outfall_en}</span>
          </div>
        </div>

        ${r.transboundary ? `<div class="transboundary-tag"><i class="fa-solid fa-earth-americas"></i> অভিন্ন নদী (${r.transboundary_country})</div>` : ''}

        <div class="river-card-actions">
          <button class="btn btn-sm btn-outline focus-river-btn" data-id="${r.id}"><i class="fa-solid fa-route"></i> মানচিত্রে গতিপথ দেখুন</button>
          <button class="btn btn-sm btn-primary view-details-btn" data-id="${r.id}"><i class="fa-solid fa-circle-info"></i> বিস্তারিত তথ্য</button>
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

  // Focus river on map and trace flow path
  function focusRiverOnMap(river) {
    if (!map || !river.coords || river.coords.length === 0) return;
    document.getElementById('mapSection').scrollIntoView({ behavior: 'smooth' });
    traceRiverFlowOnMap(river);
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
          <label>উৎপত্তি স্থল (Source)</label>
          <div><strong>${r.origin_bn || r.origin_en}</strong></div>
        </div>
        <div class="detail-box full-width">
          <label><i class="fa-solid fa-route"></i> সম্পূর্ণ গতিপথ ও প্রবাহ পথ (Course & Districts)</label>
          <div style="font-size:1.05rem; line-height:1.6; margin-top:4px; color:var(--accent-cyan);">${r.flow_path}</div>
          <div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;">সংশ্লিষ্ট জেলা: ${(r.districts || []).join(', ')}</div>
        </div>
        <div class="detail-box full-width">
          <label>পতন / মোহনা (Outfall)</label>
          <div><strong>${r.outfall_bn || r.outfall_en}</strong></div>
        </div>
        <div class="detail-box full-width bcs-highlight-box">
          <label><i class="fa-solid fa-graduation-cap"></i> বিসিএস ও সাধারণ জ্ঞান তথ্য</label>
          <div>${r.historical_bcs_significance}</div>
        </div>
        <div class="detail-box full-width">
          <button class="btn btn-primary" onclick="window.BD_RIVERS_APP.focusRiver('${r.id}')" style="width:100%; justify-content:center;">
            <i class="fa-solid fa-map-location-dot"></i> মানচিত্রে সম্পূর্ণ গতিপথ দেখুন ও ট্র্যাক করুন
          </button>
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
      if (riverSearchInput) riverSearchInput.value = q;
      searchQuery = q.toLowerCase();
      applyFilters();
    },
    focusRiver: (id) => {
      closeRiverModal();
      const r = allRivers.find(x => x.id === id);
      if (r) focusRiverOnMap(r);
    },
    resetMapView: resetMapView
  };

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
