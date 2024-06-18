<script setup lang="ts">
import { SettingsIcon, PlusIcon, ListIcon, PencilIcon, HomeIcon } from 'lucide-vue-next'
import DeckName from './DeckName.vue'
import NotetypeName from './NotetypeName.vue'
import CardTemplateName from './CardTemplateName.vue'
import NoteName from './NoteName.vue'

import type { BreadCrumb } from './breadcrumbs.types'

interface Props {
  params: any
  crumb: BreadCrumb
}
defineProps<Props>()
</script>

<template>
  <div
    class="flex items-center py-2 px-1 gap-1 hover:brightness-75 cursor-pointer"
    @click="$router.push({ name: crumb.name, params: params })"
  >
    <SettingsIcon v-if="crumb.icon == 'settings'" class="w-4" />
    <PlusIcon v-else-if="crumb.icon == 'add'" class="w-4" />
    <ListIcon v-else-if="crumb.icon == 'notes'" class="w-4" />
    <PencilIcon v-else-if="crumb.icon == 'edit'" class="w-4" />
    <HomeIcon v-else-if="crumb.icon == 'home'" class="w-4" />
    <DeckName v-if="crumb.resource == 'deck'" :deckId="Number(params.deckId)" />
    <NotetypeName
      v-else-if="crumb.resource == 'notetype'"
      :deckId="Number(params.deckId)"
      :noteTypeId="Number(params.noteTypeId)"
    />
    <CardTemplateName
      v-else-if="crumb.resource == 'template'"
      :deckId="Number(params.deckId)"
      :noteTypeId="Number(params.noteTypeId)"
      :cardTemplateId="Number(params.cardTemplateId)"
    />
    <NoteName v-else-if="crumb.resource == 'note'" :noteId="Number(params.noteId)" />
    <div v-else>
      {{ crumb.title }}
    </div>
  </div>
</template>

<style scoped></style>
