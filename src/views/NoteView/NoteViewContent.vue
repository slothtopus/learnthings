<script setup lang="ts">
import { ref, computed } from 'vue'

import SectionLayout from '@/views/layouts/SectionLayout.vue'

import SelectControl from '@/components/ui/SelectControl.vue'

import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs'
//import { Button } from '@/components/shadcn-ui/button'

import NoteViewEditSection from './NoteViewEditSection.vue'
import NoteViewPreviewSection from './NoteViewPreviewSection.vue'

import type { NoteType } from '@/lib/NoteType'
import { Note } from '@/lib/Note'

//import { useToast } from '@/components/shadcn-ui/toast/use-toast'

interface Props {
  title: string
  disableNoteTypeSelect?: boolean
  noteTypes: NoteType[]
  noteType: NoteType
  note: Note
}
const props = defineProps<Props>()

/*const note = ref<Note>(Note.createNewEmpty(props.noteType))
watch(
  () => props.noteType,
  () => {
    note.value = Note.createNewEmpty(props.noteType)
  }
)*/

const noteTypeOptions = computed(() =>
  props.noteTypes.map((n) => ({ id: String(n.id), value: n.name }))
)

/*const { toast } = useToast()
const handleAddNote = async () => {
  note.value = await Note.service.addNew(note.value)
  toast({
    title: 'Note added!',
    description: `Note added with id ${note.value.id}`
  })
  note.value = Note.createNewEmpty(props.noteType)
}*/

const selectedTab = ref<'edit' | 'preview'>('edit')
</script>

<template>
  <SectionLayout class="h-full">
    <template #title>{{ title }}</template>
    <template #controls>
      <Tabs v-model="selectedTab">
        <TabsList class="grid w-64 grid-cols-2 mx-auto">
          <TabsTrigger value="edit"> Edit note</TabsTrigger>
          <TabsTrigger value="preview"> Preview cards</TabsTrigger>
        </TabsList>
      </Tabs>
      <slot></slot>
    </template>
    <template #content>
      <template v-if="selectedTab == 'edit'">
        <SelectControl
          class="mx-auto"
          :disabled="disableNoteTypeSelect"
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
        <NoteViewEditSection :noteType="noteType" :note="note" />
      </template>
      <NoteViewPreviewSection v-else :note="note" :noteType="noteType" />
    </template>
  </SectionLayout>
</template>

<style scoped></style>
