// chrome.mjs: un Chrome sin cabeza para mirar la página y grabar la portada.
// Usa $CHROME si está definido; si no, el Chrome de macOS o `google-chrome`.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir, platform } from 'node:os';

const CHROME = process.env.CHROME || (platform() === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
import { join } from 'node:path';

const sleep = ms => new Promise(r => setTimeout(r, ms));
export { sleep };

export async function abrirChrome() {
  const port = 9300 + Math.floor(Math.random() * 600);
  const prof = mkdtempSync(join(tmpdir(), 'mc-chrome-'));
  const proc = spawn(CHROME,
    ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, '--hide-scrollbars', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
  let list;
  for (let i = 0; i < 80; i++) { try { list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); break; } catch { await sleep(100); } }
  if (!list) throw new Error('Chrome no arrancó');
  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  let id = 0; const pending = new Map();
  ws.addEventListener('message', m => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } });
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Page.enable'); await send('Runtime.enable');
  const tab = {
    send,
    async tam(w, h, scale = 1) {
      const mobile = w < 768;
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: scale, mobile });
      await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: mobile ? 5 : 0 });
    },
    async ir(url, espera = 600) { await send('Page.navigate', { url }); await sleep(espera); },
    async js(expr) {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
      return r.result?.result?.value;
    },
    async foto(o = {}) {
      const p = { format: o.format || 'png', captureBeyondViewport: !!o.full };
      if (o.clip) p.clip = { ...o.clip, scale: 1 };
      const r = await send('Page.captureScreenshot', p);
      return Buffer.from(r.result.data, 'base64');
    },
    cerrar() { try { ws.close(); } catch {} proc.kill('SIGKILL'); try { rmSync(prof, { recursive: true, force: true }); } catch {} }
  };
  return tab;
}
