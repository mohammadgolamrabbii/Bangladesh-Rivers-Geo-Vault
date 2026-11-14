#!/usr/bin/env node

const {
  getAllRivers,
  getRiverById,
  searchRivers,
  getTransboundaryRivers,
  getRiversByBasin,
  getBCSQuestions,
  getSummary
} = require('./index');

const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : 'help';
const param = args.slice(1).join(' ');

console.log('🌊 Bangladesh Rivers Geo-Vault CLI');
console.log('   Architect: Mohammad Golamrabbii (https://github.com/mohammadgolamrabbii)\n');

switch (command) {
  case 'summary':
  case 'stats': {
    const summary = getSummary();
    console.log(`Total Rivers Documented: ${summary.total_rivers}`);
    console.log(`Transboundary Rivers:    ${summary.transboundary_count} (India: ${summary.transboundary_india}, Myanmar: ${summary.transboundary_myanmar})`);
    
    if (summary.basin_distribution) {
      console.log('\nBasin Breakdown:');
      Object.entries(summary.basin_distribution).forEach(([basin, count]) => {
        console.log(` - ${basin}: ${count} rivers`);
      });
    }

    if (summary.status_distribution) {
      console.log('\nHealth Status Breakdown:');
      Object.entries(summary.status_distribution).forEach(([status, count]) => {
        console.log(` - ${status}: ${count} rivers`);
      });
    }
    break;
  }

  case 'search':
  case 'find': {
    if (!param) {
      console.log('Error: Please provide a search keyword (e.g. "padma", "মেঘনা", "হিমালয়")');
      process.exit(1);
    }
    const results = searchRivers(param);
    console.log(`Found ${results.length} rivers matching "${param}":\n`);
    results.slice(0, 15).forEach((r, idx) => {
      console.log(`${idx + 1}. ${r.name_bn} (${r.name_en}) - ${r.length_km} km`);
      console.log(`   Origin: ${r.origin_bn || r.origin_en} | Outfall: ${r.outfall_bn || r.outfall_en}`);
      console.log(`   Basin: ${r.basin} | Status: ${r.status}`);
      if (r.transboundary) {
        console.log(`   Transboundary with: ${r.transboundary_country}`);
      }
      console.log('');
    });
    if (results.length > 15) {
      console.log(`... and ${results.length - 15} more rivers.`);
    }
    break;
  }

  case 'transboundary':
  case 'border': {
    const rivers = getTransboundaryRivers();
    console.log(`57 Official Transboundary Rivers of Bangladesh:\n`);
    rivers.forEach((r, idx) => {
      console.log(`${idx + 1}. ${r.name_bn} (${r.name_en}) [${r.transboundary_country}]`);
      console.log(`   Origin: ${r.origin_bn || r.origin_en} -> Outfall: ${r.outfall_bn || r.outfall_en} (${r.length_km} km)`);
    });
    break;
  }

  case 'bcs':
  case 'qa': {
    const bcs = getBCSQuestions();
    console.log(`BCS Exam Preparation Q&A (Total: ${bcs.length}):\n`);
    const count = param ? parseInt(param, 10) : 5;
    bcs.slice(0, count).forEach((item, idx) => {
      console.log(`[Q${idx + 1}] ${item.question || item.question_bn}`);
      console.log(`Ans: ${item.answer || item.answer_bn}`);
      console.log(`Explanation: ${item.explanation || item.explanation_bn}\n`);
    });
    if (bcs.length > count) {
      console.log(`Tip: Run "node cli.js bcs 30" to view all ${bcs.length} questions.`);
    }
    break;
  }

  case 'get': {
    if (!param) {
      console.log('Error: Please provide river ID (e.g. "BD-RIV-001")');
      process.exit(1);
    }
    const river = getRiverById(param);
    if (!river) {
      console.log(`River with ID "${param}" not found.`);
    } else {
      console.log(JSON.stringify(river, null, 2));
    }
    break;
  }

  case 'help':
  default:
    console.log('Usage:');
    console.log('  node cli.js summary              Display dataset summary statistics');
    console.log('  node cli.js search <keyword>      Search rivers by name, origin, district, basin');
    console.log('  node cli.js transboundary         List all 57 transboundary rivers');
    console.log('  node cli.js bcs [count]           Display BCS questions & answers');
    console.log('  node cli.js get <id>              Get complete JSON details of a river by ID');
    break;
}
