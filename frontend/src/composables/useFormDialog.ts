import { computed, inject, ref } from 'vue'
import type { Component } from 'vue'

import { useDialog } from 'primevue'
import { cloneDeep, isEqual} from 'lodash-es'

export const useDynamicFormDialog = () => {
  const dialog = useDialog()

  const openDialog = <T>(
    formComponent: Component,
    header: string,
    data: { formData?: T; otherData?: any },
    width?: 'xs' | 'sm' | 'md',
  ): Promise<{ cancelled: true } | { cancelled: false; data: T }> => {
    return new Promise<{ cancelled: true } | { cancelled: false; data: T }>((resolve) => {
      const instance = dialog.open(formComponent, {
        props: {
          modal: true,
          header: header,
          pt: { root: `w-full max-w-${width ?? 'xs'}`, title: 'mr-4 text-nowrap' },
        },
        data: data,
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

  return { openDialog }
}

export const useFormDialog = <T>(formComponent: Component, header: string) => {
  const { openDialog: _openDialog } = useDynamicFormDialog()

  const openDialog = (initialVals?: T) => {
    return _openDialog(formComponent, header, { formData: initialVals })
  }

  return { openDialog }
}

export const useFormDialogData = <T, P = undefined>(defaultValues: T) => {
  const dialogRef = inject<{ value: { data: { formData: T; otherData: P } } }>('dialogRef')
  console.log(dialogRef)

  if (dialogRef === undefined) {
    throw new Error('initialData not provided')
  }

  const initialFormData = dialogRef.value.data.formData || defaultValues
  /*const initialFormData = {
    ...defaultValues,
    ...omitBy(dialogRef.value.data.formData || {}, isUndefined),
  }*/
  const formData = ref(cloneDeep(initialFormData))
  const otherData = computed(() => dialogRef.value.data.otherData)

  const hasChanged = computed(() => !isEqual(formData.value, initialFormData))

  return { formData, otherData, hasChanged }
}
