<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Button, Select, Checkbox } from 'primevue'

import { useFormDialogData } from '@/composables/useFormDialog'
export type FormData = {
  variants: { id: string; name: string }[]
  defaultVariantId: string
  cardVariantOverrideId: string | null
}

defineEmits<{
  update: [data: FormData]
  cancel: [value: void]
}>()

const { formData, hasChanged } = useFormDialogData<FormData>({
  variants: [],
  defaultVariantId: '',
  cardVariantOverrideId: null,
})

const useDefaultVariant = ref(formData.value.cardVariantOverrideId === null)
const useOverrideVariant = computed({
  get: () => !useDefaultVariant.value,
  set: (val: boolean) => (useDefaultVariant.value = !val),
})
//const useOverrideVariant = ref(formData.value.cardVariantOverrideId !== null)

watch(useOverrideVariant, (newVal) => {
  if (newVal) {
    formData.value.cardVariantOverrideId = formData.value.defaultVariantId
    useDefaultVariant.value = false
  } else {
    formData.value.cardVariantOverrideId = null
    useDefaultVariant.value = true
  }
})

const selectedDefaultVariantId = computed({
  get: () => formData.value.variants.find((v) => v.id === formData.value.defaultVariantId)!,
  set: ({ id }) => (formData.value.defaultVariantId = id),
})

const selectedOverrideVariantId = computed({
  get: () =>
    formData.value.variants.find((v) => v.id === formData.value.cardVariantOverrideId) ?? null,
  set: (variant: { id: string } | null) => {
    formData.value.cardVariantOverrideId = variant ? variant.id : null
  },
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!--<h2>Card variant: <span class="text-green-600">use default</span></h2>-->
    <div class="flex gap-4 items-center">
      <label for="min-session-cards" class="font-thin block">Use default variant</label>
      <Checkbox v-model="useDefaultVariant" binary />
    </div>
    <div>
      <label for="min-review-interval" class="font-thin block mb-2">Default variant</label>
      <Select
        v-model="selectedDefaultVariantId"
        :disabled="!useDefaultVariant"
        :options="formData.variants"
        optionLabel="name"
        fluid
      />
    </div>
    <div class="flex gap-4 items-center">
      <label for="min-session-cards" class="font-thin block">Override variant for card</label>
      <Checkbox v-model="useOverrideVariant" binary />
    </div>
    <div>
      <Select
        :disabled="!useOverrideVariant"
        v-model="selectedOverrideVariantId"
        :options="formData.variants"
        optionLabel="name"
        fluid
      />
    </div>
    <div class="mt-6 flex gap-4 justify-end">
      <Button
        :disabled="!hasChanged"
        label="Update"
        size="small"
        @click="$emit('update', formData)"
      />
      <Button label="Cancel" size="small" severity="secondary" @click="$emit('cancel')" />
    </div>
  </div>
</template>

<style scoped></style>
