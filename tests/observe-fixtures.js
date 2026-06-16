// @ts-check
// Temporary script to observe browser outputs for all 10 calculators.
// Run with: node tests/observe-fixtures.js (after starting http server on 4173)

const { chromium } = require('playwright');

const CASES = [
  {
    name: 'pesangon',
    path: '/pesangon.html',
    inputs: [
      { selector: '#gaji', value: '10000000' },
      { selector: '#masa-tahun', value: '5' },
      { selector: '#masa-bulan', value: '0' },
      { selector: '#sisa-cuti', value: '2' },
      { selector: '#alasan', value: 'efisiensi-cegah', type: 'select' },
    ],
    resultSelector: '#hasil-pesangon',
  },
  {
    name: 'jkp-jht',
    path: '/jkp-jht.html',
    inputs: [
      { selector: '#upah', value: '10000000' },
      { selector: '#lama-iuran', value: '3' },
    ],
    resultSelector: '#hasil-jkp',
  },
  {
    name: 'burn-rate',
    path: '/burn-rate.html',
    inputs: [
      { selector: '#dana', value: '50000000' },
      { selector: '#hunian', value: '3000000' },
      { selector: '#makan', value: '2000000' },
      { selector: '#transport', value: '1000000' },
      { selector: '#cicilan', value: '500000' },
      { selector: '#lainnya', value: '500000' },
    ],
    resultSelector: '#hasil-burn',
  },
  {
    name: 'thr',
    path: '/thr.html',
    inputs: [
      { selector: '#gaji', value: '12000000' },
      { selector: '#masa-kerja', value: '6' },
    ],
    resultSelector: '#hasil-thr',
  },
  {
    name: 'pph21',
    path: '/pph21.html',
    inputs: [
      { selector: '#gaji', value: '15000000' },
      { selector: '#tunjangan-tetap', value: '2000000' },
      { selector: '#tunjangan-tidak-tetap', value: '0' },
      { selector: '#status-ptkp', value: 'K/1', type: 'select' },
    ],
    resultSelector: '#hasil-pph21',
  },
  {
    name: 'bpjs-kesehatan',
    path: '/bpjs-kesehatan.html',
    inputs: [
      { selector: '#upah', value: '15000000' },
      { selector: '#tanggungan', value: '2' },
    ],
    resultSelector: '#hasil-bpjs',
  },
  {
    name: 'gaji-bersih',
    path: '/gaji-bersih.html',
    inputs: [
      { selector: '#gaji', value: '10000000' },
      { selector: '#tunjangan-tetap', value: '0' },
      { selector: '#tunjangan-tidak-tetap', value: '0' },
      { selector: '#status-ptkp', value: 'TK/0', type: 'select' },
      { selector: '#bpjs-option', value: 'potong-gaji', type: 'select' },
    ],
    resultSelector: '#hasil-gaji',
  },
  {
    name: 'dana-darurat',
    path: '/dana-darurat.html',
    inputs: [
      { selector: '#pengeluaran', value: '5000000' },
      { selector: '#tanggungan', value: '0', type: 'select' },
      { selector: '#status-kerja', value: 'kerja', type: 'select' },
      { selector: '#dana-saat-ini', value: '10000000' },
    ],
    resultSelector: '#hasil-dana',
  },
  {
    name: 'simulasi-pensiun',
    path: '/simulasi-pensiun.html',
    inputs: [
      { selector: '#usia-sekarang', value: '30' },
      { selector: '#usia-pensiun', value: '55' },
      { selector: '#pengeluaran', value: '5000000' },
      { selector: '#tabungan', value: '50000000' },
      { selector: '#kontribusi', value: '2000000' },
      { selector: '#inflasi', value: '5' },
      { selector: '#return-investasi', value: '8' },
    ],
    resultSelector: '#hasil-pensiun',
  },
  {
    name: 'uang-sakit-cuti',
    path: '/uang-sakit-cuti.html',
    inputs: [
      { selector: '#gaji', value: '10000000' },
      { selector: '#hari-sakit', value: '5' },
      { selector: '#hari-cuti', value: '10' },
    ],
    resultSelector: '#hasil-cuti',
  },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const results = [];

  for (const c of CASES) {
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:4173${c.path}`);
    
    // Fill inputs
    for (const inp of c.inputs) {
      if (inp.type === 'select') {
        await page.selectOption(inp.selector, inp.value);
      } else {
        await page.fill(inp.selector, inp.value);
      }
    }
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for result
    await page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        return el && !el.classList.contains('hidden');
      },
      c.resultSelector,
      { timeout: 5000 }
    );
    
    // Capture text content
    const text = await page.locator(c.resultSelector).innerText();
    
    // Capture the big-number text
    const bigNumber = await page.locator(`${c.resultSelector} .big-number`).innerText().catch(() => null);
    
    // Capture table rows text (first row after header)
    const tableRows = await page.locator(`${c.resultSelector} table tr`).allInnerTexts().catch(() => []);
    
    // Capture h2
    const h2 = await page.locator(`${c.resultSelector} h2`).innerText().catch(() => null);
    
    results.push({
      name: c.name,
      path: c.path,
      bigNumber,
      h2,
      tableRows,
      fullText: text,
    });
    
    console.log(`\n=== ${c.name} ===`);
    console.log(`H2: ${h2}`);
    console.log(`Big Number: ${bigNumber}`);
    console.log(`Table rows: ${JSON.stringify(tableRows, null, 2)}`);
    
    await page.close();
  }
  
  await browser.close();
  
  // Write results to JSON
  const fs = require('fs');
  fs.writeFileSync('tests/fixtures/observed-output.json', JSON.stringify(results, null, 2));
  console.log('\n\nResults written to tests/fixtures/observed-output.json');
})();
