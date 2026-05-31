<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'

import PageLayout from '@/components/used/PageLayout.vue'
import AppButton from '@/components/used/AppButton.vue'
import CreateButton from '@/components/used/CreateButton.vue'
import ViewToggle from '@/components/used/ViewToggle.vue'
import TagInput from '@/components/note-editor/TagInput.vue'
import TextFieldComponent from '@/components/note-editor/TextField.vue'
import ImageFieldComponent from '@/components/note-editor/ImageField.vue'
import AudioFieldComponent from '@/components/note-editor/AudioField.vue'
import TextToSpeechFieldComponent from '@/components/note-editor/TextToSpeechField.vue'
import AddFieldDialog from '@/components/note-editor/AddFieldDialog.vue'
import type { AddFieldFormData } from '@/components/note-editor/AddFieldDialog.vue'
import CreateCardDialog from '@/components/note-editor/CreateCardDialog.vue'
import type { CreateCardTemplateFormData } from '@/components/note-editor/CreateCardDialog.vue'
import CardTemplateCard from '@/components/note-editor/CardTemplateCard.vue'

import { useRouteMetaObjects } from '@/composables/useRouteObjects'
import { useFormDialog } from '@/composables/useFormDialog'
import { useConfirmation } from '@/composables/useConfirmationDialog'

import { TextField, ImageAttachmentField, AudioAttachmentField } from 'core/fields/fields.js'
import { TextToSpeechField } from 'core/fields/generated.js'
import type { AnyNoteField } from 'core/fields/base.js'
import type { CardTemplate } from 'core/CardTemplate.js'

const route = useRoute()
const router = useRouter()

const { getNoteType, getDeck, getNote } = useRouteMetaObjects()

const deck = getDeck()
const noteType = getNoteType()

const noteWrapper = reactive({
  note: route.params.noteId === 'new' ? noteType.createNewNote() : getNote(),
})

const cards = computed(() => noteWrapper.note.getAllCards())

const canSave = computed(
  () =>
    noteWrapper.note.shouldPersist() ||
    noteWrapper.note.getAllFieldContent(true).some((f) => f.shouldPersist() || f.shouldDelete()),
)

const isNewNote = computed(() => noteWrapper.note.isUnsaved())

const breadcrumbs = computed(() => [
  { label: 'Library', href: '/' },
  { label: `Deck: ${deck.name}`, href: `/deck/${deck.id}` },
  { label: `Browse Notes`, href: `/deck/${deck.id}/notes` },
  { label: isNewNote.value ? 'New Note' : 'Edit Note' },
])

const isTextField = (field: AnyNoteField): field is TextField => field instanceof TextField
const isImageField = (field: AnyNoteField): field is ImageAttachmentField => field instanceof ImageAttachmentField
const isAudioField = (field: AnyNoteField): field is AudioAttachmentField => field instanceof AudioAttachmentField
const isTtsField = (field: AnyNoteField): field is TextToSpeechField => field instanceof TextToSpeechField

const addFieldDialog = useFormDialog<AddFieldFormData>(AddFieldDialog)
const handleAddField = async () => {
  const result = await addFieldDialog.open({ name: '', slug: '', fieldType: 'text' })
  if (!result.cancelled) {
    const { name } = result.data
    switch (result.data.fieldType) {
      case 'text':          noteType.createNewField(name, TextField, {}); break
      case 'image':         noteType.createNewField(name, ImageAttachmentField, {}); break
      case 'audio':         noteType.createNewField(name, AudioAttachmentField, {}); break
      case 'text-to-audio': noteType.createNewField(name, TextToSpeechField, TextToSpeechField.defaultOptions); break
    }
    await deck.persist()
  }
}

const handleSaveNote = async () => {
  noteWrapper.note.flagShouldPersist(true)
  await noteWrapper.note.generateAll()
  await deck.persist()
  await router.replace({ params: { noteId: noteWrapper.note.id } })
}

const saveChangesGuard = async () => {
  if (canSave.value) {
    if (await showConfirmation('Are you sure?', 'Leaving this page will lose unsaved changes')) {
      noteWrapper.note.resetToLastPersisted()
    } else {
      return false
    }
  }

  if (isNewNote.value) {
    noteWrapper.note.delete()
  }
  await deck.persist()
  return true
}

const { showConfirmation } = useConfirmation()
onBeforeRouteLeave(saveChangesGuard)

const handleNewNote = async () => {
  if (await saveChangesGuard()) {
    noteWrapper.note = noteType.createNewNote()
    await router.replace({ params: { noteId: 'new' } })
  }
}

const handleDeleteNote = async () => {
  noteWrapper.note.delete()
  router.push({ name: 'deck-summary', params: { deckId: deck.id } })
}

const handleDeleteCardTemplate = async (cardTemplate: CardTemplate) => {
  const confirmed = await showConfirmation(
    `Delete "${cardTemplate.name}"?`,
    'This will permanently delete this card template and all cards it has generated across all notes.',
  )
  if (!confirmed) return
  cardTemplate.flagShouldDelete(true)
  await deck.persist()
}

const createCardDialog = useFormDialog<CreateCardTemplateFormData>(CreateCardDialog)
const handleCreateCard = async () => {
  const result = await createCardDialog.open({ name: '', description: '' })
  if (!result.cancelled) {
    const { name } = result.data
    noteType.createNewCardTemplate(name)
  }
  await deck.persist()
}

const viewMode = ref('field')
const viewOptions = [
  { value: 'field', label: 'Field View', icon: 'view_list' },
  { value: 'card', label: 'Card View', icon: 'grid_view' },
]

const tags = ref(['Physics', '2024'])
const tagOptions = [
  'Physics',
  'Chemistry',
  'Biology',
  'Mathematics',
  'History',
  'Literature',
  'Vocabulary',
  '2024',
  'Exam',
  'Review',
]
</script>

<template>
  <PageLayout :breadcrumbs="breadcrumbs">
    <template #title>
      {{ isNewNote ? 'New' : 'Edit' }}
      <span
        class="inline-flex items-center bg-primary/15 border border-primary/30 text-primary rounded-sm px-2 py-0.5 mr-0.5"
        >{{ noteType.name }}</span
      >
      Note
    </template>

    <div class="mt-6 pb-16">
      <!-- Controls: view toggle + save -->
      <div class="flex items-center justify-between mb-4">
        <ViewToggle v-model="viewMode" :options="viewOptions" size="md" />
        <div class="flex gap-4">
          <AppButton v-if="!isNewNote" size="md" @click="handleNewNote">New</AppButton>
          <AppButton size="md" :disabled="!canSave" @click="handleSaveNote">{{
            isNewNote ? 'Save' : 'Update'
          }}</AppButton>
          <AppButton v-if="!isNewNote" size="md" @click="handleDeleteNote">Delete</AppButton>
        </div>
      </div>

      <!-- Fields -->
      <div class="space-y-2">
        <TagInput
          v-model="tags"
          class="mb-8"
          :options="tagOptions"
          placeholder="Add tags..."
          size="md"
        />
        <template v-if="viewMode === 'field'">
          <template v-for="field in noteType.getAllFields()" :key="field.id">
            <TextFieldComponent v-if="isTextField(field)" :field="field" :note="noteWrapper.note" />
            <ImageFieldComponent v-else-if="isImageField(field)" :field="field" :note="noteWrapper.note" />
            <AudioFieldComponent v-else-if="isAudioField(field)" :field="field" :note="noteWrapper.note" />
            <TextToSpeechFieldComponent
              v-else-if="isTtsField(field)"
              :field="field"
              :note="noteWrapper.note"
              :note-type="noteType"
            />
          </template>
          <!-- Add new field -->
          <div class="mt-6">
            <CreateButton label="Add New Field" @click="handleAddField" />
          </div>
        </template>
        <template v-else>
          <CardTemplateCard
            v-for="card in cards"
            :key="card.id"
            :card-template="card.getCardTemplate()"
            :note="noteWrapper.note"
            @edit="
              $router.push({
                name: 'template-editor',
                params: {
                  deckId: deck.id,
                  noteTypeId: noteType.id,
                  cardTemplateId: card.getCardTemplate().id,
                },
              })
            "
            @delete="handleDeleteCardTemplate(card.getCardTemplate())"
          />
          <div class="mt-6">
            <CreateButton label="Create New Card" @click="handleCreateCard" />
          </div>
        </template>
      </div>
    </div>
  </PageLayout>
</template>
