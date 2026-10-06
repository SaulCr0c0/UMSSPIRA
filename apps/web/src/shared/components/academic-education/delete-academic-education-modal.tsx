'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import type { AcademicEducation } from './types'

export function DeleteAcademicEducationModal({
  record,
  onClose,
  onConfirm,
}: {
  record: AcademicEducation | null
  onClose: () => void
  onConfirm: (record: AcademicEducation) => Promise<void>
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (record && !dialog.open) dialog.showModal()
    if (!record && dialog.open) dialog.close()
  }, [record])

  const close = () => {
    if (isDeleting) return
    setError(null)
    onClose()
  }

  async function handleConfirm() {
    if (!record) return
    setIsDeleting(true)
    setError(null)
    try {
      await onConfirm(record)
      onClose()
    } catch {
      setError('No se pudo eliminar la formación. Inténtalo nuevamente.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delete-academic-education-title"
      aria-describedby="delete-academic-education-description"
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) close()
      }}
      className="fixed left-1/2 top-1/2 m-0 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e9e8ed] bg-white p-6 text-[#101c35] shadow-xl backdrop:bg-gray-950/40"
    >
      <button
        type="button"
        className="absolute right-4 top-4 rounded-md p-1 text-[#626978] transition-colors hover:bg-[#f1f0f4] hover:text-[#101c35] disabled:opacity-50"
        aria-label="Cerrar"
        onClick={close}
        disabled={isDeleting}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-700">
          <AlertTriangle className="size-6" aria-hidden="true" />
        </span>
        <h2 id="delete-academic-education-title" className="text-lg font-semibold">Eliminar formación académica</h2>
        <p id="delete-academic-education-description" className="text-sm leading-relaxed text-[#555b68]">
          ¿Estás seguro de que deseas eliminar la formación <span className="font-semibold text-[#101c35]">“{record?.titulo ?? ''}”</span> de tu perfil? Esta acción no se puede deshacer.
        </p>
        {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" className="h-10 rounded-lg border border-[#d9d8df] px-4 text-sm font-medium text-[#263958] hover:bg-[#f7f6f8] disabled:opacity-50" onClick={close} disabled={isDeleting}>
          Cancelar
        </button>
        <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50" onClick={handleConfirm} disabled={isDeleting}>
          {isDeleting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Eliminar
        </button>
      </div>
    </dialog>
  )
}