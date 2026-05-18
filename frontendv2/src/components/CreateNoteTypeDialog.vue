<script setup lang="ts">
import { ref } from 'vue'
import FormDialog from '@/components/FormDialog.vue'
import AppInput from '@/components/AppInput.vue'

defineProps<{ show: boolean }>()

defineEmits<{
  close: []
  create: [payload: { name: string; description: string }]
}>()

const name = ref('')
const description = ref('')
</script>

<template>
  <FormDialog
    title="New Note Type"
    subtitle="Note Types"
    submit-label="Create Note Type"
    :submit-disabled="!name.trim()"
    :show="show"
    @close="$emit('close')"
    @submit="$emit('create', { name: name.trim(), description: description.trim() })"
  >
    <div class="space-y-8">
      <AppInput v-model="name" label="Name" placeholder="e.g. Vocabulary" />
      <AppInput v-model="description" label="Description" placeholder="Brief summary of this note type's purpose..." multiline />
    </div>
  </FormDialog>
</template>
