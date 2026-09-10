/* QA at StrongMind — presentation controls.
   1. keyboard navigation between slides (↓ ↑, J K, 1–6, Home/End)
   2. scroll spy: nav highlight + HUD position
   3. pass ?api= through to the embedded Counterspell so a live backend can be used
   4. Day 60 replayed test run
   5. footer year
   6. motion: reading progress, reveal on scroll, hero drift, cursor glow (off under reduced motion) */

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
    const next = Math.max(0, Math.min(slides.length - 1, index));
    const changed = next !== current || !slides[next].classList.contains('is-current');
    current = next;
    slides.forEach((s, i) => s.classList.toggle('is-current', i === current));
    if (hudCurrent) {
      hudCurrent.textContent = pad2(current + 1);
      if (changed) {
        hudCurrent.classList.remove('tick');
        void hudCurrent.offsetWidth; // restart the animation
        hudCurrent.classList.add('tick');
      }
    }
    const id = slides[current].id;
    navLinks.forEach((a) => {
      const match = a.getAttribute('href') === `#${id}`;
      if (match) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    document.body.dataset.currentSlide = String(current + 1);
  }

  // While a keyboard jump is scrolling, the spy stays quiet so the counter doesn't tick through
  // the slides in between (or, on a quick reversal, land on the wrong one). Released on scrollend
  // where supported, otherwise after the smooth scroll has had time to finish.
  let navLockUntil = 0;
  window.addEventListener('scrollend', () => { navLockUntil = 0; });

  function goTo(index) {
    const target = slides[Math.max(0, Math.min(slides.length - 1, index))];
    if (!target) return;
    navLockUntil = Date.now() + 900;
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
      if (Date.now() < navLockUntil) return;
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

  /* ---------- 6. Motion ---------- */
  // `html.motion` is set in <head> before first paint unless the visitor prefers reduced motion.
  // Everything below is additive: without it the page is fully rendered and static.

  const progress = document.querySelector('[data-testid="progress"]');
  const heroArt = document.querySelector('.hero-bg');
  const motion = document.documentElement.classList.contains('motion');

  // Reading progress along the top edge (also under reduced motion: it only tracks, it doesn't animate).
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (progress) {
        progress.style.setProperty('--progress', p.toFixed(4));
        progress.dataset.progress = p.toFixed(2);
      }
      // Hero art drifts at a twentieth of the scroll while the hero is on screen; the 1.1 scale leaves headroom.
      if (motion && heroArt && window.scrollY < window.innerHeight) {
        heroArt.style.setProperty('--drift', `${(window.scrollY * 0.05).toFixed(1)}px`);
      }
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // Narrow phones: the nav row scrolls sideways; fade its edge only while there is more to reach.
  const navRow = document.querySelector('.nav-links');
  function checkNavOverflow() {
    if (navRow) navRow.classList.toggle('is-overflowing', navRow.scrollWidth > navRow.clientWidth + 1);
  }
  window.addEventListener('resize', checkNavOverflow, { passive: true });
  checkNavOverflow();

  if (motion && 'IntersectionObserver' in window) {
    // Reveal on scroll. Groups stagger via --i. Elements already on screen at load
    // (a hash landing, the hero) are left alone so nothing that was painted disappears.
    const inView = (el) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };
    const stage = (selector, kind, group) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (inView(el) || el.classList.contains('reveal') || el.classList.contains('reveal-fade')) return;
        el.classList.add(kind);
        if (group) {
          const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains(kind));
          el.style.setProperty('--i', String(siblings.indexOf(el)));
        }
      });
    };
    stage('.section-head, .section-head + .two-col > .prose, .closer, .table-wrap, .demo-panel, .banner, .embed, .sub-heading, .closing-thanks, .site-ci-footnote, .table-intro, .pipeline-strip, .sub-heading + .prose, .conventions', 'reveal', false);
    stage('.success-list li, .gate-card, .pipeline li, .clip, .road-ahead > .prose', 'reveal', true);
    stage('.data-table tbody tr', 'reveal-fade', true);
    stage('.emblem-divider img', 'reveal-emblem', false);

    const settle = (el) => {
      el.classList.remove('reveal', 'reveal-fade', 'reveal-emblem');
      el.style.removeProperty('--i');
    };
    const revealer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        revealer.unobserve(el);
        el.classList.add('is-in');
        // Hand over to the hover transitions once the entrance has finished (with a fallback if transitionend never fires).
        // transitionend bubbles from children (arrows, tags), so only the element's own transition counts.
        const done = (e) => {
          if (e && e.target !== el) return;
          el.removeEventListener('transitionend', done);
          settle(el);
        };
        el.addEventListener('transitionend', done);
        setTimeout(done, 2400);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    document.querySelectorAll('.reveal, .reveal-fade, .reveal-emblem').forEach((el) => revealer.observe(el));

    // Cursor glow on the dark sections: the accent light follows the pointer.
    if (window.matchMedia('(hover: hover)').matches) {
      document.querySelectorAll('.hero, #tests').forEach((section) => {
        const glow = document.createElement('div');
        glow.className = 'glow';
        glow.setAttribute('aria-hidden', 'true');
        section.classList.add('has-glow');
        section.prepend(glow);
        section.addEventListener('pointermove', (e) => {
          const r = section.getBoundingClientRect();
          glow.style.setProperty('--mx', `${e.clientX - r.left}px`);
          glow.style.setProperty('--my', `${e.clientY - r.top}px`);
        }, { passive: true });
      });
    }
  }
})();
