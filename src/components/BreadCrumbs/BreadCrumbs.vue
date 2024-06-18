<script setup lang="ts">
import { computed } from 'vue'

import SimpleCrumbElem from './SimpleCrumb.vue'
import { ChevronsRightIcon } from 'lucide-vue-next'

import { useRoute } from 'vue-router'
const route = useRoute()

export type SimpleCrumb = { resource: 'simple'; title: string; name: string }
const breadcrumbs = computed<SimpleCrumb[]>(() =>
  route.matched.flatMap((r) =>
    r.meta?.breadcrumb !== undefined ? [r.meta.breadcrumb as SimpleCrumb] : []
  )
)
</script>

<template>
  <div class="flex items-center px-3">
    <template v-for="(crumb, i) in breadcrumbs" :key="i">
      <SimpleCrumbElem :route="{ name: crumb.name, params: $route.params }">{{
        crumb.title
      }}</SimpleCrumbElem>
      <ChevronsRightIcon class="last-of-type:hidden text-gray-400" />
    </template>
  </div>
</template>

<style scoped></style>
