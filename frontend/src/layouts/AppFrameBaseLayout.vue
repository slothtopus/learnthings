<script setup lang="ts">
import AccountButton from '@/components/auth/AccountButton.vue'
import DebugButton from '@/components/debug/DebugButton.vue'
import { Breadcrumb } from 'primevue'

interface Props {
  breadcrumbs: { icon?: string; label: string; route?: string }[]
}
defineProps<Props>()
</script>

<template>
  <main class="app-layout w-full h-full bg-neutral-100 dark:bg-neutral-900">
    <nav class="pt-3 pb-1 px-8 w-full bg-slate-500 dark:bg-slate-800 flex">
      <div class="max-w-full w-full mx-auto flex">
        <h1 class="font-medium text-lg text-white">
          <router-link to="/">LearnThings</router-link>
        </h1>
      </div>
      <DebugButton class="mr-2" />
      <AccountButton />
    </nav>
    <div class="py-3 px-8 overflow-auto bg-slate-500 dark:bg-slate-800">
      <Breadcrumb
        :home="{
          icon: 'pi pi-home',
          route: '/',
        }"
        :model="breadcrumbs"
        :pt="{ root: 'bg-slate-500! dark:bg-slate-800! p-0!' }"
      >
        <template #item="{ item, props }">
          <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a :href="href" v-bind="props.action" @click="navigate">
              <span
                v-if="item.icon"
                :class="[item.icon, 'text-xs! text-white dark:text-gray-400']"
              />
              <span
                v-if="item.label"
                class="text-xs! font-semibold text-white dark:text-gray-400"
                >{{ item.label }}</span
              >
            </a>
          </router-link>
          <div v-else class="flex items-center gap-2">
            <span v-if="item.icon" :class="[item.icon, 'text-xs! text-white dark:text-gray-400']" />
            <span v-if="item.label" class="text-xs! font-semibold text-white dark:text-gray-400">{{
              item.label
            }}</span>
          </div>
        </template>
      </Breadcrumb>
    </div>
    <slot></slot>
  </main>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-rows: auto auto 1fr;
  grid-template-columns: 1fr;
}
</style>
