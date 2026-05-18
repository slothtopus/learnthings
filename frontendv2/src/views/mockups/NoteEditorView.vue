<script setup lang="ts">
import { ref } from 'vue'
import PageLayout from '@/components/PageLayout.vue'
import NoteFieldWrapper from '@/components/NoteFieldWrapper.vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import CreateButton from '@/components/CreateButton.vue'
import ViewToggle from '@/components/ViewToggle.vue'
import TagInput from '@/components/TagInput.vue'
import CardTemplateCard from '@/components/note-editor/CardTemplateCard.vue'

const breadcrumbs = [
  { label: 'Anatomy', href: '#' },
  { label: 'Academic', href: '#' },
  { label: 'Obsidian' },
]

const viewMode = ref('field')
const viewOptions = [
  { value: 'field', label: 'Field View', icon: 'view_list' },
  { value: 'card', label: 'Card View', icon: 'grid_view' },
]

const tags = ref(['Physics', '2024'])
const tagOptions = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'History', 'Literature', 'Vocabulary', '2024', 'Exam', 'Review']
const front = ref('Obsidian')
const back = ref('A hard, dark, glasslike volcanic rock formed by the rapid solidification of lava without crystallization.')

const cardTemplates = ref([
  { name: 'Recognition', visible: true, selectedVariant: 'standard', variants: [{ value: 'standard', label: 'Standard' }, { value: 'reverse', label: 'Reverse Only' }] },
  { name: 'Production', visible: false, selectedVariant: 'reverse', variants: [{ value: 'standard', label: 'Standard' }, { value: 'reverse', label: 'Reverse Only' }] },
  { name: 'Listening', visible: true, selectedVariant: 'standard', variants: [{ value: 'standard', label: 'Standard' }, { value: 'reverse', label: 'Reverse Only' }] },
])
</script>

<template>
  <PageLayout :breadcrumbs="breadcrumbs">
    <template #title>
      <span class="inline-flex items-center bg-primary/15 border border-primary/30 text-primary rounded-sm px-2 py-0.5 mr-0.5">Anatomy</span>
      Note: 1 of 213
    </template>

    <div class="mt-6 pb-16">


      <!-- Controls: view toggle + save -->
      <div class="flex items-center justify-between mb-4">
        <ViewToggle v-model="viewMode" :options="viewOptions" size="md" />
        <div class="flex gap-4">
        <AppButton size="md">New</AppButton>
        <AppButton size="md">Save</AppButton>
        <AppButton size="md">Delete</AppButton>
        </div>
      </div>

      <!-- Fields -->
      <div class="space-y-2">
         <TagInput v-model="tags" class="mb-8" :options="tagOptions"  placeholder="Add tags..." size="md"/>

        <NoteFieldWrapper label="Front">
          <AppInput v-model="front" placeholder="Front of card..." />
        </NoteFieldWrapper>

        <NoteFieldWrapper label="Back">
          <AppInput v-model="back" placeholder="Back of card..." :multiline="true" :rows="3" />
        </NoteFieldWrapper>

        <NoteFieldWrapper label="Example Image">
          <div class="border border-dashed border-primary/20 rounded-sm flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group/upload h-28">
            <span class="material-symbols-outlined text-2xl text-primary/60 group-hover/upload:scale-110 transition-transform">add_photo_alternate</span>
            <span class="text-[9px] font-bold tracking-widest uppercase text-on-surface-variant">Upload Image</span>
          </div>
        </NoteFieldWrapper>

        <NoteFieldWrapper label="Pronunciation">
          <div class="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant/20 rounded-sm py-3 px-4">
            <button class="w-9 h-9 shrink-0 rounded-xs bg-primary flex items-center justify-center text-on-primary hover:bg-primary/90 transition-colors active:scale-90">
              <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24">play_arrow</span>
            </button>
            <div class="flex-grow h-1 bg-white/5 rounded-full overflow-hidden">
              <div class="w-1/3 h-full bg-primary rounded-full" />
            </div>
            <span class="text-[10px] font-bold tabular-nums text-on-surface-variant">0:01 / 0:03</span>
            <button class="text-on-surface/30 hover:text-error transition-colors">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </NoteFieldWrapper>
      </div>

      <!-- Add new field -->
      <div class="mt-6">
        <CreateButton label="Add New Field" />
      </div>
    </div>
  </PageLayout>
</template>
