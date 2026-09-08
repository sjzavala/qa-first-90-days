/* QA at StrongMind — presentation controls.
   1. keyboard navigation between slides (↓ ↑, J K, 1–7, Home/End)
   2. scroll spy: nav highlight + HUD position
   3. pass ?api= through to the embedded Counterspell so a live backend can be used
   4. footer year */

(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('[data-slide]'));
  const navLinks = Array.from(document.querySelectorAll('.nav-links > a[href^="#"]'));
  const hudCurrent = document.querySelector('[data-hud-current]');
  const hudTotal = document.querySelector('[data-hud-total]');
  const pad2 = (n) => String(n).padStart(2, '0');
  if (hudTotal) hudTotal.textContent = pad2(slides.length);

  let current = 0;

  function setCurrent(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    if (hudCurrent) hudCurrent.textContent = pad2(current + 1);
    const id = slides[current].id;
    navLinks.forEach((a) => {
      const match = a.getAttribute('href') === `#${id}`;
      if (match) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    document.body.dataset.currentSlide = String(current + 1);
  }

  function goTo(index) {
    const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrent(slides.indexOf(target));
    // Update the hash without adding history entries for every keypress.
    history.replaceState(null, '', `#${target.id}`);
  }

  /* ---------- 1. Keyboard ---------- */

  const EDITABLE = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (EDITABLE.has(t.tagName) || t.isContentEditable)) return;

    switch (e.key) {
      case 'ArrowDown': case 'ArrowRight': case 'j': case 'J': case 'PageDown':
        e.preventDefault(); goTo(current + 1); break;
      case 'ArrowUp': case 'ArrowLeft': case 'k': case 'K': case 'PageUp':
        e.preventDefault(); goTo(current - 1); break;
      case 'Home':
        e.preventDefault(); goTo(0); break;
      case 'End':
        e.preventDefault(); goTo(slides.length - 1); break;
      default:
        if (/^[1-9]$/.test(e.key) && Number(e.key) <= slides.length) {
          e.preventDefault();
          goTo(Number(e.key) - 1);
        }
    }
  });

  // Clicking outside the iframe returns focus to the document so keys work again.
  document.addEventListener('pointerdown', (e) => {
    if (!(e.target instanceof HTMLIFrameElement) && document.activeElement instanceof HTMLIFrameElement) {
      document.activeElement.blur();
    }
  });

  /* ---------- 2. Scroll spy ---------- */

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setCurrent(slides.indexOf(entry.target));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    slides.forEach((s) => spy.observe(s));
  }

  // Start on the slide named in the hash, if any.
  const initial = slides.findIndex((s) => `#${s.id}` === location.hash);
  setCurrent(initial >= 0 ? initial : 0);

  /* ---------- 3. Counterspell embed: pass a backend through ---------- */

  const params = new URLSearchParams(location.search);
  const api = params.get('api');
  const frame = document.getElementById('counterspell-frame');
  const open = document.getElementById('counterspell-open');
  if (api && frame && open) {
    const src = `counterspell/index.html?mode=live&api=${encodeURIComponent(api)}`;
    frame.setAttribute('src', src);
    open.setAttribute('href', src);
  }

  /* ---------- 4. Day 60: replayed test run, linked to the clips ---------- */

  // The six tests and their durations from the recorded run (list reporter output, media/suite-run.txt).
  const SUITE = [
    { line: 9,  title: 'student completes a quiz and sees the grade',            ms: 587 },
    { line: 23, title: 'submit stays disabled until every question is answered', ms: 226 },
    { line: 34, title: 'a graded assignment shows its status on the list',       ms: 348 },
    { line: 48, title: 'switching student shows a clean slate',                  ms: 312 },
    { line: 62, title: 'teacher sees submissions and filters by assignment',     ms: 111 },
    { line: 77, title: 'teacher view shows the empty state after a reset',       ms: 106 },
  ];
  // The real durations sum to 1.7 s. Stretched ×4 so the replay lands in the 5–8 s window and each pass is watchable.
  const PACE = 4;
  const SUMMARY = '  6 passed (4.3s)';

  const runner = document.querySelector('[data-testid="runner"]');
  const log = document.querySelector('[data-runner-log]');
  const runBtn = document.querySelector('[data-run-suite]');
  const hint = document.querySelector('[data-runner-hint]');
  const clips = Array.from(document.querySelectorAll('.clip[data-test-title]'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
  let running = false;

  function clearActive() {
    clips.forEach((c) => c.classList.remove('active'));
    log.querySelectorAll('.log-line.active').forEach((l) => l.classList.remove('active'));
  }

  function lineFor(title) {
    return log.querySelector(`.log-line[data-test-title="${CSS.escape(title)}"]`);
  }

  /** Terminal → clip: highlight both, scroll to the clip, play it from the start. */
  function showClip(title) {
    const clip = clips.find((c) => c.dataset.testTitle === title);
    if (!clip) return;
    clearActive();
    clip.classList.add('active');
    lineFor(title)?.classList.add('active');
    clip.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    const video = clip.querySelector('video');
    if (video) { video.currentTime = 0; video.play().catch(() => {}); }
  }

  /** Clip → terminal: highlight the line and scroll it into view inside the pane only. */
  function showLine(title) {
    if (runner.dataset.state !== 'done') renderRun(true);
    clearActive();
    const clip = clips.find((c) => c.dataset.testTitle === title);
    clip?.classList.add('active');
    const line = lineFor(title);
    if (!line) return;
    line.classList.add('active');
    log.scrollTop = line.offsetTop - log.offsetTop - 12;
    line.focus({ preventScroll: true });
  }

  function makeLine(t, n) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'log-line';
    b.dataset.testTitle = t.title;
    b.dataset.logLine = String(n);
    b.setAttribute('aria-label', `Passed: ${t.title}, ${t.ms} ms. Watch this test.`);
    b.innerHTML = `  <span class="ok">✓</span>  ${n} [chromium] › e2e/course-app.spec.js:${t.line}:1 › ${t.title} <span class="dim">(${t.ms}ms)</span>`;
    b.addEventListener('click', () => showClip(t.title));
    return b;
  }

  function resetLog() {
    log.innerHTML = '';
    const cmd = document.createElement('div');
    cmd.className = 'log-cmd';
    cmd.textContent = '› npx playwright test';
    log.appendChild(cmd);
    return cmd;
  }

  /** Replay the recorded run. `instant` renders everything at once (reduced motion, or a clip click before any run). */
  async function renderRun(instant) {
    if (running) return;
    running = true;
    runner.dataset.state = 'running';
    runBtn.disabled = true;
    runBtn.textContent = 'Running…';
    const fast = instant || reduced;
    resetLog();
    const head = document.createElement('div');
    head.textContent = 'Running 6 tests using 1 worker';
    head.className = 'log-cursor';
    log.appendChild(head);
    if (!fast) await sleep(700);
    head.classList.remove('log-cursor');
    let n = 0;
    for (const t of SUITE) {
      if (!fast) await sleep(t.ms * PACE);
      n += 1;
      log.appendChild(makeLine(t, n));
      log.scrollTop = log.scrollHeight;
    }
    if (!fast) await sleep(350);
    const summary = document.createElement('div');
    summary.className = 'log-summary';
    summary.dataset.logLine = '7';
    summary.textContent = SUMMARY;
    log.appendChild(summary);
    log.scrollTop = log.scrollHeight;
    runner.dataset.state = 'done';
    runBtn.disabled = false;
    runBtn.textContent = 'Replay ↺';
    running = false;
  }

  if (runner && log && runBtn) {
    runBtn.addEventListener('click', () => { void renderRun(false); });
    if (hint) hint.hidden = false;
    clips.forEach((clip) => {
      const go = () => showLine(clip.dataset.testTitle);
      clip.addEventListener('click', go);
      clip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }

  /* ---------- 5. Year ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
