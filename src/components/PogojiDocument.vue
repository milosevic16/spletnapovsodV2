<script setup lang="ts">
/**
 * A terms document rendered as a numbered schedule: articles, each with its
 * number in a left rail and its clauses numbered in the margin. Prop-driven so
 * both terms pages share one renderer.
 *
 * ARTICLE NUMBERS ARE CONTENT, NOT DECORATION. The house rule bans decorative
 * numbering, and it should: 01/02/03 eyebrows on unordered content are
 * scaffolding. Here the numbers are the document's own citation system. A
 * clause is referred to as "8.3" in an offer, in an e-mail and in the other
 * document's precedence clause, so the number has to be on the page and has to
 * be selectable.
 *
 * The optional provider block renders inside the first article, where the
 * document names who is bound by it.
 *
 * Clauses flagged `todo` carry an unfilled owner decision. They are marked
 * visibly rather than silently, because a terms page that ships with ⟨…⟩ in it
 * is a mistake worth making impossible to miss.
 */
import type { Article } from '@/content/pogoji'
import { CONTACT_EMAIL } from '@/lib/constants'

const props = defineProps<{
  articles: Article[]
  updated: { label: string; value: string }
  /** Rendered in the first article; omitted by the module, which does not
   *  re-state the party. */
  provider?: {
    name: string
    rows: { label: string; value: string }[]
    emailLabel: string
  }
  /** Which article id the provider block belongs under. */
  providerIn?: string
}>()

</script>

<template>
  <section class="pgd press press--light">
    <div class="container pgd__container">
      <article
        v-for="article in props.articles"
        :id="article.id"
        :key="article.id"
        class="pgd__article"
      >
        <p class="pgd__num" aria-hidden="true">{{ article.n }}</p>

        <div class="pgd__body">
          <h2 class="pgd__title">
            <span class="pgd__title-n">{{ article.n }}.</span> {{ article.title }}
          </h2>

          <!-- Who the document binds, named once, in the article that says so. -->
          <div v-if="props.provider && props.providerIn === article.id" class="pgd__identity">
            <p class="pgd__id-name">{{ props.provider.name }}</p>
            <dl class="pgd__id-rows">
              <div v-for="row in props.provider.rows" :key="row.label" class="pgd__id-row">
                <dt class="pgd__id-label">{{ row.label }}</dt>
                <dd class="pgd__id-value emisija">{{ row.value }}</dd>
              </div>
              <div class="pgd__id-row">
                <dt class="pgd__id-label">{{ props.provider.emailLabel }}</dt>
                <dd class="pgd__id-value">
                  <a :href="`mailto:${CONTACT_EMAIL}`" class="pgd__link emisija">{{
                    CONTACT_EMAIL
                  }}</a>
                </dd>
              </div>
            </dl>
          </div>

          <div
            v-for="clause in article.clauses"
            :key="clause.n"
            class="pgd__clause"
            :class="{ 'pgd__clause--todo': clause.todo }"
          >
            <p class="pgd__clause-n">
              {{ clause.n }}
              <span v-if="clause.todo" class="pgd__clause-flag">dopolniti</span>
            </p>
            <div class="pgd__clause-body">
              <p class="pgd__text">{{ clause.text }}</p>
              <ul v-if="clause.items" class="pgd__items">
                <li v-for="(item, i) in clause.items" :key="i" class="pgd__item">{{ item }}</li>
              </ul>
            </div>
          </div>
        </div>
      </article>

      <p class="pgd__updated">
        <span class="pgd__updated-label">{{ props.updated.label }}</span>
        <span class="pgd__updated-value">{{ props.updated.value }}</span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.pgd {
  background-color: var(--list-2);
  color: var(--grafit);
  padding-block: var(--section-block);
}

.pgd__container {
  max-width: 64rem;
}

/* --- the draft banner ------------------------------------------------------ */
.pgd__draft {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2) var(--space-4);
  margin: 0 0 var(--space-10);
  padding: var(--space-4) var(--space-5);
  background: var(--list);
  border-left: 3px solid var(--rez);
}

.pgd__draft-tag {
  font-family: var(--font-display);
  font-size: var(--fs-annot);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--rez);
}

.pgd__draft-text {
  flex: 1 1 20ch;
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--grafit-2);
}

/* --- an article ------------------------------------------------------------ */
.pgd__article {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
  border-top: 1px solid var(--mreza-strong);
  margin-top: var(--space-10);
  padding-top: var(--space-6);
  /* Anchor jumps clear the fixed header, which wraps to two rows on phones. */
  scroll-margin-top: 6rem;
}

.pgd__article:first-of-type {
  border-top: 0;
  margin-top: 0;
  padding-top: 0;
}

/* The article number as a drawn figure in the rail: the document's own
   citation system, not an ornament. Hidden from assistive tech because the
   heading below already carries it as text. */
.pgd__num {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 400;
  line-height: 1;
  color: var(--mreza-strong);
}

.pgd__body {
  min-width: 0;
}

.pgd__title {
  margin: 0 0 var(--space-5);
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 1.02rem + 0.55vw, 1.4rem);
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--grafit);
}

.pgd__title-n {
  color: var(--grafit-2);
}

/* --- a clause -------------------------------------------------------------- */
.pgd__clause {
  display: grid;
  grid-template-columns: 3.5rem 1fr;
  gap: var(--space-2) var(--space-4);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--mreza);
}

.pgd__clause:first-of-type {
  border-top: 0;
}

.pgd__clause--todo {
  border-left: 3px solid var(--rez);
  padding-left: var(--space-3);
  margin-left: calc(var(--space-3) * -1);
}

.pgd__clause-n {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 1.7;
  color: var(--grafit-2);
  white-space: nowrap;
}

.pgd__clause-flag {
  display: block;
  margin-top: 0.15rem;
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--rez);
}

.pgd__clause-body {
  min-width: 0;
}

.pgd__text {
  margin: 0;
  max-width: 68ch;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--grafit-2);
}

.pgd__items {
  margin: var(--space-3) 0 0;
  padding-left: 1.15rem;
  max-width: 68ch;
}

.pgd__item {
  margin-bottom: var(--space-2);
  font-size: 0.97rem;
  line-height: 1.55;
  color: var(--grafit-2);
}

/* --- the party block ------------------------------------------------------- */
.pgd__identity {
  margin: 0 0 var(--space-6);
  padding: var(--space-5) var(--space-6);
  background: var(--list);
  border-left: 3px solid var(--rez);
}

.pgd__id-name {
  margin: 0 0 var(--space-3);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--grafit);
}

.pgd__id-rows {
  margin: 0;
  display: grid;
  gap: var(--space-2);
}

.pgd__id-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  margin: 0;
  font-size: 0.95rem;
}

.pgd__id-label {
  min-width: 9rem;
  color: var(--grafit-2);
}

.pgd__id-value {
  margin: 0;
  color: var(--grafit);
}

.pgd__todo {
  color: var(--rez);
  font-family: var(--font-mono);
  font-size: 0.85em;
}

.pgd__link {
  color: var(--rez);
  text-decoration: underline;
  text-underline-offset: 0.25em;
}

/* --- foot ------------------------------------------------------------------ */
.pgd__updated {
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

/* The number moves into its own rail once there is room. */
@media (min-width: 860px) {
  .pgd__article {
    grid-template-columns: 5rem 1fr;
    gap: 0 var(--space-8);
  }

  .pgd__num {
    font-size: 2.6rem;
    text-align: right;
  }
}
</style>
