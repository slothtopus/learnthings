<script setup lang="ts">
import type { NoteType } from 'core/NoteType.js'
import type { AnyNoteField } from 'core/fields/base.js'

interface Props {
  noteType: NoteType
  field: AnyNoteField
}

defineProps<Props>()
import NamedFieldSettingsCard from '@/components/fields/common/NamedFieldSettingsCard.vue'
</script>

<template>
  <NamedFieldSettingsCard name="Image field" :field="field" :note-type="noteType" />
</template>
