import { ref } from 'vue'

import type { SelectOption } from '@/components/ui/ui.types'

export type SelectOptionWithDims = SelectOption & { dims: number[] }

export const useCardDimensions = () => {
  const DIMENSION_OPTIONS: SelectOptionWithDims[] = [
    {
      id: 'desktop',
      value: 'Desktop 1280x1024',
      dims: [1280, 1024]
    },
    {
      id: 'tablet',
      value: 'Tablet 1024x768',
      dims: [1024, 768]
    },
    {
      id: 'mobile-l',
      value: 'Mobile 360x800',
      dims: [360, 800]
    },
    {
      id: 'mobile-p',
      value: 'Mobile 800x360',
      dims: [800, 360]
    }
  ]
  const selectedDimensionOption = ref(DIMENSION_OPTIONS[0])
  return { DIMENSION_OPTIONS, selectedDimensionOption }
}
