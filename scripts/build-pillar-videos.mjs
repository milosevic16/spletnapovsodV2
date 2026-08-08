/**
 * ONE-OFF, COMMITTED, NOT PART OF THE HOST BUILD.
 *
 * Encodes the pillar plate loops for the web from raw generator output.
 *
 *   node scripts/build-pillar-videos.mjs
 *
 * SOURCES ARE NOT IN THE REPO. Raw clips are megabytes of h264 at a bitrate no
 * site should serve; they live in `video-src/` (gitignored) and only the
 * encoded outputs are committed. Drop a file in as `video-src/<id>.mp4` — the
 * id is the pillar's own id from src/content/home.ts — and re-run.
 *
 * WHAT IT DOES, and why each step exists:
 *
 * 1. CROPS THE GENERATOR'S WATERMARK. Kling burns "KlingAI 3.0 Omni" into the
 *    bottom-right corner. `crop` per source, measured from the actual frame,
 *    not guessed — check a still before trusting a number here.
 * 2. LOOPS ON A CUT, DELIBERATELY. The obvious move is to cross-dissolve the
 *    tail into the head so the loop is seamless. Two reasons it is wrong here.
 *    The register is hard snaps — the whole design system, and the prompt these
 *    clips were generated from, says "hard snaps, never smooth fades", and a
 *    dissolve is the one transition it does not own. And measured: the clip's
 *    motion at the loop point is fast, so a crossfade still jumps (the sliding
 *    edge lands ~80px apart across the fade window), i.e. it buys a soft
 *    transition and does NOT buy a seamless one. It also cost the clip's whole
 *    opening beat, which is half the idea. So the file keeps its full duration
 *    and <video loop> cuts back to frame 0 — which reads as the sequence
 *    restarting, because that is exactly what it is.
 * 3. STRIPS AUDIO. These are decoration; a muted autoplaying video must carry
 *    no track at all, or some browsers still fetch it.
 * 4. EMITS TWO CODECS AND A POSTER. VP9/webm first (smaller), h264/mp4 as the
 *    fallback, and a still for the poster attribute — which is what
 *    reduced-motion visitors, JS-off readers and the first paint all see.
 *    The poster is the clip's own settled END STATE (the finished
 *    composition), which is the frame worth showing when motion is off.
 *
 * FILENAMES CARRY A VERSION. /video/* ships an immutable year-long cache
 * header (netlify.toml), exactly like /img/*, so a re-encode under the same
 * name would never reach a repeat visitor. Bump VERSION and update the
 * component's own constant when a clip is replaced.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const SRC_DIR = join(ROOT, 'video-src')
const OUT_DIR = join(ROOT, 'public', 'video')

/** PAIRED with PLATE_VERSION in src/components/PillarsSection.vue. */
const VERSION = 'v1'

/**
 * THE PLATE RATIO, and it is arithmetic rather than taste. The wall is three
 * plates split 3 : 1 : 1 (PillarsSection), so the majority plate is 60% of the
 * row: at 1440 that is ~773 wide against a ~592-tall wall, i.e. 1.31 : 1. 4:3
 * (1.333) is the clean ratio just above it — deliberately a shade generous,
 * because the wall's height follows its content, and a crop that is slightly
 * too WIDE only means `cover` trims a few per cent while one too narrow would
 * letterbox. Anything wider than this is never visible even in the majority
 * state, so cropping here throws away nothing and is paid back in bytes.
 *
 * THE MINORITY PLATE IS WHAT CONSTRAINS THE FOOTAGE: at 20% of the row it is
 * ~258 × 592, i.e. 0.44 : 1, so `cover` shows only 0.44/1.333 ≈ 33% of the
 * frame's width — its CENTRAL THIRD. Anything that has to survive in a
 * shrunken plate must be composed inside that third; the generation prompts
 * carry the same rule.
 */
const TARGET_RATIO = 4 / 3

/**
 * Per-source treatment. `cropBottom` is the watermark strip, in SOURCE pixels,
 * measured off a still: the Kling badge sits in the bottom-right corner, about
 * 55px up from the bottom of a 720-tall frame, and 75 clears it with margin.
 * Check a still before trusting a number here — it differs with frame height.
 */
const CLIPS = {
  design: { cropBottom: 75 },
  security: { cropBottom: 75 },
  seo: { cropBottom: 75 },
}

/** Three of these decode at once, so quality is spent carefully. VP9 first
 *  (roughly half the h264 bytes on this footage), h264 as the fallback. */
const VP9_CRF = 42
const H264_CRF = 30

function ff(args) {
  return execFileSync('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] })
}

function probe(file) {
  const out = execFileSync(
    'ffprobe',
    [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,r_frame_rate:format=duration',
      '-of', 'json',
      file,
    ],
    { encoding: 'utf8' },
  )
  const j = JSON.parse(out)
  const [num, den] = String(j.streams[0].r_frame_rate).split('/').map(Number)
  return {
    width: j.streams[0].width,
    height: j.streams[0].height,
    fps: den ? num / den : 24,
    duration: Number(j.format.duration),
  }
}

function kb(file) {
  return Math.round(statSync(file).size / 1024)
}

/** yuv420p subsamples chroma 2×2, so every crop dimension has to be even. */
function even(n) {
  return n - (n % 2)
}

if (!existsSync(SRC_DIR)) {
  console.error(`MISS: no ${SRC_DIR}. Put raw clips there as <pillar-id>.mp4.`)
  process.exit(1)
}
mkdirSync(OUT_DIR, { recursive: true })

const sources = readdirSync(SRC_DIR).filter((f) => f.endsWith('.mp4'))
if (!sources.length) {
  console.error(`MISS: ${SRC_DIR} holds no .mp4`)
  process.exit(1)
}

for (const file of sources) {
  const id = file.replace(/\.mp4$/, '')
  const cfg = CLIPS[id]
  if (!cfg) {
    console.error(`MISS: no CLIPS entry for "${id}" — add one or rename the source.`)
    process.exit(1)
  }
  const src = join(SRC_DIR, file)
  const { width, height, duration } = probe(src)
  // Watermark off the bottom first, then centre-crop what is left to the
  // plate's ratio. Even numbers: yuv420p subsamples chroma 2×2 and both
  // encoders reject an odd dimension.
  const cropH = even(height - cfg.cropBottom)
  const cropW = even(Math.min(width, Math.round(cropH * TARGET_RATIO)))
  const cropX = even(Math.round((width - cropW) / 2))
  const vf = `crop=${cropW}:${cropH}:${cropX}:0`

  const mp4 = join(OUT_DIR, `pillar-${id}-${VERSION}.mp4`)
  const webm = join(OUT_DIR, `pillar-${id}-${VERSION}.webm`)
  const poster = join(OUT_DIR, `pillar-${id}-${VERSION}.jpg`)

  // h264 — the fallback everything plays. yuv420p + faststart or Safari and
  // every in-app browser refuse it.
  ff([
    '-v', 'error', '-y',
    '-i', src,
    '-vf', vf,
    '-an',
    '-c:v', 'libx264', '-preset', 'veryslow', '-crf', String(H264_CRF),
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    mp4,
  ])

  // VP9 — smaller on flat, grainy footage like this.
  ff([
    '-v', 'error', '-y',
    '-i', src,
    '-vf', vf,
    '-an',
    '-c:v', 'libvpx-vp9', '-crf', String(VP9_CRF), '-b:v', '0', '-row-mt', '1',
    '-deadline', 'good', '-cpu-used', '1',
    '-pix_fmt', 'yuv420p',
    webm,
  ])

  // The poster: the source's own settled end state, cropped the same way.
  ff([
    '-v', 'error', '-y',
    '-ss', String(Math.max(0, duration - 0.15)), '-i', src,
    '-vf', vf,
    '-frames:v', '1', '-q:v', '6',
    poster,
  ])

  console.log(
    `${id}: ${width}×${height} → ${cropW}×${cropH} (${(cropW / cropH).toFixed(2)}:1) ${duration.toFixed(2)}s · ` +
      `mp4 ${kb(mp4)}kB · webm ${kb(webm)}kB · poster ${kb(poster)}kB`,
  )
}

console.log('OK')
