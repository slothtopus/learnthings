<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { username, signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
  router.push({ name: 'login' })
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button class="flex items-center gap-2 px-2 py-1.5 rounded-xs text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all duration-200 cursor-pointer">
        <span class="material-symbols-outlined text-xl leading-none">account_circle</span>
        <span class="text-[10px] font-bold uppercase tracking-widest hidden sm:block">{{ username }}</span>
        <span class="material-symbols-outlined text-sm leading-none">expand_more</span>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="min-w-48">
      <DropdownMenuLabel class="text-on-surface/40">{{ username }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleSignOut">
        <span class="material-symbols-outlined text-sm leading-none">logout</span>
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
