// @ts-check
const { test, expect } = require('@playwright/test');

const SLIDES = ['hero', 'you', 'day-30', 'day-60', 'day-90', 'tests'];

test.describe('Presentation smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has the title and one h1', async ({ page }) => {
    await expect(page).toHaveTitle(/first 90 days/);
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('The first 90 days of quality at StrongMind.');
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

  test('Day 90 opens with the banner; the simplified mark is the favicon and nav icon; the full emblem sits above Proof', async ({ page, request }) => {
    await page.goto('/#day-90');
    const banner = page.getByTestId('day90-art').locator('img');
    await expect(banner).toHaveAttribute('srcset', /counterspell-728\.webp 728w/);
    await expect(banner).toHaveAttribute('alt', /.+/);
    await expect(page.getByTestId('day90-art').locator('figcaption')).toHaveText('Day 90 · The gate between generated and trusted.');
    const icons = await page.locator('link[rel="icon"]').evaluateAll((ls) => ls.map((l) => l.getAttribute('href')));
    expect(icons).toEqual(['assets/art/web/mark.svg', 'assets/art/web/mark-32.png']);
    for (const href of icons) expect((await request.get(`/${href}`)).status(), href).toBe(200);
    await expect(page.getByTestId('nav-mark')).toHaveAttribute('src', 'assets/art/web/mark.svg');
    await expect(page.getByTestId('emblem-divider').locator('img')).toHaveAttribute('src', 'assets/art/web/emblem-256.png');
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
    await expect(page.locator('[data-hud-current]')).toHaveText('06');
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

  test('repo link is set and the terminal starts idle with a Run button', async ({ page }) => {
    await page.goto('/#day-60');
    const repo = page.locator('[data-testid="course-app-demo"]').getByRole('link', { name: /course-app on GitHub/ });
    await expect(repo).toHaveAttribute('href', 'https://github.com/sjzavala/course-app');
    await expect(repo).toHaveAttribute('target', '_blank');
    await expect(page.getByTestId('runner')).toHaveAttribute('data-state', 'idle');
    await expect(page.getByTestId('run-suite')).toHaveText('Run the suite');
    await expect(page.locator('[data-log-line]')).toHaveCount(0);
  });

  test('Run the suite replays the recorded run line by line and ends with the summary', async ({ page }) => {
    await page.goto('/#day-60');
    const runner = page.getByTestId('runner');
    const btn = page.getByTestId('run-suite');
    const t0 = Date.now();
    await btn.click();
    await expect(runner).toHaveAttribute('data-state', 'running');
    await expect(btn).toBeDisabled();
    // Lines arrive progressively, not all at once.
    await expect(page.locator('.log-line')).toHaveCount(1, { timeout: 5000 });
    const early = await page.locator('[data-log-line]').count();
    await expect(runner).toHaveAttribute('data-state', 'done', { timeout: 20000 });
    const elapsed = (Date.now() - t0) / 1000;
    expect(early).toBeLessThan(7);
    expect(elapsed).toBeGreaterThan(4);
    expect(elapsed).toBeLessThan(12);
    await expect(page.locator('[data-log-line]')).toHaveCount(7); // six tests + summary
    await expect(page.locator('.log-line .ok')).toHaveCount(6);
    await expect(page.locator('.log-summary')).toHaveText(/6 passed/);
    await expect(btn).toHaveText(/Replay/);
    // Replay affordance runs it again from scratch.
    await btn.click();
    await expect(runner).toHaveAttribute('data-state', 'running');
    await expect(runner).toHaveAttribute('data-state', 'done', { timeout: 20000 });
    await expect(page.locator('[data-log-line]')).toHaveCount(7);
  });

  test('reduced-motion users get the whole output instantly', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#day-60');
    await page.getByTestId('run-suite').click();
    await expect(page.getByTestId('runner')).toHaveAttribute('data-state', 'done', { timeout: 2000 });
    await expect(page.locator('[data-log-line]')).toHaveCount(7);
  });

  test('a ✓ line links to its clip, and a clip links back to its line', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#day-60');
    await page.getByTestId('run-suite').click();
    await expect(page.getByTestId('runner')).toHaveAttribute('data-state', 'done', { timeout: 2000 });
    const title = 'switching student shows a clean slate';
    const line = page.locator(`.log-line[data-test-title="${title}"]`);
    const clip = page.locator(`.clip[data-test-title="${title}"]`);
    await expect(line).toHaveRole('button');
    await line.click();
    await expect(clip).toHaveClass(/active/);
    await expect(line).toHaveClass(/active/);
    await expect(clip).toBeInViewport();
    expect(await clip.locator('video').evaluate((v) => v.paused)).toBe(false);
    // Reverse: a different clip highlights its line and clears the previous one.
    const other = 'teacher view shows the empty state after a reset';
    await page.locator(`.clip[data-test-title="${other}"]`).click();
    await expect(page.locator(`.log-line[data-test-title="${other}"]`)).toHaveClass(/active/);
    await expect(line).not.toHaveClass(/active/);
    await expect(page.locator('.clip.active')).toHaveCount(1);
  });

  test('clip click before any run renders the output so the line can be highlighted', async ({ page }) => {
    await page.goto('/#day-60');
    await page.locator('.clip[data-test-title="a graded assignment shows its status on the list"]').click();
    await expect(page.getByTestId('runner')).toHaveAttribute('data-state', 'done', { timeout: 3000 });
    await expect(page.locator('.log-line.active')).toHaveText(/a graded assignment shows its status on the list/);
  });

  test('log lines and clips are keyboard operable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#day-60');
    await page.getByTestId('run-suite').click();
    await expect(page.getByTestId('runner')).toHaveAttribute('data-state', 'done', { timeout: 2000 });
    const line = page.locator('.log-line').first();
    await line.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.clip').first()).toHaveClass(/active/);
    const clip = page.locator('.clip').nth(1);
    await expect(clip).toHaveAttribute('tabindex', '0');
    await clip.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.log-line').nth(1)).toHaveClass(/active/);
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
    await expect(page.getByTestId('embed-caption')).toHaveText('Live mode available during the presentation · replays shown otherwise');
  });

  test('a replay plays inside the embed without any backend', async ({ page }) => {
    await page.goto('/#day-90');
    await page.locator('#counterspell-frame').scrollIntoViewIfNeeded();
    const frame = page.frameLocator('#counterspell-frame');
    await frame.getByTestId('play').click();
    await expect(frame.getByTestId('replay-badge')).toBeVisible();
    await expect(frame.getByTestId('verdict')).toBeVisible({ timeout: 30000 });
  });

  test('merge gate and release gate are contrasted in two cards under the Day 90 narrative', async ({ page }) => {
    await page.goto('/#day-90');
    const cards = page.locator('[data-testid="gate-comparison"] .gate-card');
    await expect(cards).toHaveCount(2);
    await expect(cards.nth(0).locator('h4')).toHaveText('Merge Gate (Automated & Binary)');
    await expect(cards.nth(1).locator('h4')).toHaveText('Release Gate (Evidence & Judgment)');
    await expect(cards.nth(0).locator('dt')).toHaveText(['Trigger', 'Scope', 'Target SLA', 'Criteria']);
    await expect(cards.nth(1).locator('dt')).toHaveText(['Trigger', 'Scope', 'Evaluation', 'Output']);
    await expect(cards.nth(0).locator('dd').nth(2)).toHaveText('Fast feedback (< 5 minutes)');
    await expect(cards.nth(1).locator('dd').nth(3)).toContainText('joint sign-off (EM, Release, QA)');
    // Sits under the narrative and above the Counterspell heading.
    expect(await page.getByTestId('gate-comparison').evaluate((el) => el.nextElementSibling?.id)).toBe('counterspell-title');
    await expect(page.locator('#counterspell-title')).toHaveText('Counterspell — The Automated Governance Gate for AI-Generated Tests');
  });

  test('Counterspell copy uses engineering terms, not RPG ones', async ({ page }) => {
    await page.goto('/');
    const text = await page.locator('#day-90').innerText();
    for (const rpg of ['cantrip', 'leveled slot', 'reaction check', 'arcana', 'RESOLVES', 'RESHAPED', 'COUNTERED']) expect(text.toLowerCase()).not.toContain(rpg.toLowerCase());
    for (const eng of ['Deterministic Rules', 'Semantic Analysis', 'ACCEPTED', 'REFACTORED', 'REJECTED']) expect(text).toContain(eng);
  });

  test('pipeline has four steps linking the three repos', async ({ page }) => {
    await page.goto('/#day-90');
    const steps = page.locator('[data-testid="pipeline"] > li');
    await expect(steps).toHaveCount(4);
    await expect(steps.locator('h4')).toHaveText(['Draft', 'Govern', 'Target', 'Stabilize']);
    const repos = await page.locator('[data-testid="pipeline"] a[href^="https://github.com/sjzavala/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(repos).toEqual([
      'https://github.com/sjzavala/claude-qa-tms',
      'https://github.com/sjzavala/playwright-test-selector',
      'https://github.com/sjzavala/flake-radar',
    ]);
    await expect(page.getByTestId('pipeline-strip')).toHaveText("Each phase is backed by open-source tooling I've built to solve these specific orchestration challenges. At StrongMind, they serve as tested blueprints—adapted to your stack, integrated with your CI/CD, and owned by your engineers.");
    await expect(page.locator('[data-testid="pipeline"] a.prior-art')).toHaveCount(3);
    await expect(page.locator('[data-testid="pipeline"] a.prior-art')).toHaveText(Array(3).fill(/^reference implementation/));
    await expect(steps.nth(0).locator('p')).toContainText('A human engineer reviews every proposed spec.');
    await expect(steps.nth(1).locator('p')).toContainText('Counterspell evaluates the spec before it reaches the codebase');
    await expect(steps.nth(1).locator('a')).toHaveAttribute('href', '#counterspell-frame');
    await expect(steps.nth(3).locator('p')).toContainText('Evidence-based flake detection');
  });
});

test.describe('Copy', () => {
  test('no TODO placeholders remain anywhere on the page', async ({ page }) => {
    await page.goto('/');
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/TODO/);
    expect(await page.locator('.todo, .todo-text').count()).toBe(0);
  });

  test('every slide carries its copy: intro, table or success list', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#you .eyebrow')).toHaveText('Product Landscape & Risk Hierarchy');
    await expect(page.locator('#you-title')).toHaveText('Allocating quality by failure cost.');
    const youIntro = page.locator('#you .section-head .prose p');
    await expect(youIntro).toHaveCount(2);
    await expect(youIntro.first()).toContainText('StrongMind delivers across four distinct surfaces');
    await expect(youIntro.nth(1)).toContainText('the most damage to institutional trust and core operations.');
    await expect(page.locator('#you .closer')).toContainText('rather than polluting the suite.');
    await expect(page.locator('#you [data-testid="risk-table"] thead th')).toHaveText(['Surface', 'Critical Failure Mode', 'Business & Engineering Impact']);
    await expect(page.locator('#you [data-testid="risk-table"] tbody tr').first().locator('td strong').first()).toHaveText('Grades & Progress Data');
    await expect(page.locator('#you [data-testid="risk-table"] tbody tr')).toHaveCount(5);
    await expect(page.getByTestId('day30-success').locator('li')).toHaveCount(4);
    await expect(page.getByTestId('day60-success').locator('li')).toHaveCount(3);
    await expect(page.getByTestId('day90-success').locator('li')).toHaveCount(4);
    await expect(page.getByTestId('day90-success').locator('li').nth(2)).toHaveText('A governance gate — Counterspell or its equivalent in your stack — reviewing every AI-generated test; acceptance rate tracked');
  });

  test('the Day 60 narrative is one consolidated block, then the fixture app', async ({ page }) => {
    await page.goto('/#day-60');
    const prose = page.locator('#day-60 .section-head .prose');
    await expect(prose.locator('p')).toHaveCount(2);
    await expect(prose.locator('p').first()).toContainText('Month two builds the foundation where the risk map points: a full vertical slice on a single product team.');
    await expect(page.getByTestId('day60-intro-line')).toHaveText('The fixture below is Month 2 in miniature: an LMS reference app (quizzes, submissions, grade books) paired with a live, deterministic Playwright suite guarding those critical flows.');
    // Nothing loose between the heading block and the demo panel.
    expect(await page.getByTestId('course-app-demo').evaluate((el) => el.previousElementSibling?.classList.contains('section-head'))).toBe(true);
  });

  test('the Counterspell introduction is one consolidated block under its heading', async ({ page }) => {
    await page.goto('/#day-90');
    const prose = page.locator('#counterspell-title + .prose');
    await expect(prose.locator('> p').first()).toContainText('Generating a test is cheap; maintaining a bad one is expensive.');
    await expect(prose.locator('ul li')).toHaveCount(2);
    await expect(prose.locator('ul li strong')).toHaveText(['Deterministic Rules:', 'Semantic Analysis:']);
    await expect(prose.locator('ul li code')).toHaveText('networkidle');
    await expect(prose.locator('> p').nth(1)).toContainText('ACCEPTED, REFACTORED, or REJECTED');
    await expect(page.getByTestId('day90-caveat')).toHaveText("Note: This reference architecture uses a zero-dependency fixture to validate the pattern. Month 1 discovery will determine whether these gating rules run natively in StrongMind's existing CI/CD or as an integrated service.");
    // Nothing loose between the heading block and the embed any more.
    expect(await page.getByTestId('counterspell-embed').evaluate((el) => el.previousElementSibling?.classList.contains('section-head'))).toBe(true);
  });
});

test.describe('The plan at a glance', () => {
  test('a 3×3 swimlane table with its intro line closes the Day 90 section', async ({ page }) => {
    await page.goto('/#day-90');
    await expect(page.getByTestId('glance-intro')).toHaveText('Three lanes, ninety days — the technical work is only the first column.');
    const table = page.getByTestId('glance-table');
    await expect(table.locator('thead th')).toHaveText(['Phase', 'Core responsibilities', 'Team & culture', 'Operations']);
    const rows = table.locator('tbody tr');
    await expect(rows).toHaveCount(3);
    await expect(rows.locator('th[scope="row"]')).toHaveText(['Day 30', 'Day 60', 'Day 90']);
    for (let i = 0; i < 3; i++) await expect(rows.nth(i).locator('td')).toHaveCount(3);
    await expect(rows.nth(0).locator('td').nth(0)).toHaveText('Release archaeology; risk map agreed with EM and Release; one visible fix shipped; metrics baseline started');
    await expect(rows.nth(2).locator('td').nth(2)).toHaveText("Metrics dashboard live; quarterly quality review format proposed; docs current enough that day 91 doesn't depend on my memory");
    // Placement: after "Success at day 90", still inside #day-90, as the last block before Metrics.
    expect(await table.evaluate((t) => t.closest('section')?.id)).toBe('day-90');
    expect(await page.getByTestId('day90-success').evaluate((el) => el.compareDocumentPosition(document.querySelector('[data-testid="glance-table"]')) & Node.DOCUMENT_POSITION_FOLLOWING)).toBeTruthy();
    expect(await page.locator('#day-90 .section-inner > *').last().evaluate((el) => el.querySelector('[data-testid="glance-table"]') !== null)).toBe(true);
  });
});

test.describe('Footer', () => {
  test('the footer carries the CI badge and links to the suite', async ({ page }) => {
    await page.goto('/#tests');
    const badge = page.getByTestId('ci-badge');
    await expect(badge).toHaveAttribute('alt', /smoke suite/i);
    await expect(badge).toHaveAttribute('src', /actions\/workflows\/ci\.yml\/badge\.svg$/);
    // Source tree links to the workflow; the staged artifact links to the run that built it.
    await expect(page.getByTestId('ci-badge-link')).toHaveAttribute('href', /actions\/(workflows\/ci\.yml|runs\/\d+)$/);
  });

  test('no link to the portfolio remains anywhere on the page', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('a[href*="portfolio"]').count()).toBe(0);
    expect(await page.locator('#tests a').count()).toBe(2);
    await expect(page.locator('.site-footer')).not.toContainText(/Claude Code|Reviewed by me|verdicts logged/);
    await expect(page.locator('.site-footer .footer-name')).toHaveText('Seve Zavala');
  });

  test('the closing section looks past day 90, thanks the panel, and keeps the self-test proof as a footnote', async ({ page }) => {
    await page.goto('/#tests');
    await expect(page.locator('#tests .eyebrow')).toHaveText('The Road Ahead');
    await expect(page.locator('#tests-title')).toContainText('From tactical gates to an engineering habit.');
    await expect(page.locator('#tests-title .mage')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('#tests .prose p')).toHaveText("A 90-day plan is only successful if the momentum outlasts the onboarding window. By establishing clear baselines, proving value on a single team, and introducing governed automation, test orchestration stops being a bottleneck and becomes an everyday engineering habit. The goal isn't just a green suite—it's giving product teams the confidence to ship faster because they trust their safety net.");
    const thanks = page.getByTestId('closing-thanks');
    await expect(thanks.locator('p')).toHaveCount(2);
    await expect(thanks.locator('p strong').first()).toHaveText('Thank you for taking the time to explore this.');
    await expect(thanks.locator('p').nth(1)).toContainText('tailor this roadmap to StrongMind.');
    const footnote = page.getByTestId('site-ci-footnote');
    await expect(footnote.locator('p')).toContainText('Practice what you preach: this deck runs its own Playwright smoke suite on every push.');
    await expect(footnote.getByTestId('ci-badge')).toBeVisible();
    await expect(footnote.locator('a.text-link')).toHaveAttribute('href', /tree\/main\/e2e$/);
    // Order: the outlook, then the thank-you, then the proof footnote.
    expect(await page.getByTestId('road-ahead').evaluate((el) => [...el.children].map((c) => c.classList[0]))).toEqual(['prose', 'closing-thanks', 'site-ci-footnote']);
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

test.describe('Motion', () => {
  test('a reading-progress bar tracks the scroll position along the top edge', async ({ page }) => {
    await page.goto('/');
    const bar = page.getByTestId('progress');
    await expect(bar).toHaveAttribute('data-progress', '0.00');
    await expect(bar).toHaveCSS('transform', /^matrix\(0,/);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(bar).toHaveAttribute('data-progress', '1.00');
    await expect(bar).toHaveCSS('transform', /^matrix\(1,/);
  });

  test('content below the fold reveals as it scrolls into view, staggered, then settles', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/motion/);
    const table = page.locator('#day-90 .table-wrap');
    await expect(table).toHaveClass(/\breveal\b/);
    expect(await table.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
    // Siblings are numbered for the stagger; rows fade rather than move.
    expect(await page.locator('#day-90 .pipeline li').nth(2).evaluate((el) => el.style.getPropertyValue('--i'))).toBe('2');
    await expect(page.locator('[data-testid="glance-table"] tbody tr').nth(1)).toHaveClass(/reveal-fade/);
    await table.scrollIntoViewIfNeeded();
    await expect(table).toHaveClass(/is-in/);
    // Once the entrance has played the reveal class is dropped so hover transitions take over.
    await expect(table).not.toHaveClass(/\breveal\b/, { timeout: 5000 });
    expect(await table.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    await expect(page.locator('[data-testid="glance-table"] tbody tr').nth(2)).toHaveClass(/is-in/);
  });

  test('the hero rises in on load, the active slide underlines its number and the HUD counter ticks', async ({ page }) => {
    await page.goto('/');
    const title = page.locator('#hero-title');
    expect(await title.evaluate((el) => getComputedStyle(el).animationName)).toBe('rise');
    await expect.poll(() => title.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    await expect(page.locator('#hero')).toHaveClass(/is-current/);
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#you')).toHaveClass(/is-current/);
    await expect(page.locator('#hero')).not.toHaveClass(/is-current/);
    await expect(page.locator('[data-hud-current]')).toHaveClass(/tick/);
    await expect.poll(() => page.locator('#you .section-num').evaluate((el) => getComputedStyle(el, '::after').transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
  });

  test('the accent glow follows the pointer across the dark sections', async ({ page, isMobile }) => {
    test.skip(isMobile, 'no pointer hover on touch devices');
    await page.goto('/');
    const glow = page.locator('#hero .glow');
    await expect(glow).toHaveCount(1);
    await expect(page.locator('#tests .glow')).toHaveCount(1);
    await page.mouse.move(300, 420);
    await expect(glow).toHaveCSS('opacity', '1');
    expect(await glow.evaluate((el) => el.style.getPropertyValue('--mx'))).toMatch(/^\d+px$/);
    await page.mouse.move(300, 2000);
    await expect(glow).toHaveCSS('opacity', '0');
  });

  test('reduced motion renders everything in place: no entrance, no reveals, no glow', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveClass(/motion/);
    expect(await page.locator('.reveal, .reveal-fade, .reveal-emblem, .glow').count()).toBe(0);
    expect(await page.locator('#day-90 .table-wrap').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    expect(await page.locator('#hero-title').evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    // The progress bar still tracks; it just doesn't animate.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.getByTestId('progress')).toHaveAttribute('data-progress', '1.00');
  });
});

test.describe('Ergonomics', () => {
  test('Day 60 closes with a compact conventions card: isolation, selectors, async', async ({ page }) => {
    await page.goto('/#day-60');
    const card = page.getByTestId('day60-conventions');
    await expect(card.locator('dt')).toHaveText(['Isolation', 'Selectors', 'Async']);
    await expect(card.locator('dd').nth(0)).toHaveText('Zero shared state; fixtures seed auth and database resets per worker.');
    await expect(card.locator('dd').nth(1)).toHaveText('Semantic user-facing locators (getByRole, getByLabel) over brittle DOM paths.');
    await expect(card.locator('dd').nth(2)).toHaveText('Web-first assertions only; zero hardcoded timeouts.');
    await expect(card.locator('code')).toHaveCount(2);
    // Sits directly under the success criteria.
    expect(await card.evaluate((el) => el.previousElementSibling?.getAttribute('data-testid'))).toBe('day60-success');
  });

  test('the terminal log scrolls sideways inside its pane on a half-width window; the page never widens', async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#day-60');
    await page.getByTestId('run-suite').click();
    await expect(page.getByTestId('runner')).toHaveAttribute('data-state', 'done');
    const log = page.locator('.runner-log');
    await expect(log).toHaveCSS('overflow-x', 'auto');
    const m = await log.evaluate((el) => ({ inner: el.scrollWidth > el.clientWidth, pane: el.clientWidth, panel: el.closest('.demo-panel').clientWidth }));
    expect(m.inner).toBe(true);
    expect(m.pane).toBeLessThanOrEqual(m.panel);
    const o = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, c: document.documentElement.clientWidth }));
    expect(o.s).toBeLessThanOrEqual(o.c);
  });

  test('the header is sticky, on top, and opaque enough to read over any section', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('.site-header');
    await expect(header).toHaveCSS('position', 'sticky');
    await expect(header).toHaveCSS('top', '0px');
    await expect(header).toHaveCSS('z-index', '50');
    const alpha = await header.evaluate((el) => Number(getComputedStyle(el).backgroundColor.match(/[\d.]+(?=\)$)/)?.[0] ?? 1));
    expect(alpha).toBeGreaterThanOrEqual(0.95);
    // Still pinned at the top after scrolling deep into the page.
    await page.evaluate(() => window.scrollTo(0, 4000));
    expect((await header.boundingBox()).y).toBe(0);
  });

  test('the nav links stay visible and clickable on half-width and phone windows', async ({ page }) => {
    for (const width of [720, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const links = page.locator('.nav-links > a');
      await expect(links).toHaveCount(5);
      for (let i = 0; i < 5; i++) await expect(links.nth(i)).toBeVisible();
      await links.last().click();
      await expect(page.locator('#tests')).toBeInViewport();
    }
  });
});
