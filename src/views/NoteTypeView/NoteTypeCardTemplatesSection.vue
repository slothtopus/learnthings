<script setup lang="ts">
import { computed } from 'vue'

import SectionLayout from '@/views/layouts/SectionLayout.vue'

import Draggable from 'vuedraggable'

import { Button } from '@/components/shadcn-ui/button'

import CardStack from '@/components/ui/CardStack.vue'

import LtCardTemplate from '@/components/LtCardTemplate.vue'

import type { NoteType } from '@/lib/NoteType'
import type { CardTemplate } from '@/lib/CardTemplate'

interface Props {
  noteType: NoteType
}
const props = defineProps<Props>()

const cards = computed({
  get: () => props.noteType.cards,
  set: (cards: CardTemplate[]) => props.noteType.setCards(cards)
})
</script>

<template>
  <SectionLayout>
    <template #title>Card templates</template>
    <template #controls><Button @click="props.noteType.createNewCard()">Add new</Button></template>
    <template #content>
      <CardStack>
        <Draggable v-model="cards" item-key="id" handle=".drag-handle">
          <template #item="{ element, index }: { element: CardTemplate; index: number }">
            <LtCardTemplate
              :card="element"
              @delete="noteType.deleteCard(element.id)"
              @edit="
                $router.push({
                  name: 'edit-cardtemplate',
                  params: { ...$route.params, cardTemplateIndex: index }
                })
              "
            />
          </template>
        </Draggable>
      </CardStack>
    </template>
  </SectionLayout>
</template>

<style scoped></style>
