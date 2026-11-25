// dibujar.mjs: escribe readme/temas/01.svg … 08.svg (un dibujo animado por tramo) y readme/arco.svg (la portada).
// Uso: node readme/dibujar.mjs   (armar.mjs también lo llama)
// Cada dibujo cuenta la idea de UN tramo del arco de mapa.md. Las palabras del dibujo son cortas y salen de mapa.md y
// del glosario; si cambia el mapa, revisar su dibujo. TRAMOS (abajo) dice qué etapas de mapa.md junta cada tramo.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INK, PAPER, PALE, GREY, MID, INK2, INK3, ACC, ACC_L, WOOD, SHADOW, SANS, MONO,
  anim, svgDoc, T, tag, sticker, check, cross, card, agente, persona, esc
} from './kit.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const g = (cls, inner, tr) => `<g${tr ? ` transform="${tr}"` : ''}${cls ? ` class="${cls}"` : ''}>${inner}</g>`;
const at = (x, y, inner) => `<g transform="translate(${x},${y})">${inner}</g>`;
const arrow = (d, o = {}) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${o.w || 2.6}" stroke-linecap="round" stroke-linejoin="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}${o.cls ? ` class="${o.cls}"` : ''}/>`;
const head = (x, y, ang) => `<path transform="translate(${x},${y}) rotate(${ang})" d="M-10,-6 L0,0 L-10,6" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
const bubble = (x, y, w, h, inner, o = {}) => at(x, y, `<rect x="4" y="4" width="${w}" height="${h}" rx="12" fill="${INK}"/><rect width="${w}" height="${h}" rx="12" fill="#fff" stroke="${INK}" stroke-width="2.5"/>` +
  `<path d="M${o.tail ?? 30},${h - 1} l${o.dir === 'r' ? 14 : -6},16 l${o.dir === 'r' ? 4 : 18},-16" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><path d="M${(o.tail ?? 30) + 2},${h - 1.5} h${o.dir === 'r' ? 16 : 12}" stroke="#fff" stroke-width="4"/>` + inner);

// ------------------------------------------------------------------------------------------------------------
// 01 · Orígenes + Grecia: la caverna. Uno mira sombras; otro sube los escalones hacia el sol (anagoge)
function t01(P) {
  const D = 9, a = anim(P, D);
  // climber: finished at the top (720,104); starts outside the cave mouth
  const steps = [[-380, 168], [-322, 140], [-270, 112], [-218, 84], [-166, 56], [-114, 28], [-62, 0], [0, 0]];
  const pts = [[0, 0, 0], [12, 0, 0], [15, 0, 0], [15.1, ...steps[0]], [20, ...steps[0]]];
  steps.slice(1).forEach(([x, y], i) => pts.push([20 + (i + 1) * 6.6, x, y]));
  pts.push([100, 0, 0]);
  const climb = a.move(pts);
  const vis = a.show([[0, 12], [17, 100]]);
  const hop = a.k([[[0, 20, 26.6, 33.2, 39.8, 46.4, 53, 59.6, 66.2, 100], 'transform:translateY(0)'], [[23.3, 29.9, 36.5, 43.1, 49.7, 56.3, 62.9], 'transform:translateY(-7px)']]);
  const up = a.show([[0, 12], [68, 100]], { fade: .6 }), down = a.show([[13, 67]], { fade: .6 });
  const flame = a.k([[[0, 50, 100], 'transform:scaleY(1)'], [25, 'transform:scaleY(.82)'], [75, 'transform:scaleY(1.1)']], { d: D / 6, origin: 'bottom' });
  const sway = a.k([[[0, 50, 100], 'transform:translateX(0)'], [25, 'transform:translateX(-4px)'], [75, 'transform:translateX(3px)']], { d: D / 6 });
  const rays = a.k([[0, 'transform:rotate(0deg)'], [100, 'transform:rotate(45deg)']], { ease: 'linear', origin: 'center' });
  let rayP = '';
  for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4, c = Math.cos(an), s = Math.sin(an); rayP += `M${(c * 36).toFixed(1)},${(s * 36).toFixed(1)} L${(c * 48).toFixed(1)},${(s * 48).toFixed(1)} `; }
  const body =
    // the cave
    `<rect x="12" y="46" width="372" height="282" rx="40" fill="${INK}"/><rect x="6" y="40" width="372" height="282" rx="40" fill="${GREY}" stroke="${INK}" stroke-width="2.6"/>` +
    `<rect x="24" y="58" width="336" height="270" rx="26" fill="${PALE}" stroke="${INK}" stroke-width="2.4"/>` +
    `<rect x="340" y="206" width="50" height="130" fill="${PAPER}"/><rect x="340" y="206" width="50" height="130" fill="url(#${P}-dots)"/>` +
    `<path d="M338,206 H380" stroke="${INK}" stroke-width="2.6"/><path d="M0,322 H800" stroke="${INK}" stroke-width="2.6" opacity=".25"/>` +
    // shadows on the back wall
    g(sway, `<circle cx="74" cy="142" r="15" fill="${MID}"/><path d="M52,214 q0,-50 22,-50 q22,0 22,50 z" fill="${MID}"/>` +
      `<path d="M112,112 q14,-14 26,0 q12,-14 26,0 q-13,-6 -26,8 q-13,-14 -26,-8 z" fill="${MID}"/>`) +
    tag(98, 236, 'sombras', { size: 14 }) +
    persona(196, 262, { s: 1.05, a: { blink: a.blink, bob: a.bob } }) + tag(196, 316 - 2, 'mirar', { size: 13 }) +
    // the fire
    at(290, 300, `<path d="M-22,8 L22,-2 M-22,-2 L22,8" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M-22,8 L22,-2 M-22,-2 L22,8" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/>` +
      g(flame, `<path d="M0,-2 q-18,-10 -10,-30 q4,10 8,8 q-4,-18 10,-30 q2,16 10,22 q8,14 -6,30 z" fill="#fff" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`)) +
    // the steps up and out
    `<path d="M378,322 V294 H430 V266 H482 V238 H534 V210 H586 V182 H638 V154 H790 V322 Z" fill="${INK}" transform="translate(5,5)"/>` +
    `<path d="M378,322 V294 H430 V266 H482 V238 H534 V210 H586 V182 H638 V154 H790 V322 Z" fill="${PALE}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>` +
    // the sun
    at(722, 62, g(rays, `<path d="${rayP}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`) + `<circle r="27" fill="#fff" stroke="${INK}" stroke-width="2.8"/>`) +
    // the climber
    g(vis, g(climb, g(hop, g(up, persona(720, 110, { s: 1, arm: 'up', arm2: 'up', a: { blink: a.blink2 } })) +
      g(down, persona(720, 110, { s: 1, arm: 'hold', a: { blink: a.blink2 } }))))) +
    tag(720, 172, 'subir', { size: 14 }) +
    sticker(520, 76, 'anagoge', { size: 22, acc: true, rot: -5 });
  return { D, body, css: a.css, title: 'La caverna: una persona mira las sombras en la pared, junto al fuego; otra sube los escalones hacia el sol y festeja arriba. La anagoge: subir es transformarte y ver más real el mundo.' };
}

// ------------------------------------------------------------------------------------------------------------
// 02 · India y la mente: el bucle del autoengaño (parasitic processing) y la atención que lo afloja (sati)
function t02(P) {
  const D = 8, a = anim(P, D);
  let sp = '';
  for (let th = 0; th <= 5.2 * Math.PI; th += 0.2) { const r = 16 + 4.6 * th; sp += `${sp ? 'L' : 'M'}${(Math.cos(th) * r).toFixed(1)},${(Math.sin(th) * r * 0.8).toFixed(1)} `; }
  const spin = a.k([[0, 'transform:rotate(0deg)'], [100, 'transform:rotate(-720deg)']], { ease: 'linear', origin: 'center' });
  const dizzy = a.k([[[0, 50, 100], 'transform:rotate(0deg)'], [25, 'transform:rotate(-8deg)'], [75, 'transform:rotate(8deg)']], { d: D / 4, origin: 'center' });
  const breathe = a.k([[[0, 50, 100], 'transform:scale(1)'], [25, 'transform:scale(1.08)'], [75, 'transform:scale(.94)']], { d: D / 2, origin: 'center' });
  const flow = a.k([[0, 'stroke-dashoffset:0'], [100, 'stroke-dashoffset:-96']], { ease: 'linear', d: D / 4 });
  const body =
    // the loop, on the left
    at(190, 186, g(spin, `<path d="${sp}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`)) +
    at(190, 186, g(dizzy, persona(0, -12, { s: 0.82, mouth: 'o', a: { blink: a.blink } }))) +
    tag(190, 296, 'parasitic processing', { size: 14 }) + cross(296, 120) +
    // the practice
    arrow('M340,190 H468', { dash: '10 14', cls: flow, w: 3 }) + head(474, 190, 0) + tag(404, 152, 'práctica', { size: 14 }) +
    // calm, on the right
    `<ellipse cx="600" cy="290" rx="58" ry="14" fill="${INK}" transform="translate(3,4)"/><ellipse cx="600" cy="290" rx="58" ry="14" fill="${PALE}" stroke="${INK}" stroke-width="2.4"/>` +
    persona(600, 230, { s: 1.15, closed: true, a: { bob: a.bob } }) +
    at(600, 212, g(breathe, `<circle r="54" fill="none" stroke="${INK}" stroke-width="2.4" stroke-dasharray="6 7"/>`)) +
    tag(600, 312, 'sati', { size: 15 }) + check(672, 150) +
    sticker(404, 64, 'notar el bucle lo afloja', { size: 19, acc: true, rot: -3 });
  return { D, body, css: a.css, title: 'A la izquierda, una persona mareada dentro de una espiral que gira: el parasitic processing. Una flecha de práctica lleva a la derecha, donde medita tranquila con la atención en un círculo que respira: sati.' };
}

// ------------------------------------------------------------------------------------------------------------
// 03 · Helenismo y cristianismo: los tres órdenes de Agustín, apilados como una casa donde se vive
const ORDENES = [['nomológico', 'un cosmos que encaja'], ['normativo', 'subir a lo más real'], ['narrativo', 'la vida va hacia algo']];
function bloque(i, w = 250) {
  const [n, sub] = ORDENES[i];
  const icon = i === 0 ? `<path d="M22,22 l3,7 l7,1 l-5,5 l1,7 l-6,-3 l-6,3 l1,-7 l-5,-5 l7,-1 z" fill="${INK}"/><circle cx="40" cy="44" r="3" fill="${INK}"/>`
    : i === 1 ? `<path d="M18,50 V14 M36,50 V14 M18,22 H36 M18,32 H36 M18,42 H36" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`
      : `<path d="M14,18 q10,-4 14,2 q4,-6 14,-2 v30 q-10,-4 -14,2 q-4,-6 -14,-2 z M28,20 v30" fill="#fff" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
  return card(0, 0, w, 62, { r: 10 }) + icon +
    `<text class="m" x="62" y="28" font-size="17" font-weight="800" fill="${INK}">${esc(n)}</text>` +
    `<text x="62" y="48" font-size="${w < 240 ? 13 : 14}" font-weight="600" fill="${INK3}">${esc(sub)}</text>`;
}
function t03(P) {
  const D = 9, a = anim(P, D);
  const drop = (t0) => a.move([[0, 0, 0], [8, 0, 0], [8.1, 0, -70], [t0, 0, -70], [t0 + 7, 0, 0], [100, 0, 0]], { ease: 'ease-in' });
  const dv = (t0) => a.show([[0, 7], [t0, 100]], { fade: 1 });
  const pop = a.show([[0, 7], [46, 100]], { fade: 1.5 });
  const wave = a.show([[0, 7], [52, 100]], { fade: .5 }), still = a.show([[8, 51]], { fade: .5 });
  const x0 = 370;
  const body =
    `<path d="M0,316 H800" stroke="${INK}" stroke-width="2.6" opacity=".25"/>` +
    at(x0, 248, g(dv(10), g(drop(10), bloque(0)))) +
    at(x0, 180, g(dv(22), g(drop(22), bloque(1)))) +
    at(x0, 112, g(dv(34), g(drop(34), bloque(2)))) +
    g(pop, g(wave, persona(x0 + 125, 58, { s: 1.05, arm: 'up', a: { blink: a.blink } })) + g(still, persona(x0 + 125, 58, { s: 1.05, a: { blink: a.blink } }))) +
    // Agustín, at the left, points at the house he built
    persona(170, 238, { s: 1.25, bald: true, beard: true, arm: 'point', body: '#fff', a: { blink: a.blink2, bob: a.bob } }) +
    tag(170, 306, 'Agustín', { size: 14 }) +
    sticker(196, 92, 'tres órdenes, mil años', { size: 19, acc: true, rot: -4 }) +
    tag(x0 + 206, 64, 'en casa', { size: 13 });
  return { D, body, css: a.css, title: 'Agustín señala una casa de tres bloques: el orden nomológico (un cosmos que encaja), el normativo (subir a lo más real) y el narrativo (la vida va hacia algo). Arriba, una persona está en casa y saluda.' };
}

// ------------------------------------------------------------------------------------------------------------
// 04 · El colapso moderno: la misma casa se cae; el sentido queda "sólo en la cabeza"
function t04(P) {
  const D = 9, a = anim(P, D);
  const w = 214, x0 = 30;
  // [stacked y, fallen dx, dy, rot]
  const B = [[248, 0, 0, 3], [180, 222, 70, 6], [112, 436, 142, -5]];
  const fall = ([y, dx, dy, r], t1) => a.move([[0, dx, dy, `rotate(${r}deg)`], [8, dx, dy, `rotate(${r}deg)`], [8.1, 0, 0, 'rotate(0deg)'], [38, 0, 0, 'rotate(0deg)'],
    [42, 0, 0, `rotate(${t1 % 2 ? -2 : 2}deg)`], [46, 0, 0, 'rotate(0deg)'], [46 + t1 * 4, 0, 0, 'rotate(0deg)'], [56 + t1 * 4, dx, dy, `rotate(${r}deg)`], [100, dx, dy, `rotate(${r}deg)`]], { origin: 'center' });
  const vis = a.show([[0, 7], [12, 100]], { fade: 1.5 });
  const think = a.show([[0, 7], [70, 100]], { fade: 1.5 });
  const shock = a.show([[0, 7], [62, 100]], { fade: .5 }), calm = a.show([[8, 61]], { fade: .5 });
  const body =
    `<path d="M0,316 H800" stroke="${INK}" stroke-width="2.6" opacity=".25"/>` +
    g(vis, B.map((b, i) => at(x0, b[0], g(fall(b, i), bloque(i, w)))).join('')) +
    g(shock, persona(704, 254, { s: 1.15, mouth: 'o', a: { blink: a.blink } })) + g(calm, persona(704, 254, { s: 1.15, a: { blink: a.blink } })) +
    g(think, bubble(560, 108, 216, 62, `<text class="m" x="108" y="28" text-anchor="middle" font-size="16" font-weight="800" fill="${INK}">el sentido, sólo</text>` +
      `<text class="m" x="108" y="48" text-anchor="middle" font-size="16" font-weight="800" fill="${INK}">en mi cabeza</text>`, { tail: 140 })) +
    tag(250, 330, 'Occam · Galileo · Descartes', { size: 13 }) +
    sticker(400, 62, 'el universo, muerto', { size: 20, acc: true, rot: -4 });
  return { D, body, css: a.css, title: 'La casa de los tres órdenes se tambalea y se cae: Occam, Galileo y Descartes. Al lado, una persona sola piensa que el sentido queda sólo en su cabeza.' };
}

// ------------------------------------------------------------------------------------------------------------
// 05 · Relevance realization: entre todo lo que podrías mirar, la linterna da con lo que importa
function t05(P) {
  const D = 8, a = anim(P, D);
  const cols = 6, rows = 4, ox = 420, oy = 86, dx = 64, dy = 58, tc = 3, tr = 2;
  const tx = ox + tc * dx, ty = oy + tr * dy, fx = 150, fy = 232;
  const base = Math.atan2(ty - fy, tx - fx) * 180 / Math.PI;
  const sweep = a.k([[[0, 10], 'transform:rotate(0deg)'], [22, 'transform:rotate(-20deg)'], [36, 'transform:rotate(12deg)'], [50, 'transform:rotate(-9deg)'], [62, 'transform:rotate(19deg)'], [[74, 100], 'transform:rotate(0deg)']]);
  const lit = a.show([[0, 10], [75, 100]], { fade: 1 });
  let field = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = ox + c * dx + (r % 2 ? 14 : 0), y = oy + r * dy, k = (r * 7 + c * 3) % 3;
    if (r === tr && c === tc) continue;
    if (r === tr - 1 && c >= tc - 1 && c <= tc + 1) continue; // room for the sticker
    field += k === 0 ? `<circle cx="${x}" cy="${y}" r="12" fill="${PALE}" stroke="${INK}" stroke-width="2"/>`
      : k === 1 ? `<rect x="${x - 11}" y="${y - 11}" width="22" height="22" rx="3" fill="${GREY}" stroke="${INK}" stroke-width="2"/>`
        : `<path d="M${x},${y - 13} L${x + 13},${y + 10} H${x - 13} Z" fill="#fff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
  }
  const ttx = tx + (tr % 2 ? 14 : 0);
  const body =
    at(fx, fy, g('', g(sweep, `<path d="M0,0 L640,-44 L640,44 Z" fill="${ACC_L}" opacity=".75"/>`), `rotate(${base.toFixed(1)})`)) +
    field +
    `<circle cx="${ttx}" cy="${ty}" r="14" fill="${PALE}" stroke="${INK}" stroke-width="2.2"/>` +
    g(lit, `<circle cx="${ttx}" cy="${ty}" r="14" fill="${ACC}" stroke="${INK}" stroke-width="2.4"/>` + sticker(ttx + 20, ty - 52, '¡esto importa!', { size: 17, rot: -5 })) +
    persona(108, 232, { s: 1.25, arm: 'point', a: { blink: a.blink, bob: a.bob } }) +
    at(fx - 14, fy - 7, `<rect x="0" y="0" width="18" height="12" rx="3" fill="${INK}" transform="rotate(${base.toFixed(1)} 0 6)"/>`) +
    tag(108, 306, 'relevance realization', { size: 14 }) +
    tag(588, 316, 'combinatorial explosion', { size: 13 });
  return { D, body, css: a.css, title: 'Una persona con una linterna barre un campo lleno de formas (la explosión combinatoria) y la luz se detiene en una sola, la que importa: la relevance realization.' };
}

// ------------------------------------------------------------------------------------------------------------
// 06 · Ingeniería inversa de la iluminación: a cada problema perenne, su práctica
const PARES = [['parasitic processing', 'Óctuple Sendero'], ['modal confusion', 'sati'], ['alienación', 'communitas']];
function t06(P) {
  const D = 9, a = anim(P, D);
  const ys = [92, 172, 252];
  const knot = (cls) => g(cls, `<path d="M-14,0 q0,-14 14,-14 q16,0 14,14 q-2,12 -14,10 q-10,-2 -8,-12 q2,-8 10,-6 q6,2 4,8" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`);
  const spin = a.k([[0, 'transform:rotate(0deg)'], [100, 'transform:rotate(360deg)']], { ease: 'linear', origin: 'center', d: D / 3 });
  const on = [30, 52, 74].map(t => a.show([[0, 6], [t, 100]], { fade: 1.5 }));
  const flow = a.k([[0, 'stroke-dashoffset:0'], [100, 'stroke-dashoffset:-48']], { ease: 'linear', d: D / 6 });
  const body = ys.map((y, i) => at(56, y, knot(spin)) + tag(186, y - 12, PARES[i][0], { size: 14, color: INK2 }) +
    arrow(`M300,${y} H446`, { dash: '6 10', op: .7 }) + g(on[i], arrow(`M300,${y} H446`, { dash: '12 12', cls: flow, w: 3.2 }) + head(452, y, 0)) +
    tag(540, y - 13, PARES[i][1], { size: 15 }) + g(on[i], check(640, y))).join('') +
    persona(720, 244, { s: 1.15, arm: 'hold', a: { blink: a.blink, bob: a.bob } }) +
    at(732, 268, `<rect x="4" y="4" width="46" height="30" rx="4" fill="${INK}"/><rect width="46" height="30" rx="4" fill="${WOOD}" stroke="${INK}" stroke-width="2.4"/><path d="M14,0 v-7 h18 v7" fill="none" stroke="${INK}" stroke-width="2.4"/>`) +
    tag(726, 318, 'ecología', { size: 13 }) +
    T(186, 330, 'problemas perennes', { size: 14, w: 800, fill: INK3 }) + T(540, 330, 'prácticas', { size: 14, w: 800, fill: INK3 }) +
    sticker(390, 36, 'cada problema, su práctica', { size: 18, acc: true, rot: -2 });
  return { D, body, css: a.css, title: 'Tres problemas perennes, cada uno un nudo que gira (parasitic processing, modal confusion, alienación), se conectan uno por uno con su práctica (Óctuple Sendero, sati, communitas). Una persona carga la caja de la ecología de prácticas.' };
}

// ------------------------------------------------------------------------------------------------------------
// 07 · Sabiduría y racionalidad: el palo en el agua parece doblado; con la lupa, está derecho
function t07(P) {
  const D = 8, a = anim(P, D);
  const lens = a.show([[0, 36], [64, 100]], { fade: 2 }), bare = a.show([[38, 62]], { fade: 2 });
  const cx = 556, cy = 250, R = 56;
  const body =
    `<path d="M0,316 H800" stroke="${INK}" stroke-width="2.6" opacity=".25"/>` +
    // the glass of water
    `<path d="M466,122 V300 q0,12 12,12 H634 q12,0 12,-12 V122" fill="none" stroke="${INK}" stroke-width="2.4" transform="translate(5,5)" opacity=".9"/>` +
    `<path d="M466,186 H646 V300 q0,12 -12,12 H478 q-12,0 -12,-12 Z" fill="${PALE}"/>` +
    // the stick: straight above the water, bent below
    `<path d="M500,64 L550,186" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M500,64 L550,186" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M550,186 L566,300" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M550,186 L566,300" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M466,186 H646" stroke="${INK}" stroke-width="2" stroke-dasharray="5 6" opacity=".6"/>` +
    `<path d="M466,122 V300 q0,12 12,12 H634 q12,0 12,-12 V122" fill="none" stroke="${INK}" stroke-width="2.6"/>` +
    // the lens shows it straight
    g(lens, `<defs><clipPath id="${P}-c"><circle cx="${cx}" cy="${cy}" r="${R}"/></clipPath></defs>` +
      `<path d="M${cx + 40},${cy + 40} L${cx + 84},${cy + 84}" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M${cx + 42},${cy + 42} L${cx + 82},${cy + 82}" stroke="${WOOD}" stroke-width="7" stroke-linecap="round"/>` +
      `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${PALE}"/>` +
      `<g clip-path="url(#${P}-c)"><path d="M466,186 H646" stroke="${INK}" stroke-width="2" stroke-dasharray="5 6" opacity=".6"/><path d="M550,186 L597,300" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M550,186 L597,300" stroke="${WOOD}" stroke-width="5" stroke-linecap="round"/></g>` +
      `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${INK}" stroke-width="4"/>` + check(cx + 50, cy - 50) + tag(704, 128, 'está derecho', { size: 14 })) +
    g(bare, tag(704, 128, 'parece doblado', { size: 14 })) +
    // the one who looks
    g(lens, persona(330, 236, { s: 1.3, arm: 'point', a: { blink: a.blink, bob: a.bob } })) +
    g(bare, persona(330, 236, { s: 1.3, mouth: 'o', a: { blink: a.blink, bob: a.bob } })) +
    sticker(220, 82, 'ver a través de la ilusión', { size: 19, acc: true, rot: -4 });
  return { D, body, css: a.css, title: 'Un palo en un vaso de agua parece doblado. La persona mira con una lupa y lo ve derecho: sabiduría es ver a través de la ilusión.' };
}

// ------------------------------------------------------------------------------------------------------------
// 08 · Los profetas: cinco voces con quienes dialogar, de a una
const PROFETAS = ['Heidegger', 'Corbin', 'Jung', 'Tillich', 'Barfield'];
function t08(P) {
  const D = 10, a = anim(P, D);
  const xs = [96, 248, 400, 552, 704];
  const talk = [[0, 16], [20, 36], [40, 56], [60, 76], [80, 96]].map(w => a.show([w], { fade: 1.5 }));
  const looks = ['', 'long', '', '', 'long'];
  const body =
    `<path d="M0,316 H800" stroke="${INK}" stroke-width="2.6" opacity=".25"/>` +
    xs.map((x, i) => persona(x, 156, { s: 0.92, hair: looks[i], bald: i === 2, beard: i === 2 || i === 3 ? true : false, body: i % 2 ? '#fff' : MID, a: { blink: i % 2 ? a.blink : a.blink2, bob: i % 2 ? a.bob : a.bob2 } }) +
      tag(x, 202, PROFETAS[i], { size: 13 }) +
      g(talk[i], bubble(x - 38, 54, 76, 40, `<circle cx="22" cy="20" r="4.5" fill="${INK}"/><circle cx="38" cy="20" r="4.5" fill="${INK}"/><circle cx="54" cy="20" r="4.5" fill="${INK}"/>`, { tail: 32 }))).join('') +
    // you, in front, listening
    persona(400, 258, { s: 1.05, arm: 'hold', a: { blink: a.blink } }) + tag(400, 312, 'vos', { size: 14 }) +
    sticker(150, 270, 'dialogar', { size: 20, acc: true, rot: -4 });
  return { D, body, css: a.css, title: 'Cinco profetas en fila (Heidegger, Corbin, Jung, Tillich y Barfield) hablan de a uno; adelante, vos escuchás. Son voces para dialogar.' };
}

// ------------------------------------------------------------------------------------------------------------
// Los ocho tramos: qué etapas de mapa.md junta cada uno (los nombres deben coincidir con la columna "Etapa"),
// su título si junta más de una, y la idea del dibujo en una línea.
export const TRAMOS = [
  { etapas: ['Orígenes', 'Grecia'], titulo: 'Del chamán a la caverna', idea: 'subir es transformarte y ver más real el mundo', fn: t01 },
  { etapas: ['India y la mente'], idea: 'notar el bucle del autoengaño lo afloja', fn: t02 },
  { etapas: ['Helenismo y cristianismo'], idea: 'tres órdenes de sentido que duran mil años', fn: t03 },
  { etapas: ['El colapso moderno'], idea: 'el universo queda muerto y el sentido, sólo en la cabeza', fn: t04 },
  { etapas: ['Relevance realization', 'Espiritualidad y sagrado'], titulo: 'La maquinaria del sentido', idea: 'ser inteligente es dar con lo relevante', fn: t05 },
  { etapas: ['Ingeniería inversa de la iluminación'], idea: 'a cada problema perenne, su práctica', fn: t06 },
  { etapas: ['Sabiduría y racionalidad'], idea: 'sabiduría es ver a través de la ilusión', fn: t07 },
  { etapas: ['Los profetas'], idea: 'cinco profetas con quienes dialogar', fn: t08 }
];

// ------------------------------------------------------------------------------------------------------------
// La portada: el arco de la serie. 50 puntos (los episodios) en ocho grupos; la línea baja (el sentido se pierde),
// corre por abajo (la maquinaria) y vuelve a subir (la respuesta). Una persona la camina entera.
export function arco(grupos) {
  const P = 'arc', WW = 1100, HH = 340, D = 12, a = anim(P, D);
  const x0 = 70, x1 = 1000, gap = 16, n = grupos.reduce((s, g2) => s + g2.length, 0);
  const step = (x1 - x0 - gap * (grupos.length - 1)) / (n - 1);
  const pos = []; let x = x0;
  grupos.forEach((eps, gi) => { eps.forEach((ep, k) => { pos.push({ ep, gi, x }); x += step; }); x += gap; });
  // y along the arc: tramo 1 descends (Ep. 1–25), tramo 2 runs low (26–35), tramo 3 climbs (36–50)
  const xa = pos.find(p => p.ep === 25).x, xb = pos.find(p => p.ep === 36).x;
  const yAt = X => X <= xa ? 120 + 130 * (1 - Math.cos(Math.PI * (X - x0) / (xa - x0))) / 2
    : X < xb ? 250 : 250 - 130 * (1 - Math.cos(Math.PI * (X - xb) / (x1 - xb))) / 2;
  let road = '';
  for (let X = x0 - 30; X <= x1 + 40; X += 6) road += `${road ? 'L' : 'M'}${X.toFixed(0)},${yAt(Math.min(x1, Math.max(x0, X))).toFixed(1)} `;
  // the walker: from the first dot to the last, then back to the start while hidden
  const wp = [];
  const N = 16;
  for (let i = 0; i <= N; i++) { const X = x0 + (x1 - x0) * i / N; wp.push([+(4 + 80 * i / N).toFixed(2), X - x0, yAt(X) - yAt(x0)]); }
  const walk = a.move([[0, 0, 0], ...wp, [100, x1 - x0, yAt(x1) - yAt(x0)]], { ease: 'linear' });
  const wvis = a.show([[0, 88]], { fade: 2 });
  const step2 = a.k([[[0, 50, 100], 'transform:translateY(0)'], [25, 'transform:translateY(-4px)'], [75, 'transform:translateY(-1px)']], { d: D / 24 });
  const glow = a.k([[[0, 84, 100], 'transform:scale(1)'], [90, 'transform:scale(1.18)']], { origin: 'center' });
  const s = 0.95, wy = yAt(x0) - 9 - 44 * s;
  const dots = pos.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${yAt(p.x).toFixed(1)}" r="5.5" fill="${INK}" stroke="#fff" stroke-width="1.6"/>`).join('');
  const nums = grupos.map((eps, gi) => {
    const xs = pos.filter(p => p.gi === gi).map(p => p.x), cx = (xs[0] + xs[xs.length - 1]) / 2, cy = yAt(cx);
    return `<g transform="translate(${cx.toFixed(1)},${(cy + 32).toFixed(1)})"><circle r="13" fill="#fff" stroke="${INK}" stroke-width="2.2"/>` +
      `<text class="m" y="5" text-anchor="middle" font-size="13" font-weight="800" fill="${INK}">0${gi + 1}</text></g>`;
  }).join('');
  const tramo = (from, to, label, ty) => { const xs = pos.filter(p => p.ep >= from && p.ep <= to).map(p => p.x); return tag((xs[0] + xs[xs.length - 1]) / 2, ty, label, { size: 15 }); };
  const body =
    `<path d="${road}" fill="none" stroke="${PALE}" stroke-width="16" stroke-linecap="round"/><path d="${road}" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 9"/>` +
    dots + nums +
    tramo(1, 25, 'lo histórico · Ep. 1–25', 300) + tramo(26, 35, 'lo cognitivo · 26–35', 300) + tramo(36, 50, 'la respuesta · 36–50', 300) +
    T(x0 - 14, 30, 'el sentido nace…', { size: 17, w: 800, fill: INK2, anchor: 'start' }) +
    T((xa + xb) / 2, 150, '…se pierde…', { size: 17, w: 800, fill: INK2 }) +
    // the end: awakening
    at(x1 + 34, yAt(x1) - 40, g(glow, `<circle r="26" fill="${ACC}" stroke="${INK}" stroke-width="2.8"/>`) + `<path d="M-9,1 l6,6 l12,-13" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`) +
    T(x1 + 34, yAt(x1) - 92, '…y se cultiva', { size: 17, w: 800, fill: INK2 }) +
    // the walker
    g(wvis, g(walk, g(step2, persona(x0, wy, { s, arm: 'hold', a: { blink: a.blink, bob: a.bob } }) +
      at(x0 + 18, wy + 4, `<rect width="18" height="22" rx="2" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M4,7 h10 M4,12 h8" stroke="${INK}" stroke-width="1.4" opacity=".5"/>`)))) +
    // the agent who reads the glossary, at the bottom right
    agente(1010, 280, { s: 1.1, arms: 'hold', hat: 'IA', a: { blink: a.blink2, bob: a.bob2 } }) +
    at(1028, 278, `<path d="M0,0 q8,-4 12,1 q4,-5 12,-1 v18 q-8,-4 -12,1 q-4,-5 -12,-1 z" fill="#fff" stroke="${INK}" stroke-width="2"/>`) +
    tag(1010, 314, 'glosario', { size: 13 });
  const style = `.${P} text{font-family:${SANS}}.${P} .m{font-family:${MONO}}` + a.css.join('') + `@media (prefers-reduced-motion:reduce){.${P} *{animation:none!important}}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${P}" viewBox="0 0 ${WW} ${HH}" width="${WW}" height="${HH}" role="img" aria-labelledby="${P}-t" data-dur="${D}">` +
    `<title id="${P}-t">El arco de la serie: 50 puntos, uno por episodio, en ocho tramos. La línea baja mientras el sentido se pierde (Ep. 1–25), corre por abajo con la maquinaria cognitiva (26–35) y vuelve a subir con la respuesta (36–50). Una persona la camina con su ficha; abajo, un agente lee el glosario.</title>` +
    `<style>${style}</style>${body}</svg>`;
}

// ------------------------------------------------------------------------------------------------------------
// tramos: [{ eps:[1..7] }, …] en el orden de TRAMOS (lo arma armar.mjs desde mapa.md)
export function dibujar(rangos) {
  mkdirSync(join(AQUI, 'temas'), { recursive: true });
  const out = [];
  TRAMOS.forEach((t, i) => {
    const nn = String(i + 1).padStart(2, '0'), P = `t${nn}`;
    const s = t.fn(P);
    const [e0, e1] = rangos[i];
    const svg = svgDoc({ P, D: s.D, title: s.title, regla: `Ep. ${e0}–${e1}`, body: s.body, css: s.css });
    writeFileSync(join(AQUI, `temas/${nn}.svg`), svg);
    out.push({ nn, svg, title: s.title });
  });
  const grupos = rangos.map(([e0, e1]) => Array.from({ length: e1 - e0 + 1 }, (_, k) => e0 + k));
  const portada = arco(grupos);
  writeFileSync(join(AQUI, 'arco.svg'), portada);
  return { temas: out, portada };
}
