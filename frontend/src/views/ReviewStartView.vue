<script setup lang="ts">
import { ref, computed } from 'vue'

import { Button } from 'primevue'
import AppFrameScreenLayout from '@/layouts/AppFrameScreenLayout.vue'
import FSRSChip from '@/components/FSRSChip.vue'
import BoostNewCardsForm from '@/components/forms/BoostNewCardsForm.vue'
import type { FormData } from '@/components/forms/BoostNewCardsForm.vue'

import { DateTime } from 'luxon'
import { useFormDialog } from '@/composables/useFormDialog'
import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useDeckDetails } from '@/composables/useObjectDetails'
import { useRouter } from 'vue-router'

import RoundedContainer from '@/components/common/RoundedContainer.vue'

const router = useRouter()
const { getDeck } = useRouteMetaObjects()
const deck = getDeck()
const scheduler = deck.getScheduler()
const { cards } = useDeckDetails(deck)

const statistics = ref(scheduler.getStatistics(cards.value))
const refreshStatistics = () => {
  statistics.value = scheduler.getStatistics(cards.value)
}

const handleStartReview = () => {
  scheduler.initialise(cards.value)
  scheduler.addNewCardsToSession(additionalNewCards.value)
  router.push({ name: 'review_next', params: { deckId: deck.id } })
}

const { openDialog } = useFormDialog<FormData>(BoostNewCardsForm, 'Boost new cards')

const maxAdditionalNewCards = computed(() =>
  Math.max(statistics.value.not_due.new - additionalNewCards.value, 0),
)
const handleBoostNewCards = async () => {
  const result = await openDialog({
    additionalNewCards: 0,
    maxAdditionalNewCards: maxAdditionalNewCards.value,
  })
  if (!result.cancelled) {
    additionalNewCards.value = result.data.additionalNewCards
  }
}
const additionalNewCards = ref(0)

const totalCardsToReview = computed(
  () => statistics.value.due.new + statistics.value.due.seen + additionalNewCards.value,
)

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
      <div class="h-full w-full flex">
        <div class="m-auto py-8 px-4 w-full max-w-sm">
          <div class="flex flex-col items-center w-full">
            <h1 class="text-3xl dark:text-gray-300">{{ deck.name }}</h1>
            <h2 class="text-sm dark:text-gray-300 font-thin">
              {{ DateTime.now().toFormat('EEEE d MMMM, yyyy') }}
            </h2>
            <FSRSChip :scheduler="scheduler" @updated="refreshStatistics" />
            <div
              class="mt-8 flex flex-col p-6 items-center justify-center border border-emerald-400 rounded-full aspect-square"
            >
              <span class="text-4xl dark:text-white">{{ totalCardsToReview }}</span>
              <span class="mt-1 text-sm font-thin dark:text-gray-300">Cards to review</span>
            </div>
            <!--<Chip class="mt-8 w-full">-->
            <RoundedContainer class="mt-8 w-full">
              <div class="flex flex-col w-full">
                <div class="w-full flex items-center">
                  <i class="pi pi-file" style="color: #fbbf24" />
                  <span class="ml-2 dark:text-gray-300 font-thin">Cards to review:</span>
                  <span class="ml-auto mr-8 font-light dark:text-white">{{
                    statistics.due.seen
                  }}</span>
                  <Button icon="pi pi-plus" class="invisible" rounded size="small"></Button>
                  <Button icon="pi pi-times" class="invisible" rounded size="small"></Button>
                </div>
                <div class="w-full flex items-center mt-2">
                  <i class="pi pi-file" style="color: #34d399" />
                  <span class="ml-2 dark: dark:text-gray-300 font-thin">New cards to learn:</span>
                  <span class="ml-auto mr-8 font-light dark:text-white"
                    >{{ statistics.due.new }}

                    {{ additionalNewCards > 0 ? ` + ${additionalNewCards}` : '' }}</span
                  >
                  <Button
                    icon="pi pi-plus"
                    rounded
                    severity="secondary"
                    size="small"
                    :disabled="maxAdditionalNewCards == 0"
                    @click="handleBoostNewCards"
                  ></Button>
                  <Button
                    icon="pi pi-times"
                    rounded
                    :disabled="additionalNewCards == 0"
                    severity="secondary"
                    size="small"
                    @click="additionalNewCards = 0"
                  ></Button>
                </div>
              </div>
            </RoundedContainer>
            <Button
              class="mt-10 w-full"
              :disabled="totalCardsToReview == 0"
              @click="handleStartReview"
              >Start</Button
            >
          </div>
        </div>
      </div>
    </template>
  </AppFrameScreenLayout>
</template>

<style scoped></style>
