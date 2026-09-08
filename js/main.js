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

  /* ---------- 4. Year ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
