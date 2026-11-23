/* Ember House · co-living pg2 — interactions */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(hover: none)').matches;
  const G = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  if (G) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll + nav ---------- */
  let lenis = null;
  if (G && !reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.08 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  let lastY = 0, velocity = 0;
  const onScroll = (y) => {
    nav.classList.toggle('is-solid', y > 60);
    if (y > 300 && y > lastY + 4) nav.classList.add('is-hidden');
    else if (y < lastY - 4) nav.classList.remove('is-hidden');
    lastY = y;
  };
  lenis ? lenis.on('scroll', (l) => { onScroll(l.scroll); velocity = l.velocity; }) : addEventListener('scroll', () => onScroll(scrollY), { passive: true });
  const closeMenu = () => { if (menu.hidden) return; menu.hidden = true; burger.setAttribute('aria-expanded', 'false'); lenis && lenis.start(); };
  burger.addEventListener('click', () => {
    const open = menu.hidden; menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); const t = id.length > 1 && $(id); if (!t) return;
    e.preventDefault(); closeMenu();
    lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- Loader: count up, shutters lift ---------- */
  const loader = $('#loader'), countEl = $('#loaderCount'), bar = $('#loaderBar');
  let got = 0, target = 0, shown = 0, done = false;
  const crit = ['/assets/video/living-poster.jpg', '/assets/img/room-loft.jpg'];
  const bump = () => { got++; target = got / (crit.length + 1) * 100; };
  crit.forEach((s) => { const i = new Image(); i.onload = i.onerror = bump; i.src = s; });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(bump);
  setTimeout(() => { target = 100; }, 3800);
  setTimeout(() => finish(), 6000);
  (function tick() {
    if (done) return;
    shown += (target - shown) * 0.1 + 0.5; if (shown > target) shown = target;
    countEl.textContent = String(Math.round(shown)).padStart(2, '0');
    bar.style.width = shown + '%';
    if (shown >= 99.5) return finish();
    setTimeout(tick, 16);
  })();
  function finish() {
    if (done) return; done = true;
    countEl.textContent = '100'; bar.style.width = '100%';
    document.body.classList.remove('is-loading');
    const end = () => { loader.classList.add('is-done'); lenis && lenis.start(); const v = $('#heroVideo'); v && v.play && v.play().catch(() => {}); };
    if (!G || reduce) { end(); return; }
    gsap.timeline({ onComplete: end })
      .to(['.loader__brand', '.loader__bar', '.loader__count'], { opacity: 0, y: -20, duration: 0.4, stagger: 0.05, ease: 'power2.in' })
      .to('.loader__shutters span', { yPercent: -100, duration: 0.9, stagger: 0.07, ease: 'power4.inOut' }, 0.25)
      .from('.hero__title .ln > span', { yPercent: 105, duration: 1.2, stagger: 0.1, ease: 'power4.out' }, 0.75)
      .from(['.hero__kicker', '.hero__foot'], { opacity: 0, y: 20, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 1)
      .from('#heroVideo', { scale: 1.15, duration: 2, ease: 'power3.out' }, 0.4);
  }

  /* ---------- Hero spotlight ---------- */
  const dark = $('#heroDark'), hero = $('.hero');
  const spot = { x: innerWidth * 0.7, y: innerHeight * 0.42, tx: innerWidth * 0.7, ty: innerHeight * 0.42, r: touch ? 200 : 260 };
  if (!reduce) {
    hero.addEventListener('pointermove', (e) => { const b = hero.getBoundingClientRect(); spot.tx = e.clientX - b.left; spot.ty = e.clientY - b.top; });
    if (touch && G) {
      const drift = () => gsap.to(spot, { tx: gsap.utils.random(innerWidth * 0.2, innerWidth * 0.8), ty: gsap.utils.random(innerHeight * 0.2, innerHeight * 0.6), duration: 2.6, ease: 'sine.inOut', onComplete: drift });
      drift();
    }
    (function loop() {
      spot.x += (spot.tx - spot.x) * 0.12; spot.y += (spot.ty - spot.y) * 0.12;
      dark.style.setProperty('--mx', spot.x + 'px'); dark.style.setProperty('--my', spot.y + 'px');
      dark.style.setProperty('--r', spot.r + 'px');
      requestAnimationFrame(loop);
    })();
  } else dark.style.background = 'rgba(20,14,24,.55)';

  /* ---------- Intro words ---------- */
  const lead = $('#introLead');
  lead.innerHTML = lead.textContent.trim().split(/\s+/).map((w) => `<span class="wd">${w}</span>`).join(' ');
  const wds = $$('.wd', lead);
  if (!G || reduce) wds.forEach((w) => w.classList.add('is-in'));

  /* ---------- Rooms accordion ---------- */
  const panels = $$('.acc__panel');
  const open = (p) => panels.forEach((x) => x.classList.toggle('is-open', x === p));
  panels.forEach((p) => {
    p.addEventListener('click', () => open(p));
    p.addEventListener('focus', () => open(p));
    if (!touch) p.addEventListener('mouseenter', () => open(p));
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(p); } });
  });

  /* ---------- Evenings: image trail ---------- */
  const trail = $('#trail');
  const pics = ['bistro', 'leather', 'candle', 'cafe', 'armchair', 'citylights', 'oldbooks', 'diningview', 'room-nook', 'library', 'bed-linen'].map((n) => `/assets/img/${n}.jpg`);
  pics.forEach((s) => { const i = new Image(); i.src = s; }); // warm the cache so the trail never pops in blank
  let pi = 0, lx = 0, ly = 0, zi = 1;
  function drop(x, y) {
    const img = document.createElement('img');
    img.className = 'trail-img'; img.src = pics[pi++ % pics.length]; img.alt = '';
    img.style.zIndex = ++zi;
    trail.appendChild(img);
    const w = img.offsetWidth || 220, h = img.offsetHeight || 275;
    if (!G || reduce) { img.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px)`; setTimeout(() => img.remove(), 900); return; }
    gsap.set(img, { x: x - w / 2, y: y - h / 2, rotation: gsap.utils.random(-8, 8) });
    gsap.timeline({ onComplete: () => img.remove() })
      .from(img, { scale: 0.4, opacity: 0, duration: 0.45, ease: 'back.out(1.8)' })
      .to(img, { y: '+=60', opacity: 0, scale: 0.85, duration: 0.8, ease: 'power2.in' }, 1.1);
  }
  trail.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const b = trail.getBoundingClientRect(); const x = e.clientX - b.left, y = e.clientY - b.top;
    if (Math.hypot(x - lx, y - ly) > 90) { drop(x, y); lx = x; ly = y; }
  });
  trail.addEventListener('pointerdown', (e) => {
    const b = trail.getBoundingClientRect();
    for (let k = 0; k < 3; k++) setTimeout(() => drop(e.clientX - b.left + (k - 1) * 70, e.clientY - b.top + (k - 1) * 30), k * 110);
  });
  if (touch && 'IntersectionObserver' in window) { // phones: the trail plays by itself while on screen
    let timer = null;
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !timer) timer = setInterval(() => drop(Math.random() * trail.clientWidth, Math.random() * trail.clientHeight), 650);
      else if (!en.isIntersecting) { clearInterval(timer); timer = null; }
    }, { threshold: 0.4 }).observe(trail);
  }

  /* ---------- Membership switch ---------- */
  const prices = $$('.price');
  $$('.switch button').forEach((b) => b.addEventListener('click', () => {
    $$('.switch button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    const k = b.dataset.plan === 's' ? 0.92 : 1;
    prices.forEach((p) => {
      const to = Math.round((+p.dataset.m * k) / 50) * 50;
      const from = +(p.dataset.now || p.dataset.m); p.dataset.now = to;
      if (!G || reduce) { p.textContent = inr(to); return; }
      const o = { v: from };
      gsap.to(o, { v: to, duration: 0.8, ease: 'power3.out', onUpdate: () => { p.textContent = inr(o.v); } });
      gsap.fromTo(p, { rotationX: -60, opacity: 0.3 }, { rotationX: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
    });
  }));

  /* ---------- Reserve: multi-step form ---------- */
  const form = $('#steps'), stepEls = $$('.step', form), next = $('#stepNext'), back = $('#stepBack');
  const rDate = $('#r-date');
  const now = new Date(); rDate.min = new Date(now - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  let cur = 0;
  function go(n) {
    stepEls.forEach((s, i) => { s.classList.toggle('is-on', i === n); s.classList.toggle('is-past', i < n); });
    cur = n;
    $('#stepsBar').style.width = Math.min(100, (n + 1) / 3 * 100) + '%';
    $('#stepsCount').textContent = n < 3 ? `Step ${n + 1} of 3` : 'Done';
    back.hidden = n === 0 || n === 3;
    next.hidden = n === 3;
    next.textContent = n === 2 ? 'Request my room' : 'Continue';
    const f = stepEls[n].querySelector('input, select'); f && f.focus({ preventScroll: true });
  }
  const check = (id, ok) => { const el = $('#' + id); el.closest('.field').classList.toggle('has-err', !ok); el.setAttribute('aria-invalid', String(!ok)); if (!ok) el.focus(); return ok; };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (cur === 0) {
      const a = check('r-name', $('#r-name').value.trim().length > 1);
      const b = check('r-phone', /^[6-9]\d{9}$/.test($('#r-phone').value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '')));
      if (!(a && b)) return;
    }
    if (cur === 2) {
      if (!check('r-date', !!rDate.value && rDate.value >= rDate.min)) return;
      const room = form.querySelector('input[name="room"]:checked').value;
      $('#doneText').textContent = `We've noted The ${room} at ${$('#r-house').value}. A house host will call ${$('#r-name').value.trim().split(' ')[0]} today to set up a visit.`;
      // Connect to the client's CRM / email endpoint here.
    }
    go(cur + 1);
  });
  back.addEventListener('click', () => go(Math.max(0, cur - 1)));
  ['r-name', 'r-phone', 'r-date'].forEach((id) => $('#' + id).addEventListener('input', (e) => e.target.closest('.field').classList.remove('has-err')));

  /* ---------- Lazy videos ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((ens) => ens.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) { if (!v.dataset.ready) { $$('source[data-src]', v).forEach((s) => { s.src = s.dataset.src; }); v.load(); v.dataset.ready = 1; } reduce || v.play().catch(() => {}); }
      else if (v.dataset.ready) v.pause();
    }), { rootMargin: '300px 0px' });
    $$('video[data-lazy-video]').forEach((v) => io.observe(v));
  }

  if (!G) return;
  const mm = gsap.matchMedia();

  /* ---------- Hero: spotlight widens as you scroll out ---------- */
  if (!reduce) {
    gsap.to(spot, { r: Math.max(innerWidth, innerHeight) * 1.4, ease: 'power1.in', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__inner', { yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 30%', scrub: true } });
  }

  if (!reduce) {
    // Headings wipe up from a clip
    $$('main .h2, .reserve__title').forEach((h) => gsap.from(h, { clipPath: 'inset(0 0 100% 0)', y: 40, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 86%', once: true } }));

    // Intro words brighten with scroll
    ScrollTrigger.create({ trigger: lead, start: 'top 85%', end: 'bottom 50%', scrub: true, onUpdate: (s) => { const n = Math.round(s.progress * wds.length); wds.forEach((w, i) => w.classList.toggle('is-in', i < n)); } });
    $$('[data-speed]').forEach((el) => gsap.to(el, { yPercent: +el.dataset.speed * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement, scrub: true } }));
    gsap.from('.intro__pic', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, stagger: 0.2, ease: 'power4.inOut', scrollTrigger: { trigger: '.intro__pics', start: 'top 80%', once: true } });

    // Rooms accordion slides up panel by panel
    gsap.from('.acc__panel', { y: 80, opacity: 0, duration: 1, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '#acc', start: 'top 85%', once: true } });

    // Houses
    gsap.from('.hcard', { y: 60, opacity: 0, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.hgrid', start: 'top 85%', once: true } });
    gsap.from('.prow', { opacity: 0, x: -20, duration: 0.6, stagger: 0.05, ease: 'power2.out', scrollTrigger: { trigger: '.ptable', start: 'top 85%', once: true } });

    // Footer wordmark drifts
    gsap.fromTo('.foot__big', { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  /* ---------- Walk-through: fly the camera through the house ---------- */
  const space = $('#walkSpace'), figs = $$('figure', space), label = $('#walkLabel'), wbar = $('#walkBar');
  const depth = 900, last = 9;
  function setCam(cam) {
    space.style.setProperty('--cam', cam + 'px');
    let best = null, bestD = Infinity;
    figs.forEach((f) => {
      const zz = (+getComputedStyle(f).getPropertyValue('--z')) * depth + cam;
      let o = 1;
      if (zz > 250) o = Math.max(0, 1 - (zz - 250) / 450);       // just passed the camera: fade out
      else if (zz < -4200) o = Math.max(0, 1 - (-4200 - zz) / 1800); // far away: fade in from the dark
      f.style.opacity = o.toFixed(3);
      f.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      if (zz <= 250 && -zz < bestD) { bestD = -zz; best = f; }
    });
    if (best && label.textContent !== best.dataset.label) {
      label.textContent = best.dataset.label;
      if (!reduce) gsap.fromTo(label, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
    }
  }
  figs.forEach((f) => { f.style.setProperty('--z', f.style.getPropertyValue('--z')); });
  setCam(0);
  if (!reduce) {
    const o = { c: 0 };
    gsap.to(o, {
      c: last * depth + 300, ease: 'none',
      onUpdate: () => { setCam(o.c); wbar.style.width = (o.c / (last * depth + 300) * 100) + '%'; },
      scrollTrigger: { trigger: '.walk', start: 'top top', end: () => '+=' + innerHeight * 3.2, pin: '.walk__pin', scrub: 1, anticipatePin: 1, invalidateOnRefresh: true }
    });
  }

  /* ---------- Amenity marquee: drifts on its own, speeds up with your scroll ---------- */
  const rows = [{ el: $('#amenA'), x: 0, dir: -1 }, { el: $('#amenB'), x: 0, dir: 1 }];
  rows.forEach((r) => { if (r.dir > 0) r.x = -r.el.scrollWidth / 2; });
  if (!reduce) gsap.ticker.add(() => {
    const boost = 1 + Math.min(Math.abs(velocity) * 0.35, 8);
    rows.forEach((r) => {
      const half = r.el.scrollWidth / 2;
      r.x += r.dir * 0.6 * boost;
      if (r.x <= -half) r.x += half; if (r.x >= 0) r.x -= half;
      r.el.style.transform = `translate3d(${r.x}px,0,0)`;
    });
  });

  /* ---------- Monsoon: curtains part ---------- */
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.timeline({ scrollTrigger: { trigger: '.monsoon', start: 'top top', end: '+=130%', pin: '.monsoon__pin', scrub: 1, anticipatePin: 1 } })
      .to('.monsoon__half--l', { xPercent: -100, ease: 'power2.inOut' }, 0)
      .to('.monsoon__half--r', { xPercent: 100, ease: 'power2.inOut' }, 0)
      .fromTo('.monsoon__video', { scale: 1.25 }, { scale: 1, ease: 'none' }, 0)
      .to('.monsoon__quote', { opacity: 1, y: -16, duration: 0.3 }, 0.7);
  });
  mm.add('(prefers-reduced-motion: reduce)', () => { gsap.set(['.monsoon__half'], { display: 'none' }); gsap.set('.monsoon__quote', { opacity: 1 }); });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
