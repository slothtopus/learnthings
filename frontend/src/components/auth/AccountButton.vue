<script setup lang="ts">
import { ref } from 'vue'

import { Button, Menu } from 'primevue'
import LoginDialog from './LoginDialog.vue'
import RegisterDialog from './RegisterDialog.vue'

import { useAuth } from '@/composables/useAuth'

const { username, userId, signedIn, signOut } = useAuth()

const accountMenu = ref<{ toggle: (e: any) => void } | null>(null)
const toggleMenu = (event: any) => {
  accountMenu.value?.toggle(event)
}

const showLoginDialog = ref(false)
const showRegisterDialog = ref(false)
</script>

<template>
  <Button
    icon="pi pi-user"
    rounded
    :severity="userId == 'guest' ? 'contrast' : 'primary'"
    :outlined="userId == 'guest'"
    size="small"
    aria-haspopup="true"
    aria-controls="account-menu"
    @click="toggleMenu"
  />
  <Menu ref="accountMenu" id="account-menu" :popup="true">
    <template #start>
      <div class="p-4 flex flex-col items-center gap-3">
        <div class="rounded-full p-4 bg-gray-400">
          <span class="pi pi-user" style="font-size: 2em"></span>
        </div>
        <span class="text-sm dark:text-gray-300">{{ username }}</span>

        <Button
          v-if="!signedIn"
          label="Login"
          size="small"
          class="w-full mt-4"
          @click="showLoginDialog = true"
        />
        <Button
          v-if="!signedIn"
          label="Register"
          size="small"
          class="w-full"
          @click="showRegisterDialog = true"
        />
        <Button v-else label="Logout" size="small" class="w-full mt-4" @click="signOut" />
      </div>
    </template>
  </Menu>
  <LoginDialog v-model:visible="showLoginDialog" />
  <RegisterDialog v-model:visible="showRegisterDialog" />
</template>

<style scoped></style>
