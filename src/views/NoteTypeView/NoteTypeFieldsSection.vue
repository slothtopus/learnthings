<script setup lang="ts">
import { computed } from 'vue'

import SectionLayout from '@/views/layouts/SectionLayout.vue'

import Draggable from 'vuedraggable'

import { Button } from '@/components/shadcn-ui/button'

import CardStack from '@/components/ui/CardStack.vue'

import LtNoteField from '@/components/LtNoteField.vue'

import type { NoteType } from '@/lib/NoteType'
import { NoteField } from '@/lib/NoteField'

interface Props {
  noteType: NoteType
}
const props = defineProps<Props>()

const fields = computed({
  get: () => props.noteType.fields,
  set: (fields: NoteField[]) => props.noteType.setFields(fields)
})
</script>

<template>
  <SectionLayout>
    <template #title>Fields</template>
    <template #controls><Button @click="props.noteType.createNewField()">Add new</Button></template>
    <template #content>
      <CardStack>
        <Draggable v-model="fields" item-key="id" handle=".drag-handle">
          <template #item="{ element }: { element: NoteField }">
            <LtNoteField :field="element" @delete="noteType.deleteField(element.id)" />
          </template>
        </Draggable>
      </CardStack>
    </template>
  </SectionLayout>
</template>

<style scoped></style>
