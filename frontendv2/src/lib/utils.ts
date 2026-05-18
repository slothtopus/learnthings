import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isDev = () => {
  return import.meta.env['VITE_MODE'] == 'dev'
}

export const pause = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration))

export const downloadJson = (data: object, filename: string = 'data.json') => {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}

export const isInstanceOrThrow = <T>(val: unknown, cls: new (...args: any[]) => T): T => {
  if (!(val instanceof cls)) {
    throw new Error(`Object is not an instance of ${cls.name}`)
  }
  return val
}
