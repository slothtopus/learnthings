import { inject } from 'vue'

import { useDialog } from 'primevue/usedialog'
import ConfirmationForm from '@/components/forms/ConfirmationForm.vue'

export const useConfirmation = () => {
  const dialog = useDialog()

  const confirm = (title: string, message: string) =>
    new Promise<boolean>((resolve) => {
      dialog.open(ConfirmationForm, {
        props: {
          modal: true,
          header: title,
          pt: { root: 'w-full max-w-xs', title: 'mr-4' },
        },
        data: { message },
        onClose: (opt) => {
          const val = opt?.data
          resolve(!!val)
        },
      })
    })

  return { confirm }
}

export const useConfirmationData = () => {
  const dialogRef = inject<{
    value: { data: { message: string }; close: (val?: boolean) => void }
  }>('dialogRef')
  console.log(dialogRef)

  if (dialogRef === undefined) {
    throw new Error('confirmation data not provided')
  }
  const data = dialogRef.value.data

  const handleYes = () => dialogRef.value.close(true)
  const handleNo = () => dialogRef.value.close(false)

  return { data, handleYes, handleNo }
}
