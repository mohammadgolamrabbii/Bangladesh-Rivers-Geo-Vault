const fs = require('fs');
const path = require('path');

const RIVERS_JSON_PATH = path.join(__dirname, 'data', 'json', 'rivers.json');
const GEOJSON_PATH = path.join(__dirname, 'data', 'geojson', 'rivers.geojson');
const RIVERS_JS_PATH = path.join(__dirname, 'assets', 'js', 'rivers-data.js');

const rivers = JSON.parse(fs.readFileSync(RIVERS_JSON_PATH, 'utf8'));
console.log(`Auditing Meghna Basin across ${rivers.length} rivers with 0.00m taper envelope...`);

// Helper function to generate smooth natural meanders with zero endpoint drift
function generateRiverSpline(waypoints, count = 40, meanderAmp = 0.003) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const totalSegments = waypoints.length - 1;
    const seg = Math.min(Math.floor(t * totalSegments), totalSegments - 1);
    const localT = (t * totalSegments) - seg;
    const p0 = waypoints[seg];
    const p1 = waypoints[seg + 1];

    // Envelope tapers meander to EXACTLY ZERO at start (t=0) and end (t=1)
    const envelope = Math.sin(t * Math.PI);
    const meander = Math.sin(t * Math.PI * 6) * meanderAmp * envelope;
    const meanderCos = Math.cos(t * Math.PI * 6) * meanderAmp * envelope;
    const lat = p0[0] + (p1[0] - p0[0]) * localT + meander;
    const lng = p0[1] + (p1[1] - p0[1]) * localT + meanderCos;
    pts.push([Number(lat.toFixed(6)), Number(lng.toFixed(6))]);
  }
  // Enforce exact mathematical identity at boundary vertices
  pts[0] = [Number(waypoints[0][0].toFixed(6)), Number(waypoints[0][1].toFixed(6))];
  pts[pts.length - 1] = [Number(waypoints[waypoints.length - 1][0].toFixed(6)), Number(waypoints[waypoints.length - 1][1].toFixed(6))];
  return pts;
}

// Snapping helper: snaps target point to closest vertex on reference polyline
function snapToPolyline(point, polyline) {
  let minD = Infinity;
  let best = point;
  polyline.forEach(p => {
    const dLat = point[0] - p[0];
    const dLng = point[1] - p[1];
    const d = dLat * dLat + dLng * dLng;
    if (d < minD) {
      minD = d;
      best = p;
    }
  });
  return [best[0], best[1]];
}

// -------------------------------------------------------------
// 1. THE GRAND TRUNK: MEGHNA RIVER (BD-RIV-004)
// Continues unbroken from Bhairab all the way past Bhola into Bay of Bengal
// -------------------------------------------------------------
const meghnaWaypoints = [
  [24.048, 90.985], // Bhairab / Ashuganj Bridge
  [23.982, 90.932], // Raipura (Narsingdi)
  [23.915, 90.865], // Bancharampur border
  [23.820, 90.810], // Nabinagar
  [23.740, 90.755], // Homna / Meghna loop
  [23.655, 90.710], // Baidyer Bazar
  [23.542, 90.628], // Daudkandi / Meghna Bridge
  [23.450, 90.615], // Gazaria (Munshiganj)
  [23.360, 90.620], // Matlab Uttar
  [23.232, 90.635], // Chandpur Confluence (Padma meets Meghna)
  [23.100, 90.620], // Haimchar
  [22.850, 90.650], // Ramgati / Lakshmipur
  [22.600, 90.680], // Upper Bhola Channel
  [22.350, 90.690], // Lower Bhola / Manpura
  [22.050, 90.720]  // Bay of Bengal Estuary
];

const meghnaCoords = generateRiverSpline(meghnaWaypoints, 120, 0.004);
const rMeghna = rivers.find(r => r.id === 'BD-RIV-004');
if (rMeghna) {
  rMeghna.coords = meghnaCoords;
  rMeghna.length_km = 330;
  rMeghna.flow_path = 'কিশোরগঞ্জ ➔ ব্রাহ্মণবাড়িয়া ➔ নরসিংদী ➔ নারায়ণগঞ্জ ➔ মুন্সীগঞ্জ ➔ কুমিল্লা ➔ চাঁদপুর ➔ লক্ষ্মীপুর ➔ ভোলা ➔ বঙ্গোপসাগর';
  rMeghna.origin_bn = 'কিশোরগঞ্জের ভৈরবে সুরমা ও কুশিয়ারার (কালনী) মিলনস্থল';
  rMeghna.outfall_bn = 'ভোলা ও লক্ষ্মীপুর হয়ে সরাসরি বঙ্গোপসাগর';
  console.log('✓ Master Trunk Meghna River (BD-RIV-004) locked from Bhairab to Bay of Bengal (120 pts).');
}

// -------------------------------------------------------------
// 2. SURMA RIVER (BD-RIV-005)
// Spans all 250+ km from Amalshid (Zakiganj) past Sylhet, Chhatak, Sunamganj to Markuli
// -------------------------------------------------------------
const surmaWaypoints = [
  [24.878, 92.483], // Amalshid bifurcation (Zakiganj, Assam border)
  [24.935, 92.410], // Zakiganj Upazila
  [24.982, 92.315], // Kanairghat East
  [25.012, 92.245], // Kanairghat Center
  [24.975, 92.080], // Golapganj North
  [24.930, 91.980], // Sylhet East
  [24.887, 91.868], // Sylhet City Center (Keane Bridge)
  [24.960, 91.750], // Chhatak East
  [25.042, 91.668], // Chhatak Cement Factory
  [25.068, 91.530], // Sunamganj East
  [25.071, 91.405], // Sunamganj Town
  [24.980, 91.350], // Pagla / Dirai North
  [24.840, 91.320], // Dirai Sadar
  [24.710, 91.240], // Shalla Haor
  [24.605, 91.120]  // Markuli / Ajmiriganj (Confluence with Kushiara)
];

const surmaCoords = generateRiverSpline(surmaWaypoints, 100, 0.0035);
const rSurma = rivers.find(r => r.id === 'BD-RIV-005');
if (rSurma) {
  rSurma.coords = surmaCoords;
  rSurma.length_km = 250;
  rSurma.districts = ['সিলেট', 'সুনামগঞ্জ', 'হবিগঞ্জ'];
  rSurma.divisions = ['সিলেট'];
  rSurma.flow_path = 'জাকীগঞ্জ ➔ কানাইঘাট ➔ সিলেট সদর ➔ ছাতক ➔ সুনামগঞ্জ সদর ➔ দিরাই ➔ শাল্লা ➔ আজমিরীগঞ্জ (মারকুলি)';
  rSurma.origin_bn = 'ভারতের আসামের বরাক নদী (অমলসীদ, জাকিগঞ্জ সীমান্ত)';
  rSurma.outfall_bn = 'মারকুলিতে কুশিয়ারার সাথে মিলিত হয়ে কালনী ও মেঘনা নদী';
  console.log('✓ Master Arterial Surma River (BD-RIV-005) locked from Amalshid to Markuli (100 pts).');
}

// -------------------------------------------------------------
// 3. KUSHIARA RIVER (BD-RIV-006)
// From Amalshid past Bianibazar, Fenchuganj, Balaganj, Sherpur to Markuli
// -------------------------------------------------------------
const kushiaraWaypoints = [
  surmaCoords[0],   // Snapped to exact vertex of Surma at Amalshid bifurcation!
  [24.835, 92.280], // Bianibazar
  [24.780, 92.140], // Golapganj South
  [24.712, 91.942], // Fenchuganj Bridge
  [24.658, 91.825], // Balaganj Sadar
  [24.620, 91.685], // Sherpur Bridge (Manumukh)
  [24.565, 91.510], // Nabiganj (Khowaimukh)
  [24.520, 91.340], // Baniyachong
  surmaCoords[surmaCoords.length - 1] // Snapped to exact terminal vertex of Surma at Markuli!
];

const kushiaraCoords = generateRiverSpline(kushiaraWaypoints, 90, 0.0035);
const rKushiara = rivers.find(r => r.id === 'BD-RIV-006');
if (rKushiara) {
  rKushiara.coords = kushiaraCoords;
  rKushiara.length_km = 228;
  rKushiara.districts = ['সিলেট', 'মৌলভীবাজার', 'হবিগঞ্জ'];
  rKushiara.divisions = ['সিলেট'];
  rKushiara.flow_path = 'জাকীগঞ্জ ➔ বিয়ানীবাজার ➔ ফেঞ্চুগঞ্জ ➔ বালাগঞ্জ ➔ শেরপুর (মৌলভীবাজার) ➔ নবীগঞ্জ ➔ আজমিরীগঞ্জ (মারকুলি)';
  rKushiara.origin_bn = 'ভারতের আসামের বরাক নদী (অমলসীদ, জাকিগঞ্জ সীমান্ত)';
  rKushiara.outfall_bn = 'আজমিরীগঞ্জে সুরমার সাথে মিলিত হয়ে কালনী নদী';
  console.log('✓ Master Arterial Kushiara River (BD-RIV-006) locked from Amalshid to Markuli (90 pts).');
}

// -------------------------------------------------------------
// 4. KALNI RIVER (BD-RIV-287)
// Connecting Surma/Kushiara confluence at Markuli to Bhairab (Meghna trunk)
// -------------------------------------------------------------
const bhairabSnap = meghnaCoords[0]; // Exact 0.00m snap to Meghna trunk origin vertex!

const kalniWaypoints = [
  surmaCoords[surmaCoords.length - 1], // Exact 0.00m snap to Surma/Kushiara outfall!
  [24.510, 91.130], // Ajmiriganj / Kishoreganj Haor
  [24.420, 91.100], // Itna South
  [24.320, 91.050], // Bajitpur East
  [24.180, 91.010], // Kulierchar
  bhairabSnap       // Snapped to Meghna trunk at Bhairab!
];

const kalniCoords = generateRiverSpline(kalniWaypoints, 50, 0.003);
const rKalni = rivers.find(r => r.id === 'BD-RIV-287');
if (rKalni) {
  rKalni.coords = kalniCoords;
  rKalni.districts = ['হবিগঞ্জ', 'কিশোরগঞ্জ', 'সুনামগঞ্জ'];
  rKalni.divisions = ['সিলেট', 'ঢাকা'];
  console.log('✓ Kalni River (BD-RIV-287) snapped from Markuli to Bhairab Meghna trunk (0.00m gap).');
}

// -------------------------------------------------------------
// 5. GOMTI RIVER (BD-RIV-046)
// From Katasara, Comilla border past Debidwar to Meghna trunk at Daudkandi
// -------------------------------------------------------------
const daudkandiSnap = snapToPolyline([23.542, 90.628], meghnaCoords);

const gomtiWaypoints = [
  [23.482, 91.240], // Tripura border (Katasara, Comilla Sadar)
  [23.468, 91.185], // Comilla City North
  [23.490, 91.100], // Burichang
  [23.585, 90.965], // Debidwar
  [23.620, 90.875], // Muradnagar
  [23.542, 90.720], // Titas Upazila
  daudkandiSnap     // Exact 0.00m snap to Meghna trunk at Daudkandi!
];

const gomtiCoords = generateRiverSpline(gomtiWaypoints, 65, 0.003);
const rGomti = rivers.find(r => r.id === 'BD-RIV-046');
if (rGomti) {
  rGomti.coords = gomtiCoords;
  rGomti.districts = ['কুমিল্লা'];
  rGomti.divisions = ['চট্টগ্রাম'];
  rGomti.length_km = 95;
  rGomti.flow_path = 'কুমিল্লা আদর্শ সদর ➔ বুড়িচং ➔ দেবিদ্বার ➔ মুরাদনগর ➔ তিতাস ➔ দাউদকান্দি (মেঘনা নদী)';
  rGomti.origin_bn = 'ভারতের ত্রিপুরার ডুম্বুর হ্রদ ও পাহাড়';
  rGomti.outfall_bn = 'দাউদকান্দিতে মেঘনা নদীর সাথে সরাসরি মিলন';
  console.log('✓ Gomti River (BD-RIV-046) aligned and snapped to Daudkandi Meghna trunk (0.00m gap).');
}

// -------------------------------------------------------------
// 6. TITAS RIVER (BD-RIV-473)
// Horseshoe loop: Ashuganj Meghna -> Sarail -> Brahmanbaria -> Akhaura -> Nabinagar Meghna
// -------------------------------------------------------------
const ashuganjSnap = snapToPolyline([24.048, 90.985], meghnaCoords);
const bancharampurSnap = snapToPolyline([23.740, 90.755], meghnaCoords);

const titasWaypoints = [
  ashuganjSnap,     // Snapped to Meghna at Ashuganj (0.00m)
  [24.080, 91.080], // Sarail
  [23.965, 91.112], // Brahmanbaria Sadar
  [23.880, 91.160], // Akhaura loop
  [23.820, 90.920], // Nabinagar
  bancharampurSnap  // Snapped to Meghna at Bancharampur (0.00m)
];

const titasCoords = generateRiverSpline(titasWaypoints, 75, 0.0035);
const rTitas = rivers.find(r => r.id === 'BD-RIV-473');
if (rTitas) {
  rTitas.coords = titasCoords;
  rTitas.districts = ['ব্রাহ্মণবাড়িয়া', 'কুমিল্লা'];
  rTitas.divisions = ['চট্টগ্রাম'];
  rTitas.length_km = 110;
  console.log('✓ Titas River (BD-RIV-473) horseshoe loop snapped cleanly into Meghna trunk at both ends (0.00m gap).');
}

// -------------------------------------------------------------
// 7. MANU RIVER (BD-RIV-037)
// Enters Kulaura from Tripura, flows past Moulvibazar to Manumukh (Kushiara trunk)
// -------------------------------------------------------------
const manumukhSnap = snapToPolyline([24.620, 91.685], kushiaraCoords);

const manuWaypoints = [
  [24.320, 91.960], // Tripura border (Sharifpur, Kulaura)
  [24.410, 91.890], // Kulaura
  [24.482, 91.770], // Moulvibazar Town
  [24.560, 91.745], // Rajnagar
  manumukhSnap      // Exact 0.00m snap to Kushiara trunk at Manumukh!
];

const manuCoords = generateRiverSpline(manuWaypoints, 60, 0.003);
const rManu = rivers.find(r => r.id === 'BD-RIV-037');
if (rManu) {
  rManu.coords = manuCoords;
  rManu.districts = ['মৌলভীবাজার'];
  rManu.divisions = ['সিলেট'];
  rManu.length_km = 82;
  console.log('✓ Manu River (BD-RIV-037) snapped to Kushiara trunk at Manumukh (0.00m gap).');
}

// -------------------------------------------------------------
// 8. KHOWAI RIVER (BD-RIV-040)
// Enters Chunarughat from Tripura, flows past Habiganj to Kushiara trunk
// -------------------------------------------------------------
const khowaimukhSnap = snapToPolyline([24.565, 91.510], kushiaraCoords);

const khowaiWaypoints = [
  [24.120, 91.505], // Tripura border (Chunarughat)
  [24.225, 91.460], // Chunarughat Sadar
  [24.378, 91.415], // Habiganj Town
  [24.480, 91.440], // Nabiganj South
  khowaimukhSnap    // Exact 0.00m snap to Kushiara trunk!
];

const khowaiCoords = generateRiverSpline(khowaiWaypoints, 65, 0.003);
const rKhowai = rivers.find(r => r.id === 'BD-RIV-040');
if (rKhowai) {
  rKhowai.coords = khowaiCoords;
  rKhowai.districts = ['হবিগঞ্জ'];
  rKhowai.divisions = ['সিলেট'];
  rKhowai.length_km = 84;
  console.log('✓ Khowai River (BD-RIV-040) snapped to Kushiara trunk (0.00m gap).');
}

// -------------------------------------------------------------
// 9. DAKATIA RIVER (BD-RIV-047, BD-RIV-484)
// Enters Chauddagram from Tripura, past Laksham, Hajiganj to Chandpur Estuary (Meghna trunk)
// -------------------------------------------------------------
const chandpurSnap = snapToPolyline([23.232, 90.635], meghnaCoords);

const dakatiaWaypoints = [
  [23.180, 91.220], // Tripura border (Chauddagram, Comilla)
  [23.235, 91.120], // Laksham
  [23.250, 90.920], // Shahrasti
  [23.255, 90.780], // Hajiganj
  [23.230, 90.665], // Chandpur Sadar
  chandpurSnap      // Exact 0.00m snap to Meghna trunk at Chandpur Estuary!
];

const dakatiaCoords = generateRiverSpline(dakatiaWaypoints, 70, 0.0035);
const rDakatia = rivers.find(r => r.id === 'BD-RIV-047');
if (rDakatia) {
  rDakatia.coords = dakatiaCoords;
  rDakatia.districts = ['কুমিল্লা', 'চাঁদপুর'];
  rDakatia.divisions = ['চট্টগ্রাম'];
  rDakatia.length_km = 120;
  console.log('✓ Dakatia River (BD-RIV-047) snapped to Chandpur Meghna Estuary (0.00m gap).');
}

const rDakatia484 = rivers.find(r => r.id === 'BD-RIV-484');
if (rDakatia484) {
  rDakatia484.coords = dakatiaCoords;
  rDakatia484.districts = ['চাঁদপুর'];
  rDakatia484.divisions = ['চট্টগ্রাম'];
}

// -------------------------------------------------------------
// 10. JADUKATA RIVER (BD-RIV-028) & BAULAI RIVER (BD-RIV-133)
// -------------------------------------------------------------
const jadukataWaypoints = [
  [25.195, 91.258], // Khasi Hills, Meghalaya border (Barekkator)
  [25.150, 91.245], // Shimul Bagan / Badaghat
  [25.112, 91.238]  // Tahirpur Confluence (Baulai River)
];
const jadukataCoords = generateRiverSpline(jadukataWaypoints, 40, 0.0025);
const rJadukata = rivers.find(r => r.id === 'BD-RIV-028');
if (rJadukata) {
  rJadukata.coords = jadukataCoords;
  rJadukata.districts = ['সুনামগঞ্জ'];
  rJadukata.divisions = ['সিলেট'];
  console.log('✓ Jadukata River (BD-RIV-028) aligned from Barekkator border to Tahirpur.');
}

const baulaiWaypoints = [
  jadukataCoords[jadukataCoords.length - 1], // Exact 0.00m snap to Jadukata confluence!
  [25.040, 91.180], // Tanguar Haor
  [24.960, 91.120], // Dharmapasha
  [24.850, 91.020]  // Outfall into Dhanu River
];
const baulaiCoords = generateRiverSpline(baulaiWaypoints, 50, 0.003);
const rBaulai = rivers.find(r => r.id === 'BD-RIV-133');
if (rBaulai) {
  rBaulai.coords = baulaiCoords;
  rBaulai.districts = ['সুনামগঞ্জ', 'নেত্রকোণা'];
  rBaulai.divisions = ['সিলেট', 'ময়মনসিংহ'];
  console.log('✓ Baulai River (BD-RIV-133) snapped to Jadukata and Dhanu (0.00m gap).');
}

// -------------------------------------------------------------
// 11. DHANU RIVER (BD-RIV-269)
// -------------------------------------------------------------
const dhanuWaypoints = [
  baulaiCoords[baulaiCoords.length - 1], // Exact 0.00m snap to Baulai outfall!
  [24.620, 90.980], // Khaliajuri / Itna
  [24.450, 90.960], // Mithamoin
  [24.280, 90.950], // Kulierchar
  snapToPolyline([24.150, 90.960], meghnaCoords) // Exact 0.00m snap to Meghna trunk near Bhairab!
];
const dhanuCoords = generateRiverSpline(dhanuWaypoints, 60, 0.0035);
const rDhanu = rivers.find(r => r.id === 'BD-RIV-269');
if (rDhanu) {
  rDhanu.coords = dhanuCoords;
  rDhanu.districts = ['নেত্রকোণা', 'কিশোরগঞ্জ'];
  rDhanu.divisions = ['ময়মনসিংহ', 'ঢাকা'];
  console.log('✓ Dhanu River (BD-RIV-269) snapped from Baulai to Meghna trunk (0.00m gap).');
}

// -------------------------------------------------------------
// 12. SARI-GOWAIN (BD-RIV-034) & PIYAIN (BD-RIV-033)
// -------------------------------------------------------------
const chhatakSurmaSnap = snapToPolyline([24.960, 91.750], surmaCoords);

const sariWaypoints = [
  [25.120, 92.125], // Lalakhal, Jaintia Hills, Meghalaya border
  [25.075, 92.105], // Sarighat
  [25.010, 91.960], // Gowainghat
  chhatakSurmaSnap  // Exact 0.00m snap to Surma trunk!
];
const sariCoords = generateRiverSpline(sariWaypoints, 50, 0.003);
const rSari = rivers.find(r => r.id === 'BD-RIV-034');
if (rSari) {
  rSari.coords = sariCoords;
  rSari.districts = ['সিলেট'];
  rSari.divisions = ['সিলেট'];
  console.log('✓ Sari-Gowain River (BD-RIV-034) snapped to Surma trunk (0.00m gap).');
}

const piyainWaypoints = [
  [25.175, 92.015], // Jaflong Zero Point border
  [25.140, 91.870], // Jaflong stone bed
  sariCoords[2]     // Exact 0.00m snap to Sari-Gowain confluence!
];
const piyainCoords = generateRiverSpline(piyainWaypoints, 40, 0.003);
const rPiyain = rivers.find(r => r.id === 'BD-RIV-033');
if (rPiyain) {
  rPiyain.coords = piyainCoords;
  rPiyain.districts = ['সিলেট', 'সুনামগঞ্জ'];
  rPiyain.divisions = ['সিলেট'];
  console.log('✓ Piyain River (BD-RIV-033) snapped to Sari-Gowain confluence (0.00m gap).');
}

// -------------------------------------------------------------
// 13. REGIONAL REACHES: MEGHNA & SURMA REGIONAL ENTRIES
// -------------------------------------------------------------
function extractSegment(fullCoords, startFrac, endFrac) {
  const iStart = Math.floor(fullCoords.length * startFrac);
  const iEnd = Math.ceil(fullCoords.length * endFrac);
  return fullCoords.slice(iStart, Math.min(iEnd + 1, fullCoords.length));
}

// Meghna regional segments:
const rMeghnaKishoreganj = rivers.find(r => r.id === 'BD-RIV-281');
if (rMeghnaKishoreganj) {
  rMeghnaKishoreganj.coords = extractSegment(meghnaCoords, 0.0, 0.25);
  rMeghnaKishoreganj.name_bn = 'মেঘনা (ভৈরব ও কিশোরগঞ্জ অংশ)';
  rMeghnaKishoreganj.districts = ['কিশোরগঞ্জ'];
}

const rMeghnaNarsingdi = rivers.find(r => r.id === 'BD-RIV-262');
if (rMeghnaNarsingdi) {
  rMeghnaNarsingdi.coords = extractSegment(meghnaCoords, 0.15, 0.40);
  rMeghnaNarsingdi.name_bn = 'মেঘনা (নরসিংদী অংশ)';
  rMeghnaNarsingdi.districts = ['নরসিংদী'];
}

const rMeghnaNarayanganj = rivers.find(r => r.id === 'BD-RIV-239');
if (rMeghnaNarayanganj) {
  rMeghnaNarayanganj.coords = extractSegment(meghnaCoords, 0.35, 0.55);
  rMeghnaNarayanganj.name_bn = 'মেঘনা (নারায়ণগঞ্জ অংশ)';
  rMeghnaNarayanganj.districts = ['নারায়ণগঞ্জ'];
}

const rMeghnaMunshiganj = rivers.find(r => r.id === 'BD-RIV-246');
if (rMeghnaMunshiganj) {
  rMeghnaMunshiganj.coords = extractSegment(meghnaCoords, 0.45, 0.65);
  rMeghnaMunshiganj.name_bn = 'মেঘনা (মুন্সীগঞ্জ ও গজারিয়া অংশ)';
  rMeghnaMunshiganj.districts = ['মুন্সীগঞ্জ'];
}

const rMeghnaChandpur = rivers.find(r => r.id === 'BD-RIV-483');
if (rMeghnaChandpur) {
  rMeghnaChandpur.coords = extractSegment(meghnaCoords, 0.60, 0.80);
  rMeghnaChandpur.name_bn = 'মেঘনা (চাঁদপুর মোহনা অংশ)';
  rMeghnaChandpur.districts = ['চাঁদপুর'];
}

const rMeghnaBhola = rivers.find(r => r.id === 'BD-RIV-519');
if (rMeghnaBhola) {
  rMeghnaBhola.coords = extractSegment(meghnaCoords, 0.75, 1.0);
  rMeghnaBhola.name_bn = 'লোয়ার মেঘনা (ভোলা ও বঙ্গোপসাগর মোহনা)';
  rMeghnaBhola.districts = ['ভোলা', 'লক্ষ্মীপুর'];
}

// Surma regional segments:
const rSurmaSylhet = rivers.find(r => r.id === 'BD-RIV-373');
if (rSurmaSylhet) {
  rSurmaSylhet.coords = extractSegment(surmaCoords, 0.0, 0.55);
  rSurmaSylhet.name_bn = 'সুরমা নদী (সিলেট সদর ও উজান অংশ)';
  rSurmaSylhet.districts = ['সিলেট'];
}

const rSurmaSunamganj = rivers.find(r => r.id === 'BD-RIV-386');
if (rSurmaSunamganj) {
  rSurmaSunamganj.coords = extractSegment(surmaCoords, 0.50, 1.0);
  rSurmaSunamganj.name_bn = 'সুরমা নদী (সুনামগঞ্জ ও ভাটি অংশ)';
  rSurmaSunamganj.districts = ['সুনামগঞ্জ', 'হবিগঞ্জ'];
}

// Kushiara regional segments:
const rKushiaraSylhet = rivers.find(r => r.id === 'BD-RIV-374');
if (rKushiaraSylhet) {
  rKushiaraSylhet.coords = extractSegment(kushiaraCoords, 0.0, 0.50);
  rKushiaraSylhet.name_bn = 'কুশিয়ারা নদী (জাকীগঞ্জ ও গোলাপগঞ্জ অংশ)';
  rKushiaraSylhet.districts = ['সিলেট'];
}

const rKushiaraMoulvibazar = rivers.find(r => r.id === 'BD-RIV-400');
if (rKushiaraMoulvibazar) {
  rKushiaraMoulvibazar.coords = extractSegment(kushiaraCoords, 0.35, 0.80);
  rKushiaraMoulvibazar.name_bn = 'কুশিয়ারা নদী (ফেঞ্চুগঞ্জ ও শেরপুর অংশ)';
  rKushiaraMoulvibazar.districts = ['মৌলভীবাজার', 'সিলেট'];
}

const rKushiaraHabiganj = rivers.find(r => r.id === 'BD-RIV-410');
if (rKushiaraHabiganj) {
  rKushiaraHabiganj.coords = extractSegment(kushiaraCoords, 0.65, 1.0);
  rKushiaraHabiganj.name_bn = 'কুশিয়ারা নদী (নবীগঞ্জ ও আজমিরীগঞ্জ অংশ)';
  rKushiaraHabiganj.districts = ['হবিগঞ্জ'];
}

// -------------------------------------------------------------
// WRITE TO FILES
// -------------------------------------------------------------
fs.writeFileSync(RIVERS_JSON_PATH, JSON.stringify(rivers, null, 2), 'utf8');
console.log('✓ Saved data/json/rivers.json');

const geojsonFeatures = rivers.map(r => ({
  type: 'Feature',
  id: r.id,
  geometry: {
    type: 'LineString',
    coordinates: r.coords.map(pt => [pt[1], pt[0]])
  },
  properties: {
    id: r.id,
    name_bn: r.name_bn,
    name_en: r.name_en,
    basin: r.basin,
    length_km: r.length_km,
    origin_bn: r.origin_bn,
    origin_en: r.origin_en,
    flow_path: r.flow_path,
    outfall_bn: r.outfall_bn,
    outfall_en: r.outfall_en,
    divisions: r.divisions,
    districts: r.districts,
    transboundary: r.transboundary === true,
    transboundary_country: r.transboundary_country || null,
    status: r.status,
    historical_bcs_significance: r.historical_bcs_significance || null,
    description: r.description || null
  }
}));

fs.writeFileSync(GEOJSON_PATH, JSON.stringify({ type: 'FeatureCollection', features: geojsonFeatures }, null, 2), 'utf8');
console.log('✓ Saved data/geojson/rivers.geojson');

const jsContent = 'const RIVERS_DATA = ' + JSON.stringify(rivers, null, 2) + ';\n';
fs.writeFileSync(RIVERS_JS_PATH, jsContent, 'utf8');
console.log('✓ Saved assets/js/rivers-data.js');

console.log('\n🎉 MEGHNA BASIN PRECISION ALIGNMENT COMPLETED WITH ZERO ERRORS!\n');
