import { computed, inject, ref } from 'vue'
import type { Component } from 'vue'

import { useDialog } from 'primevue'
import { cloneDeep, isEqual } from 'lodash-es'

export const useDynamicFormDialog = () => {
  const dialog = useDialog()

  const openDialog = <T>(
    formComponent: Component, header: string, initialVals?: T
  ): Promise<{ cancelled: true } | { cancelled: false; data: T }> => {
    return new Promise<{ cancelled: true } | { cancelled: false; data: T }>((resolve) => {
      const instance = dialog.open(formComponent, {
        props: {
          modal: true,
          header: header,
          pt: { root: 'w-full max-w-xs', title: 'mr-4 text-nowrap' },
        },
        data: initialVals,
        emits: {
          onCancel: () => {
            instance.close()
            resolve({ cancelled: true })
          },
          onUpdate: async (updatedVals: T) => {
            instance.close()
            resolve({ cancelled: false, data: updatedVals })
          },
        },
      })
    })
  }

  return {openDialog}
}

export const useFormDialog = <T>(formComponent: Component, header: string) => {
  const {openDialog: _openDialog} = useDynamicFormDialog()

  const openDialog = (
    initialVals?: T
  ) => {
    return _openDialog(formComponent, header, initialVals)
  }

  /*
  const openDialog = (
    initialVals?: T, headerOverride?: string
  ): Promise<{ cancelled: true } | { cancelled: false; data: T }> => {
    return new Promise<{ cancelled: true } | { cancelled: false; data: T }>((resolve) => {
      const instance = dialog.open(formComponent, {
        props: {
          modal: true,
          header: headerOverride ?? header,
          pt: { root: 'w-full max-w-xs', title: 'mr-4 text-nowrap' },
        },
        data: initialVals,
        emits: {
          onCancel: () => {
            instance.close()
            resolve({ cancelled: true })
          },
          onUpdate: async (updatedVals: T) => {
            instance.close()
            resolve({ cancelled: false, data: updatedVals })
          },
        },
      })
    })
  }*/

  return { openDialog }
}

export const useFormDialogData = <T>(defaultValues: T) => {
  const dialogRef = inject<{ value: { data: T } }>('dialogRef')
  console.log(dialogRef)

  if (dialogRef === undefined) {
    throw new Error('initialData not provided')
  }
  const initialData = dialogRef.value.data || defaultValues
  const formData = ref(cloneDeep(initialData))

  const hasChanged = computed(() => !isEqual(formData.value, initialData))

  return { formData, hasChanged }
}
