// Generates game art through Flux Studio (dragoonant/local-ai-studio, flux-studio/, port 7880).
// Run it on the PC that hosts the studio. No dependencies; Node 20+.
//
//   node scripts/art/generate.mjs proofs                 # the proof set in art/subjects.mjs
//   node scripts/art/generate.mjs cards [--only a,b]     # card art (portraits reuse it)
//   node scripts/art/generate.mjs scenes [--only a,b]    # 16:9 story backdrops
//
// Options: --studio http://127.0.0.1:7880  --model klein|dev|schnell  --batch 2  --seed 1234  --force
// Output: art/out/<set>/<name>/<n>.png, plus manifest.json and a review sheet index.html per set.
// Existing outputs are skipped unless --force, so an interrupted run can simply be restarted.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARDS, PROOFS, SCENES, promptFor } from '../../art/subjects.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const set = argv[0];
const opt = (name, def) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : def; };
const STUDIO = opt('studio', process.env.FLUX_STUDIO || 'http://127.0.0.1:7880').replace(/\/$/, '');
const BATCH = Number(opt('batch', set === 'proofs' ? 2 : 2));
const SEED = opt('seed');
const FORCE = argv.includes('--force');
const ONLY = opt('only')?.split(',');

if (!['proofs', 'cards', 'scenes'].includes(set)) {
  console.error('usage: node scripts/art/generate.mjs <proofs|cards|scenes> [--only id,id] [--model klein] [--batch 2] [--force]');
  process.exit(1);
}

const jobsFor = () => {
  if (set === 'proofs') return PROOFS.map((p) => ({ ...p, name: `${p.id}--${p.style}--${p.model}` }));
  const ids = Object.keys(set === 'cards' ? CARDS : SCENES).filter((id) => !ONLY || ONLY.includes(id));
  return ids.map((id) => ({ id, kind: set, model: opt('model', 'klein'), name: id }));
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(p, init) {
  const r = await fetch(STUDIO + p, init);
  if (!r.ok) throw new Error(`${init?.method ?? 'GET'} ${p}: ${r.status} ${await r.text()}`);
  return r;
}

const outDir = path.join(ROOT, 'art', 'out', set);
fs.mkdirSync(outDir, { recursive: true });
const manifestFile = path.join(outDir, 'manifest.json');
const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {};

try {
  await run();
} catch (e) {
  console.error(`\nError: ${e.message}`);
  process.exit(1);
}

async function run() {
const status = await api('/api/status').then((r) => r.json()).catch((e) => { throw new Error(`Flux Studio isn't answering at ${STUDIO} (${e.cause?.code ?? e.message}). Start it with flux-studio/start.bat.`); });
const jobs = jobsFor();
for (const m of new Set(jobs.map((j) => j.model))) {
  if (!status.models?.[m]?.installed) throw new Error(`Model "${m}" isn't installed in Flux Studio (run install/fetch-flux.sh).`);
}
console.log(`Flux Studio at ${STUDIO}: ComfyUI ${status.comfy}, GPU ${status.gpu?.name ?? 'unknown'}. ${jobs.length} subjects × ${BATCH}.`);

for (const [i, job] of jobs.entries()) {
  const dir = path.join(outDir, job.name);
  if (!FORCE && manifest[job.name]?.files?.every((f) => fs.existsSync(path.join(outDir, f)))) {
    console.log(`[${i + 1}/${jobs.length}] ${job.name}: already done, skipping`);
    continue;
  }
  const { prompt, aspect } = promptFor(job.kind, job.id, job.style, job.base);
  const seed = SEED ? Number(SEED) + i : Math.floor(Math.random() * 2 ** 32);
  const body = { model: job.model, mode: 't2i', prompt, aspect, megapixels: 1, batch: BATCH, seed };
  const created = await (await api('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
  let j = created;
  let last = '';
  while (!['done', 'failed', 'cancelled'].includes(j.status)) {
    await sleep(2000);
    j = await (await api(`/api/jobs/${created.id}`)).json();
    const line = `${j.phase ?? j.status}${j.queuePos ? ` (queue ${j.queuePos})` : ''} ${Math.round((j.progress ?? 0) * 100)}%`;
    if (line !== last) { process.stdout.write(`\r[${i + 1}/${jobs.length}] ${job.name}: ${line}      `); last = line; }
  }
  process.stdout.write('\n');
  if (j.status !== 'done') throw new Error(`${job.name}: ${j.status}: ${j.error ?? 'no detail'}`);
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (const [n, img] of j.images.entries()) {
    const buf = Buffer.from(await (await api(`/files/${j.id}/${img}`)).arrayBuffer());
    const rel = `${job.name}/${n + 1}.png`;
    fs.writeFileSync(path.join(outDir, rel), buf);
    files.push(rel);
  }
  manifest[job.name] = { ...job, prompt, aspect, seed, studioJob: j.id, files, at: new Date().toISOString() };
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
  writeSheet();
}
writeSheet();
console.log(`Done. Review sheet: ${path.join(outDir, 'index.html')}`);
}

function writeSheet() {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const rows = Object.values(manifest).map((m) => `
    <section><h2>${esc(m.name)}</h2><p class="meta">${esc(m.model)} · seed ${m.seed} · ${esc(m.aspect)}</p>
    <div class="imgs">${m.files.map((f) => `<figure><img src="${esc(f)}" loading="lazy"><figcaption>${esc(f)}</figcaption></figure>`).join('')}</div>
    <details><summary>Prompt</summary><p>${esc(m.prompt)}</p></details></section>`).join('');
  fs.writeFileSync(path.join(outDir, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Art review: ${set}</title>
<style>body{font:14px system-ui;background:#1a1712;color:#eee;margin:0;padding:16px}section{margin:0 0 28px}h2{margin:0;font-size:16px}
.meta{color:#a99;margin:2px 0 8px}.imgs{display:flex;gap:10px;flex-wrap:wrap}figure{margin:0}img{max-width:min(480px,100%);border-radius:6px;background:#fff}
figcaption{font-size:12px;color:#a99}details p{max-width:900px;color:#ccc}</style><h1>Art review: ${set}</h1>${rows}`);
}
