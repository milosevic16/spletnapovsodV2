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
 * Per-source treatment. `cropBottom` is the watermark strip, in SOURCE pixels,
 * measured off a still — the Kling badge sits ~85px up from the bottom of a
 * 1280-tall frame, and 110 clears it with margin.
 */
const CLIPS = {
  design: { cropBottom: 110 },
  security: { cropBottom: 110 },
  seo: { cropBottom: 110 },
}

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
  const cropH = height - cfg.cropBottom
  const vf = `crop=${width}:${cropH}:0:0`

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
    '-c:v', 'libx264', '-preset', 'veryslow', '-crf', '27',
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    mp4,
  ])

  // VP9 — smaller on flat, grainy footage like this.
  ff([
    '-v', 'error', '-y',
    '-i', src,
    '-vf', vf,
    '-an',
    '-c:v', 'libvpx-vp9', '-crf', '40', '-b:v', '0', '-row-mt', '1',
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
    `${id}: ${width}×${height} ${duration.toFixed(2)}s → ${width}×${cropH}, watermark cropped · ` +
      `mp4 ${kb(mp4)}kB · webm ${kb(webm)}kB · poster ${kb(poster)}kB`,
  )
}

console.log('OK')
