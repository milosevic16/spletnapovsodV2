<script setup lang="ts">
/**
 * Kontakt — THE TITLE BLOCK, and sending it STAMPS THE SHEET.
 *
 * A drawing is signed off in its title block: the ruled panel that records who
 * asked, for what, and when. This form is that block — the one CENTRED thing
 * on the page (the extracted system's own rule: the single place that asks
 * something of the visitor is the single place that abandons the asymmetry),
 * ruled cell by cell, closed by the motif's heavy right edge.
 *
 * IT COMPLETES AS YOU FILL IT. Each cell's rule is dim until the field is
 * focused or holds a value, then it inks — the reference's measured field
 * behaviour (focus and filled are the SAME state) doing the concept's work:
 * the block visibly fills in, and what is left to do is legible at a glance
 * without a single word of instruction.
 *
 * SENDING STAMPS IT. The success state the reference never authored is a seal
 * landing on the block, off-angle, over its corner — one impact, once, and the
 * live region still carries the words. That is the one moment of theatre here,
 * and it belongs to the only irreversible action on the page.
 *
 * The topic is CHIPS, not a select: exclusive radios styled as the system's
 * chips, so every option is visible, each is a 44px target, arrow keys move
 * between them, and no dropdown opens over the sheet on a phone.
 *
 * The machinery underneath is unchanged and deliberately boring: a real
 * <form>, client-side POST to Web3Forms wired in mount, honeypot plus a
 * render-time stamp (both silent for real people), named missing fields with
 * aria-invalid and focus moved to the first offender, a live region that
 * exists from first render, and degrade-open — with no key or a failed
 * request the visitor is pointed at the e-mail already on the page.
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { contact } from '@/content/home'
import { CONTACT_EMAIL } from '@/lib/constants'
import { createFx, prefersReducedMotion } from '@/lib/fx'

/**
 * Subpage variants of the one shared form. The apartment page adds a package
 * chip row and relabels the message field; the home page passes nothing and
 * gets the form exactly as before. Undeclared = home behaviour, so a future
 * page cannot half-configure it by accident.
 */
const props = defineProps<{
  /** Chip options for a »which tier« row; values are machine ids (English). */
  packageChoices?: { value: string; label: string }[]
  packageLabel?: string
  messageLabel?: string
}>()

const fx = createFx()
const sending = ref(false)
const status = ref<'idle' | 'success' | 'error'>('idle')
const statusText = ref('')
const progressEl = ref<HTMLElement | null>(null)
const sealEl = ref<HTMLElement | null>(null)

const name = ref('')
const email = ref('')
const topic = ref('')
const message = ref('')
const botcheck = ref('')
/** The chosen package (apartment page only). Optional by design: the tiers are
 *  an aid, not a gate — nobody is refused for not having picked one yet. */
const pkg = ref('')

/** Field ids currently in error — drives aria-invalid + focus on first offender. */
const invalidFields = ref<Set<string>>(new Set())

/** Progress line cap — the request rarely takes longer; the line never loops. */
const PROGRESS_CAP_MS = 4000
/** Sub-2s submissions are bots, not typists. */
const MIN_FILL_MS = 2000
/** The seal's impact: fast, decisive, no overshoot. */
const SEAL_MS = 420
let renderedAt = 0
let progress: Animation | null = null

onMounted(() => {
  renderedAt = Date.now()
})

function startProgress() {
  const line = progressEl.value
  if (!line) return
  // fill:'forwards' so a slower-than-cap request holds the full bar instead of
  // snapping back mid-flight; the settle is stopProgress() in the finally block.
  progress = fx.anim(line, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
    duration: PROGRESS_CAP_MS,
    easing: 'linear',
    fill: 'forwards',
  })
}

function stopProgress() {
  progress?.cancel()
  progress = null
}

/** The stamp landing. Last keyframe equals the stylesheet's rest (the seal is
 *  simply present once status is success), so fill:'none' leaves nothing to
 *  defend and it is cancel-safe at any instant. Reduced motion skips the
 *  impact — the seal is still there, it just does not arrive. */
function stamp() {
  if (prefersReducedMotion()) return
  const el = sealEl.value
  if (!el) return
  fx.anim(
    el,
    [
      { transform: 'rotate(-12deg) scale(1.65)', opacity: 0 },
      { transform: 'rotate(-12deg) scale(1)', opacity: 1 },
    ],
    { duration: SEAL_MS, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'none' },
  )
}

function fail(text: string) {
  status.value = 'error'
  statusText.value = text
}

function focusField(id: string) {
  document.getElementById(id)?.focus()
}

/** A stamped block that has been written in again would be lying: the first
 *  keystroke after a send clears the seal and the status line. */
function onEdit() {
  if (status.value === 'idle') return
  status.value = 'idle'
  statusText.value = ''
}

async function onSubmit() {
  status.value = 'idle'
  statusText.value = ''
  invalidFields.value = new Set()

  // Error identification (WCAG 3.3.1): name the missing fields, mark them
  // aria-invalid, and move focus to the first one.
  const missing: { id: string; label: string }[] = []
  if (!name.value.trim()) missing.push({ id: 'f-name', label: contact.form.nameLabel })
  if (!email.value.trim()) missing.push({ id: 'f-email', label: contact.form.emailLabel })
  if (!topic.value) missing.push({ id: 'f-topic', label: contact.form.feedback.topicShort })
  if (!message.value.trim())
    missing.push({ id: 'f-message', label: props.messageLabel ?? contact.form.messageLabel })
  if (missing.length) {
    invalidFields.value = new Set(missing.map((m) => m.id))
    fail(`${contact.form.feedback.required} ${missing.map((m) => m.label.toLowerCase()).join(', ')}.`)
    focusField(missing[0]!.id)
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    invalidFields.value = new Set(['f-email'])
    fail(contact.form.feedback.invalidEmail)
    focusField('f-email')
    return
  }
  // Bot filters — both silent for real people.
  if (botcheck.value !== '' || Date.now() - renderedAt < MIN_FILL_MS) {
    status.value = 'success'
    statusText.value = contact.form.feedback.success
    stamp()
    return
  }

  const key = import.meta.env.VITE_WEB3FORMS_KEY
  if (!key) {
    fail(contact.form.feedback.error)
    return
  }

  sending.value = true
  startProgress()
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: key,
        // Machine identifier stays English — the inbox stays sortable.
        subject: `[spletnapovsod.si] ${topic.value}`,
        name: name.value.trim(),
        email: email.value.trim(),
        topic: topic.value,
        // Present only when the page has the chip row AND the visitor chose.
        ...(pkg.value ? { package: pkg.value } : {}),
        message: message.value.trim(),
      }),
    })
    const data = (await res.json()) as { success?: boolean }
    if (res.ok && data.success) {
      status.value = 'success'
      statusText.value = contact.form.feedback.success
      name.value = ''
      email.value = ''
      topic.value = ''
      pkg.value = ''
      message.value = ''
      stamp()
    } else {
      fail(contact.form.feedback.error)
    }
  } catch {
    fail(contact.form.feedback.error)
  } finally {
    sending.value = false
    stopProgress()
  }
}

onUnmounted(() => fx.dispose())
</script>

<template>
  <section id="kontakt" class="contact press">
    <div class="container">
      <header class="contact__head">
        <p class="kicker kicker--on-dark">{{ contact.kicker }}</p>
        <h2 class="contact__title">{{ contact.title }}</h2>
        <p class="contact__lead">{{ contact.intro }}</p>
        <p class="contact__mail">
          <a :href="`mailto:${CONTACT_EMAIL}`" class="contact__mail-link emisija">{{
            CONTACT_EMAIL
          }}</a>
        </p>
      </header>

      <div class="contact__body">
      <div class="contact__rail">
      <!-- What happens after sending — a genuinely sequential process, which is
           the one case the house rules let carry numbers. -->
      <section class="contact__steps" :aria-label="contact.stepsTitle">
        <p class="contact__steps-title annot">{{ contact.stepsTitle }}</p>
        <ol class="contact__steps-list">
          <li v-for="(s, i) in contact.steps" :key="s.label" class="contact__step">
            <span class="contact__step-index" aria-hidden="true">{{
              String(i + 1).padStart(2, '0')
            }}</span>
            <span class="contact__step-label">{{ s.label }}</span>
            <span class="contact__step-detail">{{ s.detail }}</span>
          </li>
        </ol>
      </section>

      <!-- THE CONSTRUCTION FIGURE — the mark's own geometry as a drafting
           exercise: two circles at the artwork's true spacing (centres 1.124
           radii apart), the crossing lens hatched at 45°, centre ticks. Pure
           decoration on the sheet: aria-hidden, text-free, desktop only. -->
      <svg class="contact__orna" viewBox="0 0 334 222" aria-hidden="true">
        <defs>
          <pattern
            id="orna-hatch"
            width="7"
            height="7"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="7" stroke="var(--grafit-inset)" stroke-width="1.4" />
          </pattern>
          <clipPath id="orna-clip"><circle cx="111" cy="111" r="100" /></clipPath>
        </defs>
        <g clip-path="url(#orna-clip)">
          <circle cx="223.4" cy="111" r="100" fill="url(#orna-hatch)" />
        </g>
        <circle cx="111" cy="111" r="100" fill="none" stroke="var(--crta-na-temnem)" stroke-width="1.5" />
        <circle cx="223.4" cy="111" r="100" fill="none" stroke="var(--crta-na-temnem)" stroke-width="1.5" />
        <line
          x1="111"
          y1="111"
          x2="223.4"
          y2="111"
          stroke="var(--crta-na-temnem)"
          stroke-width="1"
          stroke-dasharray="2 5"
        />
        <path d="M105 111h12M111 105v12" stroke="var(--rez-na-temnem)" stroke-width="1.5" fill="none" />
        <path d="M217.4 111h12M223.4 105v12" stroke="var(--crta-na-temnem)" stroke-width="1.5" fill="none" />
      </svg>
      </div>

      <!-- THE TITLE BLOCK. method="post": with JS disabled a bare <form> would
           GET-navigate and leak the message into the URL/history; a POST leaks
           nothing. -->
      <form
        class="form"
        :class="{ 'form--stamped': status === 'success' }"
        method="post"
        novalidate
        @submit.prevent="onSubmit"
        @input="onEdit"
      >
        <div class="form__cell form__cell--half">
          <label class="form__label" for="f-name">{{ contact.form.nameLabel }}</label>
          <input
            id="f-name"
            v-model="name"
            class="form__input"
            type="text"
            name="name"
            autocomplete="name"
            placeholder=" "
            :aria-invalid="invalidFields.has('f-name') || undefined"
            required
          />
        </div>

        <div class="form__cell form__cell--half">
          <label class="form__label" for="f-email">{{ contact.form.emailLabel }}</label>
          <input
            id="f-email"
            v-model="email"
            class="form__input form__input--plain"
            type="email"
            name="email"
            autocomplete="email"
            placeholder=" "
            :aria-invalid="invalidFields.has('f-email') || undefined"
            required
          />
        </div>

        <!-- Chips, not a dropdown: every option visible, each its own 44px
             target, arrow keys between them, nothing opening over the sheet. -->
        <fieldset class="form__cell form__cell--chips">
          <legend class="form__label">{{ contact.form.topicLabel }}</legend>
          <div class="form__chips">
            <label
              v-for="(t, i) in contact.topics"
              :key="t.value"
              class="form__chip"
              :class="{ 'form__chip--on': topic === t.value }"
            >
              <input
                :id="i === 0 ? 'f-topic' : `f-topic-${t.value}`"
                v-model="topic"
                class="form__chip-input"
                type="radio"
                name="topic"
                :value="t.value"
                :required="i === 0"
                :aria-invalid="invalidFields.has('f-topic') || undefined"
              />
              <span class="form__chip-face">{{ t.label }}</span>
            </label>
          </div>
        </fieldset>

        <!-- The tier chips — apartment page only (prop-driven). Same chip
             mechanics as the topic row; optional, so no required/invalid
             wiring: the tiers are an aid, not a gate. -->
        <fieldset v-if="props.packageChoices?.length" class="form__cell form__cell--chips">
          <legend class="form__label">{{ props.packageLabel }}</legend>
          <div class="form__chips">
            <label
              v-for="(p, i) in props.packageChoices"
              :key="p.value"
              class="form__chip"
              :class="{ 'form__chip--on': pkg === p.value }"
            >
              <input
                :id="i === 0 ? 'f-package' : `f-package-${p.value}`"
                v-model="pkg"
                class="form__chip-input"
                type="radio"
                name="package"
                :value="p.value"
              />
              <span class="form__chip-face">{{ p.label }}</span>
            </label>
          </div>
        </fieldset>

        <div class="form__cell">
          <label class="form__label" for="f-message">{{
            props.messageLabel ?? contact.form.messageLabel
          }}</label>
          <textarea
            id="f-message"
            v-model="message"
            class="form__input form__textarea"
            name="message"
            rows="5"
            placeholder=" "
            :aria-invalid="invalidFields.has('f-message') || undefined"
            required
          ></textarea>
        </div>

        <!-- Honeypot — invisible to people, irresistible to bots. -->
        <div class="form__hp" aria-hidden="true">
          <label for="f-botcheck">Pustite prazno</label>
          <input
            id="f-botcheck"
            v-model="botcheck"
            type="text"
            name="botcheck"
            tabindex="-1"
            autocomplete="off"
          />
        </div>

        <div class="form__issue">
          <button class="form__submit" type="submit" :disabled="sending">
            <span ref="progressEl" class="form__progress" aria-hidden="true"></span>
            <span class="form__submit-label">{{
              sending ? contact.form.feedback.submitting : contact.form.submitLabel
            }}</span>
          </button>
        </div>

        <!-- Live region exists from first render — a region inserted together
             with its text is routinely missed by screen readers. -->
        <p class="form__status" :class="`form__status--${status}`" role="status" aria-live="polite">
          <svg
            v-if="status === 'error'"
            class="form__glyph"
            viewBox="0 0 16 16"
            width="16"
            height="16"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
          <span>{{ statusText }}</span>
        </p>

        <p class="form__privacy">{{ contact.form.privacyNote }}</p>

        <!-- THE SEAL: the success state, landing off-angle over the block's
             corner. Decorative — the live region above carries the words. -->
        <span v-if="status === 'success'" ref="sealEl" class="form__seal" aria-hidden="true">
          <svg viewBox="0 0 200 200" width="132" height="132">
            <circle cx="100" cy="100" r="88" class="seal-ring" />
            <circle cx="100" cy="100" r="74" class="seal-ring seal-ring--thin" />
            <!-- The tick collar: one dashed stroke between the rings does the
                 work of two dozen marks. -->
            <circle cx="100" cy="100" r="81" class="seal-ticks" />
            <!-- The pd mark, same geometry as the hero's — see
                 StatementSection for the construction. the artwork scaled to 100
                 wide, centred on the seal's own axis. -->
            <g transform="translate(50 67.92) scale(0.098061) translate(-116.2 -287.19)">
              <circle cx="443.34" cy="614.33" r="327.14" fill="var(--rez-na-temnem)" />
              <circle cx="808.92" cy="614.11" r="327.04" fill="var(--rez-na-temnem)" />
              <path fill="var(--zemlja)" fill-rule="evenodd" d="M268.03 829.73C261.27 828.75 255.08 826.61 250.25 823.57C247.88 822.09 243.97 819.1 242.07 817.33C237.72 813.27 233.82 806.97 232.8 802.36C232.02 798.8 231.83 785.73 231.4 704.24C231.24 675.28 231.62 619.94 232.05 608.24C232.31 601.1 232.93 590.97 233.31 587.58C233.44 586.41 233.72 583.89 233.93 581.97C234.45 577.29 235.13 573.07 236.15 568.28C236.62 566.08 237.46 562.05 238.02 559.31C239.5 552.05 240.13 549.64 241.88 544.37C243.39 539.83 243.89 538.48 247.3 529.8C248.67 526.3 254.47 514.5 257.88 508.26C259.92 504.54 263.71 498.54 266.77 494.19C268.26 492.07 270.53 488.82 271.8 486.98C279.19 476.28 291.58 462.21 302.16 452.51C309.77 445.52 317.85 439.02 324.64 434.4C333.25 428.55 342.91 422.59 347.72 420.16C352 417.99 363.24 412.51 363.41 412.51C363.49 412.51 364.07 412.28 364.7 411.99C365.33 411.7 367.88 410.69 370.36 409.73C383.88 404.52 385.81 403.9 396.35 401.3C409.55 398.04 415.33 397.05 428.43 395.83C464.09 392.48 501.33 397.91 531.16 410.79C540.33 414.75 546.92 417.86 551.42 420.36C560.9 425.62 563.24 427.03 569.36 431.19C574.46 434.65 583.72 441.5 584.94 442.7C585.13 442.89 586.19 443.75 587.28 444.62C588.38 445.49 590.06 446.89 591.02 447.75C591.97 448.6 593.77 450.17 595 451.23C599.84 455.39 609.79 465.57 615.46 472.16C618.6 475.81 623.72 482.08 625.43 484.35C626.45 485.72 627.36 486.87 627.46 486.9C627.55 486.93 627.89 486.52 628.22 485.98C628.55 485.45 629.28 484.53 629.85 483.94C631.34 482.37 634.52 478.59 637.48 474.88C643.98 466.74 649.53 460.95 658.88 452.58C669.3 443.25 677.26 437.35 689.75 429.69C692.01 428.31 694.03 427.07 694.24 426.94C694.44 426.81 694.78 426.63 694.98 426.54C695.19 426.45 695.64 426.19 695.98 425.96C696.32 425.73 697.22 425.2 697.97 424.79C699.27 424.08 700.01 423.66 702.14 422.43C704.07 421.32 707.4 419.67 710.17 418.45C711.75 417.75 713.82 416.81 714.78 416.37C715.74 415.92 717.49 415.1 718.67 414.55C723.82 412.16 740.68 406.32 747.56 404.56C765.3 400.01 784.56 397.59 803.18 397.58C828.74 397.56 852.93 401.44 873.04 408.78C888.89 414.57 897.04 418.29 913.5 427.28C916.43 428.88 922.6 432.55 925.45 434.39C927.11 435.46 929.85 437.14 938.49 442.39C941.02 443.93 942.37 444.62 942.49 444.43C942.58 444.27 942.8 442.15 942.97 439.72C944.08 423.97 947.54 414.97 955.39 407.45C958.51 404.45 959.89 403.45 964.34 400.94C972.56 396.31 977.95 395.32 986.8 396.84C994.43 398.14 1001.81 402.09 1008.11 408.23C1012.73 412.73 1015.58 418.01 1016.57 423.9C1018.17 433.36 1018.84 470.97 1018.83 549.72C1018.82 608.48 1018.62 619.38 1017.21 636.1C1015.62 655.1 1012.44 670.92 1006.86 687.63C1005.98 690.28 1004.83 693.53 1004.3 694.86C1002.28 699.93 997.25 710.47 995.31 713.71C994.07 715.76 993.94 716 991.58 720.18C988.58 725.48 985.61 729.98 980.21 737.41C975.93 743.29 971.84 748.34 965.81 755.16C962.41 759.01 951.83 769.67 948.11 772.99C945.73 775.12 945.02 775.74 940.77 779.37C938.23 781.53 935.54 783.69 933.3 785.36C932.27 786.12 930.18 787.7 928.66 788.86C926.27 790.68 922.94 793.06 921.63 793.89C921.42 794.03 920.06 794.92 918.61 795.87C915.43 797.98 910.14 801.19 907.77 802.47C905.32 803.8 903.68 804.72 902.67 805.34C901.68 805.96 893.12 810.2 892.87 810.2C892.71 810.2 890.97 810.98 887.48 812.63C883.76 814.38 882.72 814.78 874.78 817.56C870.55 819.04 861.76 821.74 858.72 822.5C856.47 823.06 843.48 825.63 841.04 826C830.98 827.51 826.49 827.98 818.75 828.37C808.92 828.86 802.51 828.93 794.47 828.65C781.63 828.19 773.65 827.39 763.34 825.51C751.53 823.35 748.63 822.64 738.17 819.29C726.11 815.44 721.36 813.59 711.05 808.69C707.58 807.05 695.94 800.67 693.05 798.83C692.33 798.38 691.68 798 691.61 798C691.54 798 691.17 797.79 690.8 797.52C690.43 797.26 688.39 795.9 686.27 794.5C684.14 793.1 681.51 791.29 680.42 790.49C679.32 789.68 677.09 788.06 675.46 786.88C665.13 779.43 650.22 766.08 641.56 756.53C641.14 756.07 640.44 755.3 640 754.82C639.57 754.34 638.51 753.13 637.66 752.13C636.81 751.13 635.42 749.58 634.58 748.69C631.81 745.76 629.11 742.62 627.9 740.91C627.24 739.99 626.56 739.23 626.37 739.23C626.19 739.23 625.5 739.87 624.84 740.66C624.18 741.45 623.58 742.15 623.51 742.22C623.44 742.29 621.93 744.18 620.15 746.43C615.73 752.01 611.65 756.61 605.86 762.52C601.61 766.86 593.04 774.89 589.65 777.71C588.16 778.94 586.08 780.71 584.68 781.94C583.43 783.03 575.84 788.81 572.63 791.11C570.7 792.5 562.91 797.73 562.38 798C562.24 798.07 561.46 798.56 560.65 799.08C559.84 799.61 557.6 800.93 555.67 802.01C553.74 803.1 552 804.09 551.79 804.22C549.51 805.66 543.52 808.73 539.72 810.4C538.48 810.95 536.36 811.92 534.99 812.56C530.53 814.66 526.58 816.16 516.93 819.41C513.99 820.41 511.4 821.31 511.18 821.43C509.64 822.23 495.57 825.28 485.55 826.99C473.72 829 469.17 829.37 453.56 829.54C437.86 829.72 428.6 829.2 417.57 827.52C412.73 826.78 396.35 823.36 391.67 822.12C387.83 821.09 378.14 817.88 372.62 815.8C358.36 810.43 343.03 802.83 329.42 794.39C327.84 793.41 324.14 791.12 321.2 789.29C318.25 787.47 314.87 785.36 313.68 784.62C312.43 783.83 311.39 783.34 311.22 783.44C311.01 783.57 310.97 784.16 311.07 785.42C311.5 790.44 310.16 797.62 307.39 805.17C306.22 808.36 303.61 812.93 301.72 815.08C300.33 816.68 293.98 822.22 292.17 823.43C288.45 825.92 283.41 828.05 278.62 829.16C276.56 829.64 269.88 829.99 268.03 829.73ZM810.9 750.44C821.01 750 828.84 748.81 839.67 746.08C847.8 744.02 850.86 742.94 860.24 738.78C866.27 736.11 867.33 735.56 871.54 732.96C879.16 728.25 878.55 728.68 886.48 722.65C888.06 721.45 890.02 719.91 890.84 719.23C893.15 717.33 899.2 711.75 900.44 710.39C901.05 709.72 902.78 707.9 904.29 706.34C907.17 703.35 912.39 697.08 915.16 693.28C920.02 686.6 923.39 681.1 926.8 674.25C930.85 666.14 931.51 664.48 934.63 654.77C938.39 643.09 939.31 638.74 940.66 626.17C941.2 621.18 941.4 608.65 941.04 603.1C940.25 591.15 937.64 579.35 932.75 565.66C930.7 559.92 925.38 548.77 922.05 543.25C919.01 538.2 916.27 533.96 914.88 532.17C914.14 531.21 912.8 529.47 911.91 528.31C903.16 516.93 891.59 506.13 880.08 498.59C871.87 493.21 861.97 487.95 854.73 485.1C838.58 478.75 817.36 475.07 799.95 475.6C784.25 476.07 765.56 479.95 751.76 485.6C741.28 489.89 738.47 491.26 732.37 495.07C732.15 495.2 731.4 495.65 730.72 496.05C728.08 497.6 723.15 500.93 721.13 502.53C712.45 509.37 708.55 512.9 702.52 519.37C685.96 537.14 676.37 554.86 670.25 578.98C669.15 583.3 667.76 589.98 667.48 592.31C667.4 592.92 667.12 595 666.86 596.91C666.03 602.91 665.76 607.15 665.77 614.1C665.78 621.57 666.05 625.58 666.99 632.4C669.06 647.38 674.61 664.97 680.97 676.73C684.86 683.9 694.07 697.6 698.28 702.45C704.69 709.84 708.63 713.81 715.15 719.47C726.13 728.99 738.01 736.12 751.24 741.14C762.7 745.49 768.88 747.08 781.01 748.8C788.18 749.82 791.98 750.19 797.95 750.43C804.53 750.69 805.18 750.69 810.9 750.44ZM463.14 748.09C471.68 747.13 482.71 744.95 488.67 743.06C491.15 742.27 504.15 737.33 506.86 736.14C508.8 735.3 511.05 734.08 516.81 730.78C520.77 728.51 522.22 727.56 527.64 723.69C532.23 720.41 534.67 718.56 535.23 717.95C535.37 717.8 537.28 716.1 539.47 714.16C544 710.16 545.61 708.54 550.41 703.14C554.77 698.24 556.08 696.62 559.39 692.04C568.32 679.71 573.31 669.7 578.69 653.32C579.88 649.72 580.96 645.22 581.91 639.99C585.61 619.5 585.83 604.63 582.7 586.08C581.57 579.39 579.95 573.39 577.27 566.03C574.25 557.74 572.13 552.9 569.39 548.04C568.79 546.98 567.77 545.1 567.11 543.87C565.99 541.76 564.2 538.97 561.05 534.41C558.21 530.29 556.06 527.62 550.52 521.32C543.26 513.06 532.12 503.44 523.53 498.01C512.37 490.96 500.29 485.5 488.08 482.01C481.03 479.99 472.12 478.28 463.14 477.22C456.22 476.4 443.84 476.4 436.01 477.21C424.51 478.41 415.91 480.22 406.01 483.5C395.02 487.15 383.81 492.63 373.25 499.53C365.27 504.75 355.79 512.73 349.7 519.35C344.06 525.48 340.25 530.27 335.95 536.65C331.5 543.25 331.03 544.03 328.41 549.23C321.01 563.91 316.62 578.63 314.37 596.29C312.27 612.76 313.47 630.72 317.85 648.09C318.77 651.74 321.49 659.82 323.78 665.68C328.69 678.24 337.31 692.27 346.8 703.17C349.54 706.32 356.87 713.47 360.8 716.83C369.03 723.87 374.99 727.95 384.35 732.97C390.48 736.26 396.83 738.89 406.12 741.99C416.66 745.51 424.3 747.03 439.11 748.54C441.77 748.81 459.71 748.47 463.14 748.09Z" />
            </g>
          </svg>
        </span>
      </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  background-color: var(--zemlja);
  color: var(--list);
  padding-block: var(--section-block) clamp(3rem, 2.5rem + 3vw, 5rem);
}

.contact__head {
  max-width: 46rem;
}

.contact__title {
  margin-top: var(--space-3);
  font-size: var(--type-display-l-size);
  font-weight: var(--type-display-l-weight);
  line-height: var(--type-display-l-lh);
  letter-spacing: var(--type-display-l-ls);
  text-transform: uppercase;
  color: var(--list);
  max-width: 14ch;
}

.contact__lead {
  margin-top: var(--space-6);
  color: var(--papir-dim);
  max-width: 52ch;
}

.contact__mail {
  margin-top: var(--space-5);
}

.contact__mail-link {
  display: inline-block;
  padding-block: 0.7rem; /* 44px+ tap target */
  color: var(--rez-na-temnem);
  font-size: 1rem;
  text-decoration: underline;
  text-underline-offset: 0.3em;
}

/* --- what follows ------------------------------------------------------------- */
.contact__steps {
  margin-top: var(--space-16);
  border-top: var(--divider-width) solid var(--crta-na-temnem);
  padding-top: var(--space-4);
}

.contact__steps-title {
  color: var(--papir-dim);
  text-transform: uppercase;
  letter-spacing: 0.11em;
}

.contact__steps-list {
  list-style: none;
  margin-top: var(--space-6);
  display: grid;
  gap: var(--space-8);
}

.contact__step {
  display: grid;
  gap: var(--space-2);
  align-content: start;
}

.contact__step-index {
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  color: var(--rez-na-temnem);
}

.contact__step-label {
  font-weight: 500;
  color: var(--list);
}

.contact__step-detail {
  color: var(--papir-dim);
  font-size: 0.9375rem;
  line-height: 1.5;
}

/* --- the composition ------------------------------------------------------------
   One grid holds the process rail and the title block: stacked on phones,
   side by side on wide screens (rail left, block right) so the section reads
   as one spread instead of three bands. */
.contact__body {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.contact__rail .contact__steps {
  margin-top: var(--space-10);
}

/* The construction figure: decoration only, and only where there is room for
   it — phones never pay scroll for an ornament. */
.contact__orna {
  display: none;
}

/* --- the title block ----------------------------------------------------------
   The one centred block on the page, closed by the motif's heavy right edge. */
.form {
  position: relative;
  width: min(100%, 37.5rem); /* 600px — the extracted system's measure */
  margin: var(--space-20) auto 0;
  padding: var(--space-8) var(--space-8) var(--space-8) 0;
  border-top: 2px solid var(--list);
  border-right: 2px solid var(--list);
  padding-right: var(--space-8);
  display: grid;
  gap: var(--space-10);
}

.form__cell {
  display: grid;
  gap: var(--space-2);
  padding-left: var(--space-8);
  border: 0;
  margin: 0;
  min-width: 0;
}

.form__label {
  font-family: var(--font-mono);
  font-size: var(--type-label-size);
  font-weight: 500;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--papir-dim);
  padding: 0;
}

/* The field is a rule, not a box. Dim until the cell is being filled or
   holds a value — focus and filled are the SAME state (measured on the
   reference), which is what makes the block visibly complete itself. */
.form__input {
  width: 100%;
  background: none;
  border: 0;
  border-bottom: 2px solid var(--color-input-line);
  border-radius: 0;
  padding: var(--space-3) 0;
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  text-transform: uppercase;
  color: var(--list);
  /* The reference transitions background and box-shadow only — the rule
     snaps. Kept: a rule that fades reads as a hover effect, not a state. */
  transition: none;
}

/* The e-mail and the message keep the case the visitor typed. */
.form__input--plain,
.form__textarea {
  text-transform: none;
}

/* THE ONE FIELD THAT IS A BOX. Every other field is a rule, because a rule is
   enough to say »type here« for one line. The free-text field is the only one
   whose EXTENT matters (how much may I write?), and a bottom rule alone leaves
   its height invisible — so it is drawn closed. Deliberately not applied to the
   other fields: if every field were boxed, the block would stop reading as a
   ruled title block and start reading as a stack of inputs. */
.form__textarea {
  line-height: 1.55;
  resize: vertical;
  min-height: 8rem;
  border: 2px solid var(--color-input-line);
  padding: var(--space-3);
}

.form__input:focus,
.form__input:not(:placeholder-shown) {
  border-bottom-color: var(--list);
  outline: none;
}

/* The boxed field inks its WHOLE frame on the same state the rules ink on, or
   the box would stay dim while every rule beside it went bright. Declared after
   the rule above so it wins at equal specificity. */
.form__textarea:focus,
.form__textarea:not(:placeholder-shown) {
  border-color: var(--list);
}

/* Keyboard focus still has to be unmistakable — the inked rule alone is the
   same thing a filled field shows. */
.form__input:focus-visible {
  outline: 2px solid var(--rez-na-temnem);
  outline-offset: 3px;
}

.form__input[aria-invalid='true'] {
  border-bottom-color: var(--err-na-temnem);
}

/* --- the chips ---------------------------------------------------------------- */
.form__cell--chips {
  padding-inline: var(--space-8) 0;
}

.form__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.form__chip {
  position: relative;
}

/* The real control: kept in the layout (never display:none, which drops it
   from the tab order and from arrow-key grouping) and made invisible. */
.form__chip-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.form__chip-face {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding-inline: var(--space-4);
  border: var(--divider-width) solid var(--crta-na-temnem);
  font-family: var(--font-mono);
  font-size: var(--type-data-size);
  letter-spacing: var(--type-data-ls);
  text-transform: uppercase;
  color: var(--color-chip-idle);
  transition: all 0.2s ease; /* the reference's one CSS transition */
}

/* Two selectors on purpose: Vue puts `--on` on the label (the state the app
   already owns), and `:checked +` covers the JS-off page, where that class
   never exists. Either alone would do in a correct engine.

   A NOTE FOR WHOEVER VERIFIES THIS IN THE PREVIEW PANE: the selected chip
   reads as unstyled there and it is not this rule's fault. Measured — a
   FRESHLY created element carrying the same classes and scope attribute
   computes paper-on-black exactly as declared, while the live element whose
   class Vue toggled keeps the base rule's values; the pane does not
   invalidate it (and no forced recalc rescued it). Build a probe element
   before believing a state-style measurement here. */
.form__chip--on .form__chip-face,
.form__chip-input:checked + .form__chip-face {
  color: var(--zemlja);
  background: var(--list);
  border-color: var(--list);
}

.form__chip-input:focus-visible + .form__chip-face {
  outline: 2px solid var(--rez-na-temnem);
  outline-offset: 3px;
}

@media (hover: hover) {
  .form__chip:not(.form__chip--on):hover .form__chip-face {
    color: var(--list);
    border-color: var(--papir-dim);
  }
}

.form__chip-input[aria-invalid='true'] + .form__chip-face {
  border-color: var(--err-na-temnem);
}

/* --- issue ---------------------------------------------------------------------
   A text button with a rule under it — the system's submit, not a filled box. */
.form__issue {
  padding-left: var(--space-8);
}

.form__submit {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 0 var(--space-2);
  background: none;
  border: 0;
  border-bottom: 2px solid var(--list);
  color: var(--list);
  font-family: var(--font-sans);
  font-size: var(--type-cta-size);
  font-weight: var(--type-cta-weight);
  line-height: 1.2;
  letter-spacing: var(--type-cta-ls);
  cursor: pointer;
  transition: color var(--dur-tween) var(--ease-hover);
}

@media (hover: hover) {
  .form__submit:hover:not(:disabled) {
    color: var(--rez-na-temnem);
    border-bottom-color: var(--rez-na-temnem);
  }
}

.form__submit:focus-visible {
  outline: 2px solid var(--rez-na-temnem);
  outline-offset: 4px;
}

/* Authored here because the reference has none: the button is never disabled
   there, including while sending. */
.form__submit:disabled {
  cursor: progress;
  color: var(--papir-dim);
  border-bottom-color: var(--crta-na-temnem);
}

.form__submit-label {
  position: relative;
  z-index: 1;
}

/* The send's own progress, drawn along the button's rule. */
.form__progress {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2px;
  height: 2px;
  background: var(--rez-na-temnem);
  transform: scaleX(0);
  transform-origin: left center;
}

/* --- status + privacy ---------------------------------------------------------- */
.form__status {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding-left: var(--space-8);
  margin: 0;
  min-height: 1.5rem;
  font-size: 0.9375rem;
  line-height: 1.45;
  max-width: 46ch;
}

.form__status--success {
  /* 4.85:1 worst case — on the bronze ground UNDER a press-screen highlight
     dot. These two inks are why the closing band is the darkest bronze step:
     they break before any other ink does. */
  color: var(--ok-na-temnem);
}

.form__status--error {
  color: var(--err-na-temnem); /* 4.62:1 worst case — see the success rule above */
}

.form__glyph {
  flex: 0 0 auto;
  margin-top: 0.2em;
}

.form__privacy {
  padding-left: var(--space-8);
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--papir-dim);
  max-width: 46ch;
}

/* The honeypot: out of sight, out of the tab order, still in the DOM. */
.form__hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* --- the seal ------------------------------------------------------------------ */
.form__seal {
  position: absolute;
  right: calc(var(--space-6) * -1);
  bottom: calc(var(--space-8) * -1);
  transform: rotate(-12deg);
  pointer-events: none;
  line-height: 0;
}

.seal-ring {
  fill: none;
  stroke: var(--rez-na-temnem);
  stroke-width: 3;
}

.seal-ring--thin {
  stroke-width: 1.5;
}

/* One dashed stroke between the rings = the tick collar. */
.seal-ticks {
  fill: none;
  stroke: var(--rez-na-temnem);
  stroke-width: 11;
  stroke-dasharray: 3 18;
}

/* --- the form's own two columns -------------------------------------------------
   Name and e-mail share a row once there is width for two comfortable fields;
   everything else keeps the full measure. */
@media (min-width: 640px) {
  .form {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form > * {
    grid-column: 1 / -1;
  }

  .form > .form__cell--half {
    grid-column: auto;
  }
}

/* --- desktop ------------------------------------------------------------------- */
/* Between one column and the spread: the steps take two columns so four of
   them do not stack into a tower. */
@media (min-width: 900px) and (max-width: 1099.98px) {
  .contact__steps-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-10);
  }
}

@media (min-width: 900px) {
  .contact__step {
    border-top: var(--divider-width) solid var(--crta-na-temnem);
    padding-top: var(--space-4);
  }

  .form {
    padding-block: var(--space-12);
  }
}

/* The spread: rail beside block. The form gives up its centred float and
   fills its column; the steps run as a vertical rail with the figure below. */
@media (min-width: 1100px) {
  .contact__body {
    grid-template-columns: minmax(0, 1fr) minmax(0, 40rem);
    gap: var(--space-20);
    align-items: start;
  }

  .contact__rail .contact__steps {
    margin-top: var(--space-10);
  }

  .contact__steps-list {
    gap: var(--space-6);
  }

  .contact__step {
    grid-template-columns: 3rem minmax(0, 1fr);
    grid-template-areas:
      'index label'
      'index detail';
    column-gap: var(--space-4);
  }

  .contact__step-index {
    grid-area: index;
  }

  .contact__step-label {
    grid-area: label;
  }

  .contact__step-detail {
    grid-area: detail;
    max-width: 44ch;
  }

  .form {
    width: 100%;
    margin: 0;
  }

  .contact__orna {
    display: block;
    width: min(100%, 20rem);
    margin-top: var(--space-16);
  }
}

/* --- phones -------------------------------------------------------------------- */
@media (max-width: 899.98px) {
  .form {
    /* NO FRAME ON A PHONE (owner's call). The title block's top and right rules
       are the motif at desk width; on a phone they read as a stray white line
       hugging the screen edge rather than as a drawn frame, so the block keeps
       its ruled cells and drops the frame. */
    border-top: 0;
    border-right: 0;
    padding-right: var(--space-5);
  }

  .form__cell,
  .form__issue,
  .form__status,
  .form__privacy {
    padding-left: var(--space-5);
  }

  .form__cell--chips {
    padding-inline: var(--space-5) 0;
  }

  .form__seal {
    right: calc(var(--space-3) * -1);
    bottom: calc(var(--space-6) * -1);
  }

  .form__seal svg {
    width: 104px;
    height: 104px;
  }
}
</style>
