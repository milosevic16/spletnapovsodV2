<script setup lang="ts">
/**
 * Temeljenje — the narrative conclusion: the page crosses the ground line and
 * the world inverts to earth (--zemlja). Everything above rested on this.
 * The form IS a title block at full scale — the visitor fills in the title
 * block of their own future sheet; submit is the red stamp.
 *
 * Form engineering carried wholesale from the previous system: real <form>,
 * client-side POST to Web3Forms (key from env), honeypot + render-time stamp
 * (both fail silently as fake success — bots learn nothing, humans are never
 * gated), degrade-open (no key / failed request → the direct e-mail that is
 * already on the page), WCAG 3.3.1 error identification, first-paint live
 * region, iOS-safe input sizing.
 *
 * The clock in the title block is the page's ONE loop: real time, updated on
 * the minute, tiny area, visibility-gated — decoration that is not decoration
 * (checkable against any watch; renders empty at prerender, never fabricated).
 */
import { onMounted, onUnmounted, ref } from 'vue'
import { contact } from '@/content/home'
import { CONTACT_EMAIL } from '@/lib/constants'
import { createFx } from '@/lib/fx'

const fx = createFx()
const sending = ref(false)
const status = ref<'idle' | 'success' | 'error'>('idle')
const statusText = ref('')
const progressEl = ref<HTMLElement | null>(null)
const clock = ref('')

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
let renderedAt = 0
let progress: Animation | null = null

function tickClock() {
  const d = new Date()
  clock.value = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  renderedAt = Date.now()
  // The one loop: minute-aligned, skipped while the tab is hidden.
  tickClock()
  const schedule = () => {
    fx.setTimeout(() => {
      if (!document.hidden) tickClock()
      schedule()
    }, 60_000 - (Date.now() % 60_000) + 250)
  }
  schedule()
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

function fail(text: string) {
  status.value = 'error'
  statusText.value = text
}

function focusField(id: string) {
  document.getElementById(id)?.focus()
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
  <section id="kontakt" class="contact">
    <!-- KOTA 0 — the ground line. Everything above rested on this. -->
    <div class="contact__ground" aria-hidden="true"></div>

    <div class="contact__earth">
      <div class="container contact__grid">
        <div class="contact__intro">
          <p class="datum datum--on-dark">{{ contact.kicker }}</p>
          <h2 class="contact__title">{{ contact.title }}</h2>
          <p class="contact__lead">{{ contact.intro }}</p>

          <p class="contact__mail">
            <a :href="`mailto:${CONTACT_EMAIL}`" class="emisija contact__mail-link">{{
              CONTACT_EMAIL
            }}</a>
          </p>

          <div class="contact__steps">
            <p class="contact__steps-title">{{ contact.stepsTitle }}</p>
            <ol class="contact__steps-list">
              <li v-for="s in contact.steps" :key="s.label" class="contact__step">
                <span class="contact__step-label">{{ s.label }}</span>
                <span class="contact__step-detail">{{ s.detail }}</span>
              </li>
            </ol>
          </div>
        </div>

        <!-- method="post": with JS disabled a bare <form> would GET-navigate and
             leak the message into the URL/history; a POST leaks nothing. -->
        <form class="form" method="post" novalidate @submit.prevent="onSubmit">
          <p class="form__tb" aria-hidden="true">
            <span class="datum form__tb-brand">SpletnaPovsod</span>
            <time v-if="clock" class="emisija form__tb-clock">{{ clock }}</time>
          </p>

          <div class="form__field">
            <label class="datum form__label" for="f-name">{{ contact.form.nameLabel }}</label>
            <input
              id="f-name"
              v-model="name"
              class="form__input"
              type="text"
              name="name"
              autocomplete="name"
              :aria-invalid="invalidFields.has('f-name') || undefined"
              required
            />
          </div>

          <div class="form__field">
            <label class="datum form__label" for="f-email">{{ contact.form.emailLabel }}</label>
            <input
              id="f-email"
              v-model="email"
              class="form__input"
              type="email"
              name="email"
              autocomplete="email"
              :aria-invalid="invalidFields.has('f-email') || undefined"
              required
            />
          </div>

          <div class="form__field">
            <label class="datum form__label" for="f-topic">{{ contact.form.topicLabel }}</label>
            <select
              id="f-topic"
              v-model="topic"
              class="form__input form__select"
              name="topic"
              :aria-invalid="invalidFields.has('f-topic') || undefined"
              required
            >
              <option value="" disabled>{{ contact.form.topicPlaceholder }}</option>
              <option v-for="t in contact.topics" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </div>

          <div class="form__field">
            <label class="datum form__label" for="f-message">{{ contact.form.messageLabel }}</label>
            <textarea
              id="f-message"
              v-model="message"
              class="form__input form__textarea"
              name="message"
              rows="5"
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

          <button class="form__submit" type="submit" :disabled="sending">
            <span ref="progressEl" class="form__progress" aria-hidden="true"></span>
            {{ sending ? contact.form.feedback.submitting : contact.form.submitLabel }}
          </button>

          <!-- Live region exists from first render — a region inserted together
               with its text is routinely missed by screen readers. -->
          <p class="form__status" :class="`form__status--${status}`" role="status" aria-live="polite">
            <svg
              v-if="status === 'success'"
              class="form__glyph"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M2.5 8.5 6 12l7.5-8" />
            </svg>
            <svg
              v-else-if="status === 'error'"
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
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* KOTA 0 — the drawn crossing: graphite datum + section hatch beneath. */
.contact__ground {
  height: 3.25rem;
  border-top: 2px solid var(--grafit);
  background:
    repeating-linear-gradient(
      45deg,
      transparent 0 9px,
      var(--mreza-strong) 9px 10px
    )
    var(--list);
}

.contact__earth {
  background: var(--zemlja);
  color: var(--list);
  padding-block: var(--section-y) clamp(3rem, 2.5rem + 3vw, 5rem);
}

.contact__grid {
  display: grid;
  gap: 3rem;
}

.contact__title {
  margin-top: 1rem;
  color: var(--list);
}

.contact__lead {
  margin-top: 1.25rem;
  color: var(--papir-dim);
  max-width: 46ch;
}

.contact__mail {
  margin-top: 1.5rem;
}

.contact__mail-link {
  display: inline-block;
  padding-block: 0.7rem; /* 44px+ tap target */
  color: var(--rez-na-temnem);
  font-size: 0.95rem;
  text-decoration: underline;
  text-underline-offset: 0.3em;
}

.contact__steps {
  margin-top: 2.5rem;
  border-top: 1px solid var(--crta-na-temnem);
  padding-top: 1.5rem;
}

.contact__steps-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.1rem;
}

.contact__steps-list {
  list-style: none;
  margin-top: 1rem;
  display: grid;
  gap: 1rem;
  counter-reset: step;
}

.contact__step {
  display: grid;
  gap: 0.2rem;
  padding-left: 2.1rem;
  position: relative;
  counter-increment: step;
}

/* A true sequence — the one place a number is earned. */
.contact__step::before {
  content: counter(step);
  position: absolute;
  left: 0;
  top: 0.1rem;
  width: 1.4rem;
  height: 1.4rem;
  display: grid;
  place-items: center;
  border: 1px solid var(--crta-na-temnem);
  color: var(--rez-na-temnem);
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-size: 0.72rem;
}

.contact__step-label {
  font-weight: 600;
}

.contact__step-detail {
  color: var(--papir-dim);
  font-size: 0.92rem;
  max-width: 44ch;
}

/* --- the form as a title block -------------------------------------------- */
.form {
  background: var(--zemlja-2);
  border: 1px solid var(--crta-na-temnem);
  border-right-width: 4px; /* the title block's heavy closing edge */
  display: grid;
  align-content: start;
}

.form__tb {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--crta-na-temnem);
}

.form__tb-brand {
  color: var(--papir-dim);
}

.form__tb-clock {
  color: var(--papir-dim);
}

/* Cells joined like a real title block — the grid draws itself. */
.form__field {
  display: grid;
  gap: 0.35rem;
  padding: 0.8rem 1rem 0.9rem;
  border-bottom: 1px solid var(--crta-na-temnem);
}

.form__label {
  color: var(--papir-dim);
}

/* 1rem font kills iOS zoom-on-focus; generous targets. */
.form__input {
  min-height: 2.6rem;
  padding: 0.35rem 0;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--crta-na-temnem);
  color: var(--list);
  font-size: 1rem;
  border-radius: 0;
}

.form__input:focus-visible {
  outline: 2px solid var(--rez-na-temnem);
  outline-offset: 3px;
}

.form__input[aria-invalid='true'] {
  border-bottom: 2px solid var(--err-na-temnem);
}

.form__select {
  appearance: none;
  padding-right: 2.6rem; /* room for the chevron — text never runs under it */
  /* chevron: inline SVG data URI, stroke = --papir-dim (#C6C9C3) */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5 11 1.5' stroke='%23C6C9C3' stroke-width='1.5'/%3E%3C/svg%3E");
  background-position: calc(100% - 0.9rem) 50%;
  background-size: 0.75rem auto;
  background-repeat: no-repeat;
}

.form__select option {
  background: var(--zemlja-2);
  color: var(--list);
}

.form__textarea {
  resize: vertical;
  min-height: 7rem;
}

.form__hp {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

/* The stamp. */
.form__submit {
  position: relative;
  overflow: hidden;
  min-height: 3.5rem;
  margin: 1rem;
  border: 0;
  background: var(--rez);
  color: #fff; /* 6.01:1 on --rez — measured */
  font-family: var(--font-display);
  font-stretch: var(--wdth-datum);
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background var(--t-micro) var(--ease-out);
}

.form__submit:hover:not(:disabled) {
  background: var(--rez-deep);
}

.form__submit:disabled {
  cursor: default;
  opacity: 0.85;
}

/* The one process the visitor starts, measured. */
.form__progress {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--list);
  transform: scaleX(0);
  transform-origin: left center;
}

.form__status {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.95rem;
  padding: 0 1rem;
  min-height: 1.5rem;
}

.form__glyph {
  flex: 0 0 auto;
  margin-top: 0.2rem;
}

.form__status--success {
  color: var(--ok-na-temnem); /* 8.10:1 on zemlja-2 — measured; icon + text, never color alone */
}

.form__status--error {
  color: var(--err-na-temnem); /* 7.72:1 on zemlja-2 — measured; deliberately NOT --rez */
}

.form__privacy {
  font-size: 0.8rem;
  color: var(--papir-dim);
  padding: 0.25rem 1rem 1rem;
}

@media (min-width: 900px) {
  .contact__grid {
    grid-template-columns: 5fr 7fr;
    gap: 4rem;
  }

  .form {
    max-width: 36rem;
    justify-self: end;
    width: 100%;
  }
}
</style>
