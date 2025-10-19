<script setup lang="ts">
import { ref, computed } from 'vue'

import { Dialog, Button } from 'primevue'
import LabelledTextInput from '@/components/common/LabelledTextInput.vue'

import { useAuth } from '@/composables/useAuth'
import { useToast } from 'primevue/usetoast'

const visible = defineModel<boolean>('visible')

const username = ref('')
const password = ref('')
const canLogin = computed(() => username.value.length > 0 && password.value.length > 0)

const { signIn } = useAuth()
const toast = useToast()
const handleSignIn = async () => {
  try {
    await signIn(username.value, password.value)
    visible.value = false
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: String(err), life: 3000 })
  }
}
</script>

<template>
  <Dialog header="Login" modal :style="{ width: '25rem' }" v-model:visible="visible">
    <div class="flex flex-col gap-6">
      <LabelledTextInput id="username" label="Username" v-model="username" />
      <LabelledTextInput id="password" label="Password" type="password" v-model="password" />
    </div>
    <div class="mt-6 flex gap-4 justify-end">
      <Button label="Login" size="small" :disabled="!canLogin" @click="handleSignIn" />
      <Button label="Cancel" size="small" severity="secondary" @click="visible = false" />
    </div>
  </Dialog>
</template>

<style scoped></style>
