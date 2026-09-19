<script setup lang="ts">
import { computed, watch } from 'vue'
import FormDialog from '@/components/common/FormDialog.vue'
import AppInput from '@/components/common/AppInput.vue'
import { useDialogForm } from '@/composables/useFormDialog'

import { slugify, isValidSlug } from 'core/utils/slug.js'
import type { NoteType } from 'core/NoteType.js'
import type { AnyNoteField } from 'core/fields/base.js'

export type GenericFieldSettingsFormData = {
  name: string
  slug: string
  description: string
}

/** The field being edited, and its note type, so slugs can be checked for clashes. */
type TContext = { noteType: NoteType; field: AnyNoteField }

const { formData, contextData, submit, cancel, hasChanged } = useDialogForm<
  GenericFieldSettingsFormData,
  TContext
>()

// Keep the template name in step with the display name until it is edited by
// hand, at which point it is left alone.
let slugTouched = false
const markSlugTouched = () => (slugTouched = true)

watch(
  () => formData.name,
  (name) => {
    if (!slugTouched) formData.slug = slugify(name)
  },
)

/** Slugs already used by the note type's other fields. */
const takenSlugs = computed(
  () =>
    new Set(
      (contextData?.noteType.getAllFields() ?? [])
        .filter((f) => f !== contextData?.field)
        .map((f) => f.slug),
    ),
)

const slugError = computed(() => {
  const slug = formData.slug.trim()
  if (slug === '') return 'A template name is required.'
  if (!isValidSlug(slug))
    return 'Use letters, numbers and underscores, starting with a letter or underscore.'
  if (takenSlugs.value.has(slug)) return 'Another field already uses this template name.'
  return undefined
})

// Built in script: a literal {{ inside a template interpolation cannot be parsed.
const templateRef = computed(() => '{' + '{' + (formData.slug || 'field') + '}' + '}')

const canSubmit = computed(
  () => hasChanged.value && !!formData.name.trim() && !slugError.value,
)
</script>

<template>
  <FormDialog
    title="Field Settings"
    subtitle="Rename this field, choose how card templates refer to it, and say what it holds."
    submit-label="Save"
    :submit-disabled="!canSubmit"
    @submit="submit"
    @close="cancel"
  >
    <div class="flex flex-col gap-5">
      <AppInput v-model="formData.name" label="Field Name" placeholder="e.g. Front of card" />

      <div>
        <AppInput
          v-model="formData.slug"
          label="Template Name"
          placeholder="e.g. front"
          @input="markSlugTouched"
        />
        <p v-if="slugError" class="mt-2 text-xs font-light text-error">{{ slugError }}</p>
        <p v-else class="mt-2 text-xs font-light text-on-surface-variant/70">
          Use this in card templates as
          <code class="text-primary">{{ templateRef }}</code>. Changing it will break
          templates that use the old name.
        </p>
      </div>

      <div>
        <AppInput
          v-model="formData.description"
          label="Description"
          placeholder="What goes in this field?"
          :multiline="true"
          :rows="3"
        />
        <p class="mt-2 text-xs font-light text-on-surface-variant/70">
          Explains the field to anyone — or anything — filling it in later.
        </p>
      </div>
    </div>
  </FormDialog>
</template>
