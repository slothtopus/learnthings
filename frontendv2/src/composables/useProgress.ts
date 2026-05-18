// TODO: This composable was ported from frontend and uses PrimeVue's useDialog/DynamicDialog
// to display a progress modal. It needs to be rewritten using AppDialog or a native Vue
// dialog approach consistent with this project.

import { reactive } from 'vue'
import { ProgressMonitor } from 'core/object_manager/utils.js'

export const useProgress = (_title: string) => {
  const progressMonitor = reactive(new ProgressMonitor())

  // TODO: wire up a dialog to display progress when progressMonitor.total > 20

  return { progressMonitor }
}
