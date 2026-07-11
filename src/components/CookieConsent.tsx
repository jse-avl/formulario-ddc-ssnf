'use client'

import { useState, useEffect } from 'react'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cookies-accepted')
    if (!accepted) setVisible(true)
  }, [])

  function acceptAll() {
    localStorage.setItem('cookies-accepted', 'true')
    setVisible(false)
  }

  function acceptEssential() {
    localStorage.setItem('cookies-accepted', 'essential')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-4 shadow-lg dark:bg-zinc-900"
      role="dialog"
      aria-label="Aviso de cookies"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 sm:flex-row sm:items-center">
        <p className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
          Este sitio utiliza cookies estrictamente necesarias para su funcionamiento
          (autenticación, seguridad) y cookies de preferencias para recordar tu configuración.
          No usamos cookies de publicidad ni rastreo de terceros. Consulta nuestra{' '}
          <a href="/cookies" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
            política de cookies
          </a>{' '}
          para más detalle.
        </p>
        <div className="flex gap-2">
          <button
            onClick={acceptEssential}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Solo necesarias
          </button>
          <button
            onClick={acceptAll}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  )
}
