// @ts-check
const { test, expect } = require('@playwright/test');

const SLIDES = ['hero', 'you', 'day-30', 'day-60', 'day-90', 'metrics', 'tests'];

test.describe('Presentation smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has the title and one h1', async ({ page }) => {
    await expect(page).toHaveTitle(/first 90 days/);
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('QA at StrongMind');
  });

  test('seven slides, each with a heading, in order', async ({ page }) => {
    const ids = await page.locator('[data-slide]').evaluateAll((els) => els.map((e) => e.id));
    expect(ids).toEqual(SLIDES);
    for (const id of SLIDES) {
      await expect(page.locator(`#${id}`).getByRole('heading').first()).toHaveText(/\S/);
    }
  });

  test('every nav link targets a slide that exists', async ({ page }) => {
    const hrefs = await page.locator('.nav-links > a[href^="#"]').evaluateAll((els) => els.map((a) => a.getAttribute('href')));
    expect(hrefs.length).toBeGreaterThan(4);
    for (const href of hrefs) await expect(page.locator(href)).toHaveCount(1);
  });
});

test.describe('Art direction', () => {
  test('hero art is full-bleed with a responsive srcset whose files all load', async ({ page, request }) => {
    await page.goto('/');
    const art = page.getByTestId('hero-art');
    await expect(art).toHaveAttribute('sizes', '100vw');
    const srcset = (await art.getAttribute('srcset')) ?? '';
    const files = srcset.split(',').map((s) => s.trim().split(' ')[0]);
    expect(files).toHaveLength(3);
    for (const f of files) {
      const res = await request.get(`/${f}`);
      expect(res.status(), f).toBe(200);
      expect(res.headers()['content-type'], f).toContain('image/webp');
      expect(Number(res.headers()['content-length']), `${f} under 400 KB`).toBeLessThan(400 * 1024);
    }
    // The picked candidate actually rendered.
    const natural = await art.evaluate((img) => /** @type {HTMLImageElement} */ (img).naturalWidth);
    expect(natural).toBeGreaterThan(0);
  });

  test('Day 90 opens with the Counterspell banner and the emblem is the favicon', async ({ page, request }) => {
    await page.goto('/#day-90');
    const banner = page.getByTestId('day90-art').locator('img');
    await expect(banner).toHaveAttribute('srcset', /counterspell-728\.webp 728w/);
    await expect(banner).toHaveAttribute('alt', /.+/);
    const icon = page.locator('link[rel="icon"]');
    await expect(icon).toHaveAttribute('href', 'assets/art/web/emblem-64.png');
    expect((await request.get('/assets/art/web/emblem-64.png')).status()).toBe(200);
  });

  test('the embedded Counterspell carries the emblem too', async ({ page }) => {
    await page.goto('/#day-90');
    await page.locator('#counterspell-frame').scrollIntoViewIfNeeded();
    const frame = page.frameLocator('#counterspell-frame');
    await expect(frame.locator('.brand-emblem')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Keyboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('arrow down and up move one slide at a time and the HUD follows', async ({ page }) => {
    const hud = page.locator('[data-hud-current]');
    await expect(hud).toHaveText('01');
    await page.keyboard.press('ArrowDown');
    await expect(hud).toHaveText('02');
    await expect(page.locator('#you')).toBeInViewport();
    await page.keyboard.press('ArrowDown');
    await expect(hud).toHaveText('03');
    await page.keyboard.press('ArrowUp');
    await expect(hud).toHaveText('02');
  });

  test('J and K work like the arrows', async ({ page }) => {
    await page.keyboard.press('j');
    await expect(page.locator('[data-hud-current]')).toHaveText('02');
    await page.keyboard.press('k');
    await expect(page.locator('[data-hud-current]')).toHaveText('01');
  });

  test('digits jump straight to a slide and update the hash', async ({ page }) => {
    await page.keyboard.press('5');
    await expect(page.locator('#day-90')).toBeInViewport();
    await expect(page.locator('[data-hud-current]')).toHaveText('05');
    await expect(page).toHaveURL(/#day-90$/);
    await page.keyboard.press('End');
    await expect(page.locator('[data-hud-current]')).toHaveText('07');
    await page.keyboard.press('Home');
    await expect(page.locator('[data-hud-current]')).toHaveText('01');
  });

  test('keys are ignored while typing in a form control', async ({ page }) => {
    await page.evaluate(() => {
      const input = document.createElement('input');
      input.id = 'probe';
      input.style.cssText = 'position:fixed;top:0;left:0'; // must not change the scroll position
      document.body.appendChild(input);
    });
    await page.locator('#probe').focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('[data-hud-current]')).toHaveText('01');
  });

  test('the nav marks the current slide', async ({ page }) => {
    await page.keyboard.press('4');
    await expect(page.locator('.nav-links > a[aria-current="true"]')).toHaveAttribute('href', '#day-60');
  });
});

test.describe('Day 60 · course app demo', () => {
  test('six clips, each with a playable source and a poster', async ({ page, request }) => {
    await page.goto('/#day-60');
    const clips = page.locator('[data-testid="clip-grid"] video');
    await expect(clips).toHaveCount(6);
    const sources = await clips.evaluateAll((vs) => vs.map((v) => [v.getAttribute('src'), v.getAttribute('poster')]));
    for (const [src, poster] of sources) {
      expect(src).toMatch(/^media\/.+\.webm$/);
      expect(poster).toMatch(/^media\/.+\.png$/);
      const video = await request.get(`/${src}`);
      expect(video.status(), src).toBe(200);
      expect(video.headers()['content-type']).toContain('video/webm');
      expect((await request.get(`/${poster}`)).status(), poster).toBe(200);
    }
  });

  test('runner log shows a green run and the repo link is set', async ({ page }) => {
    await page.goto('/#day-60');
    await expect(page.getByTestId('runner-log')).toContainText('6 passed');
    await expect(page.getByTestId('runner-log')).not.toContainText('failed');
    const repo = page.locator('[data-testid="course-app-demo"]').getByRole('link', { name: /course-app on GitHub/ });
    await expect(repo).toHaveAttribute('href', 'https://github.com/sjzavala/course-app');
    await expect(repo).toHaveAttribute('target', '_blank');
  });
});

test.describe('Day 90 · Counterspell embed', () => {
  test('the embedded Counterspell boots in replay mode with recordings available', async ({ page }) => {
    await page.goto('/#day-90');
    await page.locator('#counterspell-frame').scrollIntoViewIfNeeded();
    const frame = page.frameLocator('#counterspell-frame');
    await expect(frame.getByTestId('mode-replay')).toHaveAttribute('aria-pressed', 'true', { timeout: 15000 });
    await expect(frame.getByTestId('replay-select').locator('option')).not.toHaveCount(0);
    await expect(frame.getByTestId('replay-select').locator('option').first()).not.toHaveText(/No recordings/);
    await expect(page.locator('#counterspell-open')).toHaveAttribute('href', /counterspell\/index\.html\?mode=replay/);
  });

  test('a replay plays inside the embed without any backend', async ({ page }) => {
    await page.goto('/#day-90');
    await page.locator('#counterspell-frame').scrollIntoViewIfNeeded();
    const frame = page.frameLocator('#counterspell-frame');
    await frame.getByTestId('play').click();
    await expect(frame.getByTestId('replay-badge')).toBeVisible();
    await expect(frame.getByTestId('verdict')).toBeVisible({ timeout: 30000 });
  });

  test('pipeline has five steps linking the four repos', async ({ page }) => {
    await page.goto('/#day-90');
    const steps = page.locator('[data-testid="pipeline"] > li');
    await expect(steps).toHaveCount(5);
    await expect(steps.locator('h4')).toHaveText(['Produce', 'Select', 'Trust', 'Measure', 'Explain']);
    const repos = await page.locator('[data-testid="pipeline"] a[href^="https://github.com/sjzavala/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(repos).toEqual([
      'https://github.com/sjzavala/claude-qa-tms',
      'https://github.com/sjzavala/playwright-test-selector',
      'https://github.com/sjzavala/flake-radar',
      'https://github.com/sjzavala/self-healing-e2e',
    ]);
  });
});

test.describe('Metrics and footer', () => {
  test('metrics table has rows for all three phases', async ({ page }) => {
    await page.goto('/#metrics');
    for (const phase of ['30', '60', '90']) {
      expect(await page.locator(`[data-testid="metrics-table"] tr[data-phase="${phase}"]`).count(), `phase ${phase}`).toBeGreaterThan(0);
    }
  });

  test('the footer carries the CI badge and links to the suite', async ({ page }) => {
    await page.goto('/#tests');
    const badge = page.getByTestId('ci-badge');
    await expect(badge).toHaveAttribute('alt', /smoke suite/i);
    await expect(badge).toHaveAttribute('src', /actions\/workflows\/ci\.yml\/badge\.svg$/);
    await expect(page.getByTestId('ci-badge-link')).toHaveAttribute('href', /actions\/workflows\/ci\.yml$/);
  });

  test('every external link opens in a new tab with rel=noopener', async ({ page }) => {
    await page.goto('/');
    const external = page.locator('a[href^="http"]');
    const n = await external.count();
    expect(n).toBeGreaterThan(5);
    for (let i = 0; i < n; i++) {
      await expect(external.nth(i)).toHaveAttribute('target', '_blank');
      await expect(external.nth(i)).toHaveAttribute('rel', /noopener/);
    }
  });

  test('page never scrolls horizontally', async ({ page }) => {
    await page.goto('/');
    const o = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
    expect(o.s).toBeLessThanOrEqual(o.c);
  });
});
