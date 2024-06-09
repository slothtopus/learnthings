<script setup lang="ts">
import { ref, watch, computed } from 'vue'

import SectionLayout from '@/views/layouts/SectionLayout.vue'

import SelectControl from '@/components/ui/SelectControl.vue'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs'
import { Button } from '@/components/shadcn-ui/button'

import NoteViewEditSection from './NoteViewEditSection.vue'
import CardPreview from '@/components/CardPreview.vue'

import type { NoteType } from '@/lib/NoteType'
import { Note } from '@/lib/Note'

import { useToast } from '@/components/shadcn-ui/toast/use-toast'

interface Props {
  noteTypes: NoteType[]
  noteType: NoteType
}
const props = defineProps<Props>()

const selectedTab = ref<'edit' | 'preview'>('edit')

const note = ref<Note>(Note.createNewEmpty(props.noteType))
watch(
  () => props.noteType,
  () => {
    note.value = Note.createNewEmpty(props.noteType)
  }
)

const noteTypeOptions = computed(() =>
  props.noteTypes.map((n) => ({ id: String(n.id), value: n.name }))
)
const cardTemplateOptions = computed(() =>
  props.noteType.cards.map((c) => ({ id: String(c.id), value: c.name }))
)
const selectedCardTemplateOption = ref(cardTemplateOptions.value[0])
const selectedCardTemplate = computed(() =>
  props.noteType.cards.find((c) => String(c.id) == selectedCardTemplateOption.value.id)
)

const { toast } = useToast()
const handleAddNote = async () => {
  note.value = await Note.service.addNew(note.value)
  toast({
    title: 'Note added!',
    description: `Note added with id ${note.value.id}`
  })
  note.value = Note.createNewEmpty(props.noteType)
}
</script>

<template>
  <SectionLayout class="grow">
    <template #title>Add new note</template>
    <template #controls>
      <SelectControl
        :options="noteTypeOptions"
        :modelValue="{ id: String(noteType.id), value: noteType.name }"
        @update:modelValue="
          $event &&
            $router.replace({
              name: 'new-note',
              params: { ...$route.params, noteTypeId: $event.id }
            })
        "
      />
      <SelectControl :options="cardTemplateOptions" v-model="selectedCardTemplateOption" />
      <Button @click="handleAddNote">Add</Button></template
    >
    <template #content
      ><Tabs v-model="selectedTab" class="flex flex-col grow">
        <TabsList class="grid w-96 grid-cols-2 mx-auto">
          <TabsTrigger value="edit"> Edit </TabsTrigger>
          <TabsTrigger value="preview"> Preview </TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <NoteViewEditSection :noteType="noteType" :note="note" />
        </TabsContent>
        <TabsContent class="grow" value="preview">
          <CardPreview
            v-if="selectedCardTemplate !== undefined"
            :template="selectedCardTemplate"
            :noteFields="noteType.fields"
            :noteFieldContent="note.content"
          />
        </TabsContent>
      </Tabs>
    </template>
  </SectionLayout>
</template>

<style scoped></style>
