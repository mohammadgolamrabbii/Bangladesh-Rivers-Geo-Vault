# 🌊 Bangladesh Rivers Geo-Vault (১,৩০০+ নদ-নদী ও মোহনার জিও-ম্যাপ ডিরেক্টরি)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Total Rivers](https://img.shields.io/badge/Documented%20Rivers-1%2C300%2B-0284c7.svg)](#dataset-overview)
[![Transboundary Rivers](https://img.shields.io/badge/Transboundary%20Rivers-57%20(54%20India%20|%203%20Myanmar)-0ea5e9.svg)](#transboundary-rivers)
[![BCS Q&A Guide](https://img.shields.io/badge/BCS%20Special%20Q%26A-30%2B%20Verified-10b981.svg)](#bcs-examination-guide)
[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-emerald.svg)](https://mohammadgolamrabbii.github.io/Bangladesh-Rivers-Geo-Vault/)
[![Author](https://img.shields.io/badge/Architect-Mohammad%20Golamrabbii-orange.svg)](https://github.com/mohammadgolamrabbii)

> **The definitive open-source hydrological archive and geospatial directory documenting 1,300+ rivers of Bangladesh.** Featuring vector GeoJSON geometry, interactive Leaflet.js satellite maps, 57 official transboundary rivers, and a curated BCS examination knowledge guide.

---

## 🌟 Live Interactive Map & Web Portal

Explore the live web portal hosted on GitHub Pages:  
👉 **[https://mohammadgolamrabbii.github.io/Bangladesh-Rivers-Geo-Vault/](https://mohammadgolamrabbii.github.io/Bangladesh-Rivers-Geo-Vault/)**

---

## 👨‍💻 Project Architect & Lead Researcher

<div align="center">
  <img src="assets/img/profile.jpg" alt="Mohammad Golamrabbii" width="140" style="border-radius: 50%; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />
  <h3>Mohammad Golamrabbii (মোহাম্মদ গোলাম রাব্বী)</h3>
  <p><em>Tech & Media Entrepreneur | Geospatial Archivist & Civic Tech Innovator | Digital Strategist</em></p>
  <p>
    <a href="https://github.com/mohammadgolamrabbii"><img src="https://img.shields.io/badge/GitHub-mohammadgolamrabbii-181717?style=flat&logo=github" /></a>
    <a href="https://linkedin.com/in/golamrabbii"><img src="https://img.shields.io/badge/LinkedIn-golamrabbii-0A66C2?style=flat&logo=linkedin" /></a>
    <a href="https://linktr.ee/golamrabbii"><img src="https://img.shields.io/badge/Portfolio-linktr.ee%2Fgolamrabbii-43E660?style=flat&logo=linktree" /></a>
    <a href="mailto:emarketor2025@gmail.com"><img src="https://img.shields.io/badge/Email-emarketor2025%40gmail.com-D14836?style=flat&logo=gmail" /></a>
  </p>
</div>

---

## 📌 Why This Project is Unique

1. **First Unified 1,300+ River GeoJSON Vault**: Consolidates hydrological records across Bangladesh Water Development Board (BWDB), National River Conservation Commission (NRCC), Joint River Commission (JRC), and district gazetteers into clean, open GIS formats (`.geojson`, `.json`, `.csv`).
2. **Official 57 Transboundary Rivers Mapped**: Verified bilateral river registries (54 originating from India, 3 from Myanmar) with cross-border entry points and outfalls.
3. **Interactive Dual-Basemap Engine**: Toggle between high-resolution satellite imagery (Esri World Imagery) and clean topographic cartography (CartoDB Voyager) with real-time vector path tracing.
4. **BCS & Job Exam Preparation Matrix**: 30+ meticulously researched questions covering river geography, historical treaties, breeding sanctuaries (Halda), and basin bifurcations.
5. **Developer Friendly Multi-Platform SDKs**: Ready-to-use Node.js and Python packages with an intuitive command-line interface (CLI).

---

## 📊 Dataset Overview

| Metric | Quantity | Details |
| :--- | :--- | :--- |
| **Total Rivers Documented** | **1,315** | Covering all 64 districts & 8 administrative divisions (NRCC / BWDB) |
| **Transboundary Rivers** | **57** | 54 with India (Joint River Commission), 3 with Myanmar |
| **Major River Basins** | **6** | Padma-Ganges, Meghna, Brahmaputra-Jamuna, Teesta, Karnafuli, Coastal |
| **River Health Tracking** | **4 States** | Active & Flowing, Seasonal, Encroached & Polluted, Silted |
| **BCS Exam Q&A Guide** | **30+** | Detailed historical, legal, and environmental explanations |

---

## 🚀 Quick Start (Node.js SDK & CLI)

### 1. Installation
Clone the repository:
```bash
git clone https://github.com/mohammadgolamrabbii/Bangladesh-Rivers-Geo-Vault.git
cd Bangladesh-Rivers-Geo-Vault
```

### 2. Run the CLI
```bash
# View dataset summary
node sdk/node/cli.js summary

# Search rivers by keyword (English or Bengali)
node sdk/node/cli.js search "Padma"
node sdk/node/cli.js search "হালদা"

# List official 57 transboundary rivers
node sdk/node/cli.js transboundary

# Read BCS preparation Q&A
node sdk/node/cli.js bcs 5
```

### 3. Programmatic Usage (Node.js)
```javascript
const riversVault = require('./sdk/node/index');

// Search rivers
const results = riversVault.searchRivers('Teesta');
console.log(results[0].name_bn, results[0].origin_bn);

// Get transboundary rivers
const borderRivers = riversVault.getTransboundaryRivers();
console.log(`Transboundary rivers count: ${borderRivers.length}`);
```

---

## 🐍 Python SDK Usage

```python
from sdk.python.bangladesh_rivers import (
    get_all_rivers,
    search_rivers,
    get_transboundary_rivers,
    get_bcs_questions
)

# Search
results = search_rivers("Halda")
for r in results:
    print(r["name_bn"], r["basin"], r["status"])

# Transboundary
tb = get_transboundary_rivers()
print(f"Total Transboundary Rivers: {len(tb)}")
```

---

## 📚 Key Rivers Highlights (BCS Focus)

- **পদ্মা (Padma / Ganges)**: Originates in Gangotri Glacier (India) and enters Bangladesh at Chapainawabganj. Merges with Jamuna at Goalando and outfalls into Bay of Bengal via Meghna.
- **মেঘনা (Meghna)**: Formed by the confluence of Surma and Kushiara rivers (Barak system from Assam) at Markuli/Bhairab.
- **যমুনা (Jamuna)**: Major distributary of Brahmaputra shifted following the 1787 earthquake and flood. Widest river in Bangladesh.
- **হালদা (Halda)**: The only tidal river in the world where major Indian carps naturally spawn and fertilized eggs are collected. Declared "Bangabandhu Fisheries Heritage". 100% indigenous river originating in Khagrachari.
- **নাফ (Naf), সাঙ্গু (Sangu), মাতামুহুরী (Matamuhuri)**: The three transboundary rivers flowing between Myanmar and Bangladesh.

---

## 🧪 Testing & Validation

Run the automated test suite verifying dataset integrity, transboundary numbers, and GIS features:
```bash
npm test
```

---

## 📄 License & Attribution

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.  
Copyright (c) 2026 **Mohammad Golamrabbii (মোহাম্মদ গোলাম রাব্বী)**.
