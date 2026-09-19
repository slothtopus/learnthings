<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FormDialog from '@/components/common/FormDialog.vue'
import AppInput from '@/components/common/AppInput.vue'
import AppIconButton from '@/components/common/AppIconButton.vue'
import OptionListItem from '@/components/common/OptionListItem.vue'
import { useDialogForm } from '@/composables/useFormDialog'

import { slugify, isValidSlug } from 'core/utils/slug.js'
import type { NoteType } from 'core/NoteType.js'

export type AddFieldFormData = {
  name: string
  /** What card templates use to reference the field, e.g. {{front}}. */
  slug: string
  /** What belongs in this field. Shown in the editor and given to agents. */
  description: string
  fieldType: 'text' | 'image' | 'audio' | 'text-to-audio'
}

/** The note type the field is being added to, so slugs can be checked for clashes. */
type TContext = { noteType: NoteType }

const { formData, contextData, submit, cancel, hasChanged } = useDialogForm<
  AddFieldFormData,
  TContext
>()

const slugEditable = ref(false)

// Auto-generate slug from name (only while not manually edited)
watch(
  () => formData.name,
  (name) => {
    if (!slugEditable.value) formData.slug = slugify(name)
  },
)

/** Slugs already used by this note type's fields. */
const takenSlugs = computed(
  () => new Set((contextData?.noteType.getAllFields() ?? []).map((f) => f.slug)),
)

const slugError = computed(() => {
  const slug = formData.slug.trim()
  if (slug === '') return 'A template name is required.'
  if (!isValidSlug(slug))
    return 'Use letters, numbers and underscores, starting with a letter or underscore.'
  if (takenSlugs.value.has(slug)) return 'Another field already uses this template name.'
  return undefined
})

const canSubmit = computed(
  () => hasChanged.value && !!formData.fieldType && !!formData.name.trim() && !slugError.value,
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
    :submit-disabled="!canSubmit"
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
              @click="slugEditable ? ((slugEditable = false), (formData.slug = slugify(formData.name))) : (slugEditable = true)"
            />
          </div>
          <p v-if="slugError" class="text-xs font-light text-error">{{ slugError }}</p>
          <p v-else class="text-xs font-light text-on-surface-variant/60 italic">
            This is how you reference the field in your card templates.
          </p>
        </div>

        <div class="space-y-2">
          <AppInput
            v-model="formData.description"
            label="Description"
            placeholder="What goes in this field?"
            :multiline="true"
            :rows="2"
          />
          <p class="text-xs font-light text-on-surface-variant/60 italic">
            Explains the field to anyone &mdash; or anything &mdash; filling it in later.
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
