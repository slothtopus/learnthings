<script setup lang="ts">
import { computed } from 'vue'
import FormDialog from '@/components/used/FormDialog.vue'
import SelectDropdown from '@/components/SelectDropdown.vue'
import { useDialogForm } from '@/composables/useFormDialog'

export type ChangeCardVariantFormData = {
  defaultVariantId: string
  cardVariantOverrideId: string | null
}

type ChangeCardVariantContext = {
  variants: { id: string; name: string }[]
}

const { formData, contextData, hasChanged, submit, cancel } =
  useDialogForm<ChangeCardVariantFormData, ChangeCardVariantContext>()

const variants = computed(() => contextData?.variants ?? [])

const variantOptions = computed(() =>
  variants.value.map((v) => ({ value: v.id, label: v.name })),
)

const useOverride = computed({
  get: () => formData.cardVariantOverrideId !== null,
  set: (val: boolean) => {
    formData.cardVariantOverrideId = val ? formData.defaultVariantId : null
  },
})
</script>

<template>
  <FormDialog
    title="Card variant"
    submit-label="Apply"
    :submit-disabled="!hasChanged"
    @close="cancel"
    @submit="submit"
  >
    <div class="flex flex-col gap-5">
      <!-- Default variant -->
      <div class="flex flex-col gap-1.5">
        <span class="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50">
          Default variant
        </span>
        <SelectDropdown
          v-model="formData.defaultVariantId"
          :options="variantOptions"
          placeholder="Select variant"
          size="sm"
          class="!space-y-0"
        />
      </div>

      <!-- Override for this card -->
      <div class="flex flex-col gap-2">
        <label class="flex items-center justify-between gap-6 py-1 cursor-pointer select-none">
          <span class="text-sm font-light text-on-surface">Override for this card</span>
          <button
            type="button"
            role="switch"
            :aria-checked="useOverride"
            class="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors"
            :class="useOverride ? 'bg-primary' : 'bg-surface-container-highest'"
            @click="useOverride = !useOverride"
          >
            <span
              class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
              :class="useOverride ? 'translate-x-[18px]' : 'translate-x-[3px]'"
            />
          </button>
        </label>

        <SelectDropdown
          v-if="useOverride"
          v-model="formData.cardVariantOverrideId!"
          :options="variantOptions"
          placeholder="Select variant"
          size="sm"
          class="!space-y-0"
        />
      </div>
    </div>
  </FormDialog>
</template>
