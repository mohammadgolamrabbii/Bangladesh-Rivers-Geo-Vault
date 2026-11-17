/**
 * Bangladesh-Rivers-Geo-Vault Client Application
 * Author: Mohammad Golamrabbii (মোহাম্মদ গোলাম রাব্বী)
 * Geospatial Archivist & Civic Tech Innovator
 */

(function () {
  'use strict';

  // Smart Bengali-English Phonetic Transliteration & Fuzzy Matching
  function cleanTransliteration(s) {
    return (s || '').toLowerCase()
      .replace(/sh/g, 's')
      .replace(/kh/g, 'k')
      .replace(/ph/g, 'f')
      .replace(/th/g, 't')
      .replace(/dh/g, 'd')
      .replace(/bh/g, 'b')
      .replace(/gh/g, 'g')
      .replace(/ch/g, 'c')
      .replace(/ee/g, 'i')
      .replace(/oo/g, 'u')
      .replace(/y/g, 'i')
      .replace(/o/g, 'a')
      .replace(/(.)\1+/g, '$1')
      .trim();
  }

  function levenshteinDist(a, b) {
    if (!a || !b) return (a || b || '').length;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // Global State
  let allRivers = [];
  let filteredRivers = [];
  let bcsQuestions = [];
  let summaryData = {};
  let currentRenderLimit = 24;

  // Leaflet Map State
  let map = null;
  let riverLayerGroup = null;
  let flowMarkerGroup = null;
  let tileLayers = {};
  let activeBasemapLayer = null;
  let highlightedPolyline = null;
  let highlightGlowPolyline = null;
  let userGpsMarker = null;
  let currentlySelectedRiver = null;

  // Filter States
  let searchQuery = '';
  let selectedBasin = 'all';
  let selectedDivision = 'all';
  let selectedTransboundary = 'all';
  let selectedStatus = 'all';
  let activeSuggestionIndex = -1;

  // DOM Elements
  const riverMapElement = document.getElementById('riverMap');
  const resetMapBtn = document.getElementById('resetMapBtn');
  const selectedRiverText = document.getElementById('selectedRiverText');
  const activeFlowBanner = document.getElementById('activeFlowBanner');
  const riverSearchInput = document.getElementById('riverSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const searchSuggestions = document.getElementById('searchSuggestions');
  const fullscreenMapBtn = document.getElementById('fullscreenMapBtn');
  const mapSection = document.getElementById('mapSection');
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

  // Floating Controls
  const mapFloatingRiverCard = document.getElementById('mapFloatingRiverCard');
  const floatingLocateBtn = document.getElementById('floatingLocateBtn');
  const floatingResetBtn = document.getElementById('floatingResetBtn');
  const floatingFullscreenBtn = document.getElementById('floatingFullscreenBtn');
  const closeFloatingCardBtn = document.getElementById('closeFloatingCardBtn');
  const floatingCardZoomBtn = document.getElementById('floatingCardZoomBtn');
  const floatingCardDetailsBtn = document.getElementById('floatingCardDetailsBtn');

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
    allRivers = (typeof window !== 'undefined' && (window.BD_RIVERS_DATA || window.RIVERS_DATA)) ||
                (typeof RIVERS_DATA !== 'undefined' ? RIVERS_DATA : []);
    bcsQuestions = (typeof window !== 'undefined' && (window.BD_RIVERS_BCS_QA || window.BCS_QA)) ||
                   (typeof BCS_QA !== 'undefined' ? BCS_QA : []);
    summaryData = (typeof window !== 'undefined' && (window.BD_RIVERS_SUMMARY || window.RIVERS_SUMMARY)) ||
                  (typeof RIVERS_SUMMARY !== 'undefined' ? RIVERS_SUMMARY : {});
    filteredRivers = [...allRivers];

    // Fallback if data array is empty
    if (allRivers.length === 0 && typeof fetch === 'function') {
      fetch('data/json/rivers.json')
        .then(res => res.json())
        .then(data => {
          allRivers = data;
          filteredRivers = [...allRivers];
          renderRivers();
          renderMapRivers();
          updateCount();
        })
        .catch(err => console.warn('Local rivers.json fetch skipped:', err));
    }
  }

  // Initialize Leaflet Map
  function initMap() {
    if (!riverMapElement || typeof L === 'undefined') return;

    map = L.map('riverMap', {
      center: [23.6850, 90.3563],
      zoom: 7,
      minZoom: 6,
      maxZoom: 20,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 100,
      wheelDebounceTime: 40,
      zoomControl: false
    });

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    L.control.scale({
      metric: true,
      imperial: false,
      position: 'bottomleft',
      maxWidth: 130
    }).addTo(map);

    // Basemap Tile Layers
    tileLayers = {
      googleHybrid: L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20,
        attribution: 'Map data &copy; Google'
      }),
      googleRoadmap: L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20,
        attribution: 'Map data &copy; Google'
      }),
      esriSat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS',
        maxZoom: 18
      }),
      osm: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      })
    };

    activeBasemapLayer = tileLayers.googleHybrid;
    activeBasemapLayer.addTo(map);

    riverLayerGroup = L.layerGroup().addTo(map);
    flowMarkerGroup = L.layerGroup().addTo(map);

    renderMapRivers();
  }

  function catmullRomSpline(points, numSegments = 6) {
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

  function getRiverRenderCoords(rawCoords, seed = 42) {
    if (!rawCoords || rawCoords.length < 2) return rawCoords || [];
    if (rawCoords.length >= 10) {
      return rawCoords;
    }
    let dense = [];
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
        const wave = Math.sin(t * Math.PI * 2 + (seed % 5)) * (0.05 * dist);
        dense.push([p1[0] + dLat * t + nLat * wave, p1[1] + dLng * t + nLng * wave]);
      }
    }
    dense.push(rawCoords[rawCoords.length - 1]);
    return catmullRomSpline(dense, 6);
  }

  // Render Base River Polylines on Map
  function renderMapRivers() {
    if (!map || !riverLayerGroup) return;
    riverLayerGroup.clearLayers();

    const mapSelection = filteredRivers.slice(0, 250);

    mapSelection.forEach((river, idx) => {
      if (!river.coords || river.coords.length < 2) return;

      const renderCoords = getRiverRenderCoords(river.coords, idx + 1);

      let lineColor = '#0284c7';
      if (river.status && river.status.includes('বিপন্ন')) lineColor = '#f43f5e';
      else if (river.status && river.status.includes('ভরাট')) lineColor = '#f59e0b';
      else if (river.status && river.status.includes('মৌসুমি')) lineColor = '#8b5cf6';

      const polyline = L.polyline(renderCoords, {
        color: lineColor,
        weight: river.length_km > 100 ? 3.5 : 2.2,
        opacity: 0.88,
        lineCap: 'round',
        lineJoin: 'round'
      });

      polyline.bindTooltip(`<strong>${river.name_bn}</strong> (${river.length_km} কিমি)<br><small>${river.basin}</small>`, {
        sticky: true,
        className: 'custom-map-tooltip'
      });

      polyline.on('click', () => {
        selectRiverFromSuggestion(river);
      });

      polyline.on('mouseover', () => {
        polyline.setStyle({ weight: 5.5, opacity: 1 });
      });

      polyline.on('mouseout', () => {
        if (highlightedPolyline !== polyline) {
          polyline.setStyle({ weight: river.length_km > 100 ? 3.5 : 2.2, opacity: 0.88 });
        }
      });

      polyline.addTo(riverLayerGroup);
    });
  }

  // Trace river flow path with glowing animated trajectory
  function traceRiverFlowOnMap(river, shouldFly = true) {
    if (!map || !river.coords || river.coords.length === 0) return;

    if (!flowMarkerGroup) {
      flowMarkerGroup = L.layerGroup().addTo(map);
    }
    flowMarkerGroup.clearLayers();

    if (highlightGlowPolyline) {
      map.removeLayer(highlightGlowPolyline);
      highlightGlowPolyline = null;
    }
    if (highlightedPolyline) {
      map.removeLayer(highlightedPolyline);
      highlightedPolyline = null;
    }

    const riverCoords = getRiverRenderCoords(river.coords, 999);

    // Glowing cyan river halo
    highlightGlowPolyline = L.polyline(riverCoords, {
      color: '#38bdf8',
      weight: 8,
      opacity: 0.65,
      className: 'river-glow-halo',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Core active flowing line with animated stroke dash
    highlightedPolyline = L.polyline(riverCoords, {
      color: '#06b6d4',
      weight: 4.8,
      opacity: 1,
      className: 'active-flowing-river',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Origin Marker (Green Pin)
    const originPt = riverCoords[0];
    L.circleMarker(originPt, {
      radius: 9,
      fillColor: '#10b981',
      color: '#ffffff',
      weight: 2.5,
      opacity: 1,
      fillOpacity: 1
    }).bindTooltip(`🟢 <strong>উৎস:</strong> ${river.origin_bn || river.origin_en || 'উচ্চভূমি'}`, {
      permanent: true,
      direction: 'top',
      className: 'origin-flow-tooltip',
      offset: [0, -8]
    }).addTo(flowMarkerGroup);

    // Outfall Marker (Red Pin)
    const outfallPt = riverCoords[riverCoords.length - 1];
    L.circleMarker(outfallPt, {
      radius: 9,
      fillColor: '#ef4444',
      color: '#ffffff',
      weight: 2.5,
      opacity: 1,
      fillOpacity: 1
    }).bindTooltip(`🔴 <strong>পতন:</strong> ${river.outfall_bn || river.outfall_en || 'মোহনা'}`, {
      permanent: true,
      direction: 'bottom',
      className: 'outfall-flow-tooltip',
      offset: [0, 8]
    }).addTo(flowMarkerGroup);

    // Smoothly fly camera to bounds (Only when explicitly triggered!)
    if (shouldFly && map) {
      map.invalidateSize();
      const bounds = highlightedPolyline.getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14,
          duration: 1.1
        });
      }
    }

    if (selectedRiverText) {
      selectedRiverText.innerHTML = `ফোকাস: <strong>${river.name_bn}</strong> (${river.length_km} কিমি) | অববাহিকা: ${river.basin}`;
    }

    if (activeFlowBanner) {
      activeFlowBanner.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <i class="fa-solid fa-water"></i> <strong>${river.name_bn}</strong> (${river.length_km} কিমি): ${river.origin_bn || 'উৎস'} ➔ ${river.outfall_bn || 'মোহনা'}
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-sm btn-primary" onclick="window.BD_RIVERS_APP.zoomToActiveRiver()"><i class="fa-solid fa-magnifying-glass-plus"></i> ক্লোজ-আপ</button>
          <button class="btn btn-sm btn-outline" onclick="window.BD_RIVERS_APP.resetMapView()"><i class="fa-solid fa-xmark"></i> বন্ধ</button>
        </div>
      `;
      activeFlowBanner.classList.remove('hidden');
    }
  }

  // Event Listeners
  function setupEventListeners() {
    // Theme toggle
    const btn1 = document.getElementById('themeToggle');
    if (btn1) btn1.addEventListener('click', toggleTheme);

    // Basemap switcher
    document.querySelectorAll('.basemap-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const layerKey = btn.getAttribute('data-layer');
        if (!tileLayers[layerKey] || activeBasemapLayer === tileLayers[layerKey]) return;

        if (map && activeBasemapLayer) {
          map.removeLayer(activeBasemapLayer);
        }
        tileLayers[layerKey].addTo(map);
        activeBasemapLayer = tileLayers[layerKey];

        document.querySelectorAll('.basemap-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    if (resetMapBtn) resetMapBtn.addEventListener('click', resetMapView);

    // Fullscreen Map Toggle
    if (fullscreenMapBtn && mapSection) {
      fullscreenMapBtn.addEventListener('click', () => {
        const isFullscreen = mapSection.classList.toggle('fullscreen');
        if (isFullscreen) {
          fullscreenMapBtn.innerHTML = '<i class="fa-solid fa-compress"></i> বন্ধ করুন';
        } else {
          fullscreenMapBtn.innerHTML = '<i class="fa-solid fa-expand"></i> ফুলস্ক্রিন';
        }
        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 120);
      });
    }

    // Search Input with Debounce: NEVER fly map while typing! Only show suggestions!
    let searchTimeout;
    if (riverSearchInput) {
      riverSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const val = e.target.value.trim();
        if (clearSearchBtn) clearSearchBtn.classList.toggle('hidden', val.length === 0);

        renderAutocomplete(val);

        searchTimeout = setTimeout(() => {
          searchQuery = val.toLowerCase();
          applyFilters(false); // Do NOT fly map while typing
        }, 150);
      });

      // Keyboard navigation in suggestions
      riverSearchInput.addEventListener('keydown', (e) => {
        if (!searchSuggestions || searchSuggestions.classList.contains('hidden')) return;
        const items = searchSuggestions.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
          items.forEach((it, i) => it.classList.toggle('active', i === activeSuggestionIndex));
          items[activeSuggestionIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
          items.forEach((it, i) => it.classList.toggle('active', i === activeSuggestionIndex));
          items[activeSuggestionIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          if (activeSuggestionIndex >= 0 && activeSuggestionIndex < items.length) {
            e.preventDefault();
            items[activeSuggestionIndex].click();
          } else if (items.length > 0) {
            e.preventDefault();
            items[0].click();
          }
        } else if (e.key === 'Escape') {
          searchSuggestions.classList.add('hidden');
        }
      });
    }

    // Close autocomplete on click outside
    document.addEventListener('click', (e) => {
      if (searchSuggestions && !searchSuggestions.contains(e.target) && e.target !== riverSearchInput) {
        searchSuggestions.classList.add('hidden');
      }
    });

    // Clear Search Button
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (riverSearchInput) riverSearchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        searchQuery = '';
        if (searchSuggestions) searchSuggestions.classList.add('hidden');
        resetMapView();
        applyFilters(false);
        if (riverSearchInput) riverSearchInput.focus();
      });
    }

    // Floating Action Buttons (FABs)
    if (floatingLocateBtn) floatingLocateBtn.addEventListener('click', locateUser);
    if (floatingResetBtn) floatingResetBtn.addEventListener('click', resetMapView);
    if (floatingFullscreenBtn && fullscreenMapBtn) {
      floatingFullscreenBtn.addEventListener('click', () => fullscreenMapBtn.click());
    }

    // Floating River Dossier Card Buttons
    if (closeFloatingCardBtn) {
      closeFloatingCardBtn.addEventListener('click', () => {
        if (mapFloatingRiverCard) mapFloatingRiverCard.classList.add('hidden');
      });
    }
    if (floatingCardZoomBtn) {
      floatingCardZoomBtn.addEventListener('click', zoomToActiveRiver);
    }
    if (floatingCardDetailsBtn) {
      floatingCardDetailsBtn.addEventListener('click', () => {
        if (currentlySelectedRiver) openRiverModal(currentlySelectedRiver);
      });
    }

    // Floating Filter Drawer Toggle
    const toggleFilterBtn = document.getElementById('toggleFilterBtn');
    const floatingFilterDrawer = document.getElementById('floatingFilterDrawer');
    const closeFilterDrawerBtn = document.getElementById('closeFilterDrawerBtn');

    if (toggleFilterBtn && floatingFilterDrawer) {
      toggleFilterBtn.addEventListener('click', () => {
        const isHidden = floatingFilterDrawer.classList.toggle('hidden');
        toggleFilterBtn.classList.toggle('active', !isHidden);
      });
    }

    if (closeFilterDrawerBtn && floatingFilterDrawer) {
      closeFilterDrawerBtn.addEventListener('click', () => {
        floatingFilterDrawer.classList.add('hidden');
        if (toggleFilterBtn) toggleFilterBtn.classList.remove('active');
      });
    }

    // Quick Search Tags & Floating Chips
    document.querySelectorAll('.quick-chip-btn, .quick-tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-query');
        if (riverSearchInput) riverSearchInput.value = q;
        const match = allRivers.find(r => 
          (r.name_bn || '').toLowerCase().includes(q.toLowerCase()) || 
          (r.name_en || '').toLowerCase().includes(q.toLowerCase())
        );
        if (match) {
          selectRiverFromSuggestion(match);
        } else {
          searchQuery = q.toLowerCase();
          applyFilters(false);
        }
      });
    });

    // FAQ Accordion Toggle
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (!item) return;
        const wasActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!wasActive) {
          item.classList.add('active');
        }
      });
    });

    // Dropdown Filters
    if (filterBasin) filterBasin.addEventListener('change', (e) => { selectedBasin = e.target.value; applyFilters(false); });
    if (filterDivision) filterDivision.addEventListener('change', (e) => { selectedDivision = e.target.value; applyFilters(false); });
    if (filterTransboundary) filterTransboundary.addEventListener('change', (e) => { selectedTransboundary = e.target.value; applyFilters(false); });
    if (filterStatus) filterStatus.addEventListener('change', (e) => { selectedStatus = e.target.value; applyFilters(false); });

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
        applyFilters(false);
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

    // Modal Close
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
        const relUrl = btn.getAttribute('data-url');
        const fullUrl = window.location.origin + window.location.pathname.replace(/\/$/, '') + '/' + relUrl;
        copyTextFallback(fullUrl);
        showToast('ডাউনলোড লিংক কপি হয়েছে!');
      });
    });
  }

  function resetMapView() {
    if (!map) return;
    map.flyTo([23.6850, 90.3563], 7, { duration: 1.1 });
    if (mapFloatingRiverCard) mapFloatingRiverCard.classList.add('hidden');
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

  function zoomToActiveRiver() {
    if (highlightedPolyline && map) {
      map.invalidateSize();
      const bounds = highlightedPolyline.getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14,
          duration: 1.1
        });
      }
    }
  }

  // Autocomplete Suggestions (Smooth, instantaneous, no map flying)
  function renderAutocomplete(query) {
    if (!searchSuggestions) return;
    const q = (query || '').toLowerCase().trim();
    if (!q || q.length < 1) {
      searchSuggestions.innerHTML = '';
      searchSuggestions.classList.add('hidden');
      activeSuggestionIndex = -1;
      return;
    }

    const matches = [];
    allRivers.forEach(r => {
      const nameEn = (r.name_en || '').toLowerCase();
      const nameBn = (r.name_bn || '').toLowerCase();
      let score = 0;
      if (nameEn === q || nameBn === q || nameEn === q + ' river' || nameBn === q + ' নদী') {
        score = 10000;
      } else if (nameEn.startsWith(q) || nameBn.startsWith(q)) {
        score = 5000;
      } else if (nameEn.includes(q) || nameBn.includes(q)) {
        score = 2000;
      } else {
        const districts = (r.districts || []).join(' ').toLowerCase();
        if (districts.includes(q)) score = 500;
      }
      if (score > 0) matches.push({ river: r, score });
    });

    matches.sort((a, b) => b.score - a.score);
    const topMatches = matches.slice(0, 8);

    if (topMatches.length === 0) {
      searchSuggestions.innerHTML = `<div style="padding: 12px 16px; color: var(--text-muted); font-size: 0.88rem;"><i class="fa-solid fa-circle-question"></i> কোনো নদী পাওয়া যায়নি। বানানের সঠিক রূপ চেষ্টা করুন (যেমন: balu, তুরাগ, পদ্মা)।</div>`;
      searchSuggestions.classList.remove('hidden');
      return;
    }

    searchSuggestions.innerHTML = topMatches.map((item, idx) => {
      const r = item.river;
      const isEndangered = (r.status || '').includes('বিপন্ন') || (r.status || '').includes('ভরাট');
      const badgeStyle = isEndangered 
        ? 'background: rgba(244,63,94,0.15); color: #f43f5e; border-color: rgba(244,63,94,0.3);' 
        : 'background: rgba(16,185,129,0.15); color: #10b981; border-color: rgba(16,185,129,0.3);';

      return `
        <div class="suggestion-item" data-index="${idx}" data-id="${r.id}" role="option">
          <div class="suggestion-item-main">
            <div class="suggestion-name">
              <span>${r.name_bn}</span>
              <span class="suggestion-en">${r.name_en || ''}</span>
              ${r.transboundary ? '<span style="font-size:0.7rem; color:#38bdf8; font-weight:600;"><i class="fa-solid fa-flag"></i> অভিন্ন নদী</span>' : ''}
            </div>
            <div class="suggestion-meta">
              <span><i class="fa-solid fa-location-dot"></i> ${(r.districts || []).slice(0, 2).join(', ')}</span>
              <span>&bull;</span>
              <span>${r.basin}</span>
            </div>
          </div>
          <div class="suggestion-badges">
            <span class="suggestion-badge">${r.length_km} কিমি</span>
            <span class="suggestion-badge" style="${badgeStyle}">${r.status}</span>
          </div>
        </div>
      `;
    }).join('');

    searchSuggestions.classList.remove('hidden');
    activeSuggestionIndex = -1;

    searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const river = allRivers.find(x => x.id === id);
        if (river) {
          selectRiverFromSuggestion(river);
        }
      });
    });
  }

  // River Selection: Closes suggestions, flies map gently, animates flowing path, updates card
  function selectRiverFromSuggestion(river) {
    if (!river) return;
    currentlySelectedRiver = river;

    if (riverSearchInput) riverSearchInput.value = river.name_bn;
    if (clearSearchBtn) clearSearchBtn.classList.remove('hidden');
    if (searchSuggestions) searchSuggestions.classList.add('hidden');

    // Reset dropdown filters so this river appears in the grid below
    selectedBasin = 'all';
    selectedDivision = 'all';
    selectedTransboundary = 'all';
    selectedStatus = 'all';
    if (filterBasin) filterBasin.value = 'all';
    if (filterDivision) filterDivision.value = 'all';
    if (filterTransboundary) filterTransboundary.value = 'all';
    if (filterStatus) filterStatus.value = 'all';
    document.querySelectorAll('.quick-filter-chip').forEach(c => c.classList.remove('active'));

    searchQuery = river.name_bn.toLowerCase();

    // Trace path and fly map with glowing pulse
    traceRiverFlowOnMap(river, true);
    updateFloatingRiverCard(river);

    // Update bottom grid without re-flying
    applyFilters(false);
  }

  // Update Floating River Card
  function updateFloatingRiverCard(river) {
    if (!mapFloatingRiverCard || !river) return;
    currentlySelectedRiver = river;

    const titleEl = document.getElementById('floatingCardTitle');
    const subEl = document.getElementById('floatingCardSubtitle');
    const transBadge = document.getElementById('floatingCardTransboundary');
    const statusBadge = document.getElementById('floatingCardStatus');
    const lenEl = document.getElementById('floatingCardLength');
    const basinEl = document.getElementById('floatingCardBasin');
    const distEl = document.getElementById('floatingCardDistricts');
    const originEl = document.getElementById('floatingCardOrigin');
    const outfallEl = document.getElementById('floatingCardOutfall');

    if (titleEl) titleEl.textContent = river.name_bn;
    if (subEl) subEl.textContent = river.name_en || '';

    if (transBadge) {
      if (river.transboundary) {
        transBadge.innerHTML = `<i class="fa-solid fa-flag"></i> অভিন্ন (${river.transboundary_country || 'ভারত'})`;
        transBadge.classList.remove('hidden');
      } else {
        transBadge.innerHTML = `<i class="fa-solid fa-water"></i> অভ্যন্তরীণ`;
        transBadge.classList.remove('hidden');
      }
    }

    if (statusBadge) {
      statusBadge.textContent = river.status || 'প্রবাহিত ও সক্রিয়';
      const isBad = (river.status || '').includes('বিপন্ন') || (river.status || '').includes('ভরাট');
      statusBadge.style.color = isBad ? '#f87171' : '#34d399';
      statusBadge.style.background = isBad ? 'rgba(239, 68, 68, 0.16)' : 'rgba(16, 185, 129, 0.16)';
      statusBadge.style.borderColor = isBad ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)';
    }

    if (lenEl) lenEl.textContent = `${river.length_km} কিমি`;
    if (basinEl) basinEl.textContent = river.basin || 'নদী অববাহিকা';
    if (distEl) distEl.textContent = (river.districts && river.districts.length > 0) ? `${river.districts.length}টি জেলা (${river.districts.slice(0, 2).join(', ')})` : 'বাংলাদেশ';
    if (originEl) originEl.textContent = river.origin_bn || river.origin_en || 'উচ্চভূমি';
    if (outfallEl) outfallEl.textContent = river.outfall_bn || river.outfall_en || 'প্রধান মোহনা';

    mapFloatingRiverCard.classList.remove('hidden');
  }

  // Geolocation & Nearest River Detection
  function locateUser() {
    if (!navigator.geolocation) {
      showToast('আপনার ব্রাউজারে Geolocation সমর্থিত নয়।');
      return;
    }

    if (floatingLocateBtn) floatingLocateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (floatingLocateBtn) floatingLocateBtn.innerHTML = '<i class="fa-solid fa-crosshairs"></i>';
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (!map) return;

        if (userGpsMarker) {
          map.removeLayer(userGpsMarker);
        }

        const gpsIcon = L.divIcon({
          className: 'user-gps-pulse-wrapper',
          html: '<div class="user-gps-pulse"><div class="user-gps-dot"></div></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        userGpsMarker = L.marker([lat, lng], { icon: gpsIcon }).addTo(map);

        // Find nearest river
        let nearestRiver = null;
        let minDistance = Infinity;

        allRivers.forEach(r => {
          if (!r.coords || r.coords.length === 0) return;
          r.coords.forEach(pt => {
            const dLat = (pt[0] - lat) * (Math.PI / 180);
            const dLng = (pt[1] - lng) * (Math.PI / 180);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat * (Math.PI / 180)) * Math.cos(pt[0] * (Math.PI / 180)) *
                      Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const dKm = 6371 * c;
            if (dKm < minDistance) {
              minDistance = dKm;
              nearestRiver = r;
            }
          });
        });

        const distText = minDistance < 1 ? `${Math.round(minDistance * 1000)} মিটার` : `${minDistance.toFixed(1)} কিমি`;
        const popupContent = nearestRiver 
          ? `<div style="font-size:0.86rem; line-height:1.4;"><strong><i class="fa-solid fa-location-crosshairs" style="color:#0284c7;"></i> আপনার বর্তমান অবস্থান (GPS)</strong><br>নিকটবর্তী নদী: <strong>${nearestRiver.name_bn}</strong> (${nearestRiver.name_en})<br>দূরত্ব: মাত্র <strong>${distText}</strong> দূরে!<br><br><button id="gpsFlyBtn" class="btn btn-xs btn-primary" style="padding: 4px 10px; font-size: 0.78rem; border-radius: 4px; cursor: pointer;">গতিপথ দেখুন ➔</button></div>`
          : `<strong>আপনার অবস্থান (GPS)</strong><br>অক্ষাংশ: ${lat.toFixed(4)}, দ্রাঘিমাংশ: ${lng.toFixed(4)}`;

        userGpsMarker.bindPopup(popupContent).openPopup();
        map.flyTo([lat, lng], 13, { duration: 1.1 });

        setTimeout(() => {
          const btn = document.getElementById('gpsFlyBtn');
          if (btn && nearestRiver) {
            btn.addEventListener('click', () => {
              selectRiverFromSuggestion(nearestRiver);
            });
          }
        }, 150);
      },
      (err) => {
        if (floatingLocateBtn) floatingLocateBtn.innerHTML = '<i class="fa-solid fa-crosshairs"></i>';
        showToast('আপনার ভৌগোলিক অবস্থান পাওয়া যায়নি বা অনুমতি দেওয়া হয়নি।');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // Apply filters with relevance scoring
  function applyFilters(shouldFly = false) {
    const q = searchQuery.toLowerCase().trim();
    const scoredResults = [];

    allRivers.forEach(r => {
      if (selectedBasin !== 'all' && r.basin !== selectedBasin) return;
      if (selectedDivision !== 'all' && (!r.divisions || !r.divisions.includes(selectedDivision))) return;
      if (selectedTransboundary === 'yes' && !r.transboundary) return;
      if (selectedTransboundary === 'no' && r.transboundary) return;
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return;

      if (q) {
        const nameEn = (r.name_en || '').toLowerCase();
        const nameBn = (r.name_bn || '').toLowerCase();
        let score = 0;

        const cleanEn = cleanTransliteration(nameEn);
        const cleanQ = cleanTransliteration(q);

        if (nameEn === q || nameBn === q || nameEn === q + ' river' || nameBn === q + ' নদী') {
          score = 10000;
        } else if (nameEn.startsWith(q) || nameBn.startsWith(q)) {
          score = 5000;
        } else if (nameEn.includes(q) || nameBn.includes(q)) {
          score = 2000;
        } else if (cleanQ.length >= 3 && cleanEn === cleanQ) {
          score = 1800;
        } else if (cleanQ.length >= 3 && cleanEn.startsWith(cleanQ)) {
          score = 1500;
        } else if (cleanQ.length >= 4 && cleanEn.includes(cleanQ)) {
          score = 1200;
        } else {
          if (q.length >= 4) {
            const words = nameEn.split(/[\s()]+/);
            for (const w of words) {
              if (w.length >= 4 && Math.abs(w.length - q.length) <= 2) {
                const d = levenshteinDist(q, w);
                if (d <= 2) {
                  score = Math.max(score, 1000 - d * 200);
                }
              }
            }
          }

          if (score === 0) {
            const districts = (r.districts || []).join(' ').toLowerCase();
            const origin = (r.origin_bn || '').toLowerCase();
            const outfall = (r.outfall_bn || '').toLowerCase();
            const flow = (r.flow_path || '').toLowerCase();

            if (districts.includes(q)) {
              score = 500;
            } else if (origin.includes(q) || outfall.includes(q) || flow.includes(q)) {
              score = 100;
            }
          }
        }

        if (score > 0) {
          scoredResults.push({ river: r, score });
        }
      } else {
        scoredResults.push({ river: r, score: 0 });
      }
    });

    scoredResults.sort((a, b) => b.score - a.score);
    filteredRivers = scoredResults.map(item => item.river);

    if (shouldFly && q && filteredRivers.length > 0 && scoredResults[0].score >= 1000) {
      traceRiverFlowOnMap(filteredRivers[0], true);
      updateFloatingRiverCard(filteredRivers[0]);
    } else if (!q) {
      if (activeFlowBanner) activeFlowBanner.classList.add('hidden');
    }

    renderRivers(true);
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
    if (searchSuggestions) searchSuggestions.classList.add('hidden');
    if (mapFloatingRiverCard) mapFloatingRiverCard.classList.add('hidden');

    if (filterBasin) filterBasin.value = 'all';
    if (filterDivision) filterDivision.value = 'all';
    if (filterTransboundary) filterTransboundary.value = 'all';
    if (filterStatus) filterStatus.value = 'all';
    document.querySelectorAll('.quick-filter-chip').forEach(c => c.classList.remove('active'));

    resetMapView();
    applyFilters(false);
  }

  function updateCount() {
    if (riverCountText) {
      riverCountText.innerHTML = `প্রদর্শিত হচ্ছে: <strong>${filteredRivers.length}</strong> টি নদ-নদী (সর্বমোট: ${allRivers.length})`;
    }
    if (noResultsState) noResultsState.classList.toggle('hidden', filteredRivers.length > 0);
    if (riversGrid) riversGrid.classList.toggle('hidden', filteredRivers.length === 0);
  }

  // Render River Cards with chunked Load More for 60fps responsiveness
  function renderRivers(resetLimit = true) {
    if (!riversGrid) return;
    if (resetLimit) currentRenderLimit = 24;
    riversGrid.innerHTML = '';

    const existingLoadMore = document.getElementById('loadMoreRiversBtnWrap');
    if (existingLoadMore) existingLoadMore.remove();

    const fragment = document.createDocumentFragment();
    const slice = filteredRivers.slice(0, currentRenderLimit);

    slice.forEach(r => {
      const card = document.createElement('div');
      card.className = 'river-card';
      const statusClass = `status-${(r.status || '').replace(/\s+/g, '-')}`;
      const flowSteps = (r.flow_path || '').split('➔').map(s => s.trim()).filter(Boolean);

      card.innerHTML = `
        <div class="river-card-header">
          <h4 class="river-name">${r.name_bn} <small style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(${r.name_en || ''})</small></h4>
          <span class="river-id">${r.id}</span>
        </div>

        <span class="status-badge ${statusClass}">${r.status}</span>

        <div class="river-info-row">
          <strong>দৈর্ঘ্য:</strong> ${r.length_km} কিমি | <strong>অববাহিকা:</strong> ${r.basin}
        </div>

        <div class="flow-path-container">
          <div class="flow-path-title"><i class="fa-solid fa-route"></i> গতিপথ:</div>
          <div class="flow-stepper">
            <span class="flow-step-point origin"><i class="fa-solid fa-circle-dot"></i> [উৎস] ${r.origin_bn || r.origin_en}</span>
            ${flowSteps.length > 0 ? flowSteps.map(step => `<span class="flow-step-arrow">➔</span><span class="flow-step-point">${step}</span>`).join('') : ''}
            <span class="flow-step-arrow">➔</span>
            <span class="flow-step-point outfall"><i class="fa-solid fa-flag-checkered"></i> [পতন] ${r.outfall_bn || r.outfall_en}</span>
          </div>
        </div>

        ${r.transboundary ? `<div class="transboundary-tag"><i class="fa-solid fa-earth-americas"></i> অভিন্ন নদী (${r.transboundary_country})</div>` : ''}

        <div class="river-card-actions">
          <button class="btn btn-sm btn-outline focus-river-btn" data-id="${r.id}"><i class="fa-solid fa-route"></i> ম্যাপে গতিপথ</button>
          <button class="btn btn-sm btn-primary view-details-btn" data-id="${r.id}"><i class="fa-solid fa-circle-info"></i> বিস্তারিত</button>
        </div>
      `;

      card.querySelector('.focus-river-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        selectRiverFromSuggestion(r);
        document.getElementById('mapSection').scrollIntoView({ behavior: 'smooth' });
      });

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

    // If more rivers remaining, show Load More button
    if (filteredRivers.length > currentRenderLimit) {
      const remaining = filteredRivers.length - currentRenderLimit;
      const loadMoreWrap = document.createElement('div');
      loadMoreWrap.id = 'loadMoreRiversBtnWrap';
      loadMoreWrap.className = 'load-more-container';
      loadMoreWrap.innerHTML = `
        <button id="loadMoreRiversBtn" class="btn btn-secondary btn-sm">
          <i class="fa-solid fa-plus"></i> আরো ২৪টি নদী দেখুন (${remaining}টি বাকি)
        </button>
      `;
      loadMoreWrap.querySelector('button').addEventListener('click', () => {
        currentRenderLimit += 24;
        renderRivers(false);
      });
      riversGrid.after(loadMoreWrap);
    }
  }

  // Open River Details Modal
  function openRiverModal(r) {
    if (!riverModal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="modal-header-section">
        <h3 style="font-size: 1.4rem; font-weight: 700; color: var(--accent-cyan);">${r.name_bn} (${r.name_en})</h3>
        <span class="status-badge status-${(r.status || '').replace(/\s+/g, '-')}">${r.status}</span>
      </div>

      <div class="modal-grid-details" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin: 14px 0;">
        <div class="modal-detail-box"><strong>নদী আইডি:</strong> ${r.id}</div>
        <div class="modal-detail-box"><strong>দৈর্ঘ্য:</strong> ${r.length_km} কিমি</div>
        <div class="modal-detail-box"><strong>অববাহিকা:</strong> ${r.basin}</div>
        <div class="modal-detail-box"><strong>অভিন্ন নদী:</strong> ${r.transboundary ? `হ্যাঁ (${r.transboundary_country})` : 'না (অভ্যন্তরীণ)'}</div>
      </div>

      <div style="background:var(--bg-input); padding:12px 14px; border-radius:var(--radius-sm); margin-bottom:12px;">
        <div style="margin-bottom:6px;"><strong>🟢 উৎস (Origin):</strong> ${r.origin_bn || ''} <span style="color:var(--text-muted); font-size:0.82rem;">(${r.origin_en || ''})</span></div>
        <div style="margin-bottom:6px;"><strong>🔴 মোহনা / পতন (Outfall):</strong> ${r.outfall_bn || ''} <span style="color:var(--text-muted); font-size:0.82rem;">(${r.outfall_en || ''})</span></div>
        <div><strong>প্রবাহ পথ:</strong> ${r.flow_path || 'তথ্য প্রক্রিয়াধীন'}</div>
      </div>

      <div style="margin-bottom:12px;">
        <strong>প্রবাহিত বিভাগ ও জেলাসমূহ:</strong>
        <div style="color:var(--text-secondary); margin-top:4px;">
          বিভাগ: ${(r.divisions || []).join(', ') || 'বাংলাদেশ'} | জেলা: ${(r.districts || []).join(', ') || 'তথ্য নেই'}
        </div>
      </div>

      ${r.historical_bcs_significance ? `
        <div style="background:rgba(245,158,11,0.08); border-left:4px solid #f59e0b; padding:10px 14px; border-radius:0 var(--radius-sm) var(--radius-sm) 0; margin-bottom:12px;">
          <strong style="color:#fbbf24;"><i class="fa-solid fa-graduation-cap"></i> বিসিএস ও চাকরির পরীক্ষার গুরুত্ব:</strong>
          <p style="margin-top:4px; font-size:0.88rem; color:var(--text-primary); line-height:1.5;">${r.historical_bcs_significance}</p>
        </div>
      ` : ''}

      ${r.description ? `
        <div style="font-size:0.88rem; color:var(--text-secondary); line-height:1.6; margin-bottom:14px;">
          <strong>বর্ণনা:</strong> ${r.description}
        </div>
      ` : ''}

      <div style="display:flex; gap:10px; justify-content:flex-end;">
        <button class="btn btn-secondary btn-sm" onclick="window.BD_RIVERS_APP.closeModal()">বন্ধ করুন</button>
        <button class="btn btn-primary btn-sm" onclick="window.BD_RIVERS_APP.focusRiver('${r.id}')"><i class="fa-solid fa-route"></i> ম্যাপে গতিপথ দেখুন</button>
      </div>
    `;

    riverModal.classList.remove('hidden');
  }

  function closeRiverModal() {
    if (riverModal) riverModal.classList.add('hidden');
  }

  // Render BCS Q&A Accordion
  function renderBCSQuestions() {
    if (!bcsAccordion) return;
    bcsAccordion.innerHTML = '';

    bcsQuestions.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'bcs-item';
      el.innerHTML = `
        <div class="bcs-header">
          <div style="display:flex; align-items:center;">
            <span class="bcs-cat-badge">${item.category || 'নদী তথ্যাবলী'}</span>
            <span class="bcs-q-text">${idx + 1}. ${item.question}</span>
          </div>
          <i class="fa-solid fa-chevron-down bcs-arrow"></i>
        </div>
        <div class="bcs-body">
          <div class="bcs-answer-box"><i class="fa-solid fa-circle-check"></i> ${item.answer}</div>
          <div class="bcs-explanation">${item.explanation || ''}</div>
        </div>
      `;

      el.querySelector('.bcs-header').addEventListener('click', () => {
        const body = el.querySelector('.bcs-body');
        const arrow = el.querySelector('.bcs-arrow');
        const isOpen = body.classList.toggle('open');
        arrow.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
      });

      bcsAccordion.appendChild(el);
    });
  }

  function copyTextFallback(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

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

  // Global APIs
  window.BD_RIVERS_APP = {
    allRivers: () => allRivers,
    search: (q) => {
      if (riverSearchInput) riverSearchInput.value = q;
      searchQuery = q.toLowerCase();
      applyFilters(false);
    },
    focusRiver: (id) => {
      closeRiverModal();
      const r = allRivers.find(x => x.id === id);
      if (r) {
        selectRiverFromSuggestion(r);
        document.getElementById('mapSection').scrollIntoView({ behavior: 'smooth' });
      }
    },
    closeModal: closeRiverModal,
    zoomToActiveRiver: zoomToActiveRiver,
    resetMapView: resetMapView
  };

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
