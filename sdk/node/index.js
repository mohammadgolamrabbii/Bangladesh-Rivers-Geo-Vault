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

function searchRivers(query) {
  if (!query) return loadRivers();
  const q = query.trim().toLowerCase();
  const rivers = loadRivers();
  return rivers.filter(r => 
    (r.name_bn && r.name_bn.toLowerCase().includes(q)) ||
    (r.name_en && r.name_en.toLowerCase().includes(q)) ||
    (r.origin_bn && r.origin_bn.toLowerCase().includes(q)) ||
    (r.origin_en && r.origin_en.toLowerCase().includes(q)) ||
    (r.outfall_bn && r.outfall_bn.toLowerCase().includes(q)) ||
    (r.outfall_en && r.outfall_en.toLowerCase().includes(q)) ||
    (r.basin && r.basin.toLowerCase().includes(q)) ||
    (r.districts && r.districts.some(d => d.toLowerCase().includes(q))) ||
    (r.divisions && r.divisions.some(div => div.toLowerCase().includes(q))) ||
    (r.historical_bcs_significance && r.historical_bcs_significance.toLowerCase().includes(q))
  );
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
