<script setup lang="ts">
import type { PersistableObject } from 'core/object_manager/PersistableObject.js'
import AppIconButton from '@/components/used/AppIconButton.vue'

const props = defineProps<{ obj: PersistableObject<any> }>()

const boolFields = [
  { label: 'shouldDelete', get: () => props.obj.shouldDelete() },
  { label: 'shouldPersist', get: () => props.obj.shouldPersist() },
  { label: 'isOrphaned', get: () => props.obj.isOrphaned() },
  { label: 'isUnsaved', get: () => props.obj.isUnsaved() },
  { label: 'isEmbedded', get: () => props.obj.isEmbedded() },
  { label: 'hasChanged', get: () => props.obj.hasChanged() },
  { label: 'hasAttachment', get: () => props.obj.hasAttachment() },
]

const logFromDB = async () => {
  const dbObj = await props.obj.objectManager.getDB().get(props.obj.id)
  console.log(dbObj)
}

const debugObj = () => {
  const obj = props.obj
  debugger
}
</script>

<template>
  <div class="rounded-xs border border-white/8 bg-surface-container-high p-3 space-y-2">
    <!-- Header row -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-bold text-on-surface flex-1">
        {{ obj.doctype }}<span class="text-on-surface-variant/60">:</span>{{ obj.subtype }}
      </span>
      <AppIconButton icon="database" size="xs" @click="logFromDB" />
      <AppIconButton icon="bug_report" size="xs" @click="debugObj" />
    </div>

    <!-- IDs -->
    <div class="grid grid-cols-2 gap-x-4 text-[10px] font-mono">
      <span class="text-on-surface-variant/50">id: <span class="text-on-surface/70">{{ obj.id }}</span></span>
      <span class="text-on-surface-variant/50">root: <span class="text-on-surface/70">{{ obj.rootId }}</span></span>
    </div>

    <!-- Bool flags -->
    <div class="flex flex-wrap gap-x-4 gap-y-1">
      <span
        v-for="f in boolFields"
        :key="f.label"
        class="text-[10px] font-mono"
        :class="f.get() ? 'text-primary' : 'text-on-surface/20'"
      >
        {{ f.label }}
      </span>
    </div>
  </div>
</template>
