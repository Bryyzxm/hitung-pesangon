// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const PAGES = [
  { path: '/', titleSubstring: 'HitungPesangon' },
  { path: '/pesangon.html', titleSubstring: 'Pesangon' },
  { path: '/jkp-jht.html', titleSubstring: 'JKP' },
  { path: '/burn-rate.html', titleSubstring: 'Berapa Lama' },
  { path: '/thr.html', titleSubstring: 'THR' },
  { path: '/pph21.html', titleSubstring: 'PPh 21' },
  { path: '/bpjs-kesehatan.html', titleSubstring: 'BPJS' },
  { path: '/gaji-bersih.html', titleSubstring: 'Gaji Bersih' },
  { path: '/dana-darurat.html', titleSubstring: 'Dana Darurat' },
  { path: '/simulasi-pensiun.html', titleSubstring: 'Pensiun' },
  { path: '/uang-sakit-cuti.html', titleSubstring: 'Sakit' },
];

// ── Page load smoke ─────────────────────────────────────────────
test.describe('All pages load with 200', () => {
  for (const { path, titleSubstring } of PAGES) {
    test(`${path} returns 200`, async ({ page }) => {
      const resp = await page.goto(path);
      expect(resp.status()).toBe(200);
      expect(await page.title()).toContain(titleSubstring);
    });
  }
});

// ── Metadata smoke ──────────────────────────────────────────────
test.describe('All pages have canonical and social metadata', () => {
  for (const { path } of PAGES) {
    test(`${path} has canonical, OG, and Twitter tags`, async ({ page }) => {
      await page.goto(path);

      // Canonical link
      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute('href', /hitungpesangon\.my\.id/);

      // Open Graph
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /hitungpesangon\.my\.id\/og-image\.png/);

      // Twitter Card
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
      await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', /.+/);
    });
  }
});

// ── THR calculator known-value ──────────────────────────────────
test.describe('THR calculator known output', () => {
  test('gaji 12 jt, masa kerja 6 bln → Rp6.000.000', async ({ page }) => {
    await page.goto('/thr.html');
    await page.fill('#gaji', '12000000');
    await page.fill('#masa-kerja', '6');
    await page.click('button[type="submit"]');

    const hasil = page.locator('#hasil-thr');
    await expect(hasil).not.toHaveClass(/hidden/);
    await expect(hasil).toContainText(/Rp\s*6\.000\.000/);
    await expect(hasil).toContainText('Estimasi THR');
  });
});

// ── Pesangon calculator known-value ─────────────────────────────
test.describe('Pesangon calculator known output', () => {
  test('gaji 10 jt, 5 thn, efisiensi-cegah (1x) → Rp80.000.000', async ({ page }) => {
    await page.goto('/pesangon.html');
    await page.fill('#gaji', '10000000');
    await page.fill('#masa-tahun', '5');
    await page.fill('#masa-bulan', '0');
    // alasan defaults to efisiensi-rugi; switch to efisiensi-cegah (1x)
    await page.selectOption('#alasan', 'efisiensi-cegah');
    await page.click('button[type="submit"]');

    const hasil = page.locator('#hasil-pesangon');
    await expect(hasil).not.toHaveClass(/hidden/);
    await expect(hasil).toContainText(/Rp\s*80\.000\.000/);
    await expect(hasil).toContainText('Estimasi Hak');
  });
});

// ── Gaji Bersih calculator known-value ──────────────────────────
test.describe('Gaji Bersih calculator known output', () => {
  test('gaji 10 jt, TK/0, potong-gaji → Rp9.262.777', async ({ page }) => {
    await page.goto('/gaji-bersih.html');
    await page.fill('#gaji', '10000000');
    await page.fill('#tunjangan-tetap', '0');
    await page.fill('#tunjangan-tidak-tetap', '0');
    await page.selectOption('#status-ptkp', 'TK/0');
    await page.selectOption('#bpjs-option', 'potong-gaji');
    await page.click('button[type="submit"]');

    const hasil = page.locator('#hasil-gaji');
    await expect(hasil).not.toHaveClass(/hidden/);
    await expect(hasil).toContainText(/Rp\s*9\.262\.777/);
    await expect(hasil).toContainText('Estimasi Gaji Bersih');
  });
});

// ── Invalid submission focus ────────────────────────────────────
test.describe('Invalid form submission focuses the invalid field', () => {
  test('THR empty gaji focuses #gaji', async ({ page }) => {
    await page.goto('/thr.html');
    // Submit without filling anything
    await page.click('button[type="submit"]');

    // Error message should appear
    await expect(page.locator('#error-thr')).toContainText(/.+/, { timeout: 2000 });

    // The gaji field should receive focus
    const gajiInput = page.locator('#gaji');
    await expect(gajiInput).toBeFocused();

    // And it should be marked aria-invalid
    await expect(gajiInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('Pesangon empty gaji focuses #gaji', async ({ page }) => {
    await page.goto('/pesangon.html');
    await page.click('button[type="submit"]');

    await expect(page.locator('#error-pesangon')).toContainText(/.+/, { timeout: 2000 });
    await expect(page.locator('#gaji')).toBeFocused();
    await expect(page.locator('#gaji')).toHaveAttribute('aria-invalid', 'true');
  });
});

// ── Skip link ───────────────────────────────────────────────────
test.describe('Skip link exists and targets main content', () => {
  for (const { path } of PAGES) {
    test(`${path} has skip link to #main-content`, async ({ page }) => {
      await page.goto(path);
      const skipLink = page.locator('a.skip-link[href="#main-content"]');
      await expect(skipLink).toBeAttached();
      await expect(skipLink).toHaveText(/Lewati ke konten utama/);

      // Tab to the skip link (first focusable element)
      await page.keyboard.press('Tab');
      await expect(skipLink).toBeFocused();

      // After focus, skip-link should be visible (left: 0)
      const left = await skipLink.evaluate(
        (el) => window.getComputedStyle(el).left,
      );
      expect(left).toBe('0px');
    });
  }
});

// ── Navigation landmark ─────────────────────────────────────────
test.describe('Nav has accessible label', () => {
  test('index page has nav[aria-label]', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav[aria-label="Navigasi utama"]')).toBeAttached();
  });
});

// ── Fixture-driven calculator regression ───────────────────────
const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'calculator-cases.json');
const FIXTURES = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8'));

test.describe('Calculator regression fixtures (all 10)', () => {
  for (const [name, fx] of Object.entries(FIXTURES)) {
    test(`${name}: bigNumber matches observed output`, async ({ page }) => {
      await page.goto('/' + fx.page);

      for (const inp of fx.inputs) {
        if (inp.type === 'select') {
          await page.selectOption('#' + inp.id, inp.value);
        } else {
          await page.fill('#' + inp.id, inp.value);
        }
      }

      await page.click('#' + fx.formId + ' button[type="submit"]');

      const hasil = page.locator('#' + fx.resultId);
      await expect(hasil).not.toHaveClass(/hidden/);

      const bigNumPattern = fx.bigNumber
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\s+/g, '\\s+');
      await expect(hasil).toContainText(new RegExp(bigNumPattern));

      if (fx.expectedCells) {
        for (const row of fx.expectedCells) {
          for (const cell of row) {
            await expect(hasil).toContainText(cell);
          }
        }
      }

      if (fx.expectedTexts) {
        for (const txt of fx.expectedTexts) {
          await expect(hasil).toContainText(txt);
        }
      }
    });
  }
});
