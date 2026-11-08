(() => {
  const $ = s => document.querySelector(s);
  const inr = n => '₹' + n.toLocaleString('en-IN');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mobile = () => innerWidth <= 700;
  const HEART = '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>';
  const PLUS = '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke-linecap="round"/></svg>';

  // ---------- bag, wishlist, toast ----------
  const state = { bag: 0, wish: new Set() };
  let toastTimer;
  function toast(html) {
    const t = $('#toast');
    t.innerHTML = html; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function bump(el, n) {
    el.textContent = n; el.hidden = n === 0;
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  }
  function addToBag(name, n = 1, from, color) {
    state.bag += n;
    bump($('#bagCount'), state.bag);
    toast(`Added <b>${name}</b> to your bag`);
    if (from) flyTo(from, $('#bagBtn'), color);
  }
  function toggleWish(key, btn, label) {
    const on = !state.wish.has(key);
    on ? state.wish.add(key) : state.wish.delete(key);
    btn.classList.toggle('on', on);
    bump($('#wishCount'), state.wish.size);
    toast(on ? `Saved <b>${label}</b> to your wishlist` : `Removed <b>${label}</b> from your wishlist`);
  }
  function flyTo(fromEl, toEl, color = '#c9973f') {
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    const d = document.createElement('div');
    d.className = 'fly-dot'; d.style.background = color;
    d.style.left = a.left + a.width / 2 - 9 + 'px'; d.style.top = a.top + a.height / 2 - 9 + 'px';
    document.body.appendChild(d);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      d.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px, ${b.top + b.height / 2 - a.top - a.height / 2}px) scale(.4)`;
      d.style.opacity = '.3';
    }));
    setTimeout(() => d.remove(), 850);
  }

  // ---------- generic drag / wheel carousel ----------
  function carousel(track, { count, layout, loop = false, start = 0, step = () => 280, onChange }) {
    const items = [...track.children];
    let pos = start, target = start, raf = 0, drag = null, last = -1, wheelAcc = 0;
    const api = { dragged: false };
    const wrap = o => loop ? ((o + count / 2) % count + count) % count - count / 2 : o;
    const idx = () => ((Math.round(target) % count) + count) % count;
    const render = () => items.forEach((el, i) => layout(el, wrap(i - pos), i));
    const notify = () => { const i = idx(); if (i !== last) { last = i; onChange && onChange(i); } };
    const tick = () => {
      pos += (target - pos) * 0.15;
      if (Math.abs(target - pos) < 0.002) pos = target;
      render();
      raf = pos !== target ? requestAnimationFrame(tick) : 0;
    };
    api.go = t => { target = loop ? t : clamp(t, 0, count - 1); if (!raf) raf = requestAnimationFrame(tick); notify(); };
    api.next = () => api.go(Math.round(target) + 1);
    api.prev = () => api.go(Math.round(target) - 1);
    api.goIndex = i => {
      if (!loop) return api.go(i);
      let d = ((i - idx()) % count + count) % count;
      if (d > count / 2) d -= count;
      api.go(Math.round(target) + d);
    };
    api.index = idx;
    api.render = render;
    track.addEventListener('pointerdown', e => { if (e.button) return; drag = { x: e.clientX, t: target }; api.dragged = false; });
    addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 6) api.dragged = true;
      if (!api.dragged) return;
      target = drag.t - dx / step();
      if (!loop) target = clamp(target, -0.4, count - 0.6);
      pos = target; render(); notify();
      api.onDrag && api.onDrag();
    });
    addEventListener('pointerup', () => { if (!drag) return; drag = null; if (api.dragged) api.go(Math.round(target)); });
    track.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      wheelAcc += e.deltaX;
      if (Math.abs(wheelAcc) > 70) { wheelAcc > 0 ? api.next() : api.prev(); wheelAcc = 0; }
    }, { passive: false });
    track.querySelectorAll('svg').forEach(s => s.setAttribute('draggable', 'false'));
    addEventListener('resize', render);
    render(); notify();
    return api;
  }

  // ---------- nav + ticker + reveal ----------
  $('#heroArt').innerHTML = Art.showroom();
  const tick = DATA.ticker.map(([k, v]) => `<span><b>${k}</b>${v}<em>◆</em></span>`).join('');
  $('#ticker').innerHTML = tick + tick;

  const navMap = { home: 'home', archive: 'home', look: 'look', silk: 'silk', rack: 'rack', muse: 'muse', reels: 'muse', bridal: 'bridal', weave: 'weave' };
  const navIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const id = navMap[e.target.id];
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main > section, main > footer').forEach(s => navIO.observe(s));
  addEventListener('scroll', () => $('#nav').classList.toggle('solid', scrollY > innerHeight * 0.8), { passive: true });

  const revealIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } }), { threshold: 0.15 });
  document.querySelectorAll('.sec-head, .arches, .filters, .film-frame, .bridal-info').forEach(el => { el.classList.add('reveal'); revealIO.observe(el); });

  // ---------- six moods (gopuram arches) ----------
  const ARCH = 'M10 338 V150 H22 V122 Q22 82 62 64 Q92 50 100 32 Q108 50 138 64 Q178 82 178 122 V150 H190 V338 Z';
  $('#arches').innerHTML = DATA.moods.map((m, i) => {
    const cid = 'archclip' + i;
    const sc = Art.scene(200, 310, { decor: m.decor, bg: m.bg, fig: m.fig, seed: i + 3, figH: 340, figBottom: 1.07 }).replace('<svg ', '<svg x="0" y="30" width="200" height="310" ');
    return `<a class="arch" href="#look"><div class="arch-frame"><svg viewBox="0 0 200 340">
      <defs><clipPath id="${cid}"><path d="${ARCH}"/></clipPath></defs>
      <g clip-path="url(#${cid})"><g class="scene-img">${sc}</g></g>
      <path d="${ARCH}" fill="none" stroke="#c9973f" stroke-width="3"/>
      <path d="${ARCH}" fill="none" stroke="#f3d48a" stroke-width="1" transform="translate(100 190) scale(.93) translate(-100 -190)" opacity=".85"/>
      <g fill="#c9973f"><rect x="99" y="2" width="2" height="9"/><ellipse cx="100" cy="17" rx="5.5" ry="6"/><rect x="93" y="22" width="14" height="3" rx="1"/><rect x="96" y="25" width="8" height="6"/></g>
    </svg></div><p>${m.name}</p></a>`;
  }).join('');

  // ---------- try the look ----------
  const lookTrack = $('#lookTrack');
  lookTrack.innerHTML = DATA.looks.map(l => `<div class="look-card" role="button" aria-label="${l.name}">${Art.figure(l.fig)}</div>`).join('');
  const added = new Set();
  function renderLook(i) {
    const L = DATA.looks[i];
    $('#lookCounter').textContent = `${i + 1} of ${DATA.looks.length} · ${L.name}`;
    $('#lookBar').style.left = (i / DATA.looks.length * 100) + '%';
    $('#pieces').innerHTML = L.pieces.map(([type, name, price, color], k) => {
      const key = `${L.name}:${k}`;
      return `<li class="piece">
        <div class="piece-thumb"><b>${k + 1}</b>${Art.icon(type, { color, pattern: L.fig.pattern, border: L.fig.border })}</div>
        <div><small>NOOLAM · ${type}</small><h4>${name}</h4><p class="price">${inr(price)}</p></div>
        <button class="tiny-heart ${state.wish.has(key) ? 'on' : ''}" data-key="${key}" data-name="${name}" aria-label="Save ${name}">${HEART}</button>
        <button class="tiny-plus ${added.has(key) ? 'added' : ''}" data-key="${key}" data-name="${name}" data-color="${color}" aria-label="Add ${name} to bag">${PLUS}</button></li>`;
    }).join('');
    const total = L.pieces.reduce((s, p) => s + p[2], 0);
    $('#bundleWas').textContent = inr(total);
    $('#bundleNow').textContent = inr(Math.round(total * 0.9 / 100) * 100);
    $('#bundleNote').textContent = `Bundle all ${L.pieces.length} pieces · save 10%`;
    $('#wishLook').classList.toggle('on', state.wish.has('look:' + L.name));
  }
  const look = carousel(lookTrack, {
    count: DATA.looks.length, start: 6, step: () => (mobile() ? 170 : 250),
    layout(el, off) {
      const a = Math.abs(off), x = off * (mobile() ? 170 : 250);
      const s = 1 - Math.min(a, 3) * 0.09;
      el.style.transform = `translateX(${x}px) scale(${s})`;
      el.style.filter = a < 0.05 ? 'none' : `blur(${Math.min(a, 3) * 2.4}px)`;
      el.style.opacity = a > 3.4 ? 0 : 1 - a * 0.15;
      el.style.zIndex = 100 - Math.round(a * 10);
    },
    onChange: renderLook,
  });
  lookTrack.querySelectorAll('.look-card').forEach((el, i) => el.addEventListener('click', () => { if (!look.dragged) look.go(i); }));
  $('#lookPrev').onclick = look.prev; $('#lookNext').onclick = look.next;
  $('#pieces').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.classList.contains('tiny-heart')) return toggleWish(b.dataset.key, b, b.dataset.name);
    if (!added.has(b.dataset.key)) { added.add(b.dataset.key); b.classList.add('added'); addToBag(b.dataset.name, 1, b, b.dataset.color); }
  });
  $('#addLook').onclick = e => { const L = DATA.looks[look.index()]; addToBag(`the full ${L.name} look`, L.pieces.length, e.currentTarget, L.fig.body); };
  $('#wishLook').onclick = e => { const L = DATA.looks[look.index()]; toggleWish('look:' + L.name, e.currentTarget, `the ${L.name} look`); };

  // ---------- pick a silk ----------
  const silkTrack = $('#silkTrack');
  silkTrack.innerHTML = DATA.silks.map((s, i) => `<div class="silk-card"><div class="silk-inner" style="background:linear-gradient(160deg, ${Art.shade(s.bg, 0.08)}, ${Art.shade(s.bg, -0.12)})">
      <div class="silk-title" style="color:${s.ink}">${s.name}</div>
      <div class="silk-fig">${Art.figure(s.fig)}</div>
      <div class="silk-shine"></div>
      <span class="silk-price" style="color:${s.ink}">${inr(s.price)}</span>
      <button class="silk-heart" data-i="${i}" aria-label="Save ${s.name}">${HEART}</button>
      <button class="silk-plus" data-i="${i}" aria-label="Add ${s.name} to bag">${PLUS}</button>
    </div></div>`).join('');
  const silk = carousel(silkTrack, {
    count: DATA.silks.length, loop: true, start: 3, step: () => (mobile() ? 230 : 320),
    layout(el, off) {
      const a = Math.abs(off), x = off * (mobile() ? 230 : 320);
      el.style.transform = `translateX(${x}px) translateY(${off * off * 16}px) rotate(${off * 5}deg)`;
      el.style.zIndex = 100 - Math.round(a * 10);
      el.style.visibility = a > 4.2 ? 'hidden' : 'visible';
    },
  });
  silkTrack.querySelectorAll('.silk-card').forEach((card, i) => {
    const inner = card.firstElementChild;
    card.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = inner.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      inner.style.transform = `rotateY(${(px - 0.5) * 16}deg) rotateX(${(0.5 - py) * 14}deg)`;
      inner.style.setProperty('--mx', px * 100 + '%'); inner.style.setProperty('--my', py * 100 + '%');
    });
    card.addEventListener('pointerleave', () => { inner.style.transform = ''; inner.classList.remove('pressed'); });
    card.addEventListener('pointerdown', () => inner.classList.add('pressed'));
    card.addEventListener('pointerup', () => inner.classList.remove('pressed'));
    card.addEventListener('click', e => {
      if (silk.dragged) return;
      const s = DATA.silks[i];
      if (e.target.closest('.silk-plus')) return addToBag(s.name, 1, e.target.closest('button'), s.bg);
      if (e.target.closest('.silk-heart')) return toggleWish('silk:' + s.name, e.target.closest('button'), s.name);
      silk.goIndex(i);
    });
  });

  // ---------- the rack ----------
  const rail = $('#rail'), railWrap = $('#railWrap');
  const garment = (p, back) => (['saree', 'half'].includes(p.cat) ? Art.sareeOnHanger({ ...p.art, back }) : Art.blouseOnHanger({ ...p.art, sleeve: p.cat === 'full' ? 'full' : 'half', back }));
  DATA.rack.forEach((p, i) => {
    const h = document.createElement('div');
    h.className = 'hanger'; h.dataset.i = i; h.innerHTML = garment(p, false);
    h.setAttribute('role', 'button'); h.setAttribute('tabindex', '0'); h.setAttribute('aria-label', `${p.name}, ${inr(p.price)}`);
    rail.appendChild(h);
  });
  const hangers = [...rail.querySelectorAll('.hanger')];
  const inFilter = (p, f) => f === 'all' || p.cat === f || p.tags.includes(f);
  let filter = 'saree', visible = [], hovered = -1;
  $('#filters').innerHTML = DATA.filters.map(([k, label]) => `<button class="filter ${k === filter ? 'on' : ''}" data-f="${k}" role="tab">${label}<span>${DATA.rack.filter(p => inFilter(p, k)).length}</span></button>`).join('');
  function layoutRail() {
    const w = rail.clientWidth, n = visible.length;
    const sp = Math.min(mobile() ? 70 : 125, (w - (mobile() ? 120 : 220)) / Math.max(n - 1, 1));
    const x0 = w / 2 - sp * (n - 1) / 2;
    hangers.forEach(h => {
      const i = +h.dataset.i, v = visible.indexOf(i);
      if (v < 0) {
        h.classList.add('out');
        h.style.transform = `translateX(${h._x ?? w / 2}px) translateY(-70px) scale(.75)`;
        return;
      }
      h.classList.remove('out');
      let x = x0 + v * sp, y = 0, s = 1;
      if (hovered >= 0) {
        const d = v - hovered;
        if (d === 0) { y = 10; s = 1.18; } else x += Math.sign(d) * Math.max(0, 46 - (Math.abs(d) - 1) * 14);
      }
      h._x = x;
      h.style.transform = `translateX(${x}px) translateY(${y}px) scale(${s})`;
      h.style.zIndex = d0(v);
    });
    function d0(v) { return hovered === v ? 60 : 30 - Math.abs(v - (hovered >= 0 ? hovered : n / 2)) | 0; }
  }
  function setFilter(f) {
    filter = f; hovered = -1;
    visible = DATA.rack.map((p, i) => (inFilter(p, f) ? i : -1)).filter(i => i >= 0);
    document.querySelectorAll('.filter').forEach(b => b.classList.toggle('on', b.dataset.f === f));
    $('#rackCount').textContent = `Explore the collection · ${visible.length} pieces`;
    $('#railCaption').innerHTML = '&nbsp;';
    layoutRail();
  }
  $('#filters').addEventListener('click', e => { const b = e.target.closest('.filter'); if (b) setFilter(b.dataset.f); });
  hangers.forEach(h => {
    h.addEventListener('pointerenter', () => {
      const v = visible.indexOf(+h.dataset.i); if (v < 0) return;
      hovered = v; layoutRail();
      const p = DATA.rack[+h.dataset.i];
      $('#railCaption').textContent = `${p.name}  ·  ${inr(p.price)}.00`;
    });
    h.addEventListener('click', () => openDetail(visible.indexOf(+h.dataset.i)));
    h.addEventListener('keydown', e => { if (e.key === 'Enter') openDetail(visible.indexOf(+h.dataset.i)); });
  });
  rail.addEventListener('pointerleave', () => { hovered = -1; layoutRail(); });
  addEventListener('resize', layoutRail);
  setFilter('saree');

  // rack detail
  let dIndex = 0, dSide = 'front', dSize = null;
  function renderDetail(anim = 'lift') {
    const p = DATA.rack[visible[dIndex]];
    const art = $('#detailArt');
    art.innerHTML = garment(p, dSide === 'back');
    art.classList.remove('flip'); art.style.animation = 'none'; void art.offsetWidth; art.style.animation = '';
    if (anim === 'flip') art.classList.add('flip');
    $('#detailName').textContent = p.name;
    $('#detailPrice').textContent = inr(p.price) + '.00';
    document.querySelectorAll('#detailSide button').forEach(b => b.classList.toggle('on', b.dataset.side === dSide));
    $('#detailSizes').innerHTML = [34, 36, 38, 40, 42].map(s => `<button class="${s === dSize ? 'on' : ''}" data-s="${s}">${s}</button>`).join('');
    const add = $('#detailAdd');
    add.disabled = !dSize; add.textContent = dSize ? `Add to bag · ${dSize}` : 'Select a size';
    $('#detailWish').classList.toggle('on', state.wish.has('rack:' + p.name));
  }
  function openDetail(v) {
    if (v < 0) return;
    dIndex = v; dSide = 'front'; dSize = null;
    railWrap.classList.add('detail'); $('#rackDetail').hidden = false;
    renderDetail();
  }
  function closeDetail() { railWrap.classList.remove('detail'); $('#rackDetail').hidden = true; }
  $('#detailClose').onclick = closeDetail;
  $('#detailPrev').onclick = () => { dIndex = (dIndex - 1 + visible.length) % visible.length; dSide = 'front'; dSize = null; renderDetail(); };
  $('#detailNext').onclick = () => { dIndex = (dIndex + 1) % visible.length; dSide = 'front'; dSize = null; renderDetail(); };
  $('#detailSide').addEventListener('click', e => { const b = e.target.closest('button'); if (b && b.dataset.side !== dSide) { dSide = b.dataset.side; renderDetail('flip'); } });
  $('#detailSizes').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { dSize = +b.dataset.s; renderDetail('none'); } });
  $('#detailAdd').onclick = e => { const p = DATA.rack[visible[dIndex]]; addToBag(`${p.name} (size ${dSize})`, 1, e.currentTarget, p.art.body); };
  $('#detailWish').onclick = e => { const p = DATA.rack[visible[dIndex]]; toggleWish('rack:' + p.name, e.currentTarget, p.name); };

  // ---------- muse film: flowing silk on canvas + tanpura drone ----------
  const tiles = (list, offset) => list.map((f, i) => {
    const h = i % 2 ? 330 : 270;
    return `<div class="film-tile" style="height:${h}px">${Art.scene(250, h, { ...f, seed: i + offset, figH: h * 1.15, figBottom: 1.12 })}</div>`;
  }).join('');
  const left = DATA.film.slice(0, 4), right = DATA.film.slice(4);
  $('#stripL').innerHTML = tiles(left, 1) + tiles(left, 1);
  $('#stripR').innerHTML = tiles(right, 5) + tiles(right, 5);

  const Drone = (() => {
    let ctx, master, strings = [], timer, k = 0;
    const NOTES = [196, 261.63, 261.63, 130.81]; // Pa, Sa, Sa, low Sa
    return {
      on: false,
      start() {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        ctx.resume();
        if (master) return;
        master = ctx.createGain(); master.gain.value = 0;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
        lp.connect(master); master.connect(ctx.destination);
        strings = NOTES.map(f => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 6;
          g.gain.value = 0.015; o.connect(g); g.connect(lp); o.start();
          return { o, g };
        });
        master.gain.linearRampToValueAtTime(0.32, ctx.currentTime + 1.2);
        timer = setInterval(() => {
          const s = strings[k++ % strings.length], t = ctx.currentTime;
          s.g.gain.cancelScheduledValues(t);
          s.g.gain.setTargetAtTime(0.09, t, 0.01);
          s.g.gain.setTargetAtTime(0.015, t + 0.06, 0.9);
        }, 650);
        this.on = true;
      },
      stop() {
        if (!master) return;
        const m = master, ss = strings;
        clearInterval(timer);
        m.gain.cancelScheduledValues(ctx.currentTime);
        m.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
        setTimeout(() => { ss.forEach(s => s.o.stop()); m.disconnect(); }, 900);
        master = null; this.on = false;
      },
    };
  })();

  const soundBtn = $('#soundBtn');
  function setSound(on) {
    on ? Drone.start() : Drone.stop();
    soundBtn.setAttribute('aria-pressed', on); soundBtn.querySelector('b').textContent = on ? 'Sound on' : 'Sound off';
  }
  soundBtn.onclick = () => setSound(!Drone.on);

  (function silkFilm() {
    const cv = $('#filmCanvas'), ctx = cv.getContext('2d');
    let W = 0, H = 0, visibleNow = false, t0 = performance.now();
    const layers = [
      { y: 0.26, amp: 0.07, k: 2.2, s: 0.35, col: [168, 24, 44], zari: [214, 164, 76] },
      { y: 0.5, amp: 0.08, k: 1.7, s: -0.28, col: [208, 150, 62], zari: [122, 18, 38] },
      { y: 0.74, amp: 0.06, k: 2.6, s: 0.42, col: [110, 14, 34], zari: [226, 184, 102] },
    ];
    function size() { const d = Math.min(devicePixelRatio || 1, 2); W = cv.width = cv.clientWidth * d; H = cv.height = cv.clientHeight * d; }
    function edge(L, x, t) {
      const u = x / W;
      return H * (L.y + L.amp * Math.sin(u * Math.PI * L.k + t * L.s * 2.2) + 0.025 * Math.sin(u * 13 - t * 1.3 + L.k));
    }
    function draw(now) {
      if (!visibleNow) return;
      const t = (now - t0) / 1000;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#2c0a10'); bg.addColorStop(1, '#4a0e17');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(W * 0.7, H * 0.2, 0, W * 0.7, H * 0.2, W * 0.5);
      glow.addColorStop(0, 'rgba(255,214,140,.28)'); glow.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      const step = Math.max(3, W / 360 | 0);
      layers.forEach(L => {
        for (let x = 0; x < W; x += step) {
          const y = edge(L, x, t), slope = (edge(L, x + step, t) - y) / step;
          const lit = clamp(0.55 - slope * 3.2, 0.15, 1.25);
          const c = L.col.map(v => clamp(v * lit + (lit > 1 ? (lit - 1) * 180 : 0), 0, 255) | 0);
          ctx.fillStyle = `rgb(${c})`; ctx.fillRect(x, y, step + 1, H - y);
          const z = L.zari.map(v => clamp(v * (lit + 0.25), 0, 255) | 0);
          ctx.fillStyle = `rgb(${z})`; ctx.fillRect(x, y, step + 1, H * 0.03);
          if (((x / step) | 0) % 14 === 0) { ctx.beginPath(); ctx.arc(x, y + H * 0.075, H * 0.008, 0, 7); ctx.fill(); }
        }
        ctx.fillStyle = 'rgba(0,0,0,.18)';
        for (let x = 0; x < W; x += step) { const y = edge(L, x, t); ctx.fillRect(x, y - H * 0.012, step + 1, H * 0.012); }
      });
      requestAnimationFrame(draw);
    }
    new IntersectionObserver(([e]) => {
      const was = visibleNow; visibleNow = e.isIntersecting;
      if (visibleNow && !was) { size(); requestAnimationFrame(draw); }
      if (!visibleNow && Drone.on && $('#reelFull').hidden) setSound(false);
    }).observe(cv);
    addEventListener('resize', size);
  })();

  // ---------- muse reels ----------
  const reelTrack = $('#reelTrack');
  const REEL_N = DATA.reels.length * 3;
  const reelData = i => DATA.reels[i % DATA.reels.length];
  reelTrack.innerHTML = Array.from({ length: REEL_N }, (_, i) => {
    const r = reelData(i);
    return `<div class="reel"><div class="reel-art">${Art.scene(240, 420, { decor: r.decor, bg: r.bg, fig: r.fig, seed: i, figH: 400, figBottom: 1.02 })}</div>
      <div class="reel-top"><span class="no">REEL ${r.no}</span><span>0:${String(r.dur).padStart(2, '0')}</span></div>
      <button class="reel-play" aria-label="Play ${r.title}"><svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></button>
      <div class="reel-copy"><small>${r.fabric}</small><h3>${r.title}</h3><p>${r.place}</p><div class="reel-bar"><i></i></div></div></div>`;
  }).join('');
  let reelPlaying = true, reelT = 0, reelVisible = false, reelLast = performance.now();
  const reels = carousel(reelTrack, {
    count: REEL_N, loop: true, start: 3, step: () => (mobile() ? 180 : 240),
    layout(el, off) {
      const a = off * (mobile() ? 20 : 15) * Math.PI / 180, R = mobile() ? 560 : 1000;
      const x = Math.sin(a) * R, z = (Math.cos(a) - 1) * R;
      el.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${a}rad)`;
      el.style.zIndex = 100 - Math.round(Math.abs(off) * 10);
      el.style.visibility = Math.abs(off) > 6.5 ? 'hidden' : 'visible';
      el.classList.toggle('center', Math.abs(off) < 0.5);
    },
    onChange() { reelT = 0; },
  });
  const reelEls = [...reelTrack.children];
  const reelDur = i => Math.min(reelData(i).dur, 8);
  function reelLoop(now) {
    const dt = (now - reelLast) / 1000; reelLast = now;
    const i = reels.index();
    if (reelPlaying && reelVisible && $('#reelFull').hidden) {
      reelT += dt;
      if (reelT >= reelDur(i)) { reelT = 0; reels.next(); }
    }
    const bar = reelEls[i].querySelector('.reel-bar i');
    if (bar) bar.style.width = (reelT / reelDur(i) * 100) + '%';
    requestAnimationFrame(reelLoop);
  }
  requestAnimationFrame(reelLoop);
  new IntersectionObserver(([e]) => { reelVisible = e.isIntersecting; }).observe(reelTrack);
  $('#reelPrev').onclick = reels.prev; $('#reelNext').onclick = reels.next;
  $('#reelPause').onclick = () => {
    reelPlaying = !reelPlaying;
    $('#pauseIco').innerHTML = reelPlaying ? '<path d="M9 6v12M15 6v12"/>' : '<path d="M8 5l11 7-11 7z" fill="currentColor"/>';
    $('#reelPause').setAttribute('aria-label', reelPlaying ? 'Pause reels' : 'Play reels');
  };
  reelEls.forEach((el, i) => el.addEventListener('click', () => {
    if (reels.dragged) return;
    if (i === reels.index()) openReel(reelData(i)); else reels.goIndex(i);
  }));

  // fullscreen reel
  let rfRaf = 0, petalTimer = 0;
  function openReel(r) {
    const full = $('#reelFull');
    $('#reelFullArt').innerHTML = Art.scene(540, 960, { decor: r.decor, bg: r.bg, fig: r.fig, seed: 99, figH: 900, figBottom: 1.02 });
    $('#rfFabric').textContent = r.fabric; $('#rfTitle').textContent = r.title; $('#rfPlace').textContent = r.place;
    full.hidden = false; document.body.style.overflow = 'hidden';
    setSound(true);
    const start = performance.now();
    const step = now => {
      const p = (now - start) / (r.dur * 1000);
      $('#rfBar').style.width = Math.min(p, 1) * 100 + '%';
      if (p >= 1) return closeReel();
      rfRaf = requestAnimationFrame(step);
    };
    rfRaf = requestAnimationFrame(step);
    petalTimer = setInterval(() => {
      const p = document.createElement('i');
      p.className = 'petal';
      p.style.left = Math.random() * 100 + 'vw';
      p.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
      p.style.animationDuration = 5 + Math.random() * 4 + 's';
      p.style.background = Math.random() > 0.5 ? '#f2a516' : '#e8641b';
      full.appendChild(p);
      setTimeout(() => p.remove(), 9500);
    }, 260);
  }
  function closeReel() {
    cancelAnimationFrame(rfRaf); clearInterval(petalTimer);
    const full = $('#reelFull');
    full.hidden = true; full.querySelectorAll('.petal').forEach(p => p.remove());
    document.body.style.overflow = '';
    setSound(false);
  }
  $('#rfClose').onclick = closeReel;

  // ---------- bridal ----------
  const brTrack = $('#bridalTrack');
  brTrack.innerHTML = DATA.bridal.map((b, i) => `<div class="bcard">${Art.scene(340, 470, { decor: b.decor, bg: b.bg, fig: b.fig, seed: i + 20, figH: 470, figBottom: 1.04 })}${b.off ? `<span class="off">−${b.off}%</span>` : ''}</div>`).join('');
  const priceOf = b => Math.round(b.price * (1 - b.off / 100) / 100) * 100;
  function renderBridal(i) {
    const b = DATA.bridal[i];
    const info = $('.bridal-info');
    $('#brName').textContent = b.name;
    $('#brMeta').textContent = `${b.fabric} · ${b.pallu}`;
    $('#brPrice').innerHTML = b.off ? `${inr(priceOf(b))} <s style="color:#b8aea4;font-size:16px;font-weight:400;margin-left:6px">${inr(b.price)}</s>` : inr(b.price);
    $('#brWish').classList.toggle('on', state.wish.has('bridal:' + b.name));
    [...info.children].slice(0, 3).forEach(el => { el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap'); });
  }
  const bridal = carousel(brTrack, {
    count: DATA.bridal.length, loop: true, start: 3, step: () => (mobile() ? 180 : 270),
    layout(el, off) {
      const a = Math.abs(off), x = off * (mobile() ? 180 : 268);
      el.style.transform = `translateX(${x}px) translateY(${a * 22 + a * a * 4}px) rotate(${off * 9}deg) scale(${1 - Math.min(a, 4) * 0.06})`;
      el.style.opacity = clamp(1 - Math.max(0, a - 1) * 0.28, 0, 1);
      el.style.filter = a < 0.5 ? 'none' : `saturate(${1 - Math.min(a, 3) * 0.15})`;
      el.style.zIndex = 100 - Math.round(a * 10);
      el.style.visibility = a > 3.6 ? 'hidden' : 'visible';
      el.classList.toggle('center', a < 0.5);
    },
    onChange: renderBridal,
  });
  [...brTrack.children].forEach((el, i) => el.addEventListener('click', () => { if (!bridal.dragged) bridal.goIndex(i); }));
  $('#brPrev').onclick = bridal.prev; $('#brNext').onclick = bridal.next;
  $('#brAdd').onclick = e => { const b = DATA.bridal[bridal.index()]; addToBag(b.name, 1, e.currentTarget, b.fig.body); };
  $('#brWish').onclick = e => { const b = DATA.bridal[bridal.index()]; toggleWish('bridal:' + b.name, e.currentTarget, b.name); };

  // ---------- header buttons + keyboard ----------
  $('#bagBtn').onclick = () => toast(state.bag ? `Your bag holds <b>${state.bag}</b> piece${state.bag > 1 ? 's' : ''} — checkout is not part of this demo` : 'Your bag is empty — tap <b>+</b> on any silk');
  $('#wishBtn').onclick = () => toast(state.wish.size ? `<b>${state.wish.size}</b> saved to your wishlist` : 'Tap a heart to save a silk');
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!$('#reelFull').hidden) closeReel(); else if (!$('#rackDetail').hidden) closeDetail(); }
    if (!$('#rackDetail').hidden && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) $(e.key === 'ArrowLeft' ? '#detailPrev' : '#detailNext').click();
  });
})();
