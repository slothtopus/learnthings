<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { DateTime } from 'luxon'

import PageLayout from '@/components/used/PageLayout.vue'
import AppButton from '@/components/used/AppButton.vue'
import AppIconButton from '@/components/used/AppIconButton.vue'
import LinkButton from '@/components/used/LinkButton.vue'

import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { FSRSScheduler } from 'core/schedulers/FSRSScheduler.js'
import { FSRSSequence } from 'core/schedulers/FSRSSequence.js'

const { getDeck } = useRouteMetaObjects()
const deck = getDeck()
const scheduler = deck.getActiveScheduler()
const cards = computed(() => deck.getAllCards())

const isFSRS = (s: typeof scheduler): s is FSRSScheduler => s instanceof FSRSScheduler
const isFSRSSequence = (s: typeof scheduler): s is FSRSSequence => s instanceof FSRSSequence

// FSRS statistics
const statistics = computed(() => (isFSRS(scheduler) ? scheduler.getStatistics(cards.value) : null))

const additionalNewCards = ref(0)
const maxAdditionalNewCards = computed(() =>
  statistics.value ? Math.max(statistics.value.not_due.new - additionalNewCards.value, 0) : 0,
)

const toReview = computed(() => statistics.value?.due.seen ?? 0)
const newCards = computed(() => statistics.value?.due.new ?? 0)
const total = computed(() => toReview.value + newCards.value + additionalNewCards.value)
const canStart = computed(() => isFSRSSequence(scheduler) || total.value > 0)

function incrementBoost() {
  if (maxAdditionalNewCards.value > 0) additionalNewCards.value++
}
function decrementBoost() {
  if (additionalNewCards.value > 0) additionalNewCards.value--
}
function resetBoost() {
  additionalNewCards.value = 0
}

const router = useRouter()
const breadcrumbs = computed(() => [
  { label: 'Library', href: '/' },
  { label: `Deck: ${deck.name}`, href: `/deck/${deck.id}` },
  { label: 'Review' },
])

function handleStart() {
  if (isFSRS(scheduler)) {
    scheduler.initialise(cards.value)
    scheduler.addNewCardsToSession(additionalNewCards.value)
  } else if (isFSRSSequence(scheduler)) {
    scheduler.initialise(deck.getAllCards())
  }
  router.push({ name: 'review-next', params: router.currentRoute.value.params })
}
</script>

<template>
  <PageLayout :breadcrumbs="breadcrumbs">
    <template #title>Start Review</template>

    <div class="flex-1 flex flex-col items-center justify-center py-10">
      <div class="max-w-lg w-full flex flex-col items-center gap-10 text-center">
        <!-- Title -->
        <div class="space-y-2">
          <h1 class="text-3xl font-light tracking-wide text-on-surface">{{ deck.name }}</h1>
          <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/60">
            Review session — {{ DateTime.now().toFormat('EEEE d MMMM, yyyy') }}
          </p>
        </div>
        <div>
          <div class="w-full flex items-center justify-between py-4 border-b border-white/5">
            <div class="flex flex-col gap-1 text-left">
              <span
                class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/60"
                >Scheduler Engine</span
              >
              <span class="text-base font-light text-on-surface">{{ scheduler.label }}</span>
            </div>
            <AppIconButton icon="settings" size="sm" />
          </div>
          <!-- FSRS stats grid -->
          <template v-if="isFSRS(scheduler)">
            <div class="w-full grid grid-cols-3">
              <!-- To review -->
              <div class="flex flex-col justify-start pt-4">
                <div class="flex flex-col items-center">
                  <span class="text-2xl font-light text-primary">{{ toReview }}</span>
                  <span
                    class="text-[8px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mt-2"
                    >To Review</span
                  >
                </div>
              </div>

              <!-- New cards + boost -->
                <div class="flex flex-col items-center gap-4 pt-4 border-x border-outline-variant/50">
                  <div class="flex flex-col items-center">
                    <span class="text-2xl font-light text-primary">
                      {{ newCards
                      }}<span v-if="additionalNewCards > 0" class="text-primary/50">
                        +{{ additionalNewCards }}</span
                      >
                    </span>
                    <span
                      class="text-[8px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mt-2"
                      >New Cards</span
                    >
                  </div>
                  <div
                    class="flex flex-col items-center gap-2 border-t border-outline-variant/50 w-full pt-4"
                  >
                    <span
                      class="text-[8px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40"
                      >Boost</span
                    >
                    <div class="flex items-center justify-center gap-3">
                      <AppIconButton
                        icon="remove"
                        variant="ghost"
                        :disabled="additionalNewCards === 0"
                        @click="decrementBoost"
                      />
                      <span class="text-2xl font-light text-on-surface-variant w-12 text-center"
                        >+{{ additionalNewCards }}</span
                      >
                      <AppIconButton
                        icon="add"
                        variant="ghost"
                        :disabled="maxAdditionalNewCards === 0"
                        @click="incrementBoost"
                      />
                    </div>
                    <LinkButton
                      label="Reset"
                      :arrow="false"
                      class="opacity-30 hover:opacity-70 transition-opacity"
                      :class="additionalNewCards === 0 && 'invisible'"
                      @click="resetBoost"
                    />
                  </div>
                </div>

              <!-- Total -->
              <div class="flex flex-col items-center pt-4">
                <span class="text-2xl font-light text-primary">{{ total }}</span>
                <span
                  class="text-[8px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mt-2"
                  >Total</span
                >
              </div>
            </div>
          </template>
        </div>
        <!-- Start button -->
        <AppButton size="lg" class="w-full" :disabled="!canStart" @click="handleStart">
          Start Review
        </AppButton>
      </div>
    </div>
  </PageLayout>
</template>
