'use client'

import { useState, useEffect } from 'react'

export default function TrialBanner() {
  const [info, setInfo] = useState<{ diasRestantes: number; expirado: boolean; mostrarAviso: boolean; plan: string } | null>(null)

  useEffect(() => {
    fetch('/api/trial').then(r => r.json()).then(setInfo).catch(() => {})
  }, [])

  if (!info || info.plan !== 'trial' || (!info.mostrarAviso && !info.expirado)) return null

  if (info.expirado) {
    return (
      <div className="bg-red-100 px-4 py-2 text-center text-sm text-red-800 dark:bg-red-900 dark:text-red-200" role="alert">
        Tu período de prueba ha terminado. Elige un plan para no perder acceso a tus expedientes.
      </div>
    )
  }

  return (
    <div className="bg-yellow-100 px-4 py-2 text-center text-sm text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" role="alert">
      Tu prueba termina en {info.diasRestantes} día{info.diasRestantes !== 1 ? 's' : ''}.{' '}
      Elige tu plan para no perder acceso a tus expedientes.
    </div>
  )
}
