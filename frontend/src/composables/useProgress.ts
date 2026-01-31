import { watch, reactive } from 'vue'

import PersistProgress from '@/components/common/PersistProgress.vue'
import { useDialog } from 'primevue'
import { ProgressMonitor } from 'core/ObjectManager.js'
import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'

export const useProgress = (title: string) => {
  const dialog = useDialog()

  const progressMonitor = reactive(new ProgressMonitor())

  let instance: DynamicDialogInstance | undefined

  watch(
    () => progressMonitor.total,
    (newTotal, oldTotal) => {
      if(newTotal === undefined && instance !== undefined) {
        instance.close()
      } else if (oldTotal === undefined && newTotal !== undefined) {
        instance = dialog.open(PersistProgress, {
          props: {
            header: title,
            modal: true,
            closable: false,
            pt: { root: 'w-full max-w-xs', title: 'mr-4 text-nowrap' },
          },
          data: {
            progressMonitor,
          },
        })
      }
    },
  )

  watch(
    () => progressMonitor.completed,
    () => {
      if (
        progressMonitor.total !== undefined &&
        progressMonitor.completed === progressMonitor.total &&
        instance !== undefined
      ) {
        instance.close()
        instance = undefined
      }
    },
  )

  return { progressMonitor }
}
