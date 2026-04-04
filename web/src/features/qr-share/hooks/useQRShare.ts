import { useMemo, useState } from 'react'
import { createQrImage } from '../services/qrShareService'

export function useQRShare(value: string) {
  const [open, setOpen] = useState(false)
  const imageUrl = useMemo(() => createQrImage(value), [value])

  return {
    open,
    imageUrl,
    openModal: () => setOpen(true),
    closeModal: () => setOpen(false),
  }
}
