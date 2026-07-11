'use client'

import { useState, useEffect } from 'react'

type Reporte = {
  id: string
  tipo: string
  categoria: string
  titulo: string
  descripcion: string
  severidad: string | null
  estado: string
  pantallaOrigen: string | null
  respuestaAdmin: string | null
  fechaCreacion: string
  usuario: { nombre: string; email: string }
}

export default function AdminReportesPage() {
  const [reportes, setReportes] = useState<Reporte[]>([])
  const [loading, setLoading] = useState(true)
  const [respuestas, setRespuestas] = useState<Record<string, { estado: string; respuesta: string }>>({})

  useEffect(() => {
    fetch('/api/reportes').then(r => r.json()).then(d => { setReportes(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function actualizar(id: string) {
    const r = respuestas[id] || { estado: 'en_revision', respuesta: '' }
    await fetch(`/api/reportes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: r.estado, respuestaAdmin: r.respuesta }),
    })
    setReportes((prev) => prev.map((p) => p.id === id ? { ...p, estado: r.estado, respuestaAdmin: r.respuesta } : p))
  }

  const severidadColor: Record<string, string> = { bloqueante: 'bg-red-100 text-red-800', alta: 'bg-orange-100 text-orange-800', media: 'bg-yellow-100 text-yellow-800', baja: 'bg-blue-100 text-blue-800' }
  const estadoColor: Record<string, string> = { nuevo: 'bg-blue-100 text-blue-800', en_revision: 'bg-yellow-100 text-yellow-800', resuelto: 'bg-green-100 text-green-800', no_aplica: 'bg-zinc-100 text-zinc-500' }

  if (loading) return <div className="p-8 text-center">Cargando...</div>

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold">Panel de reportes</h1>

      <div className="mb-4 flex gap-4 text-sm">
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">Nuevos: {reportes.filter(r => r.estado === 'nuevo').length}</span>
        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-800">En revisión: {reportes.filter(r => r.estado === 'en_revision').length}</span>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-800">Resueltos: {reportes.filter(r => r.estado === 'resuelto').length}</span>
      </div>

      {reportes.length === 0 ? (
        <p className="text-zinc-400">No hay reportes aún.</p>
      ) : (
        <div className="space-y-4">
          {reportes.map((r) => (
            <div key={r.id} className="rounded-lg border p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${estadoColor[r.estado] || ''}`}>{r.estado.replace(/_/g, ' ')}</span>
                {r.severidad && <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${severidadColor[r.severidad] || ''}`}>{r.severidad}</span>}
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">{r.tipo}</span>
                <span className="text-xs text-zinc-400">{r.categoria}</span>
              </div>
              <p className="mb-1 font-medium">{r.titulo}</p>
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">{r.descripcion}</p>
              <p className="mb-3 text-xs text-zinc-400">
                {r.usuario.nombre} · {new Date(r.fechaCreacion).toLocaleString('es-PA')}
                {r.pantallaOrigen && ` · ${r.pantallaOrigen}`}
              </p>

              <div className="flex gap-2">
                <select
                  value={respuestas[r.id]?.estado || r.estado}
                  onChange={(e) => setRespuestas((prev) => ({ ...prev, [r.id]: { ...prev[r.id], estado: e.target.value } }))}
                  className="rounded-md border px-2 py-1 text-xs dark:bg-zinc-800"
                >
                  <option value="nuevo">Nuevo</option>
                  <option value="en_revision">En revisión</option>
                  <option value="en_progreso">En progreso</option>
                  <option value="resuelto">Resuelto</option>
                  <option value="no_aplica">No aplica</option>
                  <option value="duplicado">Duplicado</option>
                </select>
                <input
                  value={respuestas[r.id]?.respuesta || ''}
                  onChange={(e) => setRespuestas((prev) => ({ ...prev, [r.id]: { ...prev[r.id], respuesta: e.target.value } }))}
                  placeholder="Respuesta (opcional)"
                  className="flex-1 rounded-md border px-2 py-1 text-xs dark:bg-zinc-800"
                />
                <button onClick={() => actualizar(r.id)} className="rounded-md bg-zinc-900 px-3 py-1 text-xs text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-black">
                  Actualizar
                </button>
              </div>
              {r.respuestaAdmin && <p className="mt-2 text-xs text-zinc-500">Respuesta: {r.respuestaAdmin}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
