const fs = require('fs');
const path = require('path');

const RIVERS_PATH = path.join(__dirname, '..', '..', 'data', 'json', 'rivers.json');
const BCS_PATH = path.join(__dirname, '..', '..', 'data', 'json', 'bcs_qa.json');
const SUMMARY_PATH = path.join(__dirname, '..', '..', 'data', 'json', 'summary.json');

let _rivers = null;
let _bcs = null;
let _summary = null;

function loadRivers() {
  if (!_rivers) {
    _rivers = JSON.parse(fs.readFileSync(RIVERS_PATH, 'utf-8'));
  }
  return _rivers;
}

function loadBCS() {
  if (!_bcs) {
    _bcs = JSON.parse(fs.readFileSync(BCS_PATH, 'utf-8'));
  }
  return _bcs;
}

function loadSummary() {
  if (!_summary) {
    _summary = JSON.parse(fs.readFileSync(SUMMARY_PATH, 'utf-8'));
  }
  return _summary;
}

function getAllRivers() {
  return loadRivers();
}

function getRiverById(id) {
  const rivers = loadRivers();
  return rivers.find(r => r.id.toLowerCase() === id.toLowerCase()) || null;
}

function searchRivers(query, options = {}) {
  if (!query) return loadRivers();
  const q = query.trim().toLowerCase();
  const rivers = loadRivers();
  const nameOnly = options.nameOnly === true;

  const scoredResults = [];

  rivers.forEach(r => {
    let score = 0;
    const nameEn = (r.name_en || '').toLowerCase();
    const nameBn = (r.name_bn || '').toLowerCase();

    // Exact matches
    if (nameEn === q || nameBn === q || nameEn === q + ' river' || nameBn === q + ' নদী') {
      score += 10000;
    } else if (nameEn.startsWith(q) || nameBn.startsWith(q)) {
      score += 5000;
    } else if (nameEn.includes(q) || nameBn.includes(q)) {
      score += 1000;
    } else if (!nameOnly) {
      const originBn = (r.origin_bn || '').toLowerCase();
      const originEn = (r.origin_en || '').toLowerCase();
      const outfallBn = (r.outfall_bn || '').toLowerCase();
      const basin = (r.basin || '').toLowerCase();
      const districts = (r.districts || []).join(' ').toLowerCase();

      if (originBn.includes(q) || originEn.includes(q) || outfallBn.includes(q) || basin.includes(q) || districts.includes(q)) {
        score += 50;
      }
    }

    if (score > 0) {
      scoredResults.push({ river: r, score });
    }
  });

  // Sort by score descending (exact name matches always ranked highest)
  scoredResults.sort((a, b) => b.score - a.score);
  return scoredResults.map(item => item.river);
}

function getTransboundaryRivers() {
  const rivers = loadRivers();
  return rivers.filter(r => r.transboundary === true || r.is_transboundary === true);
}

function getRiversByBasin(basin) {
  const q = basin.toLowerCase();
  const rivers = loadRivers();
  return rivers.filter(r => r.basin && r.basin.toLowerCase().includes(q));
}

function getRiversByDistrict(district) {
  const q = district.toLowerCase();
  const rivers = loadRivers();
  return rivers.filter(r => r.districts && r.districts.some(d => d.toLowerCase().includes(q)));
}

function getRiversByStatus(status) {
  const q = status.toLowerCase();
  const rivers = loadRivers();
  return rivers.filter(r => r.status && r.status.toLowerCase().includes(q));
}

function getBCSQuestions() {
  return loadBCS();
}

function getSummary() {
  return loadSummary();
}

module.exports = {
  getAllRivers,
  getRiverById,
  searchRivers,
  getTransboundaryRivers,
  getRiversByBasin,
  getRiversByDistrict,
  getRiversByStatus,
  getBCSQuestions,
  getSummary
};
