// armar.mjs: arma readme/pagina.html desde los .md de la repo.
// Uso: node readme/armar.mjs
// Lee README.md (título y bajada), mapa.md (la tesis, las etapas, los hilos), glosario.md (las definiciones de los
// conceptos clave) y epNN/ficha.md (título, "La idea en una frase" y "Conceptos nuevos"). Redibuja los SVG
// (readme/dibujar.mjs) y los mete adentro. Un solo archivo, sin pedidos a ningún otro host.
// Solo lee mapa.md, glosario.md y las fichas: todo resumido con palabras propias.
// El contenido NO se escribe acá: si cambia un .md, se vuelve a correr esto y la página cambia sola.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dibujar, TRAMOS } from './dibujar.mjs';
import { persona } from './kit.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(AQUI, '..');
const leer = f => readFileSync(join(RAIZ, f), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const avisos = [];

// ---------------------------------------------------------------------------------------------------------------
// 1. Markdown en línea: negrita, cursiva, código y links (los links a archivos de la repo quedan como texto)
function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t) => t);
  s = s.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*(?!\s)([^*]+?)\*(?![*\w])/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
}
const plano = s => s.replace(/\*+/g, '').replace(/`/g, '').trim();
const celdas = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(c => c.trim());
const norm = s => plano(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').replace(/[“”"']/g, '').replace(/\s+/g, ' ').trim();
const seccion = (src, titulo) => { const m = src.match(new RegExp(`^## ${titulo}[^\\n]*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm')); return m ? m[1].trim() : ''; };

// ---------------------------------------------------------------------------------------------------------------
// 2. README: el título (antes de los dos puntos va en la página) y la bajada
function leerReadme() {
  const src = leer('README.md');
  const h1 = plano(src.match(/^# (.+)$/m)[1]);
  const [titulo, resto] = h1.includes(':') ? [h1.slice(0, h1.indexOf(':')), h1.slice(h1.indexOf(':') + 1).trim()] : [h1, ''];
  const lineas = src.split('\n');
  const i = lineas.findIndex(l => /^# /.test(l));
  const bajada = (lineas.slice(i + 1).find(l => l.trim()) || '').trim();
  return { titulo: titulo.trim(), serie: resto, bajada };
}

// ---------------------------------------------------------------------------------------------------------------
// 3. mapa.md: la tesis, los tres tramos con sus etapas, y los hilos
function leerMapa() {
  const src = leer('mapa.md');
  const tesis = (src.match(/^\*\*La tesis en una frase\.\*\*\s*(.+)$/m) || [])[1];
  if (!tesis) throw new Error('mapa.md: falta "**La tesis en una frase.**"');
  const intro = (src.match(/^> (.+)$/m) || [])[1] || '';
  const partes = [];
  const re = /^## Tramo (\d) · ([^:]+): (.+?) \(Ep\. (\d+)–(\d+)\)\s*$/gm;
  let m; const idx = [];
  while ((m = re.exec(src))) idx.push({ n: +m[1], nombre: m[2].trim(), sub: m[3].trim(), at: m.index });
  if (idx.length !== 3) avisos.push(`mapa.md: encontré ${idx.length} tramos, esperaba 3`);
  const etapas = [];
  idx.forEach((t, k) => {
    const cuerpo = src.slice(t.at, k + 1 < idx.length ? idx[k + 1].at : src.indexOf('## Los hilos'));
    cuerpo.split('\n').filter(l => /^\|\s*\*\*/.test(l)).forEach(l => {
      const [et, eps, que, conc] = celdas(l);
      const [e0, e1] = eps.split(/[–-]/).map(Number);
      etapas.push({ nombre: plano(et), e0, e1, que, conceptos: conc.split(' · ').map(c => c.trim()).filter(Boolean), tramo: t });
    });
    partes.push(t);
  });
  const hilos = seccion(src, 'Los hilos').split('\n').filter(l => /^- /.test(l)).map(l => {
    const mm = l.match(/^- (.+?) \(Ep\. ([\d →]+)\)\.?\s*$/) || l.match(/^- (.+?) \(Ep\. (.+)\)\.?\s*$/);
    if (!mm) { avisos.push(`mapa.md: hilo sin "(Ep. …)": ${l.slice(0, 50)}`); return { texto: l.slice(2), eps: [] }; }
    const eps = [...mm[2].matchAll(/(\d+)/g)].map(x => +x[1]);
    return { texto: mm[1], cadena: mm[2], eps };
  });
  return { tesis, intro, tramos: partes, etapas, hilos };
}

// ---------------------------------------------------------------------------------------------------------------
// 4. glosario.md: término → definición (para los conceptos clave del mapa)
function leerGlosario() {
  const filas = leer('glosario.md').split('\n').filter(l => /^\|\s*\*\*/.test(l)).map(celdas);
  return filas.map(([t, def, donde]) => ({ term: t, key: norm((t.match(/\*\*(.+?)\*\*/) || [, t])[1]), def, donde }));
}
function buscar(G, c) {
  const k = norm(c);
  const cand = [k, ...k.split(/\s*\/\s*|\s+vs\.?\s+/)].filter(x => x.length >= 3);
  const palabras = s => s.split(/[\s/]+/).filter(Boolean);
  const pruebas = [
    (g, q) => g.key === q,
    (g, q) => g.key.startsWith(q + ' ') || g.key.startsWith(q + '/'),
    (g, q) => q.length >= 5 && g.key.split(/\s*\/\s*|\s+vs\.?\s+/).includes(q),
    (g, q) => q.length >= 6 && g.key.includes(q),
    (g, q) => palabras(q).length >= 2 && palabras(q).every(w => palabras(g.key).includes(w))
  ];
  for (const q of cand) for (const p of pruebas) { const e = G.find(g => p(g, q)); if (e) return e; }
  return null;
}

// ---------------------------------------------------------------------------------------------------------------
// 5. Las fichas: título, la idea en una frase, conceptos nuevos
function leerFichas() {
  const dirs = readdirSync(RAIZ).filter(d => /^ep\d\d$/.test(d)).sort();
  return dirs.map(d => {
    const f = join(d, 'ficha.md');
    if (!existsSync(join(RAIZ, f))) { avisos.push(`${d}: sin ficha.md`); return null; }
    const src = leer(f);
    const h = src.match(/^# Ep\. (\d+) · (.+)$/m);
    if (!h) { avisos.push(`${f}: el título no tiene la forma "# Ep. N · Título"`); return null; }
    const idea = seccion(src, 'La idea en una frase').replace(/\s*\n\s*/g, ' ');
    if (!idea) avisos.push(`${f}: sin "La idea en una frase"`);
    const nuevos = seccion(src, 'Conceptos nuevos').replace(/\s*\n\s*/g, ' ');
    return { n: +h[1], dir: d, titulo: h[2].trim(), idea, nuevos };
  }).filter(Boolean);
}

// ---------------------------------------------------------------------------------------------------------------
// 6. Juntar: cada tramo del dibujo con sus etapas del mapa y sus episodios
const R = leerReadme(), M = leerMapa(), G = leerGlosario(), F = leerFichas();
const porEp = Object.fromEntries(F.map(f => [f.n, f]));
const T = TRAMOS.map((t, i) => {
  const ets = t.etapas.map(n => { const e = M.etapas.find(x => x.nombre === n); if (!e) throw new Error(`mapa.md: no encuentro la etapa "${n}" (dibujar.mjs → TRAMOS)`); return e; });
  const e0 = Math.min(...ets.map(e => e.e0)), e1 = Math.max(...ets.map(e => e.e1));
  const eps = []; for (let n = e0; n <= e1; n++) { if (porEp[n]) eps.push(porEp[n]); else avisos.push(`Ep. ${n}: sin ficha`); }
  return { i, nn: String(i + 1).padStart(2, '0'), titulo: t.titulo || ets[0].nombre, idea: t.idea, ets, e0, e1, eps, parte: ets[0].tramo };
});
// every etapa of the map lands in exactly one tramo, and the ranges don't overlap
M.etapas.forEach(e => { const n = T.filter(t => t.ets.includes(e)).length; if (n !== 1) avisos.push(`mapa.md: la etapa "${e.nombre}" está en ${n} tramos`); });
const { temas: SV, portada } = dibujar(T.map(t => [t.e0, t.e1]));
let sinDef = [];
T.forEach(t => t.ets.forEach(e => { e.cs = e.conceptos.map(c => { const g = buscar(G, c); if (!g) sinDef.push(c); return { c, g }; }); }));
const nEps = F.length, nTerm = G.length;

// ---------------------------------------------------------------------------------------------------------------
// 7. La página
const rango = t => `Ep. ${t.e0}–${t.e1}`;
const bajadaHtml = (() => { const b = R.bajada, k = b.lastIndexOf(' y '); return k > 0 ? `${inline(b.slice(0, k + 3))}<b>${inline(b.slice(k + 3).replace(/\.$/, ''))}</b>.` : inline(b); })();
const card = t => `<article class="card" id="card-${t.nn}" data-t="${t.nn}">
  <div class="art">${SV[t.i].svg}</div>
  <div class="body"><span class="num">${t.nn}</span><div>
    <div class="parte">${esc(t.parte.nombre.toUpperCase())} · ${esc(rango(t).toUpperCase())}</div>
    <h3 class="ttl"><a class="open" href="#t${t.nn}">${esc(t.titulo)}</a></h3>
    <div class="ln">${esc(t.idea.charAt(0).toUpperCase() + t.idea.slice(1))}.</div>
    <div class="cuenta">${t.eps.length} episodios</div></div></div>
  <span class="plus" aria-hidden="true">+</span></article>`;
let ndef = 0;
const etapa = (t, e) => `<section class="etapa">
  <p class="frase"><span class="fk">${t.ets.length > 1 ? `${esc(e.nombre)} · Ep. ${e.e0}–${e.e1}` : 'Qué pasa'}</span>${inline(e.que)}</p>
  <div class="cks"><span class="ckk">Conceptos clave</span>${e.cs.map(({ c, g }) => g
    ? `<button class="cc" type="button" aria-expanded="false" data-d="d${++ndef}">${inline(c)}</button>`
    : `<span class="cc sin">${inline(c)}</span>`).join('')}</div>
  ${e.cs.filter(x => x.g).map(({ g }, k, arr) => `<div class="def" id="d${ndef - arr.length + k + 1}" hidden><b>${inline(g.term.replace(/\s*\(en los subtítulos[^)]*\)/g, ''))}</b> ${inline(g.def)} <span class="donde">${inline(g.donde)}</span></div>`).join('')}
</section>`;
const ep = f => `<details class="ep" id="ep-${f.n}">
  <summary><code>Ep. ${f.n}</code><span class="et">${inline(f.titulo)}</span></summary>
  <div class="idea"><h4>La idea en una frase</h4><p>${inline(f.idea)}</p>${f.nuevos ? `<p class="nuevos"><b>Conceptos nuevos:</b> ${inline(f.nuevos)}</p>` : ''}<p class="fuente"><code>${f.dir}/ficha.md</code></p></div>
</details>`;
const cap = t => `<article class="cap" id="cap-${t.nn}" data-t="${t.nn}" data-i="${t.i}" hidden>
  <div class="hd"><div class="badge tone-acc" aria-hidden="true"><span class="g">${t.nn}</span><span class="k">${esc(rango(t).toUpperCase())}</span></div>
    <div><div class="kind">${esc(t.parte.nombre.toUpperCase())}${t.ets.length > 1 ? ` · ${esc(t.ets.map(e => e.nombre.toUpperCase()).join(' + '))}` : ''} · ${t.eps.length} EPISODIOS</div><h2>${esc(t.titulo)}</h2><div class="tg">${esc(t.idea.charAt(0).toUpperCase() + t.idea.slice(1))}.</div></div></div>
  <figure class="big" data-de="card-${t.nn}"></figure>
  ${t.ets.map(e => etapa(t, e)).join('\n')}
  <h3 class="eph">Los ${t.eps.length} episodios <span>toca uno para ver su idea</span></h3>
  <div class="eps">${t.eps.map(ep).join('\n')}</div>
</article>`;
const hilo = h => `<li><p>${inline(h.texto)}</p><div class="cadena">${h.eps.map(n => `<a href="#ep-${n}">Ep. ${n}</a>`).join('<span aria-hidden="true">→</span>')}</div></li>`;
const vivas = persona(0, 0, { s: 1.6, arm: 'up', arm2: 'up', mouth: 'o' });

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(R.titulo)}</title>
<meta name="description" content="${esc(plano(R.bajada))} ${T.length} tramos, ${nEps} episodios, ${nTerm} términos.">
<link rel="icon" href="data:,">
<style>
:root{--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,Roboto,sans-serif;--mono:ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;
  --ink:#15171C;--ink2:#3D424C;--ink3:#5F6672;--ink4:#8C929C;--ground:#F1F2F4;--pale:#E7E9ED;--grey:#D3D7DD;--acc:#6A4CF5;--acc-l:#DCD4FF}
html,body{margin:0;background:var(--ground);color:var(--ink);font-family:var(--sans);overflow-x:hidden;-webkit-text-size-adjust:100%}
a{color:var(--ink);text-decoration-color:var(--acc);text-decoration-thickness:2px;text-underline-offset:3px}
code{font-family:var(--mono)}
.tone-acc{background-color:var(--acc-l);background-image:radial-gradient(rgba(21,23,28,.14) 1.2px,transparent 1.4px);background-size:6px 6px}
.wrap{max-width:1200px;margin:0 auto;padding:0 40px;box-sizing:border-box}
.badge{flex:0 0 auto;width:104px;height:104px;box-sizing:border-box;border:3px solid var(--ink);border-radius:18px;box-shadow:5px 5px 0 var(--ink);
  display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-4deg);line-height:1}
.badge .g{font-size:44px;font-weight:900;letter-spacing:-.02em}
.badge .k{font-size:10.5px;font-weight:800;letter-spacing:.08em;margin-top:7px}
#portada{padding-top:40px}
.top{display:flex;gap:28px;align-items:center}
.kick{font-size:15px;font-weight:700;color:var(--ink3);letter-spacing:.05em;margin-bottom:6px}
h1{margin:0;font-size:clamp(36px,5vw,60px);font-weight:900;line-height:1.05;letter-spacing:-.02em}
.sub{margin:10px 0 0;font-size:clamp(18px,2.2vw,26px);line-height:1.3;color:var(--ink2);font-weight:500}
.sub b{color:var(--ink);font-weight:850;background:linear-gradient(transparent 62%,var(--acc-l) 62%)}
.escena{margin:30px 0 0;border:2.5px solid var(--ink);border-radius:14px;background:#fff;box-shadow:5px 5px 0 var(--ink);overflow:hidden;
  background-image:radial-gradient(rgba(21,23,28,.08) 1.1px,transparent 1.3px);background-size:7px 7px}
.escena svg{display:block;width:100%;height:auto}
.leer{display:flex;flex-wrap:wrap;gap:8px 20px;align-items:center;margin-top:16px;font-size:15px;color:var(--ink2)}
.leer .k{font-size:13px;font-weight:800;letter-spacing:.07em;color:var(--ink3)}
.leer span.i{display:inline-flex;gap:8px;align-items:center}
.leer svg{flex:0 0 auto}
section.blk{margin-top:52px}
h2.sec{margin:0;font-size:15px;font-weight:800;letter-spacing:.06em;color:var(--ink3);text-transform:uppercase}
.hint{margin:6px 0 0;font-size:16px;color:var(--ink3);max-width:760px;line-height:1.45}
.tesis{margin:16px 0 0;max-width:900px;padding:16px 20px;border:2.5px solid var(--ink);border-radius:12px;background:#fff;box-shadow:5px 5px 0 var(--ink);font-size:19px;line-height:1.5;color:var(--ink2)}
.tesis strong,.tesis em{color:var(--ink)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:28px;margin-top:20px}
.card{box-sizing:border-box;position:relative;display:flex;flex-direction:column;border:2.5px solid var(--ink);border-radius:14px;background:#fff;
  box-shadow:5px 5px 0 var(--ink);transition:transform .15s,box-shadow .15s;scroll-margin-top:24px}
.card:hover,.card:focus-within{transform:translate(-2px,-2px);box-shadow:7px 7px 0 var(--ink)}
.card:focus-within{outline:3px solid var(--acc);outline-offset:4px}
.card .open{color:var(--ink);text-decoration:none}
.card .open::after{content:'';position:absolute;inset:0;border-radius:12px}
.card .open:focus-visible{outline:none}
.card .art{border-bottom:2.5px solid var(--ink);border-radius:11px 11px 0 0;overflow:hidden;aspect-ratio:800/360}
.card .art svg{display:block;width:100%;height:100%}
.card .art svg *{animation-play-state:paused!important}
.card:hover .art svg *,.card:focus-within .art svg *,body.film .card.hov .art svg *{animation-play-state:running!important}
.card .body{padding:14px 18px 18px;display:flex;gap:14px;align-items:flex-start}
.card .num{flex:0 0 auto;width:34px;height:34px;box-sizing:border-box;border:2.4px solid var(--ink);border-radius:17px;text-align:center;line-height:29px;font-size:14px;font-weight:900}
.card .parte{font-size:12px;font-weight:800;color:var(--ink3);letter-spacing:.06em;margin-bottom:3px}
.card .ttl{margin:0;font-size:22px;font-weight:900;letter-spacing:-.01em;line-height:1.15}
.card .ln{font-size:16px;line-height:1.35;color:var(--ink2);margin-top:4px}
.card .cuenta{font-size:13px;font-weight:800;color:var(--ink3);margin-top:8px;letter-spacing:.03em}
.plus{position:absolute;right:-11px;top:-11px;width:24px;height:24px;border-radius:12px;background:var(--ink);color:#fff;font-size:18px;font-weight:900;line-height:23px;text-align:center}
ol.hilos{list-style:none;margin:18px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px 22px}
ol.hilos li{background:#fff;border:2.5px solid var(--ink);border-radius:12px;box-shadow:4px 4px 0 var(--ink);padding:14px 16px}
ol.hilos p{margin:0;font-size:17px;line-height:1.4;color:var(--ink2)}
ol.hilos strong,ol.hilos em{color:var(--ink)}
.cadena{margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;font-size:14px;color:var(--ink3)}
.cadena a{font-family:var(--mono);font-weight:800;font-size:13.5px;text-decoration:none;border:2px solid var(--ink);border-radius:6px;padding:1px 7px;background:#fff;color:var(--ink)}
.cadena a:hover,.cadena a:focus-visible{background:var(--acc);color:#fff}
footer{margin:56px auto 0;padding:0 40px 56px;max-width:1200px;box-sizing:border-box;font-size:14px;color:var(--ink3);line-height:1.5}
footer code{font-size:13px;color:var(--ink2)}
dialog#panel{width:min(880px,calc(100vw - 32px));max-height:calc(100dvh - 32px);box-sizing:border-box;border:3px solid var(--ink);border-radius:16px;background:#fff;
  box-shadow:7px 7px 0 var(--ink);padding:0;color:var(--ink);overflow:hidden}
dialog#panel[open]{display:flex;flex-direction:column}
dialog#panel::backdrop{background:rgba(241,242,244,.88)}
#panel .scroll{overflow-y:auto;overflow-x:hidden;padding:22px 26px 10px;overscroll-behavior:contain}
#panel .pbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px 8px 26px;border-bottom:2px dashed var(--ink4)}
#panel .pt{font-size:13.5px;font-weight:800;color:var(--ink3);letter-spacing:.03em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#panel .x{all:unset;flex:0 0 auto;width:36px;height:36px;box-sizing:border-box;border:2.5px solid var(--ink);border-radius:18px;background:#fff;font-size:20px;font-weight:900;line-height:31px;text-align:center;cursor:pointer}
#panel .x:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
.cap .hd{display:flex;gap:18px;align-items:center}
.cap .badge{width:78px;height:78px;border-radius:14px;box-shadow:4px 4px 0 var(--ink)}
.cap .badge .g{font-size:30px}.cap .badge .k{font-size:9.5px;margin-top:6px;letter-spacing:.04em}
.cap .kind{font-size:12.5px;font-weight:800;color:var(--ink3);letter-spacing:.05em}
.cap h2{margin:2px 0 0;font-size:30px;font-weight:900;letter-spacing:-.01em;line-height:1.1}
.cap .tg{font-size:17px;color:var(--ink2);margin-top:3px}
.cap .big{margin:18px 0 0;border:2.5px solid var(--ink);border-radius:12px;overflow:hidden;aspect-ratio:800/360}
.cap .big svg{display:block;width:100%;height:100%}
.frase{margin:18px 0 0;padding:12px 16px;border:2.5px solid var(--ink);border-radius:10px;background:var(--acc-l);font-size:17.5px;line-height:1.5;color:var(--ink)}
.frase .fk{display:block;font-size:12.5px;font-weight:850;letter-spacing:.07em;text-transform:uppercase;color:var(--ink2);margin-bottom:3px}
.cks{margin-top:12px;display:flex;flex-wrap:wrap;gap:7px;align-items:center}
.ckk{font-size:12.5px;font-weight:850;letter-spacing:.07em;text-transform:uppercase;color:var(--ink3);margin-right:4px}
.cc{all:unset;box-sizing:border-box;font-family:var(--mono);font-size:13px;font-weight:700;border:2px solid var(--ink);border-radius:14px;padding:3px 10px;background:#fff;cursor:pointer;line-height:1.3}
.cc:hover,.cc:focus-visible{background:var(--pale)}
.cc:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
.cc[aria-expanded="true"]{background:var(--ink);color:#fff}
.cc.sin{cursor:default;border-style:dashed;border-color:var(--ink4);color:var(--ink3)}
.def{margin-top:10px;padding:10px 14px;border-left:5px solid var(--ink);background:var(--pale);border-radius:4px;font-size:16px;line-height:1.5;color:var(--ink2)}
.def b{color:var(--ink)}
.def .donde{display:block;margin-top:4px;font-family:var(--mono);font-size:12.5px;color:var(--ink3)}
.eph{margin:24px 0 0;font-size:13px;font-weight:850;letter-spacing:.07em;text-transform:uppercase;color:var(--ink3)}
.eph span{font-weight:600;letter-spacing:0;text-transform:none;margin-left:6px}
.eps{margin-top:10px;display:flex;flex-direction:column;gap:9px}
details.ep{border:2.2px solid var(--ink);border-radius:10px;background:#fff}
details.ep[open]{box-shadow:4px 4px 0 var(--ink)}
details.ep summary{list-style:none;cursor:pointer;display:flex;gap:12px;align-items:baseline;padding:10px 44px 10px 14px;position:relative;font-size:17px;line-height:1.35;font-weight:750}
details.ep summary::-webkit-details-marker{display:none}
details.ep summary::after{content:'+';position:absolute;right:12px;top:8px;width:24px;height:24px;border-radius:12px;background:var(--ink);color:#fff;font-weight:900;font-size:17px;line-height:23px;text-align:center}
details.ep[open] summary::after{content:'−'}
details.ep summary:focus-visible{outline:3px solid var(--acc);outline-offset:2px;border-radius:8px}
details.ep summary code{flex:0 0 auto;font-size:13px;font-weight:850;border:2px solid var(--ink);border-radius:5px;padding:1px 6px;background:var(--pale)}
.idea{padding:0 16px 14px;font-size:16.5px;line-height:1.55;color:var(--ink2)}
.idea h4{margin:0;font-size:12.5px;font-weight:850;letter-spacing:.07em;text-transform:uppercase;color:var(--ink3)}
.idea p{margin:4px 0 0}
.idea strong,.idea em{color:var(--ink)}
.idea .nuevos{margin-top:10px;font-size:14px;line-height:1.5;color:var(--ink3)}
.idea .nuevos b{color:var(--ink2)}
.idea .fuente{margin-top:6px;font-size:12px;color:var(--ink4)}
#panel .pnav{display:flex;justify-content:space-between;gap:12px;padding:12px 26px 14px;border-top:2px dashed var(--ink4);background:#fff}
#panel .pnav button{all:unset;cursor:pointer;font-size:15px;font-weight:800;color:var(--ink2);max-width:48%}
#panel .pnav button:hover,#panel .pnav button:focus-visible{color:var(--ink);text-decoration:underline;text-decoration-color:var(--acc);text-decoration-thickness:2px;text-underline-offset:3px}
#panel .pnav .nx{margin-left:auto;text-align:right}
@media (max-width:760px){
  .wrap{padding:0 16px}
  #portada{padding-top:22px}
  .top{gap:16px;align-items:flex-start}
  .badge{width:74px;height:74px;border-radius:14px;box-shadow:4px 4px 0 var(--ink)}
  .badge .g{font-size:30px}.badge .k{font-size:8px;margin-top:5px}
  .kick{font-size:12.5px}
  .escena{margin-top:20px}
  .tesis{font-size:17px}
  ol.hilos{grid-template-columns:1fr}
  .grid{grid-template-columns:1fr;gap:22px}
  footer{padding:0 16px 40px}
  dialog#panel{width:calc(100vw - 12px);max-height:calc(100dvh - 12px);border-radius:12px}
  #panel .scroll{padding:16px 14px 8px}
  #panel .pnav{padding:10px 14px 12px}
  #panel .pbar{padding:6px 10px 6px 14px}
  .cap .hd{gap:12px}
  .cap .badge{width:58px;height:58px;border-radius:11px}
  .cap .badge .g{font-size:22px}.cap .badge .k{font-size:7px}
  .cap h2{font-size:24px}
  .frase{font-size:16.5px}
  details.ep summary{font-size:16px}
  .idea{padding:0 12px 12px}
}
@media (prefers-reduced-motion:reduce){.card{transition:none}}
/* modo película (?film=1): el escenario de 1280x640 del que se graba el GIF de la portada */
body.film{width:1280px;height:640px;overflow:hidden}
body.film>*:not(#film){display:none!important}
#film{position:relative;width:1280px;height:640px;overflow:hidden;background:var(--ground)}
#film .sc{position:absolute;inset:0;opacity:0}
#film .s1 .top{position:absolute;left:52px;top:34px}
#film .s1 h1{font-size:60px}
#film .s1 .kick{font-size:17px}
#film .s1 .sub{font-size:25px;max-width:1000px}
#film .s1 .escena{position:absolute;left:52px;top:232px;width:1176px;margin:0;background-image:none}
#film .k2{position:absolute;left:52px;top:40px;font-size:17px;font-weight:800;letter-spacing:.06em;color:var(--ink3)}
#film .s2 .t2{position:absolute;left:52px;top:66px;font-size:40px;font-weight:900;letter-spacing:-.015em}
#film .s2 .cards{position:absolute;left:52px;top:150px;width:1176px;display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
#film .s2 .card .body{padding:12px 16px 16px}
#film .s2 .card .parte{font-size:13px}
#film .s2 .card .ttl{font-size:25px}
#film .s2 .card .ln{font-size:18px}
#film .s2 .card .cuenta{font-size:15px}
#film .card.hov{transform:translate(-2px,-2px);box-shadow:7px 7px 0 var(--ink)}
#film .s3 .pan{position:absolute;left:52px;top:28px;width:1176px;height:584px;box-sizing:border-box;border:3px solid var(--ink);border-radius:16px;background:#fff;box-shadow:7px 7px 0 var(--ink);padding:22px 26px;overflow:hidden}
#film .s3 .cap{display:grid;grid-template-columns:560px 1fr;grid-template-rows:auto auto auto 1fr;gap:0 28px}
#film .s3 .cap .hd{grid-column:1/3}
#film .s3 .cap .big{grid-column:1;grid-row:2/4;margin-top:18px;align-self:start}
#film .s3 .cap .etapa{grid-column:2;grid-row:2}
#film .s3 .cap .etapa+.etapa,#film .s3 .cap .cks,#film .s3 .cap .def,#film .s3 .cap .eph{display:none}
#film .s3 .cap .frase{font-size:18px;line-height:1.45}
#film .s3 .cap .eps{grid-column:2;grid-row:3;margin-top:14px;gap:8px}
#film .s3 .cap .tg{font-size:19px}
#film .s3 details.ep summary{font-size:18px;padding:7px 40px 7px 12px}
#film .s3 .nota{position:absolute;left:78px;bottom:42px;width:560px;font-size:18px;line-height:1.4;color:var(--ink2)}
#film .s3 .nota b{color:var(--ink)}
#film .s4{text-align:center}
#film .s4 .open{position:absolute;left:0;right:0;top:236px;font-size:60px;font-weight:900;letter-spacing:-.02em}
#film .s4 .chip{position:absolute;left:0;right:0;top:340px}
#film .s4 .chip span{display:inline-block;background:var(--acc);color:#fff;border:3px solid var(--ink);border-radius:40px;box-shadow:6px 6px 0 var(--ink);padding:10px 30px 12px;font-size:34px;font-weight:800;font-family:var(--mono)}
#film .s4 .sb{position:absolute;left:0;right:0;top:462px;font-size:24px;color:var(--ink3)}
#film .s4 .badge{position:absolute;left:52px;top:40px}
#film .s4 .viva{position:absolute;left:980px;top:330px;width:110px;height:140px}
#film #cursor{position:absolute;left:0;top:0;width:34px;height:44px;opacity:0;z-index:9}
</style>
<noscript><style>dialog#panel{display:block;position:static;width:auto;max-height:none;margin:40px auto;max-width:880px;box-shadow:none}.cap[hidden]{display:block!important;margin-bottom:40px}.def[hidden]{display:block!important}#panel .x,#panel .pnav{display:none}</style></noscript>
</head>
<body>
<header id="portada" class="wrap">
  <div class="top">
    <div class="badge tone-acc" aria-hidden="true"><span class="g">意味</span><span class="k">MEANING</span></div>
    <div>
      <div class="kick">${esc(R.serie)} · ${nEps} episodios · ${T.length} tramos</div>
      <h1>${esc(R.titulo)}</h1>
      <p class="sub">${bajadaHtml}</p>
    </div>
  </div>
  <figure class="escena" id="escena">${portada}</figure>
  <div class="leer"><span class="k">CÓMO LEER LOS DIBUJOS</span>
    <span class="i"><svg width="14" height="14" viewBox="-7 -7 14 14" aria-hidden="true"><circle r="5.5" fill="#15171C"/></svg><b>punto</b> = un episodio</span>
    <span class="i"><svg width="24" height="30" viewBox="-18 -28 36 60" aria-hidden="true"><path d="M-15,28 q0,-26 15,-26 q15,0 15,26 z" fill="#8C929C" stroke="#15171C" stroke-width="3"/><circle cx="0" cy="-12" r="12" fill="#F1DCC6" stroke="#15171C" stroke-width="3"/></svg><b>persona</b> = vos, o un pensador de la serie</span>
    <span class="i"><svg width="26" height="30" viewBox="-20 -24 40 60" aria-hidden="true"><ellipse cx="0" cy="6" rx="17" ry="18" fill="#fff" stroke="#15171C" stroke-width="3"/><path d="M-16,-6 a16,15 0 0 1 32,0 z" fill="#15171C"/></svg><b>redondo</b> = el agente que conversa con el glosario</span>
    <span class="i"><svg width="16" height="16" viewBox="-8 -8 16 16" aria-hidden="true"><circle r="6.5" fill="#6A4CF5" stroke="#15171C" stroke-width="2"/></svg><b>violeta</b> = la idea de cada tramo</span>
  </div>
</header>

<main>
<section class="blk wrap" id="tesis" aria-labelledby="tesis-t">
  <h2 class="sec" id="tesis-t">La tesis en una frase</h2>
  <p class="tesis">${inline(M.tesis)}</p>
</section>

<section class="blk wrap" id="tramos" aria-labelledby="tramos-t">
  <h2 class="sec" id="tramos-t">Los ${T.length} tramos del arco</h2>
  <p class="hint">Toca un tramo: se abre con su dibujo, lo que pasa y sus episodios. Cada concepto clave se abre con su definición, y cada episodio con su idea en una frase. Con ← y → pasás al tramo de al lado.</p>
  <div class="grid" id="grid">
${T.map(card).join('\n')}
  </div>
</section>

<section class="blk wrap" id="hilos" aria-labelledby="hilos-t">
  <h2 class="sec" id="hilos-t">Los hilos que cruzan toda la serie</h2>
  <p class="hint">Ideas que vuelven de un tramo a otro. Toca un episodio para abrirlo.</p>
  <ol class="hilos">${M.hilos.map(hilo).join('\n')}</ol>
</section>
</main>

<footer>Resumido con palabras propias desde <code>mapa.md</code>, <code>glosario.md</code> (${nTerm} términos) y las ${nEps} <code>epNN/ficha.md</code>. Las transcripciones no están en esta página. Se arma sola con <code>node readme/armar.mjs</code>: si cambia un <code>.md</code>, se vuelve a correr y la página cambia.</footer>

<dialog id="panel" aria-label="Tramo">
  <div class="pbar"><span class="pt" id="pt"></span><button class="x" id="px" aria-label="Cerrar">×</button></div>
  <div class="scroll" id="pscroll">
${T.map(cap).join('\n')}
  </div>
  <nav class="pnav" id="pnav" aria-label="Otros tramos"><button class="pv" id="pv"></button><button class="nx" id="nx"></button></nav>
</dialog>

<script>
(function(){
  const panel=document.getElementById('panel'), scroll=document.getElementById('pscroll');
  const caps=[...document.querySelectorAll('.cap[data-i]')], porT={};
  caps.forEach(c=>porT[c.dataset.t]=c);
  const pv=document.getElementById('pv'), nx=document.getElementById('nx');
  let actual=null, volverA=null;
  const nombre=c=>c.querySelector('.badge .g').textContent+' · '+c.querySelector('h2').textContent;
  function dibujo(c){
    const fig=c.querySelector('figure.big'); if(!fig||fig.firstChild) return;
    const src=document.getElementById(fig.dataset.de); const svg=src&&src.querySelector('svg'); if(!svg) return;
    const k=svg.cloneNode(true); k.querySelectorAll('[id]').forEach(e=>e.id=e.id+'-p');
    k.querySelectorAll('[clip-path],[fill^="url(#"]').forEach(e=>{['clip-path','fill'].forEach(a=>{const v=e.getAttribute(a); if(v&&v.startsWith('url(#')) e.setAttribute(a,v.replace(/\\)$/,'-p)'));});});
    const t=k.getAttribute('aria-labelledby'); if(t) k.setAttribute('aria-labelledby',t+'-p');
    fig.appendChild(k);
  }
  function abrir(){
    const h=decodeURIComponent(location.hash.slice(1));
    let c=null, e=null, m;
    if((m=h.match(/^t(\\d\\d)$/))) c=porT[m[1]];
    else if((m=h.match(/^ep-(\\d+)$/))){ e=document.getElementById(h); if(e) c=e.closest('.cap'); }
    if(!c){ if(panel.open) panel.close(); return; }
    if(actual!==c){ if(actual) actual.hidden=true; c.hidden=false; actual=c; dibujo(c);
      panel.setAttribute('aria-label','Tramo '+nombre(c));
      document.getElementById('pt').textContent='TRAMO '+nombre(c).toUpperCase();
      const i=+c.dataset.i, n=caps.length, a=caps[(i+n-1)%n], b=caps[(i+1)%n];
      pv.textContent='← '+nombre(a); pv.dataset.to='t'+a.dataset.t; nx.textContent=nombre(b)+' →'; nx.dataset.to='t'+b.dataset.t; }
    if(!panel.open){ volverA=document.activeElement; panel.showModal(); }
    if(e){ e.open=true; requestAnimationFrame(()=>{ scroll.scrollTop+=e.getBoundingClientRect().top-scroll.getBoundingClientRect().top-12; e.querySelector('summary').focus({preventScroll:true}); }); }
    else scroll.scrollTop=0;
  }
  function limpiar(){ if(location.hash) history.replaceState(null,'',location.pathname+location.search); }
  window.addEventListener('hashchange',abrir);
  document.getElementById('px').addEventListener('click',()=>panel.close());
  panel.addEventListener('close',()=>{ limpiar(); if(actual){ actual.hidden=true; actual=null; } if(volverA&&volverA.focus) volverA.focus({preventScroll:true}); });
  panel.addEventListener('click',ev=>{ if(ev.target===panel) panel.close(); });
  [pv,nx].forEach(b=>b.addEventListener('click',()=>{ location.hash=b.dataset.to; }));
  // a key concept opens its definition (one at a time per stage); a second click closes it
  document.addEventListener('click',ev=>{
    const b=ev.target.closest&&ev.target.closest('button.cc'); if(!b) return;
    const sec=b.closest('.etapa'), d=document.getElementById(b.dataset.d), abierto=b.getAttribute('aria-expanded')==='true';
    sec.querySelectorAll('button.cc').forEach(x=>x.setAttribute('aria-expanded','false')); sec.querySelectorAll('.def').forEach(x=>x.hidden=true);
    if(!abierto){ b.setAttribute('aria-expanded','true'); d.hidden=false; }
  });
  document.addEventListener('keydown',ev=>{
    if(!panel.open||ev.altKey||ev.metaKey||ev.ctrlKey) return;
    if(ev.key==='ArrowLeft'){ ev.preventDefault(); location.hash=pv.dataset.to; }
    if(ev.key==='ArrowRight'){ ev.preventDefault(); location.hash=nx.dataset.to; }
  });
  if(new URLSearchParams(location.search).get('film')!=='1'){ abrir(); return; }
  // ------------------------------------------------------------------------------------------------------
  // modo película: un escenario de 1280x640 que es función del tiempo, para que readme/grabar.mjs lo busque cuadro a cuadro
  document.body.classList.add('film');
  const st=document.createElement('div'); st.id='film'; document.body.appendChild(st);
  const sc=n=>{ const d=document.createElement('div'); d.className='sc s'+n; st.appendChild(d); return d; };
  const s1=sc(1), s2=sc(2), s3=sc(3), s4=sc(4);
  const port=document.getElementById('portada').cloneNode(true); port.querySelector('#escena').removeAttribute('id');
  s1.appendChild(port.querySelector('.top')); s1.appendChild(port.querySelector('.escena'));
  s2.innerHTML='<div class="k2">${T.length} TRAMOS · ${nEps} EPISODIOS</div><div class="t2">Cada tramo del arco, con su dibujo</div><div class="cards"></div>';
  const pick=['${T[0].nn}','${T[4].nn}','${T[6].nn}'];
  pick.forEach(p=>{ const c=document.getElementById('card-'+p).cloneNode(true); c.removeAttribute('id'); s2.querySelector('.cards').appendChild(c); });
  const target=s2.querySelectorAll('.card')[1];
  const pan=document.createElement('div'); pan.className='pan'; s3.appendChild(pan);
  const cap=porT['${T[4].nn}'].cloneNode(true); cap.hidden=false; cap.removeAttribute('id'); pan.appendChild(cap);
  cap.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
  cap.querySelectorAll('details').forEach((d,i)=>{ d.open=false; if(i>3) d.remove(); });
  const fig=cap.querySelector('figure.big'); fig.appendChild(document.getElementById('card-${T[4].nn}').querySelector('svg').cloneNode(true));
  const nota=document.createElement('div'); nota.className='nota'; nota.innerHTML='Cada concepto clave se abre con su definición del <b>glosario</b>, y cada episodio con <b>la idea en una frase</b> de su ficha.'; s3.appendChild(nota);
  s4.innerHTML='<div class="badge tone-acc"><span class="g">意味</span><span class="k">MEANING</span></div><div class="open">Toca un tramo y se abre →</div><div class="chip"><span>${nEps} episodios · ${T.length} tramos</span></div><div class="sb">Cada episodio, con su idea en una frase.</div><svg class="viva" viewBox="-40 -60 80 140" aria-hidden="true">${vivas.replace(/'/g, "\\'")}</svg>';
  const viva=s4.querySelector('.viva');
  const cur=document.createElementNS('http://www.w3.org/2000/svg','svg'); cur.id='cursor'; cur.setAttribute('viewBox','0 0 34 44');
  cur.innerHTML='<path d="M3,3 L3,35 L11,28 L17,41 L23,38 L17,25 L28,25 Z" fill="#fff" stroke="#15171C" stroke-width="3" stroke-linejoin="round"/>'; st.appendChild(cur);
  const anims=el=>el.getAnimations({subtree:true});
  const A1=anims(s1), A2=anims(s2).filter(a=>!target.contains(a.effect.target)), AT=anims(target), A3=anims(s3);
  [...A1,...A2,...AT,...A3].forEach(a=>a.pause());
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v)), ease=p=>p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
  const ramp=(t,a,b)=>ease(cl((t-a)/(b-a),0,1));
  // ventanas de cada escena: [entra, entró, sale, salió]. una sale entera antes de que entre la otra
  const W=[[-1,-1,5.2,5.5],[5.5,5.85,11.2,11.5],[11.5,11.85,18.2,18.5],[18.5,18.85,22.3,22.6]];
  const DUR=22.95; // los últimos 0.35 s traen de vuelta la portada: la costura cae en el cuadro 0
  const vis=(t,[a,b,c,d])=>t<a?0:t<b?(b===a?1:(t-a)/(b-a)):t<c?1:t<d?1-(t-c)/(d-c):0;
  const hov0=8.0, clk=10.4, clk2=20.3;
  window.FILM={DUR};
  window.filmSeek=function(t){
    const v=[vis(t,W[0])||(t>=22.6?ramp(t,22.6,22.95):0),vis(t,W[1]),vis(t,W[2]),vis(t,W[3])];
    [s1,s2,s3,s4].forEach((s,i)=>s.style.opacity=v[i].toFixed(3));
    A1.forEach(a=>a.currentTime=(t>=22.6?t-22.6:t)*1000);
    A2.forEach(a=>a.currentTime=0);
    AT.forEach(a=>a.currentTime=cl(t-hov0,0,clk-hov0)*1000); // corre con el hover y se queda quieto al click
    A3.forEach(a=>a.currentTime=0); // el dibujo del panel queda quieto: el GIF tiene que caber en 1.5 MB
    target.classList.toggle('hov',t>=hov0&&t<11.5);
    const sr=st.getBoundingClientRect();
    let x=-99,y=-99,op=0,press=1;
    if(t>=5.95&&t<11.1){
      // el puntero va de la esquina a la tarjeta del medio y la pulsa
      const r=target.getBoundingClientRect(), tx=r.left-sr.left+r.width*.62, ty=r.top-sr.top+r.height*.26, k=ramp(t,6.1,hov0);
      x=1180+(tx-1180)*k; y=600+(ty-600)*k-Math.sin(k*Math.PI)*60; op=Math.min(1,(t-5.95)/.3); press=t>=clk&&t<clk+.25?.82:1;
    } else if(t>=19.0&&t<22.3){
      // en el cartel final, pulsa el chip violeta
      const r=s4.querySelector('.chip span').getBoundingClientRect(), tx=r.left-sr.left+r.width*.955, ty=r.top-sr.top+r.height*.6, k=ramp(t,19.1,20.0);
      x=1100+(tx-1100)*k; y=620+(ty-620)*k; op=Math.min(1,(t-19.0)/.3); press=t>=clk2&&t<clk2+.25?.82:1;
    }
    cur.style.opacity=op.toFixed(3);
    cur.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) scale('+press+')';
    // el que festeja el click: salta dos veces después del click
    const j=t>=clk2+.1&&t<clk2+1.3?Math.abs(Math.sin((t-clk2-.1)*Math.PI/.6))*18:0;
    viva.style.transform='translateY('+(-j).toFixed(1)+'px)';
  };
  window.filmSeek(0);
})();
</script>
</body>
</html>
`;

writeFileSync(join(AQUI, 'pagina.html'), html);
const kb = Buffer.byteLength(html) / 1024;
console.log(`readme/pagina.html  ${kb.toFixed(0)} KB · ${T.length} tramos · ${nEps} episodios · ${nTerm} términos · ${SV.length} dibujos`);
console.log(`conceptos del mapa sin definición en el glosario: ${sinDef.length}${sinDef.length ? ' → ' + sinDef.join(' · ') : ''}`);
if (kb > 250) console.log('OJO: la página pasa de 250 KB');
if (/(?:href|src)="https?:/.test(html)) console.log('OJO: la página tiene una URL externa');
if (/transcript/i.test(html.replace(/Las transcripciones no están/, ''))) console.log('OJO: la página nombra transcript');
for (const a of avisos) console.log('AVISO ' + a);
