<script setup lang="ts">
import { computed, watch } from 'vue'
import FormDialog from '@/components/common/FormDialog.vue'
import AppInput from '@/components/common/AppInput.vue'
import { useDialogForm } from '@/composables/useFormDialog'

export type FieldSettingsFormData = {
  name: string
  slug: string
  description: string
}

const { formData, submit, cancel, hasChanged } = useDialogForm<FieldSettingsFormData>()

// Keep the template name in step with the display name until it is edited by
// hand, at which point it is left alone.
let slugTouched = false
const markSlugTouched = () => (slugTouched = true)

const slugify = (name: string) =>
  name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

// Built in script: a literal {{ inside a template interpolation cannot be parsed.
const templateRef = computed(
  () => '{' + '{' + (formData.slug || 'field') + '}' + '}',
)

watch(
  () => formData.name,
  (name) => {
    if (!slugTouched) formData.slug = slugify(name)
  },
)
</script>

<template>
  <FormDialog
    title="Field Settings"
    subtitle="Rename this field, choose how card templates refer to it, and say what it holds."
    submit-label="Save"
    :submit-disabled="!hasChanged || !formData.name.trim() || !formData.slug.trim()"
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
        <p class="mt-2 text-xs font-light text-on-surface-variant/70">
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
