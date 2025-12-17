<script setup lang="ts">
import { computed } from 'vue'

import AppFrameScreenLayout from '@/layouts/AppFrameScreenLayout.vue'

import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useDeckDetails } from '@/composables/useObjectDetails'
import { useRouter } from 'vue-router'

import FSRSSchedulerStartReview from '@/components/scheduler/FSRSSchedulerStartReview.vue'
import { FSRSScheduler } from 'core/schedulers/FSRSScheduler.js'

import FSRSSequenceStartReview from '@/components/scheduler/FSRSSequenceStartReview.vue'
import { FSRSSequence } from 'core/schedulers/FSRSSequence.js'

import { PersistableObject } from 'core/PersistableObject.js'

const { getDeck } = useRouteMetaObjects()
const deck = getDeck()
const { cards } = useDeckDetails(deck)
const scheduler = deck.getActiveScheduler()

const isFSRSScheduler = (val: PersistableObject<any>): val is FSRSScheduler =>
  val instanceof FSRSScheduler

const isFSRSSequence = (val: PersistableObject<any>): val is FSRSSequence =>
  val instanceof FSRSSequence

const router = useRouter()
const handleStart = () => {
  router.push({ name: 'review_next', params: router.currentRoute.value.params })
}

const breadcrumbs = computed(() => {
  return [
    { icon: 'pi pi-book', label: deck.name },
    { label: 'Review', route: `/review/${deck.id}/start` },
  ]
})
</script>

<template>
  <AppFrameScreenLayout noPadding :breadcrumbs="breadcrumbs">
    <template #content>
      <FSRSSchedulerStartReview
        v-if="isFSRSScheduler(scheduler)"
        :scheduler="scheduler"
        :cards="cards"
        @start="handleStart"
      />
      <FSRSSequenceStartReview
        v-else-if="isFSRSSequence(scheduler)"
        :scheduler="scheduler"
        :cards="cards"
        @start="handleStart"
      />
    </template>
  </AppFrameScreenLayout>
</template>

<style scoped></style>
