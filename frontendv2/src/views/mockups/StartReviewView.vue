<script setup lang="ts">
import { ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import AppButton from '@/components/AppButton.vue'
import AppIconButton from '@/components/AppIconButton.vue'
import LinkButton from '@/components/LinkButton.vue'

const breadcrumbs = [
  { label: 'Anatomy', href: '#' },
  { label: 'Flags of the World', href: '#' },
  { label: 'Review' },
]

const boost = ref(0)
const session = {
  deckTitle: 'Flags of the World',
  date: 'Sunday 22nd March, 2026',
  knownToReview: 0,
  newToLearn: 5,
  total: 5,
  scheduler: 'FSRS',
}

function incrementBoost() { boost.value++ }
function decrementBoost() { if (boost.value > 0) boost.value-- }
function resetBoost() { boost.value = 0 }
</script>

<template>
  <PageLayout :breadcrumbs="breadcrumbs">
    <template #title>Start Review</template>

      <div class="flex-1 flex flex-col items-center justify-center py-10">
      <div class="max-w-lg w-full flex flex-col items-center gap-10 text-center">

        <!-- Title -->
        <div class="space-y-2">
          <h1 class="text-3xl font-light tracking-wide text-on-surface">{{ session.deckTitle }}</h1>
          <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/60">Review session — {{ session.date }}</p>
        </div>

        <!-- Session stats -->
        <div class="w-full grid grid-cols-3">
          <div class="flex flex-col items-center">
            <span class="text-2xl font-light text-primary">{{ session.knownToReview }}</span>
            <span class="text-[8px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mt-2">To Review</span>
          </div>
          <!-- New cards + boost -->
          <div class="flex flex-col items-center border-x border-outline-variant/50 gap-3">
            <div class="flex flex-col items-center">
              <span class="text-2xl font-light text-primary">{{ session.newToLearn }}</span>
              <span class="text-[8px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mt-2">New Cards</span>
            </div>
            <div class="flex flex-col items-center gap-2 border-t border-outline-variant/50 pt-3 w-full">
              <span class="text-[8px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40">Boost</span>
              <div class="flex items-center justify-center gap-3">
                <AppIconButton icon="remove" variant="ghost" @click="decrementBoost" />
                <span class="text-2xl font-light text-on-surface-variant w-12 text-center">+{{ boost }}</span>
                <AppIconButton icon="add" variant="ghost" @click="incrementBoost" />
              </div>
              <LinkButton label="Reset" :arrow="false" class="opacity-30 hover:opacity-70 transition-opacity" :class="boost === 0 && 'invisible'" @click="resetBoost" />
            </div>
          </div>
          <div class="flex flex-col items-center">
            <span class="text-2xl font-light text-primary">{{ session.total }}</span>
            <span class="text-[8px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mt-2">Total</span>
          </div>
        </div>

        <!-- Scheduler row -->
        <div class="w-full flex items-center justify-between py-4 border-t border-white/5">
          <div class="flex flex-col gap-1 text-left">
            <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant/60">Scheduler Engine</span>
            <span class="text-base font-light text-on-surface">{{ session.scheduler }}</span>
          </div>
          <AppIconButton icon="settings" size="sm" />
        </div>

        <!-- Start button -->
        <AppButton size="lg" class="w-full">Start Review</AppButton>

      </div>
      </div>
  </PageLayout>
</template>
