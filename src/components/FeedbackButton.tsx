'use client'

import { useState } from 'react'

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState('')
  const [severidad, setSeveridad] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tipo || descripcion.length < 10) return
    setSending(true)
    try {
      await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          categoria: 'otro',
          titulo: tipo,
          descripcion,
          severidad: tipo === 'error' ? severidad : null,
          pantallaOrigen: window.location.pathname,
          navegadorDispositivo: navigator.userAgent,
        }),
      })
      setSent(true)
      setTimeout(() => { setOpen(false); setSent(false); setTipo(''); setDescripcion('') }, 2000)
    } catch { /* ignore */ }
    setSending(false)
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black print:hidden"
      aria-label="Enviar reporte o sugerencia"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 print:hidden" role="dialog" aria-modal="true">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Enviar reporte o sugerencia</h2>
          <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-800" aria-label="Cerrar">&times;</button>
        </div>

        {sent ? (
          <p className="rounded-md bg-green-50 p-4 text-sm text-green-800">Recibimos tu reporte. Te avisaremos por correo cuando haya novedades.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Tipo</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} required className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-800">
                <option value="">Selecciona...</option>
                <option value="error">Encontré un error</option>
                <option value="sugerencia">Tengo una sugerencia</option>
                <option value="queja">Quiero reportar una queja</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {tipo === 'error' && (
              <div>
                <label className="mb-1 block text-sm font-medium">Severidad</label>
                <select value={severidad} onChange={(e) => setSeveridad(e.target.value)} required className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-800">
                  <option value="">Selecciona...</option>
                  <option value="bloqueante">Me impide trabajar</option>
                  <option value="alta">Es molesto pero puedo seguir</option>
                  <option value="baja">Es un detalle menor</option>
                </select>
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Cuéntanos qué pasó o qué te gustaría que mejoráramos"
                required minLength={10}
                rows={4}
                className="w-full rounded-md border px-3 py-2 text-sm dark:bg-zinc-800"
              />
            </div>

            <button
              type="submit"
              disabled={sending || descripcion.length < 10 || !tipo}
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-black"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
