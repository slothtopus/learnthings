import { h, ref, computed } from 'vue'
import type { Component } from 'vue'

const sheetComponent = ref<Component | undefined>()
const openSheet = computed({
  get: () => sheetComponent.value !== undefined,
  set: (val: boolean) => {
    if (!val) {
      sheetComponent.value = undefined
    }
  }
})

export const useSheet = () => {
  const closeSheet = () => {
    sheetComponent.value = undefined
  }

  const showSheet = <T>(component: Component) => {
    return new Promise<T>((resolve, reject) => {
      sheetComponent.value = h(component, {
        onResolve: (val: T) => {
          resolve(val)
          closeSheet()
        },
        onReject: reject
      })
    })
  }

  return { sheetComponent, openSheet, showSheet, closeSheet }
}
