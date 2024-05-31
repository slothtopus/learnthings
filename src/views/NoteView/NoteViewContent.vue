<script setup lang="ts">
import { ref } from 'vue'

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

import NoteViewEditNoteSection from './NoteViewEditNoteSection.vue'

import type { NoteType } from '@/lib/NoteType'

interface Props {
  noteType: NoteType
}
defineProps<Props>()

const selectedTab = ref<'edit' | 'preview'>('edit')

const selectedNoteType = ref('one')
const NOTETYPES = ['one']
</script>

<template>
  <SectionLayout>
    <template #title>Add new note</template>
    <template #controls>
      <Select v-model="selectedNoteType">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Note type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem v-for="noteType in NOTETYPES" :key="noteType" :value="noteType"
              >{{ noteType }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button>Add</Button></template
    >
    <template #content
      ><Tabs v-model="selectedTab">
        <TabsList class="grid w-96 grid-cols-2 mx-auto">
          <TabsTrigger value="edit"> Edit </TabsTrigger>
          <TabsTrigger value="preview"> Preview </TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <NoteViewEditNoteSection :noteType="noteType" />
        </TabsContent>
        <TabsContent value="preview">
          <p>Preview stuff goes here</p>
        </TabsContent>
      </Tabs>
    </template>
  </SectionLayout>
</template>

<style scoped></style>
