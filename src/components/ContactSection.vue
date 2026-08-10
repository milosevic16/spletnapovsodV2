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
  if (!message.value.trim()) missing.push({ id: 'f-message', label: contact.form.messageLabel })
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
  <!-- press--light: the dark screen's 34% black dots would print as polka
       dots on the sand (the press utility's own note). -->
  <section id="kontakt" class="contact press press--light">
    <div class="container">
      <header class="contact__head">
        <!-- Plain kicker: the band is sand now, the on-dark variant read
           1.55:1 on it (caught by the ink sweep). -->
      <p class="kicker">{{ contact.kicker }}</p>
        <h2 class="contact__title">{{ contact.title }}</h2>
        <p class="contact__lead">{{ contact.intro }}</p>
        <p class="contact__mail">
          <a :href="`mailto:${CONTACT_EMAIL}`" class="contact__mail-link emisija">{{
            CONTACT_EMAIL
          }}</a>
        </p>
      </header>

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
        <div class="form__cell">
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

        <div class="form__cell">
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

        <div class="form__cell">
          <label class="form__label" for="f-message">{{ contact.form.messageLabel }}</label>
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
            <!-- The pd mark, same geometry as the hero's (bowls on the
                 rotation axis — see StatementSection). -->
            <g transform="translate(50 71) scale(0.41)">
              <circle cx="72" cy="72" r="72" fill="var(--rez-deep)" />
              <circle cx="172" cy="72" r="72" fill="var(--rez-deep)" />
              <g fill="none" stroke="var(--zemlja)" stroke-width="18" stroke-linecap="round">
                <circle cx="79" cy="72" r="33" />
                <line x1="46" y1="48" x2="46" y2="111" />
              </g>
              <g
                fill="none"
                stroke="var(--zemlja)"
                stroke-width="18"
                stroke-linecap="round"
                transform="rotate(180 122 72)"
              >
                <circle cx="79" cy="72" r="33" />
                <line x1="46" y1="48" x2="46" y2="111" />
              </g>
            </g>
          </svg>
        </span>
      </form>
    </div>
  </section>
</template>

<style scoped>
.contact {
  background-color: var(--zemlja);
  /* The closing band wears the sand now (owner's brightening — the measured
     table lives with --color-sand in tokens.css), so every paper-family ink
     below flipped to the dark family, and the on-dark accent/status voices to
     their sand-tuned twins (--*-na-pesku). And the dark family is BROWN here
     (owner: "switch black font to dark brown") — one re-pointing flips every
     consumer in the band, the form frame and the ink chip included: 8.27:1 /
     5.79:1 flat, 6.92 / 4.84 under the worst press dot; paper text on the
     brown chip 11.53:1. */
  --grafit: var(--color-bronze-deep);
  --grafit-2: var(--color-bronze-2);
  color: var(--grafit);
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
  color: var(--grafit);
  max-width: 14ch;
}

.contact__lead {
  margin-top: var(--space-6);
  color: var(--grafit-2);
  max-width: 52ch;
}

.contact__mail {
  margin-top: var(--space-5);
}

.contact__mail-link {
  display: inline-block;
  padding-block: 0.7rem; /* 44px+ tap target */
  color: var(--rez-na-pesku);
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
  color: var(--grafit-2);
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
  color: var(--rez-na-pesku);
}

.contact__step-label {
  font-weight: 500;
  color: var(--grafit);
}

.contact__step-detail {
  color: var(--grafit-2);
  font-size: 0.9375rem;
  line-height: 1.5;
}

/* --- the title block ----------------------------------------------------------
   The one centred block on the page, closed by the motif's heavy right edge. */
.form {
  position: relative;
  width: min(100%, 37.5rem); /* 600px — the extracted system's measure */
  margin: var(--space-20) auto 0;
  padding: var(--space-8) var(--space-8) var(--space-8) 0;
  border-top: 2px solid var(--grafit);
  border-right: 2px solid var(--grafit);
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
  color: var(--grafit-2);
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
  color: var(--grafit);
  /* The reference transitions background and box-shadow only — the rule
     snaps. Kept: a rule that fades reads as a hover effect, not a state. */
  transition: none;
}

/* The e-mail and the message keep the case the visitor typed. */
.form__input--plain,
.form__textarea {
  text-transform: none;
}

.form__textarea {
  line-height: 1.55;
  resize: vertical;
  min-height: 8rem;
}

.form__input:focus,
.form__input:not(:placeholder-shown) {
  border-bottom-color: var(--grafit);
  outline: none;
}

/* Keyboard focus still has to be unmistakable — the inked rule alone is the
   same thing a filled field shows. */
.form__input:focus-visible {
  outline: 2px solid var(--rez-na-pesku);
  outline-offset: 3px;
}

.form__input[aria-invalid='true'] {
  border-bottom-color: var(--err-na-pesku);
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
  /* Selected = INK on the sand band: the old paper chip carried the band's
     own dark as text, which on sand-on-paper would read 1.5:1. Paper text on
     the ink chip is 13.88:1. */
  color: var(--list);
  background: var(--grafit);
  border-color: var(--grafit);
}

.form__chip-input:focus-visible + .form__chip-face {
  outline: 2px solid var(--rez-na-pesku);
  outline-offset: 3px;
}

@media (hover: hover) {
  .form__chip:not(.form__chip--on):hover .form__chip-face {
    color: var(--grafit);
    border-color: var(--grafit-2);
  }
}

.form__chip-input[aria-invalid='true'] + .form__chip-face {
  border-color: var(--err-na-pesku);
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
  border-bottom: 2px solid var(--grafit);
  color: var(--grafit);
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
    color: var(--rez-na-pesku);
    border-bottom-color: var(--rez-na-pesku);
  }
}

.form__submit:focus-visible {
  outline: 2px solid var(--rez-na-pesku);
  outline-offset: 4px;
}

/* Authored here because the reference has none: the button is never disabled
   there, including while sending. */
.form__submit:disabled {
  cursor: progress;
  color: var(--grafit-2);
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
  background: var(--rez-deep);
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
  /* The sand-tuned status pair — measured against the band AND its press
     dots (the sand table in tokens.css): success 5.42:1 worst case, error
     5.63:1. The on-dark pair they replace read 1.4–2.1:1 here. */
  color: var(--ok-na-pesku);
}

.form__status--error {
  color: var(--err-na-pesku); /* 5.63:1 worst case — see the success rule */
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
  color: var(--grafit-2);
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
  stroke: var(--rez-deep);
  stroke-width: 3;
}

.seal-ring--thin {
  stroke-width: 1.5;
}

/* One dashed stroke between the rings = the tick collar. */
.seal-ticks {
  fill: none;
  stroke: var(--rez-deep);
  stroke-width: 11;
  stroke-dasharray: 3 18;
}

/* --- desktop ------------------------------------------------------------------- */
@media (min-width: 900px) {
  .contact__steps-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-10);
  }

  .contact__step {
    border-top: var(--divider-width) solid var(--crta-na-temnem);
    padding-top: var(--space-4);
  }

  .form {
    padding-block: var(--space-12);
  }
}

/* --- phones -------------------------------------------------------------------- */
@media (max-width: 899.98px) {
  .form {
    /* The heavy edge stays; the block simply takes the measure it has. */
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
