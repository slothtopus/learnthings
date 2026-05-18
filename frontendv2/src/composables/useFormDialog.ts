import { ref, reactive, computed, inject, markRaw } from 'vue'
import type { Component, InjectionKey, ComputedRef } from 'vue'
import { cloneDeep, isEqual } from 'lodash-es'

// ---- Types ----

export type DialogResult<T> = { cancelled: true } | { cancelled: false; data: T }

export interface DialogFormContext<TForm extends Record<string, unknown>, TContext> {
  formData: TForm
  contextData: TContext
  hasChanged: ComputedRef<boolean>
  submit: () => void
  cancel: () => void
}

export interface PendingDialog {
  component: Component
  initialFormData: Record<string, unknown>
  contextData: unknown
  resolve: (result: DialogResult<unknown>) => void
}

// ---- Module-level state (shared with DialogHost) ----

// One dialog open at a time.
export const _pendingDialog = ref<PendingDialog | null>(null)

// The live, mutable form data that form components bind to via v-model.
// Kept as a top-level reactive so property mutations remain reactive across the provide boundary.
export const _formData = reactive<Record<string, unknown>>({})

// ---- Injection key ----

export const DIALOG_FORM_KEY: InjectionKey<
  DialogFormContext<Record<string, unknown>, unknown>
> = Symbol('dialogForm')

// ---- useFormDialog — for views / components that open a dialog ----
//
// Usage:
//   const dialog = useFormDialog<CreateDeckForm, DeckContext>(CreateDeckForm, 'New Deck')
//   const result = await dialog.open({ name: '' }, { folders })
//   if (!result.cancelled) console.log(result.data.name)

export const useFormDialog = <
  TForm extends Record<string, unknown>,
  TContext = undefined,
>(
  component: Component,
) => {
  const open = (initialValues: TForm, contextData?: TContext): Promise<DialogResult<TForm>> =>
    new Promise((resolve) => {
      _pendingDialog.value = {
        component: markRaw(component),
        initialFormData: cloneDeep(initialValues),
        contextData,
        resolve: resolve as (result: DialogResult<unknown>) => void,
      }
    })

  return { open }
}

// ---- useDialogForm — for form components rendered inside the dialog ----
//
// Usage (inside a form component's setup):
//   const { formData, contextData, hasChanged, submit, cancel } =
//     useDialogForm<CreateDeckForm, DeckContext>()

export const useDialogForm = <
  TForm extends Record<string, unknown>,
  TContext = undefined,
>(): DialogFormContext<TForm, TContext> => {
  const ctx = inject(DIALOG_FORM_KEY)
  if (!ctx) throw new Error('useDialogForm must be called inside a DialogHost form component')
  return ctx as DialogFormContext<TForm, TContext>
}

// ---- Internal: called by DialogHost to populate & clear _formData ----

export const _loadFormData = (dialog: PendingDialog) => {
  Object.keys(_formData).forEach((k) => delete _formData[k])
  Object.assign(_formData, dialog.initialFormData)
}

export const _resolveDialog = (result: DialogResult<unknown>) => {
  _pendingDialog.value?.resolve(result)
  _pendingDialog.value = null
}

export const _makeHasChanged = () =>
  computed(() =>
    _pendingDialog.value ? !isEqual(_formData, _pendingDialog.value.initialFormData) : false,
  )
