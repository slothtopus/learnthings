<script setup lang="ts">
import type { NoteType } from 'core/NoteType.js'

import { Card, Fieldset } from 'primevue'
import NoteFieldSettings from './fields/NoteFieldSettings.vue'
import CardTemplateSettings from './cardTemplates/CardTemplateSettings.vue'

import { useNoteTypeDetails } from '@/composables/useObjectDetails'

interface Props {
  noteType: NoteType
}
const props = defineProps<Props>()

const { fieldCount, cardTemplateCount } = useNoteTypeDetails(() => props.noteType)
</script>

<template>
  <Card class="border border-gray-500 w-full">
    <template #header>
      <div class="flex p-5 pb-0">
        <h2 class="justify-center text-xl sm:text-2xl dark:text-gray-300">{{ noteType.name }}</h2>
      </div>
    </template>
    <template #content>
      <div class="flex flex-col w-full gap-6">
        <Fieldset :legend="`Fields (${fieldCount})`" toggleable>
          <NoteFieldSettings :noteType="noteType" />
        </Fieldset>
        <Fieldset :legend="`Card templates (${cardTemplateCount})`" toggleable>
          <CardTemplateSettings :noteType="noteType" />
        </Fieldset>
      </div>
    </template>
  </Card>
</template>

<style scoped></style>
