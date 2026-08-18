<script setup lang="ts">
/**
 * The policy body: the clauses as a schedule. Each clause carries the statute
 * it answers in the left rail (small-caps label register, never mono), an h2,
 * and its prose. Three clauses render an extra register block from the content
 * module: the provider identity (podatki), the processor tables (deljenje), and
 * the supervisory authority (pravice).
 *
 * Every clause article carries its own ASCII id so the masthead and footer
 * stops jump to it; scroll-margin-top clears the fixed header on that jump.
 *
 * The one mono treatment here is .emisija on the checkable identifiers, e-mails
 * and phone. That honours the contract by its own principle: if it is mono it
 * is checkable, and a registration number or a public authority phone is
 * exactly that. Claims and headings stay in the type register.
 */
import { clauses, provider, processorGroups, authority, updated } from '@/content/zasebnost'
import { CONTACT_EMAIL } from '@/lib/constants'
</script>

<template>
  <section class="zas press press--light">
    <div class="container zas__container">
      <article
        v-for="clause in clauses"
        :id="clause.id"
        :key="clause.id"
        class="zas__clause"
      >
        <p class="zas__cite">{{ clause.cite }}</p>

        <div class="zas__body">
          <h2 class="zas__title">{{ clause.title }}</h2>

          <!-- The provider / controller identity block. -->
          <div v-if="clause.id === 'podatki'" class="zas__identity">
            <p class="zas__id-name">{{ provider.name }}</p>
            <dl class="zas__id-rows">
              <div v-for="row in provider.rows" :key="row.label" class="zas__id-row">
                <dt class="zas__id-label">{{ row.label }}</dt>
                <dd class="zas__id-value emisija">{{ row.value }}</dd>
              </div>
              <div class="zas__id-row">
                <dt class="zas__id-label">{{ provider.emailLabel }}</dt>
                <dd class="zas__id-value">
                  <a :href="`mailto:${CONTACT_EMAIL}`" class="zas__link emisija">{{ CONTACT_EMAIL }}</a>
                </dd>
              </div>
            </dl>
          </div>

          <p v-for="(para, i) in clause.body" :key="i" class="zas__para">{{ para }}</p>

          <!-- The processors, under »Komu podatke posredujemo«. -->
          <div v-if="clause.id === 'deljenje'" class="zas__procs">
            <div v-for="group in processorGroups" :key="group.label" class="zas__proc-group">
              <p class="zas__proc-label">{{ group.label }}</p>
              <ul class="zas__proc-list">
                <li v-for="p in group.items" :key="p.name" class="zas__proc">
                  <span class="zas__proc-name">{{ p.name }}</span>
                  <span class="zas__proc-where emisija" :class="{ 'zas__proc-where--flag': p.flag }">{{
                    p.where
                  }}</span>
                  <span class="zas__proc-purpose">{{ p.purpose }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- The supervisory authority, under »Vaše pravice«. -->
          <address v-if="clause.id === 'pravice'" class="zas__authority">
            <span class="zas__auth-name">{{ authority.name }}</span>
            <span class="zas__auth-line">{{ authority.address }}</span>
            <span class="zas__auth-line">
              <a :href="`mailto:${authority.email}`" class="zas__link emisija">{{ authority.email }}</a>
              <span class="zas__auth-sep" aria-hidden="true"></span>
              <a :href="`tel:${authority.phone.replace(/\s+/g, '')}`" class="zas__link emisija">{{
                authority.phone
              }}</a>
            </span>
          </address>
        </div>
      </article>

      <p class="zas__updated">
        <span class="zas__updated-label">{{ updated.label }}</span>
        <span class="zas__updated-value">{{ updated.value }}</span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.zas {
  background-color: var(--list-2);
  color: var(--grafit);
  padding-block: var(--section-block);
}

/* The document runs at a reading measure rather than the full container. */
.zas__container {
  max-width: 62rem;
}

/* --- a clause is a row in the schedule ------------------------------------- */
.zas__clause {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
  border-top: 1px solid var(--mreza-strong);
  margin-top: var(--space-10);
  padding-top: var(--space-8);
  /* Anchor jumps land clear of the fixed header (it wraps to two rows on
     phones, hence the generous value). */
  scroll-margin-top: 6rem;
}

.zas__clause:first-child {
  border-top: 0;
  margin-top: 0;
  padding-top: 0;
}

/* The citation rail: the statute the clause answers, in the label register. */
.zas__cite {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--fs-annot);
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--grafit-2);
}

.zas__body {
  min-width: 0;
}

.zas__title {
  margin: 0 0 var(--space-5);
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 1.05rem + 0.6vw, 1.45rem);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--grafit);
}

.zas__para {
  margin: 0 0 var(--space-4);
  max-width: 66ch;
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--grafit-2);
}

.zas__para:last-child {
  margin-bottom: 0;
}

.zas__link {
  color: var(--rez);
  text-decoration: underline;
  text-underline-offset: 0.25em;
}

.zas__link:hover,
.zas__link:focus-visible {
  color: var(--rez-deep, var(--rez));
}

/* --- the provider identity block ------------------------------------------- */
.zas__identity {
  margin: 0 0 var(--space-6);
  padding: var(--space-5) var(--space-6);
  background: var(--list);
  border-left: 3px solid var(--rez);
}

.zas__id-name {
  margin: 0 0 var(--space-3);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--grafit);
}

.zas__id-rows {
  margin: 0;
  display: grid;
  gap: var(--space-2);
}

.zas__id-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  margin: 0;
  font-size: 0.95rem;
}

.zas__id-label {
  min-width: 9rem;
  color: var(--grafit-2);
}

.zas__id-value {
  margin: 0;
  color: var(--grafit);
}

/* --- the processor tables -------------------------------------------------- */
.zas__procs {
  margin-top: var(--space-6);
  display: grid;
  gap: var(--space-8);
}

.zas__proc-label {
  margin: 0 0 var(--space-3);
  font-family: var(--font-display);
  font-size: var(--fs-annot);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--grafit-2);
}

.zas__proc-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.zas__proc {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  gap: 0.15rem var(--space-4);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--mreza);
}

.zas__proc-name {
  font-weight: 600;
  color: var(--grafit);
}

.zas__proc-where {
  font-size: 0.8rem;
  color: var(--grafit-2);
  text-align: right;
  white-space: nowrap;
}

.zas__proc-where--flag {
  color: var(--rez);
  font-weight: 500;
}

.zas__proc-purpose {
  grid-column: 1 / -1;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--grafit-2);
}

/* --- the supervisory authority --------------------------------------------- */
.zas__authority {
  margin-top: var(--space-6);
  display: grid;
  gap: var(--space-1, 0.25rem);
  font-style: normal;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--grafit-2);
}

.zas__auth-name {
  font-weight: 600;
  color: var(--grafit);
}

.zas__auth-sep {
  display: inline-block;
  width: 10px;
  height: 1px;
  margin: 0 0.5rem;
  vertical-align: middle;
  background: var(--mreza-strong);
}

/* --- foot ------------------------------------------------------------------ */
.zas__updated {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  margin: var(--space-12) 0 0;
  border-top: 2px solid var(--grafit);
  padding-top: var(--space-4);
  font-family: var(--font-display);
  font-size: var(--fs-annot);
  font-weight: 500;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--grafit-2);
}

/* Two columns once there is room: the statute rail beside the clause body. */
@media (min-width: 860px) {
  .zas__clause {
    grid-template-columns: 12rem 1fr;
    gap: 0 var(--space-10);
  }

  .zas__cite {
    padding-top: 0.15rem;
  }
}
</style>
