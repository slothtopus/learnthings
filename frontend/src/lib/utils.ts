export const isDev = () => {
  return import.meta.env['VITE_MODE'] == 'dev'
}

export const pause = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration))

export const downloadJson = (data: object, filename: string = 'data.json') => {
  const json = JSON.stringify(data, null, 2) // pretty print with 2 spaces
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url) // clean up
}
