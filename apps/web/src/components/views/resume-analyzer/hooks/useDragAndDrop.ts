import { DragEvent, useCallback, useState } from 'react'

export const useDragAndDrop = (handleFileDrop: (file: File) => void) => {
  const [isDragging, setIsDragging] = useState(false)

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFileDrop(droppedFile)
      }
    },
    [handleFileDrop]
  )

  return { handler: { onDragOver, onDragLeave, onDrop }, isDragging }
}
