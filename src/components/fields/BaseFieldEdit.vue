<script setup lang="ts">
//import { onMounted, ref } from 'vue'
import { Button } from '@/components/shadcn-ui/button'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'

import LabelledControl from '@/components/ui/LabelledControl.vue'

import BottomSheet from '@/components/ui/BottomSheet.vue'

import { NoteField } from '@/lib/NoteField'

interface Props {
  field: NoteField
}
defineProps<Props>()

defineEmits<{
  resolve: [field: NoteField]
}>()
</script>

<template>
  <BottomSheet>
    <template #title>Add new text field</template>
    <template #content>
      <LabelledControl>
        <Label :for="`field-id-${field.id}`">Field ID</Label>
        <Input :id="`field-id-${field.id}`" />
      </LabelledControl>
      <LabelledControl>
        <Label :for="`field-name-${field.id}`">Field name</Label>
        <Input :id="`field-name-${field.id}`" />
      </LabelledControl>
    </template>
  </BottomSheet>
</template>

<style scoped></style>
