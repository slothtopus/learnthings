<script setup lang="ts">
import { useAttrs } from 'vue'

import { InputText } from 'primevue'
import LabelledFormContainer from './LabelledFormContainer.vue'

interface Props {
  label: string
  id: string
}
defineProps<Props>()

const attrs = useAttrs()
</script>

<template>
  <LabelledFormContainer :id="id" :label="label">
    <InputText v-bind="attrs" :inputId="id" class="w-full" />
  </LabelledFormContainer>
</template>

<style scoped></style>
