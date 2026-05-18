<script setup lang="ts">
import { ref } from 'vue'
import FormDialog from '@/components/FormDialog.vue'
import AppInput from '@/components/AppInput.vue'
import TemplateOption from '@/components/TemplateOption.vue'

defineProps<{ show: boolean }>()

defineEmits<{
  close: [];
  create: [payload: { name: string; description: string; template: string }];
}>();

const name = ref("");
const description = ref("");
const selectedTemplate = ref("basic");

const templates = [
  { id: "empty", title: "Empty Deck", description: "Start from scratch" },
  {
    id: "quickstart",
    title: "Quickstart",
    description: "Build on existing templates",
  },
];
</script>

<template>
  <FormDialog
    title="Create New Deck"
    subtitle="New Collection"
    submit-label="Create Deck"
    :submit-disabled="!name.trim()"
    :show="show"
    @close="$emit('close')"
    @submit="$emit('create', { name: name.trim(), description: description.trim(), template: selectedTemplate })"
  >
    <div class="space-y-8">
      <AppInput v-model="name" label="Deck Name" placeholder="e.g. Molecular Biology Foundations" />
      <AppInput v-model="description" label="Description" placeholder="Brief summary of the deck's focus..." multiline />
      <div class="space-y-4">
        <label class="block text-[10px] font-light uppercase tracking-[0.3em] text-on-surface-variant">Templates</label>
        <div class="grid grid-cols-2 gap-4">
          <TemplateOption
            v-for="t in templates"
            :key="t.id"
            :title="t.title"
            :description="t.description"
            :selected="selectedTemplate === t.id"
            @select="selectedTemplate = t.id"
          />
        </div>
      </div>
    </div>
  </FormDialog>
</template>
