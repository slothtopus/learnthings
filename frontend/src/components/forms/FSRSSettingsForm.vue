<script setup lang="ts">
import { defineModel } from 'vue'

import { InputNumber, Checkbox } from 'primevue'

import type { FRSROptions } from 'core/FSRSScheduler.js'

const options = defineModel<FRSROptions>({ required: true })
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-row gap-4">
      <div>
        <label for="new-cards-per-session" class="font-thin block mb-2"
          >New cards per session</label
        >
        <InputNumber
          v-model="options.newCardsPerSession"
          inputId="new-cards-per-session"
          mode="decimal"
          showButtons
          :min="0"
          :max="100"
          fluid
        />
      </div>
      <div>
        <label for="min-review-interval" class="font-thin block mb-2">Min review interval</label>
        <InputNumber
          v-model="options.minReviewInterval"
          inputId="min-review-interval"
          mode="decimal"
          showButtons
          :min="0"
          :max="100"
          fluid
        />
      </div>
    </div>

    <div class="flex flex-row gap-4">
      <div>
        <label for="min-session-cards" class="font-thin block mb-2">Due date floor (minutes)</label>
        <InputNumber
          v-model="options.floorDueDateMinutes"
          inputId="min-session-cards"
          mode="decimal"
          showButtons
          :min="0"
          fluid
        />
      </div>
    </div>
    <div class="flex gap-4 items-center">
      <label for="min-session-cards" class="font-thin block">Only rate if due</label>
      <Checkbox v-model="options.onlyRateIfDue" binary />
    </div>
  </div>
</template>

<style scoped></style>
