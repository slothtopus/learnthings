<script setup lang="ts">
import { computed } from 'vue'

import SectionLayout from '@/views/layouts/SectionLayout.vue'

import { Button } from '@/components/shadcn-ui/button'
import Draggable from 'vuedraggable'

import CardStack from '@/components/ui/CardStack.vue'
import LtNoteType from '@/components/LtNoteType.vue'

import type { Deck } from '@/lib/Deck'
import type { NoteType } from '@/lib/NoteType'
import type { AsyncLoader } from '@/lib/loader'

interface Props {
  deck: Deck
}
const props = defineProps<Props>()

const noteTypes = computed({
  get: () => props.deck.noteTypes,
  set: (noteTypes: NoteType[]) => props.deck.setNoteTypes(noteTypes)
})

/*const noteTypes = computed({
  get: () => props.deck.noteTypes.objects,
  set: (noteTypes: AsyncLoader<NoteType>[]) => props.deck.noteTypes.setObjects(noteTypes)
})*/
</script>

<template>
  <SectionLayout>
    <template #title>Note types</template>
    <template #controls><Button @click="deck.createNewNoteType()">Create new</Button></template>
    <template #content>
      <CardStack>
        <Draggable v-model="noteTypes" item-key="id" handle=".drag-handle">
          <template #item="{ element }: { element: NoteType; index: number }">
            <LtNoteType
              @edit="
                $router.push({
                  name: 'settings-notetype',
                  params: { deckId: deck.id, noteTypeId: element.id }
                })
              "
              @delete="deck.deleteNoteType(element.id)"
              >{{ element.name }}</LtNoteType
            >
          </template>
        </Draggable>
      </CardStack>
      <!--<CardStack>
        <Draggable v-model="noteTypes" item-key="id" handle=".drag-handle">
          <template #item="{ element }: { element: AsyncLoader<NoteType> }">
            <p v-if="element.data === undefined">NOTHING HERE</p>
            <LtNoteType
              v-else
              @edit="
                $router.push({
                  name: 'edit-notetype',
                  params: { deckId: deck.id, noteTypeId: element.id }
                })
              "
              @delete="deck.deleteNoteType(element.id)"
              >{{ element.data.name }}</LtNoteType
            >
          </template>
        </Draggable>
      </CardStack>-->
    </template>
  </SectionLayout>
</template>

<style scoped></style>
