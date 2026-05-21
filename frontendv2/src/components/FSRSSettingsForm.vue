<script setup lang="ts">
import FormDialog from '@/components/used/FormDialog.vue'
import { useDialogForm } from '@/composables/useFormDialog'
import type { FRSROptions } from 'core/schedulers/FSRSScheduler.js'

const { formData, hasChanged, submit, cancel } = useDialogForm<FRSROptions>()
</script>

<template>
  <FormDialog
    title="FSRS Settings"
    submit-label="Apply"
    :submit-disabled="!hasChanged"
    @close="cancel"
    @submit="submit"
  >
    <div class="flex flex-col gap-5">
      <!-- New cards per session + min review interval -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1.5">
          <label
            for="fsrs-new-cards"
            class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50"
          >
            New cards / session
          </label>
          <input
            id="fsrs-new-cards"
            v-model.number="formData.newCardsPerSession"
            type="number"
            min="0"
            max="100"
            class="h-9 w-full rounded-sm bg-surface-container-lowest border border-outline-variant/20 px-3 text-sm font-light text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label
            for="fsrs-min-interval"
            class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50"
          >
            Min review interval
          </label>
          <input
            id="fsrs-min-interval"
            v-model.number="formData.minReviewInterval"
            type="number"
            min="0"
            class="h-9 w-full rounded-sm bg-surface-container-lowest border border-outline-variant/20 px-3 text-sm font-light text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <!-- Due date floor -->
      <div class="flex flex-col gap-1.5">
        <label
          for="fsrs-floor"
          class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50"
        >
          Due date floor (minutes)
        </label>
        <input
          id="fsrs-floor"
          v-model.number="formData.floorDueDateMinutes"
          type="number"
          min="0"
          class="h-9 w-full rounded-sm bg-surface-container-lowest border border-outline-variant/20 px-3 text-sm font-light text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <!-- Only rate if due -->
      <label class="flex items-center justify-between gap-6 py-1 cursor-pointer select-none">
        <span class="text-sm font-light text-on-surface">Only rate if due</span>
        <button
          type="button"
          role="switch"
          :aria-checked="formData.onlyRateIfDue"
          class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
          :class="formData.onlyRateIfDue ? 'bg-primary' : 'bg-surface-container-highest'"
          @click="formData.onlyRateIfDue = !formData.onlyRateIfDue"
        >
          <span
            class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
            :class="formData.onlyRateIfDue ? 'translate-x-[18px]' : 'translate-x-[3px]'"
          />
        </button>
      </label>
    </div>
  </FormDialog>
</template>
