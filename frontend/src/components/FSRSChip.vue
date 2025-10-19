<script setup lang="ts">
import { computed, ref } from 'vue'

import { Button, Dialog } from 'primevue'
import { isEqual } from 'lodash-es'

import FSRSSettingsForm from './forms/FSRSSettingsForm.vue'

import { FSRSScheduler } from 'core/FSRSScheduler.js'
import RoundedContainer from './common/RoundedContainer.vue'

interface Props {
  scheduler: FSRSScheduler
}
const props = defineProps<Props>()

const emit = defineEmits<{
  updated: [value: void]
}>()

const showDialog = ref(false)
const options = ref({ ...props.scheduler.options })
const canUpdate = computed(() => !isEqual(options.value, props.scheduler.options))

const handleShowDialog = () => {
  options.value = { ...props.scheduler.options }
  showDialog.value = true
}

const handleUpdate = () => {
  props.scheduler.updateOptions(options.value)
  props.scheduler.deck.persist()
  emit('updated')
  showDialog.value = false
}
const handleCancel = () => {
  showDialog.value = false
}
</script>

<template>
  <RoundedContainer class="mt-8 w-full flex items-center">
    <i class="pi pi-clock dark:text-white" />
    <span class="ml-2 dark:text-gray-300 font-thin">FSRS Scheduler</span>
    <Button
      class="ml-auto"
      icon="pi pi-cog"
      rounded
      severity="secondary"
      size="small"
      @click="handleShowDialog"
    ></Button>
  </RoundedContainer>
  <Dialog v-model:visible="showDialog" :modal="true" header="FSRS Settings">
    <FSRSSettingsForm v-model="options" />
    <div class="mt-6 flex gap-4 justify-end">
      <Button label="Update" :disabled="!canUpdate" size="small" @click="handleUpdate" />
      <Button label="Cancel" size="small" severity="secondary" @click="handleCancel" />
    </div>
  </Dialog>
</template>

<style scoped></style>
