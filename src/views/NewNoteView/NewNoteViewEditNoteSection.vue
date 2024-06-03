<script setup lang="ts">
import { NoteType } from '@/lib/NoteType'

import LabelledControl from '@/components/ui/LabelledControl.vue'
import { Textarea } from '@/components/shadcn-ui/textarea'
import { Label } from '@/components/shadcn-ui/label'

interface Props {
  noteType: NoteType
}
defineProps<Props>()
</script>

<template>
  <div class="flex flex-col gap-5">
    <LabelledControl v-for="field in noteType.fields" :key="field.id">
      <Label :for="`field-${field.name}-${field.id}`">{{ field.name }}</Label>
      <Textarea :id="`field-${field.name}-${field.id}`" />
    </LabelledControl>
  </div>
</template>

<style scoped></style>
