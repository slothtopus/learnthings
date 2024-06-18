<script setup lang="ts">
import { computed } from 'vue'

import BreadCrumbElem from './BreadCrumb.vue'
import { ChevronsRightIcon } from 'lucide-vue-next'

import type { BreadCrumb } from './breadcrumbs.types'

import { useRoute } from 'vue-router'
const route = useRoute()

const breadcrumbs = computed<BreadCrumb[]>(() =>
  route.matched.flatMap((r) =>
    r.meta?.breadcrumb !== undefined ? [r.meta.breadcrumb as BreadCrumb] : []
  )
)
</script>

<template>
  <div class="flex items-center px-3">
    <template v-for="(crumb, i) in breadcrumbs" :key="i">
      <BreadCrumbElem :crumb="crumb" :params="$route.params" />
      <ChevronsRightIcon class="last-of-type:hidden text-gray-400" />
    </template>
  </div>
</template>

<style scoped></style>
