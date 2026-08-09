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
 * name would never reach a repeat visitor. Bump the file's version constant
 * below AND its pair in the consuming component when a clip is replaced.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const SRC_DIR = join(ROOT, 'video-src')
const OUT_DIR = join(ROOT, 'public', 'video')

/**
 * PAIRED with the version constant in whichever component consumes the file:
 * PLATE_VERSION in src/components/PillarsSection.vue, CLIP_VERSION in
 * src/components/StatementSection.vue. /video/* is immutable-cached, so a
 * re-encode must bump its pair — and only that pair. The two move
 * independently on purpose: renaming a file whose bytes did not change buys a
 * repeat visitor nothing and costs an edit in a component that had no reason
 * to be touched.
 */
const PLATE_VERSION = 'v3'
const BAND_VERSION = 'v1'

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
 * Per-source treatment.
 *
 * `cropBottom` is the watermark strip, in SOURCE pixels, measured off a still:
 * the Kling badge sits in the bottom-right corner — on all three of these
 * 720-tall frames it occupies y 675..695, so 75 clears it with 30px to spare.
 * Check a still before trusting a number here; it moves with frame height (a
 * 1280-tall source put the same badge at y 1230..1257).
 *
 * `band` is the crop's TOP edge, and it only means anything for a PORTRAIT
 * source: there the plate's landscape ratio is satisfied long before the frame
 * runs out of height, which leaves a real vertical choice — 665px of it on a
 * 720×1280 clip — and that choice has to be MEASURED off the footage, never
 * eyeballed. A landscape source has none: the crop already spans every row the
 * watermark left, so cropY can only be 0 and these three omit it. The guard in
 * the loop refuses a band that would not fit, which is what catches a `band`
 * left behind from a portrait clip after a landscape one replaces it.
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

/**
 * BANDS — clips that are not plates. The hero's »POVSOD« is a row of letters
 * about 5.16 times wider than it is tall (950 × 184 at 1440, and the ratio is a
 * property of the string, so it holds at every size), and a video shown through
 * it can only ever be a horizontal STRIP of its frame. So the strip is chosen
 * here, at encode time, instead of being left to `cover` to pick at display
 * time: the file ends up the shape of the word, every pixel in it is seen, and
 * it weighs almost nothing. 720 / 5.16 = 139.5, hence h 140.
 *
 * `crop` is in SOURCE pixels, measured off a still — y=600 is the band where
 * all three of the clip's scenes carry something (the slat stack, the drawn A's
 * legs, the graphite block against the red bar); measured YAVG per band, 600
 * was the densest of five candidates.
 *
 * `grade` IS NOT TASTE, IT IS LEGIBILITY, and it is also the concept. The clip
 * is paper-on-paper studio footage: its own paper measures Y≈214, the sheet it
 * would be seen through is #ece8de (Y≈232). Ungraded, the letters showing that
 * paper vanish into the ground — measured, and visible in the first render.
 * The factor is MEASURED, not derived. Method: decode the graded band, take
 * each frame’s 95th-percentile luminance (what a letter-sized area can land
 * on) and compute its contrast against the sheet. The clip’s worst beat is the
 * flat pencil-drawing one; it lands at 3.7 : 1 with a 0.55 multiplier and
 * 4.8 : 1 with 0.47. Both clear the 3 : 1 floor for display type — 0.47 is the
 * one taken, because below the cut the word is POCHÉ and poché is dark, and
 * because it keeps the darks proportional rather than crushing them. The
 * saturation lift keeps the red bar reading as the site's own red through it.
 * Conceptually the darkening is the same move as the concept: the window looks
 * into a dimmer interior, which is what a window in a section drawing does.
 */
const BANDS = {
  'hero-povsod': {
    source: 'hero-povsod.mp4',
    crop: { w: 720, h: 140, x: 0, y: 600 },
    grade: "lutyuv='y=val*0.47',eq=saturation=1.15",
  },
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

/** yuv420p subsamples chroma 2×2, so every crop dimension has to be even. */
function even(n) {
  return n - (n % 2)
}

if (!existsSync(SRC_DIR)) {
  console.error(`MISS: no ${SRC_DIR}. Put raw clips there as <pillar-id>.mp4.`)
  process.exit(1)
}
mkdirSync(OUT_DIR, { recursive: true })

// Band sources are handled separately below, so they are not plates.
const bandSources = new Set(Object.values(BANDS).map((b) => b.source))
const sources = readdirSync(SRC_DIR).filter((f) => f.endsWith('.mp4') && !bandSources.has(f))
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
  // Watermark off the bottom first, then take the LARGEST plate-ratio rectangle
  // that fits in what is left. WHICH DIMENSION BINDS DEPENDS ON THE SOURCE, and
  // getting it wrong fails silently: the first PORTRAIT clip through here
  // (720×1280) came out 720×1204 — 0.60:1 — because the old form assumed height
  // was the scarce one and only ever clamped the width. ffmpeg accepts that and
  // it plays; it simply is not the plate's ratio any more, which breaks the
  // `aspect-ratio: 4/3` the stacked phone plate declares against this encode.
  // So derive the width first and the height FROM it, and the output is the
  // target ratio whichever way the frame is turned. Even numbers throughout:
  // yuv420p subsamples chroma 2×2 and both encoders reject an odd dimension.
  const usableH = even(height - cfg.cropBottom)
  const cropW = even(Math.min(width, Math.round(usableH * TARGET_RATIO)))
  const cropH = even(Math.round(cropW / TARGET_RATIO))
  const cropX = even(Math.round((width - cropW) / 2))
  // Centred in the usable frame unless the clip names its own band (see CLIPS).
  const cropY = even(cfg.band ?? Math.round((usableH - cropH) / 2))
  if (cropY < 0 || cropY + cropH > usableH) {
    console.error(
      `MISS: "${id}" band ${cropY}..${cropY + cropH} falls outside the usable ${width}×${usableH}.`,
    )
    process.exit(1)
  }
  const vf = `crop=${cropW}:${cropH}:${cropX}:${cropY}`

  const mp4 = join(OUT_DIR, `pillar-${id}-${PLATE_VERSION}.mp4`)
  const webm = join(OUT_DIR, `pillar-${id}-${PLATE_VERSION}.webm`)
  const poster = join(OUT_DIR, `pillar-${id}-${PLATE_VERSION}.jpg`)

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
    `${id}: ${width}×${height} → ${cropW}×${cropH} at +${cropX}+${cropY} ` +
      `(${(cropW / cropH).toFixed(2)}:1) ${duration.toFixed(2)}s · ` +
      `mp4 ${kb(mp4)}kB · webm ${kb(webm)}kB · poster ${kb(poster)}kB`,
  )
}

for (const [name, cfg] of Object.entries(BANDS)) {
  const src = join(SRC_DIR, cfg.source)
  if (!existsSync(src)) {
    console.log(`skip band "${name}": no ${cfg.source} in video-src/`)
    continue
  }
  const { width, height, duration } = probe(src)
  const c = cfg.crop
  if (c.x + c.w > width || c.y + c.h > height) {
    console.error(`MISS: band "${name}" crop ${c.w}×${c.h}+${c.x}+${c.y} falls outside ${width}×${height}`)
    process.exit(1)
  }
  const vf = `crop=${even(c.w)}:${even(c.h)}:${even(c.x)}:${even(c.y)}` + (cfg.grade ? `,${cfg.grade}` : '')
  const mp4 = join(OUT_DIR, `${name}-${BAND_VERSION}.mp4`)
  const webm = join(OUT_DIR, `${name}-${BAND_VERSION}.webm`)
  const poster = join(OUT_DIR, `${name}-${BAND_VERSION}.jpg`)

  ff([
    '-v', 'error', '-y', '-i', src, '-vf', vf, '-an',
    '-c:v', 'libx264', '-preset', 'veryslow', '-crf', String(H264_CRF),
    '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-movflags', '+faststart',
    mp4,
  ])
  ff([
    '-v', 'error', '-y', '-i', src, '-vf', vf, '-an',
    '-c:v', 'libvpx-vp9', '-crf', String(VP9_CRF), '-b:v', '0', '-row-mt', '1',
    '-deadline', 'good', '-cpu-used', '1', '-pix_fmt', 'yuv420p',
    webm,
  ])
  ff([
    '-v', 'error', '-y', '-ss', String(Math.max(0, duration - 0.15)), '-i', src,
    '-vf', vf, '-frames:v', '1', '-q:v', '6',
    poster,
  ])

  console.log(
    `${name}: band ${c.w}×${c.h} at +${c.x}+${c.y} of ${width}×${height} ` +
      `(${(c.w / c.h).toFixed(2)}:1) · mp4 ${kb(mp4)}kB · webm ${kb(webm)}kB · poster ${kb(poster)}kB`,
  )
}

console.log('OK')
