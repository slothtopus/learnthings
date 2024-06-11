<script setup lang="ts">
import { h, computed, ref } from 'vue'
import type { Ref } from 'vue'

import type { Note, NoteFieldContent } from '@/lib/Note'
import { NoteField } from '@/lib/NoteField'
import { NoteType } from '@/lib/NoteType'
import type { Deck } from '@/lib/Deck'

import ActionButton from '@/components/ui/ActionButton.vue'
import PaginationControl from '@/components/ui/PaginationControl.vue'
import { Input } from '@/components/shadcn-ui/input'

import type { ColumnDef, Cell, Updater, ColumnFiltersState } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useVueTable
} from '@tanstack/vue-table'

interface Props {
  notes: Note[]
  deck: Deck
}
const props = defineProps<Props>()

const valueUpdater = <T extends Updater<any>>(updaterOrValue: T, refToUpdate: Ref) => {
  refToUpdate.value =
    typeof updaterOrValue === 'function' ? updaterOrValue(refToUpdate.value) : updaterOrValue
}

type NotesData = {
  noteId: number
  searchField: string
  noteTypeId: number
  noteTypeName: string
  cards: number
}

const tableData = computed<NotesData[]>(() => {
  const rawData = props.notes.flatMap<{
    note: Note
    noteType: NoteType
    searchField: NoteField
    searchContent: NoteFieldContent
  }>((note) => {
    const noteType = props.deck.getNoteTypeById(note.noteTypeId)
    const searchField = noteType?.getSearchField()
    const searchContent = searchField?.getFieldContentFromNote(note)
    if (noteType === undefined || searchField === undefined || searchContent === undefined) {
      return []
    } else {
      return [{ note, noteType, searchField, searchContent }]
    }
  })
  return rawData.map((d) => ({
    noteId: d.note.id,
    searchField: d.searchContent.content,
    noteTypeId: d.noteType.id,
    noteTypeName: d.noteType.name,
    cards: d.noteType.cards.length
  }))
})

const columnFilters = ref<ColumnFiltersState>([])

const spanWrapper =
  (classNames?: string) =>
  ({ cell }: { cell: Cell<NotesData, string> }) =>
    h('span', { class: classNames }, [cell.getValue()])

const emit = defineEmits<{
  edit: [noteId: number]
  delete: [noteId: number]
}>()

const columns = computed(() => {
  const columns: ColumnDef<NotesData, string>[] = [
    {
      accessorKey: 'searchField',
      header: 'Search field',
      cell: spanWrapper()
    },
    { accessorKey: 'noteTypeName', header: 'Note type', cell: spanWrapper() },
    { accessorKey: 'cards', header: 'Cards', cell: spanWrapper('mx-auto') },
    {
      id: 'actions',
      cell: ({ row }) =>
        h(ActionButton, {
          actions: [
            { id: 'edit', value: 'Edit note' },
            { id: 'delete', value: 'Delete' }
          ],
          onSelect: (action: string) => {
            if (action == 'edit') emit('edit', row.original.noteId)
            if (action == 'delete') emit('delete', row.original.noteId)
          }
        })
    }
  ]
  return columns
})

const table = useVueTable({
  get data() {
    return tableData.value
  },
  get columns() {
    return columns.value
  },
  onColumnFiltersChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnFilters),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getCoreRowModel: getCoreRowModel(),
  state: {
    get columnFilters() {
      return columnFilters.value
    }
  }
})
</script>

<template>
  <div class="flex items-center py-4">
    <Input
      class="max-w-sm"
      placeholder="Filter notes..."
      :model-value="table.getColumn('searchField')?.getFilterValue() as string"
      @update:model-value="table.getColumn('searchField')?.setFilterValue($event)"
    />
  </div>
  <div class="relative grow overflow-hidden">
    <div class="absolute inset-0">
      <table class="text-sm">
        <thead class="bg-slate-500 border-slate-500 rounded-t-md text-white sticky top-0 z-10">
          <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="h-12 p-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 last:pr-8"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </th>
          </tr>
        </thead>
        <tbody class="border rounded-b-md border-t-none [&_tr:last-child]:border-0">
          <template v-if="table.getRowModel().rows?.length">
            <tr
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
              class="self-start border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              <td
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                :class="{ 'text-center': cell.column.id == 'cards' }"
                class="p-4 last:pr-8 [&:has([role=checkbox])]:pr-0"
              >
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
          </template>
          <template v-else>
            <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td
                class="p-4 last:pr-8 [&:has([role=checkbox])]:pr-0 justify-center"
                style="grid-column: 1/-1"
              >
                No results.
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
  <div class="mt-auto p-4 flex justify-end gap-3">
    <PaginationControl
      :totalItems="table.getPrePaginationRowModel().rows.length"
      :itemsPerPage="table.getState().pagination.pageSize"
      :page="table.getState().pagination.pageIndex + 1"
      @update:page="table.setPageIndex($event - 1)"
    />
  </div>
</template>

<style scoped>
table {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 2fr 1fr auto auto;
  grid-template-rows: auto 1fr;
}
thead,
tbody,
tr {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1/-1;
}

tbody {
  overflow: auto;
  grid-auto-rows: min-content;
}

th,
td {
  overflow: hidden;
  display: flex;
  align-items: center;
}

td > span {
  text-wrap: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.obscurer {
  position: absolute;
  top: 0;
  right: 0;
  width: 1rem;
  height: 3rem;
  opacity: 0.75;
  z-index: 999;
}
</style>
