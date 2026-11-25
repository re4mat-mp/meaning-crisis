// kit.mjs: el kit de dibujo de los ocho tramos y del arco de la portada.
// Trazo grueso de tinta, rellenos planos, sombra dura sin desenfoque, trama de puntos.
// REDONDO = un modelo (el agente que lee el glosario). CUADRADO = código. Ni redondo ni cuadrado = una persona.
// Cada SVG anima sólo con CSS @keyframes adentro: sin scripts, sin nada externo, sirve como <img> en un README.
// Regla de los loops: el cuadro 0 % es el dibujo terminado (GitHub muestra ese cuadro quieto a quien pide menos
// movimiento, y la página lo usa como foto quieta de la tarjeta hasta el hover).

export const INK = '#15171C', PAPER = '#FFFFFF', PALE = '#E7E9ED', GREY = '#D3D7DD', MID = '#8C929C',
  INK2 = '#3D424C', INK3 = '#5F6672', ACC = '#6A4CF5', ACC_L = '#DCD4FF', WOOD = '#A97C4F', SKIN = '#F1DCC6',
  SHADOW = 'rgba(21,23,28,.15)';
export const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,Roboto,sans-serif";
export const MONO = "ui-monospace,'SF Mono',Menlo,Consolas,monospace";
export const W = 800, H = 360;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export { esc };

// ---- animation: one prefix per drawing, so 14 drawings inlined in one page never share a class or a keyframe ----
export function anim(P, D) {
  let n = 0;
  const css = [];
  // frames: [[pct or [pcts], 'decls'], ...]  ->  returns a class name to put on a <g>
  function k(frames, o = {}) {
    const name = `${P}${(n++).toString(36)}`;
    const body = frames.map(([p, d]) => `${[].concat(p).map(x => x + '%').join(',')}{${d}}`).join('');
    css.push(`@keyframes ${name}{${body}}`);
    css.push(`.${P} .${name}{animation:${name} ${o.d || D}s ${o.ease || 'ease-in-out'} infinite${o.delay ? ` ${o.delay}s` : ''}` +
      `${o.origin ? `;transform-box:fill-box;transform-origin:${o.origin}` : ''}}`);
    return name;
  }
  // shared ambient loops: they repeat inside the drawing's duration so the whole drawing loops cleanly
  const blink = k([[[0, 90, 96, 100], 'transform:scaleY(1)'], [93, 'transform:scaleY(.12)']], { d: D, origin: 'center' });
  const blink2 = k([[[0, 40, 46, 100], 'transform:scaleY(1)'], [43, 'transform:scaleY(.12)']], { d: D, origin: 'center' });
  const bob = k([[[0, 50, 100], 'transform:translateY(0)'], [25, 'transform:translateY(-2px)'], [75, 'transform:translateY(1px)']], { d: D / Math.max(1, Math.round(D / 2)) });
  const bob2 = k([[[0, 50, 100], 'transform:translateY(0)'], [25, 'transform:translateY(1px)'], [75, 'transform:translateY(-2px)']], { d: D / Math.max(1, Math.round(D / 2)) });
  // opacity helpers: visible during [a,b] percent windows (with a short fade), hidden otherwise
  function show(wins, o = {}) {
    const f = o.fade ?? 1.5, fr = [];
    const on = x => wins.some(([a, b]) => x >= a && x <= b);
    const pts = new Set([0, 100]);
    wins.forEach(([a, b]) => { pts.add(a); pts.add(b); pts.add(Math.max(0, a - f)); pts.add(Math.min(100, b + f)); });
    [...pts].sort((a, b) => a - b).forEach(p => fr.push([+p.toFixed(2), `opacity:${on(p) ? 1 : 0}`]));
    return k(fr, { ease: 'linear' });
  }
  // a path of translate keyframes: [[pct, x, y, extra?], ...]
  function move(pts, o = {}) {
    return k(pts.map(([p, x, y, extra]) => [p, `transform:translate(${x}px,${y}px)${extra ? ' ' + extra : ''}`]), o);
  }
  return { k, show, move, css, blink, blink2, bob, bob2 };
}

// ---- the frame of every drawing ----
export function svgDoc({ P, D, title, regla, body, css }) {
  const style = `.${P} text{font-family:${SANS}}.${P} .m{font-family:${MONO}}` + css.join('') +
    `@media (prefers-reduced-motion:reduce){.${P} *{animation:none!important}}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${P}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="${P}-t" data-regla="${regla}" data-dur="${D}">` +
    `<title id="${P}-t">${esc(title)}</title><style>${style}</style>` +
    `<defs><pattern id="${P}-dots" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="3.5" cy="3.5" r="1.1" fill="${INK}" fill-opacity=".09"/></pattern></defs>` +
    `<rect width="${W}" height="${H}" fill="${PAPER}"/><rect width="${W}" height="${H}" fill="url(#${P}-dots)"/>` +
    `<g transform="translate(20,16)"><rect width="${regla.length * 9 + 18}" height="24" rx="5" fill="${ACC_L}" stroke="${INK}" stroke-width="2"/>` +
    `<text class="m" x="${(regla.length * 9 + 18) / 2}" y="17" text-anchor="middle" font-size="14" font-weight="800" fill="${INK}">${esc(regla)}</text></g>` +
    body + `</svg>`;
}

// ---- small things ----
export const T = (x, y, s, o = {}) =>
  `<text ${o.mono ? 'class="m" ' : ''}x="${x}" y="${y}" font-size="${o.size || 16}" font-weight="${o.w || 800}"${o.anchor !== 'start' ? ` text-anchor="${o.anchor || 'middle'}"` : ''} fill="${o.fill || INK}"${o.italic ? ' font-style="italic"' : ''}>${esc(s)}</text>`;

// a mono label: centred on x, top at y
export function tag(x, y, s, o = {}) {
  const size = o.size || 15, w = o.w || Math.round(s.length * size * 0.61 + 18), h = Math.round(size * 1.6);
  return `<g transform="translate(${x - w / 2},${y})"><rect width="${w}" height="${h}" rx="5" fill="${o.fill || PAPER}" stroke="${INK}" stroke-width="2"/>` +
    `<text class="m" x="${w / 2}" y="${Math.round(h / 2 + size * 0.36)}" text-anchor="middle" font-size="${size}" font-weight="800" fill="${o.color || INK}">${esc(s)}</text></g>`;
}
// an italic pill sticker, the accent when acc=true
export function sticker(x, y, s, o = {}) {
  const size = o.size || 18, w = Math.round(s.length * size * 0.56 + 30), h = Math.round(size * 1.9);
  const fill = o.acc ? ACC : PAPER, col = o.acc ? '#fff' : INK;
  return `<g transform="translate(${x},${y}) rotate(${o.rot ?? -4})"><rect x="${-w / 2 + 3}" y="${-h / 2 + 3}" width="${w}" height="${h}" rx="${h / 2}" fill="${INK}"/>` +
    `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="${INK}" stroke-width="2.6"/>` +
    `<text x="0" y="${Math.round(size * 0.36)}" text-anchor="middle" font-size="${size}" font-weight="900" font-style="italic" fill="${col}">${esc(s)}</text></g>`;
}
export const check = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><circle r="13" fill="${INK}"/><path d="M-6,0 l4,4.5 l8,-9" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
export const cross = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><circle r="13" fill="#fff" stroke="${INK}" stroke-width="2.6"/><path d="M-5.5,-5.5 l11,11 M5.5,-5.5 l-11,11" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/></g>`;
// a card with a hard shadow
export const card = (x, y, w, h, o = {}) =>
  `<rect x="${x + 5}" y="${y + 5}" width="${w}" height="${h}" rx="${o.r ?? 12}" fill="${INK}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 12}" fill="${o.fill || PAPER}" stroke="${INK}" stroke-width="2.5"/>`;
// ---- the characters ----
const st = (w = 2.6) => `stroke="${INK}" stroke-width="${w}"`;

// ROUND: the AI agent. hat letters on the helmet ("IA"). arms: 'down' | 'up' | 'hold' (right hand forward)
export function agente(x, y, o = {}) {
  const s = o.s || 1.5, a = o.a || {};
  const arms = o.arms === 'up' ? `<path d="M-13,2 l-9,-14 M13,2 l9,-14" ${st(2.6)} stroke-linecap="round"/>`
    : o.arms === 'hold' ? `<path d="M-13,5 q-6,6 -3,12 M13,4 q9,1 13,-5" ${st(2.4)} fill="none" stroke-linecap="round"/>`
      : `<path d="M-13,5 q-6,6 -3,12 M13,5 q6,6 3,12" ${st(2.4)} fill="none" stroke-linecap="round"/>`;
  const mouth = o.mouth === 'o' ? `<circle cx="0" cy="1" r="1.8" fill="${INK}"/>` : o.mouth === 'happy' ? `<path d="M-4,0 q4,5 8,0" fill="${MID}" ${st(1.6)}/>` : `<path d="M-3,0 q3,3 6,0" fill="none" ${st(1.6)}/>`;
  return `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="34" rx="15" ry="4" fill="${SHADOW}"/>` +
    `<path d="M-6,22 l-2,12 M6,22 l2,12" ${st(3)} stroke-linecap="round"/><g class="${a.bob || ''}">` +
    `<ellipse cx="0" cy="6" rx="17" ry="18" fill="#fff" ${st(2.6)}/>` +
    `<g class="${a.blink || ''}"><circle cx="-4" cy="-6" r="2.3" fill="${INK}"/><circle cx="4" cy="-6" r="2.3" fill="${INK}"/></g>${mouth}` +
    `<path d="M-16,-6 a16,15 0 0 1 32,0 z" fill="${INK}" ${st(2.4)}/><rect x="-19" y="-8" width="38" height="5" rx="2.5" fill="${INK}"/>` +
    `<text x="0" y="-11" text-anchor="middle" font-size="9" font-weight="900" fill="#fff">${esc(o.hat || 'IA')}</text>` +
    arms + (o.extra || '') + `</g></g>`;
}
// a person. arm: 'down' | 'up' (waves / cheers) | 'point' (right arm forward)
export function persona(x, y, o = {}) {
  const s = o.s || 1.3, a = o.a || {};
  const armR = o.arm === 'up' ? `<path d="M13,10 l10,-14" ${st(3)} stroke-linecap="round"/>`
    : o.arm === 'point' ? `<path d="M13,10 q8,-2 16,-8" ${st(3)} fill="none" stroke-linecap="round"/>`
      : o.arm === 'hold' ? `<path d="M13,10 q9,4 14,0" ${st(3)} fill="none" stroke-linecap="round"/>`
        : `<path d="M13,10 q7,8 2,14" ${st(3)} fill="none" stroke-linecap="round"/>`;
  const armL = o.arm2 === 'up' ? `<path d="M-13,10 l-10,-14" ${st(3)} stroke-linecap="round"/>` : `<path d="M-13,10 q-7,8 -2,14" ${st(3)} fill="none" stroke-linecap="round"/>`;
  const hair = o.bald ? `<path d="M-13,-9 q-2,-6 2,-8 M13,-9 q2,-6 -2,-8" ${st(2.4)} fill="none" stroke-linecap="round"/>`
    : o.hair === 'long' ? `<path d="M-14,-10 q-1,-17 14,-16 q15,0 14,16 q0,10 -2,14 q-2,-14 -10,-20 q-6,5 -14,6 q-1,6 -2,14 q-2,-6 0,-14 z" fill="${INK}"/>`
      : `<path d="M-13,-14 q2,-14 14,-13 q12,0 12,12 q-8,-6 -14,-6 q-6,1 -12,7 z" fill="${INK}"/>`;
  const mouth = o.mouth === 'o' ? `<ellipse cx="0" cy="-4" rx="2.4" ry="3" fill="${INK}"/>` : `<path d="M-3,-5 q3,3 6,0" fill="none" ${st(1.6)}/>`;
  return `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="44" rx="17" ry="4" fill="${SHADOW}"/>` +
    `<path d="M-6,26 l-2,18 M6,26 l2,18" ${st(3.6)} stroke-linecap="round"/><g class="${a.bob || ''}">` +
    `<path d="M-15,28 q0,-26 15,-26 q15,0 15,26 z" fill="${o.body || MID}" ${st(2.6)}/>` +
    (o.armLAnim || armL) + (o.armAnim || armR) +
    `<circle cx="0" cy="-12" r="13" fill="${SKIN}" ${st(2.6)}/>` + hair +
    (o.closed ? `<path d="M-7,-11 q2.5,2 5,0 M2,-11 q2.5,2 5,0" fill="none" ${st(1.8)} stroke-linecap="round"/>`
      : `<g class="${a.blink || ''}"><circle cx="-4.5" cy="-11" r="1.9" fill="${INK}"/><circle cx="4.5" cy="-11" r="1.9" fill="${INK}"/></g>`) +
    (o.beard ? `<path d="M-11,-8 q1,14 11,14 q10,0 11,-14 q-4,5 -11,5 q-7,0 -11,-5 z" fill="${o.beard === true ? MID : o.beard}" ${st(2)}/>` : mouth) +
    (o.extra || '') + `</g></g>`;
}
