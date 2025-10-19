<script setup lang="ts">
import { ref, computed } from 'vue'

import AppFrameScreenLayout from '@/layouts/AppFrameScreenLayout.vue'

import { Button, DataTable, Column, IconField, InputIcon, InputText } from 'primevue'
import { FilterMatchMode } from '@primevue/core/api'

import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useDeckDetails, useNoteTypeDetails } from '@/composables/useObjectDetails'
import {
  type NoteFieldContent,
  TextNoteFieldContent,
  AttachmentNoteFieldContent,
} from 'core/NoteField.js'

const { getDeck } = useRouteMetaObjects()
const deck = getDeck()
const { notes } = useDeckDetails(deck)

const fieldToString = (field: NoteFieldContent<any, any>) => {
  if (field instanceof TextNoteFieldContent) {
    return field.content
  } else if (field instanceof AttachmentNoteFieldContent) {
    return field.attachment?.filename ?? 'unknown'
  }
}

const tableData = computed(() => {
  console.time('tableData compute')
  const data = notes.value.flatMap((n) => {
    const { fields, cardTemplates } = useNoteTypeDetails(n.noteType)
    const keyField = fields.value[0]
    //if (keyField !== undefined) {
    return [
      {
        noteTypeName: n.noteType.name,
        keyField: keyField ? String(fieldToString(keyField.getContent(n))) : '',
        cards: cardTemplates.value.length,
        editRoute: {
          name: 'edit_note',
          params: { deckId: deck.id, noteTypeId: n.noteType.id, noteId: n.id },
        },
      },
    ]
    //}
    //return []
  })
  console.timeEnd('tableData compute')
  return data
})

const filters = ref({
  keyField: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const breadcrumbs = computed(() => {
  return [
    { icon: 'pi pi-book', label: deck.name },
    { label: 'Notes', route: `/notes/${deck.id}/all` },
  ]
})
</script>

<template>
  <AppFrameScreenLayout title="Browse notes" :breadcrumbs="breadcrumbs">
    <template #controls>
      <IconField class="ml-4">
        <InputIcon>
          <i class="pi pi-search" />
        </InputIcon>
        <InputText class="max-sm:w-48" v-model="filters['keyField'].value" placeholder="Search" />
      </IconField>
    </template>
    <template #content>
      <div
        class="h-full w-full overflow-hidden border border-gray-500! rounded-lg overscroll-none bg-(--p-datatable-row-background)"
      >
        <DataTable
          :value="tableData"
          v-model:filters="filters"
          scrollable
          scrollHeight="flex"
          paginator
          :paginatorTemplate="{
            '640px': 'PrevPageLink CurrentPageReport NextPageLink',
            default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
          }"
          :pt="{ tableContainer: 'overscroll-none' }"
          :rows="20"
          :rowsPerPageOptions="[5, 10, 20, 50]"
        >
          <Column
            field="noteTypeName"
            header="Note type"
            headerClass="text-nowrap dark:bg-zinc-800!"
            class="pl-8!"
          />
          <Column
            field="keyField"
            header="Key field"
            bodyStyle="width: 100%;"
            headerClass="dark:bg-zinc-800!"
          />
          <Column field="cards" header="Cards" headerClass="dark:bg-zinc-800!" />
          <Column
            field="editRoute"
            :exportable="false"
            class="pr-8!"
            headerClass="dark:bg-zinc-800!"
          >
            <template #body="{ data }: { data: any }">
              <Button
                icon="pi pi-pencil"
                rounded
                size="small"
                severity="secondary"
                @click="$router.push(data.editRoute)"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
  </AppFrameScreenLayout>
</template>

<style scoped></style>
