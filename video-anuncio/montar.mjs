// Monta o anúncio: linha do tempo → quadros (Playwright) → trilha → mixagem → MP4 final.
// Uso:
//   python3 gerar_audio.py            (uma vez: narração e efeitos)
//   node montar.mjs --previa          (quadros-chave para revisão)
//   node montar.mjs                   (vídeo completo em build/anuncio-festa-no-link.mp4)
import { spawn, execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(RAIZ, "build");
const AUDIO = path.join(BUILD, "audio");
const FPS = 12; // cadência de stop-motion ("em dois"); o MP4 sai a 24 qps
const previa = process.argv.includes("--previa");
const soAudio = process.argv.includes("--audio"); // refaz só trilha/mixagem, reaproveitando os quadros

// ---------- 1. Linha do tempo ----------
const tempos = JSON.parse(fs.readFileSync(path.join(BUILD, "tempos.json"), "utf8"));
const scenes = [];
let cursor = 0.3;
tempos.cenas.forEach((c, i) => {
  const last = i === tempos.cenas.length - 1;
  const start = cursor;
  const vo = start + (i === 0 ? 0.9 : last ? 1.0 : 0.55);
  let end = vo + c.duracao + 0.35;
  if (last) end += 2.4; // segura o cartão final
  scenes.push({ id: c.id, start: +start.toFixed(3), vo: +vo.toFixed(3), dur: c.duracao, end: +end.toFixed(3), arquivo: c.arquivo });
  cursor = end - 0.3; // próxima cena entra empurrando a anterior (sem tela vazia)
});
const TOTAL = +scenes.at(-1).end.toFixed(3);
const S = Object.fromEntries(scenes.map((s) => [s.id, s]));

// Efeitos sonoros sincronizados com as marcas usadas em cena.html
const fx = [];
const at = (nome, t, vol = 0.55) => fx.push({ nome, t: Math.max(0, +t.toFixed(3)), vol });
scenes.forEach((s, i) => i > 0 && at("swoosh", s.start - 0.05, 0.45));
at("pop", S.theo.vo + 1.6, 0.5);
at("vento", S.papel.vo + S.papel.dur * 0.38 - 0.1, 0.5);
at("brilho", S.descoberta.vo + S.descoberta.dur * 0.45 - 0.25, 0.55);
at("pop", S.editor.vo + S.editor.dur * 0.16, 0.5);
at("tecla", S.editor.vo + S.editor.dur * 0.28, 0.45);
at("tecla", S.editor.vo + S.editor.dur * 0.42, 0.4);
at("brilho", S.editor.vo + S.editor.dur * 0.6 - 0.1, 0.5);
at("pop", S.editor.vo + S.editor.dur * 0.6 + 0.7, 0.45);
[0.12, 0.32, 0.52, 0.72].forEach((f) => at("pop", S.confirmacoes.vo + S.confirmacoes.dur * f, 0.55));
at("festa", S.festa.start + 0.35, 0.6);
at("brilho", S.final.start + 0.4, 0.45);
at("pop", S.final.vo + 3.2, 0.5);

fs.writeFileSync(path.join(BUILD, "timeline.json"), JSON.stringify({ total: TOTAL, scenes, fx }, null, 2));
console.log(`linha do tempo: ${TOTAL}s, ${scenes.length} cenas, ${fx.length} efeitos`);

// ---------- 2. Quadros ----------
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.addInitScript((tl) => { window.TIMELINE = tl; }, { scenes });
await page.goto(pathToFileURL(path.join(RAIZ, "cena.html")).href);
await page.evaluate(() => window.READY);

if (previa) {
  const dir = path.join(BUILD, "previa");
  fs.mkdirSync(dir, { recursive: true });
  for (const s of scenes) {
    for (const [nome, t] of [["a", s.vo + 0.6], ["b", s.vo + s.dur * 0.8]]) {
      const f = Math.round(t * FPS);
      await page.evaluate(([tt, ff]) => window.seek(tt, ff), [t, f]);
      await page.screenshot({ path: path.join(dir, `${s.id}-${nome}.jpg`), type: "jpeg", quality: 80 });
    }
  }
  await browser.close();
  console.log("prévia em", dir);
  process.exit(0);
}

const mudo = path.join(BUILD, "video-mudo.mp4");
if (!soAudio || !fs.existsSync(mudo)) {
const enc = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
  "-vf", "fps=24,format=yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", mudo], { stdio: ["pipe", "inherit", "inherit"] });
const frames = Math.ceil(TOTAL * FPS);
const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  await page.evaluate(([tt, ff]) => window.seek(tt, ff), [f / FPS, f]);
  const buf = await page.screenshot({ type: "jpeg", quality: 92 });
  if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once("drain", r));
  if (f % 60 === 0) console.log(`quadro ${f}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
enc.stdin.end();
await new Promise((r) => enc.on("close", r));
}
await browser.close();

// ---------- 3. Trilha original no tamanho exato ----------
const trilha = path.join(BUILD, "trilha.wav");
execFileSync("python3", [path.join(RAIZ, "compor_trilha.py"), String(TOTAL), trilha], { stdio: "inherit" });

// ---------- 4. Mixagem ----------
const inputs = ["-i", trilha];
const parts = [];
let n = 1;
const vozLabels = [];
for (const s of scenes) {
  inputs.push("-i", path.join(AUDIO, s.arquivo));
  const ms = Math.round(s.vo * 1000);
  parts.push(`[${n}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${ms}|${ms}[v${n}]`);
  vozLabels.push(`[v${n}]`);
  n++;
}
const fxLabels = [];
for (const e of fx) {
  inputs.push("-i", path.join(AUDIO, `efeito-${e.nome}.mp3`));
  const ms = Math.round(e.t * 1000);
  parts.push(`[${n}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${e.vol},adelay=${ms}|${ms}[f${n}]`);
  fxLabels.push(`[f${n}]`);
  n++;
}
parts.push(`${vozLabels.join("")}amix=inputs=${vozLabels.length}:normalize=0,volume=1.6,asplit=2[voz][voz_sc0]`);
parts.push(`[voz_sc0]apad=whole_dur=${TOTAL}[voz_sc]`); // a música segue tocando depois da última fala
parts.push(`[0:a]volume=0.45[mus]`);
parts.push(`[mus][voz_sc]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=400[mus_d]`);
parts.push(`${fxLabels.join("")}amix=inputs=${fxLabels.length}:normalize=0[efx]`);
parts.push(`[voz][mus_d][efx]amix=inputs=3:normalize=0,atrim=0:${TOTAL},loudnorm=I=-14:TP=-1.5:LRA=11[out]`);
const mix = path.join(BUILD, "mix.m4a");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...inputs, "-filter_complex", parts.join(";"), "-map", "[out]", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", mix], { stdio: "inherit" });

// ---------- 5. Final ----------
const final = path.join(BUILD, "anuncio-festa-no-link.mp4");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", mudo, "-i", mix, "-c:v", "copy", "-c:a", "copy", "-shortest", "-movflags", "+faststart", final], { stdio: "inherit" });
console.log("pronto:", final);
