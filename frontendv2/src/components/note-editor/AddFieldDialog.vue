<script setup lang="ts">
import { ref, watch } from 'vue'
import FormDialog from '@/components/FormDialog.vue'
import AppInput from '@/components/AppInput.vue'
import AppIconButton from '@/components/AppIconButton.vue'
import OptionListItem from '@/components/OptionListItem.vue'
import { useDialogForm } from '@/composables/useFormDialog'

export type AddFieldFormData = {
  name: string
  slug: string
  fieldType: 'text' | 'image' | 'audio' | 'text-to-audio' 
}

const { formData, submit, cancel, hasChanged } = useDialogForm<AddFieldFormData>()

const slugEditable = ref(false)

// Auto-generate slug from name (only while not manually edited)
watch(
  () => formData.name,
  (name) => {
    if (!slugEditable.value) {
      formData.slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\\-]/g, '')
    }
  },
)

const fieldTypes: {
  key: AddFieldFormData['fieldType']
  label: string
  icon: string
  description: string
}[] = [
  { key: 'text', label: 'Text', icon: 'match_word', description: 'Standard alphanumeric entry for definitions or notes.' },
  { key: 'image', label: 'Image', icon: 'image', description: 'Visual aids, diagrams, or archival photographs.' },
  { key: 'audio', label: 'Audio', icon: 'graphic_eq', description: 'Recorded pronunciations or archival sound clips.' },
  { key: 'text-to-audio', label: 'Text-to-Audio', icon: 'auto_awesome', description: 'Automatically generates high-fidelity audio from a selected text field.' },
] as const
</script>

<template>
  <FormDialog
    title="Add New Field"
    submit-label="Add Field"
    :submit-disabled="!hasChanged || !formData.fieldType || !formData.name || !formData.slug"
    :show="true"
    @close="cancel"
    @submit="submit"
  >
    <div class="space-y-6">
      <!-- Name & slug -->
      <div class="space-y-4">
        <AppInput
          v-model="formData.name"
          label="Field Name"
          placeholder="e.g. Definition"
        />
        <div class="space-y-2">
          <span class="text-[10px] font-light uppercase tracking-[0.3em] text-on-surface-variant">
            Field Slug
          </span>
          <div class="flex items-center gap-2">
            <AppInput
              v-if="slugEditable"
              v-model="formData.slug"
              placeholder="e.g. front"
              class="flex-1"
            />
            <div
              v-else
              class="flex-1 bg-surface-container-low border border-white/5 rounded-sm px-4 py-4 text-sm font-light text-on-surface/40 font-mono"
            >
              {{ formData.slug || '—' }}
            </div>
            <AppIconButton
              :icon="slugEditable ? 'close' : 'edit'"
              size="sm"
              @click="slugEditable ? (slugEditable = false, formData.slug = formData.name.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')) : (slugEditable = true)"
            />
          </div>
          <p class="text-xs font-light text-on-surface-variant/60 italic">
            This is how you reference the field in your card templates.
          </p>
        </div>
      </div>

      <!-- Field type selector -->
      <div class="space-y-2">
        <OptionListItem
          v-for="type in fieldTypes"
          :key="type.key"
          :icon="type.icon"
          :label="type.label"
          :description="type.description"
          :selected="formData.fieldType === type.key"
          @select="formData.fieldType = type.key"
        />
      </div>
    </div>
  </FormDialog>
</template>
