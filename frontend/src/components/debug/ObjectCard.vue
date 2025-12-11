<script setup lang="ts">
import { Button } from 'primevue'

import type { PersistableObject } from 'core/PersistableObject.js'

interface Props {
  obj: PersistableObject<any>
}
const props = defineProps<Props>()

type BoolField = { label: string; val: boolean }
const boolFields: BoolField[] = [
  { label: 'obj.shouldDelete()', val: props.obj.shouldDelete() },
  { label: 'obj.shouldPersist()', val: props.obj.shouldPersist() },
  { label: 'obj.isOrphaned()', val: props.obj.isOrphaned() },
  { label: 'obj.isUnsaved()', val: props.obj.isUnsaved() },
  { label: 'obj.isEmbedded()', val: props.obj.isEmbedded() },
  { label: 'obj.hasChanged()', val: props.obj.hasChanged() },
  { label: 'obj.hasAttachment()', val: props.obj.hasAttachment() },
]

const debugObj = () => {
  const obj = props.obj
  debugger
}

const logObjFromDB = async () => {
  const dbObj = await props.obj.objectManager.getDB().get(props.obj.id)
  console.log(dbObj)
}
</script>

<template>
  <section class="text-sm p-4 border-1 border-gray-600 overflow-auto" :key="obj.id">
    <div class="flex"><h3 class="text-base">{{ obj.doctype }}:{{ obj.subtype }}</h3>
    <Button class="ml-auto" icon="pi pi-database" variant="text" size="small" @click="logObjFromDB"/>
    <Button icon="pi pi-wrench" variant="text" size="small" @click="debugObj"/>
    </div>
    <div class="grid grid-cols-2">
      <span><span class="text-gray-400">id:</span> {{ obj.id }}</span>
      <span><span class="text-gray-400">rootId:</span> {{ obj.rootId }}</span>
    </div>
    <hr class="my-2" />
    <div class="grid grid-cols-4">
      <span
        v-for="{ label, val } in boolFields"
        :key="label"
        :class="val ? 'text-green-500' : 'text-red-500'"
        >{{ label }}: {{ val }}</span
      >
    </div>
  </section>
</template>

<style scoped></style>
