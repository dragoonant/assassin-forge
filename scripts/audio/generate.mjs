// Generates game music and sound effects through Audio Studio (dragoonant/local-ai-studio, audio-studio/, port 7890).
// Run it on the PC that hosts the studio. No dependencies; Node 20+.
//
//   node scripts/audio/generate.mjs proofs                # the proof set in audio/subjects.mjs
//   node scripts/audio/generate.mjs music [--only a,b]
//   node scripts/audio/generate.mjs sfx [--only a,b]
//
// Options: --studio http://127.0.0.1:7890  --batch 2  --seed 1234  --force
// Output: audio/out/<set>/<name>/<n>.mp3, plus manifest.json and a review sheet index.html per set.
// Existing outputs are skipped unless --force, so an interrupted run can simply be restarted.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MUSIC, PROOFS, SFX, requestFor } from '../../audio/subjects.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const set = argv[0];
const opt = (name, def) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : def; };
const STUDIO = opt('studio', process.env.AUDIO_STUDIO || 'http://127.0.0.1:7890').replace(/\/$/, '');
const BATCH = Number(opt('batch', 2));
const SEED = opt('seed');
const FORCE = argv.includes('--force');
const ONLY = opt('only')?.split(',');

if (!['proofs', 'music', 'sfx'].includes(set)) {
  console.error('usage: node scripts/audio/generate.mjs <proofs|music|sfx> [--only id,id] [--batch 2] [--force]');
  process.exit(1);
}

const jobsFor = () => {
  if (set === 'proofs') return PROOFS.map((p) => ({ ...p, name: `${p.kind}-${p.id}` }));
  return Object.keys(set === 'music' ? MUSIC : SFX).filter((id) => !ONLY || ONLY.includes(id)).map((id) => ({ kind: set, id, name: id }));
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(p, init) {
  const r = await fetch(STUDIO + p, init);
  if (!r.ok) throw new Error(`${init?.method ?? 'GET'} ${p}: ${r.status} ${await r.text()}`);
  return r;
}

const outDir = path.join(ROOT, 'audio', 'out', set);
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
  const status = await api('/api/status').then((r) => r.json()).catch((e) => { throw new Error(`Audio Studio isn't answering at ${STUDIO} (${e.cause?.code ?? e.message}). Start it with audio-studio/start.bat.`); });
  const jobs = jobsFor();
  for (const kind of new Set(jobs.map((j) => j.kind))) {
    if (!status.models?.[kind]?.installed) throw new Error(`The ${kind} model isn't installed in Audio Studio (run install/fetch-audio.sh).`);
  }
  console.log(`Audio Studio at ${STUDIO}: ComfyUI ${status.comfy}, GPU ${status.gpu?.name ?? 'unknown'}. ${jobs.length} cues × ${BATCH}.`);

  for (const [i, job] of jobs.entries()) {
    if (!FORCE && manifest[job.name]?.files?.every((f) => fs.existsSync(path.join(outDir, f)))) {
      console.log(`[${i + 1}/${jobs.length}] ${job.name}: already done, skipping`);
      continue;
    }
    const request = { ...requestFor(job.kind, job.id), batch: BATCH, seed: SEED ? Number(SEED) + i : undefined };
    const created = await (await api('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) })).json();
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
    fs.mkdirSync(path.join(outDir, job.name), { recursive: true });
    const files = [];
    for (const [n, f] of j.audio.entries()) {
      const buf = Buffer.from(await (await api(`/files/${j.id}/${f}`)).arrayBuffer());
      const rel = `${job.name}/${n + 1}${path.extname(f)}`;
      fs.writeFileSync(path.join(outDir, rel), buf);
      files.push(rel);
    }
    manifest[job.name] = { ...job, request, seed: j.params?.seed, studioJob: j.id, files, at: new Date().toISOString() };
    fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
    writeSheet();
  }
  writeSheet();
  console.log(`Done. Review sheet: ${path.join(outDir, 'index.html')}`);
}

function writeSheet() {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const rows = Object.values(manifest).map((m) => `
    <section><h2>${esc(m.name)}</h2><p class="meta">${esc(m.request.model)} · ${m.request.seconds}s · seed ${m.seed ?? '?'}</p>
    ${m.files.map((f) => `<div class="row"><audio controls preload="none" src="${esc(f)}"></audio><span>${esc(f)}</span></div>`).join('')}
    <details><summary>Prompt</summary><p>${esc(m.request.prompt)}</p></details></section>`).join('');
  fs.writeFileSync(path.join(outDir, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Audio review: ${set}</title>
<style>body{font:14px system-ui;background:#1a1712;color:#eee;margin:0;padding:16px}section{margin:0 0 24px}h2{margin:0;font-size:16px}
.meta{color:#a99;margin:2px 0 8px}.row{display:flex;gap:10px;align-items:center;margin:4px 0}.row span{color:#a99;font-size:12px}
audio{width:min(480px,100%)}details p{max-width:900px;color:#ccc}</style><h1>Audio review: ${set}</h1>${rows}`);
}
