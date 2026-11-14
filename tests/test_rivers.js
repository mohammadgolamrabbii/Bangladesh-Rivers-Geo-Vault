const assert = require('assert');
const fs = require('fs');
const path = require('path');
const sdk = require('../sdk/node/index');

console.log('🧪 Starting Bangladesh Rivers Geo-Vault Test Suite...\n');

// Test 1: Load all rivers via SDK
const rivers = sdk.getAllRivers();
console.log(`✓ Loaded ${rivers.length} rivers from dataset`);
assert(rivers.length >= 700, `Expected at least 700 rivers, found ${rivers.length}`);

// Test 2: Check transboundary rivers
const transboundary = sdk.getTransboundaryRivers();
console.log(`✓ Transboundary rivers count: ${transboundary.length}`);
assert.strictEqual(transboundary.length, 57, `Expected exactly 57 transboundary rivers, found ${transboundary.length}`);

const indiaRivers = transboundary.filter(r => r.transboundary_country && (r.transboundary_country.includes('ভারত') || r.transboundary_country.includes('India')));
const myanmarRivers = transboundary.filter(r => r.transboundary_country && (r.transboundary_country.includes('মায়ানমার') || r.transboundary_country.includes('মায়ানমার') || r.transboundary_country.includes('Myanmar')));
console.log(`  - India: ${indiaRivers.length}, Myanmar: ${myanmarRivers.length}`);
assert.strictEqual(indiaRivers.length, 54, `Expected 54 transboundary rivers with India`);
assert.strictEqual(myanmarRivers.length, 3, `Expected 3 transboundary rivers with Myanmar`);

// Test 3: Check iconic rivers exist
const iconicCheck = ['Padma', 'Meghna', 'Jamuna', 'Teesta', 'Halda', 'Karnafuli', 'Buriganga', 'Surma', 'Naf', 'Sangu'];
iconicCheck.forEach(name => {
  const found = sdk.searchRivers(name);
  assert(found.length > 0, `Iconic river ${name} must be present in search results`);
});
console.log(`✓ All 10 iconic rivers found and verified`);

// Test 4: BCS Questions validation
const bcs = sdk.getBCSQuestions();
console.log(`✓ Loaded ${bcs.length} BCS preparation Q&A`);
assert(bcs.length >= 30, `Expected at least 30 BCS Q&A items, found ${bcs.length}`);
bcs.forEach((item, idx) => {
  assert(item.id, `Item ${idx} missing id`);
  assert(item.question || item.question_bn, `Item ${idx} missing question`);
  assert(item.answer || item.answer_bn, `Item ${idx} missing answer`);
  assert(item.explanation || item.explanation_bn, `Item ${idx} missing explanation`);
});
console.log(`✓ All BCS Q&A items validated with complete explanation`);

// Test 5: GeoJSON validation
const geojsonPath = path.join(__dirname, '..', 'data', 'geojson', 'rivers.geojson');
const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
assert.strictEqual(geojson.type, 'FeatureCollection');
assert.strictEqual(geojson.features.length, rivers.length, 'GeoJSON features count must match rivers.json count');
console.log(`✓ GeoJSON FeatureCollection validated with ${geojson.features.length} features`);

// Test 6: Summary validation
const summary = sdk.getSummary();
assert.strictEqual(summary.total_rivers, rivers.length);
assert.strictEqual(summary.transboundary_count, 57);
console.log(`✓ Summary stats aligned perfectly with dataset`);

console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% Quality Assured.\n');
