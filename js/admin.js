// NOOLAM admin: replace any drawn illustration on the site with a real photo or video.
// Talks to admin-server.js; slot keys here must match the ones main.js reads.
(async () => {
  const $ = s => document.querySelector(s);
  const H = { 'X-Noolam-Admin': '1' };
  const isVideo = u => /\.(mp4|webm|mov)$/i.test(u);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const garment = (p, back) => (['saree', 'half'].includes(p.cat)
    ? Art.sareeOnHanger({ ...p.art, back })
    : Art.blouseOnHanger({ ...p.art, sleeve: p.cat === 'full' ? 'full' : 'half', back }));
  const CUTOUT = 'Full-length cut-out on a <b>transparent</b> PNG or WebP works best';

  const GROUPS = [
    { id: 'hero', title: 'Hero', note: 'Full-screen background behind “Woven for the Divine.”', ratio: '16/9', max: 2600, wide: true,
      slots: [{ key: 'hero', label: 'Showroom background', hint: 'Landscape photo, 2400 × 1350 or larger', art: () => Art.showroom() }] },
    { id: 'moods', title: 'Six Moods', note: 'Cropped inside the gold temple arches.', ratio: '200/310',
      slots: DATA.moods.map((m, i) => ({ key: `mood-${i}`, label: m.name, hint: 'Portrait photo, about 900 × 1400', art: () => Art.scene(200, 310, { decor: m.decor, bg: m.bg, fig: m.fig, seed: i + 3, figH: 340, figBottom: 1.07 }) })) },
    { id: 'looks', title: 'Try the Look · models', note: CUTOUT + '. The model stands on the white stage.', ratio: '230/600', contain: true,
      slots: DATA.looks.map((l, i) => ({ key: `look-${i}`, label: l.name, hint: 'Full-length model, about 900 × 2300', art: () => Art.figure(l.fig) })) },
    { id: 'pieces', title: 'Try the Look · pieces', note: 'Thumbnails in the “In this look” panel.', ratio: '1/1', max: 800,
      subs: DATA.looks.map((l, i) => ({ title: l.name, slots: l.pieces.map(([type, name, , color], k) => ({ key: `piece-${i}-${k}`, label: name, hint: `Square ${type} photo`, art: () => Art.icon(type, { color, pattern: l.fig.pattern, border: l.fig.border }) })) })) },
    { id: 'silks', title: 'Pick a Silk', note: CUTOUT + '. The model stands in front of the big title.', ratio: '150/390', contain: true,
      slots: DATA.silks.map((s, i) => ({ key: `silk-${i}`, label: s.name, hint: 'Full-length model, about 600 × 1560', art: () => Art.figure(s.fig) })) },
    { id: 'rack', title: 'The Rack', note: 'Garment on a hanger, on a <b>transparent</b> background. The back view is optional; the front is used if it is empty.', ratio: '200/420', contain: true,
      subs: DATA.rack.map((p, i) => ({ title: p.name, slots: [
        { key: `rack-${i}`, label: 'Front', hint: 'Hanger shot, about 800 × 1680', art: () => garment(p, false) },
        { key: `rack-${i}-back`, label: 'Back', hint: 'Optional', art: () => garment(p, true) },
      ] })) },
    { id: 'film', title: 'The Muse Film', note: 'A brand film for the gold frame, and lifestyle photos for the scrolling side columns.', ratio: '250/300',
      slots: [
        { key: 'film-video', label: 'Brand film', hint: '16:9 video (MP4), shown muted until “Sound on”', accept: 'video', ratio: '16/9', wide: true, art: () => '<svg viewBox="0 0 16 9"><rect width="16" height="9" fill="#4a0e17"/><path d="M0 4 Q4 2.6 8 4 T16 4 V9 H0Z" fill="#a8182c"/><path d="M0 6 Q4 4.8 8 6 T16 6 V9 H0Z" fill="#d0963e"/></svg>' },
        ...DATA.film.map((f, i) => ({ key: `film-${i}`, label: `Side photo ${i + 1} (${i < 4 ? 'left' : 'right'})`, hint: 'Portrait photo', art: () => Art.scene(250, 300, { ...f, seed: i + 1, figH: 345, figBottom: 1.12 }) })),
      ] },
    { id: 'reels', title: 'The Muse Reels', note: 'Vertical reels. Upload a <b>video</b> to play it in the arc and full screen, or a photo for a still.', ratio: '9/16', accept: 'both',
      slots: DATA.reels.map((r, i) => ({ key: `reel-${i}`, label: `${r.no} · ${r.title}`, hint: '9:16 video (MP4) or photo', art: () => Art.scene(240, 420, { decor: r.decor, bg: r.bg, fig: r.fig, seed: i, figH: 400, figBottom: 1.02 }) })) },
    { id: 'bridal', title: 'The Bridal Collection', note: 'Cropped into the tall arch-topped cards.', ratio: '340/470',
      slots: DATA.bridal.map((b, i) => ({ key: `bridal-${i}`, label: b.name, hint: 'Portrait photo, about 1000 × 1400', art: () => Art.scene(340, 470, { decor: b.decor, bg: b.bg, fig: b.fig, seed: i + 20, figH: 470, figBottom: 1.04 }) })) },
  ];
  const SLOTS = {};
  GROUPS.forEach(g => (g.subs ? g.subs.flatMap(s => s.slots) : g.slots).forEach(s => { SLOTS[s.key] = { ...s, group: g }; }));

  // ---------- server ----------
  let manifest = {}, online = true;
  try {
    const r = await fetch('api/media', { headers: H, cache: 'no-store' });
    if (!r.ok) throw new Error();
    manifest = await r.json();
  } catch {
    online = false;
    $('#offline').hidden = false;
    $('#status').textContent = 'Read-only: admin server not running';
  }

  let toastTimer;
  function toast(msg, err) {
    const t = $('#toast');
    t.textContent = msg; t.classList.toggle('err', !!err); t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), err ? 6000 : 2600);
  }
  async function refreshStatus() {
    if (!online) return;
    const r = await fetch('api/status', { headers: H, cache: 'no-store' }).then(x => x.json()).catch(() => null);
    if (!r) return;
    $('#status').innerHTML = r.changes
      ? `<b>${r.changes}</b> unpublished change${r.changes > 1 ? 's' : ''} · branch ${esc(r.branch)}`
      : `Everything is published · branch ${esc(r.branch)}`;
    $('#publish').disabled = !r.changes;
  }

  // ---------- render ----------
  const previewHTML = s => {
    const url = manifest[s.key];
    if (!url) return `${s.art()}<span class="tag">Drawing</span>`;
    const src = esc(url) + '?v=' + encodeURIComponent(url);
    return (isVideo(url) ? `<video src="${src}" muted loop playsinline autoplay></video>` : `<img src="${src}" alt="">`) + '<span class="tag photo">Photo</span>';
  };
  const acceptOf = s => ({ video: 'video/mp4,video/webm,video/quicktime', both: 'image/*,video/mp4,video/webm,video/quicktime' }[s.accept || s.group.accept] || 'image/*');
  const card = s => {
    const g = s.group;
    return `<article class="slot" data-key="${s.key}">
      <div class="preview ${g.contain ? 'contain' : ''}" style="aspect-ratio:${s.ratio || g.ratio}">${previewHTML(s)}<div class="drop">Drop to replace</div></div>
      <div class="body"><h3>${esc(s.label)}</h3><p>${s.hint}</p>
        <div class="actions">
          <label class="up ${online ? '' : 'disabled'}">${manifest[s.key] ? 'Replace' : 'Upload'}<input type="file" accept="${acceptOf(s)}" ${online ? '' : 'disabled'}></label>
          <button class="reset" ${manifest[s.key] && online ? '' : 'hidden'}>Use drawing</button>
        </div></div></article>`;
  };
  const counts = g => {
    const keys = (g.subs ? g.subs.flatMap(s => s.slots) : g.slots).map(s => s.key);
    return `${keys.filter(k => manifest[k]).length} of ${keys.length} replaced`;
  };
  function renderNav() {
    $('#groupNav').innerHTML = GROUPS.map(g => `<a href="#g-${g.id}">${g.title}<span>${counts(g).split(' replaced')[0]}</span></a>`).join('');
  }
  $('#groups').innerHTML = GROUPS.map(g => `<section class="group" id="g-${g.id}">
      <div class="group-head"><h2>${g.title}</h2><span class="count" data-count="${g.id}">${counts(g)}</span></div>
      <p class="group-note">${g.note}</p>
      ${g.subs
        ? g.subs.map(sub => `<h3 class="sub-head">${esc(sub.title)}</h3><div class="grid">${sub.slots.map(s => card(SLOTS[s.key])).join('')}</div>`).join('')
        : g.slots.some(s => s.wide) || g.wide
          ? `<div class="grid wide">${g.slots.filter(s => s.wide || g.wide).map(s => card(SLOTS[s.key])).join('')}</div>${g.slots.some(s => !s.wide && !g.wide) ? `<div class="grid" style="margin-top:16px">${g.slots.filter(s => !s.wide && !g.wide).map(s => card(SLOTS[s.key])).join('')}</div>` : ''}`
          : `<div class="grid">${g.slots.map(s => card(SLOTS[s.key])).join('')}</div>`}
    </section>`).join('');
  renderNav();
  refreshStatus();

  function rerender(key) {
    const el = document.querySelector(`.slot[data-key="${key}"]`);
    const s = SLOTS[key];
    el.outerHTML = card(s);
    document.querySelector(`[data-count="${s.group.id}"]`).textContent = counts(s.group);
    renderNav();
  }

  // ---------- upload ----------
  // Photos are resized and converted to WebP in the browser so the site stays fast.
  async function prepare(file, max) {
    if (file.type.startsWith('video/') || file.type === 'image/gif' || !file.type.startsWith('image/')) return file;
    const bmp = await createImageBitmap(file).catch(() => null);
    if (!bmp) return file;
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, 'image/webp', 0.86));
    return blob && blob.size < file.size * 1.2 ? blob : file;
  }
  async function upload(key, file) {
    const s = SLOTS[key], accept = s.accept || s.group.accept || 'image';
    const okType = (accept !== 'video' && file.type.startsWith('image/')) || (accept !== 'image' && file.type.startsWith('video/'));
    if (!okType) return toast(accept === 'video' ? 'This slot needs a video file (MP4 or WebM).' : accept === 'image' ? 'This slot needs an image file.' : 'Use an image or a video file.', true);
    const el = document.querySelector(`.slot[data-key="${key}"] .preview`);
    el.insertAdjacentHTML('beforeend', '<div class="busy">Uploading…</div>');
    try {
      const body = await prepare(file, s.group.max || 1800);
      const r = await fetch('api/media/' + key, { method: 'PUT', headers: { ...H, 'Content-Type': body.type || file.type }, body });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Upload failed');
      manifest[key] = j.url;
      rerender(key);
      toast(`Replaced “${s.label}”. Publish to put it on GitHub.`);
    } catch (e) {
      el.querySelector('.busy')?.remove();
      toast(e.message, true);
    }
    refreshStatus();
  }
  async function reset(key) {
    const r = await fetch('api/media/' + key, { method: 'DELETE', headers: H });
    if (!r.ok) return toast('Could not reset this image', true);
    delete manifest[key];
    rerender(key);
    toast(`“${SLOTS[key].label}” is back to the drawing.`);
    refreshStatus();
  }

  const main = $('#groups');
  main.addEventListener('change', e => {
    const input = e.target.closest('input[type=file]');
    if (input && input.files[0]) upload(input.closest('.slot').dataset.key, input.files[0]);
  });
  main.addEventListener('click', e => {
    const b = e.target.closest('.reset');
    if (b) reset(b.closest('.slot').dataset.key);
  });
  main.addEventListener('dragover', e => {
    const slot = e.target.closest('.slot');
    if (!slot || !online) return;
    e.preventDefault();
    document.querySelectorAll('.slot.over').forEach(x => x !== slot && x.classList.remove('over'));
    slot.classList.add('over');
  });
  main.addEventListener('dragleave', e => { const slot = e.target.closest('.slot'); if (slot && !slot.contains(e.relatedTarget)) slot.classList.remove('over'); });
  main.addEventListener('drop', e => {
    const slot = e.target.closest('.slot');
    if (!slot) return;
    e.preventDefault(); slot.classList.remove('over');
    const f = e.dataTransfer.files[0];
    if (f && online) upload(slot.dataset.key, f);
  });

  $('#publish').onclick = async () => {
    const b = $('#publish');
    b.disabled = true; b.textContent = 'Publishing…';
    const j = await fetch('api/publish', { method: 'POST', headers: H }).then(r => r.json()).catch(() => ({ ok: false, message: 'Server not reachable' }));
    b.textContent = 'Publish to GitHub';
    toast(j.message + (j.ok ? '' : ' — see the terminal running admin-server.js'), !j.ok);
    if (!j.ok && j.log) console.error(j.log.join('\n'));
    refreshStatus();
  };
})();
