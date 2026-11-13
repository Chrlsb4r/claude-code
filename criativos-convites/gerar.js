// Gera os criativos (post 1080x1080, post alternativo, story 1080x1920) para 5 temas.
// Uso: node criativos-convites/gerar.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'png');
fs.mkdirSync(OUT, { recursive: true });

let uid = 0;
const id = (p) => `${p}${++uid}`;
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

// ---------- primitivas SVG (com volume por gradiente) ----------
const P = {
  sphere(cx, cy, r, light, base, dark) {
    const g = id('sp');
    return `<defs><radialGradient id="${g}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${light}"/><stop offset=".45" stop-color="${base}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${g})"/>
    <ellipse cx="${cx - r * .35}" cy="${cy - r * .4}" rx="${r * .22}" ry="${r * .13}" fill="#fff" opacity=".35" transform="rotate(-30 ${cx - r * .35} ${cy - r * .4})"/>`;
  },
  balloon(cx, cy, r, light, base, dark, string = '#ffffff99', len = 120) {
    const g = id('bl');
    const ry = r * 1.18;
    return `<defs><radialGradient id="${g}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${light}"/><stop offset=".5" stop-color="${base}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs>
    <path d="M${cx} ${cy + ry} q -10 ${len * .35} 8 ${len * .6} t -6 ${len * .4}" stroke="${string}" stroke-width="2.5" fill="none"/>
    <path d="M${cx - 9} ${cy + ry + 9} L${cx + 9} ${cy + ry + 9} L${cx} ${cy + ry - 3} Z" fill="${dark}"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${ry}" fill="url(#${g})"/>
    <ellipse cx="${cx - r * .38}" cy="${cy - ry * .42}" rx="${r * .2}" ry="${r * .34}" fill="#fff" opacity=".4" transform="rotate(25 ${cx - r * .38} ${cy - ry * .42})"/>`;
  },
  star(cx, cy, r, c1, c2, rot = 0) {
    const g = id('st'); let pts = [];
    for (let i = 0; i < 10; i++) { const a = Math.PI / 5 * i - Math.PI / 2; const rr = i % 2 ? r * .48 : r; pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`); }
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <polygon points="${pts.join(' ')}" fill="url(#${g})" stroke="url(#${g})" stroke-width="${r * .22}" stroke-linejoin="round" transform="rotate(${rot} ${cx} ${cy})"/>`;
  },
  cloud(cx, cy, w, c1, c2) {
    const g = id('cl'); const s = w / 200;
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <g transform="translate(${cx - 100 * s} ${cy - 60 * s}) scale(${s})" fill="url(#${g})">
      <circle cx="62" cy="70" r="38"/><circle cx="110" cy="52" r="50"/><circle cx="152" cy="78" r="32"/><rect x="30" y="70" width="150" height="40" rx="20"/>
    </g>`;
  },
  cube(x, y, s, top, left, right) {
    const h = s * .5;
    return `<g transform="translate(${x} ${y})">
      <path d="M0 ${h} L${s} 0 L${2 * s} ${h} L${s} ${2 * h} Z" fill="${top}" stroke="${top}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M0 ${h} L${s} ${2 * h} L${s} ${2 * h + s} L0 ${h + s} Z" fill="${left}" stroke="${left}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M${2 * s} ${h} L${s} ${2 * h} L${s} ${2 * h + s} L${2 * s} ${h + s} Z" fill="${right}" stroke="${right}" stroke-width="6" stroke-linejoin="round"/>
      <circle cx="${s}" cy="${h}" r="${s * .22}" fill="#fff" opacity=".35"/>
    </g>`;
  },
  teddy(cx, cy, s, light, base, dark, muzzle, eye = '#3b3030') {
    const g = id('td');
    const f = `url(#${g})`;
    return `<defs><radialGradient id="${g}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs>
    <g transform="translate(${cx} ${cy}) scale(${s})">
      <ellipse cx="0" cy="70" rx="58" ry="52" fill="${f}"/>
      <circle cx="-48" cy="110" r="22" fill="${f}"/><circle cx="48" cy="110" r="22" fill="${f}"/>
      <ellipse cx="0" cy="78" rx="30" ry="28" fill="${muzzle}" opacity=".6"/>
      <circle cx="-40" cy="-42" r="20" fill="${f}"/><circle cx="40" cy="-42" r="20" fill="${f}"/>
      <circle cx="-40" cy="-42" r="10" fill="${muzzle}"/><circle cx="40" cy="-42" r="10" fill="${muzzle}"/>
      <circle cx="0" cy="0" r="50" fill="${f}"/>
      <ellipse cx="0" cy="16" rx="22" ry="17" fill="${muzzle}"/>
      <ellipse cx="0" cy="9" rx="7" ry="5" fill="${eye}"/>
      <circle cx="-17" cy="-8" r="5" fill="${eye}"/><circle cx="17" cy="-8" r="5" fill="${eye}"/>
    </g>`;
  },
  moon(cx, cy, r, c1, c2) {
    const g = id('mn'), m = id('mm');
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <mask id="${m}"><rect x="${cx - r - 2}" y="${cy - r - 2}" width="${2 * r + 4}" height="${2 * r + 4}" fill="#fff"/><circle cx="${cx + r * .45}" cy="${cy - r * .25}" r="${r * .85}" fill="#000"/></mask></defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${g})" mask="url(#${m})"/>`;
  },
  rattle(cx, cy, s, rot, head, headDark, handle, ring) {
    const g = id('rt');
    return `<defs><radialGradient id="${g}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="${head}"/><stop offset="1" stop-color="${headDark}"/></radialGradient></defs>
    <g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s})">
      <rect x="-9" y="20" width="18" height="90" rx="9" fill="${handle}"/>
      <circle cx="0" cy="118" r="20" fill="none" stroke="${ring}" stroke-width="9"/>
      <rect x="-20" y="22" width="40" height="12" rx="6" fill="${ring}"/>
      <circle cx="0" cy="-20" r="44" fill="url(#${g})"/>
      <path d="M-44 -20 Q0 -2 44 -20" stroke="#fff" stroke-width="5" fill="none" opacity=".7"/>
    </g>`;
  },
  bootie(x, y, s, c1, c2, cuff, flip = false) {
    const g = id('bt');
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">
      <path d="M-30 -50 L20 -50 L22 0 Q60 4 70 26 Q72 44 50 46 L-28 46 Q-44 44 -40 20 Z" fill="url(#${g})"/>
      <rect x="-36" y="-62" width="62" height="22" rx="11" fill="${cuff}"/>
      <path d="M-34 30 L60 30" stroke="#fff" stroke-width="4" opacity=".45" stroke-linecap="round"/>
    </g>`;
  },
  flower(cx, cy, r, petal1, petal2, center, n = 8, rot = 0) {
    const g = id('fl'); let s = '';
    for (let i = 0; i < n; i++) s += `<ellipse cx="0" cy="${-r * .55}" rx="${r * .32}" ry="${r * .55}" fill="url(#${g})" transform="rotate(${i * 360 / n})"/>`;
    let s2 = '';
    for (let i = 0; i < n; i++) s2 += `<ellipse cx="0" cy="${-r * .33}" rx="${r * .22}" ry="${r * .36}" fill="url(#${g})" opacity=".9" transform="rotate(${i * 360 / n + 180 / n})"/>`;
    return `<defs><radialGradient id="${g}" cx="50%" cy="100%" r="100%"><stop offset="0" stop-color="${petal2}"/><stop offset="1" stop-color="${petal1}"/></radialGradient></defs>
    <g transform="translate(${cx} ${cy}) rotate(${rot})">${s}${s2}<circle r="${r * .17}" fill="${center}"/></g>`;
  },
  leaf(cx, cy, len, ang, c1, c2) {
    const g = id('lf');
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <g transform="translate(${cx} ${cy}) rotate(${ang})"><path d="M0 0 Q${len * .5} ${-len * .32} ${len} 0 Q${len * .5} ${len * .32} 0 0Z" fill="url(#${g})"/><path d="M4 0 L${len * .9} 0" stroke="#fff" stroke-width="1.5" opacity=".35"/></g>`;
  },
  candle(x, y, w, h, c1, c2) {
    const g = id('cd'), fl = id('fm'), gl = id('gw');
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c2}"/><stop offset=".4" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <radialGradient id="${gl}"><stop offset="0" stop-color="#ffd98a" stop-opacity=".7"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
    <linearGradient id="${fl}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff9d3b"/><stop offset=".6" stop-color="#ffd36b"/><stop offset="1" stop-color="#fff6d8"/></linearGradient></defs>
    <circle cx="${x + w / 2}" cy="${y - 26}" r="${w * 1.3}" fill="url(#${gl})"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * .12}" fill="url(#${g})"/>
    <ellipse cx="${x + w / 2}" cy="${y}" rx="${w / 2}" ry="${w * .12}" fill="${c1}"/>
    <path d="M${x + w / 2} ${y} L${x + w / 2} ${y - 10}" stroke="#4b3a32" stroke-width="2.5"/>
    <path d="M${x + w / 2} ${y - 50} Q${x + w / 2 + 13} ${y - 22} ${x + w / 2} ${y - 9} Q${x + w / 2 - 13} ${y - 22} ${x + w / 2} ${y - 50}Z" fill="url(#${fl})"/>`;
  },
  bow(cx, cy, s, c1, c2, rot = 0) {
    const g = id('bw');
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s})" fill="url(#${g})">
      <path d="M0 0 C-30 -50 -85 -40 -78 -5 C-72 30 -30 22 0 0Z"/><path d="M0 0 C30 -50 85 -40 78 -5 C72 30 30 22 0 0Z"/>
      <path d="M-6 6 L-38 78 L-22 72 L-12 86 L4 10Z"/><path d="M6 6 L34 80 L20 72 L10 88 L-2 10Z"/>
      <ellipse cx="0" cy="0" rx="14" ry="16" fill="${c2}"/>
    </g>`;
  },
  ring(cx, cy, r, metal1, metal2, gem1, gem2, rot = 0) {
    const g = id('rg'), gm = id('gm');
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${metal1}"/><stop offset=".5" stop-color="${metal2}"/><stop offset="1" stop-color="${metal1}"/></linearGradient>
    <linearGradient id="${gm}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${gem1}"/><stop offset="1" stop-color="${gem2}"/></linearGradient></defs>
    <g transform="translate(${cx} ${cy}) rotate(${rot})">
      <ellipse cx="0" cy="0" rx="${r}" ry="${r * .92}" fill="none" stroke="url(#${g})" stroke-width="${r * .22}"/>
      <path d="M${-r * .38} ${-r * 1.02} L${r * .38} ${-r * 1.02} L${r * .55} ${-r * 1.3} L0 ${-r * 1.75} L${-r * .55} ${-r * 1.3}Z" fill="url(#${gm})" transform="translate(0 ${-r*.0})"/>
      <path d="M${-r * .55} ${-r * 1.3} L${r * .55} ${-r * 1.3}" stroke="#fff" stroke-width="2" opacity=".7"/>
      <path d="M0 ${-r * 1.75} L${-r * .15} ${-r * 1.3}" stroke="#fff" stroke-width="2" opacity=".6"/>
    </g>`;
  },
  ball(cx, cy, r, light, base, dark, seam) {
    return P.sphere(cx, cy, r, light, base, dark) +
      `<g stroke="${seam}" stroke-width="${r * .05}" fill="none" stroke-linecap="round" opacity=".85">
        <path d="M${cx} ${cy - r} L${cx} ${cy + r}"/><path d="M${cx - r} ${cy} L${cx + r} ${cy}"/>
        <path d="M${cx - r * .7} ${cy - r * .72} Q${cx - r * .2} ${cy} ${cx - r * .7} ${cy + r * .72}"/>
        <path d="M${cx + r * .7} ${cy - r * .72} Q${cx + r * .2} ${cy} ${cx + r * .7} ${cy + r * .72}"/></g>`;
  },
  compass(cx, cy, r, rot = 0) {
    const g = id('cp'), f = id('cf');
    let ticks = '';
    for (let i = 0; i < 24; i++) { const a = i * 15 * Math.PI / 180, l = i % 6 ? r * .08 : r * .16; ticks += `<line x1="${(Math.cos(a) * r * .74).toFixed(1)}" y1="${(Math.sin(a) * r * .74).toFixed(1)}" x2="${(Math.cos(a) * (r * .74 - l)).toFixed(1)}" y2="${(Math.sin(a) * (r * .74 - l)).toFixed(1)}" stroke="#1d2b44" stroke-width="${i % 6 ? 2 : 3.5}" stroke-linecap="round"/>`; }
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2d6a6"/><stop offset=".45" stop-color="#b98a4e"/><stop offset="1" stop-color="#6e4b24"/></linearGradient>
    <radialGradient id="${f}" cx="40%" cy="35%" r="80%"><stop offset="0" stop-color="#fffaf2"/><stop offset="1" stop-color="#e3d9c9"/></radialGradient></defs>
    <g transform="translate(${cx} ${cy}) rotate(${rot})">
      <circle r="${r}" fill="url(#${g})"/><circle r="${r * .84}" fill="url(#${f})"/>${ticks}
      <path d="M0 ${-r * .62} L${r * .1} 0 L0 ${r * .62} L${-r * .1} 0Z" fill="#1d2b44"/>
      <path d="M0 ${-r * .62} L${r * .1} 0 L${-r * .1} 0Z" fill="#c8623c"/>
      <circle r="${r * .06}" fill="#b98a4e"/>
      <rect x="${-r * .12}" y="${-r * 1.16}" width="${r * .24}" height="${r * .2}" rx="${r * .05}" fill="url(#${g})"/>
      <path d="M${-r * .5} ${-r * .55} A${r * .75} ${r * .75} 0 0 1 ${r * .1} ${-r * .75}" stroke="#fff" stroke-width="${r * .05}" fill="none" opacity=".7" stroke-linecap="round"/>
    </g>`;
  },
  tire(cx, cy, r) {
    const g = id('tr'), h = id('hb');
    return `<defs><radialGradient id="${g}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#4a4f58"/><stop offset=".7" stop-color="#25282e"/><stop offset="1" stop-color="#14161a"/></radialGradient>
    <radialGradient id="${h}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".5" stop-color="#a9b0b9"/><stop offset="1" stop-color="#5e646d"/></radialGradient></defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${g})"/>
    <circle cx="${cx}" cy="${cy}" r="${r * .92}" fill="none" stroke="#1a1c20" stroke-width="${r * .1}" stroke-dasharray="${r * .1} ${r * .08}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * .56}" fill="url(#${h})"/>
    ${[0, 72, 144, 216, 288].map(a => `<path d="M${cx} ${cy} L${cx + Math.cos((a - 12) * Math.PI / 180) * r * .5} ${cy + Math.sin((a - 12) * Math.PI / 180) * r * .5} L${cx + Math.cos((a + 12) * Math.PI / 180) * r * .5} ${cy + Math.sin((a + 12) * Math.PI / 180) * r * .5}Z" fill="#3a3f47" opacity=".55"/>`).join('')}
    <circle cx="${cx}" cy="${cy}" r="${r * .16}" fill="#c8623c"/>
    <path d="M${cx - r * .65} ${cy - r * .5} A${r * .85} ${r * .85} 0 0 1 ${cx} ${cy - r * .85}" stroke="#fff" stroke-width="${r * .04}" fill="none" opacity=".25" stroke-linecap="round"/>`;
  },
  key(cx, cy, s, rot, c1, c2) {
    const g = id('ky');
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s})" fill="url(#${g})">
      <path fill-rule="evenodd" d="M0 -44 a44 44 0 1 1 0 88 a44 44 0 1 1 0 -88Z M0 -18 a18 18 0 1 0 0 36 a18 18 0 1 0 0 -36Z"/>
      <rect x="38" y="-9" width="130" height="18" rx="6"/>
      <rect x="128" y="5" width="14" height="28" rx="4"/><rect x="150" y="5" width="14" height="20" rx="4"/>
    </g>`;
  },
  wrench(cx, cy, s, rot, c1, c2) {
    const g = id('wr');
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
    <g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s})">
      <path fill="url(#${g})" d="M-20 -150 a46 46 0 1 0 40 0 L20 -110 L6 -96 L-6 -96 L-20 -110Z M-14 -86 L14 -86 L16 120 a16 16 0 0 1 -32 0Z"/>
    </g>`;
  },
  gift(cx, cy, w, body1, body2, lid1, ribbon, open = true) {
    const g = id('gb'), l = id('gl');
    const h = w * .78;
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${body1}"/><stop offset="1" stop-color="${body2}"/></linearGradient>
    <linearGradient id="${l}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lid1}"/><stop offset="1" stop-color="${body2}"/></linearGradient></defs>
    <g transform="translate(${cx} ${cy})">
      <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="10" fill="url(#${g})"/>
      <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h * .14}" fill="#000" opacity=".15"/>
      <rect x="${-w * .08}" y="${-h / 2}" width="${w * .16}" height="${h}" fill="${ribbon}"/>
      ${open ? `<g transform="translate(${w * .18} ${-h / 2 - w * .32}) rotate(-24)">
        <rect x="${-w * .58}" y="${-w * .09}" width="${w * 1.16}" height="${w * .2}" rx="10" fill="url(#${l})"/>
        <rect x="${-w * .09}" y="${-w * .09}" width="${w * .18}" height="${w * .2}" fill="${ribbon}"/>
        ${P.bow(0, -w * .1, w / 260, ribbon, ribbon, 0)}</g>` : ''}
    </g>`;
  },
  confetti(x0, y0, w, h, n, colors, seed, minS = 6, maxS = 16) {
    const r = rng(seed); let s = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * w, y = y0 + r() * h, c = colors[Math.floor(r() * colors.length)], sz = minS + r() * (maxS - minS), a = r() * 180, t = r();
      if (t < .45) s += `<rect x="${x}" y="${y}" width="${sz}" height="${sz * .45}" rx="2" fill="${c}" transform="rotate(${a} ${x} ${y})"/>`;
      else if (t < .75) s += `<circle cx="${x}" cy="${y}" r="${sz * .32}" fill="${c}"/>`;
      else s += `<path d="M${x} ${y} q ${sz * .5} ${-sz * .6} ${sz} 0 t ${sz} 0" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" transform="rotate(${a} ${x} ${y})"/>`;
    }
    return s;
  },
  cake(cx, cy, w, base1, base2, icing, drip, inside1, inside2, plate) {
    const g = id('ck'), ins = id('ci'), h = w * .62;
    const L = cx - w / 2, T = cy - h / 2;
    const r = rng(11); let sprinkles = '';
    const cols = ['#ff4f9a', '#2fa7ff', '#ffd23f', '#7be0c3', '#ffffff'];
    for (let i = 0; i < 18; i++) { const x = L + 14 + r() * (w - 28), y = T - 4 + r() * 16; sprinkles += `<rect x="${x}" y="${y}" width="10" height="3.6" rx="1.8" fill="${cols[i % 5]}" transform="rotate(${r() * 180} ${x} ${y})"/>`; }
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${base2}"/><stop offset=".35" stop-color="${base1}"/><stop offset="1" stop-color="${base2}"/></linearGradient>
    <linearGradient id="${ins}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${inside1}"/><stop offset="1" stop-color="${inside2}"/></linearGradient></defs>
    <ellipse cx="${cx}" cy="${T + h + 10}" rx="${w * .66}" ry="${w * .1}" fill="${plate}"/>
    <rect x="${L}" y="${T}" width="${w}" height="${h}" rx="12" fill="url(#${g})"/>
    <ellipse cx="${cx}" cy="${T + h}" rx="${w / 2}" ry="${w * .06}" fill="${base2}"/>
    <path d="M${L} ${T + 6} L${L + w} ${T + 6} L${L + w} ${T + 26} ${Array.from({ length: 6 }, (_, i) => { const x = L + w - (i + .5) * w / 6; return `Q${x + w / 24} ${T + 26} ${x} ${T + 40 + (i % 2) * 18} Q${x - w / 24} ${T + 26} ${x - w / 12} ${T + 26}`; }).join(' ')} L${L} ${T + 26}Z" fill="${drip}"/>
    <ellipse cx="${cx}" cy="${T + 6}" rx="${w / 2}" ry="${w * .07}" fill="${icing}"/>
    ${sprinkles}
    <path d="M${cx + w * .16} ${T - w * .02} L${cx + w * .5} ${T + w * .06} L${cx + w * .5} ${T + h + 2} L${cx + w * .16} ${T + h + 8}Z" fill="url(#${ins})"/>
    <path d="M${cx + w * .16} ${T + h * .36} L${cx + w * .5} ${T + h * .36}" stroke="${icing}" stroke-width="7"/>
    <path d="M${cx + w * .16} ${T + h * .68} L${cx + w * .5} ${T + h * .68}" stroke="${icing}" stroke-width="7"/>
    <path d="M${cx + w * .16} ${T - w * .02} L${cx + w * .5} ${T + w * .06}" stroke="${icing}" stroke-width="8" stroke-linecap="round"/>
    <path d="M${cx + w * .16} ${T - w * .02} L${cx + w * .16} ${T + h + 8}" stroke="#ffffff" stroke-width="2" opacity=".6"/>`;
  },
  mountains(x, y, w, h, c1, c2, sun) {
    return `<circle cx="${x + w * .7}" cy="${y + h * .32}" r="${h * .2}" fill="${sun}"/>
      <path d="M${x} ${y + h} L${x + w * .32} ${y + h * .38} L${x + w * .5} ${y + h * .62} L${x + w * .7} ${y + h * .3} L${x + w} ${y + h}Z" fill="${c1}"/>
      <path d="M${x} ${y + h} L${x + w * .22} ${y + h * .66} L${x + w * .45} ${y + h}Z M${x + w * .5} ${y + h} L${x + w * .82} ${y + h * .58} L${x + w} ${y + h * .8} L${x + w} ${y + h}Z" fill="${c2}"/>`;
  },
};

// ---------- conteúdo da tela do convite (sem texto: tipografia implícita) ----------
function screenSVG(t) {
  const W = 306, H = 666, s = t.screen;
  const bars = (y, col, acc) => `
    <rect x="${W / 2 - 40}" y="${y}" width="80" height="6" rx="3" fill="${acc}" opacity=".9"/>
    <rect x="${W / 2 - 104}" y="${y + 24}" width="208" height="26" rx="13" fill="${col}"/>
    <rect x="${W / 2 - 78}" y="${y + 60}" width="156" height="26" rx="13" fill="${col}"/>
    <rect x="${W / 2 - 92}" y="${y + 106}" width="184" height="9" rx="4.5" fill="${col}" opacity=".45"/>
    <rect x="${W / 2 - 70}" y="${y + 124}" width="140" height="9" rx="4.5" fill="${col}" opacity=".45"/>
    <g opacity=".9">${[-1, 0, 1].map(i => `<rect x="${W / 2 + i * 86 - 34}" y="${y + 156}" width="68" height="62" rx="16" fill="${s.chip}"/><circle cx="${W / 2 + i * 86}" cy="${y + 178}" r="9" fill="${acc}"/><rect x="${W / 2 + i * 86 - 20}" y="${y + 196}" width="40" height="6" rx="3" fill="${col}" opacity=".5"/>`).join('')}</g>
    <rect x="${W / 2 - 96}" y="${y + 240}" width="192" height="46" rx="23" fill="${s.button}"/>
    <rect x="${W / 2 - 40}" y="${y + 260}" width="80" height="7" rx="3.5" fill="${s.buttonInk}" opacity=".85"/>`;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="scrbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.bg1}"/><stop offset="1" stop-color="${s.bg2}"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#scrbg)"/>
    ${s.hero(W)}
    ${bars(318, s.ink, s.accent)}
    <rect x="${W / 2 - 50}" y="${H - 16}" width="100" height="5" rx="2.5" fill="${s.ink}" opacity=".35"/>
  </svg>`;
}

function cardSVG(t) {
  const W = 290, H = 400, c = t.card;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" rx="20" fill="${c.bg}"/>
    <rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="12" fill="none" stroke="${c.line}" stroke-width="1.5" opacity=".7"/>
    ${c.hero(W)}
    <rect x="${W / 2 - 80}" y="236" width="160" height="20" rx="10" fill="${c.ink}"/>
    <rect x="${W / 2 - 58}" y="266" width="116" height="20" rx="10" fill="${c.ink}"/>
    <rect x="${W / 2 - 70}" y="304" width="140" height="7" rx="3.5" fill="${c.ink}" opacity=".4"/>
    <rect x="${W / 2 - 50}" y="320" width="100" height="7" rx="3.5" fill="${c.ink}" opacity=".4"/>
    <rect x="${W / 2 - 22}" y="346" width="44" height="3" rx="1.5" fill="${c.line}"/>
  </svg>`;
}

// ---------- temas ----------
const T = {};

T['01-aniversario-masculino'] = {
  bg: { a: ['#16243b', '#0b1424', '#2a3d5c'], b: ['#ece5dc', '#d9cfc2', '#f7f2ec'] },
  frame: '#1b1f27',
  screen: {
    bg1: '#f4efe8', bg2: '#ece3d6', ink: '#1d2b44', accent: '#c8623c', chip: '#e4d9ca', button: '#1d2b44', buttonInk: '#f4efe8',
    hero: (W) => `<rect x="0" y="0" width="${W}" height="290" fill="#1d2b44"/>${P.mountains(0, 120, W, 170, '#2c3f60', '#3d5478', '#c8623c')}
      <path d="M${W * .42} 290 L${W * .5} 200 L${W * .58} 290Z" fill="#475d82"/><path d="M${W * .5} 210 L${W * .5} 285" stroke="#f4efe8" stroke-width="3" stroke-dasharray="10 9"/>
      ${P.compass(54, 62, 26)}`,
  },
  card: { bg: '#c8623c', ink: '#f6ede2', line: '#f6ede2', hero: (W) => P.key(W / 2 - 62, 150, .82, -28, '#f6ede2', '#e2c49a') },
  back: () => P.tire(600, 195, 92) + P.wrench(105, 210, .72, -35, '#d6dbe1', '#6a727d') + P.key(640, 470, .62, 62, '#f2d6a6', '#8a6232'),
  front: () => P.ball(108, 772, 64, '#f0a07c', '#c8623c', '#7e3519', '#5a230e') + P.compass(592, 728, 74, -8) + P.sphere(232, 826, 20, '#7f92b3', '#3d5478', '#1d2b44'),
};

T['02-aniversario-feminino'] = {
  bg: { a: ['#f6e1df', '#ecc9c6', '#fdf3f1'], b: ['#3b2433', '#24131f', '#5a3a4d'] },
  frame: '#d9b98a',
  screen: {
    bg1: '#fdf1ee', bg2: '#f6dcd8', ink: '#7a4256', accent: '#c9a063', chip: '#f9e6e2', button: '#c9a063', buttonInk: '#fff8f0',
    hero: (W) => {
      let s = `<circle cx="${W / 2}" cy="150" r="104" fill="#f9e3df"/><circle cx="${W / 2}" cy="150" r="96" fill="none" stroke="#c9a063" stroke-width="2"/>`;
      for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const x = W / 2 + Math.cos(a) * 96, y = 150 + Math.sin(a) * 96; s += i % 2 ? P.leaf(x, y, 30, a * 180 / Math.PI + 90, '#9fb39a', '#c9d6bf') : P.flower(x, y, 22, '#f2a7b4', '#fbe0e4', '#d9a95c', 6, i * 20); }
      return s;
    },
  },
  card: { bg: '#fffaf7', ink: '#c98a99', line: '#c9a063', hero: (W) => P.flower(W / 2 - 34, 120, 58, '#f2a7b4', '#fde4e8', '#d9a95c', 8) + P.flower(W / 2 + 48, 150, 38, '#f7c3a5', '#fff0e3', '#d9a95c', 7, 15) + P.leaf(W / 2 + 4, 176, 54, 70, '#9fb39a', '#d6e0cf') },
  back: () => P.leaf(590, 210, 110, -140, '#9fb39a', '#d6e0cf') + P.leaf(640, 190, 90, -60, '#b7c7ad', '#e2eadb') + P.flower(610, 160, 64, '#f2a7b4', '#fde4e8', '#d9a95c', 8, 10) + P.flower(660, 245, 38, '#d8b4e2', '#f4e8f8', '#d9a95c', 7) + P.candle(612, 430, 44, 190, '#fff6ec', '#ead8c4') + P.candle(668, 480, 34, 140, '#f8d9d4', '#e3b6af'),
  front: () => P.leaf(60, 760, 110, -30, '#9fb39a', '#d6e0cf') + P.leaf(150, 820, 100, -110, '#b7c7ad', '#e2eadb') + P.flower(120, 770, 76, '#f2a7b4', '#fde4e8', '#d9a95c', 9) + P.flower(230, 812, 46, '#f7c3a5', '#fff0e3', '#d9a95c', 7, 12) + P.flower(58, 690, 34, '#d8b4e2', '#f4e8f8', '#d9a95c', 7) + P.ring(600, 790, 40, '#f5dfa9', '#b5883e', '#ffe3ea', '#f19bb0', 12) + P.bow(520, 40, .6, '#f3b1bf', '#d77f95', 12) + P.sphere(668, 700, 13, '#fff', '#f3ebe3', '#cbbcae') + P.sphere(690, 735, 9, '#fff', '#f3ebe3', '#cbbcae'),
};

T['03-aniversario-infantil'] = {
  bg: { a: ['#58b8ef', '#2d93d6', '#8fd3f5'], b: ['#fff4cc', '#ffe28a', '#fffbea'] },
  frame: '#ff4b3e',
  screen: {
    bg1: '#fffbea', bg2: '#fff1b8', ink: '#1f4f8f', accent: '#ff4b3e', chip: '#e6f6c7', button: '#7ccf2b', buttonInk: '#ffffff',
    hero: (W) => `<rect width="${W}" height="292" fill="#8fd3f5"/>${P.cloud(70, 236, 150, '#ffffff', '#e2f3fd')}${P.cloud(240, 252, 130, '#ffffff', '#e2f3fd')}
      ${P.balloon(110, 110, 38, '#ff9a8f', '#ff4b3e', '#c2261b', '#ffffffcc', 70)}${P.balloon(190, 90, 34, '#fff08a', '#ffd23f', '#e0a700', '#ffffffcc', 70)}${P.balloon(150, 150, 30, '#c8f27a', '#7ccf2b', '#4b9a12', '#ffffffcc', 60)}
      ${P.star(48, 50, 14, '#fff08a', '#ffbf1f', 10)}${P.star(262, 170, 11, '#fff08a', '#ffbf1f', -12)}`,
  },
  card: { bg: '#ff4b3e', ink: '#fff4d6', line: '#ffd23f', hero: (W) => P.star(W / 2, 120, 64, '#fff08a', '#ffbf1f', 8) },
  back: () => P.cloud(115, 115, 190, '#ffffff', '#d9effc') + P.balloon(600, 140, 72, '#ff9a8f', '#ff4b3e', '#c2261b', '#ffffffcc', 160) + P.balloon(668, 305, 54, '#fff08a', '#ffd23f', '#e0a700', '#ffffffcc', 140) + P.balloon(548, 290, 46, '#c8f27a', '#7ccf2b', '#4b9a12', '#ffffffcc', 120),
  front: () => P.cube(40, 690, 52, '#ffe066', '#ffbf1f', '#e09d00') + P.cube(140, 730, 46, '#a6e85c', '#7ccf2b', '#4b9a12') + P.cube(80, 610, 44, '#ff8c80', '#ff4b3e', '#c2261b') + P.teddy(600, 700, .95, '#ffd9a8', '#e8a865', '#b97538', '#fff1dc') + P.star(122, 250, 40, '#fff08a', '#ffbf1f', -12) + P.star(668, 560, 24, '#ffffff', '#cfeaff', 14),
};

T['04-cha-de-bebe'] = {
  bg: { a: ['#dcefe6', '#c4e3d6', '#f1f8f4'], b: ['#5d6d82', '#3f4c5e', '#7c8ba0'] },
  frame: '#f4efe4',
  screen: {
    bg1: '#fbf8f1', bg2: '#eef3ef', ink: '#6f8296', accent: '#a9cfe8', chip: '#e3f1ea', button: '#a9cfe8', buttonInk: '#ffffff',
    hero: (W) => `<rect width="${W}" height="292" fill="#cfe5f3"/>${P.moon(214, 92, 50, '#fff7d6', '#f1dc9a')}${P.star(80, 70, 10, '#fff7d6', '#f1dc9a')}${P.star(120, 130, 7, '#fff7d6', '#f1dc9a')}${P.star(270, 180, 8, '#fff7d6', '#f1dc9a')}
      ${P.cloud(90, 250, 170, '#ffffff', '#e9f2f7')}${P.cloud(236, 262, 120, '#ffffff', '#e9f2f7')}${P.teddy(150, 190, .42, '#f6ead8', '#e2cfb3', '#bfa685', '#fff8ec', '#6f6258')}`,
  },
  card: { bg: '#fbf8f1', ink: '#a8b8c6', line: '#bfe0d1', hero: (W) => P.moon(W / 2 + 10, 116, 64, '#fff7d6', '#f1dc9a') + P.star(W / 2 - 64, 76, 12, '#bfe0d1', '#9fcdb8') + P.star(W / 2 + 70, 176, 9, '#bfe0d1', '#9fcdb8') },
  back: () => P.moon(605, 165, 74, '#fff7d6', '#ecd68f') + P.star(500, 56, 16, '#fff7d6', '#ecd68f', 8) + P.star(676, 300, 12, '#fff7d6', '#ecd68f') + P.rattle(108, 200, .9, -28, '#a9cfe8', '#7aa9c9', '#f4efe4', '#bfe0d1') + P.star(60, 110, 12, '#ffffff', '#dfe7ec', 10),
  front: () => P.cloud(140, 780, 250, '#ffffff', '#e6eef2') + P.teddy(594, 700, .95, '#f6ead8', '#e2cfb3', '#bfa685', '#fff8ec', '#6f6258') + P.bootie(300, 806, .62, '#bfe0d1', '#93c4ae', '#f4efe4') + P.bootie(395, 818, .62, '#bfe0d1', '#93c4ae', '#f4efe4', false),
};

T['05-cha-revelacao'] = {
  bg: { a: ['#1e1538', '#120c24', '#2f2257'], b: ['#fff6ec', '#fde6d6', '#ffffff'] },
  frame: '#121018',
  screen: {
    bg1: '#2a1f4f', bg2: '#16102c', ink: '#f7f2ff', accent: '#ffd23f', chip: '#3a2d68', button: 'url(#none)', buttonInk: '#1e1538',
    hero: (W) => `<defs><linearGradient id="hx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4f9a"/><stop offset="1" stop-color="#2fa7ff"/></linearGradient></defs>
      <circle cx="${W / 2}" cy="160" r="86" fill="url(#hx)"/><circle cx="${W / 2}" cy="160" r="102" fill="none" stroke="#ffd23f" stroke-width="2" stroke-dasharray="3 9"/>
      ${P.confetti(10, 30, W - 20, 250, 46, ['#ff4f9a', '#2fa7ff', '#ffd23f', '#7be0c3', '#ffffff'], 7, 5, 12)}
      ${P.gift(W / 2, 192, 92, '#ffffff', '#d9d3ee', '#ffffff', '#ffd23f', true)}`,
  },
  card: { bg: '#ffd23f', ink: '#1e1538', line: '#1e1538', hero: (W) => P.balloon(W / 2 - 40, 108, 46, '#ff9cc6', '#ff4f9a', '#c41f69', '#1e153888', 60) + P.balloon(W / 2 + 40, 118, 46, '#9fd8ff', '#2fa7ff', '#0b6fc0', '#1e153888', 60) },
  back: () => P.balloon(118, 120, 62, '#ff9cc6', '#ff4f9a', '#c41f69', '#ffffff88', 150) + P.balloon(612, 140, 66, '#9fd8ff', '#2fa7ff', '#0b6fc0', '#ffffff88', 150) + P.confetti(520, 230, 180, 330, 34, ['#ff4f9a', '#2fa7ff', '#ffd23f', '#7be0c3', '#ffffff'], 21),
  front: () => P.confetti(450, 470, 250, 220, 40, ['#ff4f9a', '#2fa7ff', '#ffd23f', '#7be0c3', '#ffffff'], 99) + P.gift(588, 760, 160, '#ff4f9a', '#c41f69', '#ff9cc6', '#ffd23f', true) + P.cake(122, 760, 170, '#fff6ec', '#e8d9c8', '#ffffff', '#ffd23f', '#ff4f9a', '#2fa7ff', '#00000033') + P.confetti(20, 560, 200, 90, 18, ['#ff4f9a', '#2fa7ff', '#ffd23f', '#ffffff'], 5),
};
// botão com gradiente no tema 5
T['05-cha-revelacao'].screen.button = '#ffd23f';

// ---------- montagem ----------
function stageHTML(t) {
  const S = (inner) => `<svg width="700" height="860" viewBox="0 0 700 860" style="position:absolute;left:0;top:0;overflow:visible" xmlns="http://www.w3.org/2000/svg"><defs><filter id="sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#000" flood-opacity=".22"/></filter></defs><g filter="url(#sh)">${inner}</g></svg>`;
  return `<div class="stage">
    <div class="glow"></div>
    ${S(t.back())}
    <div class="card">${cardSVG(t)}</div>
    <div class="phone" style="background:${t.frame}"><div class="screen">${screenSVG(t)}</div><div class="island"></div></div>
    ${S(t.front())}
  </div>`;
}

function page(t, variant, fmt) {
  const [c1, c2, c3] = t.bg[variant];
  const W = 1080, H = fmt === 'story' ? 1920 : 1080;
  // post: produto à direita, coluna esquerda livre p/ texto. story: área de texto entre 20% e ~36%, produto no meio, 15% inferior livre.
  const place = fmt === 'story'
    ? `left:${(W - 700) / 2}px; top:${H * .2 + 340}px; transform:scale(1); transform-origin:top left;`
    : `left:${W - 700 * .88 - 34}px; top:${(H - 860 * .88) / 2 + 8}px; transform:scale(.88); transform-origin:top left;`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{width:${W}px;height:${H}px;overflow:hidden;background:radial-gradient(120% 90% at 70% 55%, ${c3} 0%, ${c1} 45%, ${c2} 100%)}
    .stage{position:absolute;width:700px;height:860px;${place}}
    .glow{position:absolute;left:60px;top:120px;width:580px;height:620px;border-radius:50%;background:radial-gradient(closest-side, ${c3}cc, transparent);filter:blur(10px)}
    .card{position:absolute;left:28px;top:300px;width:290px;height:400px;transform:rotate(-10deg);border-radius:20px;box-shadow:0 30px 50px -18px rgba(0,0,0,.38),0 8px 18px rgba(0,0,0,.12);overflow:hidden}
    .phone{position:absolute;left:200px;top:70px;width:330px;height:690px;border-radius:56px;padding:12px;
      transform:perspective(1800px) rotateY(-16deg) rotateX(5deg) rotateZ(1.5deg);
      box-shadow:inset 0 0 0 2px rgba(255,255,255,.25), inset 0 0 0 5px rgba(0,0,0,.25), 40px 60px 70px -30px rgba(0,0,0,.45), 0 20px 30px -10px rgba(0,0,0,.2)}
    .screen{width:306px;height:666px;border-radius:44px;overflow:hidden;position:relative}
    .screen:after{content:"";position:absolute;inset:0;background:linear-gradient(115deg, rgba(255,255,255,.22) 0%, rgba(255,255,255,0) 38%);pointer-events:none}
    .island{position:absolute;left:50%;top:24px;width:92px;height:26px;margin-left:-46px;border-radius:13px;background:#0b0b0e}
  </style></head><body>${stageHTML(t)}</body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const pg = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [name, t] of Object.entries(T)) {
    const jobs = [
      ['post', 'a', `${name}_post_1080x1080.png`, 1080],
      ['post', 'b', `${name}_post-alternativo_1080x1080.png`, 1080],
      ['story', 'a', `${name}_story_1080x1920.png`, 1920],
    ];
    for (const [fmt, v, file, h] of jobs) {
      await pg.setViewportSize({ width: 1080, height: h });
      await pg.setContent(page(t, v, fmt), { waitUntil: 'load' });
      await pg.screenshot({ path: path.join(OUT, file), clip: { x: 0, y: 0, width: 1080, height: h } });
      console.log(file);
    }
  }
  await browser.close();
})();
