<script setup lang="ts">
import { ref, watch } from 'vue'

import SectionLayout from '@/views/layouts/SectionLayout.vue'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem
} from '@/components/shadcn-ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn-ui/tabs'
import { Button } from '@/components/shadcn-ui/button'

import NoteViewEditSection from './NoteViewEditSection.vue'
import CardPreview from '@/components/CardPreview.vue'

import type { NoteType } from '@/lib/NoteType'
import { Note } from '@/lib/Note'

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
</script>

<template>
  <SectionLayout class="grow">
    <template #title>Add new note</template>
    <template #controls>
      <Select
        :modelValue="String(noteType.id)"
        @update:modelValue="
          $router.replace({ name: 'new-note', params: { ...$route.params, noteTypeId: $event } })
        "
      >
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Note type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              v-for="noteType in noteTypes"
              :key="noteType.id"
              :value="String(noteType.id)"
              >{{ noteType.name }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button>Add</Button></template
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
          <CardPreview />
        </TabsContent>
      </Tabs>
    </template>
  </SectionLayout>
</template>

<style scoped></style>
