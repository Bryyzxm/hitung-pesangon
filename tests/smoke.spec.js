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
const MOBILE = { width: 375, height: 800 };
const DESKTOP = { width: 1280, height: 800 };

test.describe('Skip link exists and targets main content', () => {
  for (const { path } of PAGES) {
    test(`${path} has skip link to #main-content (mobile)`, async ({ page }) => {
      await page.setViewportSize(MOBILE);
      await page.goto(path);
      const skipLink = page.locator('a.skip-link[href="#main-content"]');
      await expect(skipLink).toBeAttached();
      await expect(skipLink).toHaveText(/Lewati ke konten utama/);

      // Tab to the skip link (first focusable element)
      await page.keyboard.press('Tab');
      await expect(skipLink).toBeFocused();

      // Mobile: skip-link should be visible at top-left (left: 0)
      const left = await skipLink.evaluate(
        (el) => window.getComputedStyle(el).left,
      );
      expect(left).toBe('0px');
    });

    test(`${path} skip link clears the desktop sidebar (left: 280px)`, async ({
      page,
    }) => {
      await page.setViewportSize(DESKTOP);
      await page.goto(path);
      const skipLink = page.locator('a.skip-link[href="#main-content"]');
      await expect(skipLink).toBeAttached();

      await page.keyboard.press('Tab');
      await expect(skipLink).toBeFocused();

      // Desktop: skip-link must sit to the right of the fixed sidebar
      const left = await skipLink.evaluate(
        (el) => window.getComputedStyle(el).left,
      );
      expect(left).toBe('280px');
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

test.describe('Mobile hamburger nav toggle', () => {
  test('mobile (375x800) shows toggle button and hides nav', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/');

    const toggle = page.locator('button.nav-toggle');
    await expect(toggle).toBeAttached();

    const toggleDisplay = await toggle.evaluate(
      (el) => window.getComputedStyle(el).display,
    );
    expect(toggleDisplay).not.toBe('none');

    const nav = page.locator('nav#primary-nav');
    await expect(nav).toBeAttached();
    const navDisplay = await nav.evaluate(
      (el) => window.getComputedStyle(el).display,
    );
    expect(navDisplay).toBe('none');

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking toggle opens nav and sets aria-expanded=true', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/pesangon.html');

    const toggle = page.locator('button.nav-toggle');
    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const navDisplay = await page.locator('nav#primary-nav').evaluate(
      (el) => window.getComputedStyle(el).display,
    );
    expect(navDisplay).not.toBe('none');
  });

  test('clicking toggle a second time closes nav', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/pesangon.html');

    const toggle = page.locator('button.nav-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('Escape key closes an open menu', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/pesangon.html');

    const toggle = page.locator('button.nav-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('desktop (1280x800) hides toggle button and shows nav', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/');

    const toggleDisplay = await page
      .locator('button.nav-toggle')
      .evaluate((el) => window.getComputedStyle(el).display);
    expect(toggleDisplay).toBe('none');

    const navDisplay = await page.locator('nav#primary-nav').evaluate(
      (el) => window.getComputedStyle(el).display,
    );
    expect(navDisplay).not.toBe('none');
  });

  test('toggle button has an accessible label', async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/');
    const label = await page.locator('button.nav-toggle').getAttribute('aria-label');
    expect(label).toBeTruthy();
    expect((label || '').length).toBeGreaterThan(0);
  });
});

// ── Desktop sidebar layout ─────────────────────────────────────
test.describe('Desktop sidebar layout', () => {
  test('sidebar is fixed on the left, 280px wide, full viewport height', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/');

    const header = page.locator('header.site-header');
    const style = await header.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        position: cs.position,
        left: cs.left,
        top: cs.top,
        bottom: cs.bottom,
        width: cs.width,
      };
    });
    expect(style.position).toBe('fixed');
    expect(style.left).toBe('0px');
    expect(style.top).toBe('0px');
    expect(style.bottom).toBe('0px');
    expect(style.width).toBe('280px');
  });

  test('sidebar overflow is hidden (no scrollbars) and content fits at 800px', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/');

    const overflow = await page
      .locator('header.site-header')
      .evaluate((el) => {
        const cs = window.getComputedStyle(el);
        return { overflow: cs.overflow, overflowX: cs.overflowX, overflowY: cs.overflowY };
      });
    expect(overflow.overflow).toBe('hidden');
    expect(overflow.overflowX).toBe('hidden');
    expect(overflow.overflowY).toBe('hidden');

    const sizes = await page
      .locator('header.site-header')
      .evaluate((el) => ({ scroll: el.scrollHeight, client: el.clientHeight }));
    expect(sizes.scroll).toBeLessThanOrEqual(sizes.client);
  });

  test('sidebar shows a Kalkulator section heading above the nav links', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/pesangon.html');

    const heading = page.locator('nav#primary-nav > h2.nav-heading');
    await expect(heading).toBeAttached();
    await expect(heading).toHaveText('Kalkulator');

    const order = await page.evaluate(() => {
      const nav = document.getElementById('primary-nav');
      const kids = Array.from(nav.children);
      return {
        firstTag: kids[0].tagName.toLowerCase(),
        secondTag: kids[1] ? kids[1].tagName.toLowerCase() : null,
      };
    });
    expect(order.firstTag).toBe('h2');
    expect(order.secondTag).toBe('a');
  });

  test('body content is offset to the right of the sidebar', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/');

    const paddingLeft = await page.evaluate(
      () => window.getComputedStyle(document.body).paddingLeft,
    );
    expect(paddingLeft).toBe('280px');
  });

  test('sidebar nav links stack vertically as block items', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/');

    const navStyle = await page.locator('nav#primary-nav').evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { display: cs.display, flexDirection: cs.flexDirection };
    });
    expect(navStyle.display).toBe('flex');
    expect(navStyle.flexDirection).toBe('column');

    const firstLinkDisplay = await page
      .locator('nav#primary-nav a')
      .first()
      .evaluate((el) => window.getComputedStyle(el).display);
    expect(firstLinkDisplay).toBe('block');
  });

  test('active link on calculator page shows the accent indicator', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    await page.goto('/pesangon.html');

    const activeLink = page.locator('nav#primary-nav a.active');
    await expect(activeLink).toBeAttached();

    const style = await activeLink.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        borderLeftColor: cs.borderLeftColor,
        borderLeftWidth: cs.borderLeftWidth,
        color: cs.color,
      };
    });
    expect(style.borderLeftColor).toBe('rgb(242, 183, 5)');
    expect(style.borderLeftWidth).toBe('3px');
    expect(style.color).toBe('rgb(255, 241, 190)');
  });
});

// ── Fixture-driven calculator regression ───────────────────────
const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'calculator-cases.json');
const FIXTURES = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8'));

test.describe('Calculator regression fixtures (all 13)', () => {
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
