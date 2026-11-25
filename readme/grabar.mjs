// grabar.mjs: graba readme/portada.gif (y readme/portada.png) desde readme/pagina.html?film=1.
// Uso:  node readme/grabar.mjs                  → el GIF y la foto
//       node readme/grabar.mjs --cuadros 0,7,12  → sólo esos segundos, como PNG en una carpeta temporal, para mirarlos
// La página tiene un modo película (?film=1): un escenario de 1280×640 que es una función del tiempo
// (window.filmSeek(t)). Se busca cada cuadro a 12 por segundo con Chrome sin cabeza y ffmpeg arma el GIF
// (64 colores, sin dither, diff_mode=rectangle). Primero correr node readme/armar.mjs.
import { mkdtempSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { abrirChrome, sleep } from './chrome.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const URL = 'file://' + join(AQUI, 'pagina.html') + '?film=1';
const FPS = 12;
const i = process.argv.indexOf('--cuadros');
const cuadros = i > 0 ? process.argv[i + 1].split(',').map(Number) : null;

const tab = await abrirChrome();
try {
  if (cuadros) {
    await tab.tam(1280, 640, 1); await tab.ir(URL, 1200);
    const dir = mkdtempSync(join(tmpdir(), 'mc-revision-'));
    for (const t of cuadros) {
      await tab.js(`filmSeek(${t})`); await sleep(60);
      const f = join(dir, `film_t${String(t).replace('.', '_')}.png`);
      writeFileSync(f, await tab.foto()); console.log(f);
    }
  } else {
    // la foto: el primer cuadro, a 2x
    await tab.tam(1280, 640, 2); await tab.ir(URL, 1200);
    await tab.js('filmSeek(0)'); await sleep(100);
    writeFileSync(join(AQUI, 'portada.png'), await tab.foto());
    // la película
    await tab.tam(1280, 640, 1); await tab.ir(URL, 1200);
    const DUR = await tab.js('FILM.DUR');
    const dir = mkdtempSync(join(tmpdir(), 'mc-film-'));
    const n = Math.round(DUR * FPS);
    for (let k = 0; k < n; k++) {
      await tab.js(`filmSeek(${(k / FPS).toFixed(4)})`);
      writeFileSync(join(dir, `f${String(k).padStart(4, '0')}.png`), await tab.foto());
    }
    const out = join(AQUI, 'portada.gif');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(dir, 'f%04d.png'),
      '-vf', 'split[a][b];[a]palettegen=max_colors=64:stats_mode=full[p];[b][p]paletteuse=dither=none:diff_mode=rectangle',
      '-loop', '0', out]);
    rmSync(dir, { recursive: true, force: true });
    console.log(`readme/portada.gif  ${n} cuadros · ${DUR}s · ${(statSync(out).size / 1048576).toFixed(2)} MB`);
    console.log(`readme/portada.png  ${(statSync(join(AQUI, 'portada.png')).size / 1024).toFixed(0)} KB`);
  }
} finally { tab.cerrar(); }
