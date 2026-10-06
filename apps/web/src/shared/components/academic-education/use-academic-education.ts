'use client'

import { useEffect, useState } from 'react'
import {
  CURRENT_EGRESADO_ID,
  createAcademicEducation,
  deleteAcademicEducation,
  listAcademicEducation,
  listCarreras,
  updateAcademicEducation,
} from './service'
import type { AcademicEducation, AcademicEducationPayload, Carrera } from './types'

export function useAcademicEducation() {
  const [records, setRecords] = useState<AcademicEducation[]>([])
  const [error, setError] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isActive = true
    void listAcademicEducation(CURRENT_EGRESADO_ID)
      .then((items) => {
        if (isActive) setRecords(items)
      })
      .catch((reason: unknown) => {
        if (isActive) setError(reason)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })
    return () => {
      isActive = false
    }
  }, [])

  return {
    idEgresado: CURRENT_EGRESADO_ID,
    records,
    error,
    isLoading,
    async create(payload: AcademicEducationPayload) {
      const created = await createAcademicEducation(payload)
      setRecords(await listAcademicEducation(CURRENT_EGRESADO_ID))
      return created
    },
    async update(idFormacion: string, payload: AcademicEducationPayload) {
      const updated = await updateAcademicEducation(idFormacion, payload)
      setRecords(await listAcademicEducation(CURRENT_EGRESADO_ID))
      return updated
    },
    async remove(idFormacion: string) {
      await deleteAcademicEducation(idFormacion)
      setRecords(await listAcademicEducation(CURRENT_EGRESADO_ID))
    },
  }
}

export function useCarreras() {
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let isActive = true
    void listCarreras()
      .then((items) => {
        if (isActive) setCarreras(items)
      })
      .catch((reason: unknown) => {
        if (isActive) setError(reason)
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })
    return () => {
      isActive = false
    }
  }, [])

  return { carreras, isLoading, error }
}