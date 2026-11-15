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
  let tileLayers = {};
  let activeBasemapLayer = null;
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
  const searchSuggestions = document.getElementById('searchSuggestions');
  const fullscreenMapBtn = document.getElementById('fullscreenMapBtn');
  const mapSection = document.getElementById('mapSection');
  const filterBasin = document.getElementById('filterBasin');
  
  const mapFloatingSearchInput = document.getElementById('mapFloatingSearchInput');
  const clearFloatingSearchBtn = document.getElementById('clearFloatingSearchBtn');
  const floatingSearchSuggestions = document.getElementById('floatingSearchSuggestions');
  const mapFloatingRiverCard = document.getElementById('mapFloatingRiverCard');
  const floatingLocateBtn = document.getElementById('floatingLocateBtn');
  const floatingResetBtn = document.getElementById('floatingResetBtn');
  const floatingFullscreenBtn = document.getElementById('floatingFullscreenBtn');
  const closeFloatingCardBtn = document.getElementById('closeFloatingCardBtn');
  const floatingCardZoomBtn = document.getElementById('floatingCardZoomBtn');
  const floatingCardDetailsBtn = document.getElementById('floatingCardDetailsBtn');
  let userGpsMarker = null;
  let currentlySelectedRiver = null;
  let activeFloatingSuggestionIndex = -1;

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

  let activeSuggestionIndex = -1;

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
      maxZoom: 20,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 100,
      wheelDebounceTime: 40
    });

    // Dynamic Metric Scale Bar (Google Maps benchmark)
    L.control.scale({
      metric: true,
      imperial: false,
      position: 'bottomleft',
      maxWidth: 130
    }).addTo(map);

    // Basemap Tile Layers
    tileLayers = {
      // Google Maps Hybrid (Satellite + Road & Place Names) - DEFAULT
      googleHybrid: L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20,
        attribution: 'Map data &copy; Google'
      }),
      // Google Maps Standard Roadmap
      googleRoadmap: L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        maxZoom: 20,
        attribution: 'Map data &copy; Google'
      }),
      // Esri World Imagery (HD Satellite)
      esriSat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS',
        maxZoom: 18
      }),
      // OpenStreetMap Standard
      osm: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      })
    };

    // Default layer is GOOGLE SATELLITE (Hybrid)
    activeBasemapLayer = tileLayers.googleHybrid;
    activeBasemapLayer.addTo(map);

    // Layer groups for rivers and course markers
    riverLayerGroup = L.layerGroup().addTo(map);
    flowMarkerGroup = L.layerGroup().addTo(map);

    // Render river lines on map
    renderMapRivers();
  }

  // Catmull-Rom Spline Curve Interpolation (Only used for sparse placeholder rivers)
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

  // Get true geographic river rendering coordinates
  function getRiverRenderCoords(rawCoords, seed = 42) {
    if (!rawCoords || rawCoords.length < 2) return rawCoords || [];
    
    // If river already has surveyed GPS nodes (e.g. Balu 495 pts, Jamuna 516 pts, Padma 323 pts, etc.)
    // Preserve 100% of the true geographic survey line with zero distortion!
    if (rawCoords.length >= 10) {
      return rawCoords;
    }

    // For sparse placeholder rivers with only 2-5 points, add natural gentle deltaic bends
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

  // Render River Polylines on Map
  function renderMapRivers() {
    if (!map || !riverLayerGroup) return;
    riverLayerGroup.clearLayers();

    // Show up to 250 rivers for high responsiveness
    const mapSelection = filteredRivers.slice(0, 250);

    mapSelection.forEach((river, idx) => {
      if (!river.coords || river.coords.length < 2) return;

      const renderCoords = getRiverRenderCoords(river.coords, idx + 1);

      let lineColor = '#0284c7'; // Google Maps River Blue
      if (river.status && river.status.includes('বিপন্ন')) lineColor = '#f43f5e';
      else if (river.status && river.status.includes('ভরাট')) lineColor = '#f59e0b';
      else if (river.status && river.status.includes('মৌসুমি')) lineColor = '#8b5cf6';

      const polyline = L.polyline(renderCoords, {
        color: lineColor,
        weight: river.length_km > 100 ? 3.5 : 2.5,
        opacity: 0.88,
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
        polyline.setStyle({ weight: 5.5, opacity: 1 });
      });

      polyline.on('mouseout', () => {
        if (highlightedPolyline !== polyline) {
          polyline.setStyle({ weight: river.length_km > 100 ? 3.5 : 2.5, opacity: 0.88 });
        }
      });

      polyline.addTo(riverLayerGroup);
    });
  }

  // Highlight and trace complete river flow path on map (Google Maps Ground-Truth Style)
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

    const riverCoords = getRiverRenderCoords(river.coords, 999);

    // Glowing cyan river halo (Google Maps style water outline)
    highlightGlowPolyline = L.polyline(riverCoords, {
      color: '#38bdf8', // crisp cyan-sky blue halo
      weight: 8,
      opacity: 0.55,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Core River Blue line (exact Google Maps river color)
    highlightedPolyline = L.polyline(riverCoords, {
      color: '#0284c7', // vibrant deep river blue
      weight: 4.8,
      opacity: 1,
      dashArray: null,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Origin Marker (Green Pin) with Permanent Floating Tooltip
    const originPt = riverCoords[0];
    const originMarker = L.circleMarker(originPt, {
      radius: 9,
      fillColor: '#10b981',
      color: '#ffffff',
      weight: 2.5,
      opacity: 1,
      fillOpacity: 1
    }).bindPopup(`<strong>উৎস (Origin):</strong> ${river.origin_bn || river.origin_en}<br>নদী: ${river.name_bn} (${river.name_en})`)
      .bindTooltip(`🟢 উৎস: ${river.origin_bn || river.origin_en}`, {
        permanent: true,
        direction: 'top',
        className: 'origin-flow-tooltip',
        offset: [0, -8]
      })
      .addTo(flowMarkerGroup);

    // Outfall Marker (Red Pin) with Permanent Floating Tooltip
    const outfallPt = riverCoords[riverCoords.length - 1];
    const outfallMarker = L.circleMarker(outfallPt, {
      radius: 9,
      fillColor: '#ef4444',
      color: '#ffffff',
      weight: 2.5,
      opacity: 1,
      fillOpacity: 1
    }).bindPopup(`<strong>পতন / মোহনা (Outfall):</strong> ${river.outfall_bn || river.outfall_en}<br>দৈর্ঘ্য: ${river.length_km} কিমি`)
      .bindTooltip(`🔴 পতন: ${river.outfall_bn || river.outfall_en}`, {
        permanent: true,
        direction: 'bottom',
        className: 'outfall-flow-tooltip',
        offset: [0, 8]
      })
      .addTo(flowMarkerGroup);

    // Smart Close-up Zoom: Invalidate size and fly smoothly to river bounds with optimal zoom
    if (map) {
      map.invalidateSize();
      const bounds = highlightedPolyline.getBounds();
      if (bounds.isValid()) {
        setTimeout(() => {
          map.flyToBounds(bounds, {
            padding: [60, 60],
            maxZoom: 13,
            duration: 1.2
          });
        }, 50);
      }
    }

    // Update active banner and selected river text
    if (selectedRiverText) {
      selectedRiverText.innerHTML = `গতিপথ ফোকাস: <strong>${river.name_bn} (${river.name_en})</strong> | দৈর্ঘ্য: ${river.length_km} কিমি | অববাহিকা: ${river.basin}`;
    }
    updateFloatingRiverCard(river);

    if (activeFlowBanner) {
      activeFlowBanner.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <i class="fa-solid fa-water"></i> <strong>${river.name_bn} (${river.name_en})</strong> নদীর সম্পূর্ণ <strong>${river.length_km} কিমি</strong> গতিপথ প্রদর্শিত হচ্ছে।
          <span style="font-size:0.82rem; opacity:0.9;">[উৎস: ${river.origin_bn} ➔ পতন: ${river.outfall_bn}]</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-sm btn-primary" onclick="window.BD_RIVERS_APP.zoomToActiveRiver()" style="padding:4px 10px; font-size:0.75rem;"><i class="fa-solid fa-magnifying-glass-plus"></i> ক্লোজ-আপ জুম</button>
          <button class="btn btn-sm btn-outline" onclick="window.BD_RIVERS_APP.resetMapView()" style="padding:4px 8px; font-size:0.75rem;"><i class="fa-solid fa-xmark"></i> বন্ধ করুন</button>
        </div>
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

    // Basemap Switcher Buttons (Google Satellite, Google Maps, Esri, OSM)
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

    // Reset Map View
    if (resetMapBtn) {
      resetMapBtn.addEventListener('click', resetMapView);
    }

    // Fullscreen Map Toggle Button
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

    // Search Input with Debounce & Live Autocomplete
    let searchTimeout;
    if (riverSearchInput) {
      riverSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const val = e.target.value.trim();
        if (clearSearchBtn) clearSearchBtn.classList.toggle('hidden', val.length === 0);

        // Show instant live autocomplete suggestions
        renderAutocomplete(val);

        searchTimeout = setTimeout(() => {
          searchQuery = val.toLowerCase();
          applyFilters();
        }, 120);
      });

      // Keyboard navigation for autocomplete suggestions
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
          }
        } else if (e.key === 'Escape') {
          searchSuggestions.classList.add('hidden');
        }
      });
    }

    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
      if (searchSuggestions && !searchSuggestions.contains(e.target) && e.target !== riverSearchInput) {
        searchSuggestions.classList.add('hidden');
      }
    });

    // Clear Search Button
    
    // Google Maps Floating Search Input & Sync
    let floatingSearchTimeout;
    if (mapFloatingSearchInput) {
      mapFloatingSearchInput.addEventListener('input', (e) => {
        clearTimeout(floatingSearchTimeout);
        const val = e.target.value.trim();
        if (clearFloatingSearchBtn) clearFloatingSearchBtn.classList.toggle('hidden', val.length === 0);
        if (riverSearchInput) riverSearchInput.value = val;
        if (clearSearchBtn) clearSearchBtn.classList.toggle('hidden', val.length === 0);

        // Render autocomplete into floating dropdown
        renderFloatingAutocomplete(val);

        floatingSearchTimeout = setTimeout(() => {
          searchQuery = val.toLowerCase();
          applyFilters();
        }, 120);
      });

      // Keyboard navigation for floating autocomplete
      mapFloatingSearchInput.addEventListener('keydown', (e) => {
        if (!floatingSearchSuggestions || floatingSearchSuggestions.classList.contains('hidden')) return;
        const items = floatingSearchSuggestions.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          activeFloatingSuggestionIndex = (activeFloatingSuggestionIndex + 1) % items.length;
          items.forEach((it, i) => it.classList.toggle('active', i === activeFloatingSuggestionIndex));
          items[activeFloatingSuggestionIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          activeFloatingSuggestionIndex = (activeFloatingSuggestionIndex - 1 + items.length) % items.length;
          items.forEach((it, i) => it.classList.toggle('active', i === activeFloatingSuggestionIndex));
          items[activeFloatingSuggestionIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          if (activeFloatingSuggestionIndex >= 0 && activeFloatingSuggestionIndex < items.length) {
            e.preventDefault();
            items[activeFloatingSuggestionIndex].click();
          }
        } else if (e.key === 'Escape') {
          floatingSearchSuggestions.classList.add('hidden');
        }
      });
    }

    // Clear Floating Search Button
    if (clearFloatingSearchBtn) {
      clearFloatingSearchBtn.addEventListener('click', () => {
        if (mapFloatingSearchInput) mapFloatingSearchInput.value = '';
        if (riverSearchInput) riverSearchInput.value = '';
        clearFloatingSearchBtn.classList.add('hidden');
        if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
        searchQuery = '';
        if (floatingSearchSuggestions) floatingSearchSuggestions.classList.add('hidden');
        if (searchSuggestions) searchSuggestions.classList.add('hidden');
        resetMapView();
        applyFilters();
      });
    }

    // Close floating autocomplete when clicking outside
    document.addEventListener('click', (e) => {
      if (floatingSearchSuggestions && !floatingSearchSuggestions.contains(e.target) && e.target !== mapFloatingSearchInput) {
        floatingSearchSuggestions.classList.add('hidden');
      }
    });

    // Floating Action Buttons (FABs)
    if (floatingLocateBtn) {
      floatingLocateBtn.addEventListener('click', locateUser);
    }
    if (floatingResetBtn) {
      floatingResetBtn.addEventListener('click', resetMapView);
    }
    if (floatingFullscreenBtn) {
      floatingFullscreenBtn.addEventListener('click', () => {
        if (fullscreenMapBtn) fullscreenMapBtn.click();
      });
    }

    // Floating River Dossier Card Buttons
    if (closeFloatingCardBtn) {
      closeFloatingCardBtn.addEventListener('click', () => {
        if (mapFloatingRiverCard) mapFloatingRiverCard.classList.add('hidden');
      });
    }
    if (floatingCardZoomBtn) {
      floatingCardZoomBtn.addEventListener('click', () => {
        if (highlightedPolyline && map) {
          map.invalidateSize();
          const bounds = highlightedPolyline.getBounds();
          if (bounds.isValid()) {
            map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 14, duration: 1.2 });
          }
        }
      });
    }
    if (floatingCardDetailsBtn) {
      floatingCardDetailsBtn.addEventListener('click', () => {
        if (currentlySelectedRiver) {
          openRiverModal(currentlySelectedRiver);
        }
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        if (riverSearchInput) riverSearchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        searchQuery = '';
        if (searchSuggestions) searchSuggestions.classList.add('hidden');
        resetMapView();
        applyFilters();
        if (riverSearchInput) riverSearchInput.focus();
      });
    }

    // Quick Search Tags
    document.querySelectorAll('.quick-tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-query');
        if (riverSearchInput) riverSearchInput.value = q;
        if (clearSearchBtn) clearSearchBtn.classList.remove('hidden');
        searchQuery = q.toLowerCase();
        if (searchSuggestions) searchSuggestions.classList.add('hidden');
        applyFilters();
        if (filteredRivers.length > 0) {
          focusRiverOnMap(filteredRivers[0]);
        }
      });
    });

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

  // Zoom directly into current active river bounds
  function zoomToActiveRiver() {
    if (highlightedPolyline && map) {
      map.invalidateSize();
      const bounds = highlightedPolyline.getBounds();
      if (bounds.isValid()) {
        map.flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14,
          duration: 1.2
        });
      }
    }
  }

  // Live Instant Autocomplete Dropdown
  
  function renderFloatingAutocomplete(query) {
    if (!floatingSearchSuggestions) return;
    const q = (query || '').toLowerCase().trim();
    if (!q || q.length < 1) {
      floatingSearchSuggestions.innerHTML = '';
      floatingSearchSuggestions.classList.add('hidden');
      activeFloatingSuggestionIndex = -1;
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
      floatingSearchSuggestions.innerHTML = `<div style="padding: 12px 16px; color: var(--text-muted); font-size: 0.85rem;"><i class="fa-solid fa-circle-question"></i> কোনো নদী পাওয়া যায়নি (যেমন: balu, পদ্মা, তুরাগ)।</div>`;
      floatingSearchSuggestions.classList.remove('hidden');
      return;
    }

    floatingSearchSuggestions.innerHTML = topMatches.map((item, idx) => {
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
              <span class="suggestion-en">${r.name_en}</span>
              ${r.transboundary ? '<span style="font-size:0.7rem; color:#38bdf8; font-weight:600;"><i class="fa-solid fa-flag"></i> অভিন্ন</span>' : ''}
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

    floatingSearchSuggestions.classList.remove('hidden');
    activeFloatingSuggestionIndex = -1;

    floatingSearchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        const river = allRivers.find(x => x.id === id);
        if (river) {
          selectRiverFromSuggestion(river);
        }
      });
    });
  }

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
      searchSuggestions.innerHTML = `<div style="padding: 14px 18px; color: var(--text-muted); font-size: 0.9rem;"><i class="fa-solid fa-circle-question"></i> কোনো নদী পাওয়া যায়নি। বানানের সঠিক রূপ চেষ্টা করুন (যেমন: balu, তুরাগ, পদ্মা)।</div>`;
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
              <span class="suggestion-en">${r.name_en}</span>
              ${r.transboundary ? '<span style="font-size:0.7rem; color:#38bdf8; font-weight:600;"><i class="fa-solid fa-flag"></i> অভিন্ন নদী</span>' : ''}
            </div>
            <div class="suggestion-meta">
              <span><i class="fa-solid fa-location-dot"></i> ${(r.districts || []).slice(0, 3).join(', ')}</span>
              <span>&bull;</span>
              <span><i class="fa-solid fa-water"></i> ${r.basin}</span>
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

    // Attach click listeners to suggestions
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

  
  // Update Google Maps-style Floating River Dossier Card
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

  // Google Maps-Grade Geolocation & Nearest River Detection
  function locateUser() {
    if (!navigator.geolocation) {
      alert('আপনার ব্রাউজারে Geolocation সমর্থিত নয়।');
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

        // Find nearest river in allRivers
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
          ? `<div style="font-size:0.88rem; line-height:1.4;"><strong><i class="fa-solid fa-location-crosshairs" style="color:#0284c7;"></i> আপনার বর্তমান অবস্থান (GPS)</strong><br>সবচেয়ে নিকটবর্তী নদী: <strong>${nearestRiver.name_bn}</strong> (${nearestRiver.name_en})<br>দূরত্ব: মাত্র <strong>${distText}</strong> দূরে!<br><br><button id="gpsFlyBtn" class="btn btn-xs btn-primary" style="padding: 4px 10px; font-size: 0.78rem; border-radius: 4px; cursor: pointer;">নদীটির গতিপথ দেখুন ➔</button></div>`
          : `<strong>আপনার অবস্থান (GPS)</strong><br>অক্ষাংশ: ${lat.toFixed(4)}, দ্রাঘিমাংশ: ${lng.toFixed(4)}`;

        userGpsMarker.bindPopup(popupContent).openPopup();
        map.flyTo([lat, lng], 13, { duration: 1.2 });

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
        alert('আপনার ভৌগোলিক অবস্থান পাওয়া যায়নি (' + (err.message || 'অনুমতি বাতিল') + ')।');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  function selectRiverFromSuggestion(river) {
    currentlySelectedRiver = river;
    if (riverSearchInput) {
      riverSearchInput.value = river.name_bn;
    }
    if (mapFloatingSearchInput) {
      mapFloatingSearchInput.value = river.name_bn;
    }
    if (clearSearchBtn) {
      clearSearchBtn.classList.remove('hidden');
    }
    if (clearFloatingSearchBtn) {
      clearFloatingSearchBtn.classList.remove('hidden');
    }
    searchQuery = river.name_bn.toLowerCase();
    if (searchSuggestions) {
      searchSuggestions.classList.add('hidden');
    }
    if (floatingSearchSuggestions) {
      floatingSearchSuggestions.classList.add('hidden');
    }
    applyFilters();
    focusRiverOnMap(river);
    updateFloatingRiverCard(river);
  }

  // Apply filters with Smart Relevance Scoring
  function applyFilters() {
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
          score = 2000;
        } else {
          // Broad matching in other attributes
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
