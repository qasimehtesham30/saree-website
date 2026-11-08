// NOOLAM procedural art — stylised SVG sarees, figures, scenes and product icons.
// Stands in for the original AI-generated photography, which is not in the source repo.
const Art = (() => {
  let uid = 0;
  const nid = p => `${p}${++uid}`;
  const GOLD = '#d4a24c';

  function rng(seed) {
    let s = (seed * 9301 + 49297) >>> 0 || 1;
    return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  }

  function shade(hex, amt) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const n = parseInt(c, 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return `rgb(${r},${g},${b})`;
  }

  // ---------- fabric patterns ----------
  function fabric(pid, f) {
    const body = f.body, motif = f.motif || GOLD, acc = f.accent || shade(body, -0.3);
    const s = f.scale || 1;
    switch (f.pattern) {
      case 'check':
        return `<pattern id="${pid}" width="${28 * s}" height="${28 * s}" patternUnits="userSpaceOnUse">
          <rect width="${28 * s}" height="${28 * s}" fill="${body}"/>
          <rect width="${13 * s}" height="${28 * s}" fill="${acc}" opacity=".6"/>
          <rect width="${28 * s}" height="${13 * s}" fill="${acc}" opacity=".55"/>
          <rect x="${13 * s}" width="${1.4 * s}" height="${28 * s}" fill="${motif}" opacity=".8"/>
          <rect y="${13 * s}" width="${28 * s}" height="${1.4 * s}" fill="${motif}" opacity=".8"/></pattern>`;
      case 'stripe':
        return `<pattern id="${pid}" width="${16 * s}" height="10" patternUnits="userSpaceOnUse">
          <rect width="${16 * s}" height="10" fill="${body}"/><rect width="${5 * s}" height="10" fill="${acc}"/>
          <rect x="${8 * s}" width="${1.2 * s}" height="10" fill="${motif}"/></pattern>`;
      case 'brocade':
        return `<pattern id="${pid}" width="${14 * s}" height="${14 * s}" patternUnits="userSpaceOnUse">
          <rect width="${14 * s}" height="${14 * s}" fill="${body}"/>
          <path d="M${7 * s} ${1 * s}L${12 * s} ${7 * s}L${7 * s} ${13 * s}L${2 * s} ${7 * s}Z" fill="none" stroke="${motif}" stroke-width="${1 * s}" opacity=".85"/>
          <circle cx="${7 * s}" cy="${7 * s}" r="${1.6 * s}" fill="${motif}"/><circle cx="0" cy="0" r="${1.2 * s}" fill="${motif}"/>
          <circle cx="${14 * s}" cy="${14 * s}" r="${1.2 * s}" fill="${motif}"/></pattern>`;
      case 'plain':
        return `<pattern id="${pid}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${body}"/></pattern>`;
      default: // butta: small temple-lamp dots in half-drop
        return `<pattern id="${pid}" width="${24 * s}" height="${24 * s}" patternUnits="userSpaceOnUse">
          <rect width="${24 * s}" height="${24 * s}" fill="${body}"/>
          <g fill="${motif}"><circle cx="${12 * s}" cy="${12 * s}" r="${2.2 * s}"/><circle cx="${12 * s}" cy="${8.4 * s}" r="${1.1 * s}"/>
          <circle cx="${12 * s}" cy="${15.6 * s}" r="${1.1 * s}"/><circle cx="${8.4 * s}" cy="${12 * s}" r="${1.1 * s}"/><circle cx="${15.6 * s}" cy="${12 * s}" r="${1.1 * s}"/>
          <circle cx="0" cy="0" r="${1.4 * s}"/><circle cx="${24 * s}" cy="0" r="${1.4 * s}"/><circle cx="0" cy="${24 * s}" r="${1.4 * s}"/><circle cx="${24 * s}" cy="${24 * s}" r="${1.4 * s}"/></g></pattern>`;
    }
  }

  // Kanchipuram temple border: a row of "korvai" triangles on a zari band
  function border(bid, col, motif = GOLD, h = 24) {
    return `<pattern id="${bid}" width="12" height="${h}" patternUnits="userSpaceOnUse">
      <rect width="12" height="${h}" fill="${col}"/>
      <rect y="${h * 0.08}" width="12" height="${h * 0.12}" fill="${motif}"/>
      <path d="M0 ${h * 0.92}L6 ${h * 0.34}L12 ${h * 0.92}Z" fill="${motif}"/>
      <rect y="${h * 0.92}" width="12" height="${h * 0.08}" fill="${shade(motif, -0.25)}"/></pattern>`;
  }

  function folds(gid, dir = 'h', strength = 1) {
    const x2 = dir === 'h' ? 1 : 0, y2 = dir === 'h' ? 0 : 1;
    const a = v => (v * strength).toFixed(3);
    return `<linearGradient id="${gid}" x1="0" y1="0" x2="${x2}" y2="${y2}">
      <stop offset="0" stop-color="#000" stop-opacity="${a(.28)}"/><stop offset=".12" stop-color="#fff" stop-opacity="${a(.12)}"/>
      <stop offset=".24" stop-color="#000" stop-opacity="${a(.16)}"/><stop offset=".38" stop-color="#fff" stop-opacity="${a(.16)}"/>
      <stop offset=".52" stop-color="#000" stop-opacity="${a(.1)}"/><stop offset=".66" stop-color="#fff" stop-opacity="${a(.14)}"/>
      <stop offset=".8" stop-color="#000" stop-opacity="${a(.16)}"/><stop offset=".9" stop-color="#fff" stop-opacity="${a(.08)}"/>
      <stop offset="1" stop-color="#000" stop-opacity="${a(.3)}"/></linearGradient>`;
  }

  // ---------- standing figure in a saree (200 x 520 units) ----------
  function figureParts(o) {
    const f = Object.assign({ body: '#9b1b30', border: '#1f5e3a', blouse: null, pattern: 'butta', skin: '#c68a62', hair: '#1c1210', motif: GOLD, seed: 1, mannequin: false }, o);
    const blouse = f.blouse || f.border;
    const skin = f.mannequin ? '#f1ece4' : f.skin;
    const r = rng(f.seed);
    const tilt = ((r() - 0.5) * 8).toFixed(1);
    const P = nid('fp'), B = nid('fb'), F = nid('ff'), PB = nid('fpb'), C = nid('fc');
    const defs = fabric(P, f) + fabric(PB, { ...f, pattern: f.palluPattern || 'brocade', body: f.pallu || shade(f.body, -0.08) })
      + border(B, f.border, f.motif) + folds(F, 'h', 1.1)
      + `<clipPath id="${C}"><path d="M70 178 C64 260 52 380 42 496 L158 496 C148 380 136 260 130 178 Z"/></clipPath>`;
    const skirt = 'M70 178 C64 260 52 380 42 496 L158 496 C148 380 136 260 130 178 Z';
    const arm = `<path d="M74 102 Q60 108 58 134 L72 138 Q74 116 80 108 Z" fill="${blouse}"/>
      <path d="M59 132 Q53 172 57 216 L66 216 Q66 174 72 136 Z" fill="${skin}"/>
      <ellipse cx="61.5" cy="224" rx="5.5" ry="10" fill="${skin}"/>
      ${f.mannequin ? '' : `<g fill="${f.motif}"><rect x="55.5" y="194" width="12" height="3" rx="1.5"/><rect x="55.8" y="199" width="11.5" height="3" rx="1.5" fill="${f.body}"/><rect x="56" y="204" width="11" height="3" rx="1.5"/></g>`}`;
    const g = `
      <ellipse cx="100" cy="508" rx="62" ry="8" fill="#000" opacity=".16"/>
      ${f.mannequin ? '' : `<path d="M96 70 Q90 150 104 236 L114 236 Q104 150 108 70 Z" fill="${f.hair}"/>
      <g fill="#fffaf0"><circle cx="103" cy="92" r="2.4"/><circle cx="106" cy="100" r="2.4"/><circle cx="103" cy="108" r="2.4"/></g>`}
      <path d="M124 98 Q146 104 152 140 L162 330 Q150 338 136 330 L128 150 Z" fill="url(#${PB})"/>
      <path d="M124 98 Q146 104 152 140 L162 330" fill="none" stroke="${f.border}" stroke-width="5"/>
      <rect x="128" y="300" width="36" height="34" fill="url(#${B})" transform="rotate(-3 146 316)"/>
      <ellipse cx="88" cy="501" rx="9" ry="4.5" fill="${skin}"/><ellipse cx="113" cy="501" rx="9" ry="4.5" fill="${skin}"/>
      <path d="${skirt}" fill="url(#${P})"/>
      <g clip-path="url(#${C})">
        <rect x="40" y="170" width="120" height="330" fill="url(#${F})"/>
        <g stroke="${shade(f.body, -0.35)}" stroke-width="1.2" opacity=".55" fill="none">
          <path d="M98 250 L92 496"/><path d="M104 250 L102 496"/><path d="M110 250 L112 496"/><path d="M116 252 L122 496"/><path d="M122 254 L132 496"/></g>
        <path d="M30 466 Q100 474 170 466 L170 500 L30 500 Z" fill="url(#${B})"/>
        <path d="M86 250 L76 500 L64 500 L80 250 Z" fill="url(#${B})" opacity=".95"/>
      </g>
      <path d="M76 100 Q100 92 124 100 L130 184 L70 184 Z" fill="${skin}"/>
      <path d="M74 100 Q100 90 126 100 L129 148 Q100 156 71 148 Z" fill="${blouse}"/>
      <path d="M88 98 Q100 120 112 98 Z" fill="${skin}"/>
      <path d="M68 172 L94 206 L132 118 Q130 100 120 96 L108 100 Z" fill="url(#${PB})"/>
      <path d="M68 172 L94 206 M108 100 L68 172" stroke="${f.border}" stroke-width="4.5" fill="none"/>
      <path d="M94 206 L132 118" stroke="${f.motif}" stroke-width="3" fill="none"/>
      <g stroke="${shade(f.pallu || f.body, -0.4)}" stroke-width="1" opacity=".45"><path d="M80 178 L118 104"/><path d="M88 184 L124 108"/></g>
      ${f.mannequin ? '' : `<path d="M71 182 Q100 190 129 182 L129 190 Q100 198 71 190 Z" fill="${f.motif}"/><circle cx="100" cy="190" r="4" fill="${f.motif}" stroke="${shade(f.motif, -0.3)}"/>`}
      ${arm}
      <g transform="translate(200 0) scale(-1 1)">${arm}</g>
      <rect x="93" y="76" width="14" height="22" fill="${skin}"/>
      <g transform="rotate(${tilt} 100 80)">
        <ellipse cx="100" cy="58" rx="19" ry="23" fill="${skin}"/>
        ${f.mannequin ? '' : `<path d="M80 62 Q76 30 100 30 Q124 30 120 62 Q118 44 101 41 L100 46 L99 41 Q82 44 80 62 Z" fill="${f.hair}"/>
        <circle cx="100" cy="50" r="1.6" fill="#b3122a"/>
        <g fill="${f.motif}"><path d="M80 68 h4 l1.5 8 h-7 Z"/><path d="M116 68 h4 l1.5 8 h-7 Z"/></g>`}
      </g>
      ${f.mannequin ? '' : `<path d="M86 99 Q100 122 114 99" fill="none" stroke="${f.motif}" stroke-width="3"/><circle cx="100" cy="114" r="3.6" fill="${f.motif}"/><circle cx="100" cy="114" r="1.6" fill="#c2185b"/>`}`;
    return { defs, g };
  }

  function figure(o) {
    const { defs, g } = figureParts(o);
    return `<svg viewBox="0 0 200 520" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs}</defs>${g}</svg>`;
  }

  // ---------- scenes (backgrounds + a figure), for arches, reels, films ----------
  function decor(kind, w, h, c1, c2, r) {
    const blur = nid('bl');
    const filt = `<filter id="${blur}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${w / 40}"/></filter>`;
    let s = '';
    switch (kind) {
      case 'arches': {
        s += `<rect width="${w}" height="${h}" fill="${c1}"/>`;
        for (let i = 0; i < 3; i++) {
          const x = w * (0.08 + i * 0.32), aw = w * 0.22, top = h * 0.12;
          s += `<path d="M${x} ${h * 0.7} V${top + aw * 0.6} Q${x} ${top} ${x + aw / 2} ${top} Q${x + aw} ${top} ${x + aw} ${top + aw * 0.6} V${h * 0.7} Z" fill="${c2}" opacity=".55"/>`;
        }
        s += `<rect y="${h * 0.7}" width="${w}" height="${h * 0.3}" fill="${shade(c1, -0.18)}"/>`;
        break;
      }
      case 'foliage': {
        s += `<rect width="${w}" height="${h}" fill="${c1}"/><g filter="url(#${blur})">`;
        for (let i = 0; i < 22; i++) s += `<circle cx="${r() * w}" cy="${r() * h * 0.75}" r="${w * (0.06 + r() * 0.12)}" fill="${r() > 0.5 ? c2 : shade(c1, r() * 0.4 - 0.2)}" opacity=".8"/>`;
        s += `</g><rect y="${h * 0.78}" width="${w}" height="${h * 0.22}" fill="${shade(c2, -0.2)}"/>`;
        break;
      }
      case 'garland': {
        s += `<rect width="${w}" height="${h}" fill="${c1}"/>`;
        for (let i = 0; i < 7; i++) {
          const x = w * (0.06 + i * 0.15);
          for (let y = 0; y < h * 0.6; y += w * 0.035) s += `<circle cx="${x + Math.sin(y / 20) * 2}" cy="${y}" r="${w * 0.02}" fill="${(y / 10 | 0) % 3 ? '#f2a516' : '#e8641b'}"/>`;
          s += `<path d="M${x} ${h * 0.6} l-${w * 0.02} ${w * 0.05} h${w * 0.04} Z" fill="#3e7d32"/>`;
        }
        s += `<rect y="${h * 0.74}" width="${w}" height="${h * 0.26}" fill="${c2}"/>`;
        break;
      }
      case 'sea':
        s += `<rect width="${w}" height="${h}" fill="${c1}"/><rect y="${h * 0.5}" width="${w}" height="${h * 0.14}" fill="${c2}"/>
          <rect y="${h * 0.64}" width="${w}" height="${h * 0.36}" fill="#d9c7a8"/><circle cx="${w * 0.78}" cy="${h * 0.22}" r="${w * 0.07}" fill="#fff4dc" opacity=".8"/>`;
        break;
      case 'lamp': {
        s += `<rect width="${w}" height="${h}" fill="${c1}"/><g filter="url(#${blur})">`;
        for (let i = 0; i < 6; i++) s += `<circle cx="${r() * w}" cy="${r() * h * 0.6}" r="${w * (0.05 + r() * 0.08)}" fill="${c2}" opacity="${0.4 + r() * 0.4}"/>`;
        s += `</g><rect y="${h * 0.76}" width="${w}" height="${h * 0.24}" fill="${shade(c1, -0.3)}"/>`;
        break;
      }
      case 'wall':
        s += `<rect width="${w}" height="${h}" fill="${c1}"/><rect y="${h * 0.62}" width="${w}" height="${h * 0.38}" fill="${c2}"/>
          <rect y="${h * 0.6}" width="${w}" height="${h * 0.03}" fill="${shade(c2, -0.3)}"/>
          <rect y="${h * 0.86}" width="${w}" height="${h * 0.14}" fill="${shade(c2, 0.35)}"/>`;
        break;
      default: // studio
        s += `<rect width="${w}" height="${h}" fill="${c1}"/><ellipse cx="${w / 2}" cy="${h * 0.35}" rx="${w * 0.6}" ry="${h * 0.4}" fill="${c2}" opacity=".5"/>`;
    }
    return filt + s;
  }

  function scene(w, h, o) {
    const r = rng(o.seed || 7);
    const { defs, g } = figureParts(o.fig || {});
    const sc = (o.figH || h * 0.86) / 520;
    const fx = (o.figX ?? 0.5) * w - 100 * sc, fy = h * (o.figBottom ?? 0.98) - 515 * sc;
    const shade1 = nid('vg');
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>${defs}<radialGradient id="${shade1}" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient></defs>
      ${decor(o.decor || 'studio', w, h, o.bg?.[0] || '#efe7da', o.bg?.[1] || '#fff', r)}
      <g transform="translate(${fx.toFixed(1)} ${fy.toFixed(1)}) scale(${sc.toFixed(4)})">${g}</g>
      <rect width="${w}" height="${h}" fill="url(#${shade1})"/></svg>`;
  }

  // ---------- garments on a wooden hanger (200 x 420 units) ----------
  function hangerFrame(inner, defs) {
    const W = nid('wd');
    return `<svg viewBox="0 0 200 420" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs}
      <linearGradient id="${W}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b8743f"/><stop offset="1" stop-color="#7a3d1e"/></linearGradient></defs>
      <path d="M100 46 V30 C100 22 112 22 112 13 C112 4 99 2 95 10" fill="none" stroke="#8d8d8d" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M26 88 L100 44 L174 88 Q178 97 168 97 L32 97 Q22 97 26 88 Z" fill="url(#${W})"/>
      <path d="M32 88 L100 50 L168 88" fill="none" stroke="#d99560" stroke-width="1.4" opacity=".7"/>
      ${inner}</svg>`;
  }

  function sareeOnHanger(o) {
    const f = Object.assign({ body: '#a51c30', border: GOLD, pattern: 'butta', motif: GOLD }, o);
    const P = nid('hp'), B = nid('hb'), F = nid('hf'), C = nid('hc'), C2 = nid('hc'), T = nid('ht');
    const back = f.back;
    const outer = 'M40 90 Q100 84 160 90 L172 372 Q162 386 150 378 Q138 392 124 382 Q110 394 98 384 Q84 394 72 382 Q58 392 46 378 Q36 386 28 372 Z';
    const front = 'M46 90 Q100 86 154 90 L158 286 Q146 296 134 290 Q120 300 106 292 Q92 302 78 292 Q64 300 50 288 Z';
    const top = f.kind === 'half' ? fabric(T, { body: f.accent || '#f4c430', pattern: 'plain' }) : '';
    const defs = fabric(P, { ...f, scale: f.kind === 'check' ? 1.2 : 1 }) + border(B, f.border === GOLD ? shade(GOLD, -0.15) : f.border, f.motif, 30) + folds(F, 'h', 1.3)
      + `<clipPath id="${C}"><path d="${outer}"/></clipPath><clipPath id="${C2}"><path d="${front}"/></clipPath>` + top;
    const inner = `
      <g ${back ? 'transform="translate(200 0) scale(-1 1)"' : ''}>
      <ellipse cx="100" cy="402" rx="74" ry="7" fill="#000" opacity=".12"/>
      <path d="${outer}" fill="url(#${P})"/>
      <g clip-path="url(#${C})"><rect x="20" y="80" width="160" height="320" fill="url(#${F})"/>
        <rect x="20" y="${back ? 318 : 336}" width="160" height="${back ? 70 : 50}" fill="url(#${B})"/>
        <rect x="20" y="80" width="14" height="320" fill="url(#${B})" opacity=".9"/></g>
      ${back ? '' : `<path d="${front}" fill="${f.kind === 'half' ? `url(#${T})` : `url(#${P})`}"/>
      <g clip-path="url(#${C2})"><rect x="40" y="80" width="130" height="230" fill="url(#${F})"/>
        <rect x="40" y="252" width="130" height="44" fill="url(#${B})"/></g>
      <path d="M50 288 Q64 300 78 292 Q92 302 106 292 Q120 300 134 290 Q146 296 158 286" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="3"/>`}
      <path d="M36 86 Q100 78 164 86 L164 100 Q100 94 36 100 Z" fill="url(#${P})"/>
      <path d="M36 99 Q100 93 164 99" stroke="#000" stroke-opacity=".25" stroke-width="2" fill="none"/></g>`;
    return hangerFrame(inner, defs);
  }

  function blouseOnHanger(o) {
    const f = Object.assign({ body: '#c2185b', border: GOLD, pattern: 'plain', motif: GOLD, sleeve: 'half' }, o);
    const P = nid('bp'), B = nid('bb'), F = nid('bf');
    const full = f.sleeve === 'full';
    const defs = fabric(P, f) + border(B, shade(f.border, -0.1), f.motif, 18) + folds(F, 'h', 0.8);
    const sleeveL = full ? 'M62 96 L22 124 L6 268 L30 274 L50 150 Z' : 'M62 96 L22 120 L10 176 L40 184 L52 150 Z';
    const cuffL = full ? 'M6 254 L30 260 L28 276 L4 270 Z' : 'M11 164 L41 172 L39 186 L9 178 Z';
    const neck = f.back ? 'M80 92 Q100 150 120 92 Z' : 'M78 92 Q100 128 122 92 Z';
    const inner = `
      <ellipse cx="100" cy="300" rx="60" ry="6" fill="#000" opacity=".12"/>
      <path d="${sleeveL}" fill="url(#${P})"/><path d="${cuffL}" fill="url(#${B})"/>
      <g transform="translate(200 0) scale(-1 1)"><path d="${sleeveL}" fill="url(#${P})"/><path d="${cuffL}" fill="url(#${B})"/></g>
      <path d="M58 92 L142 92 L150 150 L148 270 Q100 282 52 270 L50 150 Z" fill="url(#${P})"/>
      <rect x="50" y="92" width="100" height="186" fill="url(#${F})" opacity=".9" clip-path="none" style="mix-blend-mode:multiply" />
      <path d="M52 256 Q100 268 148 256 L148 272 Q100 284 52 272 Z" fill="url(#${B})"/>
      <path d="${neck}" fill="#fff"/><path d="${neck}" fill="none" stroke="${f.motif}" stroke-width="3"/>
      ${f.back ? `<g fill="${f.motif}"><circle cx="100" cy="160" r="3"/><circle cx="100" cy="180" r="3"/><circle cx="100" cy="200" r="3"/></g>` : `<path d="M74 150 Q100 166 126 150" stroke="${shade(f.body, -0.35)}" fill="none" stroke-width="1.5" opacity=".6"/>`}
      <path d="M36 86 Q100 80 164 86 L164 98 Q100 92 36 98 Z" fill="url(#${P})"/>`;
    return hangerFrame(inner, defs);
  }

  // ---------- product thumbnails for "In this look" ----------
  function icon(kind, c = {}) {
    const col = c.color || '#c2185b', gold = GOLD;
    const P = nid('ip'), B = nid('ib');
    let s = '';
    switch (kind) {
      case 'saree':
        s = `<defs>${fabric(P, { body: col, pattern: c.pattern || 'butta', scale: .5 })}${border(B, c.border || shade(gold, -0.1), gold, 10)}</defs>
          <path d="M10 22 L50 14 L54 44 L14 52 Z" fill="url(#${P})"/><path d="M12 38 L52 30 L54 44 L14 52 Z" fill="url(#${B})"/>
          <path d="M10 22 L50 14 L50 18 L11 26 Z" fill="${shade(col, -0.2)}"/>`;
        break;
      case 'blouse':
        s = `<path d="M22 14 L38 14 L50 22 L46 32 L42 29 L42 48 Q30 52 18 48 L18 29 L14 32 L10 22 Z" fill="${col}"/>
          <path d="M24 14 Q30 24 36 14 Z" fill="#f4efe7"/><path d="M18 45 Q30 49 42 45 L42 48 Q30 52 18 48 Z" fill="${gold}"/>`;
        break;
      case 'choker':
        s = `<path d="M12 20 Q30 46 48 20" fill="none" stroke="${gold}" stroke-width="5"/>
          ${[0.15, 0.32, 0.5, 0.68, 0.85].map(t => `<circle cx="${12 + 36 * t}" cy="${20 + 52 * t * (1 - t)}" r="3" fill="${col}" stroke="${gold}" stroke-width="1.4"/>`).join('')}
          <path d="M26 40 h8 l-4 9 Z" fill="${gold}"/>`;
        break;
      case 'jhumkas':
        s = [18, 42].map(x => `<circle cx="${x}" cy="12" r="4" fill="${gold}"/><path d="M${x - 9} 34 Q${x - 9} 18 ${x} 18 Q${x + 9} 18 ${x + 9} 34 Z" fill="${gold}"/>
          <path d="M${x - 9} 34 h18" stroke="${shade(gold, -0.3)}" stroke-width="1.5"/>${[-6, -2, 2, 6].map(d => `<circle cx="${x + d}" cy="40" r="2" fill="#fbf7ef" stroke="#cfc4b3" stroke-width=".6"/>`).join('')}<circle cx="${x}" cy="27" r="2.4" fill="${col}"/>`).join('');
        break;
      case 'ottiyanam':
        s = `<path d="M4 26 Q30 38 56 26 L56 34 Q30 46 4 34 Z" fill="${gold}"/><ellipse cx="30" cy="36" rx="9" ry="7" fill="${shade(gold, -0.15)}"/>
          <circle cx="30" cy="36" r="3" fill="${col}"/><path d="M4 30 Q30 42 56 30" stroke="${shade(gold, -0.35)}" stroke-dasharray="2 2" fill="none"/>`;
        break;
      default: // bangles
        s = [0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="14" y="${12 + i * 5.2}" width="32" height="4.4" rx="2.2" fill="${i % 3 === 1 ? col : gold}"/>`).join('');
    }
    return `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${s}</svg>`;
  }

  // ---------- hero: a heritage showroom in one-point perspective ----------
  function showroom() {
    const W = 1600, H = 900, vx = 800, r = rng(42);
    const silks = ['#b0122f', '#e3a21a', '#1e6b45', '#7b1fa2', '#d84315', '#c2185b', '#00695c', '#f9a825', '#4527a0', '#8e1b1b', '#2e7d32', '#ef6c00', '#ad1457', '#1565c0'];
    const lerp = (a, b, t) => a + (b - a) * t;
    // bilinear point on a quad (p0 top-near, p1 top-far, p2 bottom-far, p3 bottom-near)
    const quadPt = (q, u, v) => {
      const tx = lerp(q[0][0], q[1][0], u), ty = lerp(q[0][1], q[1][1], u);
      const bx = lerp(q[3][0], q[2][0], u), by = lerp(q[3][1], q[2][1], u);
      return [lerp(tx, bx, v), lerp(ty, by, v)];
    };
    const poly = pts => pts.map(p => p.map(n => n.toFixed(1)).join(',')).join(' ');
    function shelves(q, cols, rows) {
      let s = `<polygon points="${poly(q)}" fill="#5a2a14"/>`;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const u0 = i / cols + 0.012, u1 = (i + 1) / cols - 0.012, v0 = j / rows + 0.012, v1 = (j + 1) / rows - 0.03;
        s += `<polygon points="${poly([quadPt(q, u0, v0), quadPt(q, u1, v0), quadPt(q, u1, v1), quadPt(q, u0, v1)])}" fill="#2a1208"/>`;
        const n = 5 + (r() * 4 | 0);
        for (let k = 0; k < n; k++) {
          const a = v0 + (v1 - v0) * (0.15 + 0.85 * k / n), b = v0 + (v1 - v0) * (0.15 + 0.85 * (k + 1) / n) - 0.004;
          const col = silks[r() * silks.length | 0];
          s += `<polygon points="${poly([quadPt(q, u0 + 0.004, a), quadPt(q, u1 - 0.004, a), quadPt(q, u1 - 0.004, b), quadPt(q, u0 + 0.004, b)])}" fill="${col}"/>`;
          s += `<polygon points="${poly([quadPt(q, u0 + 0.004, b - 0.006), quadPt(q, u1 - 0.004, b - 0.006), quadPt(q, u1 - 0.004, b), quadPt(q, u0 + 0.004, b)])}" fill="${GOLD}" opacity=".8"/>`;
        }
      }
      return s;
    }
    const back = { x0: 600, x1: 1000, y0: 300, y1: 560 };
    const leftWall = [[-40, -60], [back.x0, back.y0], [back.x0, back.y1], [-40, 1020]];
    const rightWall = [[W + 40, -60], [back.x1, back.y0], [back.x1, back.y1], [W + 40, 1020]];
    const lShelf = [[-40, 40], [560, 320], [560, 520], [-40, 820]];
    const rShelf = [[W + 40, 40], [1040, 320], [1040, 520], [W + 40, 820]];
    let ceiling = '';
    for (let j = 1; j < 6; j++) for (let i = -2; i <= 2; i++) {
      const t = j / 6, y = lerp(-60, back.y0, t) , x = vx + i * lerp(300, 90, t);
      ceiling += `<ellipse cx="${x}" cy="${y + 10}" rx="${lerp(14, 5, t)}" ry="${lerp(5, 2, t)}" fill="#fff8e1"/>`;
    }
    let floor = '';
    for (let i = -8; i <= 8; i++) floor += `<line x1="${vx + i * 30}" y1="${back.y1}" x2="${vx + i * 260}" y2="${H + 60}" stroke="#bfae98" stroke-width="1" opacity=".5"/>`;
    for (let j = 1; j < 7; j++) { const y = back.y1 + (H - back.y1) * Math.pow(j / 7, 1.8); floor += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#bfae98" stroke-width="1" opacity=".4"/>`; }
    const hang = (x, y, wdt, hgt, col, bcol) => {
      const P = nid('sp'), B = nid('sb');
      return `<defs>${fabric(P, { body: col, pattern: 'brocade', scale: .8 })}${border(B, bcol, GOLD, 20)}</defs>
        <line x1="${x + wdt / 2}" y1="${y - 40}" x2="${x + wdt / 2}" y2="${y}" stroke="#d9b56b" stroke-width="2"/>
        <rect x="${x - 6}" y="${y - 4}" width="${wdt + 12}" height="6" fill="#8b5a2b"/>
        <path d="M${x} ${y} h${wdt} l4 ${hgt} q-${wdt / 2} 10 -${wdt + 8} 0 Z" fill="url(#${P})"/>
        <rect x="${x - 3}" y="${y + hgt - 40}" width="${wdt + 6}" height="36" fill="url(#${B})"/>`;
    };
    const man = (x, yb, h, o) => {
      const { defs, g } = figureParts(Object.assign({ mannequin: true }, o));
      const sc = h / 520;
      return `<defs>${defs}</defs><g transform="translate(${x - 100 * sc} ${yb - 515 * sc}) scale(${sc})">${g}</g>`;
    };
    const glow = nid('gl'), cg = nid('cg'), fg = nid('fg'), wg = nid('wg');
    return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="${cg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c77d"/><stop offset="1" stop-color="#b98a3c"/></linearGradient>
        <linearGradient id="${fg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdbda6"/><stop offset="1" stop-color="#efe6d8"/></linearGradient>
        <linearGradient id="${wg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b1420"/><stop offset="1" stop-color="#4a0d16"/></linearGradient>
        <radialGradient id="${glow}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9b0" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="#3a1a0e"/>
      <polygon points="${poly([[-40, -60], [W + 40, -60], [back.x1, back.y0], [back.x0, back.y0]])}" fill="url(#${cg})"/>
      ${ceiling}
      <polygon points="${poly([[-40, 1020], [W + 40, 1020], [back.x1, back.y1], [back.x0, back.y1]])}" fill="url(#${fg})"/>
      ${floor}
      <rect x="${back.x0}" y="${back.y0}" width="${back.x1 - back.x0}" height="${back.y1 - back.y0}" fill="url(#${wg})"/>
      <rect x="${vx - 62}" y="${back.y0 + 40}" width="124" height="150" fill="#2b0a0f" stroke="${GOLD}" stroke-width="7"/>
      <path d="M${vx - 44} ${back.y0 + 180} V${back.y0 + 90} Q${vx} ${back.y0 + 50} ${vx + 44} ${back.y0 + 90} V${back.y0 + 180} Z" fill="${GOLD}" opacity=".5"/>
      <circle cx="${vx}" cy="${back.y0 + 115}" r="60" fill="url(#${glow})"/>
      <rect x="${back.x0 + 30}" y="${back.y1 - 50}" width="${back.x1 - back.x0 - 60}" height="40" rx="6" fill="#8e1b26"/>
      <g fill="#e8c27a"><ellipse cx="${vx - 90}" cy="${back.y1 - 52}" rx="22" ry="10"/><ellipse cx="${vx - 30}" cy="${back.y1 - 54}" rx="22" ry="10"/><ellipse cx="${vx + 30}" cy="${back.y1 - 54}" rx="22" ry="10"/><ellipse cx="${vx + 90}" cy="${back.y1 - 52}" rx="22" ry="10"/></g>
      <polygon points="${poly(leftWall)}" fill="#4a2312"/>
      <polygon points="${poly(rightWall)}" fill="#4a2312"/>
      ${shelves(lShelf, 6, 5)}${shelves(rShelf, 6, 5)}
      <g><circle cx="${vx}" cy="${back.y0 + 10}" r="70" fill="url(#${glow})"/>
        <line x1="${vx}" y1="${back.y0 - 60}" x2="${vx}" y2="${back.y0 - 10}" stroke="#d9b56b" stroke-width="2"/>
        ${[-30, -15, 0, 15, 30].map(d => `<path d="M${vx + d} ${back.y0 - 8} l-4 18 h8 Z" fill="#fff3cf" opacity=".95"/>`).join('')}
        <ellipse cx="${vx}" cy="${back.y0 - 8}" rx="40" ry="6" fill="#e3c06f"/></g>
      ${hang(250, 120, 70, 300, '#b0122f', '#1e5e3a')}${hang(1290, 120, 70, 300, '#1e6b45', '#a51c30')}
      ${hang(470, 260, 40, 170, '#c2185b', '#1f4a7a')}${hang(1090, 260, 40, 170, '#e3a21a', '#8e1b1b')}
      <rect x="${vx - 240}" y="610" width="480" height="16" rx="3" fill="#a8703c"/><rect x="${vx - 232}" y="626" width="464" height="70" fill="#6b3518"/><g fill="#8a4a24">${[0,1,2,3].map(i=>`<rect x="${vx - 220 + i * 114}" y="636" width="100" height="50" rx="4"/>`).join("")}</g><g>${[0,1,2,3,4,5].map(i=>`<rect x="${vx - 200 + i * 66}" y="${596 - (i % 2) * 6}" width="54" height="${14 + (i % 2) * 6}" rx="2" fill="${["#b0122f","#e3a21a","#1e6b45","#7b1fa2","#c2185b","#00695c"][i]}"/>`).join("")}</g>
      ${man(560, 650, 270, { body: '#1e6b45', border: '#b0122f', seed: 3 })}
      ${man(1050, 640, 250, { body: '#b0122f', border: '#1e6b45', seed: 4, pattern: 'check', accent: '#7b1fa2' })}
      ${man(1340, 980, 820, { body: '#b2182b', border: '#d4a24c', pallu: '#c1442e', palluPattern: 'brocade', pattern: 'butta', seed: 5 })}
      <rect width="${W}" height="${H}" fill="#2a0d06" opacity=".12"/>
    </svg>`;
  }

  return { figure, scene, sareeOnHanger, blouseOnHanger, icon, showroom, shade, rng };
})();
