<script setup lang="ts">
import type { NoteType } from 'core/NoteType.js'
import type { NoteField } from 'core/NoteField.js'

interface Props {
  noteType: NoteType
  field: NoteField<any>
}

defineProps<Props>()
import NamedFieldSettingsCard from '@/components/fields/common/NamedFieldSettingsCard.vue'
</script>

<template>
  <NamedFieldSettingsCard name="Image field" :field="field" :note-type="noteType" />
</template>
