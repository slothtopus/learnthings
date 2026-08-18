import { useFormDialog } from './useFormDialog'
import ConfirmationDialog from '@/components/common/ConfirmationDialog.vue'
import type { ConfirmationDialogContext } from '@/components/common/ConfirmationDialog.vue'

export const useConfirmation = () => {
  const dialog = useFormDialog<any, ConfirmationDialogContext>(ConfirmationDialog)
  const showConfirmation = async (title: string, message: string) => {
    const result = await dialog.open(null, { title, message })
    return !result.cancelled
  }
  return { showConfirmation }
}
